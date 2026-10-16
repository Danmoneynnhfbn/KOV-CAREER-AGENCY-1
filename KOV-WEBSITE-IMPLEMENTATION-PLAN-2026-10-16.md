# KOV Career Agency — Proposed Website Implementation Plan

**Prepared:** 16 October 2026  
**Status:** Proposal only. Implementation has not been approved or started.

This plan follows the findings in [KOV-WEBSITE-AUDIT-2026-10-16.md](./KOV-WEBSITE-AUDIT-2026-10-16.md). It is intentionally staged to preserve the working site, separate business decisions from technical work, and avoid irreversible bulk deletion.

## 1. Target information architecture

### Primary service: Private Career Representation

One primary page and consistent service name should describe the managed, candidate-approved job-search engagement. It may cover strategy, positioning, opportunity research, agreed applications/outreach, tracking and follow-up, interview preparation, and offer support **only to the extent those elements are included in the agreed scope**.

This is a managed representation engagement. It is **not** one item in the Individual Career Services catalogue.

### Secondary service area: Individual Career Services

Present a separate catalogue for customers who need a specific deliverable or form of support without buying representation:

1. Résumé/CV development and improvement.
2. LinkedIn optimization.
3. Career documents.
4. Professional portfolios.
5. Personal career websites.
6. Career optimization.
7. Career coaching.

Each service page should state its purpose, intended audience, process, confirmed deliverables, limitations, and next step. Do not claim that an unconfirmed service is already available or that every service suits every career level.

### Audience navigation

Recognize early-career/entry-level, experienced/mid-career, senior-level, and executive professionals as useful visitor groupings. Avoid promising representation to all four groups until eligibility and capacity have been confirmed. Audience categories are a navigation aid, not a new unverified guarantee.

## 2. Recommended phases

### Phase 0 — Business and product decisions (approval gate)

Resolve the questions in section 4 before drafting purchase claims or decommissioning systems:

- Confirm which services are actually offered now, being introduced, or not offered.
- Confirm whether each standalone service will be inquiry/quotation-based or directly purchasable online.
- Confirm audiences eligible for full representation and standalone services.
- Confirm current candidate fees, terms, deliverables, and any applicable representation contract.
- Confirm evidence and permission for public testimonials, reviews, numbers, logos, and examples.
- Decide what happens to employer accounts, directory access, existing employer records, billing, and contractual obligations.
- Approve page retirement and redirect principles.

**Output:** an approved service matrix and evidence/retention decisions. No code changes should depend on assumptions in these areas.

### Phase 1 — Content model and site navigation

**Likely files:** `index.html`, `services.html`, `candidate-services.html`, `how-it-works.html`, `pricing.html`, `faqs.html`, `about.html`, `contact.html`, `countries-we-serve.html`, `glossary.html`, `why-kov.html`; `assets/audience-nav.js`, `assets/uniform-footer.js`, `assets/homepage-interactions.js`, `assets/homepage-decision-sections.js`, `assets/homepage-decision-sections.css`, `assets/reactive-visuals.js`, `assets/service-faq.js`; relevant root header/footer markup.

**Work:**

- Reframe the homepage around individuals and their career goals.
- Give Private Career Representation one primary entry point and explain the process, fit, approval boundaries, and scope.
- Add a clearly separate Individual Career Services entry point and service-category navigation.
- Remove “For Companies” navigation/footer groups, dual-audience tabs and links after checking all root and category page variants.
- Revise mixed company/candidate descriptions in pricing, FAQs, about, contact, countries, glossary and “Why KOV”.
- Retain candidate-facing explanations of recruiters, hiring managers, employers, and job opportunities where they help a job seeker.
- Preserve responsive layout, brand assets, keyboard navigation, focus, ARIA states, live form feedback, and reduced-motion behavior.

**Dependencies:** Phase 0 decisions on audiences, approved services, and terminology.

**Verification:** inspect rendered navigation on root and nested pages; check all calls to action and internal links; test mobile menu, tabs, and accessibility semantics.

