# KOV Career Agency discovery catalog

[`kov-discovery-catalog.jsonld`](./kov-discovery-catalog.jsonld) contains the
shared structured-data reference graph used by the pages listed in
[`../PAGE_MANIFEST.json`](../PAGE_MANIFEST.json). Page-specific JSON-LD links to
the catalog rather than repeating its full lists on every page.

The generated graph contains 197 country records, every nonblank entry from
[`../town-role-insitutution/job-titles.txt`](../town-role-insitutution/job-titles.txt)
(73,380 entries), and every nonblank occupation from
[`../town-role-insitutution/occupations.csv`](../town-role-insitutution/occupations.csv)
(1,155 entries).

Countries are geographic reference entities, not claims about KOV offices,
branches, clients, or service availability. Job titles and occupations are
career-discovery references, not vacancy lists or a promise of service for
every listed role. Kosovo's `XK` identifier is identified as user-assigned.

To regenerate the catalog and page JSON-LD from the source lists, run from the
repository root:

```powershell
node scripts\build-discovery-structured-data.js
```

Use `--dry-run` to validate the proposed page updates without writing files.
The generator preserves the source lists and all page markup outside JSON-LD.
