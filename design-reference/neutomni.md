# Neutomni — measured reference notes

Source: `https://neutomni.com/`. The live page was inspected in the integrated browser at 1440, 768, and 390 CSS-pixel viewport widths. Rendered markup, readable styles, and screenshots are kept in [`_design-reference/neutomni/`](../_design-reference/neutomni/).

## Measured presentation

| Viewport | Hero heading size / line height | Weight | Letter spacing | Document width |
| --- | --- | --- | --- | --- |
| 1440 | 52px / 52px | 400 | -2px | 1440px |
| 768 | 44px / 44px | 400 | -2px | 758px |
| 390 | 40px / 40px | 400 | -2px | 390px |

- Computed body font: `"Vazirmatn Local", sans-serif`; this site-specific font is not reused.
- The first stylesheet is the saved Webflow bundle `neutomni-026b92.shared.a1e58e004.min.css`.
- The live stylesheet defines red `#cf1830`, blue `#6db1f0`, white, and light neutral tokens. The computed page background was white at 1440 and `rgb(207, 24, 48)` at 768/390; body text color also computed to red at those narrower widths. This responsive/state variation is recorded rather than flattened to a guessed palette.
- The stylesheet's base typography tokens include main text at 16px/120%, small text at 13px, H1 at 52px, H2 at 118px, and H3 at 32px; the rendered H1 changes to 44px at 768 and 40px at 390.
- The saved stylesheet contains responsive query widths at 991px, 767px, and 479px (plus content-specific 768px/992px and larger 1440px/1920px queries).
- Sampled border-radius values include 3px for compact controls and 50%/100% for circular elements. Observed transitions include 0.1s color/background, 0.35s–0.45s eased transitions, and a 0.6s cubic-bezier text-shadow transition. These are observed declarations, not claims that every component uses them.
- The measured first content section spans 1430px at a 1440 viewport, 758px at 768, and 380px at 390.
- No semantic `header` element or menu-labelled button was found by the measurement selectors. A hamburger breakpoint could not be verified from that selector probe.

## Transfer to KOV

Use the reference's large, modular sections and generous breathing room, not its saturated color, site-specific font, text, illustrations, or motion implementation. KOV uses a low-saturation sage/stone token set and existing freely licensed/system typefaces instead.

The original flat-cache stylesheet was empty; the live computed stylesheet was captured separately. A complete spacing scale, every component shadow/radius, motion delay/stagger, and hamburger breakpoint could not be established from the available DOM probes. Screenshots are evidence of rendered layouts, not an exact-match claim.
