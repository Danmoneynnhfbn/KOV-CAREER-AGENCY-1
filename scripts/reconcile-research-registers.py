import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames, list(reader)


def write_csv(path, fieldnames, rows):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main():
    candidate_path = DEVELOPMENT / "CANDIDATE-REGISTER.csv"
    tracker_path = DEVELOPMENT / "PAGE-TRACKER.csv"
    source_path = DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv"
    candidate_fields, candidates = read_csv(candidate_path)
    tracker_fields, trackers = read_csv(tracker_path)
    source_fields, sources = read_csv(source_path)
    tracker_by_id = {row["id"]: row for row in trackers}

    blueprint_refs_cleared = 0
    for candidate in candidates:
        blueprint = candidate.get("blueprint_path", "").strip()
        if not blueprint or (ROOT / blueprint).is_file():
            continue
        candidate["blueprint_path"] = ""
        tracker = tracker_by_id.get(candidate["candidate_id"])
        if tracker:
            tracker["blueprint_status"] = "not_created_pending_research_qualification"
            tracker["blueprint_file"] = ""
        blueprint_refs_cleared += 1

    existing_sources = {row["source_id"] for row in sources}
    source_by_id = {row["source_id"]: row for row in sources}
    derived_sources = {}
    conflicting_core_fields = set()
    for path in sorted((DEVELOPMENT / "research" / "records").glob("*.json")):
        try:
            record = json.loads(path.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError:
            continue
        for source in record.get("authoritative_sources", []):
            source_id = source.get("source_id") if isinstance(source, dict) else None
            if not source_id:
                continue
            if source_id in source_by_id:
                current = source_by_id[source_id]
            else:
                current = derived_sources.get(source_id)
            if current:
                for field in ("title", "publisher", "url_or_path"):
                    left, right = str(current.get(field, "")).strip(), str(source.get(field, "")).strip()
                    if left and right and left != right:
                        conflicting_core_fields.add((source_id, field, left, right))
            elif source_id not in existing_sources:
                derived_sources[source_id] = {field: source.get(field, "") for field in source_fields}

    if conflicting_core_fields:
        for source_id, field, left, right in sorted(conflicting_core_fields):
            print(f"CONFLICT {source_id} {field}: {left!r} != {right!r}")
        raise SystemExit("Research source citations contain conflicting source identity metadata; no source rows written.")

    sources.extend(derived_sources.values())
    write_csv(candidate_path, candidate_fields, candidates)
    write_csv(tracker_path, tracker_fields, trackers)
    write_csv(source_path, source_fields, sources)
    print(json.dumps({
        "candidateBlueprintReferencesCleared": blueprint_refs_cleared,
        "trackerBlueprintStatusesCorrected": blueprint_refs_cleared,
        "previousSourceRegisterRows": len(existing_sources),
        "sourceRowsAddedFromCitedResearchRecords": len(derived_sources),
        "sourceRegisterRowsAfterReconciliation": len(sources),
    }, indent=2))


if __name__ == "__main__":
    main()
