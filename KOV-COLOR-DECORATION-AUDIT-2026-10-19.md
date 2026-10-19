# KOV Color, Contrast, and Text Decoration Audit

**Audit date:** 19 October 2026
**Scope:** HTML pages in the working tree, the current sitemap, shared CSS/JS integration, and rendered public-page styling.

## Executive summary

The visual inconsistency came from several independent color and link-decoration layers being applied in different orders. In particular, the homepage's orange heading used a page-specific hard-coded value while other `.text-orange` elements were forced to a different hard-coded value. That also prevented the page-specific orange from adapting to the selected theme. The Tailwind reset inherits link decoration, while later shared rules add underlines to only some anchors, so links that look similar did not have consistent decoration.

The audit covered **103 HTML files** and **85 sitemap URLs**. A page-by-page HTML/CSS/JS inventory and inline-style scan is available in [KOV-COLOR-DECORATION-PAGE-AUDIT-2026-10-19.csv](./KOV-COLOR-DECORATION-PAGE-AUDIT-2026-10-19.csv). The live sitemap pages were smoke-tested in a local browser: 84 file URLs returned successfully and loaded the theme stylesheet. The remaining `/` URL was rejected by the temporary static test server because it does not implement directory-index fallback; `/index.html` itself loaded successfully.

## Findings and changes

### 1. Conflicting accent colors and dark-theme overrides

The shared palette used orange `#d96a2b`, which has a **3.42:1** contrast ratio on the paper background `#fffdf9`. That is below the WCAG AA 4.5:1 target for ordinary text. In addition, the same `.text-orange` class could resolve to `#8c3f18` in the general palette or `#f15a24` in a homepage-specific rule, both enforced with `!important`. The latter was also fixed to a light-theme value and did not adapt when the user selected dark mode.

Added [design-tokens.css](./assets/design-tokens.css) as the effective shared light/dark token layer. It maps the existing Tailwind and `--kov-*` variables to one palette, sets a separate high-contrast text-link color, and resolves the homepage accent collision in dark mode. The relevant text token pairs are:

| Use | Foreground | Background | Contrast | Result |
|---|---|---|---:|---|
| Light-theme text link | `#8a4018` | `#fffdf9` | 7.31:1 | Pass |
| Dark-theme text link | `#f3a35b` | `#101b2a` | 8.41:1 | Pass |
| Muted text on light paper | `#4d5966` | `#fffdf9` | 7.04:1 | Pass |
| Muted text on dark paper | `#c8d5e6` | `#101b2a` | 11.64:1 | Pass |
| Previous orange token | `#d96a2b` | `#fffdf9` | 3.42:1 | Fail |

These are palette-pair calculations, not a claim that every image, gradient, or custom page component has been independently contrast-certified.

### 2. Inconsistent text-link decoration

The base stylesheet resets links to `text-decoration: inherit`; subsequent shared rules decorate only selected link groups. This left ordinary content links and card links with inconsistent visual treatment.

The new shared rules underline plain text links with a consistent color, thickness, and offset. They preserve button-like links and primary navigation styling, while linked cards remain unadorned until hover or keyboard focus. Unclassed navigation links on the FAQ pages now use the same readable palette rather than browser-default blue.

### 3. Device-based theme and token coverage

Added [theme-toggle.js](./assets/theme-toggle.js) as a lightweight stylesheet loader. The color scheme now:

- follows the device's `prefers-color-scheme` setting automatically;
- switches when the device theme changes; and
- has no on-page toggle or saved manual override.

The shared search and footer scripts load the stylesheet loader on their existing templates. The 30 FAQ pages, which do not load either shared script, load it directly. Browser checks confirmed that all 84 sitemap file pages served by the local test server loaded the token stylesheet.

Follow-up contrast checks also corrected the topic-navigation flyout and search controls: the flyout now switches from dark text on a light panel to light/orange text on a dark panel, and the search icon follows the header theme. Muted text uses the matching light- or dark-theme token rather than a hard-coded near-black value.

### 4. Homepage headline breaking inside a word

The homepage hero used a 128px heading with `word-break: break-word` in a 673px-wide block. This split “Representation” into fragments. The shared token layer restores normal word wrapping and applies a responsive heading size; the browser now renders “Representation” as a complete word.

The homepage's outlined hero CTA also used dark text and border colors against a dark hero background. The shared layer now explicitly sets both to a high-contrast light color in dark mode.

## Page inventory

The CSV contains one row for each of the 103 in-scope HTML files, with:

- sitemap membership;
- linked CSS and JavaScript assets;
- the theme stylesheet entry point;
- inline style-block, color-declaration, and text-decoration-declaration counts;
- anchor counts; and
- the light/dark semantic-link contrast ratios.

The counts are useful for finding outlier templates. Inline declaration counts do not include declarations buried in linked stylesheets; the rendered browser checks and shared CSS findings above complement that static inventory.

## Validation performed

- `node --check` passed for the new theme script and both modified shared scripts.
- The homepage and FAQ library loaded the device-based theme stylesheet.
- Browser checks verified light/dark token application according to the device theme, including topic-navigation panel text and search controls.
- All 84 sitemap file URLs available through the local static test server loaded the theme stylesheet and tokens.
- Representative homepage, pricing, privacy, individual-services, representation, FAQ, and account screens were visually reviewed at browser viewport sizes.

## Limitations and follow-up

The working tree already contained extensive staged and unstaged changes, including [site-fixes.css](./assets/site-fixes.css) and an existing stylesheet inventory. Those pre-existing edits were left untouched. As a result, the new token file is the effective runtime palette layer and maps legacy variables, but duplicate legacy token declarations remain in `site-fixes.css`; removing them should be done after the existing staged CSS changes are reconciled. The audit is a front-end visual review, not a complete WCAG conformance audit or production-host verification.
