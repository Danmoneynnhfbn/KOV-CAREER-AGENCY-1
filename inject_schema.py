#!/usr/bin/env python3
"""KOV Career Agency - inject the core+page schema onto every HTML page."""

import argparse
import json
import re
from pathlib import Path

BASE_URL = "https://kovcareeragency.org"

COUNTRY_NAMES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
    "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
    "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
    "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
    "Colombia", "Comoros", "Congo (Republic of the)", "Congo (Democratic Republic of the)",
    "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti",
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
    "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
    "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]


def strip_tags(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value, flags=re.S)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def add_country_area_served():
    return [{"@type": "Country", "name": c} for c in COUNTRY_NAMES]


def build_core_graph(founding_year: str | None = None):
    org = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["ProfessionalService", "EmploymentAgency"],
                "@id": f"{BASE_URL}/#organization",
                "name": "KOV Career Agency",
                "alternateName": ["KOV Career", "KovCareer"],
                "url": BASE_URL,
                "logo": f"{BASE_URL}/kov-logo.png",
                "image": f"{BASE_URL}/preview.png",
                "email": "daniel@kovcareeragency.org",
                "description": "Founder-led reverse recruiting and global talent sourcing agency. KOV represents candidates directly to employers and sources passive talent across global markets.",
                "founder": {"@id": f"{BASE_URL}/#founder"},
                "areaServed": add_country_area_served(),
                "sameAs": [
                    "https://www.reddit.com/user/KOV_CAREER_AGENCY/"
                ]
            },
            {
                "@type": "Person",
                "@id": f"{BASE_URL}/#founder",
                "name": "Daniel Ade",
                "jobTitle": "Founder and Principal Career Strategist",
                "worksFor": {"@id": f"{BASE_URL}/#organization"},
                "url": BASE_URL,
                "sameAs": [
                    "https://www.reddit.com/user/KOV_CAREER_AGENCY/"
                ]
            },
            {
                "@type": "WebSite",
                "@id": f"{BASE_URL}/#website",
                "url": BASE_URL,
                "name": "KOV Career Agency",
                "description": "Global executive career agency and recruiting partner for senior professionals and companies.",
                "publisher": {"@id": f"{BASE_URL}/#organization"},
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {"@type": "EntryPoint", "urlTemplate": f"{BASE_URL}/?q={{search_term_string}}"},
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    }
    if founding_year:
        org["@graph"][0]["foundingDate"] = str(founding_year)
    return org


def estimate_service_name(path: str):
    name = path.lower()
    if "candidate-services" in name:
        return "Executive Reverse Recruiting and Career Representation"
    if "company-services" in name or "global-talent-sourcer" in name:
        return "Global Talent Sourcing for Companies and Hiring Teams"
    if "services" in name:
        return "Executive Career Services"
    if "about" in name:
        return "About KOV Career Agency"
    if "how-it-works" in name:
        return "How KOV Works"
    if "pricing" in name:
        return "Career Agency Pricing"
    if "contact" in name:
        return "Contact KOV Career Agency"
    if "faqs" in name:
        return "Frequently Asked Questions"
    if "why-kov" in name:
        return "Why KOV"
    return "Career Services"


def estimate_page_type(path: str):
    name = path.lower()
    if "about" in name:
        return ["WebPage", "AboutPage"]
    if "contact" in name:
        return ["WebPage", "ContactPage"]
    if "faqs" in name or "faq" in name:
        return ["WebPage", "FAQPage"]
    return ["WebPage"]


def parse_faq_questions(html: str):
    records = []
    for item in re.finditer(r"<details[^>]*>(.*?)</details>", html, flags=re.S | re.I):
        block = item.group(1)
        summary = re.search(r"<summary[^>]*>(.*?)</summary>", block, flags=re.S | re.I)
        if not summary:
            continue
        q = strip_tags(summary.group(1))
        if not q:
            continue
        answer_block = block[summary.end():]
        answer = strip_tags(answer_block)
        if answer:
            records.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": answer}})
        else:
            records.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": "Contact KOV to confirm availability and fit."}})
    return records


