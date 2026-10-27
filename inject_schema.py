#!/usr/bin/env python3
"""Normalize crawl metadata and structured data for sitemap-listed pages."""

import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

BASE_URL = "https://www.kovcareeragency.org"
DATA_CATALOG_URL = f"{BASE_URL}/datasets/catalog.jsonld"
SITEMAP_NAMESPACE = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
SERVICE_CATEGORIES = {"services", "markets", "roles", "industries"}


def text_from_html(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def replace_attribute(tag: str, attribute: str, value: str) -> str:
    escaped = html.escape(value, quote=True)
    pattern = re.compile(rf'(\b{re.escape(attribute)}\s*=\s*)(["\']).*?\2', re.I | re.S)
    if pattern.search(tag):
        return pattern.sub(lambda match: f'{match.group(1)}"{escaped}"', tag, count=1)
    return tag[:-1].rstrip() + f' {attribute}="{escaped}">'


def upsert_link(source: str, rel: str, href: str) -> str:
    pattern = re.compile(r"<link\b[^>]*>", re.I)
    for match in pattern.finditer(source):
        tag = match.group(0)
        rel_match = re.search(r'\brel\s*=\s*(["\'])(.*?)\1', tag, re.I | re.S)
        if rel_match and rel_match.group(2).lower() == rel.lower():
            updated = replace_attribute(tag, "href", href)
            return source[:match.start()] + updated + source[match.end():]
    return re.sub(
        r"</head>",
        f'  <link rel="{html.escape(rel, quote=True)}" href="{html.escape(href, quote=True)}">\n</head>',
        source,
        count=1,
        flags=re.I,
    )


def upsert_catalog_link(source: str) -> str:
    for match in re.finditer(r"<link\b[^>]*>", source, re.I):
        tag = match.group(0)
        rel_match = re.search(r'\brel\s*=\s*(["\'])(.*?)\1', tag, re.I | re.S)
        type_match = re.search(r'\btype\s*=\s*(["\'])(.*?)\1', tag, re.I | re.S)
        if (
            rel_match
            and rel_match.group(2).lower() == "alternate"
            and type_match
            and type_match.group(2).lower() == "application/ld+json"
        ):
            updated = replace_attribute(tag, "href", DATA_CATALOG_URL)
            return source[:match.start()] + updated + source[match.end():]
    return re.sub(
        r"</head>",
        (
            '  <link rel="alternate" type="application/ld+json" '
            f'href="{DATA_CATALOG_URL}">\n</head>'
        ),
        source,
        count=1,
        flags=re.I,
    )


def upsert_meta(source: str, attribute: str, key: str, content: str) -> str:
    pattern = re.compile(r"<meta\b[^>]*>", re.I)
    for match in pattern.finditer(source):
        tag = match.group(0)
        key_match = re.search(rf'\b{re.escape(attribute)}\s*=\s*(["\'])(.*?)\1', tag, re.I | re.S)
        if key_match and key_match.group(2).lower() == key.lower():
            updated = replace_attribute(tag, "content", content)
            return source[:match.start()] + updated + source[match.end():]
    meta = (
        f'  <meta {attribute}="{html.escape(key, quote=True)}" '
        f'content="{html.escape(content, quote=True)}">\n'
    )
    return re.sub(r"</head>", f"{meta}</head>", source, count=1, flags=re.I)


def canonical_url(location: str) -> str:
    parsed = urlsplit(location)
    if parsed.scheme != "https" or parsed.netloc.lower() != "www.kovcareeragency.org":
        raise ValueError(f"Unexpected sitemap URL: {location}")
    return f"{BASE_URL}{parsed.path or '/'}"


def read_page_metadata(source: str, path: str) -> tuple[str, str]:
    title_match = re.search(r"<title\b[^>]*>(.*?)</title>", source, re.I | re.S)
    description_match = re.search(
        r'<meta\b(?=[^>]*\bname=["\']description["\'])(?=[^>]*\bcontent=["\'](.*?)["\'])[^>]*>',
        source,
        re.I | re.S,
    )
    if not title_match:
        raise ValueError(f"Missing page title: {path}")
    if not description_match:
        raise ValueError(f"Missing meta description: {path}")
    return text_from_html(title_match.group(1)), html.unescape(description_match.group(1))


def is_service_page(relative_path: str) -> bool:
    first_segment = relative_path.split("/", 1)[0]
    if first_segment in SERVICE_CATEGORIES:
        return True
    return relative_path in {
        "candidate-services.html",
        "company-services.html",
        "global-talent-sourcer.html",
    }


def extract_visible_faqs(source: str) -> list[dict[str, str]]:
    section_match = re.search(
        r"<section\b(?=[^>]*\bclass=[\"'][^\"']*\bseo-faq\b[^\"']*[\"'])[^>]*>"
        r"(.*?)</section>",
        source,
        re.I | re.S,
    )
    if not section_match:
        return []

    faqs = []
    for detail in re.finditer(
        r"<details\b[^>]*>(.*?)</details>", section_match.group(1), re.I | re.S
    ):
        summary = re.search(
            r"<summary\b[^>]*>(.*?)</summary>", detail.group(1), re.I | re.S
        )
        if not summary:
            continue
        answer = detail.group(1)[summary.end():]
        question_text = text_from_html(summary.group(1))
        answer_text = text_from_html(answer)
        if question_text and answer_text:
            faqs.append({"question": question_text, "answer": answer_text})
    return faqs


def page_schema(
    relative_path: str,
    page_url: str,
    title: str,
    description: str,
    faqs: list[dict[str, str]],
) -> dict:
    page_type = "WebPage"
    if relative_path == "about.html":
        page_type = "AboutPage"
    elif relative_path == "contact.html":
        page_type = "ContactPage"
    elif relative_path == "faqs.html" and faqs:
        page_type = "FAQPage"

    graph: list[dict] = [
        {
            "@type": ["Organization", "ProfessionalService", "EmploymentAgency"],
            "@id": f"{BASE_URL}/#organization",
            "name": "KOV Career Agency",
            "alternateName": ["KOV Career", "KovCareer"],
            "url": f"{BASE_URL}/",
            "logo": f"{BASE_URL}/kov-logo.png",
            "image": f"{BASE_URL}/preview.png",
            "email": "daniel@kovcareeragency.org",
            "description": (
                "Founder-led career agency offering private career representation "
                "for senior professionals and independent executive talent sourcing "
                "for companies. Engagement scope is agreed directly."
            ),
            "founder": {"@id": f"{BASE_URL}/#founder"},
        },
        {
            "@type": "Person",
            "@id": f"{BASE_URL}/#founder",
            "name": "Adekunle Ayotoba Daniel",
            "alternateName": "Daniel Ade",
            "jobTitle": "Founder and Principal Agent",
            "worksFor": {"@id": f"{BASE_URL}/#organization"},
        },
        {
            "@type": "WebSite",
            "@id": f"{BASE_URL}/#website",
            "url": f"{BASE_URL}/",
            "name": "KOV Career Agency",
            "publisher": {"@id": f"{BASE_URL}/#organization"},
            "inLanguage": "en",
        },
    ]

    page_node: dict = {
        "@type": page_type,
        "@id": f"{page_url}#webpage",
        "url": page_url,
        "name": title,
        "description": description,
        "inLanguage": "en",
        "isPartOf": {"@id": f"{BASE_URL}/#website"},
        "about": {"@id": f"{BASE_URL}/#organization"},
        "publisher": {"@id": f"{BASE_URL}/#organization"},
        "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
        "mentions": {"@id": f"{DATA_CATALOG_URL}#catalog"},
    }

    if page_type == "FAQPage":
        page_node["mainEntity"] = [
            {
                "@type": "Question",
                "name": faq["question"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq["answer"],
                },
            }
            for faq in faqs
        ]

    if is_service_page(relative_path):
        service = {
            "@type": "Service",
            "@id": f"{page_url}#service",
            "name": title,
            "description": description,
            "provider": {"@id": f"{BASE_URL}/#organization"},
            "mainEntityOfPage": {"@id": f"{page_url}#webpage"},
        }
        graph.append(service)
        page_node["mainEntity"] = {"@id": f"{page_url}#service"}

    graph.extend(
        [
            page_node,
            {
                "@type": "BreadcrumbList",
                "@id": f"{page_url}#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": f"{BASE_URL}/",
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": title,
                        "item": page_url,
                    },
                ],
            },
        ]
    )
    return {"@context": "https://schema.org", "@graph": graph}


