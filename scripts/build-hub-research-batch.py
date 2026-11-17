import csv
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
RECORDS = DEVELOPMENT / "research" / "records"

SOURCES = [
    {
        "source_id": "HBR-CAREER-PLANNING",
        "source_type": "External career information publisher",
        "title": "Harvard Business Review: Career Planning topic",
        "publisher": "Harvard Business Review",
        "url_or_path": "https://hbr.org/topic/subject/career-planning",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "The page aggregates career-planning content, including executive-career coverage; format benchmark only, not a measured search result or evidence of demand.",
    },
    {
        "source_id": "HBR-EXECUTIVE-CAREER-ARC",
        "source_type": "External career information publisher",
        "title": "The Predictable Executive Career Arc Is Over",
        "publisher": "Harvard Business Review",
        "url_or_path": "https://hbr.org/2026/08/the-predictable-executive-career-arc-is-over",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Discusses senior leaders' career planning amid longer working lives and change; topic reference only, not evidence of KOV serviceability or search demand.",
    },
    {
        "source_id": "ONET-ONLINE",
        "source_type": "Official occupational resource",
        "title": "O*NET OnLine",
        "publisher": "U.S. Department of Labor / O*NET Resource Center",
        "url_or_path": "https://www.onetonline.org/",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Describes its occupational exploration and analysis tools; U.S.-focused comparator, not an executive-career service or global resource.",
    },
    {
        "source_id": "INDEED-CAREER-ADVICE",
        "source_type": "External career information publisher",
        "title": "Indeed Career Advice",
        "publisher": "Indeed",
        "url_or_path": "https://www.indeed.com/career-advice",
        "access_status": "Fetch blocked with HTTP 403 on 2026-11-04",
        "research_use_and_limit": "Potential broad career-advice comparator; page contents and current SERP placement not verified.",
    },
    {
        "source_id": "CIPD-REPORTS",
        "source_type": "Professional body research publisher",
        "title": "CIPD Reports",
        "publisher": "Chartered Institute of Personnel and Development",
        "url_or_path": "https://www.cipd.org/en/knowledge/reports/",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Research-library comparator covering work and working lives; does not establish a KOV search opportunity.",
    },
    {
        "source_id": "ILO-WESO-2025",
        "source_type": "Intergovernmental labor-market research",
        "title": "World Employment and Social Outlook: Trends 2025",
        "publisher": "International Labour Organization",
        "url_or_path": "https://www.ilo.org/publications/flagship-reports/world-employment-and-social-outlook-trends-2025",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Research-output benchmark with a report, charts, data finder, and translated summaries; does not validate any original KOV dataset.",
    },
    {
        "source_id": "BOARDPROSPECTS",
        "source_type": "Board-career network and directory",
        "title": "BoardProspects",
        "publisher": "BoardProspects",
        "url_or_path": "https://www.boardprospects.com/",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Presents board readiness, board-search networking, and director visibility; adjacent/direct competitor for any public executive-profile directory.",
    },
    {
        "source_id": "THEORG-STRIPE",
        "source_type": "Professional information directory",
        "title": "The Org: Stripe company profile",
        "publisher": "The Org",
        "url_or_path": "https://theorg.com/org/stripe",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Company profile shows organization-level details such as industry, headquarters, and employee range; not a candidate-profile directory model or evidence of consent practice.",
    },
    {
        "source_id": "LINKEDIN-PRIVACY",
        "source_type": "Professional network policy",
        "title": "LinkedIn Privacy Policy",
        "publisher": "LinkedIn",
        "url_or_path": "https://www.linkedin.com/legal/privacy-policy",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Describes LinkedIn data collection, use, sharing, and member choices; reference for directory privacy review, not legal advice.",
    },
    {
        "source_id": "EU-DATA-PROTECTION",
        "source_type": "Government privacy guidance",
        "title": "Data protection in the EU",
        "publisher": "European Commission",
        "url_or_path": "https://commission.europa.eu/law/law-topic/data-protection_en",
        "access_status": "Verified 2026-11-04",
        "research_use_and_limit": "Summarizes EU data protection framework and guidance limits; applicability requires jurisdiction-specific legal review.",
    },
    {
        "source_id": "KOV-RESOURCES-INVENTORY",
        "source_type": "Internal site inventory",
        "title": "Published career resources and FAQs",
        "publisher": "KOV Career Agency",
        "url_or_path": "resources/ (11 pages); faq/ (30 pages); glossary.html",
        "access_status": "Repository inventory reviewed 2026-11-04",
        "research_use_and_limit": "Used to identify current internal content and overlap; not evidence of user demand.",
    },
    {
        "source_id": "KOV-PROFILE-INVENTORY",
        "source_type": "Internal page and indexability review",
        "title": "Candidate Directory page",
        "publisher": "KOV Career Agency",
        "url_or_path": "profiles.html",
        "access_status": "Reviewed 2026-11-04",
        "research_use_and_limit": "Existing canonical candidate-directory page is robots noindex,nofollow; its data, publication intent, and consent process require review before a public replacement or parallel directory.",
    },
]

