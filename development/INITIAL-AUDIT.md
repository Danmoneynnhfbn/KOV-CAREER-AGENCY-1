# Initial Development Audit

**Date:** 2026-11-04  
**Scope:** Repository structure, existing shared page hooks, search-index generation, staging foundations, and available local validation.  
**Environment:** `copilot/first-stage-foundations`; no production deployment or production file replacement performed.

## Starting condition

- The repository was already on a non-production development branch with user changes in the worktree. Those changes and untracked files were left untouched.
- The prior website audit and baseline documents remain the source for content, metadata, SEO, and page-level findings; this implementation does not rewrite existing page content.
- A repository scan excluding dependency and design-reference folders found 723 HTML pages. The shared footer script is referenced by 721 pages, while the site-search script is directly referenced by only 55. The footer bootstrap is therefore the smallest shared integration point for extending search and the global navigation.
- A follow-up check found 48 footer-enabled pages without a semantic header; those pages use a fixed, accessible search button rather than silently lacking a search entry point.
- The internal search index builder uses `sitemap.xml` as its source of eligible pages and derives visible page text from the corresponding HTML files. Search coverage therefore depends on sitemap coverage.

## First-stage implementation

- Shared footer bootstrap now loads the site-search and navigation foundations across pages already using the footer hook.
- Search results are capped to the 20 highest-ranked matches, display the total match count, support arrow-key result navigation, and resolve links from the site root for nested pages.
- A common navigation foundation and shared responsive implementation styles are added; their visual treatment is provisional pending the owner's references.
- Three noindex staging hub foundations are available under `staging/`; they contain structure only, not researched claims or personal profiles.
- `development/PAGE-TRACKER.csv` records the initial three hub work items. The proposed 577-page inventory was not present as a structured, page-level source in the inspected project files and has not been invented.

## Release and research gates

- Staging pages are excluded from `sitemap.xml`, so the current search-index generator does not include them.
- New public pages should enter `sitemap.xml` only after a page-specific research record, blueprint, content review, and release approval are complete. Re-running `scripts/build-site-search-index.py` then adds sitemap-listed pages to the generated search catalog and visible-text search data.
- Directory profiles require an explicit consent, privacy, retention, and removal design before any personal data is added.
- This is a source-level initial audit, not a live production, ranking, accessibility conformance, or legal review.

## Validation status

- JavaScript syntax checks pass for the shared footer, search, and navigation scripts.
- The repository-wide `scripts/validate-site.js` currently reports 4,515 link/asset failures across the 727-page tree, primarily repeated missing occupation and industry targets referenced from market pages. This broad issue set requires a separate repair pass; no market or occupation page was edited as part of this authorized foundation work.
- The project virtual-environment Python successfully regenerated the sitemap-driven search catalog: 703 sitemap pages indexed, including 652 clustered landing pages. Staging routes remain absent from the sitemap and generated index.
- Browser smoke checks passed on staging routes and existing homepage/role routes at desktop and mobile widths; nested-page search returns a root-relative result.
- A focused Playwright smoke test is available as `npm run test:foundations`.

## Follow-up coverage and research-programme reconciliation

- The current scan covers 729 HTML files: the 703 sitemap-listed eligible pages plus 26 excluded pages/previews. `PAGE-COVERAGE.csv` names each excluded file and its reason.
- Every one of the 703 eligible sitemap pages appears in both generated search data sets. Noindex, private/unpublished status, and staging/draft paths are filtered by the index builder; focused tests cover those filters.
- All 703 eligible pages include the shared footer bootstrap, which loads shared navigation and search. Thirty have no source `<header>`; their navigation is supplied at runtime by the fallback. The two files without the footer hook are `.private_admin/blogpostcheck.html` and `blogpostcheck.html`, excluded protected/private publishing dashboards and left unchanged.
- Link validation reports 4,515 unchanged failures: 43 missing anchor destinations (23 occupation groups and 20 industry sectors), each occurring three times on the same 35 source pages. There are no current missing local assets or H1 failures and no new failures. The missing destinations were not repaired because existing-page changes require approval and any target page first needs its research record and blueprint.
- The 577-page program is tracked across 16 categories. Sixteen URLs are currently defined: three hub targets and 13 international-mobility candidates, each linked to an individual record and blueprint file. The remaining 561 quota slots have no proposed URLs. Four overlapping country-market routes are excluded; 33 other countries remain macro screens only and have no proposed URLs. Other categories remain open until candidate-specific evidence is recorded.
- The hub research batch updated all three hub records and blueprints. Career Resources and Research are approved for development only; the Professional Profile Directory is held at research stage because it overlaps the existing noindex `profiles.html` route and lacks a verified consent/privacy operating model.
- Reusable page components and a noindex template preview now accompany the three hub shells.
- All six staging previews are explicitly marked structural only; their component styling is not an approved visual direction and remains open for the owner's references.
- `WORKTREE-BASELINE.csv` compares implementation changes to the recorded start state, preserves all pre-existing dirty/untracked work, and uses NUL-delimited Git output so unusual filenames are not misclassified.
