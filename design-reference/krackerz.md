# Krackerz — measured reference notes

Source: `https://krackerz.com/`. The flat cache contained a Framer application bundle (`main`), not a complete HTML page. The live rendered DOM, readable stylesheet rules, and screenshots are stored in [`_design-reference/krackerz/`](../_design-reference/krackerz/).

## Measured presentation

| Viewport | Hero heading size / line height | Weight | Document width |
| --- | --- | --- | --- |
| 1440 | 80px / 80px | 400 | 1425px |
| 768 | 64px / 64px | 400 | 753px |
| 390 | 48px / 48px | 400 | 375px |

- Computed heading font: `"Highway Motel Sans Regular", "Highway Motel Sans Regular Placeholder", sans-serif`; KOV does not reuse this site-specific font.
- Body font resolves to `sans-serif`; body background is transparent over the page's own visual surface.
- The heading scale decreases from 80px to 48px across the sampled viewport widths. No menu-labelled button was found in the measurement selector probe, so a hamburger breakpoint is not claimed.
- The live stylesheet includes Geist, DM Sans, Boldonse, Highway Motel Sans, and Inter declarations. Measured palette samples include `#f26c17`, `#fefae7`, `#4b4548`, `#3b001b`, `#f0befa`, `#f09fa8`, `#c0ecbf`, and `#82a0ff`.
- Responsive CSS queries include 767.98px, 809px, 1199px, and 1299px; the exact menu threshold remains unverified.
- The saved CSS has a layered shadow sample and an `opacity 0.4s ease-out` transition. The Framer page applies additional motion dynamically; no global delay/stagger is inferred.

## Transfer to KOV

Borrow the use of a strong display hierarchy, crisp modular blocks, compact labels, and clear card boundaries for role-by-industry pages. Keep KOV's palette restrained and its existing wording, assets, and brand identity. Avoid the reference's sales-course tone, text, visual assets, fonts, and implementation.

Exact motion timing/easing/stagger, shadow/radius values, and form states were not measured exhaustively.