HUBS = [
    {
        "id": "career-resources-hub",
        "title": "Career Resources Hub",
        "url": "/career-resources/",
        "category": "career_resources_hub",
        "preview": "/staging/career-resources/",
        "primary": "executive career resources",
        "secondary": ["career resources for executives", "executive career planning", "senior professional career guide"],
        "intent": "Informational/navigation hub; terms are unvalidated query hypotheses.",
        "audience": "Senior and experienced professionals browsing KOV's published career information.",
        "geography": "English-language online information; country-specific applicability is not implied.",
        "sources": ["HBR-CAREER-PLANNING", "HBR-EXECUTIVE-CAREER-ARC", "ONET-ONLINE", "INDEED-CAREER-ADVICE", "KOV-RESOURCES-INVENTORY"],
        "competitors": [
            {"name": "Harvard Business Review Career Planning", "url": "https://hbr.org/topic/subject/career-planning", "finding": "Topic hub aggregates career-planning articles, including C-suite and career-arc coverage.", "status": "page verified; SERP position not measured"},
            {"name": "HBR: The Predictable Executive Career Arc Is Over", "url": "https://hbr.org/2026/08/the-predictable-executive-career-arc-is-over", "finding": "Discusses senior leaders' career planning amid longer working lives and change.", "status": "page verified; topic reference, SERP position not measured"},
            {"name": "O*NET OnLine", "url": "https://www.onetonline.org/", "finding": "Official U.S. career exploration and occupational analysis tool with 900+ occupations.", "status": "page verified; adjacent information tool, not direct executive service"},
            {"name": "Indeed Career Advice", "url": "https://www.indeed.com/career-advice", "finding": "Not assessed; fetch returned HTTP 403.", "status": "competitor page review pending"},
        ],
        "purpose": "A navigational index that organizes KOV's existing candidate-facing career resources and only later adds individually researched guides. It should not duplicate the articles themselves or imply all listed occupations/markets are KOV services.",
        "overlap": "Current materials are already spread across 11 resource pages, 30 FAQs, a glossary, service pages, and role pages. The hub is differentiated only as a curated index; it must link to existing URLs first and not create near-duplicate copy.",
        "internal": ["/resources/salary-offer-negotiation-guide.html", "/resources/executive-job-search-in-your-market.html", "/resources/executive-career-outcomes.html", "/faqs.html", "/glossary.html"],
        "outline": ["Purpose and audience", "Existing resources grouped by researched user task", "Links to current role/market reference pages with scope labels", "Editorial dates and review policy", "How to distinguish guidance from KOV services"],
        "risks": ["No first-party search, traffic, or user-task data was available to validate taxonomy or keyword demand.", "Do not add unresearched guides or imply that taxonomy coverage equals KOV serviceability."],
        "status": "research_screen_complete; demand_and_SERP_validation_pending",
        "candidate_status": "approved_for_development; publication_pending_review",
        "approval": "approved_for_development",
    },
    {
        "id": "research-hub",
        "title": "Research Hub",
        "url": "/research/",
        "category": "research_hub",
        "preview": "/staging/research/",
        "primary": "executive career research",
        "secondary": ["executive job market research", "career research reports", "executive recruitment research"],
        "intent": "Informational/navigation hub; terms are unvalidated query hypotheses.",
        "audience": "Candidates, employers, and researchers seeking transparent evidence about executive careers and hiring.",
        "geography": "International scope only where each research item's sources support it; otherwise label jurisdiction.",
        "sources": ["CIPD-REPORTS", "HBR-CAREER-PLANNING", "ILO-WESO-2025", "KOV-RESOURCES-INVENTORY"],
        "competitors": [
            {"name": "CIPD Reports", "url": "https://www.cipd.org/en/knowledge/reports/", "finding": "Research library describes reports on work, skills, workforce planning, people analytics, and related topics.", "status": "page verified; SERP position not measured"},
            {"name": "Harvard Business Review Career Planning", "url": "https://hbr.org/topic/subject/career-planning", "finding": "Editorial topic hub includes research-led and executive career articles.", "status": "page verified; not a direct KOV-format equivalent"},
            {"name": "ILO World Employment and Social Outlook: Trends 2025", "url": "https://www.ilo.org/publications/flagship-reports/world-employment-and-social-outlook-trends-2025", "finding": "Offers a report, charts, data finder, and translated summaries as a benchmark for substantive research publishing.", "status": "page verified; research benchmark, not a KOV competitor or dataset"},
        ],
        "purpose": "A transparent index for KOV research briefs that exposes question, geography, date, method, sources, limitations, and reviewer. Current taxonomy and source notes may support reference material, but the hub must not imply a portfolio of original studies that does not yet exist.",
        "overlap": "The repository has research notes and classification source documentation, but no current public research hub or validated series of market studies. The page must distinguish internal taxonomy documentation from original labor-market research.",
        "internal": ["/resources/executive-career-outcomes.html"],
        "outline": ["Scope and research standards", "Published research items with dates and geographies", "Methods and limitations", "Source and classification notes", "Corrections and update policy"],
        "risks": ["Keyword demand and search competition are unmeasured.", "No original quantitative executive labor-market dataset was identified; never imply proprietary market forecasts.", "Publish only after at least one approved, citeable research item and an editorial methodology review exist."],
        "status": "research_screen_complete; sample_publication_and_demand_validation_pending",
        "candidate_status": "approved_for_development; publication_pending_sample_research",
        "approval": "approved_for_development",
    },
    {
        "id": "professional-profile-directory",
        "title": "Professional Profile Directory",
        "url": "/professional-directory/",
        "category": "professional_profile_directory",
        "preview": "/staging/professional-directory/",
        "primary": "executive professional profile directory",
        "secondary": ["senior executive profiles", "professional candidate directory", "executive talent directory"],
        "intent": "Navigational/transactional hypothesis for finding professional profiles; demand and audience not validated.",
        "audience": "Unresolved: prospective employers/recruiters versus professionals seeking visibility; do not assume public access or inclusion.",
        "geography": "Unresolved; privacy and employment rules vary by jurisdiction.",
        "sources": ["BOARDPROSPECTS", "THEORG-STRIPE", "LINKEDIN-PRIVACY", "EU-DATA-PROTECTION", "KOV-PROFILE-INVENTORY"],
        "competitors": [
            {"name": "BoardProspects", "url": "https://www.boardprospects.com/", "finding": "Promotes director visibility, board-career networking, and board-search resources; directly adjacent to board-profile discovery.", "status": "page verified; SERP position not measured"},
            {"name": "The Org: Stripe company profile", "url": "https://theorg.com/org/stripe", "finding": "Displays company-level details such as industry, headquarters, and employee range; not a verified candidate-directory or consent model.", "status": "page verified; limited adjacent reference"},
            {"name": "LinkedIn", "url": "https://www.linkedin.com/talent/solutions/", "finding": "Talent-solutions page positions its professional network as a recruiting channel; its privacy policy describes collection, use, sharing, and user choices.", "status": "page and policy verified; not a like-for-like curated KOV directory"},
        ],
        "purpose": "Potentially a consent-based directory of professionals, but purpose, audience, eligibility, benefits, monetization, access, and consent model are unresolved. Do not treat this as a qualified public page or collect/publish personal data.",
        "overlap": "A current internal `/profiles.html` page already describes a Candidate Directory and is canonical but robots noindex,nofollow. A separate public `/professional-directory/` route would duplicate that purpose unless the owner approves consolidation and a canonical/redirect plan. The public route is therefore held.",
        "internal": ["/profiles.html", "/privacy.html", "/candidate-services.html", "/services.html"],
        "outline": ["No public content outline approved.", "First resolve directory purpose, audience, consent, data fields, access, retention, withdrawal, moderation, correction/deletion, and jurisdictional obligations.", "Then decide whether to consolidate the existing profiles route or use a new route."],
        "risks": ["No consent records or privacy/retention/removal operating model were verified.", "Existing profiles.html has a noindex,nofollow directive and overlapping directory purpose.", "Do not expose personal data or promise candidate availability without verified permission and process."],
        "status": "held_route_overlap_privacy_and_operating_model",
        "candidate_status": "hold_existing_route_overlap_and_privacy",
        "approval": "approved_for_research_only",
    },
]


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path, rows, fields=None):
    if fields is None:
        fields = list(rows[0]) if rows else []
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def source_by_id(source_id):
    return next(source for source in SOURCES if source["source_id"] == source_id)


