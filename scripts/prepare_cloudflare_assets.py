#!/usr/bin/env python3
"""Prepare a safe, size-checked public asset tree for Cloudflare Workers."""

from __future__ import annotations

import gzip
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PRIVATE_MODULE = ROOT / "cloudflare_private_pages.py"
MAX_ASSET_BYTES = 25 * 1024 * 1024
CATALOGUE_PATH = Path("data/kov-discovery-catalog.jsonld")
CATALOGUE_ASSET_PATH = Path("data/kov-discovery-catalog.jsonld.gz")

PUBLIC_EXTENSIONS = {
    ".html", ".xml", ".txt", ".jsonld", ".css", ".js",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico",
}
EXCLUDED_DIRS = {
    ".git", ".github", ".private_admin", ".venv", "venv", "public",
    "__pycache__", "node_modules",
    "design-reference", "_design-reference", ".wrangler",
}
EXCLUDED_FILES = {
    CATALOGUE_PATH.as_posix(),
    "toba.html",
    ".private_admin/blogpostcheck.html",
}


def is_excluded(relative: Path) -> bool:
    parts = set(relative.parts)
    if parts & EXCLUDED_DIRS:
        return True
    if relative.as_posix() in EXCLUDED_FILES:
        return True
    if any(part.startswith(".tmp-") for part in relative.parts):
        return True
    return False


def prepare_compressed_catalogue() -> tuple[int, int] | None:
    """Gzip the original catalogue without changing a single source byte."""
    source = ROOT / CATALOGUE_PATH
    if not source.is_file():
        return None

    original = source.read_bytes()
    compressed = gzip.compress(original, compresslevel=9, mtime=0)
    if gzip.decompress(compressed) != original:
        raise SystemExit("Catalogue compression integrity check failed.")

    if len(compressed) > MAX_ASSET_BYTES:
        raise SystemExit(
            "The compressed discovery catalogue still exceeds Cloudflare's "
            f"25 MiB static asset limit ({len(compressed) / (1024 * 1024):.2f} MiB). "
            "Store this unchanged gzip file in R2 instead."
        )

    destination = PUBLIC / CATALOGUE_ASSET_PATH
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(compressed)
    return len(original), len(compressed)


def main() -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)

    private_pages: dict[str, str] = {}
    for relative in ("toba.html", ".private_admin/blogpostcheck.html"):
        source = ROOT / relative
        if source.is_file():
            private_pages[relative] = source.read_text(encoding="utf-8")

    copied = 0
    oversized: list[str] = []

    catalogue_sizes = prepare_compressed_catalogue()

    for source in ROOT.rglob("*"):
        if not source.is_file():
            continue
        relative = source.relative_to(ROOT)
        if is_excluded(relative):
            continue
        if source.suffix.lower() not in PUBLIC_EXTENSIONS:
            continue
        size = source.stat().st_size
        if size > MAX_ASSET_BYTES:
            oversized.append(f"{relative.as_posix()} ({size / (1024 * 1024):.1f} MiB)")
            continue
        destination = PUBLIC / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        copied += 1

    if oversized:
        raise SystemExit(
            "Cloudflare asset preparation stopped. These public files exceed "
            "the 25 MiB per-file limit:\n  " + "\n  ".join(oversized)
        )

    private_items = ",\n".join(
        f"    {key!r}: {value!r}" for key, value in private_pages.items()
    )
    PRIVATE_MODULE.write_text(
        '"""Generated protected admin pages. Do not edit by hand."""\n\n'
        "PRIVATE_PAGES = {\n" + private_items + "\n}\n",
        encoding="utf-8",
    )

    print(f"Prepared {copied} public website assets in {PUBLIC}")
    print(f"Prepared {len(private_pages)} protected admin page(s)")
    if catalogue_sizes:
        original_size, compressed_size = catalogue_sizes
        reduction = 100 * (1 - compressed_size / original_size)
        print(
            "Prepared discovery catalogue as a byte-preserving gzip asset: "
            f"{original_size:,} -> {compressed_size:,} bytes "
            f"({reduction:.1f}% smaller)"
        )
    else:
        print("Discovery catalogue source file was not present; no gzip asset created.")


if __name__ == "__main__":
    main()
