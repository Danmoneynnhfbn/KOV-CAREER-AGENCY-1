# Taxonomy source files

## NAICS

- **Edition:** 2022 North American Industry Classification System (NAICS)
- **Official source:** U.S. Census Bureau, https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx
- **Downloaded:** 2026-10-21
- **Filename:** `2022_NAICS_Structure.xlsx`
- **Worksheet:** `2022 NAICS Structure`
- **Fields used:** Column B (`2022 NAICS Code`) and column C (`2022 NAICS Title`)
- **Validation:** Workbook opened with `openpyxl` 3.1.5. The structure contains 2,125 unique nonblank code/title records: 17 standalone two-digit sector rows plus three grouped sector rows (`31-33`, `44-45`, `48-49`), 96 three-digit subsectors, 308 four-digit industry groups, 689 five-digit NAICS industries, and 1,012 six-digit U.S. national industries. Parent-prefix relationships were checked, treating the three grouped sector codes as ranges. Titles may end in `T`, the workbook's trilateral-agreement indicator; retain the official title/indicator in source data and remove the marker only for presentation when appropriate.
- **Interpretation:** NAICS has 20 sectors when the three grouped sector rows are counted. The 689 five-digit industry-level records and 1,012 six-digit U.S. national-industry records are separate levels and must both be retained for complete coverage.
- **SHA-256:** `217c9e0d4d74e7517bc288f5f308b73aa0de5ee787976a6dd222412be28ada22`

## SOC

- **Edition:** 2018 Standard Occupational Classification (SOC)
- **Official landing page:** https://www.bls.gov/soc/2018/home.htm
- **Structure workbook URL:** https://www.bls.gov/soc/2018/soc_structure_2018.xlsx
- **Definitions workbook URL:** https://www.bls.gov/soc/2018/soc_2018_definitions.xlsx
- **Download method/date:** Retrieved from the official XLSX links on the BLS landing page using the interactive browser session on 2026-10-21. The browser received HTTP 200 and the expected XLSX MIME type for both downloads.
- **Files:** `soc_structure_2018.xlsx` (worksheet `2018 Structure`) and `soc_2018_definitions.xlsx` (worksheet `2018 SOC`)
- **Fields used:** Structure workbook columns A-D give the major, minor, broad, and detailed occupation codes, respectively, with titles in column E. Definitions workbook columns A-D give SOC group, code, title, and definition.
- **Validation:** Both workbooks opened with `openpyxl` 3.1.5. Each contains 1,447 unique occupation codes: 23 major groups, 98 minor groups, 459 broad occupations, and 867 detailed occupations. Every detailed occupation has a definition. Code, title, and level records match exactly between the structure and definitions workbooks.
- **SHA-256:** `soc_structure_2018.xlsx`: `ade08af40923266f3a854842e888ca3e93c15b26a147c20a2b12a61f4c4f4077`; `soc_2018_definitions.xlsx`: `f8b9ca7cccea78e30abfc9b96ab8a9dd2632cc8c8b57ee9b38a9b871e8fe2a89`

## Ofqual qualifications

- **Source:** Ofqual Register of Regulated Qualifications, official CSV download at https://downloads.find-a-qualification.services.ofqual.gov.uk/extracts/Qualifications.csv; public discovery page https://www.gov.uk/find-a-regulated-qualification; documented API https://register-api.ofqual.gov.uk.
- **Downloaded:** 2026-11-15. Raw source file: `ofqual-regulated-qualifications.csv` (23,993,620 bytes; SHA-256 `5f16f23d6af0a195ad28615095cd59cac71c96e835cc1641551b34f889d54eb0`).
- **Selection:** Only records with official status `Available to learners`; one record per unique Ofqual qualification number. This yields 17,268 records, 17,156 unique titles, and 112 same-title cases with distinct official identifiers. The active subset exceeds the approved 15,000 target. The 53,195-row raw extract contains historic, future and unavailable qualifications that are not presented as active.
- **Normalized data:** `ofqual-active-qualifications.json`; retains official qualification number, title, awarding organisation, level, type, subject area, status, start date, and specification URL where supplied.
- **Coverage limitation:** Ofqual regulates qualifications in England and Northern Ireland. It is not an international qualification register; no claim of global completeness is made.
- **License:** Open Government Licence v3.0, https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/.
- **Validation:** `python scripts/validate-qualification-dataset.py` checks the source digest, complete-row count, active-status filter, identifiers, duplicate titles, count and target.

## GeoNames populated-place and administrative crosswalk