def remove_owned_schema(source: str) -> str:
    pattern = re.compile(
        r"^[ \t]*<script\b(?=[^>]*\btype=[\"']application/ld\+json[\"'])"
        r"(?=[^>]*\bdata-kov=[\"'][^\"']+[\"'])[^>]*>.*?</script>[ \t]*(?:\r?\n)?",
        re.I | re.S | re.M,
    )
    return pattern.sub("", source)


def normalize_page(path: Path, relative_path: str, page_url: str, dry_run: bool) -> bool:
    source = path.read_text(encoding="utf-8")
    title, description = read_page_metadata(source, relative_path)
    faqs = extract_visible_faqs(source) if relative_path == "faqs.html" else []

    updated = upsert_link(source, "canonical", page_url)
    updated = upsert_catalog_link(updated)
    for key, value in (
        ("og:type", "website"),
        ("og:site_name", "KOV Career Agency"),
        ("og:url", page_url),
        ("og:title", title),
        ("og:description", description),
        ("og:image", f"{BASE_URL}/preview.png"),
        ("og:image:alt", "KOV Career Agency"),
        ("twitter:card", "summary_large_image"),
        ("twitter:title", title),
        ("twitter:description", description),
        ("twitter:image", f"{BASE_URL}/preview.png"),
    ):
        updated = upsert_meta(
            updated,
            "name" if key.startswith("twitter:") else "property",
            key,
            value,
        )
    updated = upsert_meta(updated, "name", "robots", "index,follow")
    updated = remove_owned_schema(updated)
    block = json.dumps(
        page_schema(relative_path, page_url, title, description, faqs),
        ensure_ascii=False,
        indent=2,
    )
    script = f'  <script type="application/ld+json" data-kov="discovery">\n{block}\n  </script>\n'
    if not re.search(r"</head>", updated, re.I):
        raise ValueError(f"Missing </head> in {relative_path}")
    updated = re.sub(r"</head>", f"{script}</head>", updated, count=1, flags=re.I)
    if updated != source and not dry_run:
        path.write_text(updated, encoding="utf-8")
    return updated != source


