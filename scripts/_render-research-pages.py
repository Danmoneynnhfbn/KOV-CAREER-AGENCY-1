#!/usr/bin/env python3
"""Render research-backed landing pages and Markdown from internal page records."""

import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "pages"
BASE_URL = "https://www.kovcareeragency.org"
HERO_IMAGES = (
    "/assets/people/leadership-team.jpg",
    "/assets/people/leadership-meeting.jpg",
    "/assets/people/executive-woman.jpg",
    "/assets/people/executive-professional.jpg",
    "/assets/people/executive-leader.jpg",
)

# SourceNotes in the records retain the opened URLs and verification context.
# The reviewed public facts are limited to O*NET and KOV pages opened on 2026-10-23.


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def inline_markdown(value: str) -> str:
    escaped = esc(value)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    return escaped


def remove_repeated_market_intro(value: str) -> str:
    return re.sub(
        r"(For .+? approved outreach\.)\s+\1(?= Review the relevant existing KOV market page)",
        r"\1",
        value,
    )


def hero_image_for(page: dict) -> str:
    index = sum(ord(char) for char in page["canonical"]) % len(HERO_IMAGES)
    return HERO_IMAGES[index]


def render_section(section: dict) -> str:
    parts = [
        f'<section class="ceo-content-section" id="{esc(section["id"])}">',
        f'<h2>{esc(section["heading"])}</h2>',
    ]
    if section.get("lead"):
        parts.append(f'<p class="ceo-answer">{inline_markdown(section["lead"])}</p>')
    for paragraph in section.get("paragraphs", []):
        parts.append(f"<p>{inline_markdown(paragraph)}</p>")
    if section.get("bullets"):
        parts.append("<ul>")
        parts.extend(f"<li>{inline_markdown(item)}</li>" for item in section["bullets"])
        parts.append("</ul>")
    if section.get("table"):
        table = section["table"]
        parts.extend(
            [
                '<div class="ceo-table-wrap"><table class="ceo-table"><thead><tr>',
                "".join(
                    f'<th scope="col">{esc(cell)}</th>' for cell in table["headers"]
                ),
                "</tr></thead><tbody>",
            ]
        )
        for row in table["rows"]:
            parts.append(
                "<tr>"
                + "".join(f"<td>{inline_markdown(cell)}</td>" for cell in row)
                + "</tr>"
            )
        parts.append("</tbody></table></div>")
    sample = section.get("sample")
    if sample:
        parts.extend(
            [
                '<div class="ceo-sample-panel">',
                f'<h3>{esc(sample["heading"])}</h3>',
                '<div class="ceo-sample-grid">',
                f'<div><h4>Before</h4><p>{inline_markdown(sample["before"])}</p></div>',
                f'<div><h4>After</h4><p>{inline_markdown(sample["after"])}</p></div>',
                "</div></div>",
            ]
        )
    cards = section.get("cards", [])
    if cards:
        if len(cards) > 3:
            parts.extend(
                [
                    '<div class="ceo-filter">',
                    '<label for="industry-search">Find an industry</label>',
                    '<input id="industry-search" type="search" data-industry-filter '
                    'placeholder="Search industries" autocomplete="off">',
                    '<span data-industry-count aria-live="polite">'
                    f"{len(cards)} industries shown</span></div>",
                ]
            )
        parts.append('<ul class="ceo-industry-list">')
        for card in cards:
            parts.extend(
                [
                    '<li data-industry-card>',
                    '<article class="ceo-card">',
                    f'<h3>{esc(card["title"])}</h3>',
                ]
            )
            if card.get("text"):
                parts.append(f'<p>{inline_markdown(card["text"])}</p>')
            if card.get("href"):
                parts.append(
                    f'<a class="ceo-card-link" href="{esc(card["href"])}">'
                    f'{esc(card.get("linkText", "Explore this role"))}</a>'
                )
            parts.extend(["</article>", "</li>"])
        parts.append("</ul>")
    if section.get("tabs"):
        tabs = section["tabs"]
        parts.extend(
            [
                '<div class="ceo-tabs">',
                '<div role="tablist" aria-label="Market planning notes">',
            ]
        )
        for index, tab in enumerate(tabs):
            selected = "true" if index == 0 else "false"
            tabindex = "0" if index == 0 else "-1"
            parts.append(
                f'<button type="button" role="tab" data-region-tab aria-selected="{selected}" '
                f'tabindex="{tabindex}" aria-controls="market-panel-{index}" '
                f'id="market-tab-{index}">{esc(tab["name"])}</button>'
            )
        parts.append("</div>")
        for index, tab in enumerate(tabs):
            hidden = "" if index == 0 else " hidden"
            text = remove_repeated_market_intro(tab["text"])
            parts.append(
                f'<div role="tabpanel" data-region-panel id="market-panel-{index}" '
                f'aria-labelledby="market-tab-{index}"{hidden}>'
                f'<p>{inline_markdown(text)}</p></div>'
            )
        parts.append("</div>")
    parts.append("</section>")
    return "\n".join(parts)


