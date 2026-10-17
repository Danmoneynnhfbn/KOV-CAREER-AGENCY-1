"""Trusted FastAPI routes for the Supabase-backed KOV account foundation."""

from __future__ import annotations

import os
import re
import secrets
import hashlib
import hmac
import ipaddress
from datetime import date, datetime, timedelta, timezone
from pathlib import PurePath
from typing import Literal
from uuid import UUID

import httpx
import stripe
from fastapi import Header, HTTPException, Query, Request, Response, status
from fastapi.responses import JSONResponse
from pydantic import AnyHttpUrl, BaseModel, Field, field_validator
from postgrest.exceptions import APIError
from supabase import Client, create_client
from supabase_auth.errors import AuthApiError, AuthError
from storage3.utils import StorageException

BASE_URL = "https://kovcareeragency.org"
ACCESS_COOKIE = "kov_access_token"
REFRESH_COOKIE = "kov_refresh_token"
PUBLIC_CANDIDATE_FIELDS = (
    "id,public_id,professional_title,professional_summary,skills,years_experience,"
    "target_roles,target_seniority,target_industries,target_geography,location_region,"
    "vetting_status,badge_approved,directory_visible"
)
PRIVATE_CANDIDATE_FIELDS = (
    "candidate_id,legal_name,email,phone,expected_compensation,preferred_companies,"
    "career_objectives"
)
INTRODUCTION_FIELDS = (
    "id,candidate_id,employer_id,status,interview_at,placement_start_date,"
    "placement_fee_minor,currency,invoice_due_date,payment_status,internal_notes,"
    "created_by,created_at,updated_at"
)
STATUS_TRANSITIONS = {
    "Pending": {"Interviewing", "Rejected"},
    "Interviewing": {"Placed", "Rejected"},
    "Placed": set(),
    "Rejected": set(),
}
PUBLIC_EMAIL_DOMAINS = frozenset({
    "126.com", "163.com", "aol.com", "fastmail.com", "gmx.com", "gmx.de",
    "googlemail.com", "gmail.com", "hey.com", "hushmail.com", "icloud.com",
    "live.com", "mail.com", "mac.com", "me.com", "msn.com", "outlook.com",
    "pm.me", "proton.me", "protonmail.com", "qq.com", "rediffmail.com",
    "tutanota.com", "tutanota.de", "yahoo.ca", "yahoo.co.uk", "yahoo.com",
    "yahoo.com.au", "yahoo.de", "yahoo.fr", "yahoo.in", "yandex.com",
    "yandex.ru", "zoho.com",
})


def _configured(name: str) -> str | None:
    value = os.environ.get(name)
    return value.strip() if value and value.strip() else None


def _candidate_initials(legal_name: str | None) -> str:
    name_parts = legal_name.split() if legal_name else []
    if not name_parts:
        return ""
    initials = name_parts[0][0]
    if len(name_parts) > 1:
        initials += name_parts[-1][0]
    return initials.upper()


def _service_client() -> Client:
    url = _configured("SUPABASE_URL")
    key = _configured("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Account services are not configured.",
        )
    try:
        return create_client(url, key)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Account services are not configured correctly.",
        ) from exc


def _public_client() -> Client:
    url = _configured("SUPABASE_URL")
    key = _configured("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    try:
        return create_client(url, key)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured correctly.",
        ) from exc


def _cookie_secure() -> bool:
    configured = _configured("KOV_COOKIE_SECURE")
    if configured is not None:
        return configured.lower() in {"1", "true", "yes"}
    return bool(_configured("VERCEL"))


def _verify_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if not origin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A same-origin request is required.",
        )
    expected = request.headers.get("host", "").lower()
    origin_match = re.fullmatch(r"https?://([^/]+)", origin.strip(), re.I)
    if not origin_match or origin_match.group(1).lower() != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A same-origin request is required.",
        )


def _set_session_cookies(response: Response, session: object) -> None:
    access_token = getattr(session, "access_token", None)
    refresh_token = getattr(session, "refresh_token", None)
    expires_in = getattr(session, "expires_in", None)
    if not access_token or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The authentication provider returned an incomplete session.",
        )
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=max(60, int(expires_in or 3600)),
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=60 * 60 * 24 * 30,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        path="/",
    )


def _clear_session_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/", httponly=True, secure=_cookie_secure(), samesite="lax")
    response.delete_cookie(REFRESH_COOKIE, path="/", httponly=True, secure=_cookie_secure(), samesite="lax")


def _session_error_response(status_code: int, detail: str) -> JSONResponse:
    response = JSONResponse(status_code=status_code, content={"detail": detail})
    _clear_session_cookies(response)
    return response


def _provider_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="The account provider is temporarily unavailable.",
    )


def _stripe_api_key() -> str:
    api_key = _configured("STRIPE_SECRET_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment services are not configured.",
        )
    return api_key


def _require_stripe_billing_enabled() -> None:
    if (_configured("STRIPE_BILLING_ENABLED") or "").lower() != "true":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Online billing has not been enabled.",
        )


def _create_stripe_checkout_session(
    params: dict[str, object],
    idempotency_key: str,
) -> object:
    try:
        return stripe.checkout.Session.create(
            **params,
            api_key=_stripe_api_key(),
            idempotency_key=idempotency_key,
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider could not create a checkout session.",
        ) from exc


def _verify_stripe_price(price_id: str, plan: dict[str, object]) -> None:
    try:
        stripe_price = stripe.Price.retrieve(price_id, api_key=_stripe_api_key())
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The configured subscription price could not be verified.",
        ) from exc
    recurring = getattr(stripe_price, "recurring", None)
    if (
        not getattr(stripe_price, "active", False)
        or getattr(stripe_price, "unit_amount", None) != plan["amount_minor"]
        or getattr(stripe_price, "currency", "").upper() != str(plan["currency"]).upper()
        or getattr(recurring, "interval", None) != plan["interval_unit"]
        or plan["interval_unit"] not in {"month", "year"}
        or plan["amount_minor"] <= 0
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The configured subscription price does not match the approved plan.",
        )


def _existing_checkout_session(session_id: str) -> dict[str, str]:
    try:
        session = stripe.checkout.Session.retrieve(
            session_id,
            api_key=_stripe_api_key(),
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The existing payment session could not be verified.",
        ) from exc
    checkout_url = getattr(session, "url", None)
    if getattr(session, "status", None) != "open" or not checkout_url:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The existing checkout is no longer open. Wait for its payment event or use a new attempt.",
        )
    return {"checkout_url": checkout_url, "session_id": session_id}


