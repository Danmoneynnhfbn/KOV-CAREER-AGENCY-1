# Shared SEO entity datasets

The generated SEO landing pages reference the complete collections in
[`seo-entity-datasets.jsonld`](./seo-entity-datasets.jsonld). The JSON-LD graph
contains each dataset and every record, with stable `@id` values. Each SEO page
links to the same full dataset nodes and their shared JSON-LD distribution; the
records are not filtered to page-specific topics. Search engines may choose not
to process or display every record.

## Collection definitions and counts

| Dataset | Count | Schema.org record type | Selection and classification |
| --- | ---: | --- | --- |
| Cities | 1,000 | `Place` | The 1,000 highest-population GeoNames `cities1000` records carrying an administrative-seat or capital feature code (`PPLC`, `PPLA`, `PPLA2`–`PPLA5`, or `PPLG`). Their original GeoNames feature codes are retained. |
| Town candidates | 1,323 | `Place` | The 1,323 highest-population `cities1000` records carrying GeoNames feature code `PPL`. GeoNames describes these as populated places and does not consistently distinguish legal towns from cities; the site therefore preserves the source classification rather than asserting legal status. |
| Professional role titles | 44,779 | `Occupation` | Every distinct O*NET 31.0 `Job Title` string, deduplicated by Unicode NFKC normalization and case-insensitive whitespace normalization. Associated O*NET-SOC codes are retained as identifiers. |
| Institutions and organizations | 832 in the retained catalog; 1,300 target pending merge validation | `Organization` | The original 832 English-language Wikidata entities are preserved. The builder tests supplemental records against the retained set by QID and normalized name and fails unless 468 net-new records can be added. The 1,300 total is a build target, not yet a verified generated count. |
| Detailed work activities | 2,087 | `DefinedTerm` | Distinct O*NET 31.0 Detailed Work Activity identifiers and names. This additional collection preserves the source distinction between activities and occupations. |

GeoNames place records carry their source feature code, country code, coordinates,
and population value. These are source attributes, not a claim that every place
is legally a city or town in its country.

## Sources and licensing

- **GeoNames:** [`cities1000.zip`](https://download.geonames.org/export/dump/cities1000.zip),
  described at [GeoNames export](https://www.geonames.org/export/). GeoNames
  provides its data under CC BY and requests attribution. The catalog credits
  GeoNames and links to the [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/).
  GeoNames data are provided as-is.
- **Occupations and activities:** [O*NET 31.0 Database](https://www.onetcenter.org/database.html),
  specifically `Job Titles.txt` and `GWAs to IWAs to DWAs.txt`. The database
  license is [CC BY 4.0](https://www.onetcenter.org/license_db.html). This
  project deduplicates titles and transforms the source rows to JSON-LD; the
  U.S. Department of Labor and O*NET have not approved or endorsed that
  transformation.
- **Organizations:** [Wikidata Entity Search API](https://www.wikidata.org/w/api.php),
  searched in English. Wikidata structured data is [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
  Each entry links to its Wikidata QID page. Wikidata content can change, so
  confirm current details at the linked source.


### Supplemental organization records (2026-11-20)

The repository includes `data/taxonomy/additional-organizations-wikidata.json`,
a supplemental source pool gathered from English-language Wikidata entity-search
queries. Each retained candidate includes its QID, label, description, search
term, exact API source URL, and direct Wikidata `instance of` class labels. The
file contains 916 candidate rows. The current new-record eligibility filter
accepts 835 rows. Comparing these candidates with the exact 832 `Organization`
nodes in the existing JSON-LD catalog, then deduplicating by QID and normalized
name, leaves **582 net-new candidates**. The generator selects 468 in ascending
QID order to reach 1,300 and retains 114 validated candidates in reserve.

The original 832 organization nodes must remain unchanged. A retrospective
check found that 97 original records would fail the newer supplemental-record
filter, so the updated builder reads the original nodes from the existing
`data/seo-entity-datasets.jsonld` and applies the stricter test only to new
candidates. It does not re-filter or replace the original records. The generated
23.5 MB JSON-LD catalog still contains 832 organizations until the full builder
is run and validated; the 1,300 target is not yet a published count.

`build-seo-entity-datasets.js` now reads the organization baseline from the
existing JSON-LD catalog and the supplemental candidates from the repository.
No separate Wikidata input file is required. Run the builder with the original
GeoNames and O*NET 31.0 source inputs shown below, then run the validation
command before treating the 1,300 count as generated.
## Rebuilding the catalog

The GeoNames and O*NET 31.0 source archives are not duplicated in this
repository. Download and extract the GeoNames `cities1000.txt` and O*NET
31.0 text database, then run from the repository root. The organization
baseline is read from the existing `data/seo-entity-datasets.jsonld` file;
the supplemental Wikidata candidates are already retained in
`data/taxonomy/additional-organizations-wikidata.json`.

```powershell
node scripts\build-seo-entity-datasets.js `
  --geonames C:\path\to\cities1000.txt `
  --onet-directory C:\path\to\db_31_0_text
```

The builder validates all minimums and refuses to produce a catalog with fewer
than 1,000 city candidates, 1,323 populated-place candidates, 1,095 distinct
job titles, exactly 1,300 named organizations, or 200 detailed work activities.
Run `python scripts\prepare-taxonomy-pages.py --validate-entity-datasets` to
check record uniqueness, source attribution, types, and complete references.
