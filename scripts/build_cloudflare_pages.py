#!/usr/bin/env python3
"""Prepare the public KOV site for Cloudflare Pages Free.

The production Pages build excludes backend-only and private administration files.

Copies public website files without changing their contents. Large JSON catalogues
are delivered as verified gzip representations at their original public URLs.
"""
from __future__ import annotations
import gzip
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from optimize_head_metadata import optimize_tree
OUT = ROOT / "dist"
MAX_FILE = 25 * 1024 * 1024
CANDIDATE_IMAGE_ARCHIVE = ROOT / "assets" / "KOV_Candidate_Images_Compressed.zip"
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


def natural_sort_key(value: str):
    return tuple((1, int(part)) if part.isdigit() else (0, part.casefold())
                 for part in re.split(r"(\d+)", value))


def extract_candidate_portraits() -> int:
    """Unpack the owner-provided archive into numbered public portrait assets."""
    output_dir = OUT / "assets" / "candidate-project-portraits"
    output_dir.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    allowed = {".avif", ".webp", ".png", ".jpg", ".jpeg"}
    if CANDIDATE_IMAGE_ARCHIVE.exists():
        with zipfile.ZipFile(CANDIDATE_IMAGE_ARCHIVE) as archive:
            members = [
                item for item in archive.infolist()
                if not item.is_dir()
                and Path(item.filename).suffix.lower() in allowed
                and not any(part.startswith(".") or part == "__MACOSX"
                            for part in Path(item.filename).parts)
            ]
            members.sort(key=lambda item: natural_sort_key(item.filename))
            for index, item in enumerate(members[:1000], start=1):
                extension = Path(item.filename).suffix.lower()
                filename = f"profile-{index:04d}{extension}"
                destination = output_dir / filename
                with archive.open(item) as source, destination.open("wb") as target:
                    shutil.copyfileobj(source, target)
                urls.append(f"/assets/candidate-project-portraits/{filename}")

    manifest = OUT / "assets" / "candidate-project-directory-portraits.js"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(
        "/* INTERNAL OWNER NOTE: Portrait order follows the sorted source archive. */\n"
        "window.KOV_CANDIDATE_PORTRAITS = "
        + json.dumps(urls, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )

    # Replace the first-page fallback SVGs with the corresponding portrait assets.
    fallback_page = OUT / "resources" / "candidate-project-directory.html"
    if fallback_page.exists() and urls:
        page = fallback_page.read_text(encoding="utf-8")
        image_tag = re.compile(
            r'<img class="kov-project-avatar[^"]*" src="[^"]*" alt="[^"]*" loading="lazy">'
        )
        matches = list(image_tag.finditer(page))
        for index, match in reversed(list(enumerate(matches[:min(24, len(urls))], start=1))):
            tag = match.group(0)
            tag = re.sub(r'src="[^"]*"', 'src="../' + urls[index - 1].lstrip("/") + '"', tag, count=1)
            tag = re.sub(r'alt="[^"]*"', f'alt="Professional profile portrait {index:04d}"', tag, count=1)
            page = page[:match.start()] + tag + page[match.end():]
        fallback_page.write_text(page, encoding="utf-8", newline="")

    print(f"Candidate profile portraits extracted: {len(urls):,}")
    return len(urls)


def main() -> None:
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
        if source.name == "KOV_Candidate_Images_Compressed.zip":
            skipped += 1
            continue
        rel = source.relative_to(ROOT)
        if rel.parts[0] == "staging" and rel.as_posix() not in PUBLIC_STAGING_PAGES:
            skipped += 1
            continue
        if any(part in SKIP_DIRS for part in rel.parts):
            skipped += 1
            continue
        if rel.parts[0].startswith(".") or source.name in SKIP_ROOT_FILES:
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
        copied += 1

    portrait_count = extract_candidate_portraits()

    # Optimize every published HTML page, including public pages.
    # The optimizer verifies BODY and robots directives remain byte-identical.
    head_report = optimize_tree(OUT)
    print("Verified lossless HEAD/social metadata optimization:", head_report)

    worker_source = ROOT / "scripts" / "cloudflare-pages-worker.js"
    shutil.copy2(worker_source, OUT / "_worker.js")
    (OUT / "_headers").write_text(
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n",
        encoding="utf-8",
    )
    print(f"Cloudflare Pages output ready: {copied} files copied, {compressed} catalogues compressed, {skipped} internal files skipped, {portrait_count:,} candidate portraits published.")

if __name__ == "__main__":
    main()
