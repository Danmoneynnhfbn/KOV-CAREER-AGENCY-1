#!/usr/bin/env python3
import json
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "blog_posts.db"
PRIVATE_DASHBOARD_PATHS = {"/blogpostcheck", "/blogpostcheck.html", "/blogpostcheck/"}
PUBLIC_BLOG_PATHS = {"/blog", "/blog.html", "/blog/"}
POST_TTL_DAYS = 30


def ensure_db():
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            image TEXT,
            content TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            published_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def utc_now():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat()


def parse_iso(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def normalize_post(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "image": row["image"],
        "content": row["content"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "publishedAt": row["published_at"],
        "expiresAt": row["expires_at"],
        "updatedAt": row["updated_at"],
    }


def get_posts(include_all=False):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM posts ORDER BY published_at DESC, created_at DESC"
    ).fetchall()
    conn.close()

    now = utc_now()
    result = []
    for row in rows:
        if not include_all and (row["status"] != "published" or parse_iso(row["expires_at"]) <= now):
            continue
        result.append(normalize_post(row))
    return result


def save_post(payload):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    now = utc_now()
    post_id = payload.get("id") or f"post-{int(now.timestamp() * 1000)}"
    title = (payload.get("title") or "Untitled post").strip() or "Untitled post"
    image = (payload.get("image") or "").strip()
    content = payload.get("content") or ""
    status = payload.get("status") or "published"
    existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()

    if existing is None:
        created_at = now
        published_at = now
        expires_at = now + timedelta(days=POST_TTL_DAYS)
    else:
        created_at = parse_iso(existing["created_at"]) or now
        published_at = parse_iso(existing["published_at"]) or now
        expires_at = parse_iso(existing["expires_at"]) or now + timedelta(days=POST_TTL_DAYS)

    if status == "published" and (existing is None or existing["status"] != "published"):
        published_at = now
        expires_at = now + timedelta(days=POST_TTL_DAYS)
    elif status == "published" and existing is not None:
        expires_at = now + timedelta(days=POST_TTL_DAYS)

    updated_at = now
    conn.execute(
        """
        INSERT INTO posts (id, title, image, content, status, created_at, published_at, expires_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            image = excluded.image,
            content = excluded.content,
            status = excluded.status,
            created_at = excluded.created_at,
            published_at = excluded.published_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at
        """,
        (
            post_id,
            title,
            image,
            content,
            status,
            iso(created_at),
            iso(published_at),
            iso(expires_at),
            iso(updated_at),
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    conn.close()
    return normalize_post(row)


def delete_post(post_id):
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    return True


class BlogHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path.startswith("/api/posts"):
            self.handle_posts_get(path, query)
            return

        if path in PRIVATE_DASHBOARD_PATHS:
            self.serve_file("blogpostcheck.html")
            return

        if path in PUBLIC_BLOG_PATHS:
            self.serve_file("blog.html")
            return

        if path == "/":
            self.serve_file("index.html")
            return

        safe_path = (ROOT / path.lstrip("/")).resolve()
        if safe_path.exists() and safe_path.is_file() and str(safe_path).startswith(str(ROOT)):
            self.serve_static(safe_path)
            return

        self.send_error(404, "Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/posts"):
            self.handle_posts_post(path)
            return

        self.send_error(404, "Not Found")

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/posts/"):
            self.handle_posts_delete(path)
            return

        self.send_error(404, "Not Found")

    def handle_posts_get(self, path, query):
        include_all = query.get("mode", [""])[0].lower() == "all"
        posts = get_posts(include_all=include_all)
        self.send_json(200, posts)

    def handle_posts_post(self, path):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON"})
            return

        post = save_post(payload)
        self.send_json(200, post)

    def handle_posts_delete(self, path):
        post_id = path.split("/")[-1]
        if not post_id:
            self.send_json(400, {"error": "Missing post id"})
            return
        delete_post(post_id)
        self.send_json(200, {"deleted": True, "id": post_id})

    def serve_file(self, filename):
        file_path = ROOT / filename
        if not file_path.exists():
            self.send_error(404, "Not Found")
            return
        content = file_path.read_text(encoding="utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content.encode("utf-8"))))
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def serve_static(self, file_path):
        content = file_path.read_bytes()
        if file_path.suffix.lower() in {".js"}:
            content_type = "application/javascript; charset=utf-8"
        elif file_path.suffix.lower() in {".css"}:
            content_type = "text/css; charset=utf-8"
        elif file_path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}:
            content_type = self.guess_type(str(file_path))
        else:
            content_type = "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ensure_db()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), BlogHandler)
    print(f"KOV blog server running on http://127.0.0.1:{port}")
    print(f"Private dashboard: http://127.0.0.1:{port}/blogpostcheck")
    server.serve_forever()
