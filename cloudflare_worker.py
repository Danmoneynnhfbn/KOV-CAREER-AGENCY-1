"""Cloudflare Python Worker entry point for the KOV FastAPI application."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response, StreamingResponse
from workers import asgi

from backend_api import (
    _require_admin,
    mount_backend_routes,
    reset_runtime_env,
    set_runtime_env,
)
from cloudflare_private_pages import CATALOGUE_ASSET_PARTS, PRIVATE_PAGES

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

    asset_path = path.lstrip("/")
    asset_url = f"https://assets.local/{asset_path}"
    asset = await assets.fetch(asset_url)
    body = await asset.bytes()
    return Response(
        content=body,
        status_code=asset.status,
        headers=asset.headers,
    )


async def _catalogue_response(request: Request) -> Response:
    """Stream the original JSON-LD bytes from verified gzip static-asset parts."""
    env = request.scope.get("env")
    assets = getattr(env, "ASSETS", None) if env is not None else None
    if assets is None or not CATALOGUE_ASSET_PARTS:
        raise HTTPException(
            status_code=503,
            detail="The discovery catalogue is not configured on this Worker.",
        )

    async def compressed_parts():
        for part_path in CATALOGUE_ASSET_PARTS:
            asset = await assets.fetch(f"https://assets.local/{part_path}")
            if asset.status != 200:
                raise HTTPException(
                    status_code=502,
                    detail="A discovery catalogue asset part could not be loaded.",
                )
            yield await asset.bytes()

    return StreamingResponse(
        compressed_parts(),
        media_type="application/ld+json",
        headers={
            "Content-Encoding": "gzip",
            "Cache-Control": "public, max-age=3600",
            "Vary": "Accept-Encoding",
        },
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
    if requested_path == "data/kov-discovery-catalog.jsonld":
        return await _catalogue_response(request)
    return await _asset_response(request, requested_path)


# Cloudflare's Python Workers ASGI adapter.
Default = asgi.entrypoint(app)
