# Legency Media — measured reference notes

Source: `https://legencymedia.com/`. Measurements were taken from the live rendered page at 1440, 768, and 390 CSS-pixel widths. The organized source and screenshots are in [`_design-reference/legencymedia/`](../_design-reference/legencymedia/).

## Measured presentation

| Viewport | Hero heading size / line height | Weight | Letter spacing | Body background |
| --- | --- | --- | --- | --- |
| 1440 | 72.72px / 83.628px | 500 | -2.9088px | `rgb(242, 242, 242)` |
| 768 | 46.4px / 53.36px | 500 | -1.856px | `rgb(242, 242, 242)` |
| 390 | 46.4px / 53.36px | 500 | -1.856px | `rgb(242, 242, 242)` |

- Computed body font: `"PP Frama Text", "Helvetica Neue", Arial, sans-serif`.
- Computed heading font: `"PP Frama", "Helvetica Neue", Arial, sans-serif`.
- The saved global CSS declares heading letter spacing `-.04em`, weight `500`, line-height `1.15`; it sets the `.container` max width and horizontal padding via `--max-w` and `--pad-x`.
- Measured CSS tokens: `--max-w: 1728px`, `--pad-x: clamp(20px, 2.9vw, 50px)`, `--sp-1: .5rem`, `--sp-2: 1rem`, `--sp-3: 1.5rem`, `--sp-4: 2.5rem`, `--sp-5: 4rem`, and `--sp-6: clamp(4rem, 8vw, 8rem)`.
- The CSS type scale defines H1 as `clamp(2.9rem, 5.05vw, 5.44rem)`; observed H1 computed values at 1440/768/390 are listed above. The first `.section` wrapper uses `padding-block: var(--sp-6)`.
- The saved palette includes `#f2f2f2`, `#201d1d`, `#0004f6`, and `#9bff60`; the KOV theme intentionally uses restrained neutral/slate tones rather than copying the bright accent.
- The CSS uses a 12px radius token. Observed transitions include 0.4s background-image, 0.45s opacity/transform, 0.6s color/background and opacity/transform with `cubic-bezier(0.625, 0.05, 0, 1)`, and a 0.735s transform transition.
- The global CSS uses named `width <=` breakpoints including 479px, 640px, 767px, 860px, 900px, 991px, and 1099px; these are page/component breakpoints rather than one universal navigation threshold.
- The accessible menu button was visible at all three sampled widths; the navigation-collapse threshold was not established by this probe.
- The sample `main` section has no additional computed padding; section spacing is applied to nested `.section` wrappers.

## Transfer to KOV

Use the clear container hierarchy, consistent section rhythm, high-contrast type scale, and structured content blocks for services, pricing, FAQs, and long-form reading. Do not reuse the proprietary PP Frama font, copy, color treatment, code, or imagery. KOV substitutes Inter/Fraunces and softer executive-appropriate surfaces.

Exact form/accordion states and animation delays/staggers were not measured exhaustively; see the rendered screenshots and saved CSS for the source evidence.