def markdown_section(section: dict) -> list[str]:
    lines = [f'## {section["heading"]}', ""]
    if section.get("lead"):
        lines.extend([section["lead"], ""])
    for paragraph in section.get("paragraphs", []):
        lines.extend([paragraph, ""])
    if section.get("bullets"):
        lines.extend(f"- {item}" for item in section["bullets"])
        lines.append("")
    if section.get("table"):
        table = section["table"]
        lines.extend(
            [
                "| " + " | ".join(table["headers"]) + " |",
                "| " + " | ".join("---" for _ in table["headers"]) + " |",
            ]
        )
        lines.extend("| " + " | ".join(row) + " |" for row in table["rows"])
        lines.append("")
    sample = section.get("sample")
    if sample:
        lines.extend(
            [
                f'### {sample["heading"]}',
                "",
                f'**Before:** {sample["before"]}',
                "",
                f'**After:** {sample["after"]}',
                "",
            ]
        )
    for card in section.get("cards", []):
        title = card["title"]
        if card.get("href"):
            title = f'[{title}]({card["href"]})'
        lines.extend([f"### {title}", "", card["text"], ""])
    for tab in section.get("tabs", []):
        text = remove_repeated_market_intro(tab["text"])
        lines.extend([f"### {tab['name']}", "", text, ""])
    return lines


def schema_for(page: dict) -> dict:
    canonical = f'{BASE_URL}{page["canonical"]}'
    organization_id = f"{BASE_URL}/#organization"
    founder_id = f"{BASE_URL}/#founder"
    breadcrumbs = page["breadcrumbs"] + [
        {"name": page["title"], "url": page["canonical"]}
    ]
    breadcrumb_items = [
        {
            "@type": "ListItem",
            "position": position,
            "name": item["name"],
            "item": f'{BASE_URL}{item["url"]}',
        }
        for position, item in enumerate(breadcrumbs, start=1)
    ]
    faq_entries = [
        {
            "@type": "Question",
            "name": faq["question"],
            "acceptedAnswer": {"@type": "Answer", "text": faq["answer"]},
        }
        for faq in page.get("faqs", [])
    ]
    graph = [
        {
            "@type": "WebPage",
            "@id": f"{canonical}#webpage",
            "url": canonical,
            "name": page["title"],
            "description": page["description"],
            "datePublished": page["reviewedOn"],
            "dateModified": page["reviewedOn"],
            "breadcrumb": {"@id": f"{canonical}#breadcrumb"},
            "publisher": {"@id": organization_id},
            "mainEntity": {"@id": f"{canonical}#service"},
        },
        {
            "@type": "BreadcrumbList",
            "@id": f"{canonical}#breadcrumb",
            "itemListElement": breadcrumb_items,
        },
        {
            "@type": "Service",
            "@id": f"{canonical}#service",
            "name": page["serviceName"],
            "serviceType": page["serviceType"],
            "description": page["description"],
            "provider": {"@id": organization_id},
            "url": canonical,
        },
        {
            "@type": "FAQPage",
            "@id": f"{canonical}#faq",
            "mainEntity": faq_entries,
        },
        {
            "@type": ["ProfessionalService", "EmploymentAgency"],
            "@id": organization_id,
            "name": "KOV Career Agency",
            "url": f"{BASE_URL}/",
            "logo": f"{BASE_URL}/kov-logo.png",
            "founder": {"@id": founder_id},
        },
        {
            "@type": "Person",
            "@id": founder_id,
            "name": "Adekunle Ayotoba Daniel",
            "alternateName": ["Daniel Ade"],
            "worksFor": {"@id": organization_id},
        },
    ]
    return {"@context": "https://schema.org", "@graph": graph}


