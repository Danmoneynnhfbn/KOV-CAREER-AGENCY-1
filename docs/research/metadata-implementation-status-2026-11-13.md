# KOV HTML metadata implementation status

> **Superseded by the JSON-LD migration on 14 November 2026.** This document
> records the previous custom `<meta name>` implementation and its source
> findings. Those project taxonomy tags were migrated and removed. See
> [JSON-LD implementation validation](./jsonld-implementation-validation-2026-11-13.json)
> and the updated [page/category map](./page-category-implementation-map-2026-11-13.md)
> for the current saved HTML state.

Audit and implementation date: 13 November 2026

## Current result

The homepage now contains 206,352 ordinary `<meta name="…" content="…">`
elements using locally available records. They are inside the existing `<head>`.
The approved names are used without a prefix. FAQ questions and answers are
represented as paired, separate meta elements. External provenance is documented
for several collections; the job-title and occupation lists have count and
uniqueness validation but no attached record-level source ledger.

This remains a partial dataset: seven categories do not yet meet their approved
record targets. The revised page-specific strategy is in effect; the map identifies
all 2,076 HTML files and the 651 public key pages receiving relevant metadata.

## Homepage records and provenance

| Meta name | Count inserted | Target / status | Source and checks |
| --- | ---: | --- | --- |
| `professional-audience` | 0 | 471 | The exact-count legacy list is explicitly marked unverified and has no record-level sources. |
| `job-title` | 98,380 | 98,380 | Local KOV title file and role taxonomy. `scripts/validate-role-taxonomy.js` confirms exact count and unique values. The 2026 file has no attached source ledger; older project documentation instead describes 73,380 legacy entries and the O*NET dataset note describes 44,779 O*NET title strings. The 98,380 labels are retained as supplied local records, not claimed as individually source-verified. |
| `occupation` | 1,655 | 1,655 | Local KOV occupation file and role taxonomy. The same validator confirms count and uniqueness. Record-level source lineage is not attached; the older discovery note documents a separate 1,155-record legacy list. |
| `industry` | 2,125 | ≥1,000 | Local NAICS directory, covering sector through six-digit U.S. national industry levels. `scripts/validate-industry-directory.js` passes; `data/taxonomy/README.md` records the U.S. Census Bureau 2022 source and workbook validation. Values include code plus title. This is a U.S. classification, not a global industry register. |
| `skill` | 583 | 560+ | 560 ESCO skill records with concept URIs/definitions plus 23 distinct O*NET labels. `data/taxonomy/onet-chief-executives-skills.json` records 24 O*NET skill-to-occupation relations, importance scores, and the role mapping; Active Listening uses the existing ESCO preferred label. |
| `qualification` | 0 | 15,000 | The exact-count legacy list is explicitly unverified. No qualification registry file is present locally. GOV.UK publishes an official CSV download for regulated qualifications in England and Northern Ireland, but the source file could not be downloaded in this environment; see acquisition attempt below. |
| `professional-term` | 50,000 | 50,000 | ESCO alternative labels, each retaining its language code in the meta value. `scripts/validate-esco-taxonomy.js` confirms 50,000 unique language/term records across 28 languages. Same official ESCO references as above. |
| `job-function` | 0 | 100 | No verified local source list. The 100-record legacy list has no record-level source evidence. |
| `seniority-level` | 0 | 10 | No verified local source list. The 10-record legacy list has no record-level source evidence. |
| `employment-type` | 0 | 30 | No verified local source list. The 30-record legacy list has no record-level source evidence; definitions vary by jurisdiction. |
| `career-challenge` | 0 | 250 | No verified local source list. The 250-record legacy list has no record-level source evidence. |
| `career-search-intent` | 0 | 5,000 | No first-party query log or other record-level search evidence is present. The exact-count legacy list is explicitly unverified. |
| `faq-question` | 500 | 500 | Existing site FAQ directory. `scripts/validate-faq-directory.js` confirms 500 unique questions and nonempty answers; each record carries its source page path. |
| `faq-answer` | 500 | 500 | The answer paired to each FAQ question above. |
| `language` | 7 | 7 | Seven names/codes from the original requested set are checked against ISO language references and against `assets/google-translate.js` (`pageLanguage` plus configured target languages). The widget has more than seven targets; these seven are a requested reference subset, not the full translation menu. Dataset: `data/taxonomy/languages.json`; validator: `scripts/validate-language-metadata.js`. |
| `country` | 197 | 197 | Existing discovery catalog country records. Kosovo's `XK` code remains identified in source notes as user-assigned. |
| `city` | 50,250 | 50,250 | `assets/world-cities.js`; the source note in `data/seo-entity-datasets.jsonld` describes 50,249 SimpleMaps Basic World Cities 2026 records plus one deduplicated GeoNames record and records CC BY 4.0 attribution. Sources: <https://simplemaps.com/data/world-cities> and <https://simplemaps.com/data/license>. Values include city, first-level administrative area when present, and country to preserve context. |
| `town-locality` | 1,323 | All locally available verified candidates | GeoNames `PPL` populated-place records described in `data/seo-entity-datasets-sources.md` and `data/seo-entity-datasets.jsonld`. GeoNames does not consistently distinguish legal towns from cities; the meta values preserve the source names without asserting legal status. Source: <https://download.geonames.org/export/dump/cities1000.zip>. |
| `institution` | 832 | All locally available selected records | Existing English-language Wikidata search-result collection, described in `data/seo-entity-datasets-sources.md`. Records are selected by entity names/descriptions, not an exhaustive worldwide register. Source: <https://www.wikidata.org/w/api.php>; structured data license: <https://www.wikidata.org/wiki/Wikidata:Licensing>. |

