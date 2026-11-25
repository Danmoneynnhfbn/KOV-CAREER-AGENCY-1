# Sitemap reconciliation — 25 November 2026

## Production correction

The 25 November sitemap restoration commit included 726 URLs under `/directory/`. Those URLs are unpublished development previews. The source HTML declares `noindex` (some also declare `nofollow`), so they must not be submitted in the production sitemap or search catalogue.

The corrected sitemap:
- Retains the 703 existing canonical, indexable URLs.
- Adds the two verified public, self-canonical, indexable pages omitted from the sitemap: the Candidate Project Directory and the Website Directory.
- Excludes all 728 `/directory/` preview pages, including the two noindex directory pages previously absent from the coverage CSV.
- Keeps the 20 other excluded/private/utility records out of the sitemap.

## Reconciled counts

| Measure | Count |
|---|---:|
| Coverage inventory records | 1,453 |
| Published, indexable URLs in sitemap | 705 |
| Unpublished/noindex directory previews | 728 |
| Other excluded/private/utility records | 20 |
| Duplicate sitemap URLs | 0 |

## Safeguard

The production Cloudflare Pages build now runs `scripts/validate_sitemap.py` before building. It fails if a sitemap URL has no local HTML target, lacks an exact self-canonical, declares `noindex`, is not approved in the coverage inventory, or if the inventory and sitemap disagree.
