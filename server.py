import os
from pathlib import Path
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

# Vercel reads this single 'app' instance as the gateway to your project
app = FastAPI()
ROOT = Path(__file__).resolve().parent

# Mount your assets directory so images and CSS files load perfectly
if os.path.exists("assets"):
    app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# This route serves your beautiful main index.html file to web visitors
@app.get("/", response_class=HTMLResponse)
def read_root():
    try:
        with open("index.html", "r", encoding="utf-8") as file:
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


@app.get("/{requested_path:path}")
def read_site_file(requested_path: str):
    file_path = (ROOT / requested_path).resolve()
    public_extensions = {".html", ".xml", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"}
    if (
        not file_path.is_relative_to(ROOT)
        or not file_path.is_file()
        or file_path.suffix.lower() not in public_extensions
    ):
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(file_path)
