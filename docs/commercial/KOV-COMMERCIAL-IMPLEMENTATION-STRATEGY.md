# KOV commercial website restructuring: Phase 2 execution strategy

**Updated:** 28 November 2026  
**Working branch:** `kov-commercial-phase-2-customer-outcomes`  
**Production baseline:** `master` at `de4240ecce259c8e7e711269798fcc894b339f71`

## Project outcome

Make the website a connected, customer-centred professional-services journey. In the opening lines, a visitor should recognise a real situation they are facing now, understand why it matters, see what improvement is possible, and find the KOV service that can help.

The commercial copy must lead with the professional's difficulty and desired outcome, not with KOV's internal process, SEO terms, software or an agency-first introduction. Plain English, credible evidence, empathy and clear scope are required throughout.

This is not a site redesign, an indiscriminate SEO expansion or a new SaaS product.

## Verified public-site baseline

The current `development/PAGE-COVERAGE.csv` and `sitemap.xml` are the publication source of truth. At the Phase 2 start they contain **1,424 published canonical URLs**. The current commercial page map also has 1,424 rows.

The page families in the current map are:
- 603 role and occupation subject pages
- 375 career resource/research pages
- 237 geography and market subject pages
- 132 directory/reference subject pages
- 31 FAQ pages
- 22 industry subject pages
- 8 commercial conversion and service destinations
- 1 homepage

The repository contains additional HTML files, including redirects, administrative surfaces, noindex material and unpublished directory staging. Those are not automatically public pages and must not be added to the sitemap simply because they exist in the repository.

The previous `PAGE_MANIFEST.json` is historical and does not replace the current coverage register.

## Two connected website layers

### Layer 1: Service destinations

The current commercial source of truth contains:
- One primary managed service: **Private Career Representation** at `services.html`.
- Seven individual services: resume/CV writing, LinkedIn profile optimisation, career documents, career portfolio development, personal career website, career positioning and career coaching.
- Eight existing published executive-specialist routes under `/services/` are mapped to those parent offers in `development/KOV-EXISTING-SPECIALIST-SERVICE-ROUTES.csv`. They are being deepened as existing pages, not counted as new paid products or duplicate URLs.

The Phase 2 planning target is **120 service-page candidates** across eight customer-problem families. The register is in `development/KOV-SERVICE-PAGE-CANDIDATES.csv`, with its decision rules in `docs/commercial/KOV-EXPANDED-SERVICE-CATALOGUE-120.md`.

The 120 entries are page candidates, not 120 confirmed paid products. They are separated into:
- The eight existing canonical offers.
- Components or audience variations that should ordinarily remain on their parent service page.
- Distinct-page candidates that need specific customer research and a defined deliverable.
- Capabilities that need owner or specialist confirmation.
- Workstreams already included in managed representation.
- Explanatory topics that are not products.

No candidate gets a public URL simply to meet the target. A dedicated page must solve a distinct problem, serve a distinct search intent, explain a real repeatable KOV process and deliverable, and avoid competing with an existing canonical page. Clinical, medical, academic, creative and external-platform work must not be marketed until capability and delivery boundaries are confirmed.

### Layer 2: Existing subject and decision-support pages

Preserve the identity and value of all 1,424 published pages: role, occupation, industry, country, city, market, resource, research, FAQ and reference pages.

Improve the body copy in the context of each page's actual visitor:
- A role page should address that role's mandate, decisions, evidence, career challenge and likely transition questions.
- An industry page should explain the sector's actual operating model and what a professional must investigate, without assuming every employer is alike.
- A market page should explain location-specific search considerations and what the reader must verify; do not imply a KOV office, local network or legal/immigration advice without evidence.
- A resource or FAQ page should answer its actual question first. It should not be turned into an irrelevant sales pitch.
- A directory/reference page should retain its lookup purpose and useful navigation.

Where KOV genuinely helps, link to one relevant service with descriptive wording. Do not add a generic service link to every page.

## Phase 2 work added on the working branch

