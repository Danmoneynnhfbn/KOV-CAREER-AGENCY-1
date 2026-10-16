# KOV Career Agency — Website Audit

**Audit date:** 16 October 2026  
**Scope:** Read-only review of the repository's website pages, page data and generators, navigation and shared scripts, SEO files, assets, contact/account/backend surfaces, redirects, and available automated checks.  
**Status:** Audit and recommendation only. No website implementation files were changed.

## 1. Executive summary

The current public site is built around two practices: candidate-side executive career representation and employer-side executive search/talent sourcing. The requested future position is candidate-only, with **Private Career Representation** as the main managed service and a distinct catalogue of independently available **Individual Career Services**.

The audit found:

- **101 HTML files:** 17 principal public pages, 20 root-level legacy redirect stubs, 3 account/operations pages, 60 generated SEO landing pages, and 1 protected publishing page.
- **77 sitemap URLs:** 17 principal public URLs and all 60 generated SEO landing pages. The other 24 HTML files are not in the sitemap.
- **Current source validation passes:** all sitemap URLs map to local files; metadata, canonicals, JSON-LD, `llms.txt`, and search-index coverage pass the repository validator.
- **Employer positioning is cross-cutting:** it appears in root pages, page metadata and schema, navigation/footer scripts, homepage interactions, service/market/role/industry SEO data, generated HTML, the search index, proof data, `llms.txt`, account registration, the candidate directory, contact capture, privacy disclosures, and backend operations. Removing only three employer pages would not achieve the stated positioning.
- **Career Representation, résumé strategy, LinkedIn optimization, interview preparation, negotiation, and career strategy have existing candidate-facing descriptions.** Their present copy is predominantly executive-oriented. Existing content does not prove each can be bought as a standalone service.
- **There is no complete standalone catalogue** for résumé/CV development, career documents, portfolios, personal career websites, broad career optimization, and career coaching. Some capabilities are mentioned on existing pages, but independently purchasable scope, deliverables, prices, and ordering are not established.
- **The current contact form does submit to `/api/contact` and has a mailto fallback.** Backend tests cover persistent inquiry handling; this is more complete than a mail-client-only form.
- The current test suite contains **43 backend tests**, not the 32 stated in the older baseline report.
- The 101-file static `href`/`src` check found two distinct missing homepage image files (`download (27).png` and `download (28).png`), each referenced twice. Four additional path checks against the protected publishing template are URL-relative false positives: that template is served at the site root by the authenticated route.

Disposition counts across all 101 HTML files:

| Disposition | Count | Meaning in this audit |
|---|---:|---|
| KEEP | 14 | Retain as-is at this stage; this includes candidate legacy aliases and protected/internal pages. |
| EDIT | 43 | Retain useful purpose and revise the candidate positioning, scope, links, or metadata. |
| RETIRE | 36 | Remove from public marketing; handle any indexed or legacy URL deliberately. |
| REVIEW | 8 | Hold pending evidence or a product/business decision. |

These are proposed dispositions, not deletion instructions. In particular, “RETIRE” means retire from public marketing—not erase data, records, or useful operational code.

## 2. Audit method and boundaries

Inspected the current repository versions of all 101 HTML files; all 77 sitemap locations; root redirects; generated-page source data and generator; site-search index builder and output; navigation, homepage and footer scripts; proof data; contact and account code; backend route/test surfaces; SEO files; representative style and image inventories; `robots.txt`; `llms.txt`; and the available test and validation scripts.

This is a source and local-validation audit. It did **not** inspect a live production deployment, hosting redirect responses, Google Search Console/Bing data, search rankings, analytics, live account/checkout configuration, customer records, or private business evidence. It is not a legal, privacy, accessibility-conformance, penetration, or external SEO ranking audit. No internet search was used to validate business claims or copy.

The pre-existing Git worktree was already heavily staged, modified, and untracked. Its changes were left untouched; the two new report filenames were checked to be absent before creation.

## 3. Complete HTML page-by-page disposition

### 3.1 Principal public pages (17 files; current sitemap URLs)

