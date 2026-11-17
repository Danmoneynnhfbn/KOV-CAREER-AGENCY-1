"""Export the local official BLS SOC workbook into a compact matching index."""

import json
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "taxonomy" / "soc_structure_2018.xlsx"
OUTPUT = ROOT / "data" / "taxonomy" / "soc-occupation-index.json"
SOURCE_URL = "https://www.bls.gov/soc/2018/soc_structure_2018.xlsx"

workbook = load_workbook(SOURCE, read_only=True, data_only=True)
sheet = workbook["2018 Structure"]
records = []
seen = set()

for row in sheet.iter_rows(min_row=9, values_only=True):
    codes = row[:4]
    title = row[4]
    if not title:
        continue
    for level, code in zip(("major", "minor", "broad", "detailed"), codes):
        if not code:
            continue
        code = str(code).strip()
        if code in seen:
            continue
        seen.add(code)
        records.append({
            "code": code,
            "title": str(title).strip(),
            "level": level,
            "source": SOURCE_URL,
            "edition": "2018 Standard Occupational Classification",
        })

workbook.close()
records.sort(key=lambda record: record["code"])
OUTPUT.write_text(json.dumps({
    "source": SOURCE_URL,
    "sourceFile": "data/taxonomy/soc_structure_2018.xlsx",
    "edition": "2018 Standard Occupational Classification",
    "records": records,
}, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"Exported {len(records)} unique BLS SOC code/title records to {OUTPUT.relative_to(ROOT)}")
