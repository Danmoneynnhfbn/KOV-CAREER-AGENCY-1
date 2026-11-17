# Page-category implementation map

Date: 15 November 2026

This map covers all 2,076 HTML files in the repository inventory. The custom taxonomy `<meta>` implementation was migrated to JSON-LD and removed after validation. `jsonld_categories` and `jsonld_record_nodes` in the CSV are the saved-page structured-data results. General Organization, WebSite and WebPage data is retained where it already existed; taxonomy records are limited to the homepage and pages with subject-matched records. Staging, noindex, private-admin and design-reference pages are not assigned taxonomy records.

- HTML inventory inspected: 2,076 files (711 marked indexable; 1,365 marked noindex).
- Indexable staging routes excluded from public taxonomy assignment: 8; eligible public pages: 703.
- Homepage: 18 Dataset descriptions and 7,222 individual small-category records.
- Subject-matched page-specific taxonomy: 651 pages and 70,512 individual JSON-LD record nodes.
- Total pages with taxonomy records including homepage: 652; total individual taxonomy nodes: 77,734.
- Removed after conversion: 206,352 homepage custom tags and 71,109 page-specific custom tags. No project taxonomy `<meta>` tags remain.

- Qualification source update (15 November 2026): 17,268 active Ofqual records (17,156 unique titles; 112 title duplicates retained by identifier) are documented in `data/taxonomy/README.md` and distributed as the normalized JSON snapshot. Ofqual scope is England and Northern Ireland, not global.
- Six categories remain without verified individual records: professional audiences 0/471; job functions 0/100; seniority levels 0/10; employment types 0/30; career challenges 0/250; career-search intents 0/5,000.
- Geographic crosswalk supplement: GeoNames matches 34,557 source cities; 34,378 have a verified admin1 relationship and 28,983 additionally have a verified admin2 join. 15,693 city rows remain unmatched/ambiguous; 179 matched rows lack admin1; among matched rows with admin2 codes, 645 lack a code-register entry, while 4,929 have no admin2 code. See `data/taxonomy/README.md`.

- Validation report: [jsonld-implementation-validation-2026-11-13.json](./jsonld-implementation-validation-2026-11-13.json).

## Classification

| Page class | HTML files |
| --- | ---: |
| staging | 728 |
| noindex | 637 |
| job-role | 605 |
| other-indexable | 37 |
| faq | 31 |
| industry-hub | 22 |
| design-reference | 7 |
| geographic | 7 |
| private-admin | 1 |
| homepage-global-reference | 1 |

## Implemented page groups

| Key page group | Pages with JSON-LD records | Individual JSON-LD record nodes |
| --- | ---: | ---: |
| faq | 22 | 137 |
| geographic | 6 | 244 |
| industry-hub | 22 | 2397 |
| job-role | 588 | 67601 |
| other-indexable | 13 | 133 |

## Category selection rules

- Role pages: exact role heading matched against title and occupation lists. ESCO skills may match explicit page copy; the 24 O*NET 31.0 Essential/Transferable Skills associated with Chief Executives (11-1011.00) are also assigned to all 22 CEO pages and documented with importance ratings in `data/taxonomy/onet-chief-executives-skills.json`.
- Industry hubs and role/industry pages: NAICS records are selected from the sector crosswalk in the implementation script. Industry hubs receive exact occupation labels connected to published role/industry routes.
- Geographic pages: countries are selected for named markets; the countries directory receives the full 197-country list. City and GeoNames locality values are added only when explicitly named in the page title, heading, or route and when the country can be matched.
- Career and FAQ pages: question/answer pairs are added only when their recorded source path is the page or the exact question text appears on a FAQ subpage.
- Language: the homepage global reference block now includes seven ISO-coded names confirmed against KOV's translation configuration. The site translation widget supports additional languages; this seven-record target subset is not exhaustive.
- Institution, qualification, audience, job-function, seniority, employment-type, career-challenge, and search-intent records remain unassigned where verified source records are unavailable. O*NET bulk data could not be retrieved in this environment; the CEO skill associations use the accessible official occupation profile.

## Route-level role association counts

| Industry route slug | Distinct title labels | Exact occupation matches |
| --- | ---: | ---: |
| agriculture-food-forestry | 22 | 2 |
| arts-entertainment-sports | 25 | 2 |
| business-support-facilities | 23 | 2 |
| construction-engineering | 23 | 2 |
| consulting-professional-services | 30 | 2 |
| education | 24 | 2 |
| energy-mining-oil-gas | 25 | 2 |
| finance-insurance | 37 | 2 |
| healthcare-social-care | 38 | 2 |
| holding-companies | 25 | 2 |
| hospitality-food-service | 27 | 2 |
| legal-services | 23 | 2 |
| manufacturing | 33 | 2 |
| other-services | 21 | 2 |
| public-sector-government | 27 | 2 |
| real-estate-leasing | 28 | 2 |
| retail-ecommerce | 30 | 2 |
| technology-media-telecom | 37 | 2 |
| transportation-logistics | 27 | 2 |
| utilities | 24 | 2 |
| wholesale-distribution | 23 | 2 |

Detailed all-page map (original classification plus current JSON-LD category and record-node counts): [page-category-implementation-map-2026-11-13.csv](./page-category-implementation-map-2026-11-13.csv).

The page-specific taxonomy values were migrated into the same generated JSON-LD graphs and removed from the HTML heads. Current generator: `node scripts/build-jsonld.js`; validation: `node scripts/validate-jsonld-migration.js`.