| File | Disposition | Reason and dependency/risk |
|---|---|---|
| `index.html` | EDIT | Currently leads with global talent sourcing, executive-only language, employer CTA, and application/interview claims. Reposition as candidate-first and make the two service areas clear. Preserve useful layout and interactive sections; replace or substantiate outcome claims. Two referenced image files are missing. |
| `services.html` | EDIT | Its title, navigation and content still frame services around both sourcing for companies and executive representation. Reorganize around Representation and the standalone services catalogue without inventing availability. |
| `global-talent-sourcer.html` | RETIRE | Entirely employer-facing service page. Remove from public marketing and provide an appropriate status/redirect decision for the URL. |
| `how-it-works.html` | EDIT | Contains candidate and company journeys and promises/placement language. Retain a clear candidate process tied to agreed scope and approvals. |
| `pricing.html` | EDIT | Metadata and content include employer subscription and placement fee/warranty terms, plus candidate onboarding and retainer terms. Confirm current candidate-only fees and whether representation remains subscription-based before publishing. |
| `faqs.html` | EDIT | Mixes company and candidate questions. Retain candidate-relevant answers; review each timing, result, scope, price, and confidentiality statement against current practice. |
| `blog.html` | REVIEW | Public blog includes multiple anonymous testimonials/reviews and at least one claim of 50–100 applications each week. Verify source, consent, identity masking, accuracy, and authorization before keeping outcome claims. Preserve useful editorial content and blog functionality. |
| `about.html` | EDIT | Founder story and professional background are useful, but metadata/copy mention recruitment and talent sourcing. Confirm credentials and approved founder biography; revise to candidate career work. |
| `contact.html` | EDIT | Form submits candidate/company audience and employer details to `/api/contact`, with email fallback. Make the public inquiry candidate-only while preserving submission, validation, rate limiting, and fallback behavior. Coordinate frontend fields, backend schema, and privacy notice. |
| `privacy.html` | REVIEW | Must remain available, but current notice covers employer accounts, talent-sourcing work, directory data, billing, and CV retention. Reconcile it with the final product decision and actual provider/data configuration; obtain appropriate legal review before replacing disclosures. |
| `candidate-services.html` | EDIT | Existing candidate-side representation page is the natural primary-service surface. Broaden the audience beyond senior executives, label it **Private Career Representation**, clarify scope/approvals, and remove unsupported volume or outcome promises. |
| `company-services.html` | RETIRE | Entirely employer-facing service page. Remove from public marketing; decide URL treatment and preserve any records or API dependencies separately. |
| `candidate-proof.html` | REVIEW | Candidate workflow examples are useful, but anonymized initials, geographies, role details, and deliverables may imply real client engagements. Verify evidence/permission or make clearly illustrative material unmistakable. |
| `company-proof.html` | RETIRE | Employer talent-sourcing proof library. Remove from public marketing; preserve source data only if it serves an approved internal purpose. |
| `why-kov.html` | EDIT | Explains “two practices” and a shared network. Rework into the candidate-focused philosophy and avoid implying employer-side services remain. |
| `countries-we-serve.html` | EDIT | Currently covers both professionals and companies and may imply broad geographic reach. Keep only candidate-relevant market pages and state actual remote coverage/limitations accurately. |
| `glossary.html` | EDIT | Useful candidate resource, but definitions include executive search and global sourcing. Retain useful job-search terminology and revise/remove employer-service definitions and schema/search copy as appropriate. |

### 3.2 Root-level legacy redirect stubs (20 files)

These are short pages that use browser meta refresh and JavaScript navigation, with canonicals pointing to categorized destinations. They are not permanent HTTP redirects in the checked source. Maintain relevant candidate aliases; do not redirect every obsolete employer URL to the homepage.

