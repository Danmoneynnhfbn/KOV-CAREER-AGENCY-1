# Design reference map

The saved source cache is `_design-reference/` (136 files, initially flat). Original files remain in place. The organizer copied each saved homepage, directly linked assets that were present in the cache, and responsive browser screenshots into the matching reference folder.

| Reference | Evidence identifying the source | Organized snapshot | Live browser captures |
| --- | --- | --- | --- |
| Neutomni | `(INDEX)`: title `Digital Design & Webflow Studio - Neutomni`; page links to `neutomni.com`; saved Webflow stylesheet identifies its site ID. | `_design-reference/neutomni/` | Rendered HTML/CSS and 1440/768/390 screenshots |
| Legency Media | `INDEX 3.COM`: canonical `https://legencymedia.com/`, `og:site_name` `Legency Media`, matching page title. | `_design-reference/legencymedia/` | Rendered HTML/CSS and 1440/768/390 screenshots |
| Krackerz | `main` is a Framer application bundle whose site metadata names `https://krackerz.com`; the live page title is `Krackerz | Sales course for designers`. | `_design-reference/krackerz/` | Rendered HTML/CSS and 1440/768/390 screenshots |
| Lee Holmes | `(INDEX) 2.COM`: canonical `https://leeholmes.uk/`, `og:site_name` `Lee Holmes`, matching page title. The live site redirects to `www.leeholmes.uk`. | `_design-reference/leeholmes/` | Rendered HTML/CSS and 1440/768/390 screenshots |

The `index-saved.html` files are copies of the original cached HTML. Krackerz's original flat-cache file is an application bundle, not HTML; its live rendered document is saved separately as `rendered-live.html`. CSS/screenshots are reference-only and are not linked from the KOV website. No reference wording, imagery, branding, or code is used by production pages.

[`REFERENCE_FILE_INDEX.json`](./REFERENCE_FILE_INDEX.json) enumerates all 136 original flat-cache files and their evidence-based site assignments. The local browser measured the references at 1440, 768, and 390 CSS pixels. Saved viewport screenshots are in each site's folder. Measurement notes, including browser/runtime limitations, are in [`design-reference/`](./design-reference/).
