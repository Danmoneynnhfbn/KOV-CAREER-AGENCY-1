# Site Coverage and Regression Audit

Generated from the current development worktree by `scripts/audit-site-coverage.js`.

## Coverage summary

- HTML files scanned: 854.
- Unique sitemap URLs: 703; missing local targets: 0.
- Published/search-eligible sitemap pages: 703; search text entries: 703; searchable catalog entries: 703.
- Eligible pages missing search text/catalog: 0/0.
- Eligible pages with shared footer hook: 703/703; without header: 30.
- Link-validator failures: 4515 current vs 4515 at committed branch baseline; 0 newly introduced, 0 resolved.

## Exclusion reason counts

- 1: Error utility route; not a published content landing page
- 14: Explicit robots noindex
- 1: Explicit robots noindex,nofollow; internal operations console
- 1: Explicit robots noindex; private publishing dashboard
- 2: Explicit robots noindex; private/account or user-directory surface
- 1: Protected administrator template; not a public page
- 131: Unpublished development preview; noindex and deliberately omitted from sitemap

## Link validation baseline

The committed `HEAD` HTML tree is compared with the current worktree. The pre-existing modified protected dashboard is read from `HEAD` for both sides because it was already dirty before this implementation. New staging files are counted only on the current side.

- Current broken-target detail: 43 unique missing destinations; 20 industry paths have equivalent nested pages, 23 occupation-group pages have no current equivalent; 4515 anchor occurrences across 35 source pages.
- Repeated-target pattern: 105 occurrences per target across 35 shared source pages.
- Asset/H1/other validation failures: 0.

All 4,515 failures are pre-existing missing internal anchors: 20 flat industry URLs point to equivalent existing nested sector landing pages, while 23 occupation-group destinations have no current equivalent. Each target occurs three times on the same 35 existing source pages. These are missing destination paths rather than missing assets; no current broken assets or H1 failures were detected. No protected existing-page links or content were changed. Per-link baseline classification is in [LINK-VALIDATION.csv](./LINK-VALIDATION.csv); destination and source-page groups are in [LINK-FAILURE-GROUPS.csv](./LINK-FAILURE-GROUPS.csv).

No new static HTML link, asset, or H1 validation failures were introduced by the current worktree.

## Page-level reconciliation

[PAGE-COVERAGE.csv](./PAGE-COVERAGE.csv) lists every scanned HTML file with its sitemap status, eligibility, explicit reason for exclusion, canonical/redirect metadata, shared hooks, and generated search-index coverage. The complete file-level comparison against the implementation-start worktree snapshot is in [WORKTREE-BASELINE.csv](./WORKTREE-BASELINE.csv).

## 577-page research programme

[PAGE-PROGRAMME.csv](./PAGE-PROGRAMME.csv) tracks all 16 category quotas and current candidate, research-record, blueprint, and qualification counts. [CANDIDATE-QUALIFICATION-REGISTER.csv](./CANDIDATE-QUALIFICATION-REGISTER.csv) identifies approved-for-development-only, provisional, and held candidates. Individual batch reports and per-page records cover the three hubs, mobility routes, 23 SOC major-group destinations, industry-specific guides, and narrow leadership/board topics; broader topics are merged or held where evidence or uniqueness is insufficient. The 33 macro-only country screens remain unqualified. Candidate routes remain excluded from published HTML, public navigation, sitemap, and search.