| File | Disposition | Current destination / proposed handling |
|---|---|---|
| `career-strategy-senior-leaders.html` | KEEP | Candidate service alias to `/services/career-strategy-senior-leaders.html`. Keep while its candidate destination remains. |
| `executive-career-support-saudi-arabia.html` | KEEP | Candidate market alias to `/markets/executive-career-support-saudi-arabia.html`. Keep while its candidate destination remains. |
| `executive-hiring-fintech.html` | RETIRE | Employer industry alias to `/industries/executive-hiring-fintech.html`; retire or redirect only to a genuinely relevant candidate resource if one is approved. |
| `executive-job-search-dubai.html` | KEEP | Candidate market alias to `/markets/executive-job-search-dubai.html`. |
| `executive-job-search-uae.html` | KEEP | Candidate market alias to `/markets/executive-job-search-uae.html`. |
| `executive-negotiation-support.html` | KEEP | Candidate-service alias to `/services/executive-negotiation-support.html`. |
| `executive-resume-strategy.html` | KEEP | Candidate-service alias to `/services/executive-resume-strategy.html`. |
| `executive-search-chros.html` | RETIRE | Employer role alias to `/roles/executive-search-chros.html`; no candidate replacement assumed. |
| `executive-search-europe.html` | RETIRE | Employer market alias to `/markets/executive-search-europe.html`; no homepage redirect. |
| `executive-search-north-america.html` | RETIRE | Employer market alias to `/markets/executive-search-north-america.html`; no homepage redirect. |
| `executive-search-saas-leaders.html` | RETIRE | Employer industry alias to `/industries/executive-search-saas-leaders.html`; no candidate replacement assumed. |
| `executive-search-support.html` | RETIRE | Employer service alias to `/services/executive-search-support.html`; preserve an appropriate not-found or relevant replacement outcome. |
| `healthcare-executive-search.html` | RETIRE | Employer industry alias to `/industries/healthcare-executive-search.html`; no candidate replacement assumed. |
| `interview-coaching-executives.html` | KEEP | Candidate-service alias to `/services/interview-coaching-executives.html`. |
| `leadership-hiring-gcc.html` | RETIRE | Employer market alias to `/markets/leadership-hiring-gcc.html`; no homepage redirect. |
| `linkedin-optimization-executives.html` | KEEP | Candidate-service alias to `/services/linkedin-optimization-executives.html`. |
| `reverse-recruiting-cfos.html` | KEEP | Candidate role alias to `/roles/reverse-recruiting-cfos.html`. |
| `reverse-recruiting-cmos.html` | KEEP | Candidate role alias to `/roles/reverse-recruiting-cmos.html`. |
| `reverse-recruiting-ctos.html` | KEEP | Candidate role alias to `/roles/reverse-recruiting-ctos.html`. |
| `reverse-recruiting.html` | KEEP | Candidate-service alias to `/services/reverse-recruiting.html`. |

### 3.3 Account and operations pages (3 root files; not in sitemap)

| File | Disposition | Reason and dependency/risk |
|---|---|---|
| `account.html` | REVIEW | Contains candidate and employer registration tabs, login, account and subscription billing. Keep the candidate account path available; decide whether to retain employer accounts for existing users/data before changing role choices, API behavior, or billing. |
| `profiles.html` | REVIEW | `noindex` candidate directory visible to authenticated, verified employers. This is part of the employer product, not a public SEO page. Decide whether it is to be retired, retained for existing employer obligations, or transformed before changing its route/API. |
| `toba.html` | KEEP | Protected operations console, not a public marketing page. Preserve administrator operations and verify its reports/data sources remain correct if business products change. |

### 3.4 Generated SEO landing pages (60 files)

These pages are generated from `data/seo-pages.json` and `data/seo-pages-additions.json` by `scripts/generate-seo-pages.js`. The listed HTML output and source record are both in scope; do not hand-edit generated HTML without updating its source and generation workflow.

#### Services (10)

| File | Disposition | Reason |
|---|---|---|
| `services/career-strategy-senior-leaders.html` | EDIT | Candidate service exists; update audience breadth, standalone availability, scope and metadata. |
| `services/executive-career-representation.html` | EDIT | Candidate service; align with the single primary Private Career Representation offer and avoid duplicating it in the standalone catalogue. |
| `services/executive-job-search-support.html` | EDIT | Candidate search execution; distinguish it from the named primary service and specify only confirmed scope. |
| `services/executive-negotiation-support.html` | EDIT | Candidate service; confirm whether standalone and revise executive-only positioning. |
| `services/executive-resume-strategy.html` | EDIT | Candidate résumé service; broaden audience only as supported and distinguish standalone purchase from representation inclusion. |
| `services/executive-search-support.html` | RETIRE | Employer-side search service. Remove from public marketing. |
| `services/global-talent-sourcing.html` | RETIRE | Employer-side sourcing service. Remove from public marketing. |
| `services/interview-coaching-executives.html` | EDIT | Candidate interview preparation exists; confirm standalone coaching format/scope and broaden appropriately. |
| `services/linkedin-optimization-executives.html` | EDIT | Candidate LinkedIn optimization exists; confirm standalone deliverables and broader audience. |
| `services/reverse-recruiting.html` | EDIT | Candidate representation; consolidate terminology and links with the primary service rather than presenting representation as an individual-service catalogue item. |

#### Markets (12)