def render_faqs(faqs: list[dict]) -> str:
    if not faqs:
        return ""
    parts = [
        '<section class="ceo-content-section" id="faqs">',
        "<h2>Frequently asked questions</h2>",
        '<div class="ceo-faq-list">',
    ]
    for faq in faqs:
        parts.extend(
            [
                '<details class="ceo-card ceo-accordion">',
                f'<summary>{esc(faq["question"])}</summary>',
                f'<p>{inline_markdown(faq["answer"])}</p>',
                "</details>",
            ]
        )
    parts.extend(["</div>", "</section>"])
    return "\n".join(parts)


def render_html(page: dict) -> str:
    schema = json.dumps(schema_for(page), ensure_ascii=False, indent=2).replace("</", "<\\/")
    canonical_path = page["canonical"].rstrip("/")
    canonical_parts = [part for part in canonical_path.split("/") if part]
    if len(canonical_parts) == 3 and canonical_parts[0] == "roles":
        design_group = "role-industry"
    elif len(canonical_parts) == 2 and canonical_parts[0] == "roles":
        design_group = "role-hub"
    elif len(canonical_parts) == 2 and canonical_parts[0] == "industries":
        design_group = "industry"
    else:
        design_group = "overview"
    breadcrumbs = page["breadcrumbs"] + [
        {"name": page["title"], "url": page["canonical"]}
    ]
    crumb_markup = " <span aria-hidden=\"true\">/</span> ".join(
        f'<a href="{esc(item["url"])}">{esc(item["name"])}</a>'
        if index < len(breadcrumbs) - 1
        else f"<span aria-current=\"page\">{esc(item['name'])}</span>"
        for index, item in enumerate(breadcrumbs)
    )
    toc_items = [
        f'<li><a href="#{esc(section["id"])}">{esc(section["heading"])}</a></li>'
        for section in page["sections"]
    ]
    if page.get("faqs"):
        toc_items.append('<li><a href="#faqs">Frequently asked questions</a></li>')
    sections = "\n".join(render_section(section) for section in page["sections"])
    sections += render_faqs(page.get("faqs", []))
    first_section_end = sections.find("</section>")
    middle_cta = """
        <aside class="ceo-mid-cta">
          <p class="ceo-label">Talk through the next step</p>
          <p>Discuss fit, priorities, and the support you are considering. Scope and terms are agreed before work begins.</p>
          <a class="ceo-button ceo-button-primary" href="/contact.html">Arrange a consultation</a>
        </aside>
    """
    if first_section_end >= 0:
        first_section_end += len("</section>")
        sections = sections[:first_section_end] + middle_cta + sections[first_section_end:]
    header_links = [
        ("Home", "/"),
        ("Individual Career Services", "/candidate-services.html"),
        ("Roles", "/roles/"),
        ("Industries", "/industries/"),
        ("Private Career Representation", "/services.html"),
        ("How It Works", "/how-it-works.html"),
        ("Pricing", "/pricing.html"),
        ("FAQs", "/faqs.html"),
        ("Blog", "/blog.html"),
        ("About", "/about.html"),
        ("Get Started", "/contact.html"),
    ]
    nav_links = "".join(
        f'<a href="{esc(url)}">{esc(label)}</a>' for label, url in header_links
    )
    footer_links = "".join(
        f'<a href="{esc(url)}">{esc(label)}</a>'
        for label, url in [
            ("Home", "/"),
            ("Career services", "/services.html"),
            ("Roles", "/roles/"),
            ("Industries", "/industries/"),
            ("How It Works", "/how-it-works.html"),
            ("Contact", "/contact.html"),
        ]
    )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(page["title"])}</title>
  <meta name="description" content="{esc(page["description"])}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{esc(BASE_URL + page["canonical"])}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="KOV Career Agency">
  <meta property="og:title" content="{esc(page["title"])}">
  <meta property="og:description" content="{esc(page["description"])}">
  <meta property="og:url" content="{esc(BASE_URL + page["canonical"])}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{esc(page["title"])}">
  <meta name="twitter:description" content="{esc(page["description"])}">
  <meta property="og:image" content="{esc(BASE_URL + "/preview.png")}">
  <meta name="twitter:image" content="{esc(BASE_URL + "/preview.png")}">
  <link rel="stylesheet" href="/assets/design-components.css">
  <link rel="stylesheet" href="/assets/ceo-hubs.css">
  <script type="application/ld+json">{schema}</script>
  <link rel="stylesheet" href="/assets/research-pages.css">
