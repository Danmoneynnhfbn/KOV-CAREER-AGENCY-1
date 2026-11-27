# KOV commercial website restructuring: execution strategy

## Project outcome

Turn the existing website into a coherent, benefit-first service journey. Visitors should recognize their situation, understand the problem, see which KOV service is relevant, understand the actual work and boundaries, and know how to make an enquiry.

This is not a site redesign, an indiscriminate SEO expansion or a new SaaS product.

## Existing site baseline

The current `development/PAGE-COVERAGE.csv` and `sitemap.xml` are the publication source of truth. The audited baseline is 1,424 published canonical URLs. The repository contains many more HTML files, including noindex pages, redirect stubs, administrative surfaces and staging material. Do not treat all repository files as public pages.

The previous `PAGE_MANIFEST.json` is historical and does not replace the current coverage register.

## Architecture

### Layer 1: Commercial service destinations

- Private Career Representation: one primary managed service.
- Seven distinct Individual Career Services: CV/resume, LinkedIn, career documents, portfolio, personal career website, career positioning and coaching.
- Specialist executive pages explain a particular audience or workstream and route to the correct primary service.
- Do not inflate the service catalogue with duplicate role, sector, country or seniority variations.

### Layer 2: Subject and decision-support pages

Preserve role, occupation, industry, geography, market, resource and FAQ pages. Improve them based on the particular question or decision a visitor is trying to resolve. They should explain relevant context and provide a clear next step only where the related KOV service genuinely helps.

## Visitor journey

1. **Recognition:** Show a specific, believable customer situation.
2. **Understanding:** Explain why the problem is difficult or why a common approach may not be enough.
3. **Outcome:** Describe the improvement the visitor is seeking.
4. **Service fit:** Introduce the right KOV service, not a generic company pitch.
5. **Delivery:** Explain work, deliverables, customer inputs, approvals and boundaries.
6. **Trust:** Be clear about fees, confidentiality, suitability and outcomes KOV cannot control.
7. **Enquiry:** Provide one relevant call to action with an appropriate contact route.

## Prioritized execution

### P0 — Commercial truth and primary conversion path

- Keep the homepage aligned to candidate-side work and benefits.
- Make the Private Career Representation page the primary managed-service destination.
- Make the Individual Career Services hub clearly separate and route visitors to the seven standalone services.
- Correct the process and pricing pages so they do not promise high-volume applications, automatic outreach, guaranteed introductions or employer-controlled outcomes.
- Check all CTA and inquiry routes.
- Remove contradictory or legacy claims only where the actual source page is verified; do not invent credentials, prices or client results.

### P1 — Service page differentiation

Review each of the seven individual service pages against the service register. Preserve substantive useful material. Improve each page's customer problem, outcome, deliverables, boundaries and contextual links. Do not replace good page-specific material with a generic repeated template.

### P2 — Subject page relevance

Use the page map to prioritize pages with clear commercial relevance. Role pages should discuss role-specific responsibility, evidence, transition or positioning issues. Industry and market pages should provide genuine sector/geography context and explain limitations. Resource pages should answer their actual topic. FAQs should answer real questions without repetitive filler.

### P3 — Internal linking and discovery

- Link from subject pages to one relevant service or a short relevant choice, with descriptive anchor text.
- Link from service pages to useful supporting pages, not broad irrelevant directories.
- Keep header/footer, sitemap, coverage register, search index and redirects consistent.
- Preserve canonical URLs unless a separately approved route change is necessary.

## Metadata and dataset integrity

- Preserve all 18 datasets in the three parent groups documented in `docs/research/kov-central-dataset-catalogue.md`.
- The public catalogue remains centralized at `/data/kov-dataset-catalog.jsonld`.
- Indexable pages use the existing single shared catalogue `@id`; full datasets are not duplicated in every HTML head.
- Use the established `scripts/build-jsonld.js`, `scripts/build_cloudflare_pages.py`, `scripts/optimize_head_metadata.py` and sitemap validators.
- Do not manually rewrite unrelated HEAD elements. Existing title, description, canonical, robots, Open Graph, Twitter and metadata remain protected unless the user separately authorizes a specific correction.
- New public pages must use the existing generation/build pipeline and page-specific metadata rules.

## Design and media

- Reuse existing KOV layout, components, styles, assets and font declarations.
- Keep the current editorial, light-first visual language, with restrained orange, blue, green/teal and neutral tones.
- Use existing local image assets when they support the content and have suitable alt text. Avoid generic stock images, unnecessary external image dependencies and decorative images that do not help a visitor understand the service.
- Use descriptive, compressed, responsive images with dimensions and lazy loading where appropriate. Hero images may load eagerly.
- Respect reduced-motion and existing responsive behaviour. Do not introduce a new font system or broad CSS redesign.

## Publication controls

- Work on `kov-commercial-website-restructure`.
- Validate the preview before merge.
- Production is the Cloudflare Pages project `kov-career-agency`, connected to GitHub repository `Danmoneynnhfbn/KOV-CAREER-AGENCY-1` and production branch `master`.
- Do not bypass failed build or sitemap checks.
- Do not deploy experimental backend/Container/Worker work as part of this static-site project.
- Keep rollback to the previous Pages deployment available.

## Release checklist

- Build command succeeds: `python3 scripts/build_cloudflare_pages.py`.
- Sitemap and coverage register match exactly.
- Central catalogue generation validates all 18 datasets and all three groups.
- Existing public URLs and canonical targets remain valid.
- Every indexable page has exactly one shared catalogue root reference.
- Noindex/private pages are not added to the sitemap or catalogue references.
- All new/changed links resolve.
- Main navigation and CTA paths work on desktop and mobile.
- Contact form submission and email fallback are tested.
- Representative role, industry, market, resource, FAQ and service pages are checked visually.
- Images load, alt text is useful, and local assets are used where appropriate.
- Production deployment completes and the live domain is checked after cache refresh.
