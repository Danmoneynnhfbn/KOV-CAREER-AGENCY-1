#!/usr/bin/env python3
"""Create a byte-for-byte-preserving gzip copy of the discovery catalogue."""

from __future__ import annotations

import gzip
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "kov-discovery-catalog.jsonld"
DESTINATION = SOURCE.with_suffix(SOURCE.suffix + ".gz")


def main() -> None:
    if not SOURCE.is_file():
        print("Discovery catalogue not present; skipping compression.")
        return

    original = SOURCE.read_bytes()
    compressed = gzip.compress(original, compresslevel=9, mtime=0)

    if gzip.decompress(compressed) != original:
        raise SystemExit("Catalogue gzip integrity check failed.")

    DESTINATION.write_bytes(compressed)
    saved = len(original) - len(compressed)
    percent = (saved / len(original) * 100) if original else 0
    print(
        "Verified byte-preserving catalogue compression: "
        f"{len(original):,} -> {len(compressed):,} bytes "
        f"({percent:.1f}% smaller)"
    )


if __name__ == "__main__":
    main()
