import csv
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
RECORDS = DEVELOPMENT / "research" / "records"
BLUEPRINTS = DEVELOPMENT / "blueprints" / "mobility"

HUBS = [
    ("career-resources-hub", "Career Resources Hub", "/career-resources/", "career_resources_hub"),
    ("research-hub", "Research Hub", "/research/", "research_hub"),
    ("professional-profile-directory", "Professional Profile Directory", "/professional-directory/", "professional_profile_directory"),
]

SOURCES = [
    ("UK-GT", "Government guidance", "Global Talent visa", "UK Home Office", "https://www.gov.uk/global-talent", "Verified 2026-11-04", "Official route overview; eligibility depends on route and current rules."),
    ("UK-GT-DIGITAL", "Government guidance", "Global Talent: digital technology", "UK Home Office", "https://www.gov.uk/global-talent-digital-technology", "Verified 2026-11-04", "Official endorsement route page."),
    ("UK-GT-RESEARCH", "Government guidance", "Global Talent: academia or research", "UK Home Office", "https://www.gov.uk/global-talent-researcher-academic", "Verified 2026-11-04", "Official endorsement route page."),
    ("EU-BLUE-CARD", "Government guidance", "EU Blue Card", "European Commission", "https://immigration-portal.ec.europa.eu/eu-blue-card_en", "Fetch unavailable 2026-11-04", "Link retained from research screen; verify the current official route and member-state variation before drafting."),
    ("CA-EXPRESS-ENTRY", "Government guidance", "Express Entry", "Immigration, Refugees and Citizenship Canada", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html", "Verified 2026-11-04", "Official system overview; not an executive-specific program."),
    ("SG-EP", "Government guidance", "Employment Pass", "Singapore Ministry of Manpower", "https://www.mom.gov.sg/passes-and-permits/employment-pass", "Verified 2026-11-04", "Official route overview; criteria and thresholds can change."),
    ("NZ-SMC", "Government guidance", "Skilled Migrant Category Resident Visa", "Immigration New Zealand", "https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/", "Verified 2026-11-04", "Official page reached after redirect; pathways and requirements are current only as of access date."),
    ("UK-SSW", "Government guidance", "Senior or Specialist Worker visa", "UK Home Office", "https://www.gov.uk/senior-specialist-worker-visa", "Verified 2026-11-04", "Official Global Business Mobility route; replaced the Intra-company Transfer visa."),
    ("UK-EW", "Government guidance", "UK Expansion Worker visa", "UK Home Office", "https://www.gov.uk/uk-expansion-worker-visa", "Verified 2026-11-04", "Official route for eligible workers establishing a UK branch of an overseas business."),
    ("UK-IF", "Government guidance", "Innovator Founder visa", "UK Home Office", "https://www.gov.uk/innovator-founder-visa", "Verified 2026-11-04", "Official founder route; endorsement and eligibility conditions apply."),
    ("EU-QUALS", "Government guidance", "Professional qualifications", "European Union", "https://europa.eu/youreurope/citizens/work/professional-qualifications/index_en.htm", "Source identified; recheck before drafting", "EU-specific recognition information; not a global credential equivalency source."),
    ("ILO-ISCO", "Classification standard", "International Standard Classification of Occupations (ISCO-08)", "International Labour Organization", "https://isco.ilo.org/en/isco-08/", "Fetch returned 403 2026-11-04", "International classification reference; access and edition must be verified before use."),
    ("OECD-MIGRATION", "Research organization", "International migration", "OECD", "https://www.oecd.org/migration/", "Source identified; recheck before drafting", "Context source, not individual immigration advice."),
    ("WB-GDP", "Economic dataset", "GDP (current US$)", "World Bank", "https://api.worldbank.org/v2/indicator/NY.GDP.MKTP.CD?format=json", "Used in country screening", "Macro scale only; not executive-level demand or KOV serviceability."),
    ("WB-INCOME", "Economic dataset", "Country and lending groups", "World Bank", "https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups", "Used in country screening", "Income grouping is not a career-market qualification."),
    ("ILO-WESO", "Labor-market research", "World Employment and Social Outlook", "International Labour Organization", "https://www.ilo.org/publications/flagship-reports/world-employment-and-social-outlook-trends-2025", "Used as regional context", "Regional/macroeconomic context; not country-level executive demand."),
    ("KOV-RESEARCH", "Internal research", "Global jobs, industries, and recruiting research", "KOV Career Agency", "KOV-GLOBAL-JOBS-INDUSTRIES-AND-RECRUITING-RESEARCH-2026-10-22.md", "Reviewed 2026-11-04", "Internal taxonomy and audience cautions; does not establish route eligibility or market demand."),
]

COMPETITOR_BENCHMARKS = [
    {"name": "Official government or intergovernmental route guidance", "type": "search-result/reference competitor", "status": "page-specific official source listed per candidate; current SERP positions not measured"},
    {"name": "Commercial immigration and global-mobility advisory content", "type": "adjacent information competitor", "status": "provider-level competitor set and country-specific SERP review pending"},
]

CANDIDATES = [
    {
        "id": "executive-mobility-route-selection",
        "title": "Choosing an International Mobility Route as an Executive",
        "slug": "choosing-an-international-mobility-route-as-an-executive",
        "country": "Cross-country; route examples must be named and bounded",
        "primary": "international mobility options for executives",
        "secondary": ["executive relocation routes", "compare work authorization pathways", "international executive career move"],
        "sources": ["OECD-MIGRATION", "UK-GT", "CA-EXPRESS-ENTRY", "SG-EP", "NZ-SMC"],
        "purpose": "A decision framework for comparing destination, work authorization, employer sponsorship, family, timing, and professional constraints without implying that one route is universally available.",
        "overlap": "Different from country market pages: focuses on route-selection criteria, not local executive services or job-market claims.",
        "outline": ["Decision question and scope", "Destination and work-authorization checks", "Employer sponsorship versus independent routes", "Family, timing, and credential constraints", "Official-source verification checklist", "Questions for a qualified immigration adviser"],
        "status": "initial_source_screen",
    },
    {
        "id": "sponsored-vs-independent-work-routes",
        "title": "Employer-Sponsored and Independent Work Routes: Executive Decision Guide",
        "slug": "employer-sponsored-vs-independent-work-routes",
        "country": "Cross-country; compare only named jurisdictions",
        "primary": "employer-sponsored vs independent work visa",
        "secondary": ["work visa sponsorship options", "executive work authorization routes", "employer-sponsored relocation"],
        "sources": ["UK-SSW", "UK-GT", "CA-EXPRESS-ENTRY", "SG-EP", "NZ-SMC"],
        "purpose": "Compare the decision factors and trade-offs in selected official work routes; explain that labels and eligibility differ by country and are not interchangeable.",
        "overlap": "Distinct from route-selection framework by using a bounded comparison matrix; country-specific pages remain the authoritative detail layer.",
        "outline": ["Definitions and limits", "Named-route comparison table", "Employer role and evidence", "Candidate independence and constraints", "Change-of-employer and family questions", "Official-source links and review date"],
        "status": "initial_source_screen",
    },
    {
        "id": "uk-global-talent-digital-leaders",
        "title": "UK Global Talent Route for Digital Technology Leaders",
        "slug": "uk-global-talent-digital-technology-leaders",
        "country": "United Kingdom",
        "primary": "UK Global Talent visa digital technology",
        "secondary": ["Global Talent digital technology endorsement", "UK visa for technology leaders", "digital technology leadership relocation UK"],
        "sources": ["UK-GT", "UK-GT-DIGITAL"],
        "purpose": "Explain the official digital-technology route structure and evidence questions for senior technology professionals, without predicting endorsement outcomes.",
        "overlap": "Distinct from existing UK/London market pages, which discuss geography rather than immigration eligibility; distinct from the separate research pathway page.",
        "outline": ["Who the route is for, using official wording", "Endorsement and prize pathways", "Evidence categories to verify", "Application-stage overview", "Career-planning questions separate from eligibility", "Official links, update date, and disclaimer"],
        "status": "source_verified; competitor_review_pending",
    },
    {
        "id": "uk-global-talent-research-leaders",
        "title": "UK Global Talent Route for Academic and Research Leaders",
        "slug": "uk-global-talent-research-leaders",
        "country": "United Kingdom",
        "primary": "UK Global Talent visa researcher",
        "secondary": ["Global Talent academic research endorsement", "UK research leader visa route", "research career relocation UK"],
        "sources": ["UK-GT", "UK-GT-RESEARCH"],
        "purpose": "Describe the distinct academic and research pathway and the official endorsement options for eligible researchers, without treating seniority or publication counts as automatic qualification.",
        "overlap": "Separate from the digital-technology Global Talent page by discipline and evidence pathway; not a general UK executive-market page.",
        "outline": ["Route scope and eligible fields", "Academic/research endorsement pathways", "Evidence and appointment questions", "Application sequence from official sources", "Career considerations that are not eligibility rules", "Source date and disclaimer"],
        "status": "source_verified; competitor_review_pending",
    },
    {
        "id": "eu-blue-card-senior-professionals",
        "title": "EU Blue Card: A Route Overview for Senior Professionals",
        "slug": "eu-blue-card-senior-professionals",
        "country": "European Union; national implementation varies",
        "primary": "EU Blue Card for senior professionals",
        "secondary": ["EU Blue Card eligibility overview", "highly qualified worker EU route", "executive relocation to Europe"],
        "sources": ["EU-BLUE-CARD"],
        "purpose": "Provide a jurisdiction-bounded overview of the Blue Card concept and direct readers to member-state rules; no claim that one EU-wide checklist resolves national requirements.",
        "overlap": "Distinct from individual country-market pages and from other mobility routes; member-state differences must be explicit.",
        "outline": ["EU-level route scope", "National variation and official country links", "Qualification, job, and salary items to verify", "Candidate planning questions", "Limitations and legal-advice disclaimer", "Last-reviewed date"],
        "status": "candidate_pending_official_source_retrieval",
    },
    {
        "id": "canada-express-entry-senior-managers",
        "title": "Canada Express Entry: Questions for Senior Managers",
        "slug": "canada-express-entry-senior-managers",
        "country": "Canada",
        "primary": "Canada Express Entry for senior managers",
        "secondary": ["Express Entry skilled worker programs", "Canadian immigration options for executives", "senior manager move to Canada"],
        "sources": ["CA-EXPRESS-ENTRY"],
        "purpose": "Explain that Express Entry manages applications for named skilled-worker programs and help senior managers identify questions to check, without suggesting an executive-specific stream or outcome.",
        "overlap": "Distinct from general Canada market support and from a separate occupation-specific immigration program; existing country page overlap must be rechecked before publication.",
        "outline": ["Express Entry system and named programs", "What the official profile/invitation process means", "Experience and occupation questions to verify", "Career and relocation considerations", "Official links and limits"],
        "status": "source_verified; occupation_specific_claims_prohibited",
    },
    {
        "id": "singapore-employment-pass-executives",
        "title": "Singapore Employment Pass: A Planning Guide for Executives",
        "slug": "singapore-employment-pass-executives",
        "country": "Singapore",
        "primary": "Singapore Employment Pass for executives",
        "secondary": ["Singapore Employment Pass eligibility", "Singapore work pass for managers", "executive relocation to Singapore"],
        "sources": ["SG-EP"],
        "purpose": "Summarize official Employment Pass entry points and employer/candidate checks relevant to planning an executive move, with a dated source review and no guarantee of eligibility.",
        "overlap": "Route and eligibility information is distinct from a general Singapore career-market page; coordinate internal links without duplicating market claims.",
        "outline": ["Official pass scope", "Candidate and employer checks", "Application and assessment overview", "Executive job-search planning outside eligibility", "Official links, update date, and disclaimer"],
        "status": "source_verified; thresholds_recheck_before_draft",
    },
    {
        "id": "new-zealand-skilled-migrant-executives",
        "title": "New Zealand Skilled Migrant Category: Planning Questions for Executives",
        "slug": "new-zealand-skilled-migrant-category-executives",
        "country": "New Zealand",
        "primary": "New Zealand Skilled Migrant Category for executives",
        "secondary": ["New Zealand skilled migrant resident visa", "executive relocation to New Zealand", "skilled work experience New Zealand visa"],
        "sources": ["NZ-SMC"],
        "purpose": "Orient senior professionals to the official Skilled Migrant Category pathways and verification steps; avoid implying that overseas executive tenure alone meets any pathway.",
        "overlap": "Different from a New Zealand market page; focus is the immigration route and its official conditions.",
        "outline": ["Current pathway overview", "Qualification, income, registration, and New Zealand work-experience checks", "Evidence and process", "Career-planning questions", "Official links and dated caveats"],
        "status": "source_verified; requirements_recheck_before_draft",
    },
    {
        "id": "uk-senior-specialist-worker",
        "title": "UK Senior or Specialist Worker Route for Executive Transfers",
        "slug": "uk-senior-specialist-worker-executive-transfers",
        "country": "United Kingdom",
        "primary": "UK Senior or Specialist Worker visa executive transfer",
        "secondary": ["UK intra-company transfer route replacement", "Global Business Mobility Senior Specialist Worker", "UK employer transfer visa"],
        "sources": ["UK-SSW"],
        "purpose": "Explain the current official route for eligible employees assigned to a UK branch and distinguish it from the discontinued Intra-company Transfer visa name.",
        "overlap": "Distinct from Global Talent and UK Expansion Worker pages; focus is an existing employee transfer to an eligible UK branch.",
        "outline": ["Current route name and scope", "Employer sponsorship and eligible-role checks", "Salary and time limits to verify", "Application route", "How this differs from other Global Business Mobility routes", "Official links and disclaimer"],
        "status": "source_verified; thresholds_recheck_before_draft",
    },
    {
        "id": "uk-expansion-worker-route",
        "title": "UK Expansion Worker Route for Overseas Business Leaders",
        "slug": "uk-expansion-worker-route-overseas-business-leaders",
        "country": "United Kingdom",
        "primary": "UK Expansion Worker visa for senior managers",
        "secondary": ["UK visa to establish overseas business branch", "Global Business Mobility Expansion Worker", "UK business expansion employee route"],
        "sources": ["UK-EW"],
        "purpose": "Describe the official route for eligible senior managers or specialists setting up an untrading UK branch of an overseas business.",
        "overlap": "Distinct from the Senior or Specialist Worker route: the overseas business and UK branch trading status are central differentiators.",
        "outline": ["Route purpose and scope", "Employer and branch conditions", "Worker eligibility and sponsorship", "Time limits and transition questions", "Compare with named UK mobility routes", "Official links and disclaimer"],
        "status": "source_verified; thresholds_recheck_before_draft",
    },
    {
        "id": "uk-innovator-founder-executives",
        "title": "UK Innovator Founder Route: Questions for Executive Founders",
        "slug": "uk-innovator-founder-route-executive-founders",
        "country": "United Kingdom",
        "primary": "UK Innovator Founder visa for executives",
        "secondary": ["UK founder visa endorsement requirements", "Innovator Founder route business criteria", "executive founder relocation UK"],
        "sources": ["UK-IF"],
        "purpose": "Explain the official founder-route framing and endorsement requirements, distinguishing founder eligibility from ordinary executive employment.",
        "overlap": "Distinct from sponsored-worker routes and from general entrepreneurship advice; no guarantee that a business idea will be endorsed.",
        "outline": ["Route scope and prior route name", "Innovation, viability, and scalability as official criteria", "Endorsement and evidence questions", "Founder versus employee pathways", "Official links and dated disclaimer"],
        "status": "source_verified; endorsement_details_recheck_before_draft",
    },
    {
        "id": "executive-qualification-recognition-cross-border",
        "title": "Professional Qualification Recognition in Cross-Border Executive Moves",
        "slug": "professional-qualification-recognition-cross-border-executive-moves",
        "country": "Cross-border; initial scope limited to EU recognition framework",
        "primary": "professional qualification recognition for international work",
        "secondary": ["recognize professional qualifications abroad", "regulated profession qualification recognition EU", "executive relocation credential checks"],
        "sources": ["EU-QUALS", "OECD-MIGRATION"],
        "purpose": "Help candidates distinguish regulated-profession recognition, employer credential checks, and general executive experience; keep jurisdiction scope explicit.",
        "overlap": "Not a general credential equivalency database; narrower than role-specific licensing pages and separate from immigration-route guides.",
        "outline": ["Regulated versus non-regulated work", "EU-specific recognition framework and its boundaries", "Employer credential checks", "Evidence checklist", "When to contact a regulator or qualified adviser", "Scope and source date"],
        "status": "source_identified; jurisdiction_scope_review_pending",
    },
    {
        "id": "occupational-codes-cross-border-executive-search",
        "title": "How Occupational Codes Affect Cross-Border Executive Search",
        "slug": "occupational-codes-cross-border-executive-search",
        "country": "International; compare classification systems only where validated",
        "primary": "occupational codes for international executive jobs",
        "secondary": ["ISCO occupation codes executive search", "SOC codes and international job search", "occupation classification crosswalk"],
        "sources": ["ILO-ISCO", "KOV-RESEARCH"],
        "purpose": "Explain the limits of occupational taxonomies when mapping titles and experience across countries, using verified classification examples rather than presenting codes as immigration eligibility decisions.",
        "overlap": "Distinct from occupation pages: this is a cross-border classification explainer, not a directory or service claim.",
        "outline": ["What occupational classifications do", "ISCO and national-system scope", "Title-to-code mapping limits", "When codes matter in applications or research", "Source editions and verification checklist"],
        "status": "candidate_pending_ilo_source_access_and_scope_review",
    },
]

COUNTRIES = [
    ("United States", "united-states", "macro_screen_only"),
    ("China", "china", "macro_screen_only"),
    ("Germany", "germany", "macro_screen_only"),
    ("Japan", "japan", "macro_screen_only"),
    ("India", "india", "macro_screen_only"),
    ("United Kingdom", "united-kingdom", "existing_market_overlap"),
    ("France", "france", "macro_screen_only"),
    ("Italy", "italy", "macro_screen_only"),
    ("Canada", "canada", "macro_screen_only"),
    ("Brazil", "brazil", "macro_screen_only"),
    ("South Korea", "south-korea", "macro_screen_only"),
    ("Australia", "australia", "existing_market_overlap"),
    ("Spain", "spain", "macro_screen_only"),
    ("Mexico", "mexico", "macro_screen_only"),
    ("Indonesia", "indonesia", "macro_screen_only"),
    ("Türkiye", "turkiye", "macro_screen_only"),
    ("Netherlands", "netherlands", "macro_screen_only"),
    ("Saudi Arabia", "saudi-arabia", "existing_market_overlap"),
    ("United Arab Emirates", "united-arab-emirates", "existing_market_overlap"),
    ("Singapore", "singapore", "macro_screen_only"),
    ("Switzerland", "switzerland", "macro_screen_only"),
    ("Ireland", "ireland", "macro_screen_only"),
    ("Sweden", "sweden", "macro_screen_only"),
    ("Denmark", "denmark", "macro_screen_only"),
    ("Norway", "norway", "macro_screen_only"),
    ("Belgium", "belgium", "macro_screen_only"),
    ("Austria", "austria", "macro_screen_only"),
    ("Poland", "poland", "macro_screen_only"),
    ("Luxembourg", "luxembourg", "macro_screen_only"),
    ("Israel", "israel", "macro_screen_only"),
    ("New Zealand", "new-zealand", "macro_screen_only"),
    ("Portugal", "portugal", "macro_screen_only"),
    ("Qatar", "qatar", "macro_screen_only"),
    ("Kuwait", "kuwait", "macro_screen_only"),
    ("Bahrain", "bahrain", "macro_screen_only"),
    ("Oman", "oman", "macro_screen_only"),
    ("Chile", "chile", "macro_screen_only"),
]

CANDIDATE_FIELDS = [
    "candidate_id", "category", "page_title", "proposed_url", "parent_hub",
    "primary_keywords", "secondary_keywords", "search_intent", "intended_audience",
    "geographic_relevance", "competitor_research", "credible_sources",
    "commercial_relevance", "unique_content_purpose", "internal_link_opportunities",
    "duplication_cannibalisation_assessment", "research_status", "approval_status",
    "blueprint_path", "implementation_status", "search_sitemap_status",
    "publication_status", "notes",
]


def write_csv(path, fields, rows):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def read_csv(path):
    if not path.is_file():
        return []
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def merge_batch_rows(path, generated_rows, key_field, preserve_researched=False):
    existing_rows = read_csv(path)
    existing_by_key = {row[key_field]: row for row in existing_rows}
    generated_by_key = {row[key_field]: row for row in generated_rows}
    merged = {}
    for key, row in generated_by_key.items():
        existing = existing_by_key.get(key)
        if preserve_researched and existing and existing.get("research_status") not in {"", "not_started"}:
            merged[key] = existing
        else:
            merged[key] = row
    for key, row in existing_by_key.items():
        if key not in generated_by_key:
            merged[key] = row
    return list(merged.values())


def main():
    RECORDS.mkdir(parents=True, exist_ok=True)
    BLUEPRINTS.mkdir(parents=True, exist_ok=True)
    source_rows = [
        {
            "source_id": source[0],
            "source_type": source[1],
            "title": source[2],
            "publisher": source[3],
            "url_or_path": source[4],
            "access_status": source[5],
            "research_use_and_limit": source[6],
        }
        for source in SOURCES
    ]
    source_path = DEVELOPMENT / "RESEARCH-SOURCE-REGISTER.csv"
    existing_sources = {row["source_id"]: row for row in read_csv(source_path)}
    for source in source_rows:
        existing = existing_sources.get(source["source_id"])
        if existing and existing["url_or_path"] != source["url_or_path"]:
            raise ValueError(f"Source ID collision: {source['source_id']}")
        if existing is None:
            existing_sources[source["source_id"]] = source
    write_csv(
        source_path,
        list(source_rows[0]),
        sorted(existing_sources.values(), key=lambda row: row["source_id"]),
    )

    candidate_rows = []
    keyword_rows = []
    tracker_rows = []
    all_urls = set()
    source_ids = {row["source_id"] for row in source_rows}

    for candidate in CANDIDATES:
        url = f"/career-resources/mobility/{candidate['slug']}/"
        if url in all_urls:
            raise ValueError(f"Duplicate candidate URL: {url}")
        all_urls.add(url)
        missing_sources = set(candidate["sources"]) - source_ids
        if missing_sources:
            raise ValueError(f"Unknown sources for {candidate['id']}: {sorted(missing_sources)}")

        record_path = f"development/research/records/{candidate['id']}.json"
        blueprint_path = f"development/blueprints/mobility/{candidate['id']}.md"
        source_refs = [next(row for row in source_rows if row["source_id"] == ref) for ref in candidate["sources"]]
        record = {
            "id": candidate["id"],
            "page_title": candidate["title"],
            "proposed_url": url,
            "page_group": "international_career_mobility",
            "parent_hub": "/career-resources/",
            "candidate_status": candidate["status"],
            "approval_status": "not_approved",
            "record_status": "initial_research_screen_complete",
            "research_updated": "2026-11-04",
            "audience_and_geography": {
                "audience": "Senior professionals and executives considering a cross-border career move; route eligibility is individual and jurisdiction-specific.",
                "geography": candidate["country"],
            },
            "search_intent": {
                "primary_query": candidate["primary"],
                "secondary_queries": candidate["secondary"],
                "intent": "Informational and decision-support; query wording is a hypothesis, not measured demand.",
                "evidence": [{"source_id": source["source_id"], "url": source["url_or_path"], "access_status": source["access_status"]} for source in source_refs],
            },
            "primary_keywords": [candidate["primary"]],
            "secondary_keywords": candidate["secondary"],
            "keyword_metrics": {
                "volume_status": "not_available",
                "source": "No Search Console, Google Keyword Planner, or validated third-party keyword-volume export was available.",
                "note": "All phrases are hypotheses for later validation.",
            },
            "intended_audience": "Senior professionals and executives; no promise of visa eligibility, employment, placement, or endorsement.",
            "geographic_relevance": [candidate["country"]],
            "competitor_research": COMPETITOR_BENCHMARKS,
            "commercial_relevance": "Potentially relevant as executive career-mobility decision support; KOV serviceability in each destination is unverified.",
            "unique_content_purpose": candidate["purpose"],
            "internal_link_opportunities": [
                "/resources/executive-job-search-in-your-market.html",
                "/roles/",
                "/services.html",
            ],
            "duplication_and_cannibalisation_assessment": candidate["overlap"],
            "demand_and_competition": {
                "keyword_sources": [],
                "competitor_pages": [],
                "evidence_and_date": [
                    "Official and intergovernmental sources establish route scope, not search demand.",
                    "Country-specific competitor SERPs, keyword volumes, and KOV serviceability remain unverified.",
                    "Accessed or status-checked 2026-11-04.",
                ],
            },
            "authoritative_sources": source_refs,
            "unique_value_and_overlap": {
                "user_need": candidate["purpose"],
                "existing_page_overlap_review": candidate["overlap"],
                "canonical_or_consolidation_decision": "Candidate URL only; compare against current sitemap and page text again before implementation.",
            },
            "factual_gaps_and_risks": [
                "Immigration rules can change; verify official pages and effective dates immediately before drafting and publication.",
                "This page must not provide individualized legal or immigration advice or imply eligibility.",
                "Direct competing pages and current search-result positions have not yet been validated.",
                "KOV's ability to serve candidates in the destination has not been established.",
            ],
            "blueprint_path": blueprint_path,
            "content_status": "not_started",
            "publication_status": "not_approved",
            "notes": [
                "Staging research candidate only; no public page is created by this record.",
                "Competitor and keyword-volume validation remain explicit open tasks.",
            ],
        }
        (ROOT / record_path).write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        blueprint = f"""# {candidate['title']}

- **Page ID:** `{candidate['id']}`
- **Proposed URL:** `{url}`
- **Page group:** International career mobility
- **Research record:** [`{candidate['id']}.json`](../../research/records/{candidate['id']}.json)
- **Blueprint status:** Initial structure for review; not approved for publication

## Page purpose and audience

{candidate['purpose']}

Audience: senior professionals and executives considering a cross-border career move. The page must not imply route eligibility, visa approval, employment, placement, or KOV serviceability.

## Search intent and evidence

- **Primary query hypothesis:** {candidate['primary']}
- **Secondary query hypotheses:** {", ".join(candidate['secondary'])}
- **Intent:** Informational and decision-support.
- **Search volume:** Not available; no measured volume is claimed.
- **Authoritative sources:** {", ".join(candidate['sources'])}
- **Competitor work:** Official information sources are identified. Direct advisory/editorial competitor pages and current SERP positions remain to be checked.

## Existing-page overlap and URL decision

{candidate['overlap']}

Candidate path is under `/career-resources/mobility/`; check current sitemap, canonical URLs, and relevant page copy again before implementation.

## Proposed page-specific structure

{chr(10).join(f"- {item}" for item in candidate['outline'])}

## Required sources and verification

- Re-verify every official route page and effective date before drafting.
- For any unverified or inaccessible source, retrieve an authoritative current replacement before stating route facts.
- Add country-specific SERP/competitor notes and measured keyword data if available.
- Obtain factual/editorial review and include a dated non-legal-advice boundary.

## Internal links and release requirements

Recommended current-page links: `/resources/executive-job-search-in-your-market.html`, `/roles/`, and `/services.html`. Proposed hub routes are not treated as published internal links.

Keep the page absent from the sitemap, public navigation, and internal search until research, content, QA, and publication approval are complete.
"""
        (ROOT / blueprint_path).write_text(blueprint, encoding="utf-8")

        candidate_rows.append({
            "candidate_id": candidate["id"],
            "category": "international_career_mobility",
            "page_title": candidate["title"],
            "proposed_url": url,
            "parent_hub": "/career-resources/",
            "primary_keywords": candidate["primary"],
            "secondary_keywords": "; ".join(candidate["secondary"]),
            "search_intent": "Informational/decision-support hypothesis; demand unmeasured",
            "intended_audience": "Senior professionals and executives considering cross-border moves",
            "geographic_relevance": candidate["country"],
            "competitor_research": "Official route sources identified; direct competitor/SERP review pending",
            "credible_sources": "; ".join(candidate["sources"]),
            "commercial_relevance": "Potential career-mobility information; destination serviceability unverified",
            "unique_content_purpose": candidate["purpose"],
            "internal_link_opportunities": "/resources/executive-job-search-in-your-market.html; /roles/; /services.html",
            "duplication_cannibalisation_assessment": candidate["overlap"],
            "research_status": "initial_screen_complete; keyword/competitor follow-up pending",
            "approval_status": "not_approved",
            "blueprint_path": blueprint_path,
            "implementation_status": "not_started",
            "search_sitemap_status": "excluded",
            "publication_status": "not_published",
            "notes": "Candidate only; no page content or route claims published.",
        })
        keyword_rows.append({
            "candidate_id": candidate["id"],
            "proposed_url": url,
            "primary_keyword": candidate["primary"],
            "secondary_keywords": "; ".join(candidate["secondary"]),
            "search_intent": "Informational/decision-support hypothesis",
            "geography": candidate["country"],
            "keyword_source": "Editorial hypothesis from source-screened topic; no keyword tool export",
            "search_volume_status": "not_available",
            "competitor_serp_status": "official sources identified; direct SERP review pending",
            "research_status": "initial_screen_complete",
            "notes": "Do not interpret as measured volume, ranking likelihood, or validated KOV demand.",
        })
        tracker_rows.append({
            "id": candidate["id"],
            "proposed_url": url,
            "staging_preview_url": "",
            "page_group": "international_career_mobility",
            "parent_hub": "/career-resources/",
            "candidate_status": candidate["status"],
            "owner": "development",
            "research_status": "initial_screen_complete; follow-up pending",
            "research_record": record_path,
            "blueprint_status": "drafted_for_review",
            "blueprint_file": blueprint_path,
            "content_status": "not_started",
            "implementation_status": "not_started",
            "qa_status": "not_run",
            "search_sitemap_status": "excluded",
            "publication_status": "not_approved",
            "notes": "Candidate route only; no HTML page created.",
        })

    for hub_id, title, url, category in HUBS:
        record_path = f"development/research/records/{hub_id}.json"
        blueprint_path = f"development/blueprints/{hub_id}.md"
        candidate_rows.append({
            "candidate_id": hub_id,
            "category": category,
            "page_title": title,
            "proposed_url": url,
            "parent_hub": "",
            "primary_keywords": "pending",
            "secondary_keywords": "pending",
            "search_intent": "pending",
            "intended_audience": "pending",
            "geographic_relevance": "pending",
            "competitor_research": "pending",
            "credible_sources": "pending",
            "commercial_relevance": "pending",
            "unique_content_purpose": "pending",
            "internal_link_opportunities": "pending",
            "duplication_cannibalisation_assessment": "pending",
            "research_status": "not_started",
            "approval_status": "not_approved",
            "blueprint_path": blueprint_path,
            "implementation_status": "foundation_only",
            "search_sitemap_status": "excluded",
            "publication_status": "not_published",
            "notes": f"Named public target; staging preview only. See {record_path}.",
        })
        tracker_rows.append({
            "id": hub_id,
            "proposed_url": url,
            "staging_preview_url": {
                "career_resources_hub": "/directory/career-resources/",
                "research_hub": "/directory/research/",
                "professional_profile_directory": "/directory/professional-directory/",
            }[category],
            "page_group": category,
            "parent_hub": "",
            "candidate_status": "defined_not_approved",
            "owner": "development",
            "research_status": "not_started",
            "research_record": record_path,
            "blueprint_status": "stub",
            "blueprint_file": blueprint_path,
            "content_status": "not_started",
            "implementation_status": "foundation_only",
            "qa_status": "staging_shell_smoke_test",
            "search_sitemap_status": "excluded",
            "publication_status": "not_approved",
            "notes": "Public target proposal only; preview is noindex and excluded from public navigation.",
        })

    candidate_path = DEVELOPMENT / "CANDIDATE-REGISTER.csv"
    keyword_path = DEVELOPMENT / "KEYWORD-INTENT-MAP.csv"
    tracker_path = DEVELOPMENT / "PAGE-TRACKER.csv"
    candidate_rows = merge_batch_rows(candidate_path, candidate_rows, "candidate_id", preserve_researched=True)
    keyword_rows = merge_batch_rows(keyword_path, keyword_rows, "candidate_id", preserve_researched=True)
    tracker_rows = merge_batch_rows(tracker_path, tracker_rows, "id", preserve_researched=True)
    candidate_rows.sort(key=lambda row: (row["category"], row["candidate_id"]))
    keyword_rows.sort(key=lambda row: row["candidate_id"])
    tracker_rows.sort(key=lambda row: (row["page_group"], row["id"]))
    write_csv(candidate_path, CANDIDATE_FIELDS, candidate_rows)
    write_csv(keyword_path, list(keyword_rows[0]), keyword_rows)
    write_csv(tracker_path, list(tracker_rows[0]), tracker_rows)

    quotas = [
        ("occupation_classification", 65, "No individual occupation topics are counted in this batch."),
        ("executive_career_guides", 100, "Topic-level candidate records are still required."),
        ("industry_specific_career_guides", 45, "Existing 20 sector equivalents are not counted as new pages."),
        ("role_specific_interview_guides", 30, "Topic-level candidate records are still required."),
        ("career_transition_guides", 30, "Topic-level candidate records are still required."),
        ("salary_compensation_guides", 20, "Topic-level candidate records are still required."),
        ("country_specific_role_pages", 50, "Three country-role concepts are represented by mobility candidates; no extra duplicate URLs counted."),
        ("executive_market_industry_reports", 20, "Topic-level candidate records are still required."),
        ("leadership_skills_competencies", 25, "Topic-level candidate records are still required."),
        ("international_career_mobility", 18, f"{len(CANDIDATES)} candidate URLs have individual records and blueprints; five additional topic screens remain held."),
        ("board_non_executive_career", 12, "Topic-level candidate records are still required."),
        ("comparison_educational", 15, "Topic-level candidate records are still required."),
        ("career_resources_hub", 1, "Named route exists as a noindex staging preview; page-specific research is pending."),
        ("research_hub", 1, "Named route exists as a noindex staging preview; page-specific research is pending."),
        ("professional_profile_directory", 1, "Named route exists as a noindex staging preview; consent/privacy research is pending."),
        ("general_country_market_pages", 144, "33 countries have macro screens only; they are not qualified URL candidates."),
    ]
    existing_programme = {
        row["page_group"]: row for row in read_csv(DEVELOPMENT / "PAGE-PROGRAMME.csv")
    }
    programme_rows = []
    for category, target, notes in quotas:
        category_candidates = [row for row in candidate_rows if row["category"] == category]
        count = len(category_candidates)
        record_count = sum(
            (RECORDS / f"{row['candidate_id']}.json").is_file()
            and json.loads((RECORDS / f"{row['candidate_id']}.json").read_text(encoding="utf-8")).get("record_status") != "not_started"
            for row in category_candidates
        )
        blueprint_count = sum((ROOT / row["blueprint_path"]).is_file() for row in category_candidates)
        previous = existing_programme.get(category, {})
        status = previous.get("status", "research_pending_or_not_qualified")
        if category == "international_career_mobility":
            status = "candidate_batch_researched"
        elif category in {"career_resources_hub", "research_hub", "professional_profile_directory"}:
            status = previous.get("status", "staging_foundation_research_pending")
        programme_rows.append({
            "page_group": category,
            "target_count": target,
            "candidate_urls_defined": count,
            "candidate_url_shortfall": target - count,
            "research_records_created": record_count,
            "blueprints_created": blueprint_count,
            "status": status,
            "notes": previous.get("notes", notes),
        })
    programme_fields = list(existing_programme.values())[0].keys() if existing_programme else programme_rows[0].keys()
    write_csv(DEVELOPMENT / "PAGE-PROGRAMME.csv", list(programme_fields), programme_rows)

    market_rows = []
    for country, slug, status in COUNTRIES:
        market_rows.append({
            "country": country,
            "screen_status": status,
            "candidate_url": "",
            "macro_evidence": "WB-GDP; WB-INCOME; ILO-WESO regional context only",
            "local_executive_demand": "not_researched",
            "local_competitors": "not_researched",
            "kov_serviceability": "not_verified",
            "existing_page_overlap": "existing market coverage; do not propose a new URL until page-level overlap is reviewed" if status == "existing_market_overlap" else "full sitemap/content check required",
            "decision": "excluded_existing_overlap" if status == "existing_market_overlap" else "potential_market_only; no URL proposed",
            "notes": "Macroeconomic scale is not evidence of executive-career demand, KOV serviceability, or page-level uniqueness.",
        })
    market_path = DEVELOPMENT / "MARKET-RESEARCH-SCREEN.csv"
    existing_market = {row["country"]: row for row in read_csv(market_path)}
    for row in market_rows:
        existing_market.setdefault(row["country"], row)
    market_rows = sorted(existing_market.values(), key=lambda row: row["country"])
    write_csv(market_path, list(market_rows[0]), market_rows)

    overlap_rows = [
        {
            "quota_category": "country_specific_role_pages",
            "topic_screen": "UK digital technology leaders",
            "standalone_candidate_url": "",
            "represented_by_candidate_id": "uk-global-talent-digital-leaders",
            "represented_by_url": next(row["proposed_url"] for row in candidate_rows if row["candidate_id"] == "uk-global-talent-digital-leaders"),
            "overlap_decision": "merge_into_mobility_candidate",
            "rationale": "Same country, role audience, and route-specific information need; do not create a second URL.",
        },
        {
            "quota_category": "country_specific_role_pages",
            "topic_screen": "UK academic and research leaders",
            "standalone_candidate_url": "",
            "represented_by_candidate_id": "uk-global-talent-research-leaders",
            "represented_by_url": next(row["proposed_url"] for row in candidate_rows if row["candidate_id"] == "uk-global-talent-research-leaders"),
            "overlap_decision": "merge_into_mobility_candidate",
            "rationale": "Same country, role audience, and route-specific information need; do not create a second URL.",
        },
        {
            "quota_category": "country_specific_role_pages",
            "topic_screen": "Canadian senior managers",
            "standalone_candidate_url": "",
            "represented_by_candidate_id": "canada-express-entry-senior-managers",
            "represented_by_url": next(row["proposed_url"] for row in candidate_rows if row["candidate_id"] == "canada-express-entry-senior-managers"),
            "overlap_decision": "merge_into_mobility_candidate",
            "rationale": "The source screen treats this as a route-information topic; a separate role/country URL would duplicate its core intent.",
        },
    ]
    overlap_path = DEVELOPMENT / "CANDIDATE-OVERLAP-REGISTER.csv"
    existing_overlaps = read_csv(overlap_path)
    overlap_by_topic = {
        (row["quota_category"], row["topic_screen"]): row
        for row in existing_overlaps
    }
    for row in overlap_rows:
        overlap_by_topic.setdefault((row["quota_category"], row["topic_screen"]), row)
    overlap_rows = sorted(overlap_by_topic.values(), key=lambda row: (row["quota_category"], row["topic_screen"]))
    write_csv(overlap_path, list(overlap_rows[0]), overlap_rows)

    defined_total = len(candidate_rows)
    approved_for_development = sum(
        row["approval_status"] == "approved_for_development"
        for row in candidate_rows
    )
    quota_total = sum(int(row["target_count"]) for row in programme_rows)
    report = f"""# Candidate Research Batch: International Career Mobility

**Screen date:** 2026-11-04  
**State:** Development branch only; no candidate URL is published, searchable, or added to the sitemap.

## Batch output

- {len(CANDIDATES)} mobility candidate URLs have an individual JSON research record, page-specific blueprint, candidate-register row, keyword-intent row, and tracker status.
- Three hub records have individual research; {approved_for_development} hub candidates are approved for development only, and the profile directory remains held.
- Across the {quota_total}-page programme, {defined_total} candidate URLs have individual records and {quota_total - defined_total} quota slots remain without candidate URLs. Candidate counts are not qualified-page counts or a commitment to manufacture pages.
- The candidate URL set is limited to 13 distinct mobility topics. Three country-role concepts are represented by mobility topics rather than duplicated as a second set of URLs.
- Five other mobility topic screens remain held and are not assigned additional URLs.

## Research limits

- Keyword phrases are hypotheses; no Search Console, Keyword Planner, or validated volume export was available.
- Official government sources are the primary factual references. For the EU Blue Card and ISCO references, the source fetch was unavailable or blocked in this environment; the record requires retrieval and verification before any factual draft.
- Direct commercial competitor pages and current country-specific SERPs remain to be assessed. Official route portals are recorded as information-source benchmarks, not as a completed commercial competitor analysis.
- Immigration eligibility, route criteria, KOV serviceability, and outcomes are not inferred from executive seniority.

## Other category screens

Occupation classification now has 23 individually screened candidate records corresponding to the existing linked SOC major-group destinations. All are provisional pending role mapping, user-demand evidence, competitor/SERP review, and commercial-fit validation. Ten additional industry ideas have individual evidence records; their NAICS codes were checked against the local workbook, but the competitor examples are adjacent organizational-service pages rather than candidate SERP results. One DAC-framework guide and two board/NED guides have individual records; their overlap, jurisdiction, and/or document-standard gates remain open.

## Country-market screen

`MARKET-RESEARCH-SCREEN.csv` records the 37-country macro screen. Four routes overlap existing market coverage and are excluded from new URL proposals. The remaining 33 are only potential markets: none has passed local executive-demand, competitor, serviceability, or page-overlap research, so no country URL is proposed yet. `CANDIDATE-OVERLAP-REGISTER.csv` records the three country-role concepts merged into mobility candidates.

## Accountability

`PAGE-PROGRAMME.csv` keeps every original quota visible. Candidate counts reflect records created in this batch, not desired page totals. `CANDIDATE-REGISTER.csv`, `KEYWORD-INTENT-MAP.csv`, and `PAGE-TRACKER.csv` link each mobility route to its own record and blueprint.
"""
    (DEVELOPMENT / "CANDIDATE-RESEARCH-BATCH.md").write_text(report, encoding="utf-8")

    subprocess.run(
        [sys.executable, "-B", str(ROOT / "scripts" / "build-candidate-qualification-register.py")],
        cwd=ROOT,
        check=True,
    )
    print(f"Generated {len(CANDIDATES)} mobility records and blueprints; {len(market_rows)} country screens; {len(candidate_rows)} total register rows.")


if __name__ == "__main__":
    main()
