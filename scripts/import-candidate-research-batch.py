import csv
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
REGISTER_FIELDS = [
    "candidate_id", "category", "page_title", "proposed_url", "parent_hub",
    "primary_keywords", "secondary_keywords", "search_intent", "intended_audience",
    "geographic_relevance", "competitor_research", "credible_sources",
    "commercial_relevance", "unique_content_purpose", "internal_link_opportunities",
    "duplication_cannibalisation_assessment", "research_status", "approval_status",
    "blueprint_path", "implementation_status", "search_sitemap_status",
    "publication_status", "notes",
]


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path, rows):
    if not rows:
        return
    fields = list(rows[0])
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def slug_category(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def item_list(values):
    return "; ".join(values)


def expand_candidate_templates(value, context):
    if isinstance(value, str):
        return value.format_map(context)
    if isinstance(value, list):
        return [expand_candidate_templates(item, context) for item in value]
    if isinstance(value, dict):
        return {
            key: expand_candidate_templates(item, context)
            for key, item in value.items()
        }
    return value


def build_research_record(batch, candidate, source_map, url, blueprint_path):
    source_ids = candidate["source_ids"]
    missing = sorted(set(source_ids) - set(source_map))
    if missing:
        raise ValueError(f"{candidate['id']}: unknown source IDs {missing}")
    sources = [source_map[source_id] for source_id in source_ids]
    search_intent = {
        "primary_query": candidate["primary_keywords"][0],
        "secondary_queries": candidate["secondary_keywords"],
        "intent": candidate["search_intent"],
        "evidence": candidate.get("intent_evidence", []),
    }
    return {
        "id": candidate["id"],
        "page_title": candidate["title"],
        "proposed_url": url,
        "page_group": candidate.get("category", batch["category"]),
        "parent_hub": candidate.get("parent_hub", batch.get("parent_hub", "/career-resources/")),
        "candidate_status": candidate.get("candidate_status", "initially_qualified_pending_review"),
        "approval_status": "not_approved",
        "record_status": candidate.get("research_status", "initial_research_screen_complete"),
        "research_owner": "development",
        "research_updated": batch["screen_date"],
        "primary_keywords": candidate["primary_keywords"],
        "secondary_keywords": candidate["secondary_keywords"],
        "keyword_metrics": {
            "volume_status": "not_available",
            "source": "No Search Console, Google Keyword Planner, or validated third-party keyword export was supplied for this candidate.",
            "note": "Search terms are hypotheses only; no volume, difficulty, or demand is asserted.",
        },
        "search_intent": search_intent,
        "intended_audience": candidate["intended_audience"],
        "audience_and_geography": {
            "audience": candidate["intended_audience"],
            "geography": candidate["geographic_relevance"],
        },
        "geographic_relevance": candidate["geographic_relevance"],
        "competitor_research": candidate["competitor_research"],
        "commercial_relevance": candidate["commercial_relevance"],
        "unique_content_purpose": candidate["unique_content_purpose"],
        "internal_link_opportunities": candidate["internal_link_opportunities"],
        "duplication_and_cannibalisation_assessment": candidate["overlap_assessment"],
        "demand_and_competition": {
            "keyword_sources": [],
            "competitor_pages": [
                competitor.get("url")
                for competitor in candidate["competitor_research"]
                if competitor.get("url")
            ],
            "evidence_and_date": candidate.get("market_evidence", []),
        },
        "authoritative_sources": sources,
        "unique_value_and_overlap": {
            "user_need": candidate["unique_content_purpose"],
            "existing_page_overlap_review": candidate["overlap_assessment"],
            "canonical_or_consolidation_decision": candidate.get(
                "canonical_or_consolidation_decision",
                "Candidate URL only; recheck current sitemap and page text before implementation.",
            ),
        },
        "factual_gaps_and_risks": candidate["factual_gaps_and_risks"],
        "blueprint_path": blueprint_path,
        "content_status": "not_started",
        "publication_status": "not_approved",
        "notes": [
            "Candidate is for development review only; no HTML page has been created.",
            "Keep excluded from public navigation, sitemap, and search pending approval.",
        ],
    }


def build_blueprint(batch, candidate, record, blueprint_path):
    source_lines = [
        f"- **{source['title']}** ({source['publisher']}) — {source['url_or_path']}: "
        f"{source['research_use_and_limit']} Access: {source['access_status']}."
        for source in record["authoritative_sources"]
    ]
    competitor_lines = [
        f"- **{item['name']}** — {item.get('url', 'URL not supplied')}: "
        f"{item['finding']} Status: {item['status']}."
        for item in candidate["competitor_research"]
    ]
    outline = "\n".join(f"- {section}" for section in candidate["proposed_outline"])
    internals = ", ".join(f"`{url}`" for url in candidate["internal_link_opportunities"])
    return f"""# {candidate['title']}

- **Candidate ID:** `{candidate['id']}`
- **Proposed URL:** `{record['proposed_url']}`
- **Category:** `{record['page_group']}`
- **Parent hub:** `{record['parent_hub']}`
- **Research record:** [`{candidate['id']}.json`](../../research/records/{candidate['id']}.json)
- **Blueprint status:** Initial research screen; pending review

## Purpose and audience

{candidate['unique_content_purpose']}

**Audience:** {candidate['intended_audience']}  
**Geographic scope:** {candidate['geographic_relevance']}

## Search intent and keyword hypotheses

- **Primary:** {candidate['primary_keywords'][0]}
- **Secondary:** {item_list(candidate['secondary_keywords'])}
- **Intent:** {candidate['search_intent']}
- **Search volume/difficulty:** Not available; no quantitative demand claim is made.

## Existing-site overlap and differentiation

{candidate['overlap_assessment']}

## External competitor and reference review

{chr(10).join(competitor_lines)}

This is qualitative page review, not a complete or location-neutral SERP ranking study.

## Proposed page-specific outline

{outline}

## Sources and factual limits

{chr(10).join(source_lines)}

## Internal links and release requirements

Potential links to verify during implementation: {internals}.

{chr(10).join(f"- {risk}" for risk in candidate['factual_gaps_and_risks'])}

Keep the candidate unpublished and absent from public navigation, sitemap, and internal search until content, QA, and owner release approval are complete.
"""


def load_dispositions(batch):
    rows = []
    for item in batch.get("rejected_merged_held", []):
        rows.append({
            "batch_id": batch["batch_id"],
            "category": item.get("category", batch["category"]),
            "topic": item["topic"],
            "proposed_url": "",
            "disposition": item["disposition"],
            "reason": item["reason"],
            "overlap_or_evidence": item.get("overlap_or_evidence", ""),
            "source_ids": item_list(item.get("source_ids", [])),
            "next_action": item.get("next_action", ""),
        })
    return rows


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python import-candidate-research-batch.py <batch.json>")
    batch_path = Path(sys.argv[1])
    if not batch_path.is_absolute():
        batch_path = ROOT / batch_path
    batch = json.loads(batch_path.read_text(encoding="utf-8"))
    candidate_inputs = batch["candidates"]
    candidate_defaults = batch.get("candidate_defaults", {})
    batch["candidates"] = []
    for candidate_input in candidate_inputs:
        candidate = {**candidate_defaults, **candidate_input}
        batch["candidates"].append(expand_candidate_templates(candidate, candidate))
    source_map = {source["source_id"]: source for source in batch["sources"]}
    if len(source_map) != len(batch["sources"]):
        raise ValueError("Source IDs must be unique within a batch.")

    candidate_path = DEVELOPMENT / "CANDIDATE-REGISTER.csv"
    candidate_rows = read_csv(candidate_path)
    candidate_by_id = {row["candidate_id"]: row for row in candidate_rows}
    tracker_path = DEVELOPMENT / "PAGE-TRACKER.csv"
    tracker_rows = read_csv(tracker_path)
    tracker_by_id = {row["id"]: row for row in tracker_rows}
    keyword_path = DEVELOPMENT / "KEYWORD-INTENT-MAP.csv"
    keyword_rows = read_csv(keyword_path)
    keyword_by_id = {row["candidate_id"]: row for row in keyword_rows}
    source_register_path = DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv"
    source_register = read_csv(source_register_path)
    source_register_by_id = {row["source_id"]: row for row in source_register}

    existing_urls = {
        row["proposed_url"]: row["candidate_id"]
        for row in candidate_rows
    }
    records_dir = DEVELOPMENT / "research" / "records"
    records_dir.mkdir(parents=True, exist_ok=True)

    for source in batch["sources"]:
        prior = source_register_by_id.get(source["source_id"])
        if prior and prior["url_or_path"] != source["url_or_path"]:
            raise ValueError(f"Source ID collision: {source['source_id']}")
        source_register_by_id[source["source_id"]] = source

    batch_ids = set()
    batch_urls = set()
    pending_artifacts = []
    for candidate in batch["candidates"]:
        candidate_id = candidate["id"]
        category = candidate.get("category", batch["category"])
        category_slug = slug_category(category)
        if candidate_id in batch_ids:
            raise ValueError(f"Duplicate candidate ID in batch: {candidate_id}")
        batch_ids.add(candidate_id)
        if candidate_id in candidate_by_id:
            raise ValueError(f"Candidate ID already exists: {candidate_id}")
        slug = candidate.get("slug", candidate_id)
        url = candidate.get(
            "proposed_url",
            f"{batch.get('parent_hub', '/career-resources/')}{category_slug}/{slug}/",
        )
        if not url.startswith("/") or url.startswith("//"):
            raise ValueError(f"Candidate URL must be a site-relative path: {url}")
        if url in batch_urls:
            raise ValueError(f"Duplicate URL in batch: {url}")
        batch_urls.add(url)
        if url in existing_urls:
            raise ValueError(f"Candidate URL already exists for {existing_urls[url]}: {url}")

        blueprint_path = f"development/blueprints/{category_slug}/{candidate_id}.md"
        record_path = f"development/research/records/{candidate_id}.json"
        record = build_research_record(batch, candidate, source_map, url, blueprint_path)
        pending_artifacts.append((
            ROOT / record_path,
            ROOT / blueprint_path,
            record,
            build_blueprint(batch, candidate, record, blueprint_path),
        ))

        candidate_by_id[candidate_id] = {
            "candidate_id": candidate_id,
            "category": category,
            "page_title": candidate["title"],
            "proposed_url": url,
            "parent_hub": candidate.get("parent_hub", batch.get("parent_hub", "/career-resources/")),
            "primary_keywords": candidate["primary_keywords"][0],
            "secondary_keywords": item_list(candidate["secondary_keywords"]),
            "search_intent": candidate["search_intent"],
            "intended_audience": candidate["intended_audience"],
            "geographic_relevance": candidate["geographic_relevance"],
            "competitor_research": "; ".join(
                f"{item['name']}: {item['status']}" for item in candidate["competitor_research"]
            ),
            "credible_sources": item_list(candidate["source_ids"]),
            "commercial_relevance": candidate["commercial_relevance"],
            "unique_content_purpose": candidate["unique_content_purpose"],
            "internal_link_opportunities": item_list(candidate["internal_link_opportunities"]),
            "duplication_cannibalisation_assessment": candidate["overlap_assessment"],
            "research_status": candidate.get("research_status", "initial_research_screen_complete"),
            "approval_status": "not_approved",
            "blueprint_path": blueprint_path,
            "implementation_status": "not_started",
            "search_sitemap_status": "excluded",
            "publication_status": "not_published",
            "notes": "Candidate URL only; no public HTML, search entry, or sitemap entry created.",
        }
        tracker_by_id[candidate_id] = {
            "id": candidate_id,
            "proposed_url": url,
            "staging_preview_url": "",
            "page_group": category,
            "parent_hub": candidate.get("parent_hub", batch.get("parent_hub", "/career-resources/")),
            "candidate_status": candidate.get("candidate_status", "initially_qualified_pending_review"),
            "owner": "development",
            "research_status": candidate.get("research_status", "initial_research_screen_complete"),
            "research_record": record_path,
            "blueprint_status": "drafted_for_review",
            "blueprint_file": blueprint_path,
            "content_status": "not_started",
            "implementation_status": "not_started",
            "qa_status": "not_run",
            "search_sitemap_status": "excluded",
            "publication_status": "not_approved",
            "notes": "No candidate page created; owner approval required before publication.",
        }
        keyword_by_id[candidate_id] = {
            "candidate_id": candidate_id,
            "proposed_url": url,
            "primary_keyword": candidate["primary_keywords"][0],
            "secondary_keywords": item_list(candidate["secondary_keywords"]),
            "search_intent": candidate["search_intent"],
            "geography": candidate["geographic_relevance"],
            "keyword_source": "Editorial hypothesis; no keyword tool export",
            "search_volume_status": "not_available",
            "competitor_serp_status": "page-level review recorded; full SERP ranking study pending",
            "research_status": candidate.get("research_status", "initial_research_screen_complete"),
            "notes": "No search volume, difficulty, or ranking likelihood is asserted.",
        }

    write_csv(candidate_path, sorted(candidate_by_id.values(), key=lambda row: (row["category"], row["candidate_id"])))
    write_csv(tracker_path, sorted(tracker_by_id.values(), key=lambda row: (row["page_group"], row["id"])))
    write_csv(keyword_path, sorted(keyword_by_id.values(), key=lambda row: row["candidate_id"]))
    write_csv(source_register_path, sorted(source_register_by_id.values(), key=lambda row: row["source_id"]))

    dispositions_path = DEVELOPMENT / "CANDIDATE-DISPOSITION-REGISTER.csv"
    prior_dispositions = read_csv(dispositions_path) if dispositions_path.exists() else []
    new_dispositions = load_dispositions(batch)
    prior_keys = {(row["batch_id"], row["topic"]) for row in prior_dispositions}
    for row in new_dispositions:
        if (row["batch_id"], row["topic"]) in prior_keys:
            raise ValueError(f"Disposition already recorded: {row['topic']}")

    for record_path, blueprint_path, record, blueprint in pending_artifacts:
        record_path.parent.mkdir(parents=True, exist_ok=True)
        blueprint_path.parent.mkdir(parents=True, exist_ok=True)
        record_path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        blueprint_path.write_text(blueprint, encoding="utf-8")

    write_csv(dispositions_path, prior_dispositions + new_dispositions)

    programme_path = DEVELOPMENT / "PAGE-PROGRAMME.csv"
    programme = read_csv(programme_path)
    for row in programme:
        if row["page_group"] in {candidate.get("category", batch["category"]) for candidate in batch["candidates"]}:
            category = row["page_group"]
            category_candidates = [
                candidate for candidate in candidate_by_id.values()
                if candidate["category"] == category
            ]
            count = len(category_candidates)
            row["candidate_urls_defined"] = count
            row["candidate_url_shortfall"] = int(row["target_count"]) - count
            row["research_records_created"] = sum(
                1 for candidate in category_candidates
                if (records_dir / f"{candidate['candidate_id']}.json").exists()
            )
            row["blueprints_created"] = sum(
                1 for candidate in category_candidates
                if (ROOT / candidate["blueprint_path"]).exists()
            )
            row["status"] = "candidate_batch_researched"
            row["notes"] = batch.get("programme_notes", {}).get(
                category,
                batch.get("programme_note", row["notes"]),
            )
    write_csv(programme_path, programme)

    category_counts = {}
    for candidate in batch["candidates"]:
        category = candidate.get("category", batch["category"])
        category_counts[category] = category_counts.get(category, 0) + 1
    report_lines = [
        f"# {batch['report_title']}",
        "",
        f"**Research date:** {batch['screen_date']}  ",
        f"**Status:** {batch['summary']}",
        "",
        "## Candidate counts by category",
        "",
        *[
            f"- **{category}:** {count} candidate URL(s); all remain unpublished."
            for category, count in sorted(category_counts.items())
        ],
        "",
        "## Individually researched candidate pages",
        "",
    ]
    for candidate in batch["candidates"]:
        report_lines.extend([
            f"### {candidate['title']}",
            "",
            f"- **Category:** `{candidate.get('category', batch['category'])}`",
            f"- **Candidate URL:** `{candidate_by_id[candidate['id']]['proposed_url']}`",
            f"- **Audience/geography:** {candidate['intended_audience']} / {candidate['geographic_relevance']}",
            f"- **Primary query hypothesis:** {candidate['primary_keywords'][0]}",
            f"- **Intent:** {candidate['search_intent']}",
            f"- **KOV relevance:** {candidate['commercial_relevance']}",
            f"- **Unique purpose:** {candidate['unique_content_purpose']}",
            f"- **Differentiation/overlap:** {candidate['overlap_assessment']}",
            f"- **Recommended internal links:** {item_list(candidate['internal_link_opportunities'])}",
            f"- **Sources:** {item_list(candidate['source_ids'])}",
            f"- **Competitor review:** {'; '.join(item['name'] + ': ' + item['status'] for item in candidate['competitor_research'])}",
            "- **Volume/SERP:** No keyword volume is claimed; competitor page review is not a full SERP ranking study.",
            f"- **Unresolved research gates:** {item_list(candidate['factual_gaps_and_risks'])}",
            "",
        ])
    report_lines.extend(["## Rejected, merged, or held topics", ""])
    for item in batch.get("rejected_merged_held", []):
        report_lines.extend([
            f"- **{item['topic']} — {item['disposition']}:** {item['reason']} "
            f"Next action: {item.get('next_action', 'None recorded.')}",
        ])
    report_lines.extend([
        "",
        "## Remaining quota and next batch",
        "",
        batch["quota_and_next_batch"],
        "",
        "Candidate URLs remain excluded from published HTML, public navigation, sitemap, and search. No existing page was edited.",
        "",
    ])
    (DEVELOPMENT / batch["report_path"]).write_text("\n".join(report_lines), encoding="utf-8")
    subprocess.run(
        [sys.executable, "-B", str(ROOT / "scripts" / "build-candidate-qualification-register.py")],
        cwd=ROOT,
        check=True,
    )
    print(
        f"Imported {len(batch['candidates'])} candidates across {len(category_counts)} categories; "
        f"{len(new_dispositions)} rejected/merged/held topics; outputs remain unpublished."
    )


if __name__ == "__main__":
    main()