def build_page_block(path: str, html: str):
    rel_path = path if path == "/" else path.lstrip("./")
    page_url = f"{BASE_URL}/{rel_path}" if rel_path and not rel_path.startswith("http") else BASE_URL + "/"
    name = estimate_service_name(rel_path)
    body_title = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.S | re.I)
    if body_title:
        name = strip_tags(body_title.group(1))
    page_type = estimate_page_type(rel_path)
    faq_qs = parse_faq_questions(html)
    entity = {"@type": "Service", "name": estimate_service_name(rel_path), "provider": {"@id": f"{BASE_URL}/#organization"}, "areaServed": add_country_area_served()}
    if "services" in rel_path.lower() or "candidate" in rel_path.lower() or "company-services" in rel_path.lower() or "global-talent-sourcer" in rel_path.lower():
        entity["serviceType"] = "Executive career support and talent sourcing"
        entity["audience"] = {"@type": "Audience", "audienceType": "Senior professionals and hiring teams"}
    result = {
        "@context": "https://schema.org",
        "@type": page_type,
        "@id": f"{page_url}#webpage",
        "url": page_url,
        "name": name,
        "isPartOf": {"@id": f"{BASE_URL}/#website"},
        "about": {"@id": f"{BASE_URL}/#organization"},
        "publisher": {"@id": f"{BASE_URL}/#organization"},
        "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL}, {"@type": "ListItem", "position": 2, "name": name, "item": page_url}]},
        "mainEntity": faq_qs or entity
    }
    if faq_qs:
        result["mainEntity"] = faq_qs
        result["about"] = {"@id": f"{BASE_URL}/#organization"}
    if "services" in rel_path.lower() or "candidate" in rel_path.lower() or "company-services" in rel_path.lower() or "global-talent-sourcer" in rel_path.lower():
        result["mainEntity"] = [entity] + faq_qs
    return result


def remove_old_kov_json_ld(html: str) -> str:
    pattern = re.compile(r"(?is)<script\s+type=[\"']application/ld\+json[\"'][^>]*>.*?(?:https://kovcareeragency\.org|KOV Career Agency).*?</script>\s*")
    return pattern.sub("", html)


def inject_into_file(path: Path, dry_run: bool, found_year: str | None, root: Path):
    original = path.read_text(encoding="utf-8")
    if not dry_run:
        backup_dir = root / "_schema_backup"
        backup_dir.mkdir(parents=True, exist_ok=True)
        relative = path.relative_to(root)
        backup_path = backup_dir / relative
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        if not backup_path.exists():
            backup_path.write_text(original, encoding="utf-8")

    stripped = remove_old_kov_json_ld(original)
    core_block = build_core_graph(found_year)
    page_block = build_page_block(path.name, stripped)
    before = "</head>"
    if before not in stripped:
        return False, "skipped:no_head"
    new_html = stripped.replace(before, "  <script type=\"application/ld+json\" data-kov=\"core\">\n" + json.dumps(core_block, ensure_ascii=False, indent=2) + "\n  </script>\n  <script type=\"application/ld+json\" data-kov=\"page\">\n" + json.dumps(page_block, ensure_ascii=False, indent=2) + "\n  </script>\n</head>", 1)
    if not dry_run:
        path.write_text(new_html, encoding="utf-8")
    return True, "processed"


def iter_pages(root: Path):
    for path in sorted(root.rglob("*.html")):
        if path.name.lower().endswith(".bak"):
            continue
        if "_schema_backup" in path.parts:
            continue
        yield path


def main():
    parser = argparse.ArgumentParser(description="Insert KOV schema blocks into HTML pages.")
    parser.add_argument("path", nargs="?", default=".")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--founded", type=str, dest="founding_year")
    args = parser.parse_args()

    root = Path(args.path).resolve()
    pages = list(iter_pages(root))
    total = len(pages)
    processed = 0
    skipped = []

    for page in pages:
        ok, status = inject_into_file(page, args.dry_run, args.founding_year, root)
        if ok:
            processed += 1
        else:
            skipped.append(f"{page.name}:{status}")

    print(f"Processed {processed} of {total} html files")
    if skipped:
        for item in skipped:
            print(item)

if __name__ == "__main__":
    main()
