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