- Added the 120-candidate service-page register and its validation script. The 120 entries remain planning candidates, not 120 approved paid products or public URLs.
- Added context-specific related-service sections to the seven canonical individual service pages. Each page now links to three or four adjacent services with a short explanation of when that help is useful.
- Added docs/commercial/KOV-SEARCH-CONSOLE-BASELINE.md using the connected property’s 25 August–25 November 2026 data. It distinguishes candidate-side search intent from employer-side executive recruitment queries and documents the limits of query classification.
- Added docs/commercial/KOV-PUBLICATION-STATUS-EXCEPTIONS.md with source-repository and Google URL Inspection evidence. It records the 610 source-level staging disclosures, legacy indexed /staging/ URL examples, and the Global Talent Sourcer 404.
- The corrected audit detects no missing primary service links across the 1,424 published pages after resolving relative URLs. The earlier 45 flags came from an audit-script path-resolution defect and must not be treated as website defects.
## Visitor journey and content standard

Every commercial destination should follow this sequence:

1. **Recognition:** The first two or three lines describe a real and recognisable customer situation.
2. **Stakes:** Explain why the issue matters now or what may remain difficult if it is not addressed.
3. **Desired progress:** Describe the practical improvement the visitor wants.
4. **Service fit:** Explain why this particular KOV service is relevant.
5. **Actual work:** State what KOV does, how the work is carried out and what the customer receives.
6. **Client role:** Explain required source information, approvals, decisions and responsibilities.
7. **Boundaries:** State exclusions and what KOV cannot control or guarantee.
8. **Trust:** Be accurate about confidentiality, fees, experience, evidence and service suitability.
9. **Next step:** Provide a relevant, natural enquiry route.

Do not use one paragraph template with only a role title or industry name replaced. Shared design components are acceptable; generic duplicated sales copy is not.

## Page-level audit and editorial process

A read-only page audit is being added at `scripts/audit-commercial-content.py`. The new GitHub Actions workflow will:
- Reconcile the sitemap with the published rows in PAGE-COVERAGE.
- Read every published page's visible text, title, H1/H2 structure and body links to existing service pages.
- Flag possible thin pages, missing headings, generic placeholder language and service handoffs that need human review.
- Identify long paragraphs repeated across pages.
- Compare exact contiguous eight-word passages within role and industry page groups using Jaccard overlap, matching the method in `scripts/check-research-pages.py`.
- Publish a page-level CSV and summary as a workflow artifact.

The existing `VISIBLE-OVERLAP-AUDIT.md` is a historical audit of 615 generated research pages. It reports zero page-pair comparisons above its 30% exact eight-word passage threshold. It is not a replacement for a current audit of all 1,424 sitemap pages.

Automated flags are triage aids, not editorial decisions. A short reference page may be correct; a repeated disclaimer may be appropriate; a resource may not need a service link. Editors must inspect the actual visitor need before changing copy.

## Keyword research and content uniqueness

The current keyword-intent material contains qualitative hypotheses and source notes, not verified search-volume or ranking forecasts. Each candidate service page still needs:
- Search Console query and landing-page evidence where available.
- Current search-result review for the target country, language and audience.
- Competitor/service-page comparison based on actual customer problem and deliverable.
- Search-intent and cannibalisation checks against the existing canonical URLs.
- A clear publish, combine, retain-as-section or reject decision.

Do not invent search volume, keyword difficulty, market demand, competitor performance, ranking likelihood or conversion forecasts. Do not generate multiple pages around synonymous phrases where one useful service page is enough.

## Contact and enquiry handling: existing code, deployment blocker

The public contact form is currently a `mailto:` handoff. Its JavaScript opens the visitor's email client and does not call the API.

The repository already contains a FastAPI `POST /api/contact` implementation. It validates a contact payload, applies a network-based request limit, stores an accepted lead through the Supabase `submit_contact_lead` RPC, and sends an email notification through Resend. Backend tests mock those external boundaries; no real lead or email was sent during this phase.

The current Cloudflare account was checked directly on 28 November 2026:
- the Pages project `kov-career-agency` is active on `master`, with both apex and `www` custom domains active;
- no Worker custom domains and no Container applications are provisioned;
- the separate API Worker is therefore not attached to the production hostname;
- the Container deployment documentation records that provisioning was blocked by the account's Workers Paid Container entitlement; creating one would be billable and is not authorised by this content phase;
- an isolated backend must still have its secrets configured and pass Workers.dev tests before any production route is added.

The Container/Workers Paid plan is billable. This phase does not upgrade the account, buy a plan, create a new paid service or attach production routes.

