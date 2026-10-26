#!/usr/bin/env python3
"""Validate sitemap coverage, canonical URLs, and embedded JSON-LD."""

import argparse
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent
BASE_URL = "https://www.kovcareeragency.org"
SITEMAP_NAMESPACE = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
PAGE_CATEGORIES = {"services", "markets", "roles", "industries", "resources"}
ENTITY_DATASET_URL = (
    f"{BASE_URL}/data/seo-entity-datasets.jsonld"
)
ENTITY_DATASET_MINIMUMS = {
    "cities": ("Place", 1000),
    "towns": ("Place", 1323),
    "professional-roles": ("Occupation", 1095),
    "institutions": ("Organization", 486),
    "job-functions": ("DefinedTerm", 200),
}


class VisitorTextParser(HTMLParser):
    """Collect visitor-facing text and common visible attributes, excluding code."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skipped_depth = 0
        self.values: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if self.skipped_depth:
            if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
                self.skipped_depth += 1
            return
        if tag in {"script", "style", "noscript", "template"}:
            self.skipped_depth = 1
            return
        for name in ("alt", "aria-label", "content", "placeholder", "title", "value"):
            value = attributes.get(name)
            if value:
                self.values.append(value)

    def handle_endtag(self, tag: str) -> None:
        if self.skipped_depth:
            self.skipped_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.skipped_depth:
            self.values.append(data)


def find_internal_note_errors(urls: list[str]) -> tuple[list[str], int]:
    config_path = ROOT / "config" / "internal-note-phrases.json"
    if not config_path.is_file():
        return ["Internal-note phrase configuration is missing."], 0
    config = json.loads(config_path.read_text(encoding="utf-8"))
    phrases = [
        re.sub(r"\s+", " ", phrase).strip().casefold()
        for phrase in config.get("phrases", [])
        if isinstance(phrase, str) and phrase.strip()
    ]
    errors = []
    scanned = 0
    for url in urls:
        parsed = urlsplit(url)
        relative_path = parsed.path.lstrip("/") or "index.html"
        if relative_path.endswith("/"):
            relative_path += "index.html"
        path = ROOT / relative_path
        if not path.is_file():
            continue
        scanned += 1
        try:
            source = path.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError as error:
            errors.append(f"{relative_path}: HTML is not valid UTF-8: {error}")
            continue
        parser = VisitorTextParser()
        parser.feed(source)
        visitor_text = re.sub(r"\s+", " ", " ".join(parser.values)).casefold()
        for phrase in phrases:
            if phrase in visitor_text:
                errors.append(
                    f"{relative_path}: internal-note phrase found: {phrase}"
                )
    return errors, scanned


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


def validate_entity_catalog(errors: list[str]) -> bool:
    catalog_path = ROOT / "data" / "seo-entity-datasets.jsonld"
    if not catalog_path.is_file():
        errors.append("Shared SEO entity JSON-LD catalog is missing.")
        return False
    try:
        schema = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"Shared SEO entity JSON-LD catalog is invalid: {error}")
        return False
    graph = schema.get("@graph") if isinstance(schema, dict) else None
    if (
        not isinstance(schema, dict)
        or schema.get("@context") != "https://schema.org"
        or not isinstance(graph, list)
    ):
        errors.append("Shared SEO entity catalog must be a Schema.org JSON-LD graph.")
        return False
    nodes_by_id = {}
    for node in graph:
        if not isinstance(node, dict) or not isinstance(node.get("@id"), str):
            errors.append("Shared SEO entity catalog has a graph node without a stable @id.")
            continue
        if node["@id"] in nodes_by_id:
            errors.append(f"Shared SEO entity catalog duplicates @id {node['@id']}.")
        nodes_by_id[node["@id"]] = node

    catalog = nodes_by_id.get(f"{ENTITY_DATASET_URL}#catalog")
    if not catalog or catalog.get("@type") != "DataCatalog":
        errors.append("Shared SEO entity catalog has no DataCatalog root.")
    else:
        expected_dataset_ids = {
            f"{ENTITY_DATASET_URL}#{dataset_id}"
            for dataset_id in ENTITY_DATASET_MINIMUMS
        }
        catalog_dataset_ids = {
            item.get("@id") for item in catalog.get("hasPart", [])
            if isinstance(item, dict)
        }
        if catalog_dataset_ids != expected_dataset_ids:
            errors.append("DataCatalog does not reference exactly the shared datasets.")
    for dataset_id, (entity_type, minimum) in ENTITY_DATASET_MINIMUMS.items():
        dataset = nodes_by_id.get(f"{ENTITY_DATASET_URL}#{dataset_id}")
        if not dataset or dataset.get("@type") != "Dataset":
            errors.append(f"Shared SEO entity catalog is missing dataset {dataset_id}.")
            continue
        records = dataset.get("about")
        if not isinstance(records, list):
            errors.append(f"{dataset_id} does not reference its complete records.")
            continue
        record_ids = [
            item.get("@id") for item in records
            if isinstance(item, dict) and isinstance(item.get("@id"), str)
        ]
        if len(record_ids) != len(records) or len(record_ids) < minimum:
            errors.append(
                f"{dataset_id} has {len(record_ids)} referenced records; expected at least {minimum}."
            )
        if len(record_ids) != len(set(record_ids)):
            errors.append(f"{dataset_id} contains duplicate record references.")
        if dataset.get("numberOfItems") != len(record_ids):
            errors.append(f"{dataset_id} numberOfItems does not match its references.")
        if not dataset.get("license") or not dataset.get("citation") or not dataset.get("creator"):
            errors.append(f"{dataset_id} is missing a source citation, credit, or license.")
        labels = []
        for record_id in record_ids:
            entity = nodes_by_id.get(record_id)
            if not entity:
                errors.append(f"{dataset_id} references missing entity {record_id}.")
                continue
            if entity.get("@type") != entity_type:
                errors.append(f"{dataset_id} entity {record_id} has the wrong Schema.org type.")
            name = entity.get("name")
            if not isinstance(name, str) or not name.strip():
                errors.append(f"{dataset_id} entity {record_id} has no name.")
                continue
            labels.append(
                unicodedata.normalize("NFKC", re.sub(r"\s+", " ", name).strip()).casefold()
            )
        if dataset_id in {"professional-roles", "institutions", "job-functions"}:
            if len(labels) != len(set(labels)):
                errors.append(f"{dataset_id} contains duplicate normalized names.")
        print(f"Shared {dataset_id} dataset: {len(record_ids)} records.")
    return True


def validate_entity_dataset_pages(errors: list[str]) -> int:
    sitemap_path = ROOT / "sitemap.xml"
    try:
        sitemap_root = ElementTree.parse(sitemap_path).getroot()
    except (OSError, ElementTree.ParseError) as error:
        errors.append(f"Cannot read sitemap for dataset-page validation: {error}")
        return 0
    urls = [
        (node.text or "").strip()
        for node in sitemap_root.findall("s:url/s:loc", SITEMAP_NAMESPACE)
    ]
    checked = 0
    for url in urls:
        parsed = urlsplit(url)
        relative_path = parsed.path.lstrip("/") or "index.html"
        if relative_path.endswith("/"):
            relative_path += "index.html"
        if relative_path.split("/", 1)[0] not in PAGE_CATEGORIES:
            continue
        page_path = ROOT / relative_path
        if not page_path.is_file():
            errors.append(f"{relative_path}: sitemap SEO page is missing.")
            continue
        checked += 1
        source = page_path.read_text(encoding="utf-8")
        scripts = re.findall(
            r"<script\b(?=[^>]*\btype\s*=\s*([\"'])application/ld\+json\1)"
            r"[^>]*>(.*?)</script>",
            source,
            re.I | re.S,
        )
        page_dataset_counts: dict[str, int] = {}
        for index, (_, block) in enumerate(scripts, start=1):
            try:
                schema = json.loads(block.strip())
            except json.JSONDecodeError as error:
                errors.append(
                    f"{relative_path}: JSON-LD block {index} is invalid: {error}"
                )
                continue
            graph = schema.get("@graph", []) if isinstance(schema, dict) else []
            if not isinstance(graph, list):
                continue
            for node in graph:
                if not isinstance(node, dict):
                    continue
                node_id = node.get("@id")
                if node_id in {
                    f"{ENTITY_DATASET_URL}#{dataset_id}"
                    for dataset_id in ENTITY_DATASET_MINIMUMS
                }:
                    page_dataset_counts[node_id] = page_dataset_counts.get(node_id, 0) + 1
                    if node.get("@type") != "Dataset" or node.get("url") != node_id:
                        errors.append(
                            f"{relative_path}: invalid shared dataset reference {node_id}."
                        )
        expected = {
            f"{ENTITY_DATASET_URL}#{dataset_id}"
            for dataset_id in ENTITY_DATASET_MINIMUMS
        }
        missing = expected - page_dataset_counts.keys()
        if missing:
            errors.append(
                f"{relative_path}: missing shared datasets: "
                + ", ".join(sorted(missing))
            )
        duplicates = sorted(
            dataset_id
            for dataset_id, count in page_dataset_counts.items()
            if count != 1
        )
        if duplicates:
            errors.append(
                f"{relative_path}: duplicate shared dataset references: "
                + ", ".join(duplicates)
            )
    print(f"SEO pages checked for all shared dataset references: {checked}")
    return checked


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--entity-datasets-only",
        action="store_true",
        help="validate the shared catalog and its references on generated SEO pages",
    )
    args = parser.parse_args()
    if args.entity_datasets_only:
        errors: list[str] = []
        validate_entity_catalog(errors)
        validate_entity_dataset_pages(errors)
        if errors:
            print(f"VALIDATION FAILED ({len(errors)} issue(s))")
            for error in errors:
                print(f"- {error}")
            return 1
        print("VALIDATION PASSED: full shared datasets and all generated SEO-page references.")
        return 0

    errors = []
    validate_entity_catalog(errors)
    sitemap_path = ROOT / "sitemap.xml"
    sitemap_root = ElementTree.parse(sitemap_path).getroot()
    urls = [
        (node.text or "").strip()
        for node in sitemap_root.findall("s:url/s:loc", SITEMAP_NAMESPACE)
    ]
    note_errors, html_count = find_internal_note_errors(urls)
    errors.extend(note_errors)

    if not urls:
        errors.append("Sitemap contains no URL entries.")
    if len(urls) != len(set(urls)):
        errors.append("Sitemap contains duplicate URLs.")

    llms_path = ROOT / "llms.txt"
    llms = llms_path.read_text(encoding="utf-8") if llms_path.is_file() else ""
    llms_full_path = ROOT / "llms-full.txt"
    if not llms_full_path.is_file():
        errors.append("llms-full.txt is missing.")
    if f"{BASE_URL}/llms-full.txt" not in llms:
        errors.append("llms.txt must link to llms-full.txt.")
    llms_urls = re.findall(r"https://www\.kovcareeragency\.org/([^\s)>]+)", llms)
    for path in llms_urls:
        path = path.rstrip(".,;")
        if (
            path.endswith("-occupations.html")
            or (
                path.startswith("industries/")
                and path not in {"industries/", "industries/index.html"}
                and not re.fullmatch(r"industries/[^/]+/", path)
            )
        ):
            errors.append(f"Unpublished taxonomy page in llms.txt: {path}")
    search_index_path = ROOT / "assets" / "site-search-index.js"
    search_index = (
        search_index_path.read_text(encoding="utf-8")
        if search_index_path.is_file()
        else ""
    )
    search_content_path = ROOT / "assets" / "site-search-content.js"
    search_content = (
        search_content_path.read_text(encoding="utf-8")
        if search_content_path.is_file()
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
        if parsed.scheme != "https" or parsed.netloc.lower() != "www.kovcareeragency.org":
            errors.append(f"Unexpected sitemap URL: {url}")
            continue

        relative_path = parsed.path.lstrip("/") or "index.html"
        if relative_path.endswith("/"):
            relative_path = f"{relative_path}index.html"
        if relative_path.startswith("industries/") and not re.fullmatch(
            r"industries/(?:index\.html|[^/]+/index\.html)", relative_path
        ):
            errors.append(
                f"Unapproved industry-directory page in sitemap: {relative_path}"
            )
        if relative_path.endswith("-occupations.html"):
            errors.append(f"SOC group page in sitemap: {relative_path}")
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
        has_organization = False
        has_founder = False
        has_organization_founder_link = False
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
            if relative_path.split("/", 1)[0] in PAGE_CATEGORIES:
                node_ids = {
                    node.get("@id"): node for node in nodes if isinstance(node, dict)
                }
                for dataset_id in ENTITY_DATASET_MINIMUMS:
                    reference = node_ids.get(f"{ENTITY_DATASET_URL}#{dataset_id}")
                    if not reference or reference.get("@type") != "Dataset":
                        errors.append(
                            f"{relative_path}: JSON-LD is missing shared dataset reference {dataset_id}."
                        )
                    elif reference.get("url") != f"{ENTITY_DATASET_URL}#{dataset_id}":
                        errors.append(
                            f"{relative_path}: {dataset_id} does not link to the shared full dataset."
                        )
            organization = next(
                (
                    node for node in nodes
                    if node.get("@id") == f"{BASE_URL}/#organization"
                ),
                None,
            )
            if organization is not None:
                has_organization = True
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
                has_organization_founder_link |= (
                    organization.get("founder", {}).get("@id")
                    == f"{BASE_URL}/#founder"
                )
            founder = next(
                (
                    node for node in nodes
                    if node.get("@id") == f"{BASE_URL}/#founder"
                ),
                None,
            )
            if founder is not None:
                has_founder = True
                founder_names = {founder.get("name")}
                alternate_names = founder.get("alternateName", [])
                if isinstance(alternate_names, str):
                    alternate_names = [alternate_names]
                founder_names.update(alternate_names)
            else:
                founder_names = set()
            if founder is not None and "Adekunle Ayotoba Daniel" not in founder_names:
                errors.append(
                    f"{relative_path}: founder has an incorrect full name."
                )
            for node in nodes:
                node_types = node.get("@type", [])
                if isinstance(node_types, str):
                    node_types = [node_types]
                if "FAQPage" in node_types and not node.get("mainEntity"):
                    errors.append(
                        f"{relative_path}: FAQPage schema has no visible Q&A entries."
                    )

        if not has_organization:
            errors.append(f"{relative_path}: organization entity is missing.")
        if not has_founder:
            errors.append(f"{relative_path}: founder entity is missing.")
        if has_organization and not has_organization_founder_link:
            errors.append(f"{relative_path}: organization founder link is missing.")
        if url not in llms:
            errors.append(f"{relative_path}: URL is missing from llms.txt.")

    if len(canonical_urls) != len(set(canonical_urls)):
        errors.append("Multiple sitemap pages share a canonical URL.")
    content_marker = "window.kovSiteSearchContent = "
    catalog_marker = "window.kovSeoPageCatalog = "
    if content_marker not in search_content or catalog_marker not in search_index:
        errors.append("Generated site-search data is missing its content or catalog.")
    else:
        try:
            indexed_content = json.loads(
                search_content.split(content_marker, 1)[1].rsplit(";", 1)[0].strip()
            )
            catalog = json.loads(
                search_index.split(catalog_marker, 1)[1].rsplit(";", 1)[0].strip()
            )
        except json.JSONDecodeError as error:
            errors.append(f"Generated site-search index contains invalid JSON: {error}")
        else:
            indexed_count = len(indexed_content)
            missing_from_search = sitemap_paths - indexed_content.keys()
            extra_search_paths = indexed_content.keys() - sitemap_paths
            if missing_from_search:
                errors.append(
                    "Pages missing from the site-search index: "
                    + ", ".join(sorted(missing_from_search))
                )
            if extra_search_paths:
                errors.append(
                    "Pages outside the sitemap are in the site-search index: "
                    + ", ".join(sorted(extra_search_paths))
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
    print(f"Sitemap HTML pages checked for internal notes: {html_count}")
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