- **Source:** GeoNames `cities1000.zip`, https://download.geonames.org/export/dump/cities1000.zip; GeoNames administrative divisions from `data/taxonomy/geonames-admin2Codes.txt` and first-level divisions compiled in `assets/geonames-admin1.js` from `countryInfo.txt` and `admin1CodesASCII.txt`.
- **Downloaded:** 2026-11-15. ZIP SHA-256 `94b9d1b363ed0d3dd32f1a0a34622bfd3bdb5cfd454d5c9463d1f6c3e3ef31f3`.
- **Crosswalk:** `geonames-city-crosswalk.json` keeps only exact normalized city name plus ISO2 matches with a unique nearest candidate within 3 km, and at least 1 km separation from the next candidate. Fuzzy names are not used. Every accepted GeoNames admin1 code is checked against its source division code and GeoNames ID.
- **Verified results:** 34,557/50,250 source-city rows matched a GeoNames populated place; 13 were ambiguous; 15,693 remain unmatched. 34,378 matched city records have an admin1 relationship verified through the GeoNames city ID and division code; 28,983 also have a verified admin2 ID/name join. Of the matched records with admin2 codes, 645 codes are absent from the downloaded admin2 register; 4,929 matched places have no admin2 code. 179 matched records lack a validated admin1 directory relationship. The crosswalk does not claim every city has been reconciled.
- **License:** GeoNames data is CC BY 4.0; https://www.geonames.org/license.html.
- **Validation:** `python scripts/validate-geonames-city-crosswalk.py` verifies source file digest, source-city identity, uniqueness and admin1 code/ID joins.

## Outstanding taxonomy categories

As of 2026-11-15, verified record counts are 0/471 professional audiences, 0/100 job functions, 0/10 seniority levels, 0/30 employment types, 0/250 career challenges, and 0/5,000 career-search intents. No datasets meeting the project’s requirement for sourced individual records and traceable provenance were present or verified in this continuation. O*NET work styles, job zones, tasks and job families are not substitutes for these distinct categories; they have not been relabelled or padded to meet targets.

### Source assessment for remaining categories

- **Job functions:** O*NET supplies 23 SOC-based job families, while ESCO supplies a hierarchical occupation classification. Neither is a 100-item independent job-function catalogue, so neither has been relabelled to meet that target. Sources: https://services.onetcenter.org/reference/online/browse/browse_family and https://esco.ec.europa.eu/en/classification/occupation-main.
- **Seniority levels:** O*NET Job Zones classify preparation required for occupations; they are not worker seniority. Its 5 levels are not substituted for the target of 10. Source: https://www.onetcenter.org/database.html.
- **Employment types:** ILO ICSE-18 is an official status-in-employment classification. It measures employment status/relationships rather than the site?s intended job arrangement taxonomy and cannot substantiate 30 distinct employment-type records. Source: https://www.ilo.org/publications/international-classification-status-employment-icse-18-manual.
- **Career-search intents:** Google Ads Search Terms Insights derives account-specific, intent-grouped queries and withholds some query terms for privacy; it is not a public reusable corpus of 5,000 verified career-search intents. Sources: https://support.google.com/google-ads/answer/11386930 and https://developers.google.com/google-ads/api/docs/query/overview. No query-volume data was inferred.
- **Professional audiences and career challenges:** reviewed O*NET and ESCO occupational resources describe occupations, skills, tasks and work characteristics, but do not offer verified individual records for these two KOV-specific categories at the required coverage. Creating 471 audiences or 250 challenges from those frameworks would be an inference, so no records were published.

These source assessments explain why the former generated placeholder records in the legacy expanded-taxonomy file are not counted as verified records.

## Six-category taxonomy update (2026-11-16)

The 2026-11-15 zero-count assessment above is a historical checkpoint and is superseded by the generated, provenance-checked file `kov-six-category-taxonomies.json`. The file is built reproducibly by `scripts/build-six-taxonomy-datasets.js` and checked by `scripts/validate-six-taxonomy-datasets.js`. The former generated placeholder arrays have been removed from `assets/expanded-taxonomy.js`; it now exposes a compatibility view over source-backed data. The published snapshot is `verified-expanded-taxonomy.json`, built by `scripts/build-verified-expanded-taxonomy.js` and checked by `scripts/validate-expanded-taxonomy.js`.