| File | Disposition | Reason |
|---|---|---|
| `markets/executive-career-support-australia.html` | EDIT | Candidate market page; make audience inclusive and substantiate practical coverage/authorization caveats. |
| `markets/executive-career-support-saudi-arabia.html` | EDIT | Candidate market page; confirm scope and use accurate local-market and work-authorization caveats. |
| `markets/executive-job-search-africa.html` | EDIT | Candidate market page; specify relevant markets rather than imply uniform continent-wide service. |
| `markets/executive-job-search-dubai.html` | EDIT | Candidate market page; revise audience and substantiate coverage statements. |
| `markets/executive-job-search-london.html` | EDIT | Candidate market page; revise audience and confirm geographic scope. |
| `markets/executive-job-search-uae.html` | EDIT | Candidate market page; revise audience and confirm geographic scope. |
| `markets/executive-search-europe.html` | RETIRE | Describes employer talent sourcing/search across Europe. |
| `markets/executive-search-middle-east.html` | RETIRE | Describes employer-oriented executive search/approved outreach. |
| `markets/executive-search-north-america.html` | RETIRE | Explicit employer talent sourcing page. |
| `markets/executive-search-singapore.html` | RETIRE | Describes employer executive-search briefs and outreach. |
| `markets/executive-talent-sourcing-uk.html` | RETIRE | Explicit employer talent-sourcing page. |
| `markets/leadership-hiring-gcc.html` | RETIRE | Explicit organizational leadership-hiring/talent-sourcing page. |

#### Roles (12)

| File | Disposition | Reason |
|---|---|---|
| `roles/board-level-career-transition.html` | EDIT | Candidate career transition page; retain with evidence-based scope and no assumed board outcomes. |
| `roles/career-coaching-founders-partners.html` | EDIT | Candidate coaching/strategy page; confirm standalone coaching offer, eligibility and deliverables. |
| `roles/career-representation-coos.html` | EDIT | Candidate representation page; make clear it is the primary managed service, not a standalone catalogue item. |
| `roles/executive-job-search-vps.html` | EDIT | Candidate job-search page; align with primary service and avoid implying guaranteed access/results. |
| `roles/executive-search-chros.html` | RETIRE | Employer-side CHRO search page. |
| `roles/executive-search-managing-directors.html` | RETIRE | Employer-side managing-director search page. |
| `roles/reverse-recruiting-ceos.html` | EDIT | Candidate representation page; align to Private Career Representation and confirm role-specific value. |
| `roles/reverse-recruiting-cfos.html` | EDIT | Candidate representation page; align to primary service and preserve its legacy alias. |
| `roles/reverse-recruiting-cmos.html` | EDIT | Candidate representation page; align to primary service and preserve its legacy alias. |
| `roles/reverse-recruiting-ctos.html` | EDIT | Candidate representation page; align to primary service and preserve its legacy alias. |
| `roles/senior-executive-resume-strategy.html` | EDIT | Candidate résumé page; ensure it complements, rather than duplicates, the standalone résumé service. |
| `roles/senior-leader-career-strategy.html` | EDIT | Candidate strategy page; broaden appropriately and distinguish it from representation and coaching. |

#### Industries (12)

All are currently employer-oriented industry-hiring/search pages and are proposed for retirement from public marketing. Do not delete source material or redirects until internal-link and URL decisions are approved.

| File | Disposition | Reason |
|---|---|---|
| `industries/consumer-retail-leadership-hiring.html` | RETIRE | Employer leadership hiring. |
| `industries/education-edtech-executive-search.html` | RETIRE | Employer executive search. |
| `industries/energy-executive-search.html` | RETIRE | Employer executive search. |
| `industries/executive-hiring-fintech.html` | RETIRE | Employer fintech hiring; root legacy alias also exists. |
| `industries/executive-search-private-equity.html` | RETIRE | Employer/portfolio-company executive search. |
| `industries/executive-search-saas-leaders.html` | RETIRE | Employer SaaS talent sourcing; root legacy alias also exists. |
| `industries/finance-banking-executive-search.html` | RETIRE | Employer finance/banking search. |
| `industries/healthcare-executive-search.html` | RETIRE | Employer healthcare sourcing; root legacy alias also exists. |
| `industries/legal-executive-search.html` | RETIRE | Employer legal-leadership search. |
| `industries/manufacturing-industrial-executive-search.html` | RETIRE | Employer industrial search. |
| `industries/real-estate-executive-search.html` | RETIRE | Employer real-estate leadership search. |
| `industries/technology-leadership-hiring.html` | RETIRE | Employer technology hiring. |

#### Resources (14)

