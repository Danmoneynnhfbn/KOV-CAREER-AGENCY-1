import csv
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
PUBLIC_ORIGIN = "https://www.kovcareeragency.org"


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def route_file(url):
    relative = url.lstrip("/")
    path = ROOT / relative
    if path.is_dir() or (not path.suffix and not path.exists()):
        path = path / "index.html"
    elif not path.suffix:
        path = path.with_suffix(".html")
    try:
        path.resolve().relative_to(ROOT.resolve())
    except ValueError:
        return None
    return path if path.is_file() else None


def robot_directives(html):
    head = re.search(r"<head\b[^>]*>([\s\S]*?)</head\s*>", html, re.I)
    if not head:
        return []
    return [
        match.group(1).lower()
        for match in re.finditer(
            r"<meta\b(?=[^>]*\bname\s*=\s*['\"]robots['\"])[^>]*\bcontent\s*=\s*['\"]([^'\"]*)['\"][^>]*>",
            head.group(1),
            re.I,
        )
    ]


def main():
    candidates = read_csv(DEVELOPMENT / "CANDIDATE-REGISTER.csv")
    tracker = read_csv(DEVELOPMENT / "PAGE-TRACKER.csv")
    qualifications = read_csv(DEVELOPMENT / "CANDIDATE-QUALIFICATION-REGISTER.csv")
    keywords = read_csv(DEVELOPMENT / "KEYWORD-INTENT-MAP.csv")
    sources = read_csv(DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv")
    sitemap_urls = {
        node.text.strip()
        for node in ET.parse(ROOT / "sitemap.xml").iter()
        if node.tag.endswith("loc") and node.text
    }
    search_index = (ROOT / "assets" / "site-search-index.js").read_text(encoding="utf-8")

    errors = []
    warnings = []
    tracker_by_id = {row["id"]: row for row in tracker}
    qualification_by_id = {row["candidate_id"]: row for row in qualifications}
    keyword_by_id = {row["candidate_id"]: row for row in keywords}
    source_ids = {row["source_id"] for row in sources}
    candidate_by_id = {row["candidate_id"]: row for row in candidates}

    if len(candidate_by_id) != len(candidates):
        errors.append("CANDIDATE-REGISTER.csv contains duplicate IDs.")
    if len(tracker_by_id) != len(tracker):
        errors.append("PAGE-TRACKER.csv contains duplicate IDs.")
    if len(qualification_by_id) != len(qualifications):
        errors.append("CANDIDATE-QUALIFICATION-REGISTER.csv contains duplicate IDs.")
    if len(keyword_by_id) != len(keywords):
        errors.append("KEYWORD-INTENT-MAP.csv contains duplicate IDs.")
    if len(source_ids) != len(sources):
        errors.append("RESEARCH-SOURCE-REGISTER.csv contains duplicate source IDs.")
    if set(qualification_by_id) != set(keyword_by_id):
        errors.append("Qualification and keyword research registers do not contain the same candidate IDs.")

    # Route inventory and evidence registers are separate stages. A generated,
    # unpublished route does not imply a completed research package.
    seen_urls = set()
    route_blueprints = 0
    routes_without_blueprints = 0
    route_files_found = 0
    route_noindex = 0
    for candidate in candidates:
        candidate_id = candidate["candidate_id"]
        url = candidate["proposed_url"]
        if not url.startswith("/") or url.startswith("//") or any(c.isspace() for c in url) or "?" in url or "#" in url:
            errors.append(f"{candidate_id}: proposed route is not a clean root-relative path: {url}")
        if url in seen_urls:
            errors.append(f"{candidate_id}: duplicate proposed route: {url}")
        seen_urls.add(url)

        row = tracker_by_id.get(candidate_id)
        if row is None:
            errors.append(f"{candidate_id}: missing PAGE-TRACKER.csv row.")
            continue
        if row.get("proposed_url") != url or row.get("page_group") != candidate.get("category"):
            errors.append(f"{candidate_id}: tracker route or category differs from the candidate register.")
        if row.get("search_sitemap_status") != "excluded" or candidate.get("search_sitemap_status") != "excluded":
            errors.append(f"{candidate_id}: staged route must remain excluded from the public sitemap.")
        if row.get("publication_status") != "not_published" or candidate.get("publication_status") != "not_published":
            errors.append(f"{candidate_id}: staged route must remain unpublished.")
        # The approved checkpoint explicitly leaves generated pages unstyled.
        if row.get("visual_design_status") != "unstyled_html_per_current_instruction":
            errors.append(f"{candidate_id}: visual design status does not match the approved unstyled staging state.")
        if row.get("approval_status") != candidate.get("approval_status"):
            errors.append(f"{candidate_id}: route-staging approval status differs between route registers.")

        preview_url = row.get("staging_preview_url", "")
        file_path = route_file(preview_url) if preview_url.startswith("/directory/") else None
        if file_path is None:
            errors.append(f"{candidate_id}: staged preview HTML route is missing locally: {preview_url or url}")
        else:
            route_files_found += 1
            html = file_path.read_text(encoding="utf-8-sig", errors="replace")
            directives = robot_directives(html)
            if not directives or not all("noindex" in value for value in directives):
                errors.append(f"{candidate_id}: staged page is missing a robots noindex directive.")
            else:
                route_noindex += 1
        canonical = f"{PUBLIC_ORIGIN}{url}"
        if canonical in sitemap_urls:
            errors.append(f"{candidate_id}: staged route appears in the public sitemap.")
        if url in search_index:
            errors.append(f"{candidate_id}: staged route appears in the public search index.")

        blueprint = candidate.get("blueprint_path", "").strip()
        tracked_blueprint = row.get("blueprint_file", "").strip()
        if blueprint:
            blueprint_path = ROOT / blueprint
            if blueprint_path.is_file():
                route_blueprints += 1
                if tracked_blueprint != blueprint:
                    errors.append(f"{candidate_id}: tracker blueprint path differs from the existing candidate blueprint.")
            else:
                routes_without_blueprints += 1
                warnings.append(f"{candidate_id}: blueprint path is recorded but not present: {blueprint}")
        elif tracked_blueprint:
            errors.append(f"{candidate_id}: tracker references a blueprint absent from the candidate register.")

    orphan_tracker_ids = set(tracker_by_id) - set(candidate_by_id)
    if orphan_tracker_ids:
        errors.append(f"PAGE-TRACKER.csv has {len(orphan_tracker_ids)} rows without a candidate route.")

    # Validate the separately maintained researched-candidate cohort against
    # its own records. Qualification/approval here concerns research and
    # content gates; route approval above only means permitted noindex staging.
    research_record_count = 0
    blueprint_count = 0
    source_reference_count = 0
    qualification_candidate_routes = 0
    for candidate_id, qualification in qualification_by_id.items():
        keyword = keyword_by_id.get(candidate_id)
        if keyword is None:
            errors.append(f"{candidate_id}: missing keyword evidence row.")
            continue
        if keyword.get("proposed_url") != qualification.get("proposed_url"):
            errors.append(f"{candidate_id}: qualification and keyword routes differ.")
        if keyword.get("search_volume_status") != "not_available":
            errors.append(f"{candidate_id}: keyword register must not claim unavailable search-volume evidence.")
        if candidate_id in candidate_by_id:
            qualification_candidate_routes += 1
            if candidate_by_id[candidate_id]["proposed_url"] != qualification["proposed_url"]:
                errors.append(f"{candidate_id}: shared candidate ID has conflicting route paths.")
        if qualification.get("publication_status") != "not_published":
            errors.append(f"{candidate_id}: researched candidate must remain unpublished pending release.")

        record_path = DEVELOPMENT / "research" / "records" / f"{candidate_id}.json"
        if not record_path.is_file():
            errors.append(f"{candidate_id}: missing research record {record_path.relative_to(ROOT)}.")
            continue
        try:
            record = json.loads(record_path.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError) as error:
            errors.append(f"{candidate_id}: invalid research record: {error}")
            continue
        research_record_count += 1
        if record.get("id") != candidate_id:
            errors.append(f"{candidate_id}: research record ID does not match its qualification row.")
        if record.get("proposed_url") != qualification.get("proposed_url"):
            errors.append(f"{candidate_id}: research record URL does not match its qualification row.")
        if record.get("page_group") != qualification.get("category"):
            errors.append(f"{candidate_id}: research record category does not match its qualification row.")
        for field in ("page_title", "primary_keywords", "search_intent", "intended_audience", "geographic_relevance", "competitor_research", "commercial_relevance", "unique_content_purpose", "duplication_and_cannibalisation_assessment", "authoritative_sources"):
            if record.get(field) in (None, "", []):
                errors.append(f"{candidate_id}: research record is missing {field}.")
        primary_keywords = record.get("primary_keywords", [])
        if isinstance(primary_keywords, str):
            primary_keywords = [primary_keywords]
        if keyword.get("primary_keyword") not in primary_keywords:
            errors.append(f"{candidate_id}: keyword map does not match the research record primary keyword.")

        record_blueprint = record.get("blueprint_path", "")
        if not record_blueprint or not (ROOT / record_blueprint).is_file():
            errors.append(f"{candidate_id}: research record blueprint is missing or unresolved.")
        else:
            blueprint_count += 1
        for source in record.get("authoritative_sources", []):
            source_id = source.get("source_id") if isinstance(source, dict) else None
            if not source_id or source_id not in source_ids:
                errors.append(f"{candidate_id}: source reference is missing from the source register: {source_id}")
            else:
                source_reference_count += 1

        # Distinguish equivalent stage wording while preventing a research
        # record from overruling a stricter publication gate.
        q_approval = qualification.get("approval_status")
        record_approval = record.get("approval_status")
        equivalent_staging = q_approval == "staging_development_only" and record_approval in {
            "approved_for_unpublished_staging_development_only", "approved_for_development"
        }
        if record_approval != q_approval and not equivalent_staging:
            errors.append(f"{candidate_id}: research approval conflicts with the qualification register.")
        if record.get("publication_status") not in {None, "not_published", "not_approved"}:
            errors.append(f"{candidate_id}: research record indicates publication without release approval.")

    # Package and route cohorts are not interchangeable. Keep the coverage
    # discrepancy visible instead of manufacturing bridge records.
    routes_without_research = set(candidate_by_id) - set(qualification_by_id)
    research_without_route = set(qualification_by_id) - set(candidate_by_id)
    if routes_without_research:
        warnings.append(f"{len(routes_without_research)} staging routes have no matching qualified research package.")
    if research_without_route:
        warnings.append(f"{len(research_without_route)} research packages are outside the current candidate route register.")

    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors))
        print(f"Research programme integrity: FAIL ({len(errors)} errors).")
        return 1

    quota_rows = read_csv(DEVELOPMENT / "PAGE-PROGRAMME.csv")
    quota_total = sum(int(row["target_count"]) for row in quota_rows)
    defined_total = sum(int(row["candidate_urls_defined"]) for row in quota_rows)
    summary = {
        "integrityStatus": "PASS",
        "completionStatus": "PARTIAL",
        "stagingRoutes": len(candidates),
        "stagingTrackerRows": len(tracker),
        "localStagingHtml": route_files_found,
        "stagingNoindexVerified": route_noindex,
        "researchCandidates": len(qualifications),
        "keywordRows": len(keywords),
        "researchRecordsParsed": research_record_count,
        "researchBlueprintsVerified": blueprint_count,
        "researchSourceReferencesVerified": source_reference_count,
        "researchedCandidatesMappedToCurrentRoutes": qualification_candidate_routes,
        "stagingRoutesWithoutResearchPackage": len(routes_without_research),
        "researchPackagesWithoutCurrentRoute": len(research_without_route),
        "existingRouteBlueprints": route_blueprints,
        "unresolvedRouteBlueprintReferences": routes_without_blueprints,
        "programmeQuotaRows": len(quota_rows),
        "programmeQuotaDefined": f"{defined_total}/{quota_total}",
        "warnings": warnings,
    }
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