### Phase 2 — Individual Career Services catalogue and pages

**Likely files:** `services.html`; existing candidate service pages under `services/`; `data/seo-pages.json`, `data/seo-pages-additions.json`; `scripts/generate-seo-pages.js`; new standalone service pages only if individually approved; `assets/service-faq.js`; associated CSS/illustrations; service-page tests/checks if introduced.

**Work:**

- Decide which existing pages become catalogue categories, are consolidated, or remain detailed SEO/resource pages.
- Reuse and retarget existing résumé, LinkedIn, career strategy, interview, and negotiation copy only where actual standalone scope is confirmed.
- Create missing service descriptions/pages only for approved offerings: career documents, portfolios, personal career websites, broader résumé/CV coverage, career optimization, and general coaching as applicable.
- Keep Private Career Representation out of the standalone catalogue.
- Define the page template as purpose, intended audience, what is done, process, deliverables, customer inputs, limitations, and next action.
- Do not create a cart or payment integration by assumption. If the approved route is inquiry/quotation, connect to the existing contact submission. If a true online purchase is wanted, treat checkout as a separate, scoped technical project.

**Dependencies:** approved service matrix; actual portfolio/site-building capability and technology scope; pricing and fulfillment model.

**Verification:** each catalogue item links to the correct standalone page and inquiry/ordering method; representation remains distinct; no unconfirmed deliverables or prices appear.

### Phase 3 — Company content retirement and URL handling

**Likely files:** `company-services.html`, `company-proof.html`, `global-talent-sourcer.html`; company-facing generated files in `services/`, `markets/`, `roles/`, `industries/`, `resources/`; the eight employer-facing legacy root stubs listed in the audit; `data/seo-pages*.json`; `scripts/generate-seo-pages.js`; page header/footer; `assets/audience-nav.js`, `assets/uniform-footer.js`, `assets/homepage-interactions.js`; company proof records in `assets/proof-library-data.js`.

**Work:**

- Remove employer service pages and employer-specific public calls to action from the sitemap, navigation, page catalogs, site-search index, and `llms.txt`.
- Retire the 12 employer-oriented industry pages, six employer-oriented market pages, two employer-oriented service pages, two employer-oriented role pages, and three employer-oriented resource pages identified in the audit.
- Preserve useful candidate market/service pages and candidate explanations involving employers.
- Remove employer proof records from public search/index output; retain internally only if approved.
- Keep candidate legacy URLs that still point to candidate-relevant destinations.
- For retired employer URLs, choose a genuine relevant replacement only where one exists. Otherwise return an appropriate not-found/gone response. Do not redirect unrelated pages to the homepage.
- Verify the actual Vercel/server response path before implementing redirects. Current legacy files perform client-side meta/JavaScript navigation; this is not a permanent HTTP redirect.

**Dependencies:** user approval of the retire list; redirect/retention choices; production hosting access or confirmation of the supported redirect mechanism; decision about employer account and API continuity.

**Verification:** no retired page remains in public navigation, related links, footer catalogs, search, sitemap, `llms.txt`, metadata, or structured data; candidate URLs and useful candidate content still resolve.

### Phase 4 — Claims, proof, pricing and privacy

**Likely files:** `index.html`, `blog.html`, `posts/*.json`, `candidate-proof.html`, `assets/proof-library-data.js`, `resources/anonymous-executive-reviews.html`, `resources/candidate-success-stories.html`, `resources/case-studies.html`, `pricing.html`, `faqs.html`, `privacy.html`, `about.html`, SEO data, `docs/architecture/backend-architecture.md` if its public/product description is intentionally maintained.

**Work:**

