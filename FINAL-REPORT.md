# KOV Role and Industry Build — Final Report

## Outcome

The requested role-and-industry build is complete: all 40 role hubs, 21 industry hubs, and 554 role-in-industry pages are generated. This includes 612 new pages beyond the CEO / Legal Services pair page that existed before this continuation. Every page has a data record, generated HTML, Markdown copy, JSON-LD, and discovery-feed entries.

The whole-site validator and the research-page checker both pass. No commit or deployment was made.

## Published page counts and Markdown word counts

| Page type | Published | Current pages and word counts | Required minimum |
|---|---:|---|---:|
| Role hub | 40 | 3,759–10,959 words | 3,000 |
| Role-in-industry page | 554 | 2,327–7,636 words | 1,500 |
| Industry hub | 21 | 2,375–5,484 words | 2,000 |
| Role overview | 1 | 1,244 words | No minimum specified |
| Industry overview | 1 | 1,173 words | No minimum specified |

All role, pair, and industry pages meet the required minimum word count. The content check covered 617 records, including the two overview records, and verified unique FAQ questions and the narrative-overlap limit.

## Files created or changed for this work

### Page records and generated pages

- Updated records: `data/pages/ceo.json`, `data/pages/ceo-legal-services.json`, `data/pages/legal-services.json`.
- New records: `data/pages/roles-overview.json`, `data/pages/industries-overview.json`.
- Added records in this continuation: `data/pages/general-counsel.json`, `data/pages/head-legal.json`, `data/pages/managing-director.json`, `data/pages/managing-partner.json`, `data/pages/partner.json`, and the five matching `data/pages/pair-{role}--legal-services.json` records.
- Added the other 34 role-hub records as `data/pages/{role-slug}.json`, 20 industry-hub records as `data/pages/industry-{industry-slug}.json`, and 548 additional pair records as `data/pages/pair-{role-slug}--{industry-slug}.json`. These, plus the 10 legal-cluster records and pre-existing pages, account for 617 page records including overviews.
- Rebuilt the NUL-filled internal research sheet: `docs/research/ceo-legal-services.md`.
- Kept the broader internal research brief: `KOV-GLOBAL-JOBS-INDUSTRIES-AND-RECRUITING-RESEARCH-2026-10-22.md`; its background references are not treated as support for unsupported public claims.
- Updated the legacy internal CEO/Legal Services FAQ record with its Census source note; confirmed the NAICS FAQ does not appear in the generated public page.
- Generated HTML: `roles/ceo/index.html`, `roles/ceo/legal-services.html`, `industries/legal-services/index.html`, `roles/index.html`, `industries/index.html`.
- Generated Markdown: `ai/roles/ceo.md`, `ai/roles/ceo-legal-services.md`, `ai/industries/legal-services.md`, `ai/roles/index.md`, `ai/industries/index.md`.
- Generated continuation HTML: `roles/general-counsel/index.html`, `roles/head-legal/index.html`, `roles/managing-director/index.html`, `roles/managing-partner/index.html`, `roles/partner/index.html`, plus `legal-services.html` in each of those five directories.
- Generated continuation Markdown: `ai/roles/general-counsel.md`, `ai/roles/head-legal.md`, `ai/roles/managing-director.md`, `ai/roles/managing-partner.md`, `ai/roles/partner.md`, and each matching `*-legal-services.md` file.
- Generated the remaining role hub HTML at `roles/{role-slug}/index.html` and Markdown at `ai/roles/{role-slug}.md`; pair HTML at `roles/{role-slug}/{industry-slug}.html` and Markdown at `ai/roles/{role-slug}-{industry-slug}.md`; and industry HTML at `industries/{industry-slug}/index.html` with Markdown at `ai/industries/{industry-slug}.md`.

### Generation, validation, navigation, and feeds

- Updated: `scripts/_render-research-pages.py`, `validate_schema.py`, `index.html`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `assets/site-search-index.js`, `BUILD-LOG.md`, and `FINAL-REPORT.md`.
- Added: `scripts/check-research-pages.py`, `scripts/build-planned-pages.py`, `scripts/prepare-taxonomy-pages.py`, `assets/ceo-hubs.css`, `assets/ceo-hubs.js`, and `config/internal-note-phrases.json`.
- `sitemap.xml`, `llms.txt`, `llms-full.txt`, and `assets/site-search-index.js` include the completed planned page set. Search indexing was rebuilt from the sitemap.

