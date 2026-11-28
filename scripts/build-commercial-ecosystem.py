#!/usr/bin/env python3
"""Add static, context-aware links between KOV's existing public pages.

The builder changes only the Cloudflare Pages staging directory. It does not
rewrite source HTML, canonicals, robots directives, titles, descriptions or
structured-data source files. Routes must already exist in the public sitemap.
"""
from __future__ import annotations

import argparse
import csv
import html
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin, urlsplit

BASE_URL = "https://www.kovcareeragency.org"
MARKER = 'data-kov-ecosystem="v1"'
STYLE_MARKER = 'data-kov-ecosystem-style'
SERVICE_URLS = {
    "representation": "/services.html",
    "positioning": "/career-positioning-optimization.html",
    "resume": "/resume-cv-writing.html",
    "linkedin": "/linkedin-profile-optimization.html",
    "documents": "/career-documents.html",
    "portfolio": "/career-portfolio-development.html",
    "website": "/personal-career-website.html",
    "coaching": "/career-coaching.html",
}
SERVICE_COPY = {
    "/services.html": ("Private Career Representation",
        "For a focused, candidate-side search with agreed research, positioning and approved outreach."),
    "/career-positioning-optimization.html": ("Career Positioning & Optimization",
        "For clarifying target roles, transferable evidence, positioning gaps and practical next steps."),
    "/resume-cv-writing.html": ("Resume and CV Services",
        "For a clearer, accurate career document aligned with the roles you intend to pursue."),
    "/linkedin-profile-optimization.html": ("LinkedIn Profile Optimization",
        "For a coherent professional profile that reflects your verified experience and direction."),
    "/career-documents.html": ("Career Documents",
        "For a defined biography, leadership summary, cover letter or other agreed professional document."),
    "/career-portfolio-development.html": ("Career Portfolio Development",
        "For organizing selected projects and evidence so readers can understand your contribution."),
    "/personal-career-website.html": ("Personal Career Website",
        "For a professional online destination built around your audience, content and agreed scope."),
    "/career-coaching.html": ("Career Coaching",
        "For structured preparation around a career decision, transition, interview or offer discussion."),
}
FAMILY_COPY = {
    "Role/occupation subject": (
        "Continue exploring this career path",
        "Connect the role with its industry context and the type of career support that may help with your next decision."
    ),
    "Industry subject": (
        "Explore the roles and decisions within this sector",
        "Move between sector context, relevant leadership roles and the career support that fits the work you are considering."
    ),
    "Geography/market subject": (
        "Connect market research to your next move",
        "Compare relevant markets and review how a focused, candidate-side search can be scoped around your location priorities."
    ),
    "Career resource/research": (
        "Put this guidance into context",
        "Continue into the relevant topic collection or the specific service that addresses the career task discussed here."
    ),
    "FAQ": (
        "Explore the practical next step",
        "Move from an answer to the service or reference material that is most relevant to the question you are working through."
    ),
    "Directory/reference subject": (
        "Keep exploring the KOV professional library",
        "Use the related category and reference routes to continue your lookup without leaving the subject area."
    ),
    "Individual service": (
        "See how this service fits the wider offer",
        "Individual Career Services can be requested separately; managed representation is a distinct engagement with its own agreed scope."
    ),
    "Managed/specialist service": (
        "See how this work fits into KOV representation",
        "Specialist pages explain a particular part of the work and lead back to the main service and agreed engagement process."
    ),
}

def norm_route(value: str) -> str:
    route = urlsplit(value).path or "/"
    if not route.startswith("/"):
        route = "/" + route
    if route != "/" and not route.lower().endswith(".html") and not route.endswith("/"):
        route += "/"
    return route

def load_sitemap(path: Path) -> set[str]:
    root = ET.parse(path).getroot()
    routes = set()
    for node in root.iter():
        if node.tag.rsplit("}", 1)[-1] == "loc" and node.text:
            routes.add(norm_route(node.text.strip()))
    if not routes:
        raise SystemExit("The sitemap contained no public URLs.")
    return routes