| Category | Approved target | Current records | Provenance and method |
|---|---:|---:|---|
| Professional audiences | 471 | 592 | KOV-defined role/industry audiences deduplicated from indexable `roles/{role}/{industry}.html` headings. Each record retains the source route, heading, and page mapping. The source inventory contains 594 routes; two labels collapse under normalization. The verified set exceeds the target by 121 and is not truncated. |
| Job functions | 100 | 19 | KOV-defined functional groups supported by existing function-specific executive, director, head, VP role pages, and the procurement FAQ. These are not relabeled O*NET job families or ESCO occupations. The remaining 81 functions have not been verified. |
| Seniority levels | 10 | 10 | Internal KOV descriptive title-scope framework, linked to KOV senior-career and role pages. It is not a universal rank scale and assigns no years-of-experience thresholds. |
| Employment types | 30 | 30 | Ten detailed ICSE-18 status-in-employment categories plus 20 distinct ILO/EU/UK-described employment arrangements or work modalities. Each record names its dimension and source. Dimensions overlap; the 30 are not a mutually exclusive classification or a claim of universal legal status. |
| Career challenges | 250 | 250 | KOV FAQ-derived planning and career-positioning topics, transformed under explicit question-pattern rules. Each record retains the original FAQ question, source page and page mapping. No prevalence is asserted. |
| Career-search intents | 5,000 | 871 | 367 unique primary/secondary terms from `../development/KEYWORD-INTENT-MAP.csv`, 4 additional unique terms from parsed KOV research records, and 500 FAQ-derived questions, retaining identifiers, intent classification, geography, research status and source-file/page provenance. The 112 research record files were examined; 110 parsed, while two malformed JSON records were excluded. Each entry is an editorial/researched hypothesis, not a Search Console observation; volume is unavailable. |

The six categories contain 1,772 unique records in total. The net difference from the combined target is 4,089 records (5,861 target minus 1,772 actual). The unmet per-category gaps sum to 4,210: job functions 81 and career-search intents 4,129. Professional audiences exceed their target by 121, offsetting that excess in the combined total. Employment-type, seniority and career-challenge counts meet their targets. No placeholder combinations were used to close gaps.

### Source notes

- ICSE-18's ten detailed categories are taken from the ILO manual: https://webapps.ilo.org/ilostat-files/Documents/ICSE-18_manual.pdf. The other employment-arrangement and modality records cite the ILO temporary-employment note, the ILO non-standard-employment report, the ILO work-sharing explanation, the ILO remote-work note, ILO home-work guidance, the ILO platform-economy convention, EU working-conditions guidance, and UK employment-status guidance. Relevant record-level source URLs are retained in the JSON file.
- Search Console query performance can be obtained only from an authorized property. Google's documented Search Analytics API is https://developers.google.com/webmaster-tools/v1/searchanalytics/query. No connected property export was available in this build, so keyword-map, research-record, and FAQ question entries remain editorial/researched hypotheses; no click, impression, volume, or ranking measures are asserted.
- Audience, function, seniority and challenge records are internal KOV classifications derived from public KOV pages and FAQ source paths. These categories are not represented as external standards.

### Integration and validation

The JSON-LD builder reads the six-category snapshot for the homepage's global Dataset summaries and individual DefinedTerm records. It maps audience, function, seniority, challenge and any other record only to its retained public page paths; it does not add employment arrangements or search hypotheses to unrelated pages. The homepage is the global reference. The page-category map is regenerated from saved graphs by `scripts/update-jsonld-page-map.py`. Dataset counts, unique IDs, labels, provenance, page targets, FAQ source questions, and the non-GSC classification are checked by `scripts/validate-six-taxonomy-datasets.js`.

## Verified replacement of generated legacy taxonomy (2026-11-17)

The former `assets/expanded-taxonomy.js` generated combinations and numbered records without record-level evidence. Those unsupported labels are not retained. The compatibility module and downloadable JSON snapshot now assemble source-backed records from the six-category data, the ISO language subset, ESCO skill concepts and alternative labels, active Ofqual qualifications, and the recorded Wikidata organizations/institutions.

| Directory | Verified records | Provenance and identity |
|---|---:|---|
| Professional audiences | 592 | KOV role/industry headings; page-source identity. |
| Languages | 7 | ISO 639 names and codes; code identity. |
| Seniority levels | 10 | KOV title-scope classification; unique stable IDs. |
| Job functions | 19 | KOV role-page and FAQ evidence; unique stable IDs. |
| Employment types | 30 | ILO ICSE-18 plus separately sourced ILO/EU/UK arrangements and modalities. |
| Career challenges | 250 | Unique KOV FAQ-derived topics with source questions and paths. |
| Career-search intents | 871 | Keyword-map, research-file and FAQ candidates. All are hypotheses; no Google Search Console observation or search-volume claim is made. |
| Skills | 560 | ESCO concepts with source URIs and descriptions. |
| Qualifications | 17,268 | Active Ofqual records, identified by official qualification number. |
| Professional synonyms and related terms | 49,999 | ESCO alternative labels, unique by language, concept URI and normalized label. One repeated whitespace variant for the same concept was removed from the 50,000-row source list. |
| Organizations and institutions | 832 | Wikidata English-language entity selection, identified by QID. The source includes organizations as well as institutions and is not described as an education-only list. |

The snapshot contains 70,438 unique source-backed entries across these directories. Natural identity is category-aware: qualification titles can repeat under different official numbers; organizations can share a name; and an alternative label may identify distinct ESCO concepts. `scripts/build-discovery-structured-data.js` now links to the verified JSON distribution and reports actual record counts. The job-function and search-intent targets remain short by 81 and 4,129 records respectively; the remaining source evidence does not support additional unique records without relabeling or padding.