### Legacy files moved

Moved 88 HTML files to the sibling folder `..\kov-archive\`, preserving their paths relative to the project root:

- 43 root-level taxonomy redirect stubs: 23 SOC-group routes and 20 industry routes.
- 23 legacy SOC group pages under `roles\`, plus the former `roles\index.html`.
- 20 legacy NAICS industry pages under `industries\`, plus the former `industries\index.html`.

The requested `industries\legal-services\index.html` hub was preserved in the site. The archived items are not listed in the sitemap or search index.

## Sources used and reviewed

### Sources supporting claims

1. **O*NET OnLine — Chief Executives, 11-1011.00**  
   <https://www.onetonline.org/link/summary/11-1011.00>  
   Previously opened and used for limited CEO occupation-description context only. It does not support claims in the five newly generated role hubs or pair pages.
2. **KOV Career Agency — Private Career Representation**  
   <https://www.kovcareeragency.org/services.html>  
   Previously opened and used for KOV's described candidate-side service process and scope, including the process language in the generated pages.
3. **KOV Career Agency — Individual Career Services**  
   <https://www.kovcareeragency.org/candidate-services.html>  
   Previously opened and used for the listed document, profile, portfolio, website, positioning, and coaching services.

No new external sources were opened during this continuation. The new page records also list the local SOC 2018 definitions workbook and 2022 NAICS structure workbook as internal taxonomy references. Those classification references are not evidence for recruiter behavior, hiring expectations, or detailed role-specific practice.

The 617 page records' source notes contain five unique references: the two KOV service pages above, the O*NET Chief Executives profile above (on two existing records), the local SOC 2018 definitions workbook (`data/taxonomy/soc_2018_definitions.xlsx`), and the local 2022 NAICS structure workbook (`data/taxonomy/2022_NAICS_Structure.xlsx`). The workbooks were used only for role/industry classification context. The remainder of the sources below were reviewed in prior work or appear in internal research material; they were not used as evidence for newly generated public-page claims.

### Sources opened or present in the internal research record, but not used to make additional public-page claims

4. **O*NET OnLine — Chief Executives: Details**  
   <https://www.onetonline.org/link/details/11-1011.00>
5. **GOV.UK — Being a company director**  
   <https://www.gov.uk/guidance/being-a-company-director>
6. **Solicitors Regulation Authority — Authorisation of firms**  
   <https://www.sra.org.uk/solicitors/guidance/authorisation-firms/>
7. **CIPD — Recruitment: An introduction**  
   <https://www.cipd.org/en/knowledge/factsheets/recruitment-factsheet/>
8. **Association of Executive Search and Leadership Consultants — Homepage**  
   <https://www.aesc.org/>
9. **National Association of Corporate Directors — CEO Succession Planning, Governance Challenges 2019**  
   <https://www.nacdonline.org/all-governance/governance-resources/governance-research/outlook-and-challenges/governance-challenges-2019-ceo-succession-planning/>
10. **Spencer Stuart — Boardroom Best Practice, Chapter 5**  
    <https://www.spencerstuart.com/research-and-insight/boardroom-best-practice-chapter-5>
11. **Spencer Stuart — How Boards Can Overcome the Most Common Succession Planning Obstacles**  
    <https://www.spencerstuart.com/research-and-insight/how-boards-can-overcome-the-most-common-succession-planning-obstacles>
12. **Financial Reporting Council — UK Corporate Governance Code 2024**  
    <https://www.frc.org.uk/docs/6709/html/>
13. **KOV Career Agency — Local homepage content reviewed for existing outcome language**  
    <https://www.kovcareeragency.org/>

These sources were consulted as background or to delimit claims; their firm-specific, historical, regional, or otherwise non-generalizable statements were not presented as universal hiring facts.

### Source checked while auditing an internal FAQ

14. **U.S. Census Bureau — 2022 NAICS Structure**  
    <https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx>  
    The official workbook was opened and code 5411 and its listed subsectors were checked while reviewing the legacy internal FAQ. The FAQ is not present in the current public pair page.

The local SOC and NAICS workbooks in `data/taxonomy/` were also opened and used as internal classification references. They were not presented as evidence of recruiter behavior or role-specific market requirements.

The unverified Korn Ferry “CEO Search & Succession” reference and any claims depending on it were left out of public copy.

The local research brief `KOV-GLOBAL-JOBS-INDUSTRIES-AND-RECRUITING-RESEARCH-2026-10-22.md` also cites the following classification and guidance references as background. They are not cited as support for claims on the current public role/industry pages:

- ESCO occupation classification: <https://esco.ec.europa.eu/en/classification/occupation-main>
- ILO ISCO-08: <https://isco.ilo.org/en/isco-08/>
- United Nations ISIC: <https://unstats.un.org/unsd/classifications/Econ/isic>
- U.S. Bureau of Labor Statistics, SOC 2018: <https://www.bls.gov/soc/2018/home.htm>
- U.S. Census Bureau, 2022 NAICS Manual: <https://www.census.gov/naics/2022NAICS/2022_NAICS_Manual.pdf>
- U.S. Department of Labor, O*NET program: <https://www.dol.gov/agencies/eta/onet>
- O*NET Resource Center: <https://www.onetcenter.org/overview.html>
- U.S. Equal Employment Opportunity Commission, employment tests and selection procedures: <https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures>

## Claims left out as unverified

- Recruiter or named-firm practices, board expectations, and role-market sourcing patterns not supported by opened sources.
- Jurisdiction-specific licensing, eligibility, laws, and regulatory requirements.
- Statistics, compensation, timelines, success rates, guarantees, testimonials, and client-result claims without verified evidence. No such new claims were published.
- Any statement dependent on the unverified Korn Ferry “CEO Search & Succession” reference.

No new external sources were opened during this continuation. Role and industry descriptions were framed as general professional context, as allowed in the user's instruction. Process details were based on the KOV services pages listed above and existing KOV market pages.

## Completion and scope

- Completed: **40 role hubs**, **21 industry hubs**, and **554 role-in-industry pages**.
- The 554 pairs include the pre-existing CEO / Legal Services page. This continuation added 612 pages: 39 role hubs, 20 industry hubs, and 553 role-industry pages.
- No page was merged or skipped. Every role and industry card points to a page that exists.
- The roles and industries overview routes are in the main navigation, sitemap, `llms.txt`, `llms-full.txt`, and search index.
- Unfinished: none within the requested generation and validation scope.

## Validation and checks run

- `.\.venv\Scripts\python.exe scripts\build-planned-pages.py` — completed generation and phase validation. A transient Windows write error occurred during an intermediate attempt; retry continued successfully. One final pair-page overlap finding was fixed, then the final checks below were rerun.
- `.\.venv\Scripts\python.exe scripts\_render-research-pages.py` — passed; rendered 617 page records.
- `.\.venv\Scripts\python.exe scripts\build-site-search-index.py` — passed; indexed 672 sitemap pages, including 652 clustered landing pages.
- `.\.venv\Scripts\python.exe validate_schema.py` — passed: 672 sitemap URLs, 672 public HTML pages scanned for configured internal-note phrases, 685 JSON-LD blocks parsed, feed/search-index consistency, and one robots sitemap directive.
- `.\.venv\Scripts\python.exe scripts\check-research-pages.py` — passed: 617 records, 3,786 unique FAQ questions, all minimum lengths, and no more than 30% Jaccard overlap among 11-word narrative passages.
- `.\.venv\Scripts\python.exe scripts\_render-research-pages.py --check` — passed; verified 617 generated records are current.
- `.\.venv\Scripts\python.exe -m py_compile scripts\build-planned-pages.py scripts\check-research-pages.py scripts\_render-research-pages.py` — passed.
- A page-count and word-count script confirmed 40 role hubs, 554 pairs, and 21 industry hubs. Every required HTML and Markdown file exists, and all word-count minima pass.
- No separate browser/layout test was run.

## Decisions and housekeeping

- No questions were asked. The requested counts were interpreted as 40 role hubs, 21 industry hubs, and 554 role-industry pages, including the pre-existing CEO / Legal Services pair page. The generator added 612 new planned pages: 39 role hubs, 20 industry hubs, and 553 pairs.
- The overlap checker compares Jaccard similarity across combined sets of 11-word passages from authored narrative sections (paragraphs, bullets, tables, and sample panels). FAQ questions are independently checked for uniqueness; repeated navigation/UI patterns do not count as narrative prose.
- Legacy taxonomy files were moved only after confirming the archive target paths did not collide and that those routes were absent from the sitemap.
- No commit or deployment was made.
- The pre-existing worktree contained unrelated modifications. They were left in place; `toba.html` was not edited for this task.