| File | Disposition | Reason |
|---|---|---|
| `resources/anonymous-executive-reviews.html` | REVIEW | Verify that any review source, consent, and anonymity claims are documented and authorized. |
| `resources/book-confidential-consultation.html` | EDIT | Retain candidate inquiry path; remove employer-service framing and align with actual inquiry workflow. |
| `resources/candidate-success-stories.html` | REVIEW | Verify every claimed outcome and consent; retain only evidence-supported, authorized content. |
| `resources/case-studies.html` | REVIEW | Current description mixes candidate search and employer research; retain only authorized candidate examples or recast as clearly illustrative process material. |
| `resources/client-hiring-results.html` | RETIRE | Employer hiring-results page and associated SEO intent. |
| `resources/contact-kov.html` | EDIT | Candidate contact route; align copy and metadata with the current API-backed inquiry form. |
| `resources/executive-career-outcomes.html` | EDIT | Candidate-facing outcomes explainer; retain honest limitations and update audience language. |
| `resources/executive-job-search-in-your-market.html` | EDIT | Candidate resource; align links with the retained candidate market inventory. |
| `resources/kov-founder-profile.html` | EDIT | Retain founder context; remove dual-practice language and verify credentials/claims. |
| `resources/request-executive-career-representation.html` | EDIT | Retain as a candidate inquiry path for the primary service; confirm the route still uses the supported contact workflow. |
| `resources/request-executive-search-support.html` | RETIRE | Employer-service request page. |
| `resources/request-global-talent-sourcing.html` | RETIRE | Employer-service request page. |
| `resources/salary-offer-negotiation-guide.html` | EDIT | Candidate resource; keep useful guidance while preserving the boundary that KOV is not legal, tax, or financial counsel. |
| `resources/why-kov-approach.html` | EDIT | Rewrite the two-practice explanation for a candidate-only approach. |

### 3.5 Protected publishing page (1 file)

| File | Disposition | Reason and dependency/risk |
|---|---|---|
| `.private_admin/blogpostcheck.html` | KEEP | Protected editor served only after administrator authentication. It is not a public marketing page; retain as an internal publishing tool unless a separate operations decision changes it. |

## 4. Candidate service structure audit

The future information architecture should have two visibly separate service areas. Representation must not appear as a catalogue item under Individual Career Services.

### Primary service: Private Career Representation

**Existing candidate-facing material:** `candidate-services.html`; `services/reverse-recruiting.html`; `services/executive-career-representation.html`; `services/executive-job-search-support.html`; candidate role and market pages; `candidate-proof.html`; process/FAQ content.

**Audit conclusion:** There is substantial material for a managed candidate search. Consolidate naming and describe a candidate-approved process: discovery/assessment, role and market focus, professional positioning, opportunity research, applications/outreach only as agreed, tracking/follow-up, interview preparation and offer support if in scope. Keep scope, client decisions, confidentiality boundaries, deliverables, fees, and outcomes explicit. The precise service agreement controls what is actually included.

### Secondary service area: Individual Career Services

| Catalogue category | Existing evidence in the site | Gap / confirmation needed |
|---|---|---|
| Résumé/CV development | Executive résumé-strategy pages; résumé positioning is mentioned in candidate services. | No verified offer for graduate/general CVs, rebuilding, ATS parsing/format checks, keyword research, tailored versions, document formats, or a standalone purchase path. Confirm which products, deliverables, audience levels, and format are offered. |
| LinkedIn optimization | Executive LinkedIn optimization page and candidate-positioning copy. | Confirm whether keyword/headline/About/experience/banner/document/job-alert options are individually available, and what is actually delivered or edited. |
| Career documents | Cover letter and supporting-document work is mentioned only as part of broader candidate positioning/materials. | No distinct catalogue page or confirmed standalone deliverables for cover letters, biographies, executive summaries, or supporting documents. |
| Professional portfolios | No dedicated page or verified catalogue offer found. | Requires a service decision, process, format, work-sample authorization, and deliverable definition. |
| Personal career websites | No dedicated page or verified catalogue offer found. | Requires confirmation of design/build scope, page count, hosting/domain, maintenance, and technical capability before any promise. |
| Career optimization | Career strategy/positioning pages exist for senior leaders. | Distinguish an individual profile/document optimization service from overall strategy and from full representation; confirm audience, assessment, and outputs. |
| Career coaching | Interview coaching exists; coaching/strategy appears for founders and partners. | Confirm whether standalone one-to-one coaching is offered, including topics, format, qualifications, session length/count, and deliverables. Do not invent them. |

The current account supports candidate registration and candidate subscription billing, but it does not establish a seven-category service shop or separate checkout for each one-off deliverable. `contact.html` provides an inquiry route with a persisted backend submission and email fallback. Therefore “independently purchasable” needs a decision: inquiry/quotation is supported; a true catalogue checkout/order flow was not established by this audit.

## 5. Cross-cutting feature and file disposition