</head>
<body class="ceo-page kov-design--{design_group}" data-design-group="{design_group}">
  <div class="ceo-progress" data-reading-progress aria-hidden="true"></div>
  <header class="ceo-site-header">
    <div class="ceo-shell ceo-header-inner">
      <a class="ceo-brand" href="/" aria-label="KOV Career Agency home">
        <img src="/kov-logo.png" alt="KOV" width="32" height="32">
        <span>KOV <span>Career Agency</span></span>
      </a>
      <nav class="ceo-desktop-nav" aria-label="Main navigation">{nav_links}</nav>
      <button type="button" class="ceo-mobile-toggle" data-ceo-menu-open
        aria-expanded="false" aria-controls="ceo-mobile-menu">Menu</button>
    </div>
    <nav id="ceo-mobile-menu" class="ceo-mobile-menu" aria-label="Mobile navigation"
      aria-hidden="true" hidden>
      <div class="ceo-shell">
        <button type="button" data-ceo-menu-close>Close menu</button>
        {nav_links}
      </div>
    </nav>
  </header>
  <nav class="ceo-breadcrumb" aria-label="Breadcrumb">{crumb_markup}</nav>
  <main>
    <section class="ceo-section ceo-hero">
      <div class="ceo-shell ceo-hero-grid">
        <div>
          <p class="ceo-label">{esc(page["eyebrow"])}</p>
          <h1>{esc(page["heading"])}</h1>
          <p class="ceo-hero-lead">{inline_markdown(page["answer"])}</p>
          <div class="ceo-hero-actions">
            <a class="ceo-button ceo-button-primary" href="/contact.html">Discuss your next step</a>
            <a class="ceo-button ceo-button-secondary" href="/services.html">Explore career representation</a>
          </div>
        </div>
        <aside class="ceo-hero-panel">
          <img class="ceo-hero-image" src="{hero_image_for(page)}" alt="" loading="eager" decoding="async">
          <p class="ceo-label">A considered approach</p>
          <p>Define the role you want, clarify your evidence, and agree the work before any outreach begins.</p>
          <a href="/how-it-works.html">See how KOV works</a>
        </aside>
      </div>
    </section>
    <div class="ceo-shell ceo-reading-layout">
      <nav class="ceo-toc" aria-label="On this page">
        <p class="ceo-label">On this page</p>
        <ol>{"".join(toc_items)}</ol>
      </nav>
      <article class="ceo-prose">
        {"".join(f'<p class="ceo-citation">{inline_markdown(fact["text"])} <a href="{esc(fact["url"])}" rel="noopener noreferrer">Source: {esc(fact["source"])}</a></p>' for fact in page.get("sourceFacts", []))}
        {sections}
        <section class="ceo-end-cta">
          <p class="ceo-label">Your next step</p>
          <h2>Plan your next move with care.</h2>
          <p>Discuss your priorities, fit, and the support you are considering. Scope and terms are agreed before work begins.</p>
          <a class="ceo-button ceo-button-primary" href="/contact.html">Contact KOV</a>
        </section>
      </article>
    </div>
  </main>
  <footer class="ceo-site-footer">
    <div class="ceo-shell ceo-footer-inner">
      <a class="ceo-brand" href="/"><img src="/kov-logo.png" alt="" width="28" height="28">
        <span>KOV Career Agency</span></a>
      <p>Private career representation and individual career services for professionals.</p>
      <nav aria-label="Footer navigation">{footer_links}</nav>
      <p><a href="/privacy.html">Privacy Notice</a> · © 2026 KOV Career Agency</p>
    </div>
  </footer>
  <a class="ceo-button ceo-button-primary ceo-sticky-cta" href="/contact.html">Confidential consultation</a>
  <script src="/assets/design-components.js" defer></script>
  <script src="/assets/ceo-hubs.js" defer></script>