def sitemap_pages(root: Path) -> list[tuple[Path, str, str]]:
    sitemap = root / "sitemap.xml"
    if not sitemap.is_file():
        raise FileNotFoundError(f"Sitemap does not exist: {sitemap}")
    sitemap_root = ElementTree.parse(sitemap).getroot()
    pages = []
    for location in sitemap_root.findall("s:url/s:loc", SITEMAP_NAMESPACE):
        page_url = canonical_url(location.text or "")
        relative_path = urlsplit(page_url).path.lstrip("/") or "index.html"
        path = root / relative_path
        if not path.is_file():
            raise FileNotFoundError(f"Sitemap page is missing: {relative_path}")
        pages.append((path, relative_path, page_url))
    if not pages:
        raise ValueError("Sitemap contains no page URLs.")
    return pages


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Normalize metadata and structured data for sitemap pages."
    )
    parser.add_argument("path", nargs="?", default=".")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    root = Path(args.path).resolve()
    pages = sitemap_pages(root)
    changed = sum(
        normalize_page(path, relative_path, page_url, args.dry_run)
        for path, relative_path, page_url in pages
    )
    operation = "Would update" if args.dry_run else "Updated"
    print(f"{operation} metadata/schema on {changed} of {len(pages)} sitemap pages.")


if __name__ == "__main__":
    main()