| Surface / files | Disposition | Audit finding and implementation dependency |
|---|---|---|
| Shared navigation: `assets/audience-nav.js`; root header markup in public HTML | EDIT | Adds both candidate and company links at runtime. Removing employer links in static markup alone will not remove injected links. Retain candidate links/account access and test all page depths. |
| Shared footer: `assets/uniform-footer.js`, footer markup across pages | EDIT | Replaces/augments footer and injects a “For Companies” group plus all-60-page catalog. Update labels/links and catalog after SEO-page disposition. |
| Homepage interactions: `assets/homepage-interactions.js`, `assets/homepage-decision-sections.js`, `assets/homepage-decision-sections.css`, `assets/reactive-visuals.js` | EDIT | Inject candidate/company tabs, two-practice messaging, and an interview-guarantee visual matched by heading. Update/remove employer panels and replace claim-dependent selectors/art; preserve keyboard/ARIA/reduced-motion behavior. |
| Two-sided content: `assets/two-sided.js`, `assets/two-sided.css`, `assets/two-sided-type.css`, `assets/phase1-refinement.css` | EDIT | Candidate process/diagrams are useful; scripts also inject company/network messaging. Retain candidate process and responsive menu, remove employer-only additions, and verify the user-flow after copy changes. |
| SEO generator: `scripts/generate-seo-pages.js` | EDIT | Generates all categorized pages and supplies related links/audience labels. It hardcodes category counts, audience inference and candidate/company related links; adjust together with data, HTML output, sitemap and validator. |
| SEO inputs/output: `data/seo-pages.json`, `data/seo-pages-additions.json`, `services/`, `markets/`, `roles/`, `industries/`, `resources/` | EDIT | 60 records and 60 generated pages, with employer intent and mixed pages. Source data—not just rendered output—must be revised; regenerate and inspect page-by-page. |
| Search index: `scripts/build-site-search-index.py`, `assets/site-search-index.js`, `assets/site-search.js` | EDIT | Generated from sitemap-visible text and candidate/company proof arrays. Rebuild after dispositions and remove retired page/proof content from index while preserving search functionality. |
| SEO discovery: `sitemap.xml`, `robots.txt`, `llms.txt`, `validate_schema.py` | EDIT | Sitemap contains 77 URLs; `llms.txt` advertises company offerings and descriptions. Robots allows general crawling and disallows dashboard/backup paths. Validator hardcodes 60 category pages, so it must reflect the approved remaining inventory rather than silently fail or preserve retired pages. |
| Metadata/structured data in HTML and generator | EDIT | Sitemap pages currently pass validation, but organization/service descriptions repeatedly say the company provides executive sourcing; root pages include `EmploymentAgency` organization type. Reconcile descriptions, Service/FAQ/Breadcrumb/Page schema, canonicals and visible content. Confirm the most accurate Schema.org type rather than guessing. |
| Proof data: `assets/proof-library-data.js`, `assets/proof-library.js`, `assets/proof-library.css`, `assets/proof-library-overrides.css`, candidate/company proof pages | REVIEW | Candidate/company scenario data is consumed by page UI and search index. Verify real evidence and permission; remove employer dataset from public output only after preserving any approved internal need. |
| Public testimonials/reviews: `blog.html`, `posts/*.json`, `resources/*reviews*`, `resources/candidate-success-stories.html` | REVIEW | Several anonymous review excerpts make specific, persuasive outcome claims. Verify provenance, consent, anonymity, identity/role/location risk, and support; remove or neutralize unsupported claims. |
| Individual blog review records: `posts/anonymous-chro-cross-border-germany-2026-10-09.json`, `posts/anonymous-coo-australia-2026-10-04.json`, `posts/anonymous-executive-review-cross-border-germany-2026-08-10.json`, `posts/anonymous-executive-review-head-marketing-2026-05-10.json`, `posts/anonymous-head-marketing-north-america-2026-05-14.json`, `posts/anonymous-legal-executive-ksa-2026-10-08.json` | REVIEW | Each is a separate published review record; verify its source, consent, claims, and anonymization before retaining or linking it. |
| Contact workflow: `assets/contact-form.js`, contact bundle and `contact.html`, `backend_api.py` `/api/contact`, contact tests | EDIT | The form posts candidate/employer audience and organization data; API persists submissions, rate-limits and tests invalid input. Candidate-only UX must be coordinated with API model, database retention, mailto fallback, and privacy text; do not break current candidate submissions. |
| Account/API and directory: `account.html`, `assets/account-api.js`, `profiles.html`, `backend_api.py`, `supabase/migrations/202610110001_backend_foundation.sql`, `server.py` | REVIEW | Employer and candidate auth/provisioning, employer directory, subscriptions/invoices, and candidate data coexist. Keep security and existing candidate functionality; decide how employer users/records, account registration, subscriptions and any outstanding obligations are treated before decommissioning APIs or database features. |
| Internal admin/publishing: `toba.html`, `.private_admin/blogpostcheck.html`, `assets/blog-cms.js`, blog workflow | KEEP / REVIEW content | Keep protected operations and publishing mechanisms. Review the public blog content separately. Maintain the server-side access boundary; robots directives alone are not access control. |
| Pricing/billing: `pricing.html`, `assets/pricing-CKwFeBsv.js`, `account.html`, API/backend, migration, `docs/architecture/backend-architecture.md` | REVIEW | Page markets employer $15/month directory access, success-fee/warranty terms, and candidate onboarding/retainer. Backend includes candidate/employer payment concepts with billing configuration gates. Confirm product terms and legal/financial obligations before removing or changing them. |
| Privacy and data handling: `privacy.html`, account/contact APIs, backend architecture/migration | REVIEW | Public disclosures and stored records cover both audiences. Candidate-only marketing does not by itself authorize deleting existing employer records or changing retention/deletion obligations. |
| CSS: `assets/styles-DateywTe.css`, `site-fixes.css`, `seo-pages.css`, `backend-pages.css`, `two-sided*.css`, `homepage-decision-sections.css`, `proof-library*.css`, `phase1-refinement.css` | EDIT / KEEP selectively | Preserve working layouts, responsive styles, focus, and reduced motion. Reuse candidate-relevant styles; avoid a redesign. Remove dead employer-only styling only after reference checks. Audit contrast/visual regressions after the content shifts. |
| Illustrations/photos: `kov-global-talent-map*.svg`, `kov-research-layer*.svg`, `kov-global-grid.svg`, `kov-executive-intelligence-network*.svg`, `kov-intelligence-grid.svg`, `kov-editorial-grid.svg`, `kov-service-*.svg`, `kov-search-grid.svg`, `kov-backend-journey.svg`, `assets/people/*`, root image assets, `assets/ASSET-SOURCES.md` | REVIEW / reuse selectively | Candidate search diagrams can remain. Company maps/research graphics may imply a discontinued service and should be retired from public use only after reference checks. Preserve asset source/licensing notes; review alt text, logos, and missing homepage images. |
| Contact/navigation helper scripts: `assets/country-codes.js`, `assets/google-translate.js`, `assets/page-section-enhancements.js`, `assets/service-faq.js` | KEEP / EDIT selectively | Retain unrelated controls. Review generated FAQ content because it includes employer questions, and retest scripts against revised page headings and forms. |
| Referenced public JavaScript modules (16 unique): `assets/audience-nav.js`, `assets/blog-cms.js`, `assets/contact-form.js`, `assets/country-codes.js`, `assets/google-translate.js`, `assets/homepage-decision-sections.js`, `assets/homepage-interactions.js`, `assets/page-section-enhancements.js`, `assets/proof-library.js`, `assets/proof-library-data.js`, `assets/reactive-visuals.js`, `assets/service-faq.js`, `assets/site-search.js`, `assets/site-search-index.js`, `assets/two-sided.js`, `assets/uniform-footer.js` | KEEP / EDIT by function | All 16 are loaded by at least one HTML page. Navigation, footer, homepage switchers, FAQs, proof data, and search have candidate/company content dependencies; preserve blog, country-code, translation, and unrelated interactions. |
| Backend tests: `tests/test_backend_api.py`; no frontend test suite found | EDIT tests after approved code changes | Current tests cover candidate and employer behavior, contact persistence, access controls and billing. Add/adjust assertions only after the product decision; preserve candidate authorization, privacy, transaction and payment guardrails. |
| Backend deployment/config: `vercel.json`, `server.py`, `backend_api.py`, SQL migration, `requirements.txt` | REVIEW | `vercel.json` routes all requests to `server.py`; browser stubs currently implement redirects. Verify live routing before permanent URL decisions. Retiring public services does not automatically justify removing API or database functionality. |