- Create an evidence register for every claim retained: source, period, cohort, permission, caveats, and business owner.
- Remove or accurately reframe the homepage’s 2–3 week interview and nine-interviews-in-90-days claims, 50–100 weekly application claim, and any other unsupported fixed-volume/timing/result promises.
- Verify anonymous testimonial/review provenance, consent, privacy, accuracy, and non-identifiability. Do not invent new testimonials or substitute fictional results.
- Review candidate proof examples; clearly distinguish illustration from actual client work and do not imply outcomes that cannot be evidenced.
- Remove employer fees/warranty terms from public copy only after confirming whether there are outstanding users, subscriptions, invoices, or legal obligations.
- Update privacy disclosures to reflect actual current data flows, especially contact submissions, account roles, profile/directory processing, CV storage/retention, and any retained employer records. Obtain appropriate legal review before publication.

**Dependencies:** owner-supplied evidence and permission; current pricing and agreement terms; operational/legal review.

**Verification:** search all public and generated sources for numerical promises, guarantee language, fees, testimonials, company terms, and stale proof/index data. Confirm no technical change falsely states records or services have been deleted.

### Phase 5 — Account, backend, data and contact decision

**Likely files if changes are approved:** `account.html`, `profiles.html`, `assets/account-api.js`, `assets/contact-form.js`, contact HTML/bundle, `backend_api.py`, `server.py`, `supabase/migrations/202610110001_backend_foundation.sql`, `vercel.json`, `tests/test_backend_api.py`, deployment/architecture docs.

**Work:**

- Retain candidate login, registration, account support, and security protections unless a separate product decision changes them.
- Decide whether employer registration, company directory, employer subscriptions/invoices, and employer APIs should be hidden, disabled for new users, retained for existing obligations, or fully retired.
- Do not delete employer data or disable payment/webhook flows without an approved migration/retention and billing plan.
- If the public inquiry form becomes candidate-only, update its audience field and validation consistently in HTML, `assets/contact-form.js`, backend models, persisted records and privacy notice; maintain rate limiting, email fallback, explicit errors, and candidate submission tests.
- The audit found an API-backed contact flow at `/api/contact`; preserve it rather than reverting to mail-only behavior.

**Dependencies:** product decision about existing employers/data; environment and provider configuration; data-retention/privacy/contract review; migration/backout plan.

**Verification:** candidate auth/contact/account behavior; anonymous denial; same-origin and role checks; masked profile protections if retained; checkout/webhook behavior if retained; migration and regression tests. Validate in a configured staging environment before production.

### Phase 6 — SEO, schema, search, assets and final QA

**Likely files:** `sitemap.xml`, `robots.txt`, `llms.txt`, `validate_schema.py`, `scripts/generate-seo-pages.js`, `scripts/build-site-search-index.py`, `assets/site-search-index.js`, `assets/site-search.js`; all affected metadata/schema; CSS/JS/image files referenced above; `assets/ASSET-SOURCES.md`.

**Work:**

- Regenerate only after source data and disposition decisions are approved.
- Rebuild sitemap, search index and topic/footer catalog from the approved page inventory.
- Revise page titles, descriptions, canonical URLs, Open Graph/Twitter fields, JSON-LD organization/service types, FAQ markup, and internal related links together.
- Update `llms.txt` to candidate services only, using accurate service availability and URLs.
- Set deliberate redirect/404/410 behavior and remove stale sitemap entries; do not assume a browser-refresh stub transfers search signals.
- Keep robots rules aligned with public crawl intent, while relying on authentication—not robots—for private routes.
- Review image alt text and licensing/source documentation. Resolve missing references to `download (27).png` and `download (28).png` by removing them or using approved assets; do not fabricate or reuse third-party press logos without authorization.
- Remove employer-only illustrations/styles only after searching their references; preserve candidate diagrams, shared styles, and responsive behaviors.
- Use current search-engine documentation and relevant Google search results for keyword/intent research at the copywriting stage. Write original text; do not copy result snippets or competitor pages. Do not guarantee SEO/GEO rankings, indexing, or AI answers.

**Verification:**