</body>
</html>
"""


def render_markdown(page: dict) -> str:
    lines = [
        f'# {page["heading"]}',
        "",
        page["answer"],
        "",
    ]
    for fact in page.get("sourceFacts", []):
        lines.extend(
            [
                f'{fact["text"]} [Source: {fact["source"]}]({fact["url"]}).',
                "",
            ]
        )
    for section in page["sections"]:
        lines.extend(markdown_section(section))
    if page.get("faqs"):
        lines.extend(["## Frequently asked questions", ""])
        for faq in page["faqs"]:
            lines.extend(
                [
                    f'### {faq["question"]}',
                    "",
                    faq["answer"],
                    "",
                ]
            )
    lines.extend(
        [
            "## Contact KOV",
            "",
            "Discuss your priorities, fit, and the support you are considering. "
            "[Contact KOV](/contact.html).",
            "",
        ]
    )
    return "\n".join(lines)


def build(check_only: bool = False) -> int:
    errors = []
    pages = []
    record_paths = sorted(
        DATA_DIR.glob("*.json"),
        key=lambda path: {
            "ceo.json": 0,
            "ceo-legal-services.json": 1,
            "legal-services.json": 2,
        }.get(path.name, 10),
    )
    for record_path in record_paths:
        page = json.loads(record_path.read_text(encoding="utf-8"))
        pages.append(page)
        html_path = ROOT / page["outputHtml"]
        markdown_path = ROOT / page["outputMarkdown"]
        outputs = {
            html_path: render_html(page),
            markdown_path: render_markdown(page),
        }
        for output_path, content in outputs.items():
            if check_only:
                if not output_path.is_file() or output_path.read_text(encoding="utf-8") != content:
                    errors.append(f"Generated file is missing or stale: {output_path.relative_to(ROOT)}")
            else:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(content, encoding="utf-8", newline="\n")
    full_path = ROOT / "llms-full.txt"
    section_heading = "## CEO and legal-services guides"
    existing_full = full_path.read_text(encoding="utf-8")
    prefix = existing_full.split(section_heading, 1)[0].rstrip()
    full_section = [section_heading, ""]
    for page in pages:
        full_section.extend(
            [
                f'### [{page["title"]}]({BASE_URL}{page["canonical"]})',
                "",
                render_markdown(page).rstrip(),
                "",
            ]
        )
    section_text = "\n".join(full_section).rstrip()
    full_content = f"{prefix}\n\n{section_text}\n"
    if check_only:
        if existing_full != full_content:
            errors.append("Generated research-page section is missing or stale: llms-full.txt")
    else:
        full_path.write_text(full_content, encoding="utf-8")
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    action = "Verified" if check_only else "Rendered"
    print(f"{action} {len(list(DATA_DIR.glob('*.json')))} research page records.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="check generated files without writing")
    arguments = parser.parse_args()
    sys.exit(build(arguments.check))