### Company-facing references found outside the principal company pages

- Homepage document title, meta/social descriptions, visible hero/scroll sections, press/media logo strip and company-oriented imagery/industry references, company CTA, two-audience tabs, and claims injected by JavaScript.
- Main and mobile navigation, generated page navigation, audience footer, uniform footer, and the 60-page related-page/footer catalog.
- Root `services`, `how-it-works`, `pricing`, `faqs`, `about`, `contact`, `countries`, `glossary`, and `why-kov` content, metadata, or structured data.
- Generated employer pages in services, markets, roles, all 12 industries, and employer-resource pages; their source JSON and static HTML outputs.
- The site-search catalog/content and company proof rows/profile records.
- `llms.txt`, sitemap entries, candidate/contact API audience fields, company account registration, employer directory, employer subscription/invoice/payment paths, privacy text, SQL schema, backend docs, and tests.
- Employer-oriented diagram assets and image captions.

`rg` checks confirmed company-facing references across these surfaces. They do not by themselves establish a complete proof of every mention in arbitrary binary/image metadata; no image OCR or production crawl was performed.

## 6. SEO, redirects, claims, and accessibility findings

### SEO and URL inventory

- `validate_schema.py` reports **77 sitemap URLs**, **60 generated landing pages**, **78 parsed JSON-LD blocks**, **77 search-indexed pages**, and **one robots sitemap directive**; validation passes.
- Every sitemap URL was independently mapped to an existing local HTML file: **77 checked, 0 missing**.
- The sitemap includes all 60 generated pages and 17 root public URLs. Account, directory, admin and redirect stubs are not sitemap entries.
- Generated landing pages use canonical URLs, title/descriptions, social metadata, JSON-LD, FAQs, links, and sitemap/search/`llms.txt` coverage. This is technical implementation evidence, not ranking or indexation evidence.
- `llms.txt` currently describes the two-practice model and advertises employer pages. Update it only after URL/product decisions.
- `robots.txt` currently allows crawling generally and disallows `/blogpostcheck.html` and backup files. The private editor is protected by the server; robots is only crawler guidance.
- Root legacy aliases use browser refresh/JavaScript, not a demonstrated HTTP 301. The current Vercel configuration forwards requests to `server.py`; no live redirect response was tested. Use a relevant permanent redirect where hosting supports it, or a deliberate 404/410 where no replacement exists. Never bulk-redirect unrelated removed pages to `/`.

