#!/usr/bin/env python3
"""Prepare the public KOV site for Cloudflare Pages Free.

The production Pages build excludes backend-only and private administration files.

Copies public website files without changing their contents. Large JSON catalogues
are delivered as verified gzip representations at their original public URLs.
"""
from __future__ import annotations
import gzip
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from optimize_head_metadata import optimize_tree
OUT = ROOT / "dist"
MAX_FILE = 25 * 1024 * 1024
SKIP_DIRS = {
    ".git", ".github", ".private_admin", ".vscode", "__pycache__", "node_modules",
    "cloudflare-api", "development", "design-reference", "research", "mobile",
    "tests", "github", "vscode", "supabase", "config", "scripts", "dist",
}
SKIP_ROOT_FILES = {
    "Dockerfile", "wrangler.jsonc", "requirements.txt", "pyproject.toml",
    "server.py", "backend_api.py", "cloudflare_worker.py",
    "cloudflare_private_pages.py", "CLOUDFLARE_CONTAINER_DEPLOYMENT.md",
    "CLOUDFLARE_PYTHON_WORKER.md", "BLOCKERS.md",
    "toba.html", "blogpostcheck.html", "blogpostcheck.html.bak",
}
PUBLIC_STAGING_MANIFEST = ROOT / "scripts" / "staging-public-pages.txt"
PUBLIC_STAGING_PAGES = {
    line.strip() for line in PUBLIC_STAGING_MANIFEST.read_text(encoding="utf-8").splitlines()
    if line.strip()
} if PUBLIC_STAGING_MANIFEST.exists() else set()

COMPRESS_AS = {
    Path("data/kov-discovery-catalog.jsonld"),
    Path("data/taxonomy/verified-expanded-taxonomy.json"),
}

def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_sitemap.py")], cwd=str(ROOT), check=True)
    # Build the React homepage/header bundle from source before copying assets.
    npm = shutil.which("npm")
    if not npm:
        raise SystemExit("npm is required to build the React homepage and navigation bundle.")
    subprocess.run([npm, "run", "build:react"], cwd=str(ROOT), check=True)

    # Regenerate search content/catalogue from the current sitemap so new public
    # resources appear in site search and the shared footer's expandable directory.
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "build-site-search-index.py")],
        cwd=str(ROOT),
        check=True,
    )

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    copied = 0
    compressed = 0
    skipped = 0
    for source in ROOT.rglob("*"):
        if OUT in source.parents:
            continue
        if not source.is_file():
            continue
        rel = source.relative_to(ROOT)
        if rel.parts[0] == "directory" and rel.as_posix() not in PUBLIC_STAGING_PAGES:
            skipped += 1
            continue
        # Internal project documentation is never part of the public Pages site.
        if rel.parts[0] == "docs":
            skipped += 1
            continue
        if any(part in SKIP_DIRS for part in rel.parts):
            skipped += 1
            continue
        if rel.parts[0].startswith(".") or source.name in SKIP_ROOT_FILES:
            skipped += 1
            continue
        # Markdown and reStructuredText are repository documentation, not public site pages.
        if source.suffix.lower() in {".md", ".mdx", ".markdown", ".rst"}:
            skipped += 1
            continue
        if source.suffix in {".pyc", ".pem", ".key", ".env", ".sqlite", ".db"}:
            skipped += 1
            continue
        if source.name.endswith(".bak") or source.name.endswith(".log"):
            skipped += 1
            continue

        destination = OUT / rel
        destination.parent.mkdir(parents=True, exist_ok=True)

        if rel in COMPRESS_AS:
            raw = source.read_bytes()
            packed = gzip.compress(raw, compresslevel=9, mtime=0)
            if gzip.decompress(packed) != raw:
                raise SystemExit(f"Gzip integrity check failed: {rel}")
            if len(packed) > MAX_FILE:
                raise SystemExit(f"Compressed asset exceeds Pages limit: {rel} ({len(packed):,} bytes)")
            destination = destination.with_name(destination.name + ".gz")
            destination.write_bytes(packed)
            compressed += 1
            print(f"Verified {rel}: {len(raw):,} -> {len(packed):,} bytes")
            continue

        size = source.stat().st_size
        if size > MAX_FILE:
            # Large non-public QA archives/data are not required by the website.
            if rel.parts[0] in {"development", "research", "design-reference"}:
                skipped += 1
                continue
            raise SystemExit(f"Uncompressed asset exceeds Pages 25 MiB limit: {rel} ({size:,} bytes)")
        shutil.copy2(source, destination)
        if destination.suffix.lower() in {".html", ".htm"}:
            html = destination.read_text(encoding="utf-8")
            html = re.sub(
                r"(/assets/kov-site-header\.bundle\.js)\?v=\d+",
                r"\1?v=8",
                html,
            )
            html = re.sub(
                r"(/assets/uniform-footer\.js)\?v=\d+",
                r"\1?v=15",
                html,
            )
            html = re.sub(
                r"(/?css/kov-global-redesign\.css)\?v=\d+",
                r"\1?v=31",
                html,
            )
            html = re.sub(
                r"(/?assets/kov-global-interactions\.js)\?v=\d+",
                r"\1?v=11",
                html,
            )
            destination.write_text(html, encoding="utf-8")
        copied += 1

    # Connect published role, industry, market, resource and service pages with
    # contextual static links. The builder changes dist only, not source HTML or HEAD metadata.
    ecosystem_builder = ROOT / "scripts" / "build-commercial-ecosystem.py"
    subprocess.run(
        [sys.executable, str(ecosystem_builder), "--source-root", str(ROOT), "--output-root", str(OUT)],
        cwd=str(ROOT),
        check=True,
    )

    # Fail closed if private/internal documentation enters the deployable output.
    if (OUT / "docs").exists():
        raise SystemExit("Internal docs/ directory must not be included in Cloudflare Pages output.")
    public_document_files = [
        path for path in OUT.rglob("*")
        if path.is_file() and path.suffix.lower() in {".md", ".mdx", ".markdown", ".rst"}
    ]
    if public_document_files:
        examples = ", ".join(str(path.relative_to(OUT)) for path in public_document_files[:10])
        raise SystemExit(f"Repository documentation must not be public Pages assets: {examples}")

    # Generate the 18-category JSON-LD against the staged Cloudflare output.
    # The generator reads source catalogues from ROOT but writes only into OUT.
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required to generate KOV JSON-LD before HEAD optimization.")
    metadata_builder = ROOT / "scripts" / "build-jsonld.js"
    subprocess.run(
        [node, str(metadata_builder), "--root", str(OUT)],
        cwd=str(ROOT),
        check=True,
    )

    # Optimize every published HTML page, including public noindex pages.
    # The optimizer validates unchanged bodies and preserves all unrelated HEAD content.
    head_report = optimize_tree(OUT)
    print("Verified lossless HEAD/social metadata optimization:", head_report)

    worker_source = ROOT / "scripts" / "cloudflare-pages-worker.js"
    shutil.copy2(worker_source, OUT / "_worker.js")
    (OUT / "_headers").write_text(
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n",
        encoding="utf-8",
    )
    print(f"Cloudflare Pages output ready: {copied} files copied, {compressed} catalogues compressed, {skipped} internal files skipped.")

if __name__ == "__main__":
    main()
