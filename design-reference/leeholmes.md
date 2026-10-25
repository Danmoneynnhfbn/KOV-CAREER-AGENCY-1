# Lee Holmes — measured reference notes

Source: `https://leeholmes.uk/` (live canonical location observed as `https://www.leeholmes.uk/`). Measurements were taken at 1440, 768, and 390 CSS-pixel widths. The organized page, styles, and screenshots are in [`_design-reference/leeholmes/`](../_design-reference/leeholmes/).

## Measured presentation

| Viewport | Hero heading size / line height | Weight | Menu button |
| --- | --- | --- | --- |
| 1440 | 93.92px / 103.312px | 400 | hidden |
| 768 | 80px / 88px | 400 | hidden |
| 390 | 52.16px / 57.376px | 400 | visible |

- Computed body font: `NeueMontreal-73d945f12da1e84f` with an Arial fallback.
- Computed heading font: `ASModule-33576275b01d4fdd` with an Arial fallback.
- The page body itself has a transparent background and black text; the global stylesheet uses a monochrome base with selected bright accent tokens.
- The saved CSS includes accent tokens such as `#26D07C` and `#FF0080`, plus neutral black/white/grey surfaces. These colors and the bundled proprietary typefaces are not copied into KOV.
- A 375px document width was measured at a 390px viewport; 753px at 768; and 1425px at 1440. The measured first content section uses the available viewport width.
- Navigation menu button appears between the sampled 768px and 390px sizes. The exact breakpoint was not narrowed further.
- The bundled CSS contains container max-width steps of 40rem, 48rem, 64rem, 80rem, and 96rem; the responsive utility breakpoints correspond to 640, 768, 1024, 1280, and 1536 CSS pixels.
- Common measured corner tokens include 0.25rem; the utility CSS includes transitions at 0.15s, 0.3s, 0.6s, and 0.7s, as well as 30s continuous marquee movement. No per-section motion stagger was established.

## Transfer to KOV

Use the personal editorial pacing, readable long-form column, and founder-story layouts for the about page and related personal content. KOV uses its already-declared Inter/Fraunces/system fonts; no reference font, copy, logo, image, or proprietary component is reused.

The observed page includes motion and a video; no exact duration/easing/stagger is claimed from the viewport probe.