The legacy `assets/expanded-taxonomy.js` contains exactly the requested counts
for many missing categories, but its records explicitly carry
`verification.status = "unverified"`, `missing-record-level-source`, and
generated or unverified identifiers. `node scripts/validate-expanded-taxonomy.js`
fails and lists every such category. Those placeholder labels were not injected.

## Validation performed

- `node scripts/build-html-meta-dataset.js --verify-homepage` passed and
  confirmed each inserted category count.
- A separate Python standard-library `HTMLParser` pass counted 206,352 approved
  meta elements inside `<head>`, found none outside `<head>`, and confirmed that
  all twelve populated metadata names have the expected counts.
- `node scripts/validate-role-taxonomy.js` passed: 98,380 unique titles and
  1,655 unique occupations.
- `node scripts/validate-industry-directory.js` passed: 2,125 NAICS records.
- `node scripts/validate-esco-taxonomy.js` passed: 560 skills and 50,000 unique
  alternative labels across 28 languages.
- `node scripts/validate-faq-directory.js` passed: 500 unique FAQ pairs.
- Continuation updates added tags only inside existing `<head>` sections. Existing
  canonical, robots, social, title, and body markup were not rewritten.

## Repository scope and revised page mapping

The repository contains 2,076 `.html` files after excluding `.git`,
`node_modules`, `.venv`, and `.venv-newpc`. The inventory marks 711 indexable and
1,365 noindex. The revised strategy keeps the homepage global block and adds
only subject-matched records to public key pages. The complete map is in
`page-category-implementation-map-2026-11-13.csv`; staging, private-admin,
design-reference, and noindex HTML is classified there and left unchanged.

Applied page-specific metadata to 651 key pages: 71,109 meta elements. Industry
hubs and role/industry routes receive mapped NAICS records; role pages receive
exact role-title matches and occupations where an O*NET title code maps to a
BLS SOC record; career and FAQ pages receive source-linked FAQ pairs; geographic
pages receive named country/city records. The O*NET 31.0 Chief Executives profile
supplies 24 skills associated with the occupation; these are applied to 22 CEO
role pages. Qualification, audience,
job-function, seniority, employment-type, career-challenge, search-intent,
language, locality, and institution records remain absent from individual pages
where no verified page-relevant source record was available.

The 19 approved meta names are used; FAQ question and answer remain paired.
`scripts/validate-page-specific-meta.py` independently verified 651 page blocks,
71,109 page-specific elements, and 206,352 homepage global elements. The script
also found no empty approved values or approved tags outside `<head>`.

## Qualification source acquisition attempt

The official GOV.UK register page states that it offers a 22.2 MB qualifications
CSV for qualifications regulated in England and Northern Ireland:
<https://www.gov.uk/find-a-regulated-qualification>. The direct CSV URL is
<https://downloads.find-a-qualification.services.ofqual.gov.uk/extracts/Qualifications.csv>.
The workspace shell's HTTP HEAD request failed with “Unable to connect to the
remote server”; the web fetch tool rejects the binary CSV as unsupported
`application/octet-stream`; the Windows browser-control approval timed out.
No qualification data was downloaded or fabricated. The source appears capable
of covering a large number of actual qualifications, but its current row count
and its ability to meet the 15,000 target remain unverified here.

