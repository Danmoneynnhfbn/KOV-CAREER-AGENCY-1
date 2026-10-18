import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

import backend_api
import server


def _query(data: object) -> Mock:
    query = Mock()
    for method in (
        "select", "eq", "in_", "limit", "single", "maybe_single", "is_",
        "update", "order", "range", "contains", "ilike", "lte",
    ):
        getattr(query, method).return_value = query
    query.execute.return_value = SimpleNamespace(data=data)
    return query


class BackendApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(server.app)

    def test_public_pages_and_existing_status_route(self) -> None:
        for path in (
            "/",
            "/account.html",
            "/privacy.html",
            "/faq/",
            "/faq/index.html",
            "/profiles",
            "/assets/account-api.js",
            "/assets/contact-form.js",
            "/assets/backend-pages.css",
            "/assets/kov-backend-journey.svg",
            "/api/v1/status",
        ):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 200)
        self.assertEqual(self.client.get("/toba").status_code, 404)
        self.assertEqual(self.client.get("/blogpostcheck").status_code, 404)
        self.assertEqual(self.client.get("/blogpostcheck.html").status_code, 404)
        self.assertEqual(self.client.get("/.private_admin/blogpostcheck.html").status_code, 404)

    def test_admin_console_and_api_require_the_configured_admin_identity(self) -> None:
        identities = (
            ("anonymous", backend_api.HTTPException(
                status_code=401, detail="Authentication is required."
            )),
            ("candidate", backend_api.Identity(
                user_id="candidate-user", email="candidate@example.com", role="candidate"
            )),
            ("employer", backend_api.Identity(
                user_id="employer-user", email="employer@example.com", role="employer"
            )),
            ("other administrator", backend_api.Identity(
                user_id="other-admin", email="other@example.com", role="administrator"
            )),
        )
        with patch.dict("os.environ", {"ADMIN_USER_ID": "admin-user"}):
            for label, identity in identities:
                with self.subTest(identity=label), patch.object(
                    backend_api,
                    "_require_identity",
                    side_effect=identity if isinstance(identity, Exception) else None,
                    return_value=None if isinstance(identity, Exception) else identity,
                ):
                    page = self.client.get("/toba")
                    blog_editor = self.client.get("/blogpostcheck")
                    legacy_blog_editor = self.client.get("/blogpostcheck.html")
                    metric = self.client.get(
                        "/api/v1/admin/analytics/placement-success-rate"
                    )
                    self.assertEqual(page.status_code, 404)
                    self.assertEqual(blog_editor.status_code, 404)
                    self.assertEqual(legacy_blog_editor.status_code, 404)
                    self.assertEqual(metric.status_code, 404)
                    self.assertEqual(page.json(), {"detail": "Not Found"})
                    self.assertEqual(blog_editor.json(), {"detail": "Not Found"})
                    self.assertEqual(legacy_blog_editor.json(), {"detail": "Not Found"})
                    self.assertEqual(metric.json(), {"detail": "Not Found"})

            placed_query = _query(None)
            placed_query.execute.return_value = SimpleNamespace(count=0)
            rejected_query = _query(None)
            rejected_query.execute.return_value = SimpleNamespace(count=0)
            service = Mock()
            service.table.side_effect = [placed_query, rejected_query]
            with (
                patch.object(
                    backend_api,
                    "_require_identity",
                    return_value=backend_api.Identity(
                        user_id="admin-user", email="admin@example.com", role="administrator"
                    ),
                ),
                patch.object(backend_api, "_service_client", return_value=service),
            ):
                page = self.client.get("/toba")
                blog_editor = self.client.get("/blogpostcheck")
                legacy_blog_editor = self.client.get("/blogpostcheck.html")
                metric = self.client.get(
                    "/api/v1/admin/analytics/placement-success-rate"
                )

        self.assertEqual(page.status_code, 200)
        self.assertEqual(blog_editor.status_code, 200)
        self.assertEqual(legacy_blog_editor.status_code, 200)
        self.assertEqual(metric.status_code, 200)
        self.assertEqual(blog_editor.content, legacy_blog_editor.content)
        self.assertEqual(
            self.client.get("/.private_admin/blogpostcheck.html").status_code,
            404,
        )

    def test_backend_health_reports_missing_configuration(self) -> None:
        with patch.dict("os.environ", {}, clear=True):
            response = self.client.get("/api/v1/backend/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "status": "unconfigured",
            "auth_configured": False,
            "database_configured": False,
        })

    def test_employer_subscription_checkout_uses_server_price_and_idempotency_key(self) -> None:
        membership_query = _query([{"employer_id": "employer-uuid"}])
        subscriptions_query = _query([])
        plan_query = _query({
            "audience": "employer",
            "amount_minor": 15000,
            "currency": "USD",
            "interval_unit": "month",
            "active": True,
        })
        reservation_query = Mock()
        reservation_query.execute.return_value = SimpleNamespace(data=[{
            "id": "subscription-reservation-uuid",
            "status": "pending",
            "provider_checkout_session_id": None,
        }])
        subscription_save_query = _query({"id": "subscription-reservation-uuid"})
        service = Mock()
        service.table.side_effect = [
            membership_query,
            subscriptions_query,
            plan_query,
            subscription_save_query,
        ]
        service.rpc.return_value = reservation_query
        session = SimpleNamespace(url="https://checkout.stripe.test/session", id="cs_test_123")

        with (
            patch.dict(
                "os.environ",
                {
                    "STRIPE_BILLING_ENABLED": "true",
                    "STRIPE_SECRET_KEY": "sk_test_placeholder",
                    "STRIPE_EMPLOYER_MONTHLY_PRICE_ID": "price_employer",
                },
            ),
            patch.object(
                backend_api,
                "_require_identity",
                return_value=backend_api.Identity(
                    user_id="employer-user", email="employer@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
            patch.object(backend_api, "_verify_stripe_price") as verify_price,
            patch.object(
                backend_api,
                "_create_stripe_checkout_session",
                return_value=session,
            ) as create_checkout,
        ):
            response = self.client.post(
                "/api/v1/billing/subscription/checkout",
                headers={"Origin": "http://testserver"},
                json={"plan_key": "employer-monthly"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "checkout_url": "https://checkout.stripe.test/session",
                "session_id": "cs_test_123",
            },
        )
        params, idempotency_key = create_checkout.call_args.args
        self.assertEqual(idempotency_key, "kov-subscription-subscription-reservation-uuid")
        self.assertEqual(params["line_items"], [{"price": "price_employer", "quantity": 1}])
        self.assertEqual(
            params["subscription_data"]["metadata"]["employer_id"],
            "employer-uuid",
        )
        service.rpc.assert_called_once_with(
            "reserve_stripe_subscription_checkout",
            {
                "p_plan_key": "employer-monthly",
                "p_candidate_id": None,
                "p_employer_id": "employer-uuid",
            },
        )
        verify_price.assert_called_once_with("price_employer", plan_query.execute.return_value.data)

    def test_subscription_checkout_stays_disabled_without_explicit_enable_flag(self) -> None:
        with (
            patch.dict("os.environ", {}, clear=True),
            patch.object(backend_api, "_require_identity") as require_identity,
        ):
            response = self.client.post(
                "/api/v1/billing/subscription/checkout",
                headers={"Origin": "http://testserver"},
                json={"plan_key": "employer-monthly"},
            )

        self.assertEqual(response.status_code, 503)
        require_identity.assert_not_called()

    def test_candidate_subscription_checkout_plan_is_rejected(self) -> None:
        with patch.object(backend_api, "_require_identity") as require_identity:
            response = self.client.post(
                "/api/v1/billing/subscription/checkout",
                headers={"Origin": "http://testserver"},
                json={"plan_key": "candidate-premium-monthly"},
            )

        self.assertEqual(response.status_code, 422)
        require_identity.assert_not_called()

    def test_pending_subscription_checkout_reuses_existing_stripe_session(self) -> None:
        memberships = _query([{"employer_id": "employer-uuid"}])
        pending = _query([{
            "id": "subscription-uuid",
            "status": "pending",
            "provider_checkout_session_id": "cs_pending_123",
        }])
        plan = _query({
            "audience": "employer",
            "amount_minor": 15000,
            "currency": "USD",
            "interval_unit": "month",
            "active": True,
        })
        service = Mock()
        service.table.side_effect = [memberships, pending, plan]
        checkout = SimpleNamespace(
            status="open",
            url="https://checkout.stripe.test/pending",
        )
        with (
            patch.dict(
                "os.environ",
                {
                    "STRIPE_BILLING_ENABLED": "true",
                    "STRIPE_SECRET_KEY": "sk_test_placeholder",
                },
            ),
            patch.object(
                backend_api,
                "_require_identity",
                return_value=backend_api.Identity(
                    user_id="employer-user", email="employer@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
            patch.object(
                backend_api.stripe.checkout.Session,
                "retrieve",
                return_value=checkout,
            ) as retrieve,
            patch.object(backend_api, "_create_stripe_checkout_session") as create_checkout,
        ):
            response = self.client.post(
                "/api/v1/billing/subscription/checkout",
                headers={"Origin": "http://testserver"},
                json={"plan_key": "employer-monthly"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "checkout_url": "https://checkout.stripe.test/pending",
            "session_id": "cs_pending_123",
        })
        retrieve.assert_called_once_with("cs_pending_123", api_key="sk_test_placeholder")
        create_checkout.assert_not_called()

    def test_stripe_price_must_match_active_server_plan(self) -> None:
        plan = {
            "amount_minor": 50000,
            "currency": "USD",
            "interval_unit": "month",
        }
        stripe_price = SimpleNamespace(
            active=True,
            unit_amount=50000,
            currency="usd",
            recurring=SimpleNamespace(interval="month"),
        )
        with (
            patch.object(backend_api, "_stripe_api_key", return_value="sk_test_placeholder"),
            patch.object(backend_api.stripe.Price, "retrieve", return_value=stripe_price) as retrieve,
        ):
            backend_api._verify_stripe_price("price_candidate", plan)

        retrieve.assert_called_once_with("price_candidate", api_key="sk_test_placeholder")

    def test_stripe_price_mismatch_fails_closed(self) -> None:
        stripe_price = SimpleNamespace(
            active=True,
            unit_amount=500000,
            currency="usd",
            recurring=SimpleNamespace(interval="month"),
        )
        with (
            patch.object(backend_api, "_stripe_api_key", return_value="sk_test_placeholder"),
            patch.object(backend_api.stripe.Price, "retrieve", return_value=stripe_price),
        ):
            with self.assertRaises(backend_api.HTTPException) as error:
                backend_api._verify_stripe_price(
                    "price_candidate",
                    {"amount_minor": 50000, "currency": "USD", "interval_unit": "month"},
                )

        self.assertEqual(error.exception.status_code, 503)

    def test_employer_invoice_checkout_uses_invoice_amount_and_company_membership(self) -> None:
        invoice = {
            "id": "invoice-uuid",
            "introduction_id": "introduction-uuid",
            "invoice_reference": "KOV-ABC123",
            "amount_minor": 250000,
            "currency": "USD",
            "status": "issued",
            "stripe_checkout_session_id": None,
        }
        invoice_read = _query(invoice)
        introduction = _query({"employer_id": "employer-uuid"})
        membership = _query([{"employer_id": "employer-uuid"}])
        invoice_update = _query({"id": "invoice-uuid"})
        service = Mock()
        queries = {
            "invoices": iter((invoice_read, invoice_update)),
            "introductions": iter((introduction,)),
            "employer_memberships": iter((membership,)),
        }
        service.table.side_effect = lambda name: next(queries[name])
        reservation_query = Mock()
        reservation_query.execute.return_value = SimpleNamespace(data=[{
            "id": "invoice-uuid",
            "stripe_checkout_session_id": None,
            "stripe_checkout_idempotency_key": "invoice-reservation-uuid",
        }])
        service.rpc.return_value = reservation_query
        session = SimpleNamespace(url="https://checkout.stripe.test/invoice", id="cs_invoice_123")

        with (
            patch.dict("os.environ", {"STRIPE_BILLING_ENABLED": "true"}),
            patch.object(
                backend_api,
                "_require_role",
                return_value=backend_api.Identity(
                    user_id="employer-user", email="payables@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
            patch.object(backend_api, "_create_stripe_checkout_session", return_value=session) as create_checkout,
        ):
            response = self.client.post(
                "/api/v1/employer/invoices/00000000-0000-0000-0000-000000000001/checkout",
                headers={"Origin": "http://testserver"},
            )

        self.assertEqual(response.status_code, 200)
        params = create_checkout.call_args.args[0]
        self.assertEqual(
            create_checkout.call_args.args[1],
            "invoice-reservation-uuid",
        )
        self.assertEqual(params["mode"], "payment")
        self.assertEqual(params["line_items"][0]["price_data"]["unit_amount"], 250000)
        self.assertEqual(params["metadata"], {
            "invoice_id": "00000000-0000-0000-0000-000000000001",
            "checkout_reservation": "invoice-reservation-uuid",
        })
        service.rpc.assert_called_once_with(
            "reserve_stripe_invoice_checkout",
            {"p_invoice_id": "00000000-0000-0000-0000-000000000001"},
        )
        invoice_update.update.assert_called_once_with(
            {"stripe_checkout_session_id": "cs_invoice_123"}
        )

    def test_admin_invoice_draft_uses_transactional_database_rpc(self) -> None:
        invoice = {
            "id": "invoice-uuid",
            "invoice_reference": "KOV-ABC123",
            "amount_minor": 250000,
            "currency": "USD",
            "status": "draft",
        }
        draft_query = Mock()
        draft_query.execute.return_value = SimpleNamespace(data=[invoice])
        service = Mock()
        service.rpc.return_value = draft_query
        with (
            patch.object(
                backend_api,
                "_require_admin",
                return_value=backend_api.Identity(
                    user_id="admin-user", email="admin@example.com", role="administrator"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/v1/admin/introductions/00000000-0000-0000-0000-000000000001/invoice",
                headers={"Origin": "http://testserver"},
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), invoice)
        rpc_name, arguments = service.rpc.call_args.args
        self.assertEqual(rpc_name, "draft_placement_invoice")
        self.assertEqual(arguments["p_introduction_id"], "00000000-0000-0000-0000-000000000001")
        self.assertEqual(arguments["p_actor_id"], "admin-user")
        self.assertRegex(arguments["p_invoice_reference"], r"^KOV-[A-F0-9]{12}$")

    def test_invoice_checkout_rejects_non_member(self) -> None:
        invoice_read = _query({
            "introduction_id": "introduction-uuid",
            "status": "issued",
            "amount_minor": 250000,
            "stripe_checkout_session_id": None,
        })
        introduction = _query({"employer_id": "employer-uuid"})
        membership = _query([])
        service = Mock()
        queries = {
            "invoices": iter((invoice_read,)),
            "introductions": iter((introduction,)),
            "employer_memberships": iter((membership,)),
        }
        service.table.side_effect = lambda name: next(queries[name])

        with (
            patch.dict("os.environ", {"STRIPE_BILLING_ENABLED": "true"}),
            patch.object(
                backend_api,
                "_require_role",
                return_value=backend_api.Identity(
                    user_id="different-employer", email="other@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/v1/employer/invoices/00000000-0000-0000-0000-000000000001/checkout",
                headers={"Origin": "http://testserver"},
            )

        self.assertEqual(response.status_code, 403)

    def test_employer_invoice_list_is_limited_to_issued_company_invoices(self) -> None:
        membership = _query([{"employer_id": "employer-uuid"}])
        introductions = _query([{"id": "introduction-uuid"}])
        invoice = {
            "id": "invoice-uuid",
            "introduction_id": "introduction-uuid",
            "invoice_reference": "KOV-ABC123",
            "amount_minor": 250000,
            "currency": "USD",
            "status": "issued",
            "due_date": "2026-01-01",
            "paid_at": None,
        }
        invoices = _query([invoice])
        service = Mock()
        service.table.side_effect = [membership, introductions, invoices]

        with (
            patch.object(
                backend_api,
                "_require_role",
                return_value=backend_api.Identity(
                    user_id="employer-user", email="payables@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.get("/api/v1/employer/invoices")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [invoice], "limit": 100})
        invoices.in_.assert_any_call("status", ["issued", "past_due", "paid"])

    def test_candidate_subscription_list_is_scoped_to_candidate_profile(self) -> None:
        profile = _query({"id": "candidate-uuid"})
        subscription = {
            "id": "subscription-uuid",
            "plan_key": "candidate-premium-monthly",
            "status": "active",
            "current_period_end": "2026-11-01T00:00:00+00:00",
            "created_at": "2026-10-01T00:00:00+00:00",
        }
        subscriptions = _query([subscription])
        service = Mock()
        service.table.side_effect = [profile, subscriptions]

        with (
            patch.object(
                backend_api,
                "_require_identity",
                return_value=backend_api.Identity(
                    user_id="candidate-user", email="candidate@example.com", role="candidate"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.get("/api/v1/billing/subscriptions")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [subscription], "limit": 20})
        subscriptions.eq.assert_called_once_with("candidate_id", "candidate-uuid")

    def test_stripe_webhook_verifies_signature_and_calls_idempotent_rpc(self) -> None:
        payload = {
            "id": "evt_test_123",
            "type": "customer.subscription.updated",
            "data": {"object": {"id": "sub_test_123"}},
        }
        event = Mock()
        event.id = "evt_test_123"
        event.type = "customer.subscription.updated"
        event.to_dict.return_value = payload
        service = Mock()

        with (
            patch.dict("os.environ", {"STRIPE_WEBHOOK_SECRET": "whsec_placeholder"}),
            patch.object(backend_api.stripe.Webhook, "construct_event", return_value=event) as verify,
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/v1/billing/stripe/webhook",
                content=b'{"id":"evt_test_123"}',
                headers={"Stripe-Signature": "t=1,v1=signature"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"received": True})
        verify.assert_called_once_with(
            b'{"id":"evt_test_123"}',
            "t=1,v1=signature",
            "whsec_placeholder",
        )
        service.rpc.assert_called_once_with(
            "process_stripe_webhook_event",
            {
                "p_event_id": "evt_test_123",
                "p_event_type": "customer.subscription.updated",
                "p_payload": payload,
            },
        )

    def test_stripe_webhook_rejects_invalid_signature(self) -> None:
        with (
            patch.dict("os.environ", {"STRIPE_WEBHOOK_SECRET": "whsec_placeholder"}),
            patch.object(
                backend_api.stripe.Webhook,
                "construct_event",
                side_effect=backend_api.stripe.error.SignatureVerificationError(
                    "invalid", "signature"
                ),
            ),
        ):
            response = self.client.post(
                "/api/v1/billing/stripe/webhook",
                content=b"{}",
                headers={"Stripe-Signature": "invalid"},
            )

        self.assertEqual(response.status_code, 400)

    def test_protected_routes_reject_anonymous_requests(self) -> None:
        for path in (
            "/api/v1/auth/me",
            "/api/v1/candidate/profile",
            "/api/v1/profiles",
            "/api/v1/admin/candidates",
        ):
            with self.subTest(path=path):
                expected_status = 404 if path.startswith("/api/v1/admin/") else 401
                self.assertEqual(self.client.get(path).status_code, expected_status)

    def test_admin_mutations_reject_cross_origin_requests_before_auth(self) -> None:
        response = self.client.patch(
            "/api/v1/admin/candidates/00000000-0000-0000-0000-000000000001/review",
            json={
                "vetting_status": "approved",
                "badge_approved": False,
                "directory_visible": False,
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_candidate_registration_endpoint_is_removed(self) -> None:
        response = self.client.post(
            "/api/v1/auth/register/candidate",
        )
        self.assertEqual(response.status_code, 405)

    def test_employer_registration_requires_a_corporate_email_domain(self) -> None:
        for email in ("person@gmail.com", "person@yahoo.com", "person@outlook.com"):
            with self.subTest(email=email):
                response = self.client.post(
                    "/api/v1/auth/register/employer",
                    json={
                        "email": email,
                        "password": "LongEnoughPassword123!",
                        "company_name": "Example Company",
                        "privacy_consent": True,
                    },
                )
                self.assertEqual(response.status_code, 422)
                self.assertIn(
                    "corporate email address",
                    response.json()["detail"][0]["msg"],
                )

        accepted = backend_api.EmployerRegistration(
            email=" Person@Example.com ",
            password="LongEnoughPassword123!",
            company_name="Example Company",
            privacy_consent=True,
        )
        self.assertEqual(accepted.email, "person@example.com")

    def test_employer_directory_returns_only_masked_candidate_fields(self) -> None:
        profile_id = "candidate-profile-uuid"
        candidate_profiles = _query([{
            "id": profile_id,
            "public_id": "KOV-C-00901",
            "professional_title": "Confidential Executive",
            "professional_summary": "Private summary",
            "skills": ["Leadership", "Strategy"],
            "years_experience": 18,
            "location_region": "West Africa",
            "legal_name": "Daniel Ade",
            "email": "daniel@example.com",
            "phone": "+123456789",
            "cv_url": "https://storage.example/private-cv.pdf",
        }])
        candidate_private = _query([{
            "candidate_id": profile_id,
            "legal_name": "Daniel Ade",
            "email": "daniel@example.com",
            "phone": "+123456789",
            "cv_url": "https://storage.example/private-cv.pdf",
        }])
        service = Mock()
        service.table.side_effect = [candidate_profiles, candidate_private]

        with (
            patch.object(
                backend_api,
                "_require_role",
                return_value=backend_api.Identity(
                    user_id="employer-user", email="employer@example.com", role="employer"
                ),
            ),
            patch.object(backend_api, "_authorize_employer_directory"),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.get("/api/v1/profiles")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(
            payload["items"],
            [{
                "public_id": "KOV-C-00901",
                "initials": "DA",
                "skills": ["Leadership", "Strategy"],
                "years_experience": 18,
                "region": "West Africa",
            }],
        )
        serialized = response.text
        for masked_value in (
            "Daniel Ade", "daniel@example.com", "+123456789",
            "private-cv.pdf", "Confidential Executive", "Private summary",
        ):
            self.assertNotIn(masked_value, serialized)

    def test_candidate_initials_support_single_names_and_extra_whitespace(self) -> None:
        self.assertEqual(backend_api._candidate_initials("Daniel Ade"), "DA")
        self.assertEqual(backend_api._candidate_initials("  Daniel   Ade  "), "DA")
        self.assertEqual(backend_api._candidate_initials("Madonna"), "M")
        self.assertEqual(backend_api._candidate_initials("Mary Jane Watson"), "MW")
        self.assertEqual(backend_api._candidate_initials(None), "")

    def test_candidate_login_updates_last_activity(self) -> None:
        session = SimpleNamespace(
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )
        auth = Mock()
        auth.auth.sign_in_with_password.return_value = SimpleNamespace(
            session=session,
            user=SimpleNamespace(id="candidate-user"),
        )
        profile_query = _query(None)
        service = Mock()
        service.table.return_value = profile_query

        with (
            patch.object(backend_api, "_public_client", return_value=auth),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/v1/auth/login",
                headers={"Origin": "http://testserver"},
                json={"email": "candidate@example.com", "password": "candidate-password"},
            )

        self.assertEqual(response.status_code, 200)
        profile_query.update.assert_called_once()
        self.assertIn("last_activity_at", profile_query.update.call_args.args[0])
        profile_query.eq.assert_called_once_with("user_id", "candidate-user")

    def test_inactive_cv_cleanup_is_protected_and_retry_safe(self) -> None:
        self.assertEqual(
            self.client.post("/api/v1/maintenance/cleanup-expired-cvs").status_code,
            401,
        )
        with patch.dict(
            "os.environ",
            {"CRON_SECRET": "cron-test-secret", "SUPABASE_CV_BUCKET": "candidate-cvs"},
        ):
            unauthorized = self.client.post(
                "/api/v1/maintenance/cleanup-expired-cvs",
                headers={"Authorization": "Bearer wrong-secret"},
            )
            self.assertEqual(unauthorized.status_code, 401)

            candidate_files = _query([{
                "id": "cv-uuid",
                "storage_path": "user-uuid/opaque-file.pdf",
                "cleanup_attempts": 2,
                "candidate_profiles": {"last_activity_at": "2020-01-01T00:00:00Z"},
            }])
            metadata_update = _query(None)
            job_run = _query(None)
            service = Mock()
            service.table.side_effect = [candidate_files, metadata_update, job_run]
            storage = service.storage.from_.return_value

            with patch.object(backend_api, "_service_client", return_value=service):
                response = self.client.post(
                    "/api/v1/maintenance/cleanup-expired-cvs",
                    headers={"Authorization": "Bearer cron-test-secret"},
                )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), {"status": "completed", "deleted": 1, "failed": 0})
            storage.remove.assert_called_once_with(["user-uuid/opaque-file.pdf"])
            metadata_update.update.assert_called_once()
            metadata = metadata_update.update.call_args.args[0]
            self.assertIsNotNone(metadata["deleted_at"])
            self.assertEqual(metadata["cleanup_attempts"], 2)
            candidate_files.lte.assert_called_once()
            self.assertEqual(
                candidate_files.lte.call_args.args[0],
                "candidate_profiles.last_activity_at",
            )

            class StorageFailure(Exception):
                pass

            retry_file_query = _query([{
                "id": "cv-retry",
                "storage_path": "user-uuid/retry.pdf",
                "cleanup_attempts": 4,
                "candidate_profiles": {"last_activity_at": "2020-01-01T00:00:00Z"},
            }])
            retry_update = _query(None)
            retry_job = _query(None)
            retry_service = Mock()
            retry_service.table.side_effect = [retry_file_query, retry_update, retry_job]
            retry_service.storage.from_.return_value.remove.side_effect = StorageFailure(
                "temporary storage outage"
            )
            with (
                patch.object(backend_api, "StorageException", StorageFailure),
                patch.object(backend_api, "_service_client", return_value=retry_service),
            ):
                retry_response = self.client.post(
                    "/api/v1/maintenance/cleanup-expired-cvs",
                    headers={"Authorization": "Bearer cron-test-secret"},
                )

            self.assertEqual(retry_response.status_code, 200)
            self.assertEqual(
                retry_response.json(),
                {"status": "completed", "deleted": 0, "failed": 1},
            )
            self.assertEqual(
                retry_update.update.call_args.args[0]["cleanup_attempts"],
                5,
            )

    def test_admin_placement_success_rate_excludes_ineligible_statuses_and_rounds_once(self) -> None:
        for scenario, placed_count, rejected_count, expected in (
            ("zero", 0, 0, None),
            ("all placed", 4, 0, 100.0),
            ("mixed", 2, 1, 66.7),
            ("pending only", 0, 0, None),
        ):
            with self.subTest(scenario=scenario):
                placed_query = Mock()
                placed_query.select.return_value = placed_query
                placed_query.eq.return_value = placed_query
                placed_query.execute.return_value = SimpleNamespace(count=placed_count)
                rejected_query = Mock()
                rejected_query.select.return_value = rejected_query
                rejected_query.eq.return_value = rejected_query
                rejected_query.execute.return_value = SimpleNamespace(count=rejected_count)
                service = Mock()
                service.table.side_effect = [placed_query, rejected_query]

                with (
                    patch.object(backend_api, "_require_admin"),
                    patch.object(backend_api, "_service_client", return_value=service),
                ):
                    response = self.client.get(
                        "/api/v1/admin/analytics/placement-success-rate"
                    )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["rate_percent"], expected)
                self.assertEqual(response.json()["eligible"], placed_count + rejected_count)
                self.assertEqual(placed_query.eq.call_args.args, ("status", "Placed"))
                self.assertEqual(rejected_query.eq.call_args.args, ("status", "Rejected"))

    def test_placement_start_date_sets_invoice_due_date_thirty_days_later(self) -> None:
        introduction_id = "00000000-0000-0000-0000-000000000001"
        current = _query({"status": "Interviewing"})
        updated = _query({
            "id": introduction_id,
            "status": "Placed",
            "placement_start_date": "2024-01-31",
            "invoice_due_date": "2024-03-01",
        })
        audit = _query(None)
        service = Mock()
        service.table.side_effect = [current, updated, audit]

        with (
            patch.object(
                backend_api,
                "_require_admin",
                return_value=backend_api.Identity(
                    user_id="admin-user", email="admin@example.com", role="administrator"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.patch(
                f"/api/v1/admin/introductions/{introduction_id}",
                headers={"Origin": "http://testserver"},
                json={
                    "status": "Placed",
                    "placement_start_date": "2024-01-31",
                    "placement_fee_minor": 100000,
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["invoice_due_date"], "2024-03-01")
        self.assertEqual(
            updated.update.call_args.args[0]["invoice_due_date"],
            "2024-03-01",
        )

    def test_contact_form_submission_persists_lead_with_keyed_request_ip(self) -> None:
        service = Mock()
        service.rpc.return_value.execute.return_value = SimpleNamespace(
            data={"accepted": True}
        )
        payload = {
            "first_name": "  Dana ",
            "last_name": "Ade",
            "email": " DANA@EXAMPLE.COM ",
            "audience": "Senior Professional",
            "phone": "+1 5551234567",
            "target_role": "VP Product",
            "salary_range": "$220k-$280k",
            "linkedin_url": "https://www.linkedin.com/in/dana",
            "message": "Please contact me.",
        }
        with (
            patch.dict("os.environ", {"SUPABASE_SERVICE_ROLE_KEY": "test-service-key"}),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/contact",
                headers={"x-real-ip": "203.0.113.25"},
                json=payload,
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"status": "received"})
        service.rpc.assert_called_once()
        rpc_name, arguments = service.rpc.call_args.args
        self.assertEqual(rpc_name, "submit_contact_lead")
        self.assertEqual(arguments["p_name"], "Dana Ade")
        self.assertEqual(arguments["p_email"], "dana@example.com")
        self.assertEqual(arguments["p_target_role"], "VP Product")
        self.assertRegex(arguments["p_requester_hash"], r"^[a-f0-9]{64}$")
        self.assertNotIn("203.0.113.25", arguments["p_requester_hash"])

    def test_contact_form_rejects_invalid_input_before_database_call(self) -> None:
        service = Mock()
        with (
            patch.dict("os.environ", {"SUPABASE_SERVICE_ROLE_KEY": "test-service-key"}),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/contact",
                json={
                    "first_name": "Dana",
                    "last_name": "Ade",
                    "email": "not-an-email",
                    "audience": "Senior Professional",
                    "target_role": "VP Product",
                },
            )

        self.assertEqual(response.status_code, 422)
        service.rpc.assert_not_called()

    def test_contact_form_rate_limit_returns_too_many_requests(self) -> None:
        service = Mock()
        service.rpc.return_value.execute.return_value = SimpleNamespace(
            data={"accepted": False}
        )
        with (
            patch.dict("os.environ", {"SUPABASE_SERVICE_ROLE_KEY": "test-service-key"}),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/contact",
                headers={"x-real-ip": "203.0.113.25"},
                json={
                    "first_name": "Dana",
                    "last_name": "Ade",
                    "email": "dana@example.com",
                    "audience": "Senior Professional",
                    "target_role": "VP Product",
                },
            )

        self.assertEqual(response.status_code, 429)
        self.assertIn("Too many inquiries", response.json()["detail"])

    def test_employer_provisioning_uses_one_transactional_rpc(self) -> None:
        data = backend_api.EmployerRegistration(
            email="employer@example.com",
            password="a-long-enough-password",
            company_name=" Example Company ",
            privacy_consent=True,
        )
        query = Mock()
        query.execute.return_value = SimpleNamespace(
            data=[{"employer_id": "employer-uuid", "public_id": "KOV-E-00001"}]
        )
        service = Mock()
        service.rpc.return_value = query

        result = backend_api._provision_employer(service, "user-uuid", data)

        self.assertEqual(
            result, {"id": "employer-uuid", "public_id": "KOV-E-00001"}
        )
        service.rpc.assert_called_once_with(
            "provision_employer_account",
            {
                "p_user_id": "user-uuid",
                "p_company_name": "Example Company",
                "p_corporate_email": "employer@example.com",
                "p_website": None,
                "p_description": None,
                "p_target_roles": [],
                "p_target_seniority": None,
                "p_target_geography": [],
                "p_target_industries": [],
                "p_privacy_acknowledged": True,
            },
        )

    def test_unprovisioned_auth_user_cleanup_uses_admin_api(self) -> None:
        service = Mock()

        backend_api._remove_unprovisioned_auth_user(service, "new-user")

        service.auth.admin.delete_user.assert_called_once_with("new-user")

    def test_provider_session_exchange_sets_http_only_cookies(self) -> None:
        session = SimpleNamespace(
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )
        auth = Mock()
        user = SimpleNamespace(id="provider-user")
        auth.auth.get_user.return_value = SimpleNamespace(user=user)
        auth.auth.refresh_session.return_value = SimpleNamespace(session=session, user=user)

        with patch.object(backend_api, "_public_client", return_value=auth):
            response = self.client.post(
                "/api/v1/auth/session",
                headers={"Origin": "http://testserver"},
                json={"access_token": "provider-access", "refresh_token": "provider-refresh"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "authenticated"})
        cookies = response.headers.get_list("set-cookie")
        self.assertEqual(len(cookies), 2)
        self.assertTrue(all("HttpOnly" in cookie for cookie in cookies))
        auth.auth.get_user.assert_called_once_with("provider-access")
        auth.auth.refresh_session.assert_called_once_with("provider-refresh")

    def test_provider_session_exchange_rejects_mismatched_user_tokens(self) -> None:
        auth = Mock()
        auth.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id="user-a"))
        auth.auth.refresh_session.return_value = SimpleNamespace(
            session=SimpleNamespace(
                access_token="other-access",
                refresh_token="other-refresh",
                expires_in=3600,
            ),
            user=SimpleNamespace(id="user-b"),
        )
        with patch.object(backend_api, "_public_client", return_value=auth):
            response = self.client.post(
                "/api/v1/auth/session",
                headers={"Origin": "http://testserver"},
                json={"access_token": "access-a", "refresh_token": "refresh-b"},
            )

        self.assertEqual(response.status_code, 401)
        self.assertNotIn("set-cookie", response.headers)

    def test_failed_refresh_returns_expired_cookie_headers(self) -> None:
        response = self.client.post(
            "/api/v1/auth/refresh",
            headers={"Origin": "http://testserver"},
        )
        self.assertEqual(response.status_code, 401)
        cookies = response.headers.get_list("set-cookie")
        self.assertEqual(len(cookies), 2)
        self.assertTrue(all("Max-Age=0" in cookie for cookie in cookies))

    def test_failed_remote_logout_still_clears_browser_cookies(self) -> None:
        from supabase_auth.errors import AuthError

        auth = Mock()
        auth.auth.set_session.return_value = SimpleNamespace(session=object())
        auth.auth.sign_out.side_effect = AuthError("provider unavailable", None)
        self.client.cookies.set(backend_api.ACCESS_COOKIE, "access-token")
        self.client.cookies.set(backend_api.REFRESH_COOKIE, "refresh-token")
        with patch.object(backend_api, "_public_client", return_value=auth):
            response = self.client.post(
                "/api/v1/auth/logout",
                headers={"Origin": "http://testserver"},
            )

        self.assertEqual(response.status_code, 502)
        cookies = response.headers.get_list("set-cookie")
        self.assertEqual(len(cookies), 2)
        self.assertTrue(all("Max-Age=0" in cookie for cookie in cookies))

    def test_password_update_requires_same_origin_and_uses_authenticated_session(self) -> None:
        session = SimpleNamespace(
            access_token="renewed-access",
            refresh_token="renewed-refresh",
            expires_in=3600,
        )
        auth = Mock()
        auth.auth.set_session.return_value = SimpleNamespace(session=session)
        self.client.cookies.set(backend_api.ACCESS_COOKIE, "current-access")
        self.client.cookies.set(backend_api.REFRESH_COOKIE, "current-refresh")
        with (
            patch.object(backend_api, "_require_identity", return_value=backend_api.Identity(
                user_id="user-uuid", email="user@example.com", role="candidate"
            )),
            patch.object(backend_api, "_public_client", return_value=auth),
        ):
            response = self.client.post(
                "/api/v1/auth/password",
                headers={"Origin": "http://testserver"},
                json={"password": "a-new-secure-password"},
            )

        self.assertEqual(response.status_code, 200)
        auth.auth.set_session.assert_called_once_with("current-access", "current-refresh")
        auth.auth.update_user.assert_called_once_with({"password": "a-new-secure-password"})

    def test_password_update_rejects_short_password(self) -> None:
        response = self.client.post(
            "/api/v1/auth/password",
            headers={"Origin": "http://testserver"},
            json={"password": "short"},
        )
        self.assertEqual(response.status_code, 422)

    def test_migration_records_consistent_verification_states_and_least_privilege(self) -> None:
        migration_path = (
            Path(__file__).resolve().parents[1]
            / "supabase"
            / "migrations"
            / "202610110001_backend_foundation.sql"
        )
        with open(migration_path, encoding="utf-8") as migration_file:
            migration = migration_file.read()

        self.assertIn("check (status in ('in_review', 'verified', 'rejected', 'suspended'))", migration)
        self.assertIn("revoke all privileges on all tables in schema public from anon, authenticated", migration)
        self.assertIn("grant update (\n    legal_name, phone, expected_compensation, preferred_companies, career_objectives\n) on public.candidate_private", migration)
        self.assertNotIn("grant update on public.candidate_private", migration)
        self.assertIn("create policy verification_read_admin_only", migration)
        self.assertNotIn("verification_read_owner_or_admin", migration)
        self.assertIn("consent_record jsonb not null default '{}'::jsonb", migration)
        self.assertIn("create or replace function public.process_stripe_webhook_event", migration)
        self.assertIn("on conflict (provider, provider_event_id) do nothing", migration)
        self.assertIn("grant execute on function public.process_stripe_webhook_event", migration)
        self.assertIn("create or replace function public.reserve_stripe_subscription_checkout", migration)
        self.assertIn("create or replace function public.reserve_stripe_invoice_checkout", migration)
        self.assertIn("subscriptions_one_open_plan_per_employer_idx", migration)
        self.assertIn("create or replace function public.issue_placement_invoice", migration)
        self.assertIn("create or replace function public.draft_placement_invoice", migration)
        self.assertIn("invoice_row.stripe_checkout_session_id <> stripe_session_id", migration)
        self.assertIn("stripe_checkout_idempotency_key is distinct from", migration)
        self.assertIn("insert into public.payment_transactions", migration)
        self.assertIn("create trigger candidate_profile_activity", migration)
        self.assertIn("create trigger candidate_private_activity", migration)
        self.assertIn("set last_activity_at = now()", migration)
        self.assertIn("new.invoice_due_date := new.placement_start_date + 30", migration)

    def test_invalid_company_website_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            backend_api.EmployerRegistration(
                email="employer@example.com",
                password="a-long-enough-password",
                company_name="Example Company",
                website="javascript:alert(1)",
                privacy_consent=True,
            )

    def test_oversized_streamed_cv_is_rejected_without_service_configuration(self) -> None:
        chunks = iter((b"%PDF-", b"x" * (10 * 1024 * 1024 + 1)))
        with patch.object(
            backend_api,
            "_require_role",
            return_value=backend_api.Identity(
                user_id="candidate-user", email="candidate@example.com", role="candidate"
            ),
        ):
            response = self.client.post(
                "/api/v1/candidate/cv",
                headers={
                    "Origin": "http://testserver",
                    "Content-Type": "application/pdf",
                },
                content=chunks,
            )

        self.assertEqual(response.status_code, 413)

    def test_account_and_admin_pages_include_operational_forms(self) -> None:
        account = self.client.get("/account.html").text
        privacy = self.client.get("/privacy.html").text
        homepage = self.client.get("/").text
        directory = self.client.get("/profiles.html").text
        admin = (Path(__file__).resolve().parents[1] / "toba.html").read_text(
            encoding="utf-8"
        )
        blog_cms = (Path(__file__).resolve().parents[1] / "assets" / "blog-cms.js").read_text(
            encoding="utf-8"
        )
        self.assertIn('class="backend-page backend-account-page"', account)
        self.assertIn('class="backend-page backend-directory-page"', directory)
        self.assertIn('class="backend-page backend-admin-page"', admin)
        self.assertIn('src="/assets/kov-backend-journey.svg"', account)
        self.assertIn('src="/assets/kov-backend-journey.svg"', directory)
        self.assertIn('src="/assets/kov-backend-journey.svg"', admin)
        self.assertIn('id="password-form"', account)
        self.assertIn('id="billing-panel"', account)
        self.assertIn("/api/v1/employer/invoices", account)
        self.assertIn("window.kovApiJsonRequest", account)
        self.assertEqual(account.count('name="privacy_consent" type="checkbox" required'), 1)
        self.assertEqual(account.count('href="/privacy.html"'), 2)
        self.assertIn('id="employer-panel"', account)
        self.assertNotIn('id="candidate-panel"', account)
        self.assertNotIn('/api/v1/auth/register/candidate', account)
        self.assertIn("30 consecutive days without activity", privacy)
        self.assertIn("daniel@kovcareeragency.org", privacy)
        self.assertIn('href="/privacy.html"', homepage)
        self.assertIn("window.kovApiJsonRequest", directory)
        self.assertIn("window.kovApiJsonRequest", admin)
        self.assertIn('id="introduction-create"', admin)
        self.assertIn('aria-label="Operations summary"', admin)
        self.assertIn('id="count-deals"', admin)
        self.assertIn('id="count-candidates"', admin)
        self.assertIn('id="count-employers"', admin)
        self.assertIn('id="calculated-success"', admin)
        self.assertIn("Invoice ready", admin)
        self.assertIn("invoice-ready", admin)
        self.assertIn("save.dataset.action = 'review-candidate'", admin)
        self.assertIn("save.dataset.action = 'verify-employer'", admin)
        self.assertIn("save.dataset.action = 'update-introduction'", admin)
        self.assertIn("sessionStorage.setItem('KOV_BLOG_GITHUB_TOKEN'", blog_cms)
        self.assertNotIn("localStorage.setItem('KOV_BLOG_GITHUB_TOKEN'", blog_cms)

    def test_admin_invoice_issue_uses_transactional_database_rpc(self) -> None:
        issued_query = Mock()
        issued_query.execute.return_value = SimpleNamespace(data=[{
            "id": "invoice-uuid",
            "invoice_reference": "KOV-ABC123",
            "status": "issued",
        }])
        service = Mock()
        service.rpc.return_value = issued_query
        with (
            patch.object(
                backend_api,
                "_require_admin",
                return_value=backend_api.Identity(
                    user_id="admin-user", email="admin@example.com", role="administrator"
                ),
            ),
            patch.object(backend_api, "_service_client", return_value=service),
        ):
            response = self.client.post(
                "/api/v1/admin/invoices/00000000-0000-0000-0000-000000000001/issue",
                headers={"Origin": "http://testserver"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "issued")
        service.rpc.assert_called_once_with(
            "issue_placement_invoice",
            {
                "p_invoice_id": "00000000-0000-0000-0000-000000000001",
                "p_actor_id": "admin-user",
            },
        )


if __name__ == "__main__":
    unittest.main()
