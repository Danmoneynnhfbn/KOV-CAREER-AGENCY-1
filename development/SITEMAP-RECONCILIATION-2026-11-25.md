# Sitemap reconciliation — 25 November 2026

## Production correction

The 25 November sitemap restoration included 726 URLs under `/directory/`. Those URLs are unpublished development previews. Their source HTML declares `noindex` (some also declare `nofollow`), so they must not be submitted in the production sitemap or public search catalogue.

The review also identified two role/industry HTML aliases whose canonical tags point to different role/industry pages already present in the sitemap. The aliases are removed from sitemap discovery; their canonical destination pages remain listed.

Two genuine public pages had been omitted and are restored:
- Candidate Project Directory: `https://www.kovcareeragency.org/resources/candidate-project-directory`
- Website Directory: `https://www.kovcareeragency.org/site-directory.html`

## Reconciled counts

| Measure | Count |
|---|---:|
| Coverage inventory records | 1,454 |
| Published, canonical, indexable URLs in sitemap | 703 |
| Unpublished/noindex directory previews | 728 |
| Other excluded/private/utility records | 20 |
| Non-canonical duplicate role/industry URLs excluded | 2 |
| Duplicate candidate-directory file alias excluded | 1 |
| Duplicate sitemap URLs | 0 |

The 703 sitemap URLs comprise 701 retained canonical URLs plus the two restored public pages. The two non-canonical aliases are not counted as separate indexable pages.

## Safeguard

The production Cloudflare Pages build now runs `scripts/validate_sitemap.py` before building. It fails if a sitemap URL has no local HTML target, lacks an exact self-canonical, declares `noindex`, is not approved in the coverage inventory, or if the inventory and sitemap disagree.