1. Run `python validate_schema.py` and update its expected page inventory to match the approved sitemap.
2. Regenerate SEO pages and search index from approved JSON; confirm generated HTML and source data agree.
3. Verify every sitemap URL has one local target, matching canonical, unique title/description, valid JSON-LD, and appropriate `llms.txt` treatment.
4. Scan public HTML, JS, JSON, CSS, SVG captions/alt text and search catalog for employer offers, stale prices, old numbers, unsupported promises, and references to retired URLs.
5. Re-run local-link/asset checks and resolve missing assets.
6. Run `python -m unittest tests.test_backend_api -v`; add relevant tests for changed contact/account behavior.
7. Browser-check candidate desktop/mobile navigation, each service journey, contact submission/error/fallback, responsive layout, focus/keyboard flows, and console/network failures.
8. Run accessibility/contrast checks and manually verify keyboard and screen-reader status for modified interactions/forms.
9. Use staging to verify live redirects, status codes, route behavior, provider-backed accounts, and any retained billing; local tests do not prove production provider configuration.

## 3. File and page scope at a glance

The exact 101-file page dispositions are in the linked audit report. The implementation surface is broader than the pages marked RETIRE:

- **11 principal pages EDIT** and three public pages RETIRE; blog, privacy, and candidate proof require REVIEW.
- **32 of 60 generated pages EDIT**, 25 RETIRE, and three REVIEW.
- **12 candidate legacy aliases KEEP**; eight employer legacy URLs RETIRE with deliberate URL handling.
- **Account and profiles REVIEW**, protected operations and publishing pages KEEP.
- Shared scripts, source SEO data, generated HTML, search index, navigation/footer catalog, sitemap and validator must be treated as one coherent system.

## 4. Questions requiring your decision

1. **Service availability:** Which of the seven Individual Career Services categories are offered now, which will be introduced, and which should not appear? For each offered service, what deliverables and career levels are included?
2. **Buying process:** Should standalone services be requested by inquiry/quotation (which the contact workflow can support), or should customers be able to buy/pay online? There is no verified seven-service checkout catalog today.
3. **Representation eligibility:** Is Private Career Representation available to entry-level and early-career candidates, or only certain career levels? What are the actual fit/eligibility conditions?
4. **Pricing/terms:** Are current candidate registration, onboarding, retainer, subscription, cancellation, and engagement terms still active? What exact terms may be published?
5. **Employer operations:** Should employer account registration, candidate directory, subscriptions/invoices, API, and existing employer records be fully retired, or should some be preserved for existing users/contracts while no longer marketed publicly?
6. **Testimonials and proof:** Can you confirm which reviews/examples are real, authorized for publication, appropriately anonymized, and supported? If not, should they be removed or retained only as clearly illustrative process examples?
7. **Quantified claims:** Do you have verifiable records and permission for any exact application volume, interview timing/count, placement, or success-rate claims? If no, the proposal is to remove them or replace them with process descriptions.
8. **Audience labels:** Do you prefer three or four navigation levels, and which labels best match your actual target customers? The current proposed labels are early-career, experienced/mid-career, senior-level, and executive.
9. **URL handling:** For retired employer pages with no candidate replacement, do you prefer a not-found/gone response, or is there a specific genuinely relevant replacement page? The proposal avoids blanket homepage redirects.
10. **Assets/press logos:** Are the homepage press/media logos approved for use as displayed, and should missing `download (27).png` / `download (28).png` references be removed if the source files cannot be supplied?
11. **Privacy and live configuration:** Is there a designated person to approve revised privacy/data-retention and contractual language, and can staging/production routing be verified before any redirects or account changes go live?

## 5. Guardrails for implementation approval

- This plan does not authorize edits, deletions, redirects, new service promises, backend decommissioning, database migrations, or production deployment.
- Preserve existing working candidate flows and protect all existing user data unless a separately approved migration explicitly addresses it.
- Keep candidate representation and standalone career services distinct in navigation, content, data/schema and calls to action.
- No fabricated evidence, pricing, credentials, integrations, or outcomes.
- Do not destructively remove source/generated assets until references and URL needs are verified.
- Stop for business confirmation wherever service capability, eligibility, proof, pricing, privacy, legal, or existing customer obligations are unknown.

