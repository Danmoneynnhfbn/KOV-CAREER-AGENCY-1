# KOV metadata rollout readiness

Audit date: 12 November 2026

## Decision

The requested 18-category HTML metadata rollout is not ready for injection. The
repository already contains reusable, traceable datasets for several categories,
but other requested categories have no identified source list here. The brief
also does not specify the exact `name` values or which categories/records should
appear on each page. A site-wide batch would therefore require inventing values
or repeating unrelated records on every page.

No HTML or existing source files were changed for this audit. The working tree
already contains extensive user changes; preserve them while preparing any
follow-up implementation.

## Category audit

| Category | Requested target | Repository evidence | Readiness |
| --- | ---: | --- | --- |
| Professional audiences | 471 | No audience taxonomy dataset identified. | Missing source and definition. |
| Job titles | 98,380 | `town-role-insitutution/KOV_Job_Titles_Expanded_98380.txt` has 98,380 lines. Separately, the SEO entity source note documents 44,779 distinct O*NET 31.0 title strings, and the discovery catalog documents 73,380 entries in the legacy list. | Multiple collections with different provenance and counts; choose and document one. |
| Occupations | 1,655 | `town-role-insitutution/KOV_Occupations_Expanded_1655.csv`; validation script `scripts/validate-role-taxonomy.js`. The legacy discovery catalog separately documents 1,155 entries. | Dataset exists; source lineage and category interpretation need to travel with the records. |
| Industries | ≥1,000 | `data/taxonomy/2022_NAICS_Structure.xlsx`; `data/taxonomy/README.md` documents 2,125 code/title rows and the official U.S. Census source. | Ready as a U.S. NAICS taxonomy; not a global industry list. |
| Skills | 560+ | No skills record file identified. | Missing source dataset. |
| Qualifications | 15,000 | No qualification registry dataset identified. | Missing source dataset; target is not supported by the brief’s examples alone. |
| Professional synonyms | 50,000 | Job-title collections include alternate titles, but no separately defined synonym dataset was identified. | Needs a source-backed synonym definition and deduplication policy. |
| Job functions | 100 | No job-function list identified. | Missing curated list and source. |
| Seniority levels | 10 | No seniority list identified. | Missing taxonomy; titles vary by employer and market. |
| Employment types | 30 | No employment-type dataset identified. | Missing source and jurisdiction rules. |
| Career challenges | 250 | No challenge taxonomy identified. | Requires curated source-backed records; examples in the brief are not a 250-item source. |
| Search intents | 5,000 | No query log or intent dataset identified. | Missing data; avoid presenting guessed phrases as observed search demand. |
| FAQs | 500 | The site has FAQ pages and assets, but no 500-record source ledger was identified in this audit. | Existing content may seed a collection; count and provenance need a separate inventory. |
| Languages | 7 | No selected seven-language list or ISO-derived source file identified. | Missing selection decision and data file. |
| Countries | 197 | `data/kov-discovery-catalog.md` documents 197 country records and notes that Kosovo’s `XK` identifier is user-assigned. | Existing list; retain the identifier caveat and verify its intended scope. |
| Cities | 50,250 | `data/seo-entity-datasets-sources.md` documents 1,000 selected GeoNames city records, not 50,250. | Existing partial dataset; target and “city” criteria do not match. |
| Towns/localities | All | The SEO entity source note documents 1,323 GeoNames `PPL` populated-place candidates and explicitly says GeoNames does not consistently distinguish legal towns from cities. | Cannot claim “all” or legal town status from this dataset. |
| Institutions | All verified | The SEO entity source note documents 832 English-language Wikidata organizations/institutions selected from recorded searches. It is not an all-institutions register. | Existing partial search result set; verification scope needs definition. |

## Source records already documented

- NAICS 2022 source and validation: `data/taxonomy/README.md`; U.S. Census
  Bureau source URL: <https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx>.
- GeoNames city and populated-place selection, counts, attribution, and license:
  `data/seo-entity-datasets-sources.md`; source: <https://www.geonames.org/export/>.
- O*NET 31.0 titles and work activities, counts, and CC BY 4.0 attribution:
  `data/seo-entity-datasets-sources.md`; sources:
  <https://www.onetcenter.org/database.html> and
  <https://www.onetcenter.org/license_db.html>.
- Wikidata organization search results and CC0 attribution:
  `data/seo-entity-datasets-sources.md`; API:
  <https://www.wikidata.org/w/api.php>.
- The country, legacy title, and legacy occupation catalog is described in
  `data/kov-discovery-catalog.md`.

## Requirements before HTML generation

1. Approve the exact 18 `meta name` strings and the field representation for
   paired FAQs. Repeated values for a category require repeated `meta` elements;
   category-level names will therefore not be unique per tag.
2. Define whether each page receives a relevant subset or the same global list.
   The brief describes both approaches without selecting one.
3. Resolve conflicting title and occupation collections, and define whether
   records describe reference taxonomies, KOV service coverage, or both.
4. Supply or approve the missing datasets and explicit rules for “all,”
   “verified,” geographic scope, language, and freshness.
5. Generate a homepage-only candidate from selected, source-attributed records;
   inspect its head size and contents before any replication.

This audit records readiness and provenance gaps; it does not claim that a
metadata batch has been inserted or that the requested targets have been met.
