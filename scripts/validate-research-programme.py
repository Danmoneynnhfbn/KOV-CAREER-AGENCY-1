import csv
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
REQUIRED_RECORD_FIELDS = (
    "page_title",
    "proposed_url",
    "page_group",
    "primary_keywords",
    "secondary_keywords",
    "search_intent",
    "intended_audience",
    "geographic_relevance",
    "competitor_research",
    "commercial_relevance",
    "unique_content_purpose",
    "internal_link_opportunities",
    "duplication_and_cannibalisation_assessment",
    "authoritative_sources",
    "blueprint_path",
)
REQUIRED_TRACKER_FIELDS = (
    "qualification_status",
    "content_writing_status",
    "functionality_status",
    "validation_status",
    "visual_design_status",
    "approval_status",
)


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def main():
    candidates = read_csv(DEVELOPMENT / "CANDIDATE-REGISTER.csv")
    tracker = read_csv(DEVELOPMENT / "PAGE-TRACKER.csv")
    keywords = read_csv(DEVELOPMENT / "KEYWORD-INTENT-MAP.csv")
    sources = read_csv(DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv")
    programme = read_csv(DEVELOPMENT / "PAGE-PROGRAMME.csv")
    qualifications = read_csv(DEVELOPMENT / "CANDIDATE-QUALIFICATION-REGISTER.csv")
    sitemap_urls = {
        node.text.strip()
        for node in ET.parse(ROOT / "sitemap.xml").iter()
        if node.tag.endswith("loc") and node.text
    }
    search_index = (ROOT / "assets" / "site-search-index.js").read_text(encoding="utf-8")
    tracker_by_id = {row["id"]: row for row in tracker}
    qualification_by_id = {row["candidate_id"]: row for row in qualifications}
    keyword_by_id = {row["candidate_id"]: row for row in keywords}
    source_ids = {row["source_id"] for row in sources}
    counts = {}
    seen_urls = set()
    errors = []
    checked_records = 0

    if len(tracker_by_id) != len(tracker):
        errors.append("PAGE-TRACKER.csv contains duplicate IDs.")
    if tracker and any(field not in tracker[0] for field in REQUIRED_TRACKER_FIELDS):
        errors.append("PAGE-TRACKER.csv is missing one or more delivery and approval status fields.")
    if len(keyword_by_id) != len(keywords):
        errors.append("KEYWORD-INTENT-MAP.csv contains duplicate candidate IDs.")
    if len(source_ids) != len(sources):
        errors.append("RESEARCH-SOURCE-REGISTER.csv contains duplicate source IDs.")

    for candidate in candidates:
        candidate_id = candidate["candidate_id"]
        url = candidate["proposed_url"]
        category = candidate["category"]
        counts[category] = counts.get(category, 0) + 1
        if (
            not url.startswith("/")
            or url.startswith("//")
            or any(character.isspace() for character in url)
            or "?" in url
            or "#" in url
            or not (url.endswith("/") or url.endswith(".html"))
        ):
            errors.append(f"{candidate_id}: URL must be a clean root-relative page path: {url}")
        if url in seen_urls:
            errors.append(f"{candidate_id}: duplicate candidate URL: {url}")
        seen_urls.add(url)

        tracked = tracker_by_id.get(candidate_id)
        if tracked is None:
            errors.append(f"{candidate_id}: missing PAGE-TRACKER.csv row.")
            continue
        if tracked["proposed_url"] != url:
            errors.append(f"{candidate_id}: tracker URL does not match candidate register.")
        if tracked["page_group"] != category:
            errors.append(f"{candidate_id}: tracker category does not match candidate register.")
        if tracked["search_sitemap_status"] != "excluded":
            errors.append(f"{candidate_id}: tracker does not mark the candidate excluded.")
        if tracked["publication_status"] not in {"not_approved", "not_published"}:
            errors.append(f"{candidate_id}: tracker does not mark the page unpublished and unapproved.")
        qualification = qualification_by_id.get(candidate_id)
        if qualification is None:
            errors.append(f"{candidate_id}: missing candidate qualification register row.")
        elif tracked.get("qualification_status") != qualification["qualification_status"]:
            errors.append(f"{candidate_id}: tracker qualification status does not match qualification register.")
        if tracked.get("approval_status") != candidate["approval_status"]:
            errors.append(f"{candidate_id}: tracker approval status does not match candidate register.")
        if tracked.get("visual_design_status") != "provisional_owner_references_pending":
            errors.append(f"{candidate_id}: tracker must keep final visual design provisional.")

        keyword_row = keyword_by_id.get(candidate_id)
        if keyword_row is None:
            errors.append(f"{candidate_id}: missing KEYWORD-INTENT-MAP.csv row.")
        else:
            if keyword_row["proposed_url"] != url:
                errors.append(f"{candidate_id}: keyword-map URL does not match candidate register.")
            if keyword_row["primary_keyword"] != candidate["primary_keywords"]:
                errors.append(f"{candidate_id}: keyword-map primary keyword does not match candidate register.")
            if keyword_row["search_volume_status"] != "not_available":
                errors.append(f"{candidate_id}: keyword-map search-volume status must be not_available.")

        record_path = ROOT / candidate["blueprint_path"]
        if not record_path.is_file():
            errors.append(f"{candidate_id}: missing blueprint {candidate['blueprint_path']}.")

        record_relative = candidate.get("research_record", "")
        if not record_relative:
            record_relative = f"development/research/records/{candidate_id}.json"
        research_path = ROOT / record_relative
        if not research_path.is_file():
            errors.append(f"{candidate_id}: missing research record {record_relative}.")
            continue

        try:
            record = json.loads(research_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            errors.append(f"{candidate_id}: invalid research record: {error}")
            continue
        if record.get("record_status") == "not_started":
            continue
        checked_records += 1
        if record.get("id") != candidate_id:
            errors.append(f"{candidate_id}: research record ID does not match candidate register.")
        if record.get("page_title") != candidate["page_title"]:
            errors.append(f"{candidate_id}: research record title does not match candidate register.")
        if record.get("proposed_url") != url:
            errors.append(f"{candidate_id}: research record URL does not match candidate register.")
        if record.get("page_group") != category:
            errors.append(f"{candidate_id}: research record category does not match candidate register.")
        for field in REQUIRED_RECORD_FIELDS:
            value = record.get(field)
            if value is None or value == "" or value == []:
                errors.append(f"{candidate_id}: research record is missing {field}.")
        for field in ("search_intent", "competitor_research", "authoritative_sources"):
            if not record.get(field):
                errors.append(f"{candidate_id}: {field} must record findings or an explicit pending status.")
        missing_sources = {
            source.get("source_id")
            for source in record.get("authoritative_sources", [])
            if source.get("source_id") not in source_ids
        }
        if missing_sources:
            errors.append(f"{candidate_id}: research sources missing from source register: {sorted(missing_sources)}")
        if record.get("approval_status") != candidate["approval_status"]:
            errors.append(f"{candidate_id}: approval status mismatch between register and record.")
        if candidate["publication_status"] != "not_published":
            errors.append(f"{candidate_id}: candidate register does not mark the page unpublished.")
        if candidate["search_sitemap_status"] != "excluded":
            errors.append(f"{candidate_id}: candidate register does not mark the page excluded.")
        if candidate["approval_status"] != "approved_for_research_only":
            for internal_url in record.get("internal_link_opportunities", []):
                internal_canonical = f"https://www.kovcareeragency.org{internal_url}"
                if internal_canonical not in sitemap_urls:
                    errors.append(
                        f"{candidate_id}: internal-link recommendation is not a published sitemap URL: {internal_url}"
                    )
        if url in search_index:
            errors.append(f"{candidate_id}: candidate URL appears in the search index.")
        canonical = f"https://www.kovcareeragency.org{url}"
        if canonical in sitemap_urls:
            errors.append(f"{candidate_id}: candidate URL appears in the public sitemap.")

    for row in programme:
        category = row["page_group"]
        count = counts.get(category, 0)
        if int(row["candidate_urls_defined"]) != count:
            errors.append(
                f"{category}: programme says {row['candidate_urls_defined']} candidates; "
                f"register contains {count}."
            )
        shortfall = int(row["target_count"]) - count
        if shortfall < 0:
            errors.append(f"{category}: candidate count exceeds quota.")
        if "candidate_url_shortfall" in row and int(row["candidate_url_shortfall"]) != shortfall:
            errors.append(f"{category}: candidate_url_shortfall is not synchronized.")

    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors))
        return 1
    quota_total = sum(int(row["target_count"]) for row in programme)
    defined_total = sum(counts.values())
    print(
        f"Research programme valid: {len(candidates)} URLs defined across "
        f"{len(counts)} categories; {checked_records} research records checked; "
        f"{defined_total}/{quota_total} quota URLs defined; all candidates unpublished and excluded."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