## Additive taxonomy updates (2026-11-20)

The original source records were preserved. The following append-only additions are now present in the source inputs:

| Directory | Source records after additions | Approved target | Status |
|---|---:|---:|---|
| Languages | 30 | 30 | Seven original records retained; 23 ISO 639-1 language records appended in `languages.json`. |
| Professional synonyms and related terms | 50,000 after the verified snapshot is rebuilt | 50,000 | One additional German ESCO occupation alternative label appended in `additional-professional-synonyms.json`; the verified taxonomy builder now includes supplemental records. |
| Job functions | 19 | 100 | 81 additional records remain unverified. No O*NET work activities or occupations have been relabelled as job functions. |
| Career-search intents | 1,138–1,142 estimated unique source candidates before rebuild | 5,000 | The previous 871-record snapshot plus 271 relevant, unique Google Search Console queries. None of the 271 overlap the keyword-map terms or FAQ questions; up to four may overlap the four research-file additions. The generated unique count remains unverified until rebuild. |
| Organizations and institutions | 832 retained baseline; 807 supplemental unique candidates before overlap check | 1,300 | Current builder filters accept 835 of 916 candidate rows and leave 807 unique candidates inside the supplemental pool. The net-new count after checking the original 832 by QID and normalized name is not yet verified. The build must establish at least 468 net-new records. |

The language additions use ISO 639-1 two-letter codes and names; see the existing ISO and Library of Congress source references above. The synonym addition is the German alternative label “Instandhaltungstechniker Flughafen” for ESCO occupation “airport maintenance technician,” concept URI `http://data.europa.eu/esco/occupation/822bbc2d-bc6a-4fb5-afb8-89170120c6d8`. Its source record was retrieved from the ESCO API and checked against the current 50,000 source labels before inclusion.

These are source-input changes. The generated `verified-expanded-taxonomy.json`, compatibility output, and inline homepage JSON-LD have not yet been regenerated from the new source inputs. Therefore, do not treat the new language and synonym counts as already present in the live HTML metadata until the project build and validation are run.



## Additional source records (2026-11-20)

### Observed Google Search Console queries

The connected KOV Career Agency Search Console property was queried for the
16-month period **2025-07-20 through 2026-11-17**. The retained source file
`gsc-observed-search-queries.json` contains all 299 query rows returned by
Search Console, including clicks, impressions, CTR and average position.
Of these, 271 are marked relevant to KOV career representation, executive
search, leadership, recruitment and related service topics; 28 rows remain in
the source file with an explicit exclusion reason. The taxonomy builder merges
only relevant, non-duplicate query strings. The 271 relevant query strings are
unique within the GSC export and have no normalized-text overlap with the 367
unique keyword-map terms or the 500 FAQ questions. The prior 871-record snapshot
also included four additional research-file terms, so between 267 and 271 of
the GSC rows are expected to add new unique records. This gives an estimated
pre-build range of 1,138–1,142 unique career-search intent records. The exact
count depends on overlap with those four research-file terms and must be read
from the generated file after rebuild. The 481 query/page rows from the same
period contain the same 299 unique query strings, so they add page-level
observations rather than additional search terms. Search Console metrics remain
observed property data; impressions are not keyword search volume. The existing
generated six-category JSON snapshot has not yet been rebuilt from the updated
source.

### Additional organizations and institutions

The file `additional-organizations-wikidata.json` contains 916 supplemental
candidate QIDs with direct Wikidata `instance of` classifications. Reapplying
the current organization-builder filters accepts 835 rows; deduplicating within
the supplemental pool leaves 807 unique candidates by QID and normalized label.
This is not yet a net-new count against the existing 832-record source set. The
revised builder filter excludes additional non-organization entities such as
railway lines, legal acts, publications, buildings, vehicles and products.
Their Wikidata QIDs, English labels, descriptions, search queries, exact API
source URLs and direct `instance of` class labels are retained. The entity
builder preserves the existing 832 institution records, deduplicates additions
against them by QID and normalized label, and requires 468 net-new records to
reach exactly 1,300. The existing generated 23.5 MB JSON-LD catalog has not yet
been rebuilt; the resulting deduplicated total must be confirmed by running the
builder with the original GeoNames, O*NET and Wikidata input files.

### Remaining category limitations

The job-function inventory remains at 19 of 100. The builder's existing role
crosswalk supports those 19 named KOV function groups; the 81 remaining
functions have not been added because no qualifying, non-duplicative source
catalog has yet been established. The GSC query export adds between 267 and 271
new unique search-intent strings after the already verified overlap checks;
the exact total still depends on up to four research-file terms. These source
changes do not mean the generated six-category snapshot already contains the
new records.
