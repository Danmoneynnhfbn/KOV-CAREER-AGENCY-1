from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from backend_api import _require_admin, mount_backend_routes

# Vercel reads this single 'app' instance as the gateway to your project
app = FastAPI()
ROOT = Path(__file__).resolve().parent
PUBLIC_DATASET_PATHS = {
    "datasets/catalog.jsonld",
    "datasets/job-titles.json",
    "datasets/occupations.json",
}

# Mount your assets directory so images and CSS files load perfectly
ASSETS_DIR = ROOT / "assets"
if ASSETS_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# This route serves your beautiful main index.html file to web visitors
@app.get("/", response_class=HTMLResponse)
def read_root():
    try:
        with (ROOT / "index.html").open("r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        return "<h1>KOV Career Agency Backend Online</h1><p>Main frontend HTML file not found.</p>"

# Your candidate/client status check API route
@app.get("/api/v1/status")
def get_status():
    return {
        "status": "active", 
        "agency": "KOV Career Platform Ready",
        "region": "Global Executive Search"
    }


mount_backend_routes(app)


@app.get("/datasets/catalog.jsonld")
def public_dataset_catalog():
    path = ROOT / "datasets" / "catalog.jsonld"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return Response(
        content=path.read_text(encoding="utf-8"),
        media_type="application/ld+json",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.get("/profiles", response_class=HTMLResponse)
def candidate_directory_page():
    page = ROOT / "profiles.html"
    if not page.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(page)


@app.get("/toba", response_class=HTMLResponse)
def administrator_console_page(request: Request):
    _require_admin(request, request.headers.get("authorization"))
    page = ROOT / "toba.html"
    if not page.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(page)


@app.get("/blogpostcheck", response_class=HTMLResponse)
@app.get("/blogpostcheck.html", response_class=HTMLResponse)
def blog_editor_page(request: Request):
    _require_admin(request, request.headers.get("authorization"))
    page = ROOT / ".private_admin" / "blogpostcheck.html"
    if not page.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(page)


@app.get("/{requested_path:path}")
def read_site_file(requested_path: str):
    file_path = (ROOT / requested_path).resolve()
    public_extensions = {".html", ".xml", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"}
    is_public_dataset = requested_path in PUBLIC_DATASET_PATHS
    if (
        requested_path == ".private_admin"
        or requested_path.startswith(".private_admin/")
        or requested_path == "town-role-insitutution"
        or requested_path.startswith("town-role-insitutution/")
        or not file_path.is_relative_to(ROOT)
        or not file_path.is_file()
        or (
            file_path.suffix.lower() not in public_extensions
            and not is_public_dataset
        )
    ):
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(file_path)
