#!/usr/bin/env python3
"""Validate sitemap coverage, canonical URLs, and embedded JSON-LD."""

import json
import re
import sys
import csv
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent
BASE_URL = "https://www.kovcareeragency.org"
SITEMAP_NAMESPACE = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
PAGE_CATEGORIES = {"services", "markets", "roles", "industries", "resources"}
CATALOG_URL = f"{BASE_URL}/datasets/catalog.jsonld"


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


def validate_dataset_catalog(errors: list[str]) -> tuple[int, int, int]:
    datasets_dir = ROOT / "datasets"
    catalog_path = datasets_dir / "catalog.jsonld"
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"Dataset catalog is missing or invalid JSON-LD: {error}")
        return 0, 0, 0

    graph = catalog.get("@graph", [])
    nodes = {
        node.get("@id"): node
        for node in graph
        if isinstance(node, dict) and isinstance(node.get("@id"), str)
    }
    catalog_id = f"{CATALOG_URL}#catalog"
    if catalog.get("@context") != "https://schema.org":
        errors.append("Dataset catalog has an unexpected JSON-LD context.")
    catalog_type = nodes.get(catalog_id, {}).get("@type", [])
    if isinstance(catalog_type, str):
        catalog_type = [catalog_type]
    if "DataCatalog" not in catalog_type:
        errors.append("Dataset catalog DataCatalog node is missing.")
    catalog_datasets = {
        item.get("@id")
        for item in nodes.get(catalog_id, {}).get("dataset", [])
        if isinstance(item, dict)
    }
    expected_datasets = {
        f"{CATALOG_URL}#cities-and-towns",
        f"{CATALOG_URL}#job-titles",
        f"{CATALOG_URL}#occupations",
    }
    if catalog_datasets != expected_datasets:
        errors.append("DataCatalog dataset references do not match available datasets.")

    source_dir = ROOT / "town-role-insitutution"
    feeds = (
        ("job-titles", "job-titles.json", source_dir / "job-titles.txt"),
        ("occupations", "occupations.json", source_dir / "occupations.csv"),
    )
    counts = {}
    for identifier, filename, source_path in feeds:
        feed_path = datasets_dir / filename
        node_id = f"{CATALOG_URL}#{identifier}"
        try:
            feed = json.loads(feed_path.read_text(encoding="utf-8"))
            node = nodes[node_id]
            if source_path.suffix == ".txt":
                source_records = source_path.read_text(
                    encoding="utf-8-sig"
                ).splitlines()
            else:
                with source_path.open(
                    encoding="utf-8-sig", newline=""
                ) as stream:
                    source_records = [
                        row["Occupations"] for row in csv.DictReader(stream)
                    ]
            records = feed["records"]
        except (OSError, json.JSONDecodeError, KeyError, TypeError) as error:
            errors.append(f"{filename} or its catalog entry is invalid: {error}")
            continue
        if records != source_records:
            errors.append(f"{filename} does not preserve every source record in order.")
        if len(records) != len(set(records)):
            errors.append(f"{filename} contains duplicate records.")
        if feed.get("numberOfItems") != len(records):
            errors.append(f"{filename} has an incorrect numberOfItems value.")
        if node.get("numberOfItems") != len(records):
            errors.append(f"{identifier} catalog count does not match its feed.")
        distribution = node.get("distribution", {})
        if distribution.get("contentUrl") != f"{BASE_URL}/datasets/{filename}":
            errors.append(f"{identifier} dataset has an incorrect distribution URL.")
        counts[identifier] = len(records)

    city_path = source_dir / "town -cities" / "worldcities.csv"
    try:
        with city_path.open(encoding="utf-8-sig", newline="") as stream:
            city_rows = list(csv.DictReader(stream))
        city_ids = [row["id"] for row in city_rows]
    except (OSError, KeyError, csv.Error) as error:
        errors.append(f"City source could not be validated: {error}")
        city_rows, city_ids = [], []
    city_node = nodes.get(f"{CATALOG_URL}#cities-and-towns", {})
    if not city_rows or len(city_ids) != len(set(city_ids)):
        errors.append("City source is empty or has non-unique IDs.")
    if city_node.get("numberOfItems") != len(city_rows):
        errors.append("City catalog count does not match the supplied CSV.")
    if "distribution" in city_node:
        errors.append("Restricted city source must not have a public distribution.")
    if "prior written permission" not in city_node.get("description", "").lower():
        errors.append("City catalog does not explain the redistribution restriction.")

    return (
        len(city_rows),
        counts.get("job-titles", 0),
        counts.get("occupations", 0),
    )


def main() -> int:
    errors = []
    city_count, job_title_count, occupation_count = validate_dataset_catalog(errors)
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
    dataset_reference_count = 0
    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.netloc.lower() != "www.kovcareeragency.org":
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

        catalog_links = [
            tag for tag in links
            if re.search(r'\brel\s*=\s*(["\'])alternate\1', tag, re.I)
            and re.search(
                r'\btype\s*=\s*(["\'])application/ld\+json\1',
                tag,
                re.I,
            )
        ]
        if len(catalog_links) != 1 or attribute_values(
            catalog_links, "href"
        ) != [CATALOG_URL]:
            errors.append(f"{relative_path}: dataset catalog alternate link is missing.")

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
        page_has_dataset_reference = False
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
            page_node = next(
                (
                    node for node in nodes
                    if node.get("@id") == f"{url}#webpage"
                ),
                None,
            )
            mentions = page_node.get("mentions", {}) if page_node else {}
            if mentions.get("@id") == f"{CATALOG_URL}#catalog":
                page_has_dataset_reference = True
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
                if not {
                    "Organization",
                    "EmploymentAgency",
                    "ProfessionalService",
                }.intersection(organization_types):
                    errors.append(
                        f"{relative_path}: organization has no recognized business type."
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
            founder_names = {founder.get("name")} if founder else set()
            alternate_names = founder.get("alternateName", []) if founder else []
            if isinstance(alternate_names, str):
                alternate_names = [alternate_names]
            founder_names.update(alternate_names)
            if founder is None or "Adekunle Ayotoba Daniel" not in founder_names:
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

        if page_has_dataset_reference:
            dataset_reference_count += 1
        else:
            errors.append(
                f"{relative_path}: WebPage schema does not reference the data catalog."
            )

        if url not in llms:
            errors.append(f"{relative_path}: URL is missing from llms.txt.")

    if len(canonical_urls) != len(set(canonical_urls)):
        errors.append("Multiple sitemap pages share a canonical URL.")
    if cluster_count != 60:
        errors.append(f"Expected 60 generated landing pages; found {cluster_count}.")

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
                    "Site-search catalog does not match the 60 sitemap landing pages."
                )

    print(f"Sitemap URLs: {len(urls)}")
    print(f"Generated landing pages: {cluster_count}")
    print(f"Parsed JSON-LD blocks: {schema_count}")
    print(f"Search-indexed pages: {indexed_count}")
    print(
        "Dataset records verified: "
        f"{city_count:,} city/town source records (not distributed), "
        f"{job_title_count:,} job titles, {occupation_count:,} occupations"
    )
    print(f"Pages referencing dataset catalog: {dataset_reference_count}")
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
