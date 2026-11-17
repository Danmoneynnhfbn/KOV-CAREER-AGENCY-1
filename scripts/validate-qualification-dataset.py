"""Validate the retained Ofqual CSV and the active qualification snapshot."""

import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data/taxonomy/ofqual-regulated-qualifications.csv"
DATA_PATH = ROOT / "data/taxonomy/ofqual-active-qualifications.json"


def main():
    document = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    provenance = document["source"]
    digest = hashlib.sha256(CSV_PATH.read_bytes()).hexdigest()
    if digest != provenance["sourceCsvSha256"]:
        raise SystemExit("The retained Ofqual CSV does not match the recorded SHA-256.")
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as stream:
        raw = list(csv.DictReader(stream))
    active = [row for row in raw if row["Qualification Status"].strip() == "Available to learners"]
    records = document["records"]
    if len(raw) != provenance["rawRows"]:
        raise SystemExit(f"CSV row count changed: expected {provenance['rawRows']}, found {len(raw)}.")
    if len(active) != len(records) or len(active) != provenance["selectedRecords"]:
        raise SystemExit(f"Active record count mismatch: CSV={len(active)}, snapshot={len(records)}.")
    raw_by_code = {row["Qualification Number"].strip(): row for row in active}
    snapshot_by_code = {record["code"]: record for record in records}
    if len(raw_by_code) != len(active) or len(snapshot_by_code) != len(records):
        raise SystemExit("Qualification numbers are not unique in the active source/snapshot.")
    if raw_by_code.keys() != snapshot_by_code.keys():
        raise SystemExit("The active source and normalized snapshot have different qualification numbers.")
    for code, record in snapshot_by_code.items():
        row = raw_by_code[code]
        if record["name"] != row["Qualification Title"].strip():
            raise SystemExit(f"Qualification title differs from Ofqual source for {code}.")
        if record["status"] != row["Qualification Status"].strip():
            raise SystemExit(f"Qualification status differs from Ofqual source for {code}.")
        if record.get("specificationUrl") != (row["Link To Specification"].strip() or None):
            if record.get("specificationUrl") and not record["specificationUrl"].startswith(("https://", "http://")):
                raise SystemExit(f"Invalid specification URL for {code}.")
    unique_titles = {record["name"].casefold() for record in records}
    duplicates = len(records) - len(unique_titles)
    if len(records) < 15000:
        raise SystemExit(f"Approved qualification target not met: {len(records)}/15000.")
    if len(unique_titles) != provenance["uniqueTitles"] or duplicates != provenance["duplicateTitlesWithDistinctIdentifiers"]:
        raise SystemExit("Qualification title deduplication counts disagree with source provenance.")
    print(json.dumps({
        "sourceRows": len(raw),
        "activeRecords": len(records),
        "uniqueQualificationNumbers": len(snapshot_by_code),
        "uniqueTitles": len(unique_titles),
        "duplicateTitlesWithDistinctIdentifiers": duplicates,
        "approvedTarget": 15000,
        "targetMet": True,
        "sourceCsvSha256": digest,
        "license": provenance["license"],
    }, indent=2))


if __name__ == "__main__":
    main()
