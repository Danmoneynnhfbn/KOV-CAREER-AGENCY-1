#!/usr/bin/env python3
"""Fail the production build if sitemap, coverage inventory, canonicals or robots disagree."""
from __future__ import annotations
import csv
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.kovcareeragency.org"

def page_path(url: str) -> str:
    path = urlparse(url).path
    if path in ("", "/"):
        return "index.html"
    trimmed = path.lstrip("/")
    if trimmed == "blog":
        return "blog.html"
    if trimmed.endswith("/"):
        return trimmed + "index.html"
    if trimmed.endswith(".html"):
        return trimmed
    if (ROOT / (trimmed + ".html")).is_file():
        return trimmed + ".html"
    return trimmed.rstrip("/") + "/index.html"

def meta_values(source: str, name: str) -> list[str]:
    values = []
    for tag in re.findall(r"<meta\\b[^>]*>", source, re.I):
        attr = dict((key.lower(), value) for key, value in re.findall(
            r"""([\\w:-]+)\\s*=\\s*["']([^"']*)["']""", tag
        ))
        if attr.get("name", "").lower() == name:
            values.append(attr.get("content", ""))
    return values

def main() -> int:
    with (ROOT / "development" / "PAGE-COVERAGE.csv").open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    by_path = {row["path"]: row for row in rows}
    root = ET.parse(ROOT / "sitemap.xml").getroot()
    urls = [node.text.strip() for node in root.iter() if node.tag.endswith("}loc") and node.text]
    failures = []
    if len(urls) != len(set(urls)):
        failures.append("duplicate sitemap URLs")
    for url in urls:
        rel = page_path(url)
        page = ROOT / rel
        row = by_path.get(rel)
        if not page.is_file():
            failures.append(f"missing sitemap target: {url} -> {rel}")
            continue
        if row is None or row.get("sitemap") != "yes" or row.get("eligibility") != "published":
            failures.append(f"coverage inventory does not approve sitemap URL: {url}")
        source = page.read_text(encoding="utf-8")
        canonical = re.search(r'<link\\b(?=[^>]*\\brel=["\']canonical["\'])[^>]*\\bhref=["\']([^"\']+)', source, re.I)
        if not canonical or canonical.group(1) != url:
            failures.append(f"canonical mismatch: {url}")
        robots = ",".join(meta_values(source, "robots") + meta_values(source, "googlebot") + meta_values(source, "bingbot"))
        if re.search(r"\\bnoindex\\b", robots, re.I):
            failures.append(f"noindex page listed in sitemap: {url}")
    approved = {row["canonical"] for row in rows if row.get("sitemap") == "yes" and row.get("eligibility") == "published"}
    if approved != set(urls):
        failures.append("sitemap URLs and approved coverage rows do not match exactly")
    if failures:
        print("Sitemap validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Sitemap validation passed: {len(urls)} unique canonical, indexable URLs; coverage inventory matches.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
