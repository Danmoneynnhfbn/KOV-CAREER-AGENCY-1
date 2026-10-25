> Next step: Validate Legal Services cluster, then continue to the next planned phase.
> Planned pages added: 10/612; current stage: Legal Services cluster.

# Private build log

## 2026-10-23 — resumed after interruption

- Read all five pages of `KOV-Role-Hub-Plan.pdf` using the project `.venv` and `pypdf`.
- Confirmed there was no existing `BUILD-LOG.md`; created this file.
- Confirmed the three requested page files and their data/Markdown companions are now populated and readable (not zero-byte or NUL-filled).
- Worktree is heavily modified and includes `toba.html`, `.vscode`, bytecode, existing role pages, and many old taxonomy pages. Preserve unrelated edits; leave `toba.html` untouched and do not include `.vscode` or `__pycache__` in generated deliverables.
- Requested page set from the plan: 40 role hubs, 21 industry hubs (20 NAICS sectors plus a separately presented Legal Services hub), and up to 840 role/industry pages. The user additionally requires all 21 industries for C-suite and board roles and at least eight relevant industries for each VP, director, and head role.
- Existing working generator is `scripts/_render-research-pages.py`; records live in `data/pages/`. Existing internal-note configuration and whole-sitemap validation are present.
- Source facts opened for the existing CEO cluster in the previous task: O*NET Chief Executives 11-1011.00 and KOV `services.html`, `candidate-services.html`. No source is assumed verified for other roles or industry claims.
- Important constraint: do not mass-publish template-swapped pages or infer recruiter, licensing, regional, or market facts. Only add pages with sufficient distinct, supportable content.
- Worktree contains both legacy taxonomy directories and intended target pages. Archive only identifiable SOC group and old NAICS directory HTML. Preserve requested `industries/legal-services/`.

## Execution ledger

- Reconciliation: complete.
- Existing CEO cluster: rebuilt from the three existing records; current Markdown lengths are 3,759 words for the CEO hub, 2,327 for the CEO/Legal Services page, and 2,375 for the Legal Services hub.
- Role and industry overviews: added at `/roles/` and `/industries/`, with data records, HTML, Markdown copies, FAQs, JSON-LD, canonical/OG/Twitter metadata, and links only to currently built guides. Added both routes to desktop and mobile homepage navigation.
- Taxonomy archival: moved 88 legacy HTML files to `..\kov-archive`, preserving relative paths. This includes the old SOC group pages, legacy industry directory pages, the former `roles/index.html` and `industries/index.html`, and root-level redirect stubs. The requested Legal Services hub remains in the site.
- Discovery feeds: added the two overview routes and current guides to `sitemap.xml` and `llms.txt`; regenerated `llms-full.txt` and `assets/site-search-index.js`.
- Validator: adjusted industry-path rules so approved overview and industry hub routes are accepted while flat legacy industry pages and SOC group pages remain excluded.
- Quality checks after these changes: `validate_schema.py` passed for 60 sitemap pages; the research-page checker passed for 5 records, 36 unique FAQ questions, minimum lengths, and overlap; renderer `--check` passed; modified Python scripts compiled successfully.
- Source coverage: verified source material in the current records is limited to O*NET's Chief Executives profile and KOV's `services.html` and `candidate-services.html`. These do not support the requested page-by-page claims for the remaining roles, industries, markets, recruiter practices, board expectations, or jurisdiction-specific requirements.
- Reconciliation follow-up: detected `docs/research/ceo-legal-services.md` was NUL-filled (17,911 bytes). Rebuilt the internal sheet from the current pair-page source record and explicitly recorded research boundaries and remaining gaps.
- Source audit follow-up: checked the Census Bureau's official 2022 NAICS structure workbook against an old internal CEO/Legal Services FAQ, added its source note and local source label, and confirmed that FAQ is not in the current generated public page. The current public page does not make the NAICS 5411 claim.
- Final public-copy audit: scanned 110 non-archived HTML files outside `toba.html` against every configured internal-note phrase; no hits. Sitemap validator also passed, and renderer freshness and research-quality checks passed after the source and report updates.
- At the initial resume checkpoint, the remaining pages had not yet been generated; this scope was subsequently completed in the continuation recorded below.
- No commit or deployment was performed.

## Resumed full build progress

- Latest checkpoint: 10/612 new planned pages recorded; stage: Legal Services cluster.
- The full build script is idempotent: existing data records are retained and only missing records are written.
