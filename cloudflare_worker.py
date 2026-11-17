"""Cloudflare Python Worker entry point for the KOV FastAPI application."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from workers import asgi

from backend_api import (
    _require_admin,
    mount_backend_routes,
    reset_runtime_env,
    set_runtime_env,
)
from cloudflare_private_pages import PRIVATE_PAGES

app = FastAPI()
CANONICAL_HOST = "www.kovcareeragency.org"
NON_CANONICAL_HOST = "kovcareeragency.org"


@app.middleware("http")
async def cloudflare_environment(request: Request, call_next):
    """Expose Cloudflare Worker bindings/secrets to existing backend helpers."""
    token = set_runtime_env(request.scope.get("env"))
    try:
        return await call_next(request)
    finally:
        reset_runtime_env(token)


@app.middleware("http")
async def redirect_noncanonical_homepage(request: Request, call_next):
    host = (request.url.hostname or "").lower().rstrip(".")
    path = "/" if request.url.path == "/index.html" else request.url.path
    if host == NON_CANONICAL_HOST or (
        host == CANONICAL_HOST and request.url.path == "/index.html"
    ):
        destination = request.url.replace(
            scheme="https",
            netloc=CANONICAL_HOST,
            path=path,
        )
        return RedirectResponse(str(destination), status_code=308)
    return await call_next(request)


async def _asset_response(request: Request, path: str) -> Response:
    env = request.scope.get("env")
    assets = getattr(env, "ASSETS", None) if env is not None else None
    if assets is None:
        raise HTTPException(
            status_code=503,
            detail="Website assets are not configured on this Worker.",
        )

    # The discovery catalogue is stored as an unchanged gzip stream so the
    # physical asset stays below Cloudflare's 25 MiB per-file limit. Returning
    # Content-Encoding lets browsers recover the exact original JSON-LD bytes.
    if path.lstrip("/") == "data/kov-discovery-catalog.jsonld":
        asset = await assets.fetch(
            "https://assets.local/data/kov-discovery-catalog.jsonld.gz"
        )
        body = await asset.bytes()
        if asset.status != 200:
            return Response(content=body, status_code=asset.status)
        return Response(
            content=body,
            status_code=asset.status,
            headers={
                "content-type": "application/ld+json; charset=utf-8",
                "content-encoding": "gzip",
                "cache-control": "public, max-age=3600, s-maxage=86400",
                "x-content-type-options": "nosniff",
            },
        )

    asset_path = path.lstrip("/")
    asset_url = f"https://assets.local/{asset_path}"
    asset = await assets.fetch(asset_url)
    body = await asset.bytes()
    return Response(
        content=body,
        status_code=asset.status,
        headers=asset.headers,
    )


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return await _asset_response(request, "/")


@app.get("/api/v1/status")
async def get_status():
    return {
        "status": "active",
        "agency": "KOV Career Platform Ready",
        "region": "Global Executive Search",
    }


@app.get("/profiles", response_class=HTMLResponse)
async def candidate_directory_page(request: Request):
    return await _asset_response(request, "/profiles.html")


@app.get("/faq/", response_class=HTMLResponse)
async def faq_library_page(request: Request):
    return await _asset_response(request, "/faq/index.html")


@app.get("/toba", response_class=HTMLResponse)
async def administrator_console_page(request: Request):
    _require_admin(request, request.headers.get("authorization"))
    page = PRIVATE_PAGES.get("toba.html")
    if page is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return HTMLResponse(page)


@app.get("/blogpostcheck", response_class=HTMLResponse)
@app.get("/blogpostcheck.html", response_class=HTMLResponse)
async def blog_editor_page(request: Request):
    _require_admin(request, request.headers.get("authorization"))
    page = PRIVATE_PAGES.get(".private_admin/blogpostcheck.html")
    if page is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return HTMLResponse(page)


# Register the existing account, candidate, employer, admin and payment APIs
# before the frontend catch-all so API routes always take precedence.
mount_backend_routes(app)


@app.get("/{requested_path:path}")
async def read_site_file(requested_path: str, request: Request):
    return await _asset_response(request, requested_path)


# Cloudflare's Python Workers ASGI adapter.
Default = asgi.entrypoint(app)
