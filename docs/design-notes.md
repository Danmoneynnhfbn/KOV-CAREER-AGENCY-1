# Reference design notes

This note records patterns visible in the local `_design-reference` artifact dump. Filenames in that folder are mostly flattened build artifacts rather than four named subfolders, so the site association below is based on HTML metadata, source imports, and distinctive asset names.

## Legency Media

**Inspected sources:** `(INDEX) 3.COM` (100,515 bytes; HTML for `legencymedia.com`), `global.Btqt_PqA.css` (16,313 bytes), `Accordion.astro_astro_type_script_index_0_lang.DSwuXYVj.js` (1,918 bytes), `Process.astro_astro_type_script_index_0_lang.DazAsBy9.js` (3,795 bytes), plus the local Astro component scripts for header, footer, section headings, and CTA.

- **Structure:** A strong hero and proof area lead into editorial service/offer sections, feature or tier cards, process, testimonials, FAQs, and a final CTA. The CSS includes a three-column tier grid that collapses to one column on narrow screens.
- **Spacing and type:** CSS variables define a large display scale, body scale, spacing steps, max width, and rounded card radii. Headings use a compressed display face; copy uses a separate text face. Sections use wide vertical padding and aligned containers.
- **Components:** Dark and light cards, compact labels, pill chips, proof figures, and section-specific background surfaces.
- **Interactions and motion:** Underline links animate with transform transitions. The accordion component uses disclosure interactions; the process and component scripts are built separately. Several CSS effects have reduced-motion fallbacks. The HTML also includes analytics and consent runtimes; those are reference-site infrastructure and are not part of KOV's implementation.

## Krackerz

**Inspected sources:** `main` (12,567 bytes; Framer site module naming `https://krackerz.com` and page sections), `INDEX 2.js` (4,952 bytes), and the associated local Framer bundle files.

- **Structure:** The module's route map names a long landing-page sequence including hero, sales, partnership, testimonials, FAQ, product/shop, pricing, and CTA sections.
- **Spacing and type:** The captured page is assembled from Framer components and responsive Desktop/Tablet/Phone variants, with breakpoint-specific transforms and layout properties in the bundle.
- **Components:** Multiple editorial and conversion sections are composed as separate modules, including testimonials and FAQ.
- **Interactions and motion:** The code imports Framer Motion and defines spring and tween transitions, in-view title transforms, and rotating visual states. The capture includes remote Framer module imports; no such runtime or remote module is used for KOV.

## Lee Holmes

**Inspected sources:** `(INDEX)` (185,905 bytes; HTML metadata identifies `leeholmes.uk`), `Layout.deVx8v1T.css` (45,160 bytes), `Layout.astro_astro_type_script_index_0_lang.fpiSk6T2.js` (19,502 bytes), and Astro component scripts for Header, MobileMenu, Footer, and Process.

- **Structure:** The page uses a portfolio-style sequence with a clear intro, work/service material, process, and contact/footer content. Components are authored separately and assembled by an Astro layout.
- **Spacing and type:** The page loads a sans display/body system and a monospace face for utility details. Layout CSS is component-scoped and includes responsive breakpoints; content widths and grid spacing change with viewport size.
- **Components:** Reusable header/mobile navigation, footer, process section, accordion, CTA, and section-heading elements are represented by distinct component assets.
- **Interactions and motion:** Mobile navigation and accordion behavior are separate scripts; the project also includes animation and scroll-related utility assets. The copy of `Base.D9X9tJbq.css` in the artifact folder is zero bytes, so detailed base rules are not recoverable from that file alone.

## Neutomni

**Inspected sources:** `(INDEX) 2.COM` (229,363 bytes; HTML metadata identifies `neutomni.com`), `neutomni-026b92.c9d1dd2a.74bcab7a0490916e.js` (394,201 bytes), three matching split JS chunks (114,434 / 41,429 / 304,844 bytes), and `neutomni-026b92.shared.a1e58e004.min.css` (0 bytes).

- **Structure:** The HTML presents a clear intro, work/process narrative, service and capability blocks, and conversion sections, with a marked transition from the current state toward an outcome. The captured source contains many Webflow interaction attributes.
- **Spacing and type:** Responsive layout and interaction setup are embedded in the captured HTML and bundled scripts; the named shared CSS capture is empty, so it does not provide a readable standalone spacing/type sheet.
- **Components:** Repeated grid and card sections, process markers, content panels, CTA areas, and responsive navigation.
- **Interactions and motion:** The markup uses Webflow interaction IDs and breakpoints, with slide/opacity/transform states configured for different widths. The associated Webflow runtime is not used by KOV.

## KOV implementation mapping

The KOV work reuses only design ideas, not reference HTML, copy, images, fonts, logos, or executable bundles:

- Services, how-it-works, pricing, and individual career service pages use an editorial hero, generous section rhythm, and restrained cards inspired by Legency.
- Role hubs use numbered content and quiet process/card styling informed by Lee Holmes.
- Industry hubs and overview pages use cleaner profile-card grids and step-led hierarchy informed by Neutomni.
- Role-in-industry pages use existing section tabs and native FAQ disclosures with compact, numbered prompts, combining the Krackerz module sequence and Neutomni's marked process rhythm.
- Blog, resources, and FAQ pages use the editorial card treatment.

The shared KOV implementation lives in `assets/design-components.css` and `assets/design-components.js`; generated research-page references are emitted by `scripts/_render-research-pages.py`.
