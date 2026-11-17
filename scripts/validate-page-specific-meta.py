"""Validate the migrated page-category map against saved JSON-LD graphs."""

import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "docs/research/page-category-implementation-map-2026-11-13.csv"
REPORT = ROOT / "docs/research/jsonld-implementation-validation-2026-11-13.json"
CATALOG = "https://www.kovcareeragency.org/#metadata-catalog"
CATEGORIES = {
    "professional-audience": "audiences", "job-title": "job-titles",
    "occupation": "occupations", "industry": "industries", "skill": "skills",
    "qualification": "qualifications", "professional-term": "professional-terms",
    "job-function": "job-functions", "seniority-level": "seniority-levels",
    "employment-type": "employment-types", "career-challenge": "career-challenges",
    "career-search-intent": "career-search-intents", "faq": "faqs",
    "language": "languages", "country": "countries", "city": "cities",
    "town-locality": "towns-localities", "institution": "institutions",
}


def page_catalog(file_path):
    if file_path == "index.html":
        return CATALOG
    normalized = " ".join(file_path.strip().split()).casefold()
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:24]
    return f"{CATALOG}/page-{digest}"


def main():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    with MAP.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    if len(rows) != report["pages"]:
        raise SystemExit(f"Map covers {len(rows)} rows; validation report covers {report['pages']}.")
    failures = []
    mapped_pages = 0
    mapped_nodes = 0
    for row in rows:
        file_path = ROOT / row["path"]
        raw = file_path.read_bytes()
        html_lower = raw.lower()
        for name in ("professional-audience", "job-title", "occupation", "industry", "skill", "qualification", "professional-term", "job-function", "seniority-level", "employment-type", "career-challenge", "career-search-intent", "faq-question", "faq-answer", "language", "country", "city", "town-locality", "institution"):
            if b'<meta' in html_lower and (b'name="' + name.encode() + b'"' in html_lower or b"name='" + name.encode() + b"'" in html_lower):
                failures.append(f"{row['path']}: old custom taxonomy meta remains")
                break
        if row["path"] not in report["pageMap"] and row["path"] != "index.html":
            continue
        html = raw.decode("utf-8")
        script = re.search(r'<script\b[^>]*data-kov="discovery"[^>]*>([\s\S]*?)</script\s*>', html, re.I)
        if not script:
            failures.append(f"{row['path']}: generated KOV JSON-LD block missing")
            continue
        try:
            graph = json.loads(script.group(1))["@graph"]
        except (json.JSONDecodeError, KeyError) as error:
            failures.append(f"{row['path']}: invalid JSON-LD graph: {error}")
            continue
        actual = {}
        catalog_id = page_catalog(row["path"])
        for category, slug in CATEGORIES.items():
            set_id = f"{catalog_id}/set-{slug}"
            faq_id = f"{catalog_id}/dataset-faqs"
            matches = [node for node in graph if node.get("inDefinedTermSet", {}).get("@id") == set_id]
            if category == "faq":
                matches += [node for node in graph if node.get("isPartOf", {}).get("@id") == faq_id and node.get("@type") == "Question"]
            if matches:
                actual[category] = len(matches)
        expected = report["pageMap"].get(row["path"], {})
        if actual != expected:
            failures.append(f"{row['path']}: expected JSON-LD map {expected}, found {actual}")
        categories = ";".join(expected)
        count = sum(expected.values())
        if row.get("jsonld_categories", "") != categories or int(row.get("jsonld_record_nodes", "0") or "0") != count:
            failures.append(f"{row['path']}: CSV implementation map disagrees with saved JSON-LD")
        if expected:
            mapped_pages += 1
            mapped_nodes += count
    if failures:
        raise SystemExit("\n".join(failures[:30]))
    print(f"Verified JSON-LD page map rows: {len(rows)}")
    print(f"Pages with subject-matched taxonomy records: {mapped_pages}")
    print(f"Page-specific taxonomy record nodes: {mapped_nodes}")
    print("Project-generated taxonomy meta elements remaining: 0")


if __name__ == "__main__":
    main()