class EmployerRegistration(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=12, max_length=128)
    company_name: str = Field(min_length=2, max_length=200)
    website: AnyHttpUrl | None = Field(default=None, max_length=300)
    description: str | None = Field(default=None, max_length=3000)
    target_roles: list[str] = Field(default_factory=list, max_length=30)
    target_seniority: str | None = Field(default=None, max_length=80)
    target_geography: list[str] = Field(default_factory=list, max_length=30)
    target_industries: list[str] = Field(default_factory=list, max_length=30)
    privacy_consent: bool

    @field_validator("company_name")
    @classmethod
    def validate_company_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Enter a company name with at least two characters.")
        return cleaned

    @field_validator(
        "target_roles",
        "target_geography",
        "target_industries",
    )
    @classmethod
    def validate_string_lists(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(not value or len(value) > 120 for value in cleaned):
            raise ValueError("List items must contain between 1 and 120 characters.")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("List items must be unique.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email_shape(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address.")
        if normalized.rsplit("@", 1)[1] in PUBLIC_EMAIL_DOMAINS:
            raise ValueError("Use a corporate email address; free/public email domains are not accepted.")
        return normalized


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class PasswordResetRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ContactLead(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    audience: Literal[
        "Senior Professional",
        "Company / Hiring Team",
        "Executive Search Firm",
        "Other",
    ]
    phone: str | None = Field(default=None, max_length=40)
    target_role: str = Field(min_length=2, max_length=200)
    salary_range: str | None = Field(default=None, max_length=160)
    linkedin_url: AnyHttpUrl | None = None
    message: str | None = Field(default=None, max_length=5000)
    company_name: str | None = Field(default=None, max_length=200)
    location_market: str | None = Field(default=None, max_length=160)
    target_seniority: str | None = Field(default=None, max_length=120)
    timeline: str | None = Field(default=None, max_length=160)

    @field_validator("first_name", "last_name", "target_role")
    @classmethod
    def validate_contact_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be blank.")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_contact_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized

    @field_validator(
        "phone",
        "salary_range",
        "message",
        "company_name",
        "location_market",
        "target_seniority",
        "timeline",
    )
    @classmethod
    def normalize_optional_contact_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class PasswordUpdate(BaseModel):
    password: str = Field(min_length=12, max_length=128)


class SubscriptionCheckoutRequest(BaseModel):
    plan_key: Literal["employer-monthly"]


class ProviderSessionRequest(BaseModel):
    access_token: str = Field(min_length=1, max_length=8192)
    refresh_token: str = Field(min_length=1, max_length=8192)


class IntroductionCreate(BaseModel):
    candidate_id: UUID
    employer_id: UUID
    status: Literal["Pending"] = "Pending"
    internal_notes: str | None = Field(default=None, max_length=5000)


class IntroductionUpdate(BaseModel):
    status: Literal["Pending", "Interviewing", "Placed", "Rejected"]
    interview_at: datetime | None = None
    placement_start_date: date | None = None
    placement_fee_minor: int | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    payment_status: Literal["not_due", "pending", "paid", "past_due", "void", "failed"] | None = None
    internal_notes: str | None = Field(default=None, max_length=5000)


class VerificationUpdate(BaseModel):
    status: Literal["in_review", "verified", "rejected", "suspended"]
    reviewer_notes: str | None = Field(default=None, max_length=5000)


class CandidateReviewUpdate(BaseModel):
    vetting_status: Literal["in_review", "approved", "rejected"]
    badge_approved: bool = False
    directory_visible: bool = False
    screening_notes: str | None = Field(default=None, max_length=5000)


class Identity(BaseModel):
    user_id: str
    email: str | None
    role: str


def _user_from_response(response: object) -> object | None:
    return getattr(response, "user", None)


def _user_id(user: object) -> str:
    value = getattr(user, "id", None)
    if not value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )
    return str(value)


def _require_identity(
    request: Request,
    authorization: str | None = None,
) -> Identity:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    client = _public_client()
    try:
        user_response = client.auth.get_user(token)
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session could not be verified.",
        ) from exc
    except httpx.RequestError as exc:
        raise _provider_error() from exc

    user = _user_from_response(user_response)
    user_id = _user_id(user) if user else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication is required.")
    service = _service_client()
    try:
        result = (
            service.table("app_users")
            .select("role")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except (APIError, httpx.RequestError) as exc:
        raise _provider_error() from exc
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not provisioned for KOV services.",
        )
    return Identity(
        user_id=user_id,
        email=getattr(user, "email", None),
        role=result.data["role"],
    )


def _require_role(request: Request, role: str, authorization: str | None) -> Identity:
    identity = _require_identity(request, authorization)
    if identity.role != role:
        raise HTTPException(status_code=403, detail="This action is not permitted.")
    return identity


def _require_admin(request: Request, authorization: str | None) -> Identity:
    try:
        identity = _require_identity(request, authorization)
    except HTTPException as exc:
        if exc.status_code in {401, 403}:
            raise HTTPException(status_code=404, detail="Not Found") from exc
        raise
    admin_user_id = _configured("ADMIN_USER_ID")
    if (
        identity.role != "administrator"
        or not admin_user_id
        or not secrets.compare_digest(identity.user_id, admin_user_id)
    ):
        raise HTTPException(status_code=404, detail="Not Found")
    return identity


def _provision_employer(
    service: Client,
    user_id: str,
    data: EmployerRegistration,
) -> dict:
    try:
        result = service.rpc(
            "provision_employer_account",
            {
                "p_user_id": user_id,
                "p_company_name": data.company_name.strip(),
                "p_corporate_email": data.email,
                "p_website": str(data.website) if data.website is not None else None,
                "p_description": data.description,
                "p_target_roles": data.target_roles,
                "p_target_seniority": data.target_seniority,
                "p_target_geography": data.target_geography,
                "p_target_industries": data.target_industries,
                "p_privacy_acknowledged": data.privacy_consent,
            },
        ).execute()
        employer = (result.data or [None])[0]
        if employer is None:
            raise HTTPException(
                status_code=502,
                detail="Company account details could not be saved.",
            )
    except (APIError, httpx.RequestError) as exc:
        raise _provider_error() from exc
    return {"id": employer["employer_id"], "public_id": employer["public_id"]}


def _remove_unprovisioned_auth_user(service: Client, user_id: str) -> None:
    try:
        service.auth.admin.delete_user(user_id)
    except (AuthError, httpx.RequestError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Account setup failed and automatic account cleanup was unsuccessful. "
                "Contact support before retrying registration."
            ),
        ) from exc


def _authorize_employer_directory(identity: Identity, service: Client) -> None:
    try:
        membership_result = (
            service.table("employer_memberships")
            .select("employer_id")
            .eq("user_id", identity.user_id)
            .limit(1)
            .execute()
        )
        memberships = membership_result.data or []
        if not memberships:
            raise HTTPException(status_code=403, detail="An employer account is required.")

        employer_id = memberships[0]["employer_id"]
        employer = (
            service.table("employers")
            .select("id,verification_status")
            .eq("id", employer_id)
            .maybe_single()
            .execute()
        ).data
        if not employer or employer["verification_status"] != "verified":
            raise HTTPException(
                status_code=403,
                detail="Company verification is required before directory access.",
            )
        now = datetime.now(timezone.utc).isoformat()
        subscription = (
            service.table("subscriptions")
            .select("id")
            .eq("employer_id", employer_id)
            .eq("plan_key", "employer-monthly")
            .eq("status", "active")
            .lte("current_period_start", now)
            .gt("current_period_end", now)
            .limit(1)
            .execute()
        ).data
    except HTTPException:
        raise
    except (APIError, httpx.RequestError) as exc:
        raise _provider_error() from exc
    if not subscription:
        raise HTTPException(
            status_code=403,
            detail="An active employer subscription is required for directory access.",
        )