### Claims, prices and evidence

The source includes:

- Homepage claims including interviews in 2–3 weeks, nine interviews within 90 days, and 50–100 targeted applications weekly.
- Blog testimonial text claiming 50–100 applications weekly and other specific candidate outcomes.
- Company-side statements about sourcing success rates and typical 3–4 week sourcing timelines.
- Candidate and employer pricing statements, including candidate registration, employer monthly fees, success fees, a placement warranty, onboarding charges, and retainers.
- A protected operations page and API endpoint calculating placement success metrics.

These claims are **not declared false** by this source audit. They require business-owned evidence, authorization, scope/period definitions, and/or contractual support. The approved strategy says unsupported claims should be removed or accurately reframed; outcome and volume guarantees should not be retained merely because a page elsewhere disclaims a guarantee.

### Accessibility/design

Existing HTML/CSS/JS shows responsive page families, labelled forms, visible focus, live status regions, keyboard-operated tabs/dialogs, and reduced-motion styling. The audit did not run automated accessibility or contrast tooling, keyboard/screen-reader checks, or responsive browser regression. Preserve these existing behaviors and perform targeted manual/browser QA after copy changes. The homepage currently references missing local `download (27).png` and `download (28).png`; verify whether those logos are authorized, remove the references, or supply approved assets during implementation.

## 7. Checks completed and actual results

| Check | Result |
|---|---|
| Enumerated HTML files excluding `.venv` and caches | 101 total. |
| Current sitemap parsed and counted | 77 URLs: 17 root + 60 categorized pages. |
| Sitemap-to-file mapping | 77 checked; 0 missing files. |
| `python validate_schema.py` using `.venv` Python 3.14.6 | **PASS**: 77 sitemap URLs, 60 generated pages, 78 JSON-LD blocks, 77 search-index pages, one robots sitemap directive. |
| `python -m unittest tests.test_backend_api -v` | **PASS**: 43 tests passed in 4.507 seconds. One non-failing Starlette deprecation warning notes the current `httpx` TestClient integration. |
| Static local `href`/`src` scan across all HTML | 101 files and 14,250 local references checked; 8 unresolved checks: two absent homepage image filenames, each referenced twice, and four path-relative checks from the protected editor that resolve at the root URL it is served on. |
| External Google ranking/GEO evidence | Not checked; no ranking, indexing, analytics, or Search Console/Bing data was available in this read-only repository audit. |

The SEO generator and search-index builder were inspected but not run because they write website output files, which this task expressly prohibits.
