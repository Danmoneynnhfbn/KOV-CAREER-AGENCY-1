# KOV website publication-status exceptions

**Prepared:** 28 November 2026  
**Scope:** Repository publication register, sitemap, source HTML and selected Google Search Console URL Inspection results.  
**Handling:** Internal QA note. No routes, canonicals, robots directives or HEAD metadata were changed.

## Executive finding

The current repository sitemap and development/PAGE-COVERAGE.csv reconcile at **1,424 published canonical URLs**, with no missing source HTML files. The current sitemap contains **no URLs under /staging/**.

However, the content and publication state are not fully aligned:

1. The source audit found **610 directory/reference pages** whose visible body includes a draft, staged or internal-planning disclosure while the source coverage register labels them published and sitemap=yes. The source HTML files also contain index-follow robots directives.
2. **470** of the 610 contain more explicit placeholder-style wording such as route placeholder, generic numbered guide text or market-report labels.
3. Search Console URL Inspection shows that Google does not treat all representative directory pages the same way. Some are already excluded by noindex; some are discovered but not indexed.
4. Google still reports a small sample of legacy /staging/ URLs as submitted and indexed, even though those URLs are absent from the current sitemap.

The 610 count is a **source-repository consistency flag**, not a claim that 610 URLs are currently indexed in Google. Google URL Inspection is the authority for the selected live URLs at the recorded inspection time.

## Source-repository audit

The full sitemap-wide audit read all 1,424 published sitemap pages and reconciled them with the coverage register:
- Sitemap entries: 1,424
- Published coverage rows: 1,424
- Pages read: 1,424
- Missing source HTML files: 0
- Sitemap/coverage mismatch: 0
- Role and industry comparisons: 12,849
- Exact eight-word Jaccard comparisons above the existing 30% threshold: 0
- Pages with no detected primary service link after relative-path resolution: 0
- Pages below the basic visible-copy threshold: 140 (139 directory/reference pages and one other public page)
- Substantial paragraphs repeated across multiple pages: 165 distinct paragraph strings; some are reference definitions and standard disclaimers, while others are generic staged-route copy and need different treatment.

The exact eight-word comparison indicates no page pair exceeds the repository’s existing 30% audit threshold. It does not prove that every page is useful, adequately researched or individually strong. The audit also finds repeated template paragraphs that are visible across several directory families.

### Source groups with draft/internal disclosure

| Source route group | Pages with source-level publication-status mismatch |
|---|---:|
| Country market guides | 150 |
| Executive career guides | 104 |
| Industry-specific career guides | 57 |
| Country-role pages | 50 |
| Interview guides | 31 |
| Transition guides | 30 |
| Leadership skills and competencies | 28 |
| Salary and compensation guides | 22 |
| Market reports | 20 |
| Mobility | 20 |
| Career and market comparisons | 17 |
| Board and non-executive career | 14 |
| Other directory role/resource indexes | 67 |
| **Total** | **610** |

The 470 placeholder-language flags are a subset of the 610 source-level staging flags. They must not be added to the 610 total.

## Google URL Inspection results

The following representative URLs were inspected in the connected Search Console property on 28 November 2026. These are Google-reported states, not assumptions based on local files.

| URL | Google-reported state | What it means |
|---|---|---|
| /directory/career-resources/board-non-executive-career/board-guide-01/ | Discovered — currently not indexed | Google had discovered the URL but had not indexed it at inspection time. |
| /directory/career-resources/country-market-guides/country-market-guide-01/ | Excluded by noindex | Google reports a noindex directive; its selected canonical is under /directory/ while the declared canonical is under /career-resources/. |
| /directory/roles/ceo/ | Excluded by noindex | Google reports a noindex directive; its selected canonical differs from the declared /career-resources/occupation-guides/ceo/ target. |
| /staging/career-resources/industry-specific-career-guides/freight-forwarding-3pl-career-guide/ | Submitted and indexed | A legacy staging URL is still indexed despite not appearing in the current sitemap. |
| /staging/roles/soc-occupation-11-1011-chief-executives/ | Submitted and indexed | Google selected the staging URL as canonical while the declared canonical points to a /directory/roles/ URL. |
| /staging/resources/hypothetical-career-scenarios/multiple-opportunities/ | Submitted and indexed | A further legacy staging route remains indexed. |
| /services/career-strategy-senior-leaders.html | Submitted and indexed | The page is indexed. Google also reports Dataset structured-result errors for missing descriptions and warnings for creator/license fields on several dataset items. |
| /career-positioning-optimization.html | Submitted and indexed | The canonical service page is indexed. |
| /global-talent-sourcer.html | Not found (404) | Google last crawled it on 27 November 2026 and found a 404 response. This is consistent with the route having been retired. |
| /services.html | Page with redirect | Google reports a redirect state for this URL; its exact live redirect target should be verified separately before changing URL policy. |

## Verified Cloudflare hosting state

The Cloudflare account was checked read-only on 28 November 2026:
- Pages project `kov-career-agency` is active on production branch `master`.
- Both `kovcareeragency.org` and `www.kovcareeragency.org` are active custom domains on the Pages project.
- The account lists no Worker custom domains and no Container applications; Container usage reports zero running instances.
- The separate FastAPI Container Worker is therefore not attached to the live website.
- A preview deployment for the Phase 2 working branch was created, but it is not a production release.

This confirms that the static Pages site and the backend API are separate deployment paths. The API form must not be wired to an assumed public endpoint until the Worker is deployed, configured and tested. No plan upgrade, production route or DNS change was made.

## Why no automatic cleanup was applied

The site instructions protect current HEAD metadata, canonicals, redirect targets and public routes during body-copy work. The source audit and Search Console checks show that the source files, final deployed response and Google-selected index state can differ.

Therefore this phase does not:
- delete any of the 610 directory/reference pages;
- remove or change their sitemap entries;
- rewrite robots, canonical, Open Graph, Twitter or structured-data HEAD tags;
- redirect or rename the legacy /staging/ URLs;
- revive the retired Global Talent Sourcer service page;
- change shared dataset contents or their central JSON-LD catalogue.

These are publication/indexing decisions, not ordinary copy edits. The route-level file kov-staging-routes-review.csv is generated by the audit workflow for exact follow-up.

## Recommended disposition

1. **Keep the 1,424 canonical public URLs stable** while the body-content work continues.
2. Treat the 610 source-level mismatches as a publication register reconciliation task. For each route, decide whether it is intended as a real public index page or an internal/unpublished route.
3. For any route that is truly internal or unfinished, update the source register, sitemap and robots policy together, and verify the final deployed response and Search Console status. Do not leave contradictory published and excluded signals.
4. For any route that should be public, replace draft disclosures with specific, accurate, useful content before actively promoting it.
5. For old /staging/ URLs, select an appropriate 301/410/noindex treatment only after mapping each old URL to a genuine current destination. Avoid redirecting unrelated pages to the homepage.
6. For the retired global-talent-sourcer.html 404, check current inbound references and decide whether a relevant successor exists. Do not restore the obsolete employer-facing service.
7. Review the Dataset structured-data errors separately. Any enrichment should preserve all 18 dataset arrays and must respect the HEAD metadata protection agreed for this project.

## Evidence files

The CI artifact kov-commercial-content-audit contains:
- kov-commercial-content-audit-summary.md
- kov-commercial-content-audit.csv
- kov-staging-routes-review.csv

The Search Console query/page baseline is documented in KOV-SEARCH-CONSOLE-BASELINE.md.