# Design reference notes

These notes summarize observable design patterns only. The sibling `design-reference` folder was not present at the supplied path, so no local reference templates or licence files could be inspected. The live pages were consulted on 2026-10-24; where a live page failed or timed out, the supplied Neutomni snippets were used only to understand interaction patterns. No reference markup, code, text, imagery, brand names, or assets are used in the implementation.

## Legency Media

- **Structure:** Large introductory statement, proof/client material, service/package groupings, case-study result, process, resources, and FAQ content.
- **Components:** Clear card groupings, restrained proof/result panels, compact service tiers, numbered process entries, and editorial resource cards.
- **Spacing and type:** Large multi-line hero, generous separation between major blocks, strong headline/subhead contrast, and tighter text within dense proof and service areas.
- **Interaction and motion:** Prominent contact actions, anchored case-study/resource links, and restrained motion that supports navigation rather than taking over the page.
- **KOV application:** Use existing service, pricing, home, and resource structures as card surfaces and readable section groupings. No proof, statistic, price, testimonial, or case-study content is added.
- **Source:** Live page at `https://legencymedia.com/`; it loaded. The local source folder was unavailable.

## Krackerz

- **Structure:** Statement-led hero, value proposition, feature groups, testimonials, founder/profile section, pricing, and FAQ.
- **Components:** Pill-like option controls, feature cards, clear repeated action placement, pricing cards, and compact question/answer rows.
- **Spacing and type:** Oversized display headings and dense supporting content contrast; repeated content groups are separated with broad section spacing.
- **Interaction and motion:** Pricing-period selection, interactive features, and expandable FAQ content are prominent. KOV uses only tab and FAQ structures already present.
- **KOV application:** Existing role-industry tabs and disclosure FAQs receive pill and accordion styling. Repeated calls to action are omitted because duplicating button copy would violate the no-content-change rule.
- **Source:** Live page at `https://krackerz.com/`; it loaded. The local source folder was unavailable.

## Lee Holmes

- **Structure:** Compact availability/intro, work, process, services, testimonials, about, and FAQ sections with a numbered section rhythm.
- **Components:** Parenthesized section identifiers, sequential process cards, simple service groupings, and a sticky, understated navigation treatment.
- **Spacing and type:** Editorial large headings, short text blocks, numbered wayfinding, and clear negative space between portfolio/process sections.
- **Interaction and motion:** Scroll-led section navigation and restrained transitions; the process uses a visible sequence rather than a decorative interaction.
- **KOV application:** Role hubs receive parenthesized section numbers, responsive card grids for existing linked services, and a sticky header/back-to-top treatment. No portfolio, testimonial, or profile copy is introduced.
- **Source:** Live page at `https://www.leeholmes.uk/`; it loaded. The local source folder was unavailable.

## Neutomni

- **Structure:** Large hero, process sequence, selected work, packages, and supporting service/FAQ material.
- **Components:** Numbered process cards, A-to-B directional markers, numbered grids, and technical/file-like FAQ styling.
- **Spacing and type:** Bold large display type, high contrast between broad section areas and compact card information, with consistent sequence markers.
- **Interaction and motion:** Motion is used around process and image changes; the supplied code snippets also show a native disclosure FAQ, responsive mobile navigation, motion-reduction checks, and tab/cursor effects. KOV keeps the restrained, reduced-motion-safe patterns and avoids cursor gimmicks.
- **KOV application:** Industry hubs and overview pages use existing cards and numbered lists; role-industry pages use existing ordered lists and FAQs where present. No new step text or imagery is supplied.
- **Source:** Live page at `https://neutomni.com/`; the browser timed out, but the page was readable through the text fetch. The supplied script snippets were inspected for behavior only. The local source folder was unavailable.

## Implementation constraints and licence review

- The four local reference subfolders could not be found, so no bundled templates or licences were available to inspect. Live-site assets and scripts were not downloaded or reused.
- CSS and JavaScript were written specifically for this project and reference only broad layout/interaction patterns.
- Project-owned visual assets and current brand colors are retained. No additional online images or fonts were added.
- Components are applied only to existing structures. Existing native `<details>` content stays in HTML; hidden tab panels remain in the DOM.
