import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path, rows):
    fields = list(rows[0])
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def qualification(candidate, record):
    approval = candidate["approval_status"]
    status_text = candidate["research_status"].lower()
    blockers = list(record.get("factual_gaps_and_risks", []))
    if approval == "approved_for_development":
        return (
            "approved_for_development_only",
            "Public content, production QA, indexing approval, and publication authorization remain separate gates.",
            "Develop the noindex staging shell and obtain content/release review.",
        )
    if approval == "approved_for_research_only" or "hold_" in status_text:
        return (
            "held_not_qualified",
            "Resolve the specific hold conditions in the individual record before proposing public implementation.",
            "Resolve route, consent, privacy, and operating-model decisions.",
        )

    gaps = [
        "Complete candidate-specific external competitor and actual search-result review; direct page review alone is not a SERP analysis.",
        "Validate intent and differentiation against first-party query/user evidence if available; do not infer demand from keyword phrasing.",
        "Resolve all source-access, factual, and existing-page overlap risks listed in the individual research record.",
        "Obtain owner approval before implementation or publication.",
    ]
    if "competitor" in status_text or "serp" in status_text or not record.get("competitor_research"):
        blockers.insert(0, "Competitor/SERP research remains pending.")
    if not record.get("authoritative_sources"):
        blockers.insert(0, "Authoritative source set is incomplete.")
    return (
        "provisional_research_candidate_not_qualified",
        " ".join(dict.fromkeys(blockers + gaps)),
        "Complete the listed evidence and overlap gates, then make an explicit qualify/merge/reject decision.",
    )


def main():
    candidates = read_csv(DEVELOPMENT / "CANDIDATE-REGISTER.csv")
    candidate_rows = []
    counts = {}
    research_counts = {}
    blueprint_counts = {}
    for candidate in candidates:
        category = candidate["category"]
        counts[category] = counts.get(category, 0) + 1
        record_path = ROOT / "development" / "research" / "records" / f"{candidate['candidate_id']}.json"
        if not record_path.is_file():
            raise FileNotFoundError(f"Missing research record: {record_path}")
        record = json.loads(record_path.read_text(encoding="utf-8"))
        status, blockers, next_gate = qualification(candidate, record)
        if record.get("record_status") != "not_started":
            research_counts[category] = research_counts.get(category, 0) + 1
        blueprint = ROOT / candidate["blueprint_path"]
        if blueprint.is_file():
            blueprint_counts[category] = blueprint_counts.get(category, 0) + 1
        candidate_rows.append({
            "candidate_id": candidate["candidate_id"],
            "category": category,
            "proposed_url": candidate["proposed_url"],
            "qualification_status": status,
            "qualification_blockers": blockers,
            "next_gate": next_gate,
            "approval_status": candidate["approval_status"],
            "publication_status": candidate["publication_status"],
        })

    write_csv(
        DEVELOPMENT / "CANDIDATE-QUALIFICATION-REGISTER.csv",
        sorted(candidate_rows, key=lambda row: (row["category"], row["candidate_id"])),
    )
    programme_path = DEVELOPMENT / "PAGE-PROGRAMME.csv"
    programme = read_csv(programme_path)
    if programme and "qualified_for_development" not in programme[0]:
        for row in programme:
            row["qualified_for_development"] = "0"
            row["development_qualification_gap"] = row["target_count"]
    for row in programme:
        category = row["page_group"]
        row["candidate_urls_defined"] = counts.get(category, 0)
        row["candidate_url_shortfall"] = int(row["target_count"]) - counts.get(category, 0)
        row["research_records_created"] = research_counts.get(category, 0)
        row["blueprints_created"] = blueprint_counts.get(category, 0)
        qualified = sum(
            item["category"] == category and item["qualification_status"] == "approved_for_development_only"
            for item in candidate_rows
        )
        row["qualified_for_development"] = qualified
        row["development_qualification_gap"] = int(row["target_count"]) - qualified
    with programme_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(programme[0]))
        writer.writeheader()
        writer.writerows(programme)

    print(
        f"Qualification register contains {len(candidate_rows)} candidates; "
        f"{sum(row['qualification_status'] == 'approved_for_development_only' for row in candidate_rows)} "
        "are approved for development only, all others remain provisional or held."
    )


if __name__ == "__main__":
    main()
