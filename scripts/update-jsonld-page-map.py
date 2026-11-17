"""Refresh the existing implementation-map JSON-LD coverage columns."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "docs/research/page-category-implementation-map-2026-11-13.csv"
REPORT = ROOT / "docs/research/jsonld-implementation-validation-2026-11-13.json"


def main():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    with MAP.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        fields = reader.fieldnames
        rows = list(reader)
    if not fields or not {"path", "jsonld_categories", "jsonld_record_nodes"}.issubset(fields):
        raise SystemExit("Implementation map is missing expected JSON-LD columns.")
    page_map = report.get("pageMap", {})
    if len(rows) != report.get("pages"):
        raise SystemExit("Implementation map and JSON-LD report cover different page counts.")
    for row in rows:
        counts = page_map.get(row["path"], {})
        row["jsonld_categories"] = ";".join(counts)
        row["jsonld_record_nodes"] = str(sum(counts.values()))
    with MAP.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Updated JSON-LD category mappings for {len(rows)} HTML pages.")


if __name__ == "__main__":
    main()
