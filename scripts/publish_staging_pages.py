#!/usr/bin/env python3
"""Publish approved public staging guides and remove their noindex directives.

The manifest is generated from development/PAGE-COVERAGE.csv. Private account,
candidate-directory, operations, and admin/publishing surfaces are never selected.
"""
from __future__ import annotations

import csv
import html
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.kovcareeragency.org"
COVERAGE = ROOT / "development" / "PAGE-COVERAGE.csv"
SITEMAP = ROOT / "sitemap.xml"
LLMS = ROOT / "llms.txt"
LLMS_FULL = ROOT / "llms-full.txt"
MANIFEST = ROOT / "scripts" / "staging-public-pages.txt"
TODAY = "2026-11-17"
PRIVATE_PATHS = {
    "account.html",
    "profiles.html",
    "toba.html",
    "blogpostcheck.html",
    ".private_admin/blogpostcheck.html",
}

META_TAG = re.compile(r"<meta\b[^>]*>", re.I)
TITLE_TAG = re.compile(r"<title\b[^>]*>(.*?)</title\s*>", re.I | re.S)
DESC_TAG = re.compile(
    r'<meta\b(?=[^>]*\bname\s*=\s*["\']description["\'])[^>]*\bcontent\s*=\s*(["\'])(.*?)\1[^>]*>',
    re.I | re.S,
)

def canonical_for(path: str) -> str:
    if path.endswith("/index.html"):
        web_path = "/" + path[:-len("index.html")]
    elif path.endswith("index.html"):
        web_path = "/" + path[:-len("index.html")]
    else:
        web_path = "/" + path
    return BASE + quote(web_path, safe="/-._~")

def update_meta_tag(match: re.Match[str]) -> str:
    tag = match.group(0)
    name = re.search(r'\bname\s*=\s*(["\'])(robots|googlebot|bingbot)\1', tag, re.I)
    content = re.search(r'\bcontent\s*=\s*(["\'])(.*?)\1', tag, re.I | re.S)
    if not name or not content or "noindex" not in content.group(2).lower():
        return tag
    return tag[:content.start()] + 'content="index, follow"' + tag[content.end():]

def page_title(source: str, path: str) -> str:
    match = TITLE_TAG.search(source)
    return html.unescape(re.sub(r"\s+", " ", match.group(1)).strip()) if match else Path(path).stem

def page_description(source: str) -> str:
    match = DESC_TAG.search(source)
    return html.unescape(re.sub(r"\s+", " ", match.group(2)).strip()) if match else "Career research and professional guidance from KOV Career Agency."

def main() -> None:
    with COVERAGE.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        fields = reader.fieldnames
        rows = list(reader)
    if not fields:
        raise SystemExit("PAGE-COVERAGE.csv has no header")

    target_paths = [
        line.strip() for line in MANIFEST.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    rows_by_path = {row.get("path", ""): row for row in rows}
    targets = []
    for rel in target_paths:
        if not rel.startswith("staging/") or rel in PRIVATE_PATHS:
            raise SystemExit(f"Refusing non-public staging path: {rel}")
        if re.match(r"^staging/(?:professional-directory|research|templates|visual-assets)/", rel):
            raise SystemExit(f"Refusing private or non-indexable staging area: {rel}")
        row = rows_by_path.get(rel)
        if row is None:
            row = {field: "" for field in fields}
            row["path"] = rel
            rows.append(row)
            rows_by_path[rel] = row
        targets.append(row)

    if not targets:
        raise SystemExit("No staging noindex pages found; refusing an empty publication run")

    published = []
    for row in targets:
        rel = row["path"]
        file_path = ROOT / rel
        if not file_path.is_file():
            raise SystemExit(f"Missing staging page: {rel}")
        source = file_path.read_text(encoding="utf-8")
        updated = META_TAG.sub(update_meta_tag, source)
        if re.search(r'<meta\b(?=[^>]*\bname\s*=\s*["\'](?:robots|googlebot|bingbot)["\'])[^>]*\bcontent\s*=\s*["\'][^"\']*noindex', updated, re.I):
            raise SystemExit(f"noindex remains in {rel}")

        updated = updated.replace("KOV Staging Preview", "KOV Career Agency")
        updated = updated.replace("Staging Preview", "KOV Career Agency")
        updated = updated.replace("KOV Website Expansion | KOV Career Agency", "KOV Career Resources | KOV Career Agency")

        canonical = canonical_for(rel)
        canonical_tag = f'<link rel="canonical" href="{canonical}">'
        canonical_re = re.compile(r'<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>', re.I)
        if canonical_re.search(updated):
            updated = canonical_re.sub(canonical_tag, updated, count=1)
        else:
            updated, count = re.subn(r"</head\s*>", "  " + canonical_tag + "\n</head>", updated, count=1, flags=re.I)
            if count != 1:
                raise SystemExit(f"Could not insert canonical link in {rel}")

        file_path.write_text(updated, encoding="utf-8")
        title = page_title(updated, rel)
        description = page_description(updated)
        row["title"] = title
        row["sitemap"] = "yes"
        row["eligibility"] = "published"
        row["exclusion_reason"] = ""
        row["robots"] = "index,follow"
        row["canonical"] = canonical
        published.append((rel, canonical, title, description))

    with COVERAGE.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    MANIFEST.write_text("".join(rel + "\n" for rel, _, _, _ in published), encoding="utf-8")

    sitemap = SITEMAP.read_text(encoding="utf-8")
    sitemap = sitemap.replace(
        "Production sitemap: list only self-canonical, indexable pages. Exclude staging and pages marked noindex.",
        "Production sitemap: list canonical, indexable public pages. Private and noindex utility surfaces remain excluded."
    )
    additions = []
    for _, url, _, _ in published:
        if f"<loc>{url}</loc>" not in sitemap:
            additions.append(f"  <url><loc>{url}</loc><lastmod>{TODAY}</lastmod></url>")
    if additions:
        close = sitemap.rfind("</urlset>")
        if close < 0:
            raise SystemExit("sitemap.xml has no closing urlset element")
        sitemap = sitemap[:close] + "\n".join(additions) + "\n" + sitemap[close:]
        SITEMAP.write_text(sitemap, encoding="utf-8")

    llms = LLMS.read_text(encoding="utf-8")
    marker = "- [Public career research and occupation guides](https://www.kovcareeragency.org/staging/): Published research guides and occupation references."
    if marker not in llms:
        llms = llms.replace("## Complete discovery resources", "## Public research guides\n" + marker + "\n\n## Complete discovery resources")
    llms = llms.replace(
        "Only canonical, indexable production pages are listed in the sitemap and full page directory. Staging pages and pages explicitly marked noindex are intentionally excluded.",
        "The sitemap and full page directory include canonical, indexable public pages, including the published career research and occupation guides. Private account, candidate-directory, operations, administrator and publishing surfaces remain excluded."
    )
    LLMS.write_text(llms, encoding="utf-8")

    full = LLMS_FULL.read_text(encoding="utf-8")
    section = "\n\n## Public career research and occupation guides\n"
    lines = []
    for _, url, title, description in published:
        if f"]({url})" not in full:
            lines.append(f"- [{title}]({url}): {description}")
    if lines:
        if "## Public career research and occupation guides" not in full:
            full = full.rstrip() + section + "\n".join(lines) + "\n"
        else:
            full = full.rstrip() + "\n" + "\n".join(lines) + "\n"
        LLMS_FULL.write_text(full, encoding="utf-8")

    print(f"Published {len(published)} public staging pages.")
    print("Private account, candidate directory, operations console, and admin/publishing pages were not modified.")

if __name__ == "__main__":
    main()
