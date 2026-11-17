# Existing Site and Expansion Overlap Reconciliation

**Inventory date:** 2026-11-05  
**Scope:** Current repository HTML, `PAGE_MANIFEST.json`, `sitemap.xml`, role/industry page matrix, local content records, and available classification datasets.  
**Release state:** Development branch only; candidate hubs and all new candidates remain unpublished.

## Repository and sitemap counts

| Inventory | Count | Interpretation |
|---|---:|---|
| `PAGE_MANIFEST.json` entries | 723 | Original HTML inventory; includes private/admin and utility pages |
| Original repository HTML files | 723 | Manifest count reconciles to the non-staging working tree |
| Current HTML files | 729 | Original 723 plus six noindex staging previews |
| Unique sitemap URLs | 703 | All map to existing local files |
| Original HTML absent from the sitemap | 20 | Listed with exact reason in `PAGE-COVERAGE.csv` |
| Staging previews absent from sitemap/search | 6 | Deliberate; all are noindex and not public-navigation links |

`PAGE-COVERAGE.csv` is the row-level reconciliation for every current HTML file, including its sitemap and search status, canonical/redirect metadata, hook coverage, and exclusion reason.

## Existing page families and overlap implications

| Family | Current coverage | Implication for candidates |
|---|---|---|
| Executive/role pages | 605 HTML files: 40 role-directory landing pages, 554 role–industry pages, and 11 role-root pages | Role-by-industry combinations are already heavily represented; avoid reproducing them as generic guides |
| Industry pages | 22 HTML files: 20 NAICS-sector-equivalent nested landing pages, one additional legal-services category, and the industry directory landing page | New industry guides need a narrower, materially different subindustry or candidate decision purpose |
| Market pages | Six pages: Australia, Saudi Arabia, Africa, Dubai, London, and UAE | Australia, Saudi Arabia, UK/London, and UAE already have country-level overlap; Africa is a region and Dubai/London are city-focused |
| FAQs | 30 pages, including the FAQ library | New educational pages must not repackage existing FAQ answers |
| Services | Eight pages under `services/`, plus existing service pages at site root | Career-guide candidates must serve a distinct informational need, not create service-doorway variants |
| Resources | 11 pages under `resources/` | Existing case studies, salary/offer guidance, market-search resources, and representation information require overlap checks |
| Page-data records | 617 JSON files under `data/pages/` (553 role–industry pair records) | Content-source inventory is broader than sitemap status; compare both HTML and JSON before proposing URLs |
| Root SEO data | 57 records in `data/seo-pages.json` and 23 in `data/seo-pages-additions.json` | These records overlap existing service/landing-page concepts and are not an expansion URL list |
| Country reference data | 197 country records in `data/kov-discovery-catalog.jsonld` | A country-list entry is not evidence of KOV serviceability, executive demand, or page uniqueness |
| Occupation reference data | Local 2018 SOC workbooks contain 23 major groups and 867 detailed occupations; project SEO entity catalog also includes O*NET records | Classification breadth is not equivalent to 65 commercially differentiated KOV pages |
| Industry reference data | Local 2022 NAICS workbook covers 20 sectors, with more detailed subsector and industry levels | Additional pages require a senior-professional use case beyond the existing sector and role–industry pages |

### Classification-link reconciliation

The 23 occupation-group links in existing navigation point to missing individual SOC-group URLs. The current repository has 40 executive-role directories and role–industry combinations, but no matching individual SOC major-group landing pages. A prior local research brief describes those directories as already present; the current file inventory does not substantiate that statement.

The 20 broken flat industry URLs are different: all 20 have a semantically equivalent nested sector page already in the repository. The exact flat target, nested equivalent, source-page count, and repeated occurrence count are in `LINK-FAILURE-GROUPS.csv`. These are wrong/missing link paths, not 20 missing industry topics. Existing page links were not changed.

## Program fit and evidence limits

- The local 2026 research brief recommends keeping occupation, job title, seniority, industry, and geography as distinct dimensions; it cautions against treating taxonomies as service claims.
- Candidate counts in the research pass are screening results, not page approvals. Quota totals do not establish search demand.
- No first-party Search Console, Google Keyword Planner, traffic, conversion, or client-demand dataset was available. Keyword volumes and conversion forecasts are therefore not asserted.
- Classification systems and macroeconomic data can identify possible research candidates; they cannot alone establish a commercially useful page or a locally serviceable market.
- The first international-mobility batch has 13 individual candidate records and blueprints. Three country-role concepts are represented within those mobility URLs rather than duplicated. Four existing country-market overlaps were excluded; the remaining 33 macro-screened countries are not qualified URL candidates.
- The candidate program retains each category quota even when evidence supports fewer pages. Current counts, open gaps, and subsequent batch status are in `PAGE-PROGRAMME.csv`, `CANDIDATE-REGISTER.csv`, `PAGE-TRACKER.csv`, and `CANDIDATE-RESEARCH-BATCH.md`.