def _contact_requester_hash(request: Request) -> str:
    service_role_key = _configured("SUPABASE_SERVICE_ROLE_KEY")
    if not service_role_key:
        raise HTTPException(
            status_code=503,
            detail="Contact services are not configured.",
        )
    forwarded_for = request.headers.get("x-forwarded-for")
    raw_ip = (
        request.headers.get("x-real-ip")
        or (forwarded_for.split(",", 1)[0].strip() if forwarded_for else None)
        or (request.client.host if request.client else None)
    )
    try:
        client_ip = ipaddress.ip_address(raw_ip or "")
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="The request address could not be determined.",
        ) from exc
    return hmac.new(
        service_role_key.encode("utf-8"),
        client_ip.compressed.encode("ascii"),
        hashlib.sha256,
    ).hexdigest()


def mount_backend_routes(app) -> None:
    @app.get("/api/v1/backend/health")
    def backend_health() -> dict[str, object]:
        auth_configured = bool(
            _configured("SUPABASE_URL") and _configured("SUPABASE_ANON_KEY")
        )
        database_configured = bool(
            _configured("SUPABASE_URL") and _configured("SUPABASE_SERVICE_ROLE_KEY")
        )
        return {
            "status": "configured" if auth_configured and database_configured else "unconfigured",
            "auth_configured": auth_configured,
            "database_configured": database_configured,
        }

    @app.post("/api/contact", status_code=201)
    def submit_contact_lead(data: ContactLead, request: Request) -> dict[str, str]:
        requester_hash = _contact_requester_hash(request)
        service = _service_client()
        try:
            result = service.rpc(
                "submit_contact_lead",
                {
                    "p_name": f"{data.first_name} {data.last_name}",
                    "p_email": data.email,
                    "p_audience": data.audience,
                    "p_phone": data.phone,
                    "p_target_role": data.target_role,
                    "p_salary_range": data.salary_range,
                    "p_linkedin_url": str(data.linkedin_url) if data.linkedin_url else None,
                    "p_message": data.message,
                    "p_company_name": data.company_name,
                    "p_location_market": data.location_market,
                    "p_target_seniority": data.target_seniority,
                    "p_timeline": data.timeline,
                    "p_requester_hash": requester_hash,
                },
            ).execute().data
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        if not isinstance(result, dict) or not isinstance(result.get("accepted"), bool):
            raise HTTPException(
                status_code=502,
                detail="The contact request could not be confirmed.",
            )
        if not result["accepted"]:
            raise HTTPException(
                status_code=429,
                detail="Too many inquiries from this network. Please try again later.",
            )
        return {"status": "received"}

    @app.post("/api/v1/billing/subscription/checkout")
    def create_subscription_checkout(
        data: SubscriptionCheckoutRequest,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, str]:
        _verify_origin(request)
        _require_stripe_billing_enabled()
        identity = _require_identity(request, authorization)
        if identity.role != "employer":
            raise HTTPException(status_code=403, detail="An employer account is required.")
        service = _service_client()
        try:
            price_id = _configured("STRIPE_EMPLOYER_MONTHLY_PRICE_ID")
            owner_field = "employer_id"
            expected_audience = "employer"
            memberships = (
                service.table("employer_memberships")
                .select("employer_id")
                .eq("user_id", identity.user_id)
                .limit(1)
                .execute()
            ).data
            owner = {"id": memberships[0]["employer_id"]} if memberships else None

            if not owner:
                raise HTTPException(status_code=403, detail="A matching account is required.")
            existing = (
                service.table("subscriptions")
                .select("id,status,provider_checkout_session_id")
                .eq(owner_field, owner["id"])
                .eq("plan_key", data.plan_key)
                .in_("status", ["pending", "active", "past_due"])
                .limit(1)
                .execute()
            ).data
            plan = (
                service.table("subscription_plans")
                .select("audience,amount_minor,currency,interval_unit,active")
                .eq("plan_key", data.plan_key)
                .single()
                .execute()
            ).data
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc

        if existing and existing[0].get("provider_checkout_session_id"):
            return _existing_checkout_session(existing[0]["provider_checkout_session_id"])
        if existing and existing[0]["status"] != "pending":
            raise HTTPException(
                status_code=409,
                detail="An active or past-due subscription already exists for this plan.",
            )
        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The selected subscription plan is not configured for checkout.",
            )
        if (
            not plan
            or plan["audience"] != expected_audience
            or not plan["active"]
        ):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The selected subscription plan is not available for checkout.",
            )
        _verify_stripe_price(price_id, plan)

        try:
            reserved = service.rpc(
                "reserve_stripe_subscription_checkout",
                {
                    "p_plan_key": data.plan_key,
                    "p_candidate_id": owner["id"] if owner_field == "candidate_id" else None,
                    "p_employer_id": owner["id"] if owner_field == "employer_id" else None,
                },
            ).execute().data
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        reservation = (reserved or [None])[0]
        if not reservation:
            raise HTTPException(status_code=503, detail="A checkout reservation could not be created.")
        if reservation["status"] != "pending":
            raise HTTPException(
                status_code=409,
                detail="An active or past-due subscription already exists for this plan.",
            )
        if reservation.get("provider_checkout_session_id"):
            return _existing_checkout_session(reservation["provider_checkout_session_id"])

        session = _create_stripe_checkout_session(
            {
                "mode": "subscription",
                "line_items": [{"price": price_id, "quantity": 1}],
                "customer_email": identity.email,
                "success_url": f"{BASE_URL}/account.html?billing=success&session_id={{CHECKOUT_SESSION_ID}}",
                "cancel_url": f"{BASE_URL}/account.html?billing=cancelled",
                "metadata": {
                    "plan_key": data.plan_key,
                    "candidate_id": owner["id"] if owner_field == "candidate_id" else "",
                    "employer_id": owner["id"] if owner_field == "employer_id" else "",
                },
                "subscription_data": {
                    "metadata": {
                        "plan_key": data.plan_key,
                        "candidate_id": owner["id"] if owner_field == "candidate_id" else "",
                        "employer_id": owner["id"] if owner_field == "employer_id" else "",
                    }
                },
            },
            f"kov-subscription-{reservation['id']}",
        )
        checkout_url = getattr(session, "url", None)
        session_id = getattr(session, "id", None)
        if not checkout_url or not session_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The payment provider returned an incomplete checkout session.",
            )
        try:
            saved = (
                service.table("subscriptions")
                .update({"provider_checkout_session_id": session_id})
                .eq("id", reservation["id"])
                .eq("status", "pending")
                .is_("provider_checkout_session_id", "null")
                .select("id")
                .maybe_single()
                .execute()
            ).data
            if not saved:
                latest = (
                    service.table("subscriptions")
                    .select("status,provider_checkout_session_id")
                    .eq("id", reservation["id"])
                    .single()
                    .execute()
                ).data
                if latest.get("provider_checkout_session_id") != session_id:
                    raise HTTPException(
                        status_code=409,
                        detail="The subscription checkout changed while the session was being saved.",
                    )
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"checkout_url": checkout_url, "session_id": session_id}

    @app.get("/api/v1/billing/subscriptions")
    def list_account_subscriptions(
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        identity = _require_identity(request, authorization)
        if identity.role not in {"candidate", "employer"}:
            raise HTTPException(status_code=403, detail="A candidate or employer account is required.")
        service = _service_client()
        owner_field = "candidate_id" if identity.role == "candidate" else "employer_id"
        try:
            if identity.role == "candidate":
                owner = (
                    service.table("candidate_profiles")
                    .select("id")
                    .eq("user_id", identity.user_id)
                    .maybe_single()
                    .execute()
                ).data
                owner_id = owner["id"] if owner else None
            else:
                memberships = (
                    service.table("employer_memberships")
                    .select("employer_id")
                    .eq("user_id", identity.user_id)
                    .limit(20)
                    .execute()
                ).data or []
                owner_ids = [membership["employer_id"] for membership in memberships]
                if not owner_ids:
                    raise HTTPException(status_code=403, detail="An employer account is required.")
                subscriptions = (
                    service.table("subscriptions")
                    .select("id,plan_key,status,current_period_end,created_at")
                    .in_(owner_field, owner_ids)
                    .order("created_at", desc=True)
                    .limit(20)
                    .execute()
                ).data or []
                return {"items": subscriptions, "limit": 20}
            if not owner_id:
                raise HTTPException(status_code=403, detail="A matching account is required.")
            subscriptions = (
                service.table("subscriptions")
                .select("id,plan_key,status,current_period_end,created_at")
                .eq(owner_field, owner_id)
                .order("created_at", desc=True)
                .limit(20)
                .execute()
            ).data or []
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"items": subscriptions, "limit": 20}

    @app.get("/api/v1/employer/invoices")
    def list_employer_invoices(
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        identity = _require_role(request, "employer", authorization)
        service = _service_client()
        try:
            memberships = (
                service.table("employer_memberships")
                .select("employer_id")
                .eq("user_id", identity.user_id)
                .limit(20)
                .execute()
            ).data or []
            employer_ids = [membership["employer_id"] for membership in memberships]
            if not employer_ids:
                raise HTTPException(status_code=403, detail="An employer account is required.")
            introductions = (
                service.table("introductions")
                .select("id")
                .in_("employer_id", employer_ids)
                .order("created_at", desc=True)
                .limit(500)
                .execute()
            ).data or []
            introduction_ids = [item["id"] for item in introductions]
            if not introduction_ids:
                return {"items": [], "limit": 100}
            invoices = (
                service.table("invoices")
                .select("id,introduction_id,invoice_reference,amount_minor,currency,status,due_date,paid_at")
                .in_("introduction_id", introduction_ids)
                .in_("status", ["issued", "past_due", "paid"])
                .order("created_at", desc=True)
                .limit(100)
                .execute()
            ).data or []
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"items": invoices, "limit": 100}

    @app.post("/api/v1/employer/invoices/{invoice_id}/checkout")
    def create_invoice_checkout(
        invoice_id: UUID,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, str]:
        _verify_origin(request)
        _require_stripe_billing_enabled()
        identity = _require_role(request, "employer", authorization)

        service = _service_client()
        try:
            invoice = (
                service.table("invoices")
                .select("id,introduction_id,invoice_reference,amount_minor,currency,status,stripe_checkout_session_id")
                .eq("id", str(invoice_id))
                .single()
                .execute()
            ).data
            introduction = (
                service.table("introductions")
                .select("employer_id")
                .eq("id", invoice["introduction_id"])
                .single()
                .execute()
            ).data
            membership = (
                service.table("employer_memberships")
                .select("employer_id")
                .eq("user_id", identity.user_id)
                .eq("employer_id", introduction["employer_id"])
                .limit(1)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        if not membership:
            raise HTTPException(status_code=403, detail="This invoice is not available to your company.")
        if invoice["status"] not in {"issued", "past_due"}:
            raise HTTPException(status_code=409, detail="Only issued or past-due invoices can be paid online.")
        if invoice["amount_minor"] <= 0:
            raise HTTPException(status_code=409, detail="This invoice cannot be paid through online checkout.")
        if invoice["stripe_checkout_session_id"]:
            return _existing_checkout_session(invoice["stripe_checkout_session_id"])

        try:
            reservation_rows = service.rpc(
                "reserve_stripe_invoice_checkout",
                {"p_invoice_id": str(invoice_id)},
            ).execute().data or []
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        reservation = reservation_rows[0] if isinstance(reservation_rows, list) and reservation_rows else None
        if not reservation:
            raise HTTPException(
                status_code=409,
                detail="This invoice changed while checkout was being prepared. Reload and try again.",
            )
        if reservation.get("stripe_checkout_session_id"):
            return _existing_checkout_session(reservation["stripe_checkout_session_id"])
        idempotency_key = reservation.get("stripe_checkout_idempotency_key")
        if not idempotency_key:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The invoice checkout could not be reserved safely.",
            )

        session = _create_stripe_checkout_session(
            {
                "mode": "payment",
                "line_items": [
                    {
                        "price_data": {
                            "currency": invoice["currency"].lower(),
                            "product_data": {"name": f"KOV placement invoice {invoice['invoice_reference']}"},
                            "unit_amount": invoice["amount_minor"],
                        },
                        "quantity": 1,
                    }
                ],
                "success_url": f"{BASE_URL}/account.html?invoice=paid&session_id={{CHECKOUT_SESSION_ID}}",
                "cancel_url": f"{BASE_URL}/account.html?invoice=payment-cancelled",
                "metadata": {
                    "invoice_id": str(invoice_id),
                    "checkout_reservation": idempotency_key,
                },
                "payment_intent_data": {"metadata": {"invoice_id": str(invoice_id)}},
            },
            idempotency_key,
        )
        checkout_url = getattr(session, "url", None)
        session_id = getattr(session, "id", None)
        if not checkout_url or not session_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The payment provider returned an incomplete checkout session.",
            )
        try:
            saved = (
                service.table("invoices")
                .update({"stripe_checkout_session_id": session_id})
                .eq("id", str(invoice_id))
                .eq("stripe_checkout_idempotency_key", idempotency_key)
                .in_("status", ["issued", "past_due"])
                .is_("stripe_checkout_session_id", "null")
                .select("id")
                .maybe_single()
                .execute()
            ).data
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        if not saved:
            try:
                current = (
                    service.table("invoices")
                    .select("stripe_checkout_session_id")
                    .eq("id", str(invoice_id))
                    .single()
                    .execute()
                ).data
            except (APIError, httpx.RequestError) as exc:
                raise _provider_error() from exc
            if current and current.get("stripe_checkout_session_id"):
                return _existing_checkout_session(current["stripe_checkout_session_id"])
            raise HTTPException(
                status_code=409,
                detail="The invoice changed while checkout was being created. Retry the request.",
            )
        return {"checkout_url": checkout_url, "session_id": session_id}

    @app.post("/api/v1/admin/invoices/{invoice_id}/issue")
    def admin_issue_invoice(
        invoice_id: UUID,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        service = _service_client()
        try:
            issued_result = service.rpc(
                "issue_placement_invoice",
                {"p_invoice_id": str(invoice_id), "p_actor_id": identity.user_id},
            ).execute()
            issued = (issued_result.data or [None])[0]
            if not issued:
                raise HTTPException(status_code=409, detail="Only draft invoices can be issued.")
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return issued

    @app.post("/api/v1/billing/stripe/webhook")
    async def stripe_webhook(request: Request) -> dict[str, bool]:
        webhook_secret = _configured("STRIPE_WEBHOOK_SECRET")
        signature = request.headers.get("stripe-signature")
        if not webhook_secret:
            raise HTTPException(status_code=503, detail="Payment webhook is not configured.")
        if not signature:
            raise HTTPException(status_code=400, detail="The payment event signature is missing.")
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > 1_048_576:
            raise HTTPException(status_code=413, detail="The payment event is too large.")
        body_chunks: list[bytes] = []
        body_size = 0
        async for chunk in request.stream():
            body_size += len(chunk)
            if body_size > 1_048_576:
                raise HTTPException(status_code=413, detail="The payment event is too large.")
            body_chunks.append(chunk)
        try:
            event = stripe.Webhook.construct_event(
                b"".join(body_chunks),
                signature,
                webhook_secret,
            )
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            raise HTTPException(status_code=400, detail="The payment event signature is invalid.") from exc
        event_id = getattr(event, "id", None)
        event_type = getattr(event, "type", None)
        serializer = getattr(event, "to_dict", None)
        payload = serializer(for_json=True) if callable(serializer) else None
        if not event_id or not event_type or not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="The payment event payload is invalid.")
        service = _service_client()
        try:
            service.rpc(
                "process_stripe_webhook_event",
                {
                    "p_event_id": event_id,
                    "p_event_type": event_type,
                    "p_payload": payload,
                },
            ).execute()
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"received": True}

    @app.post("/api/v1/auth/register/employer", status_code=201)
    def register_employer(
        data: EmployerRegistration,
        request: Request,
        response: Response,
    ) -> dict[str, str]:
        _verify_origin(request)
        if not data.privacy_consent:
            raise HTTPException(status_code=422, detail="Privacy acknowledgement is required.")
        auth = _public_client()
        service = _service_client()
        try:
            result = auth.auth.sign_up(
                {
                    "email": data.email,
                    "password": data.password,
                    "options": {"email_redirect_to": f"{BASE_URL}/account.html"},
                }
            )
        except AuthApiError as exc:
            raise HTTPException(
                status_code=400,
                detail="Registration could not be completed with these details.",
            ) from exc
        except (AuthError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        user = _user_from_response(result)
        user_id = _user_id(user) if user else None
        if not user_id:
            raise HTTPException(
                status_code=502,
                detail="The authentication provider did not confirm account creation.",
            )
        try:
            employer = _provision_employer(service, user_id, data)
        except HTTPException:
            _remove_unprovisioned_auth_user(service, user_id)
            raise
        session = getattr(result, "session", None)
        if session:
            _set_session_cookies(response, session)
        return {
            "status": "created",
            "message": "Your company registration is pending independent verification.",
            "employer_public_id": employer["public_id"],
        }

    @app.post("/api/v1/auth/login")
    def login(data: LoginRequest, request: Request, response: Response) -> dict[str, str]:
        _verify_origin(request)
        auth = _public_client()
        try:
            result = auth.auth.sign_in_with_password(
                {"email": data.email, "password": data.password}
            )
        except AuthApiError as exc:
            raise HTTPException(status_code=401, detail="Email or password is incorrect.") from exc
        except (AuthError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        session = getattr(result, "session", None)
        if not session:
            raise HTTPException(status_code=401, detail="Email verification is required.")
        user_id = _user_id(_user_from_response(result))
        try:
            (
                _service_client()
                .table("candidate_profiles")
                .update({"last_activity_at": datetime.now(timezone.utc).isoformat()})
                .eq("user_id", user_id)
                .execute()
            )
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        _set_session_cookies(response, session)
        return {"status": "authenticated"}

    @app.post("/api/v1/auth/refresh", response_model=None)
    def refresh_session(request: Request, response: Response) -> dict[str, str] | JSONResponse:
        _verify_origin(request)
        refresh_token = request.cookies.get(REFRESH_COOKIE)
        if not refresh_token:
            return _session_error_response(401, "A refreshable session is required.")
        try:
            auth = _public_client()
            result = auth.auth.refresh_session(refresh_token)
        except HTTPException as exc:
            return _session_error_response(exc.status_code, str(exc.detail))
        except AuthError:
            return _session_error_response(401, "Your session has expired.")
        except httpx.RequestError as exc:
            raise _provider_error() from exc
        session = getattr(result, "session", None)
        if not session:
            return _session_error_response(401, "Your session has expired.")
        _set_session_cookies(response, session)
        return {"status": "refreshed"}

    @app.post("/api/v1/auth/logout", response_model=None)
    def logout(request: Request, response: Response) -> dict[str, str] | JSONResponse:
        _verify_origin(request)
        access_token = request.cookies.get(ACCESS_COOKIE)
        refresh_token = request.cookies.get(REFRESH_COOKIE)
        _clear_session_cookies(response)
        if access_token and refresh_token:
            try:
                auth = _public_client()
                auth.auth.set_session(access_token, refresh_token)
                auth.auth.sign_out()
            except HTTPException as exc:
                return _session_error_response(exc.status_code, str(exc.detail))
            except AuthError as exc:
                return _session_error_response(
                    502,
                    "The provider could not revoke the session; local cookies were cleared.",
                )
            except httpx.RequestError as exc:
                return _session_error_response(
                    503,
                    "The authentication provider is unavailable; local cookies were cleared.",
                )
        return {"status": "signed_out"}

    @app.post("/api/v1/auth/password-reset")
    def password_reset(data: PasswordResetRequest, request: Request) -> dict[str, str]:
        _verify_origin(request)
        auth = _public_client()
        try:
            auth.auth.reset_password_email(
                data.email,
                {"redirect_to": f"{BASE_URL}/account.html?recovery=1"},
            )
        except (AuthError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"status": "accepted", "message": "If the account exists, recovery instructions will be sent."}

    @app.post("/api/v1/auth/session")
    def exchange_provider_session(
        data: ProviderSessionRequest,
        request: Request,
        response: Response,
    ) -> dict[str, str]:
        _verify_origin(request)
        auth = _public_client()
        try:
            user_response = auth.auth.get_user(data.access_token)
            user = _user_from_response(user_response)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="The confirmation link is invalid or expired. Request a new one.",
                )
            result = auth.auth.refresh_session(data.refresh_token)
        except AuthApiError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The confirmation link is invalid or expired. Request a new one.",
            ) from exc
        except AuthError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The confirmation link is invalid or expired. Request a new one.",
            ) from exc
        except httpx.RequestError as exc:
            raise _provider_error() from exc
        session = getattr(result, "session", None)
        refreshed_user = _user_from_response(result)
        if (
            not session
            or not refreshed_user
            or _user_id(user) != _user_id(refreshed_user)
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The confirmation link is invalid or expired. Request a new one.",
            )
        _set_session_cookies(response, session)
        return {"status": "authenticated"}

    @app.post("/api/v1/auth/password")
    def update_password(
        data: PasswordUpdate,
        request: Request,
        response: Response,
    ) -> dict[str, str]:
        _verify_origin(request)
        _require_identity(request)
        access_token = request.cookies.get(ACCESS_COOKIE)
        refresh_token = request.cookies.get(REFRESH_COOKIE)
        if not access_token or not refresh_token:
            raise HTTPException(status_code=401, detail="A signed-in session is required.")
        auth = _public_client()
        try:
            result = auth.auth.set_session(access_token, refresh_token)
            session = getattr(result, "session", None)
            if not session:
                raise HTTPException(status_code=401, detail="Your session has expired.")
            auth.auth.update_user({"password": data.password})
        except HTTPException:
            raise
        except AuthApiError as exc:
            raise HTTPException(status_code=400, detail="The password could not be updated.") from exc
        except AuthError as exc:
            raise _provider_error() from exc
        except httpx.RequestError as exc:
            raise _provider_error() from exc
        _set_session_cookies(response, session)
        return {"status": "updated", "message": "Your password has been updated."}

    @app.get("/api/v1/auth/me")
    def current_account(
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, str | None]:
        identity = _require_identity(request, authorization)
        return {
            "user_id": identity.user_id,
            "email": identity.email,
            "role": identity.role,
        }

    @app.get("/api/v1/candidate/profile")
    def candidate_profile(
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        identity = _require_role(request, "candidate", authorization)
        service = _service_client()
        try:
            profile = (
                service.table("candidate_profiles")
                .select(PUBLIC_CANDIDATE_FIELDS)
                .eq("user_id", identity.user_id)
                .maybe_single()
                .execute()
            ).data
            if not profile:
                raise HTTPException(status_code=404, detail="Candidate profile not found.")
            private = (
                service.table("candidate_private")
                .select(PRIVATE_CANDIDATE_FIELDS)
                .eq("candidate_id", profile["id"])
                .maybe_single()
                .execute()
            ).data
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"profile": profile, "private": private}

    @app.get("/api/v1/profiles")
    def employer_candidate_directory(
        request: Request,
        authorization: str | None = Header(default=None),
        limit: int = Query(default=20, ge=1, le=50),
        offset: int = Query(default=0, ge=0, le=100000),
        q: str | None = Query(default=None, max_length=120),
        region: str | None = Query(default=None, max_length=120),
    ) -> dict[str, object]:
        identity = _require_role(request, "employer", authorization)
        service = _service_client()
        _authorize_employer_directory(identity, service)
        try:
            query = (
                service.table("candidate_profiles")
                .select(
                    "id,public_id,skills,years_experience,location_region,"
                    "target_geography,vetting_status,badge_approved"
                )
                .eq("vetting_status", "approved")
                .eq("badge_approved", True)
                .eq("directory_visible", True)
            )
            if q:
                safe_q = q.strip().replace("%", "").replace(",", " ")[:120]
                if safe_q:
                    query = query.contains("skills", [safe_q])
            if region:
                query = query.contains("target_geography", [region.strip()])
            profiles = (
                query.order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            ).data or []
            candidate_ids = [profile["id"] for profile in profiles]
            private_by_candidate = {}
            if candidate_ids:
                private_rows = (
                    service.table("candidate_private")
                    .select("candidate_id,legal_name")
                    .in_("candidate_id", candidate_ids)
                    .execute()
                ).data or []
                private_by_candidate = {
                    row["candidate_id"]: row.get("legal_name")
                    for row in private_rows
                }
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        items = [
            {
                "public_id": profile["public_id"],
                "initials": _candidate_initials(
                    private_by_candidate.get(profile["id"])
                ),
                "skills": profile.get("skills") or [],
                "years_experience": profile.get("years_experience"),
                "region": profile.get("location_region"),
            }
            for profile in profiles
        ]
        return {"items": items, "limit": limit, "offset": offset}

    @app.get("/api/v1/admin/candidates")
    def admin_candidates(
        request: Request,
        authorization: str | None = Header(default=None),
        limit: int = Query(default=25, ge=1, le=100),
        offset: int = Query(default=0, ge=0, le=100000),
    ) -> dict[str, object]:
        _require_admin(request, authorization)
        service = _service_client()
        try:
            result = (
                service.table("candidate_profiles")
                .select(PUBLIC_CANDIDATE_FIELDS)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"items": result.data or [], "limit": limit, "offset": offset}

    @app.patch("/api/v1/admin/candidates/{candidate_id}/review")
    def admin_review_candidate(
        candidate_id: UUID,
        data: CandidateReviewUpdate,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        if data.directory_visible and data.vetting_status != "approved":
            raise HTTPException(
                status_code=422,
                detail="Only approved candidates can be made visible in the directory.",
            )
        if data.badge_approved and data.vetting_status != "approved":
            raise HTTPException(
                status_code=422,
                detail="A badge requires approved vetting.",
            )
        service = _service_client()
        try:
            profile = (
                service.table("candidate_profiles")
                .update(
                    {
                        "vetting_status": data.vetting_status,
                        "badge_approved": data.badge_approved,
                        "directory_visible": data.directory_visible,
                    }
                )
                .eq("id", str(candidate_id))
                .select(PUBLIC_CANDIDATE_FIELDS)
                .single()
                .execute()
            ).data
            if "screening_notes" in data.model_fields_set:
                service.table("candidate_private").update(
                    {"screening_notes": data.screening_notes}
                ).eq("candidate_id", str(candidate_id)).execute()
            service.table("audit_events").insert(
                {
                    "actor_user_id": identity.user_id,
                    "action": "candidate_review_updated",
                    "entity_type": "candidate",
                    "entity_id": str(candidate_id),
                    "metadata": {
                        "vetting_status": data.vetting_status,
                        "badge_approved": data.badge_approved,
                        "directory_visible": data.directory_visible,
                    },
                }
            ).execute()
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return profile

    @app.get("/api/v1/admin/employers")
    def admin_employers(
        request: Request,
        authorization: str | None = Header(default=None),
        limit: int = Query(default=25, ge=1, le=100),
        offset: int = Query(default=0, ge=0, le=100000),
    ) -> dict[str, object]:
        _require_admin(request, authorization)
        service = _service_client()
        try:
            result = (
                service.table("employers")
                .select(
                    "id,public_id,company_name,corporate_email,website,description,"
                    "verification_status,verified_at,verification_notes,subscription_status,"
                    "created_at,updated_at"
                )
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"items": result.data or [], "limit": limit, "offset": offset}

    @app.patch("/api/v1/admin/employers/{employer_id}/verification")
    def admin_update_verification(
        employer_id: UUID,
        data: VerificationUpdate,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        service = _service_client()
        reviewed_at = datetime.now(timezone.utc).isoformat()
        verified_at = reviewed_at if data.status == "verified" else None
        try:
            employer = (
                service.table("employers")
                .update(
                    {
                        "verification_status": data.status,
                        "verified_at": verified_at,
                        "verification_notes": data.reviewer_notes,
                    }
                )
                .eq("id", str(employer_id))
                .select("id,public_id,verification_status,verified_at")
                .single()
                .execute()
            ).data
            service.table("company_verification_records").insert(
                {
                    "employer_id": str(employer_id),
                    "status": data.status,
                    "reviewer_user_id": identity.user_id,
                    "reviewer_notes": data.reviewer_notes,
                    "reviewed_at": reviewed_at,
                }
            ).execute()
            service.table("audit_events").insert(
                {
                    "actor_user_id": identity.user_id,
                    "action": "employer_verification_updated",
                    "entity_type": "employer",
                    "entity_id": str(employer_id),
                    "metadata": {"status": data.status},
                }
            ).execute()
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return employer

    @app.get("/api/v1/admin/introductions")
    def admin_introductions(
        request: Request,
        authorization: str | None = Header(default=None),
        limit: int = Query(default=25, ge=1, le=100),
        offset: int = Query(default=0, ge=0, le=100000),
    ) -> dict[str, object]:
        _require_admin(request, authorization)
        service = _service_client()
        try:
            result = (
                service.table("introductions")
                .select(INTRODUCTION_FIELDS)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"items": result.data or [], "limit": limit, "offset": offset}

    @app.post("/api/v1/admin/introductions", status_code=201)
    def admin_create_introduction(
        data: IntroductionCreate,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        service = _service_client()
        payload = data.model_dump(mode="json")
        payload["candidate_id"] = str(data.candidate_id)
        payload["employer_id"] = str(data.employer_id)
        payload["created_by"] = identity.user_id
        try:
            result = (
                service.table("introductions")
                .insert(payload)
                .select(INTRODUCTION_FIELDS)
                .single()
                .execute()
            )
            service.table("audit_events").insert(
                {
                    "actor_user_id": identity.user_id,
                    "action": "introduction_created",
                    "entity_type": "introduction",
                    "entity_id": result.data["id"],
                    "metadata": {"status": "Pending"},
                }
            ).execute()
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return result.data

    @app.patch("/api/v1/admin/introductions/{introduction_id}")
    def admin_update_introduction(
        introduction_id: UUID,
        data: IntroductionUpdate,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        service = _service_client()
        try:
            current = (
                service.table("introductions")
                .select(INTRODUCTION_FIELDS)
                .eq("id", str(introduction_id))
                .single()
                .execute()
            ).data
            new_status = data.status
            if (
                new_status != current["status"]
                and new_status not in STATUS_TRANSITIONS[current["status"]]
            ):
                raise HTTPException(
                    status_code=409,
                    detail="That introduction status transition is not permitted.",
                )
            if new_status == "Placed" and (
                data.placement_start_date is None
                or data.placement_fee_minor is None
            ):
                raise HTTPException(
                    status_code=422,
                    detail="A placement date and agreed fee are required to confirm placement.",
                )
            if new_status != "Placed":
                data_values = data.model_dump(exclude_unset=True, mode="json")
                data_values.pop("placement_start_date", None)
                data_values.pop("placement_fee_minor", None)
                data_values.pop("payment_status", None)
            else:
                data_values = data.model_dump(exclude_unset=True, mode="json")
                data_values["invoice_due_date"] = (
                    data.placement_start_date + timedelta(days=30)
                ).isoformat()
            data_values["updated_at"] = datetime.now(timezone.utc).isoformat()
            update_result = (
                service.table("introductions")
                .update(data_values)
                .eq("id", str(introduction_id))
                .eq("status", current["status"])
                .select(INTRODUCTION_FIELDS)
                .maybe_single()
                .execute()
            )
            updated = update_result.data
            if not updated:
                raise HTTPException(
                    status_code=409,
                    detail="The introduction changed during this update. Refresh and try again.",
                )
            service.table("audit_events").insert(
                {
                    "actor_user_id": identity.user_id,
                    "action": "introduction_updated",
                    "entity_type": "introduction",
                    "entity_id": str(introduction_id),
                    "metadata": {"from_status": current["status"], "to_status": new_status},
                }
            ).execute()
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return updated

    @app.post("/api/v1/admin/introductions/{introduction_id}/invoice", status_code=201)
    def admin_create_placement_invoice(
        introduction_id: UUID,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, object]:
        _verify_origin(request)
        identity = _require_admin(request, authorization)
        service = _service_client()
        try:
            result = service.rpc(
                "draft_placement_invoice",
                {
                    "p_introduction_id": str(introduction_id),
                    "p_actor_id": identity.user_id,
                    "p_invoice_reference": f"KOV-{UUID(int=secrets.randbits(128)).hex[:12].upper()}",
                },
            ).execute()
            invoice = (result.data or [None])[0]
            if not invoice:
                raise HTTPException(
                    status_code=409,
                    detail="An invoice can be created only for a confirmed placement with agreed terms.",
                )
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return invoice

    @app.get("/api/v1/admin/analytics/placement-success-rate")
    def admin_placement_success_rate(
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, str | int | float | None]:
        _require_admin(request, authorization)
        service = _service_client()
        try:
            placed = (
                service.table("introductions")
                .select("id", count="exact", head=True)
                .eq("status", "Placed")
                .execute()
                .count
            )
            rejected = (
                service.table("introductions")
                .select("id", count="exact", head=True)
                .eq("status", "Rejected")
                .execute()
                .count
            )
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        placed_count = int(placed or 0)
        rejected_count = int(rejected or 0)
        eligible = placed_count + rejected_count
        return {
            "metric": "placement_success_rate",
            "placed": placed_count,
            "rejected": rejected_count,
            "eligible": eligible,
            "rate_percent": round(placed_count / eligible * 100, 1) if eligible else None,
        }

    @app.post("/api/v1/candidate/cv")
    async def upload_candidate_cv(request: Request) -> dict[str, str]:
        _verify_origin(request)
        identity = _require_role(request, "candidate", request.headers.get("authorization"))
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="CV files must be 10 MB or smaller.")
        if request.headers.get("content-type", "").split(";", 1)[0].strip().lower() != "application/pdf":
            raise HTTPException(status_code=415, detail="Upload a PDF document.")
        maximum_size = 10 * 1024 * 1024
        chunks: list[bytes] = []
        size = 0
        async for chunk in request.stream():
            size += len(chunk)
            if size > maximum_size:
                raise HTTPException(status_code=413, detail="CV files must be 10 MB or smaller.")
            chunks.append(chunk)
        file_bytes = b"".join(chunks)
        if not file_bytes:
            raise HTTPException(status_code=413, detail="CV files must be between 1 byte and 10 MB.")
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=415, detail="The uploaded file is not a valid PDF document.")
        filename = request.headers.get("x-filename", "resume.pdf")
        filename = PurePath(filename.replace("\\", "/")).name
        if len(filename) > 180 or not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=422, detail="The file name must end with .pdf.")

        service = _service_client()
        try:
            profile = (
                service.table("candidate_profiles")
                .select("id")
                .eq("user_id", identity.user_id)
                .single()
                .execute()
            ).data
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        bucket = _configured("SUPABASE_CV_BUCKET")
        if not bucket:
            raise HTTPException(
                status_code=503,
                detail="Private CV storage is not configured.",
            )
        storage_path = f"{identity.user_id}/{UUID(int=secrets.randbits(128)).hex}.pdf"
        try:
            record = (
                service.table("cv_files")
                .insert(
                    {
                        "candidate_id": profile["id"],
                        "storage_path": storage_path,
                        "original_filename": filename,
                        "media_type": "application/pdf",
                        "byte_size": len(file_bytes),
                    }
                )
                .select("id,uploaded_at,expires_at")
                .single()
                .execute()
            ).data
            service.storage.from_(bucket).upload(
                storage_path,
                file_bytes,
                {"content-type": "application/pdf", "upsert": "false"},
            )
        except (APIError, StorageException, httpx.RequestError) as exc:
            try:
                service.storage.from_(bucket).remove([storage_path])
            except (APIError, StorageException, httpx.RequestError) as cleanup_error:
                try:
                    service.table("cv_files").update(
                        {
                            "cleanup_attempts": 1,
                            "last_cleanup_error": "upload_recovery_failed",
                        }
                    ).eq("storage_path", storage_path).execute()
                except (APIError, httpx.RequestError) as metadata_error:
                    raise _provider_error() from metadata_error
                raise _provider_error() from cleanup_error
            try:
                service.table("cv_files").update(
                    {
                        "deleted_at": datetime.now(timezone.utc).isoformat(),
                        "last_cleanup_error": None,
                    }
                ).eq("storage_path", storage_path).execute()
            except (APIError, httpx.RequestError) as cleanup_error:
                raise _provider_error() from cleanup_error
            raise _provider_error() from exc
        return {
            "status": "uploaded",
            "cv_id": record["id"],
            "uploaded_at": record["uploaded_at"],
            "expires_at": record["expires_at"],
        }

    @app.post("/api/v1/candidate/cv/{cv_id}/signed-url")
    def candidate_cv_signed_url(
        cv_id: UUID,
        request: Request,
        authorization: str | None = Header(default=None),
    ) -> dict[str, str]:
        _verify_origin(request)
        identity = _require_identity(request, authorization)
        service = _service_client()
        try:
            query = (
                service.table("cv_files")
                .select("id,candidate_id,storage_path,deleted_at")
                .eq("id", str(cv_id))
                .is_("deleted_at", "null")
            )
            if identity.role == "candidate":
                candidate = (
                    service.table("candidate_profiles")
                    .select("id")
                    .eq("user_id", identity.user_id)
                    .single()
                    .execute()
                ).data
                query = query.eq("candidate_id", candidate["id"])
            elif identity.role != "administrator":
                raise HTTPException(status_code=403, detail="This action is not permitted.")
            file_record = query.single().execute().data
        except HTTPException:
            raise
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        bucket = _configured("SUPABASE_CV_BUCKET")
        if not bucket:
            raise HTTPException(status_code=503, detail="Private CV storage is not configured.")
        try:
            signed = service.storage.from_(bucket).create_signed_url(
                file_record["storage_path"], 300
            )
            service.table("cv_files").update(
                {
                    "last_activity_at": datetime.now(timezone.utc).isoformat(),
                    "expires_at": (
                        datetime.now(timezone.utc) + timedelta(days=30)
                    ).isoformat(),
                }
            ).eq("id", str(cv_id)).execute()
        except (APIError, StorageException, httpx.RequestError) as exc:
            raise _provider_error() from exc
        signed_url = getattr(signed, "signed_url", None)
        if not signed_url:
            raise HTTPException(status_code=502, detail="A temporary file link could not be created.")
        return {"url": signed_url, "expires_in": "300"}

    @app.post("/api/v1/maintenance/cleanup-expired-cvs")
    def cleanup_expired_cvs(
        authorization: str | None = Header(default=None),
    ) -> dict[str, int | str]:
        expected_secret = _configured("CRON_SECRET")
        provided_secret = (
            authorization[7:].strip()
            if authorization and authorization.lower().startswith("bearer ")
            else None
        )
        if not expected_secret or not provided_secret or not secrets.compare_digest(
            expected_secret, provided_secret
        ):
            raise HTTPException(status_code=401, detail="Maintenance authorization is required.")
        bucket = _configured("SUPABASE_CV_BUCKET")
        if not bucket:
            raise HTTPException(status_code=503, detail="Private CV storage is not configured.")
        service = _service_client()
        now = datetime.now(timezone.utc).isoformat()
        activity_cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        try:
            # Activity means a successful login, candidate profile update, or introduction status change.
            inactive_cvs = (
                service.table("cv_files")
                .select("id,storage_path,cleanup_attempts,candidate_profiles!inner(last_activity_at)")
                .is_("deleted_at", "null")
                .eq("legal_hold", False)
                .lte("candidate_profiles.last_activity_at", activity_cutoff)
                .limit(100)
                .execute()
            ).data or []
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc

        deleted = 0
        failed = 0
        for file_record in inactive_cvs:
            attempts = file_record.get("cleanup_attempts") or 0
            try:
                service.storage.from_(bucket).remove([file_record["storage_path"]])
                service.table("cv_files").update(
                    {
                        "deleted_at": now,
                        "last_cleanup_error": None,
                        "cleanup_attempts": attempts,
                    }
                ).eq("id", file_record["id"]).execute()
                deleted += 1
            except (StorageException, APIError, httpx.RequestError):
                try:
                    service.table("cv_files").update(
                        {
                            "cleanup_attempts": attempts + 1,
                            "last_cleanup_error": "storage_or_metadata_cleanup_failed",
                        }
                    ).eq("id", file_record["id"]).execute()
                except (APIError, httpx.RequestError) as exc:
                    raise _provider_error() from exc
                failed += 1

        try:
            service.table("background_job_runs").insert(
                {
                    "job_name": "inactive-cv-cleanup",
                    "status": "failed" if failed else "succeeded",
                    "processed_count": deleted,
                    "failure_count": failed,
                    "safe_error_summary": "Some cleanup operations failed." if failed else None,
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()
        except (APIError, httpx.RequestError) as exc:
            raise _provider_error() from exc
        return {"status": "completed", "deleted": deleted, "failed": failed}