There is also a front-end/backend contract gap to resolve before connecting them: the public script removes the target-role field, but the current API model requires `target_role`; the service-interest selector is not a dedicated field in the API model. The backend's `audience` enum also needs to remain aligned with the candidate-only form. The client should send a well-defined payload, retain a usable email fallback, display success/error states, and never expose privileged Supabase or Resend credentials.

Until the route, secrets, schema contract, privacy wording and end-to-end tests are verified, keep the mailto fallback and do not claim leads are being saved by the live website.

## P0–P3 execution priorities

### P0 — Preserve and validate the commercial foundation
- Keep the homepage focused on the visitor's situation and the benefits of candidate-side professional support.
- Keep Private Career Representation distinct from the seven standalone services.
- Keep process and pricing aligned with written scope and no outcome guarantees.
- Check contact links, mailto fallback, service preselection and mobile usability.
- Preserve the current public route set and all useful existing service copy.

### P1 — Qualify the 120 service-page candidates
- Use the 120-row register as a working backlog, not a public product menu.
- Validate capability, buyer problem, deliverables, price basis and exclusions for each proposed specialist page.
- Complete keyword/SERP research and cannibalisation review before reserving a URL.
- Build only the pages that pass the distinct-page test; consolidate the others into parent services.

### P2 — Audit and improve the 1,424 subject pages
- Run the page-level content audit and review the actual opening copy, headings and body text.
- Prioritise commercially relevant pages with a recognisable unresolved visitor problem and no relevant next step.
- Improve pages from their true subject and source material, not from a global find-and-replace.
- Keep informational/reference pages informational where that is the visitor's need.

### P3 — Internal journeys and discovery
- Add descriptive contextual links from relevant subject pages to the best matching service.
- Link services to supporting guides only where they help the reader make a decision.
- Keep header/footer, sitemap, PAGE-COVERAGE, search index and redirects consistent.
- Preserve canonical URLs unless a separately approved change is necessary.

## Metadata and dataset integrity

- Preserve all 18 datasets in the three parent groups documented in `docs/research/kov-central-dataset-catalogue.md`.
- Keep the central catalogue at `/data/kov-dataset-catalog.jsonld`.
- Indexable pages use the existing shared catalogue `@id`; do not copy entire datasets into every HTML head.
- Use the established JSON-LD builder and Cloudflare Pages build.
- Existing title, description, canonical, robots, Open Graph, Twitter and structured metadata are protected. Do not modify unrelated HEAD elements during body-copy work.
- New public pages must enter the standard coverage, sitemap, search-index, metadata and QA pipeline. Noindex/private pages remain excluded.

## Design and media

- Reuse existing KOV layout, components, CSS, assets and font declarations.
- Preserve the editorial, light-first visual language with restrained orange, blue, green/teal and neutral tones.
- Use local, rights-cleared media where it genuinely helps explain the service. Avoid generic stock imagery and decorative downloads that add no visitor value.
- Maintain descriptive alt text, responsive sizing, lazy loading where appropriate, existing mobile layouts and reduced-motion behaviour.
- Do not introduce a new font system or broad redesign.

## Build, review and release controls

Work is being done on the isolated branch `kov-commercial-phase-2-customer-outcomes`. Production remains on `master`; this work does not modify the live site until it is reviewed and merged.

Required checks before any production release:
- Run `python3 scripts/build_cloudflare_pages.py`.
- Run the 120-candidate catalogue validator.
- Run the sitemap-wide commercial content audit and inspect the CSV/summary.
- Run `scripts/check-research-pages.py` and the existing site/visual tests where relevant.
- Confirm sitemap and PAGE-COVERAGE still match exactly.
- Confirm all 18 source datasets remain intact and the central catalogue build is idempotent.
- Confirm existing canonical URLs and redirect targets remain valid.
- Confirm one shared catalogue root reference on each indexable public page and no public references on excluded pages.
- Check all modified links, service preselection and contact email fallback.
- Review representative desktop and mobile pages.
- Confirm that no proposed/unverified service page was published.
- Confirm successful Cloudflare production deployment and inspect the live domain after cache refresh.

Do not bypass failed build, metadata, sitemap or visual checks. Keep the previous production deployment available for rollback.