def build():
    RECORDS.mkdir(parents=True, exist_ok=True)
    source_path = DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv"
    existing_sources = {row["source_id"]: row for row in read_csv(source_path)} if source_path.exists() else {}
    for source in SOURCES:
        existing = existing_sources.get(source["source_id"])
        if existing and existing["url_or_path"] != source["url_or_path"]:
            raise ValueError(f"Source ID collision: {source['source_id']}")
        if existing is None:
            existing_sources[source["source_id"]] = source
    write_csv(source_path, sorted(existing_sources.values(), key=lambda row: row["source_id"]))

    candidate_path = DEVELOPMENT / "CANDIDATE-REGISTER.csv"
    candidate_rows = read_csv(candidate_path)
    candidate_by_id = {row["candidate_id"]: row for row in candidate_rows}
    tracker_path = DEVELOPMENT / "PAGE-TRACKER.csv"
    tracker_rows = read_csv(tracker_path)
    tracker_by_id = {row["id"]: row for row in tracker_rows}
    keyword_path = DEVELOPMENT / "KEYWORD-INTENT-MAP.csv"
    keyword_rows = read_csv(keyword_path)
    keyword_by_id = {row["candidate_id"]: row for row in keyword_rows}

    candidate_fields = list(candidate_rows[0])
    tracker_fields = list(tracker_rows[0])
    keyword_fields = list(keyword_rows[0])
    source_refs = {
        source["source_id"]: source
        for source in SOURCES
    }

    for hub in HUBS:
        record_path = f"development/research/records/{hub['id']}.json"
        blueprint_path = f"development/blueprints/{hub['id']}.md"
        authoritative_sources = [source_refs[source_id] for source_id in hub["sources"]]
        record = {
            "id": hub["id"],
            "page_title": hub["title"],
            "proposed_url": hub["url"],
            "staging_preview_url": hub["preview"],
            "page_group": hub["category"],
            "parent_hub": None,
            "candidate_status": hub["candidate_status"],
            "approval_status": hub["approval"],
            "record_status": hub["status"],
            "research_owner": "development",
            "research_updated": "2026-11-04",
            "primary_keywords": [hub["primary"]],
            "secondary_keywords": hub["secondary"],
            "keyword_metrics": {
                "volume_status": "not_available",
                "source": "No Search Console, Google Keyword Planner, or validated third-party keyword export was available.",
                "note": "Search phrases are hypotheses only; not evidence of demand or ranking potential.",
            },
            "search_intent": {
                "primary_query": hub["primary"],
                "secondary_queries": hub["secondary"],
                "intent": hub["intent"],
                "evidence": [{"source_id": source_id, "url": source_refs[source_id]["url_or_path"], "access_status": source_refs[source_id]["access_status"]} for source_id in hub["sources"]],
            },
            "intended_audience": hub["audience"],
            "audience_and_geography": {"audience": hub["audience"], "geography": hub["geography"]},
            "geographic_relevance": [hub["geography"]],
            "competitor_research": hub["competitors"],
            "commercial_relevance": "Potentially supports KOV's existing candidate-facing information architecture; no conversion, demand, or serviceability forecast is asserted.",
            "unique_content_purpose": hub["purpose"],
            "internal_link_opportunities": hub["internal"],
            "duplication_and_cannibalisation_assessment": hub["overlap"],
            "demand_and_competition": {
                "keyword_sources": [],
                "competitor_pages": [item["url"] for item in hub["competitors"]],
                "evidence_and_date": [
                    "Competitor/reference pages were opened directly on 2026-11-04; this is a page review, not a Google/Bing SERP ranking study.",
                    "No query volume, difficulty, traffic, or conversion data was available.",
                ],
            },
            "authoritative_sources": authoritative_sources,
            "unique_value_and_overlap": {
                "user_need": hub["purpose"],
                "existing_page_overlap_review": hub["overlap"],
                "canonical_or_consolidation_decision": "Candidate hub only; no route is to be added to public index until the overlap and release gates are resolved.",
            },
            "factual_gaps_and_risks": hub["risks"],
            "blueprint_path": blueprint_path,
            "content_status": "not_started",
            "publication_status": "not_approved",
            "notes": [
                "Owner authorization is for development/research only; publication remains separately gated.",
                "No candidate URL has been added to the sitemap, public search, or public navigation.",
            ],
        }
        (ROOT / record_path).write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        blueprint = f"""# {hub['title']} — research blueprint

- **Page ID:** `{hub['id']}`
- **Proposed public URL:** `{hub['url']}`
- **Noindex staging preview:** `{hub['preview']}`
- **Research record:** [`{hub['id']}.json`](../research/records/{hub['id']}.json)
- **Development approval:** {hub['approval']}
- **Publication status:** Not approved

## Purpose and audience

{hub['purpose']}

**Audience:** {hub['audience']}  
**Geographic scope:** {hub['geography']}

## Search intent and demand evidence

- **Primary query hypothesis:** {hub['primary']}
- **Secondary query hypotheses:** {", ".join(hub['secondary'])}
- **Intent:** {hub['intent']}
- **Measured demand:** Not available; no volume or ranking claim is made.
- **Competitor/reference pages:** {", ".join(item['url'] for item in hub['competitors'])}
- **SERP positions:** Not measured; direct page review is not a SERP study.

## Existing-site overlap and differentiation

{hub['overlap']}

## Page-specific information architecture

{chr(10).join(f"- {item}" for item in hub['outline'])}

## Internal links

Potential links to review for relevance and availability: {", ".join(f"`{item}`" for item in hub['internal'])}.

## Research sources and limitations

{chr(10).join(f"- **{source_refs[source_id]['title']}** — {source_refs[source_id]['url_or_path']}: {source_refs[source_id]['research_use_and_limit']}" for source_id in hub['sources'])}

## Open risks and release gates

{chr(10).join(f"- {risk}" for risk in hub['risks'])}

Keep the preview noindex and out of public navigation, sitemap, and search until page-specific content, QA, and publication approval are complete.
"""
        (ROOT / blueprint_path).write_text(blueprint, encoding="utf-8")

        candidate_by_id[hub["id"]] = {
            "candidate_id": hub["id"],
            "category": hub["category"],
            "page_title": hub["title"],
            "proposed_url": hub["url"],
            "parent_hub": "",
            "primary_keywords": hub["primary"],
            "secondary_keywords": "; ".join(hub["secondary"]),
            "search_intent": hub["intent"],
            "intended_audience": hub["audience"],
            "geographic_relevance": hub["geography"],
            "competitor_research": "; ".join(f"{item['name']}: {item['status']}" for item in hub["competitors"]),
            "credible_sources": "; ".join(hub["sources"]),
            "commercial_relevance": record["commercial_relevance"],
            "unique_content_purpose": hub["purpose"],
            "internal_link_opportunities": "; ".join(hub["internal"]),
            "duplication_cannibalisation_assessment": hub["overlap"],
            "research_status": hub["status"],
            "approval_status": hub["approval"],
            "blueprint_path": blueprint_path,
            "implementation_status": "foundation_only",
            "search_sitemap_status": "excluded",
            "publication_status": "not_published",
            "notes": "Development approval does not authorize public indexing or publication.",
        }
        tracker_by_id[hub["id"]] = {
            "id": hub["id"],
            "proposed_url": hub["url"],
            "staging_preview_url": hub["preview"],
            "page_group": hub["category"],
            "parent_hub": "",
            "candidate_status": hub["candidate_status"],
            "owner": "development",
            "research_status": hub["status"],
            "research_record": record_path,
            "blueprint_status": "researched_pending_review",
            "blueprint_file": blueprint_path,
            "content_status": "not_started",
            "implementation_status": "foundation_only",
            "qa_status": "staging_shell_smoke_test",
            "search_sitemap_status": "excluded",
            "publication_status": "not_approved",
            "notes": "Approved for development only; public-index/release approval remains separate.",
        }
        keyword_by_id[hub["id"]] = {
            "candidate_id": hub["id"],
            "proposed_url": hub["url"],
            "primary_keyword": hub["primary"],
            "secondary_keywords": "; ".join(hub["secondary"]),
            "search_intent": hub["intent"],
            "geography": hub["geography"],
            "keyword_source": "Editorial hypothesis; no keyword tool export",
            "search_volume_status": "not_available",
            "competitor_serp_status": "direct page review completed; SERP positions not measured",
            "research_status": hub["status"],
            "notes": "No measured demand or difficulty is asserted.",
        }

    write_csv(candidate_path, sorted(candidate_by_id.values(), key=lambda row: (row["category"], row["candidate_id"])), candidate_fields)
    write_csv(tracker_path, sorted(tracker_by_id.values(), key=lambda row: (row["page_group"], row["id"])), tracker_fields)
    write_csv(keyword_path, sorted(keyword_by_id.values(), key=lambda row: row["candidate_id"]), keyword_fields)

    programme_path = DEVELOPMENT / "PAGE-PROGRAMME.csv"
    programme = read_csv(programme_path)
    for row in programme:
        if row["page_group"] in {"career_resources_hub", "research_hub"}:
            row["status"] = "research_screen_complete"
            row["notes"] = "Approved for development; direct page comparators reviewed; query demand and SERP positions unmeasured; public release remains gated."
        elif row["page_group"] == "professional_profile_directory":
            row["status"] = "held_route_overlap_privacy_and_operating_model"
            row["notes"] = "Approved for research only; existing profiles.html overlap, consent, audience, privacy operations, and route decision unresolved."
    write_csv(programme_path, programme)

    (DEVELOPMENT / "HUB-RESEARCH-BATCH.md").write_text(
        """# Approved Hub Research Batch

**Research date:** 2026-11-04  
**Development branch:** `copilot/first-stage-foundations`  
**Publication:** No public page, sitemap entry, navigation link, or search-index entry was added.

## Career Resources Hub — `/career-resources/`

Individual research record and blueprint are complete to the development-screen stage. Repository review found 11 resource pages, 30 FAQ pages, and a glossary; therefore the hub's unique role is navigation over existing researched information, not a duplicate content page. HBR Career Planning, its executive-career article, and O*NET OnLine were reviewed as adjacent references. Indeed Career Advice returned HTTP 403 and remains unassessed. Search intent is a hypothesis; volume and SERP ranking are unknown.

## Research Hub — `/research/`

Individual research record and blueprint are complete to the development-screen stage. CIPD Reports, HBR Career Planning, and ILO's World Employment and Social Outlook 2025 were reviewed as research/editorial references. The ILO report is a publishing benchmark, not evidence that KOV has an original dataset. The repository has taxonomy source notes and internal research material, but no validated portfolio of original quantitative executive-market research. Do not imply proprietary forecasts; public release requires at least one approved, citeable item and methodology review.

## Professional Profile Directory — `/professional-directory/`

The route is **held**, not qualified for public implementation. `/profiles.html` already describes a Candidate Directory and is canonical but `noindex,nofollow`. BoardProspects and LinkedIn were reviewed as adjacent profile-discovery/network references; The Org's Stripe page was reviewed only as an organization-profile presentation example, not a candidate-directory or consent model. The European Commission data-protection guidance and LinkedIn privacy policy were reviewed for risk framing. No consent records, public audience, data fields, retention, withdrawal, moderation, or deletion process were verified. Resolve route consolidation and privacy/operating requirements before collecting or displaying personal data.

## SERP and demand limits

Direct page reviews are not search-engine results analysis. No Google/Bing SERP positions, query volumes, keyword difficulty, traffic, or conversions were measured. These are development research findings, not claims of search demand.

## Next batch

The 23 missing SOC-major-group destinations now have individual provisional records and blueprints, as do ten additional industry-guide concepts and three narrow leadership/board guides. All remain unqualified. Next: map the SOC groups to existing role pages, complete candidate-specific overlap and search-result validation, and resolve first-party demand and serviceability gaps before any page implementation or publication.
""",
        encoding="utf-8",
    )
    subprocess.run(
        [sys.executable, "-B", str(ROOT / "scripts" / "build-candidate-qualification-register.py")],
        cwd=ROOT,
        check=True,
    )
    print("Updated individual research records and blueprints for three hubs.")


if __name__ == "__main__":
    build()