## Files changed for this implementation

- `index.html` — homepage metadata block only.
- `scripts/build-html-meta-dataset.js` — source-backed homepage builder and
  count verifier; it refuses to append over existing approved metadata names.
- `scripts/export-soc-occupation-index.py` and
  `data/taxonomy/soc-occupation-index.json` — BLS SOC 2018 workbook conversion
  used for title-code occupation matching.
- `scripts/map-and-apply-page-metadata.js` — full inventory classifier, page
  map builder, and idempotent page-specific metadata applier.
- `scripts/validate-page-specific-meta.py` — independent HTML block validator.
- `docs/research/page-category-implementation-map-2026-11-13.csv` and `.md` —
  page-to-category map and application summary.
- This report records global dataset gaps and source limits.

## Continuation update: language records and occupational skills research

Seven language records and 23 additional unique O*NET skill labels were added to the homepage global metadata block:
English, French, Spanish, German, Portuguese, Arabic, and Chinese. ISO 639
references support language names/codes; the local translator implementation
confirms English as its page language and French, Spanish, German, Portuguese,
Arabic, and Chinese variants as configured translation targets. The translator
also configures many other languages, so the seven records are not described as
an exhaustive list of widget languages. ISO references: <https://www.iso.org/standard/74575.html>
and Library of Congress ISO 639 materials: <https://www.loc.gov/standards/iso639-2/>.

Occupational skill source investigation found O*NET 31.0 lists 18,200
occupation-associated Essential Skills rows and 45,500 Transferable Skills
rows, under CC BY 4.0; the official page states the occupations are connected
to the skill data. This is a better role-association source than page-copy
substring matching. The shell cannot reach the O*NET bulk download host and the web retrieval
interface cannot read its binary/bulk files. The official O*NET OnLine Chief
Executives profile was accessible as HTML and exposes Essential and Transferable
Skills with importance ratings. The 24 selected profile relations rated at least
53 are recorded in `data/taxonomy/onet-chief-executives-skills.json`; Active
Listening maps to ESCO's exact alternative label `listen actively`. These records
are on the homepage and all 22 CEO key pages. Remaining O*NET occupation-skill
relations are unavailable locally. Source: <https://www.onetcenter.org/database.html>.

The other seven missing categories remain empty in the homepage metadata until
record-level source evidence can be retrieved and validated: professional
audiences (471), qualifications (15,000), job functions (100), seniority levels
(10), employment types (30), career challenges (250), and career search intents
(5,000). The Ofqual bulk download remains inaccessible from this shell (curl
HTTP 000 / connection failure); no target has been lowered and no placeholder
records have been published. The original 651 page-specific blocks remain present; 22 CEO pages were extended
with the sourced occupational skill records. Language records remain in the
homepage global reference block rather than being repeated as translation options
on individual pages.


## Verified continuation implementation

The global homepage now has 206,352 approved metadata elements. The `skill`
category contains 583 unique labels (560 ESCO concepts plus 23 additional O*NET
labels); the `language` category contains 7 records. Twenty-two `roles/ceo/*.html`
pages each gained 24 source-backed occupational skill records, raising the
page-specific metadata total from 70,581 to 71,109 while retaining 651 pages.
Validators: `node scripts/build-html-meta-dataset.js --verify-homepage`,
`node scripts/validate-language-metadata.js`,
`node scripts/validate-onet-role-skills.js`, and
`python scripts/validate-page-specific-meta.py`. The country-directory validator
reports an unresolved city/administrative-area mapping issue. In this run it found
178 city records without admin labels, 15,190 labels without an exact GeoNames
division match, 3 ambiguous GeoNames admin2 labels, 43 territory aliases outside
the 197-country list, and Singapore without a first-level division record. No
geographic files were changed in this continuation.

Additional files for this continuation: `data/taxonomy/languages.json`,
`data/taxonomy/onet-chief-executives-skills.json`,
`scripts/apply-language-metadata.js`, `scripts/apply-onet-chief-executive-skills.js`,
and the two focused metadata validators.
