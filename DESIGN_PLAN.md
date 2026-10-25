# KOV design plan

## Goals and constraints

Keep the existing static HTML delivery model. Preserve all page wording, heading copy, claims, pricing, disclaimers, titles, SEO metadata, URLs, canonicals, structured data, alt text, internal navigation, sitemap, and robots rules. Design changes are shared CSS variables and additive page theme attributes/assets; existing headers, footers, and link destinations remain in place.

Use the reference layouts as inspiration only. The KOV system uses the site's existing Inter/Fraunces declarations and system fallbacks, not the proprietary typefaces, images, logos, icons, text, or implementation from any reference.

## Reference assignment

| Page/template family | Theme | Rationale |
| --- | --- | --- |
| Home and industry/country pages | Neutomni | Modular section pacing and broad visual groupings suit an agency overview and global service information. The reference's high-saturation colors are deliberately not reproduced. |
| Services, pricing, FAQ library/answers, blog index/posts, legal reading | Legencymedia | Strong hierarchy, legible containers, and repeatable section structure work well for detailed service and policy content. |
| About/founder and contact pages; role hubs | Lee Holmes | Editorial typography and personal-story pacing support the founder-led, confidential positioning. |
| Role-by-industry pages | Krackerz | Bold display scale and card structure help differentiate dense role/industry matrices, adapted into a restrained professional palette. |
| Remaining pages | Legencymedia by default; role and industry directories use their corresponding assignments above | Provides a consistent readable fallback for the large generated-page set. |

The `other` inventory group contains most generated role/industry pages; its per-page theme is recorded in `PAGE_MANIFEST.json`.

## Shared implementation

- `css/design-system.css` contains shared tokens, responsive wrapper/card/button/article/form/accordion primitives, focus-visible styling, and reduced-motion handling.
- `css/theme-*.css` files assign the same token names for each reference-led theme.
- `js/site.js` provides opt-in accessible navigation/accordion hooks and reduced-motion-aware reveal motion.
- The migration script adds theme attributes and shared assets while retaining existing page markup and navigation.
- Existing page-specific headers/footers are preserved to avoid changing their frozen wording or destinations; shared visual treatment is applied with shared classes and CSS selectors instead of replacing their HTML.

## Known template constraints

The static inventory includes 723 HTML files. It has a blog listing but no separately materialized blog-post HTML template. Fourteen legacy redirect stubs have no H1 because they contain no page content and immediately redirect; they are retained unchanged rather than given new visible text. There is one private-admin HTML file inventoried but excluded from the public design migration.

Golden-sample responsive screenshots are saved in `design-reference/compare/`. Screenshots document the KOV result but are not a pixel-exact comparison; dynamic reference animation, video, and third-party content make exact side-by-side state matching unreliable.