def load_page_map(path: Path) -> dict[str, dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = csv.DictReader(handle)
        result = {}
        for row in rows:
            canonical = row.get("canonical", "").strip()
            file_path = row.get("path", "").strip().replace("\\", "/").lstrip("/")
            if not canonical or not file_path:
                continue
            route = norm_route(canonical)
            result[route] = {key: (value or "").strip() for key, value in row.items()}
            result[route]["_file_path"] = file_path
        return result

def service_for(row: dict[str, str]) -> str | None:
    text = " ".join((row.get("path", ""), row.get("title", ""),
                     row.get("customer_need_to_answer", ""))).lower()
    rules = [
        (r"linkedin", SERVICE_URLS["linkedin"]),
        (r"resume|\bcv\b|curriculum vitae", SERVICE_URLS["resume"]),
        (r"portfolio|work sample|case stud", SERVICE_URLS["portfolio"]),
        (r"personal career website|professional website|career website", SERVICE_URLS["website"]),
        (r"interview|offer|negotiat|coaching", SERVICE_URLS["coaching"]),
        (r"biograph|cover letter|leadership summary|career document", SERVICE_URLS["documents"]),
        (r"transition|positioning|transferable|career direction|role change", SERVICE_URLS["positioning"]),
    ]
    for pattern, route in rules:
        if re.search(pattern, text):
            return route
    family = row.get("page_family", "")
    if family in {"Role/occupation subject", "Industry subject", "Geography/market subject",
                  "Managed/specialist service"}:
        return SERVICE_URLS["representation"]
    return None

def file_for_route(route: str, pages: dict[str, dict[str, str]], output_root: Path) -> Path | None:
    row = pages.get(route)
    if not row:
        return None
    candidate = (output_root / row["_file_path"]).resolve()
    try:
        candidate.relative_to(output_root.resolve())
    except ValueError:
        return None
    return candidate if candidate.is_file() else None

def title_for(route: str, pages: dict[str, dict[str, str]]) -> str:
    row = pages.get(route, {})
    title = row.get("title", "").strip()
    if title:
        return re.sub(r"\s*\|\s*KOV.*$", "", title).replace("&amp;", "&")
    return route.rstrip("/").split("/")[-1].replace("-", " ").replace(".html", "").title()

def existing_body_routes(main_html: str, current_route: str) -> set[str]:
    found = set()
    base = urljoin(BASE_URL, current_route)
    for href in re.findall(r"""\bhref\s*=\s*["']([^"'#]+)(?:#[^"']*)?["']""", main_html, flags=re.I):
        absolute = urljoin(base, html.unescape(href.strip()))
        parsed = urlsplit(absolute)
        if parsed.netloc and parsed.netloc not in {"www.kovcareeragency.org", "kovcareeragency.org"}:
            continue
        if parsed.path:
            found.add(norm_route(parsed.path))
    return found

def parent_route(route: str) -> str | None:
    parts = [part for part in route.strip("/").split("/") if part]
    if len(parts) < 2:
        return None
    return "/" + "/".join(parts[:-1]) + "/"

def candidate_links(route: str, row: dict[str, str], pages: dict[str, dict[str, str]],
                    public_routes: set[str]) -> list[tuple[str, str]]:
    family = row.get("page_family", "")
    links: list[tuple[str, str]] = []

    def add(target: str | None, description: str) -> None:
        if not target:
            return
        target = norm_route(target)
        if target == route or target not in public_routes or target not in pages:
            return
        if any(existing == target for existing, _ in links):
            return
        links.append((target, description))

    if family == "Role/occupation subject":
        parts = [p for p in route.strip("/").split("/") if p]
        if len(parts) >= 3 and parts[0] == "roles":
            role_hub = "/" + parts[0] + "/" + parts[1] + "/"
            industry_slug = parts[-1].replace(".html", "")
            add(role_hub, "Return to the broader role guide and compare the mandate, evidence and career questions for this position.")
            add("/industries/" + industry_slug + "/", "Review the operating context and related career paths within this industry.")
        elif len(parts) >= 2 and parts[0] == "roles":
            prefix = route.rstrip("/") + "/"
            pair_routes = sorted(x for x in public_routes if x.startswith(prefix) and x.endswith(".html"))
            for pair in pair_routes[:2]:
                add(pair, "Compare how this role is discussed in a specific industry context.")
        add(SERVICE_URLS["positioning"], SERVICE_COPY[SERVICE_URLS["positioning"]][1])
        add(SERVICE_URLS["representation"], SERVICE_COPY[SERVICE_URLS["representation"]][1])

    elif family == "Industry subject":
        parts = [p for p in route.strip("/").split("/") if p]
        if len(parts) >= 2 and parts[0] == "industries":
            industry_slug = parts[1]
            add("/industries/", "Browse the wider industry library and compare sector contexts.")
            pair_routes = sorted(x for x in public_routes if x.startswith("/roles/") and x.endswith("/" + industry_slug + ".html"))
            for pair in pair_routes[:2]:
                add(pair, "Explore a leadership role in this industry.")
        add(SERVICE_URLS["positioning"], SERVICE_COPY[SERVICE_URLS["positioning"]][1])

    elif family == "Geography/market subject":
        add("/countries-we-serve.html", "Browse the country and market reference pages.")
        lowered = (route + " " + row.get("title", "")).lower()
        if "dubai" in lowered:
            add("/markets/executive-job-search-uae.html", "Compare Dubai with the wider UAE search context.")
        elif "uae" in lowered or "united arab emirates" in lowered:
            add("/markets/executive-job-search-dubai.html", "Review the Dubai-specific market context.")
        elif "saudi" in lowered:
            add("/markets/executive-career-support-saudi-arabia.html", "Review the Saudi Arabia market page and its scope considerations.")
        add(SERVICE_URLS["representation"], SERVICE_COPY[SERVICE_URLS["representation"]][1])

    elif family == "Career resource/research":
        parent = parent_route(route)
        if parent and parent.startswith("/directory/"):
            add(parent, "Return to the related resource collection and explore the surrounding topics.")
        elif parent and parent.startswith("/resources/"):
            add(parent, "Browse the related resource collection.")
        service = service_for(row)
        if service:
            add(service, SERVICE_COPY[service][1])
        if "/roles/" in route or "executive" in row.get("title", "").lower():
            role_routes = sorted(x for x in public_routes if x.startswith("/roles/") and x.count("/") == 3 and x.endswith("/"))
            for target in role_routes[:1]:
                add(target, "Explore role-focused guidance relevant to a senior career decision.")

    elif family == "FAQ":
        add("/faq/index.html", "Browse the wider question library.")
        service = service_for(row)
        if service:
            add(service, SERVICE_COPY[service][1])
        else:
            add("/services.html", SERVICE_COPY["/services.html"][1])

    elif family == "Directory/reference subject":
        parent = parent_route(route)
        if parent and parent.startswith("/directory/"):
            add(parent, "Return to the parent collection and browse related reference material.")
        add("/directory/", "Open the KOV professional library index.")
        add("/site-directory.html", "Use the full site directory to find another topic.")

    elif family == "Individual service":
        add("/candidate-services.html", "Compare this service with the other standalone career services.")
        add("/services.html", "Understand the separate managed representation service.")
        service = service_for(row)
        if service and service != route:
            add(service, SERVICE_COPY[service][1])

    elif family == "Managed/specialist service":
        add("/services.html", "Return to the main Private Career Representation service and its agreed scope.")
        add("/how-it-works.html", "Review the stages, approvals and responsibilities in the representation process.")
        service = service_for(row)
        if service and service != SERVICE_URLS["representation"]:
            add(service, SERVICE_COPY[service][1])

    return links[:3]

def build_section(route: str, row: dict[str, str], links: list[tuple[str, str]],
                  pages: dict[str, dict[str, str]]) -> str:
    family = row.get("page_family", "")
    heading, intro = FAMILY_COPY.get(family, ("Related KOV pages", "Continue with related career information and services."))
    cards = []
    for target, description in links:
        label = title_for(target, pages)
        cards.append(
            '<li class="kov-ecosystem-card">'
            '<a class="kov-ecosystem-card__link" href="' + html.escape(target, quote=True) + '">'
            '<span class="kov-ecosystem-card__title">' + html.escape(label) + '</span>'
            '<span class="kov-ecosystem-card__description">' + html.escape(description) + '</span>'
            '<span class="kov-ecosystem-card__action">Explore this page</span>'
            '</a></li>'
        )
    return (
        '<section class="kov-ecosystem-journey" ' + MARKER + ' aria-labelledby="kov-ecosystem-title">'
        '<div class="kov-ecosystem-journey__intro">'
        '<p class="kov-ecosystem-journey__eyebrow">RELATED CAREER PATHWAYS</p>'
        '<h2 id="kov-ecosystem-title">' + html.escape(heading) + '</h2>'
        '<p>' + html.escape(intro) + '</p>'
        '</div><nav aria-label="Related career pathways"><ul class="kov-ecosystem-journey__grid">'
        + "".join(cards) +
        '</ul></nav></section>'
    )

def inject_style(html_doc: str) -> str:
    if STYLE_MARKER in html_doc:
        html_doc = re.sub(r'\s*<link\b[^>]*' + STYLE_MARKER + r'[^>]*>', '', html_doc, flags=re.I)
    if re.search(r"</head\s*>", html_doc, flags=re.I):
        link = '<link rel="stylesheet" href="/css/kov-commercial-ecosystem.css?v=1" ' + STYLE_MARKER + '>'
        return re.sub(r"</head\s*>", link + "\\n</head>", html_doc, count=1, flags=re.I)
    return html_doc

def inject_section(html_doc: str, section: str) -> str:
    pattern = re.compile(r'<section\b[^>]*' + MARKER + r'[^>]*>.*?</section>', flags=re.I | re.S)
    html_doc = pattern.sub("", html_doc)
    match = list(re.finditer(r"</main\s*>", html_doc, flags=re.I))
    if match:
        position = match[-1].start()
        return html_doc[:position] + section + "\\n" + html_doc[position:]
    match = list(re.finditer(r"<footer\b", html_doc, flags=re.I))
    if match:
        position = match[0].start()
        return html_doc[:position] + section + "\\n" + html_doc[position:]
    return html_doc

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    args = parser.parse_args()
    source = args.source_root.resolve()
    output = args.output_root.resolve()

    sitemap = source / "sitemap.xml"
    page_map_file = source / "development" / "KOV-COMMERCIAL-PAGE-MAP.csv"
    if not sitemap.is_file() or not page_map_file.is_file():
        raise SystemExit("Commercial ecosystem build requires sitemap.xml and development/KOV-COMMERCIAL-PAGE-MAP.csv.")

    public_routes = load_sitemap(sitemap)
    pages = load_page_map(page_map_file)
    if len(pages) < 1000:
        raise SystemExit("Commercial page map is incomplete; refusing to build generic fallback links.")

    counts = Counter()
    injected = 0
    skipped = Counter()
    for route, row in pages.items():
        if route not in public_routes:
            continue
        family = row.get("page_family", "")
        if family in {"Homepage", "Commercial conversion"}:
            skipped["conversion_page_already_has_primary_journey"] += 1
            continue
        file_path = file_for_route(route, pages, output)
        if not file_path:
            skipped["missing_output_file"] += 1
            continue

        document = file_path.read_text(encoding="utf-8")
        head = document.split("</head>", 1)[0].lower() if "</head>" in document.lower() else ""
        if re.search(r'<meta[^>]+name\s*=\s*["\']robots["\'][^>]+content\s*=\s*["\'][^"\']*noindex', head):
            skipped["noindex_page"] += 1
            continue

        links = candidate_links(route, row, pages, public_routes)
        if not links:
            skipped["no_relevant_public_relationships"] += 1
            continue

        main_match = re.search(r"<main\b[^>]*>(.*?)</main\s*>", document, flags=re.I | re.S)
        body = main_match.group(1) if main_match else document
        existing = existing_body_routes(body, route)
        links = [(target, description) for target, description in links if target not in existing]
        if not links:
            skipped["relationships_already_present_in_body"] += 1
            continue

        section = build_section(route, row, links, pages)
        document = inject_section(document, section)
        document = inject_style(document)
        file_path.write_text(document, encoding="utf-8")
        injected += 1
        counts[family] += 1

    print("KOV commercial ecosystem links built.")
    print("Published sitemap routes:", len(public_routes))
    print("Mapped commercial routes:", len(pages))
    print("Pages connected:", injected)
    for family, total in sorted(counts.items()):
        print("  " + family + ": " + str(total))
    for reason, total in sorted(skipped.items()):
        print("  skipped / " + reason + ": " + str(total))
    if injected < 200:
        raise SystemExit("Too few pages received contextual ecosystem links; check page-map relationships.")

if __name__ == "__main__":
    main()
