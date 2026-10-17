#!/usr/bin/env python3
"""Validate sitemap coverage, canonical URLs, and embedded JSON-LD."""

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent
BASE_URL = "https://kovcareeragency.org"
SITEMAP_NAMESPACE = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
PAGE_CATEGORIES = {"services", "markets", "roles", "industries", "resources"}


def attribute_values(tags: list[str], attribute: str) -> list[str]:
    values = []
    for tag in tags:
        match = re.search(
            rf"\b{re.escape(attribute)}\s*=\s*([\"'])(.*?)\1",
            tag,
            re.I | re.S,
        )
        if match:
            values.append(match.group(2))
    return values


def main() -> int:
    errors = []
    sitemap_path = ROOT / "sitemap.xml"
    sitemap_root = ElementTree.parse(sitemap_path).getroot()
    urls = [
        (node.text or "").strip()
        for node in sitemap_root.findall("s:url/s:loc", SITEMAP_NAMESPACE)
    ]

    if not urls:
        errors.append("Sitemap contains no URL entries.")
    if len(urls) != len(set(urls)):
        errors.append("Sitemap contains duplicate URLs.")

    llms_path = ROOT / "llms.txt"
    llms = llms_path.read_text(encoding="utf-8") if llms_path.is_file() else ""
    search_index_path = ROOT / "assets" / "site-search-index.js"
    search_index = (
        search_index_path.read_text(encoding="utf-8")
        if search_index_path.is_file()
        else ""
    )
    robots_path = ROOT / "robots.txt"
    robots = robots_path.read_text(encoding="utf-8") if robots_path.is_file() else ""
    sitemap_directives = re.findall(r"(?im)^\s*Sitemap:\s*(\S+)\s*$", robots)
    if sitemap_directives != [f"{BASE_URL}/sitemap.xml"]:
        errors.append("robots.txt must contain exactly one sitemap.xml directive.")

    canonical_urls = []
    schema_count = 0
    cluster_count = 0
    sitemap_paths = set()
    indexed_count = 0
    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.netloc.lower() != "kovcareeragency.org":
            errors.append(f"Unexpected sitemap URL: {url}")
            continue

        relative_path = parsed.path.lstrip("/") or "index.html"
        sitemap_paths.add(relative_path)
        page_path = ROOT / relative_path
        if not page_path.is_file():
            errors.append(f"Sitemap URL has no local HTML file: {relative_path}")
            continue
        if relative_path.split("/", 1)[0] in PAGE_CATEGORIES:
            cluster_count += 1

        source = page_path.read_text(encoding="utf-8")
        links = re.findall(r"<link\b[^>]*>", source, re.I)
        canonicals = [
            tag for tag in links
            if re.search(r'\brel\s*=\s*(["\'])canonical\1', tag, re.I)
        ]
        canonical_values = attribute_values(canonicals, "href")
        if len(canonicals) != 1 or len(canonical_values) != 1:
            errors.append(f"{relative_path}: expected exactly one canonical link.")
        elif canonical_values[0] != url:
            errors.append(
                f"{relative_path}: canonical {canonical_values[0]} "
                f"does not match sitemap URL {url}."
            )
        else:
            canonical_urls.append(canonical_values[0])

        titles = re.findall(r"<title\b[^>]*>(.*?)</title>", source, re.I | re.S)
        if len(titles) != 1 or not titles[0].strip():
            errors.append(f"{relative_path}: expected exactly one non-empty title.")
        descriptions = [
            tag for tag in re.findall(r"<meta\b[^>]*>", source, re.I)
            if re.search(r'\bname\s*=\s*(["\'])description\1', tag, re.I)
        ]
        if len(descriptions) != 1 or not attribute_values(descriptions, "content"):
            errors.append(
                f"{relative_path}: expected exactly one meta description."
            )

        scripts = re.findall(
            r"<script\b(?=[^>]*\btype\s*=\s*([\"'])application/ld\+json\1)"
            r"[^>]*>(.*?)</script>",
            source,
            re.I | re.S,
        )
        if not scripts:
            errors.append(f"{relative_path}: no JSON-LD structured data.")
        for index, (_, block) in enumerate(scripts, start=1):
            try:
                schema = json.loads(block.strip())
                schema_count += 1
            except json.JSONDecodeError as error:
                errors.append(
                    f"{relative_path}: JSON-LD block {index} is invalid: {error}"
                )
                continue
            graph = schema.get("@graph", []) if isinstance(schema, dict) else []
            if not isinstance(schema, dict) or "@graph" not in schema:
                continue
            nodes = graph if isinstance(graph, list) else []
            organization = next(
                (
                    node for node in nodes
                    if node.get("@id") == f"{BASE_URL}/#organization"
                ),
                None,
            )
            if organization is None:
                errors.append(f"{relative_path}: organization entity is missing.")
            else:
                organization_types = organization.get("@type", [])
                if isinstance(organization_types, str):
                    organization_types = [organization_types]
                if not {"Organization", "ProfessionalService"}.issubset(
                    set(organization_types)
                ):
                    errors.append(
                        f"{relative_path}: organization must declare Organization "
                        "and ProfessionalService types."
                    )
                if organization.get("name") != "KOV Career Agency":
                    errors.append(
                        f"{relative_path}: organization name is not KOV Career Agency."
                    )
                if organization.get("founder", {}).get("@id") != f"{BASE_URL}/#founder":
                    errors.append(f"{relative_path}: organization founder link is missing.")
            founder = next(
                (
                    node for node in nodes
                    if node.get("@id") == f"{BASE_URL}/#founder"
                ),
                None,
            )
            if founder is None or founder.get("name") != "Adekunle Ayotoba Daniel":
                errors.append(
                    f"{relative_path}: founder is missing or has an incorrect full name."
                )
            for node in nodes:
                node_types = node.get("@type", [])
                if isinstance(node_types, str):
                    node_types = [node_types]
                if "FAQPage" in node_types and not node.get("mainEntity"):
                    errors.append(
                        f"{relative_path}: FAQPage schema has no visible Q&A entries."
                    )

        if url not in llms:
            errors.append(f"{relative_path}: URL is missing from llms.txt.")

    if len(canonical_urls) != len(set(canonical_urls)):
        errors.append("Multiple sitemap pages share a canonical URL.")
    content_marker = "window.kovSiteSearchContent = "
    catalog_marker = ";\nwindow.kovSeoPageCatalog = "
    if content_marker not in search_index or catalog_marker not in search_index:
        errors.append("Generated site-search index is missing its content or catalog.")
    else:
        content_text, catalog_text = search_index.split(catalog_marker, 1)
        try:
            indexed_content = json.loads(content_text.split(content_marker, 1)[1])
            catalog = json.loads(catalog_text.rsplit(";", 1)[0].strip())
        except json.JSONDecodeError as error:
            errors.append(f"Generated site-search index contains invalid JSON: {error}")
        else:
            indexed_count = len(indexed_content)
            missing_from_search = sitemap_paths - indexed_content.keys()
            if missing_from_search:
                errors.append(
                    "Pages missing from the site-search index: "
                    + ", ".join(sorted(missing_from_search))
                )
            catalog_paths = {
                path for path in sitemap_paths
                if path.split("/", 1)[0] in PAGE_CATEGORIES
            }
            indexed_catalog_paths = {entry.get("href") for entry in catalog}
            if indexed_catalog_paths != catalog_paths:
                errors.append(
                    "Site-search catalog does not match the generated sitemap landing pages."
                )

    print(f"Sitemap URLs: {len(urls)}")
    print(f"Generated landing pages: {cluster_count}")
    print(f"Parsed JSON-LD blocks: {schema_count}")
    print(f"Search-indexed pages: {indexed_count}")
    print(f"robots.txt sitemap directives: {len(sitemap_directives)}")
    if errors:
        print(f"VALIDATION FAILED ({len(errors)} issue(s))")
        for error in errors:
            print(f"- {error}")
        return 1
    print("VALIDATION PASSED: sitemap, canonical URLs, metadata, llms.txt, and JSON-LD are consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
