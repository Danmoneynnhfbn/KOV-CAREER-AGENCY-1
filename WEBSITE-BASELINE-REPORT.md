# KOV Career Agency — Website Baseline

**Evidence date:** 12 October 2026  
**Scope:** Repository source, existing documentation and tests, SEO validation, and the browser previews available during this review. This is a baseline inventory, not a penetration test, legal review, accessibility certification, or search-performance audit.

## Executive summary

KOV is a founder-led executive-career and talent-sourcing website with two deliberately distinct audiences: senior professionals seeking career representation and employers seeking executive talent research/sourcing. The public experience is predominantly pre-rendered HTML with shared CSS and JavaScript enhancements. It contains a substantial, cross-linked content library, and a separate FastAPI/Supabase account and operations foundation.

The repository contains **101 HTML files**. The sitemap exposes **76 public URLs**: 16 main/root pages and 60 category landing pages (10 services, 12 markets, 12 roles, 12 industries, and 14 resources). The other files include account/operations pages, an unlisted publishing console, a duplicate about-page copy, and 20 old root-level URLs that redirect to the newer category paths.

Strong evidence of completed work:

- The public pages have a systematic metadata/schema foundation. `validate_schema.py` passes: all 76 sitemap URLs resolve to local files, have matching canonicals and descriptions, and include parseable JSON-LD; the validator also confirms `llms.txt` coverage and 60 generated landing pages.
- The backend test suite passes **32 of 32** tests. Those tests use local/mocked providers; they do not prove production services are configured.
- The account and admin flows have meaningful server-side authorization, request validation, database policies, and billing safeguards in source.
- Main navigation, audience-specific entry points, large internal topic directories, proof-library filters, accessible tab/carousel behavior, and responsive layouts are present.

Important boundaries:

- The public contact form hands information to the visitor's mail application. It does not submit a lead to a KOV API or persist one in a KOV database.
- The account/API code is a real implementation foundation, but the architecture documentation says no Supabase project, live credentials, migration execution, private storage bucket, or Stripe account is configured. In the local browser preview, account services report unavailable.
- The blog CMS is a separate GitHub REST workflow, not the account system. Its configured repository owner differs from the repository identity available for this workspace, and the local browser preview reports that posts could not be fetched.
- No live analytics/search-verification integration or traffic/ranking data was found. Technical SEO implementation must not be read as evidence of search rankings or visits.

## Evidence and limits

Evidence used:

1. HTML, CSS, JavaScript, Python, SQL, JSON, YAML and Markdown in the repository.
2. `python validate_schema.py` — **passed**.
3. `python -m unittest tests.test_backend_api -v` — **32 tests passed**.
4. Browser previews: the candidate-services public URL rendered; the local account page displayed “Account services are currently unavailable”; the local blog dashboard displayed “Unable to load posts: Failed to fetch”.

The test run emitted a non-failing Starlette deprecation warning about its `httpx` TestClient integration. The local browser previews use a local static server, not a configured Vercel deployment with working provider credentials. Their API and GitHub fetch failures show that those flows were not available in that preview; they do not, by themselves, establish the state of a separately deployed production environment. No production database, account, payment, email, analytics, hosting-dashboard, or Search Console access was available. Tests that mock Stripe/Supabase verify code paths and contracts, not live transactions or provider configuration.

## A. What is already good

### Positioning and content

- **Two audiences are separated clearly.** The site gives candidates and employers different service pages, proof libraries, process language, and calls to action. The homepage and `why-kov.html` explain the connection without claiming that candidate representation and employer search are the same engagement.
- **The engagement caveats are unusually explicit.** Service and generated landing-page copy repeatedly says that scope, fees, approvals and deliverables are agreed before work begins; employers retain hiring decisions; and outcomes/timelines are not guaranteed. This helps set expectations.
- **Content is organized by intent.** The site combines main service/process pages with location, role, industry, resource, proof and glossary pages. The 60-page generation data gives each page a page-specific title, description, heading, audience, topics, FAQ and related links rather than using one undifferentiated page.
- **Proof pages label examples as illustrative.** Candidate/company proof-library content is presented as anonymized or illustrative process material, not as independently verified placement data. This distinction protects reader understanding better than presenting fabricated client records as verified outcomes.
- **The homepage gives visitors a clear next step.** It introduces the agency, its two practices, what services do, the six-stage candidate process, client voice and audience-specific paths, then links into service details and contact.

### Layout, navigation and reusable interactions

- **Shared branded header and footer.** The principal pages use the KOV mark, sticky desktop header, clear primary links, an emphasized contact CTA, and a mobile menu. `audience-nav.js` adds candidate/company links, an account link and a two-audience footer directory where the corresponding page structure exists.
- **Topic navigation is deep but grouped.** The generated landing pages provide a “Browse all 60 pages” menu and grouped footer links. The main footer enhancements group page categories so visitors can move between related topics rather than encountering an unstructured list.
- **The homepage has useful progressive enhancements.** `homepage-decision-sections.js` creates keyboard-operable tabs for candidate/company choices and search-stage explanations and enhances the client-review carousel. The page's substantive content is already present in HTML, so the page is not just an empty JavaScript mount point.
- **The proof library has practical controls.** Visitors can filter candidate/company examples by category and country, open a detail dialog, close it with Escape, and return focus to the record they opened. Text inserted into dynamic cards/dialogs is escaped.
- **Responsive behavior is present in the actual styles.** Desktop navigation gives way to a mobile menu; grid layouts collapse; illustrations have mobile SVG variants; the blog review card changes arrangement on narrow screens; and CSS includes reduced-motion rules.
- **Good semantic/accessibility details recur.** Pages use headings, labelled navigation and form inputs, alt text, visible keyboard focus styles, live status regions for account/admin feedback, tab roles/selection states, button labels, a semantic `details`/`summary` mobile menu on generated pages, and `prefers-reduced-motion` handling in interactive visuals.

### Technical and SEO foundations

- **Pre-rendered pages and a static content surface.** Visitors and crawlers receive actual HTML files; the 60 category pages are generated into static files, rather than requiring client-side search or a database before their main content exists.
- **A shared SEO page generator reduces omissions.** `scripts/generate-seo-pages.js` produces page-specific metadata, canonical links, social cards, navigation, page sections, FAQs, related links and structured data from JSON data. It also checks the expected count per category and rejects unknown related-page links.
- **The validator checks consistency, not just presence.** It verifies sitemap/file alignment, unique canonicals, schema JSON parsing, organization/founder linkage, visible FAQ data when FAQPage schema is used, and `llms.txt` references. It currently passes.
- **Useful cross-page indexing assets exist.** `robots.txt`, `sitemap.xml`, `llms.txt`, and a JavaScript search index are present. `validate_schema.py` reports all 76 sitemap pages in the search index.
- **Original diagrams are documented.** `assets/ASSET-SOURCES.md` records purpose-built SVG network/map/research graphics and why they are used. Several illustrations also have mobile variants. This offers branded visuals without relying entirely on generic stock imagery.
- **Backend controls are designed to fail closed.** The API requires provider configuration, uses server-side service credentials, authenticates access tokens, loads roles from the database, checks origin on sensitive mutations, keeps session tokens in HttpOnly cookies, gates candidate-directory access, verifies Stripe signatures, and includes idempotent checkout/webhook paths.
- **Database protections are substantial in the migration.** The SQL creates separated public/private candidate data, memberships, roles, RLS policies, constrained status values, private CV storage policies, column-level grants and service-role-only provisioning functions. These are implementation assets; they still require a real Supabase deployment to validate.

### Appropriate caution around claimed outcomes

The public site includes concrete promotional figures and statements (for example, application volumes, interview cadence and job-search timing). Elsewhere it correctly says outcomes are not guaranteed. The figures may be compelling, but the repository does not itself substantiate them with auditable source data. Keep the distinction between marketing copy and verified performance clear.

## B. Every discovered page, in plain English

### Main public pages (16 sitemap entries at the root)

| Page | Purpose and visitor experience | Main sections / interactions and contribution |
|---|---|---|
| `index.html` | Introduces KOV and routes visitors to the candidate or employer practice. | Hero; agency advantages and differentiators; outcomes/process messaging; six-step candidate method; review carousel; two-practice model; interactive audience/search sections; calls to action and footer. Visitors can use desktop/mobile navigation, search, audience tabs, review controls and service/contact links. |
| `services.html` | Helps visitors choose the type of support they need. | Audience choice, service descriptions, candidate/employer paths and contact CTA. The content links to deeper service pages instead of forcing a visitor to infer scope from a single generic offering. |
| `global-talent-sourcer.html` | Explains KOV's employer-side sourcing practice. | Research-led sourcing proposition, market/talent visuals, what the employer engagement covers, audience navigation and routes to company service/contact pages. |
| `candidate-services.html` | Explains private reverse recruiting and career representation for senior professionals. | Candidate search challenges, one-agent/one-search model, deliverables, distinction from coaching, process and contact links. It describes candidate-side representation rather than employer recruitment. |
| `company-services.html` | Explains employer-side executive talent sourcing. | Role/market research, passive talent sourcing, deliverables and employer-focused calls to action. It is the counterpart to candidate services, with a different client and purpose. |
| `how-it-works.html` | Sets expectations for how a KOV engagement proceeds. | Lets visitors distinguish the candidate and company processes, outlines stages and links to fit/contact next steps. The homepage also presents the six candidate stages: audit, positioning, outreach/application execution, interview preparation, negotiation and close. |
| `pricing.html` | Explains how fees are approached. | States that fees depend on engagement scope and are agreed directly/in writing; provides candidate/company context and repeated contact options. It intentionally does not publish a general price table. |
| `faqs.html` | Answers common questions before a prospect contacts KOV. | Questions are grouped by engagement, process/timing, pricing, confidentiality and outcomes; the visitor can scan content and continue to contact or service pages. |
| `blog.html` | Hosts KOV articles and review/editorial content. | Static review excerpts and a featured-video area coexist with a GitHub-backed post list. Videos support playback controls and optional subtitles. The dynamic post list depends on the repository API configuration described in sections C/H. |
| `about.html` | Introduces founder Adekunle Ayotoba Daniel and the firm. | Founder credentials/approach, boutique/founder-led positioning, the two-practice model and contact links. `about - Copy.html` is a second root HTML copy, not a separate sitemap page. |
| `contact.html` | Starts an inquiry for a candidate, employer or other visitor. | Captures audience, name, email, optional phone, target role, salary range, LinkedIn and notes; includes direct email and service links. Submission opens the visitor's mail application; it does not POST to KOV or create a stored lead. |
| `candidate-proof.html` | Shows how candidate-side work can be structured. | Illustrative workflow and records; category/country filters; expandable records/dialogs; profile-style samples; service CTA. The data is explicitly illustrative, not independently validated client outcomes. |
| `company-proof.html` | Shows how employer-side talent research can be organized. | Research/mapping explanation, illustrative records and profiles, category/country filtering, detail dialog and service CTA. It complements candidate proof without conflating the two services. |
| `why-kov.html` | Explains the agency's differentiating model. | Candidate work vs company sourcing, how the two relate through research, founder-led approach and links into the two practice pages. |
| `countries-we-serve.html` | Helps visitors browse geographic coverage content. | Country/market navigation, related country-specific pages and market FAQs. The copy cautions that a page does not imply a local office or guaranteed coverage. |
| `glossary.html` | Defines reverse-recruiting, executive-search and career terms. | A reference collection of 71 plain-language terms that supports visitors unfamiliar with the vocabulary and links into related services/topics. |

The public pages share the KOV identity, main navigation, responsive behavior and cross-links. The generated category pages use a separate but branded header/footer treatment described below.

### The 60 category and long-tail pages

All 60 files use the same static landing-page structure generated by `scripts/generate-seo-pages.js`, with the content supplied by `data/seo-pages.json` and `data/seo-pages-additions.json`. Each renders a page-specific hero (audience eyebrow, H1, lead, introduction, illustration and CTA), three informational sections with bullets, an FAQ section, related links, a final contact CTA with scope caveat, primary/mobile navigation, and a five-category topic/footer directory. The links take visitors to the corresponding service/contact pages. There is no separate form on every landing page: the CTA routes to the shared contact page.

The template explains the general layout and interactions; the page-specific subject is indicated by each filename/title below:

- **Services (10):** `services/career-strategy-senior-leaders.html` (senior-leader career strategy); `services/executive-career-representation.html` (candidate representation); `services/executive-job-search-support.html` (coordinated search); `services/executive-negotiation-support.html` (offer evaluation); `services/executive-resume-strategy.html` (resume positioning); `services/executive-search-support.html` (employer search support); `services/global-talent-sourcing.html` (employer talent sourcing); `services/interview-coaching-executives.html` (interview preparation); `services/linkedin-optimization-executives.html` (executive profile positioning); `services/reverse-recruiting.html` (candidate-side reverse recruiting).
- **Markets (12):** `markets/executive-career-support-australia.html`; `markets/executive-career-support-saudi-arabia.html`; `markets/executive-job-search-africa.html`; `markets/executive-job-search-dubai.html`; `markets/executive-job-search-london.html`; `markets/executive-job-search-uae.html`; `markets/executive-search-europe.html`; `markets/executive-search-middle-east.html`; `markets/executive-search-north-america.html`; `markets/executive-search-singapore.html`; `markets/executive-talent-sourcing-uk.html`; `markets/leadership-hiring-gcc.html`. These pages explain regional job-search or talent-sourcing context, with practical location/role boundaries and no implication that KOV has a local office.
- **Roles (12):** `roles/board-level-career-transition.html`; `roles/career-coaching-founders-partners.html`; `roles/career-representation-coos.html`; `roles/executive-job-search-vps.html`; `roles/executive-search-chros.html`; `roles/executive-search-managing-directors.html`; `roles/reverse-recruiting-ceos.html`; `roles/reverse-recruiting-cfos.html`; `roles/reverse-recruiting-cmos.html`; `roles/reverse-recruiting-ctos.html`; `roles/senior-executive-resume-strategy.html`; `roles/senior-leader-career-strategy.html`. These specialize the service story for executive functions/seniority and direct visitors back to the appropriate practice.
- **Industries (12):** `industries/consumer-retail-leadership-hiring.html`; `industries/education-edtech-executive-search.html`; `industries/energy-executive-search.html`; `industries/executive-hiring-fintech.html`; `industries/executive-search-private-equity.html`; `industries/executive-search-saas-leaders.html`; `industries/finance-banking-executive-search.html`; `industries/healthcare-executive-search.html`; `industries/legal-executive-search.html`; `industries/manufacturing-industrial-executive-search.html`; `industries/real-estate-executive-search.html`; `industries/technology-leadership-hiring.html`. These frame employer sourcing around an industry-specific role brief and research context.
- **Resources (14):** `resources/anonymous-executive-reviews.html`; `resources/book-confidential-consultation.html`; `resources/candidate-success-stories.html`; `resources/case-studies.html`; `resources/client-hiring-results.html`; `resources/contact-kov.html`; `resources/executive-career-outcomes.html`; `resources/executive-job-search-in-your-market.html`; `resources/kov-founder-profile.html`; `resources/request-executive-career-representation.html`; `resources/request-executive-search-support.html`; `resources/request-global-talent-sourcing.html`; `resources/salary-offer-negotiation-guide.html`; `resources/why-kov-approach.html`. These provide consultation/contact routes, decision guides and proof-oriented topics. Proof-related copy distinguishes illustrative process material from verified client results.

### Operational, legacy and unlisted HTML files (25)

- `account.html` is a noindex account access page with sign-in, candidate registration, company registration, password reset/recovery and post-login billing surfaces. Its behavior is detailed in section D.
- `profiles.html` is a noindex employer-facing candidate directory shell; access is checked through the protected profiles API and requires an authenticated, verified employer with an active subscription.
- `toba.html` is a noindex private operations-console shell for admin candidate/employer review, introductions, invoices and summary metrics.
- `blogpostcheck.html` is the direct-URL blog publishing dashboard. `robots.txt` disallows it, but that is crawler guidance, not a login wall; publishing writes require a GitHub token.
- `about - Copy.html` duplicates the founder/about page content and is not listed in the sitemap.
- Twenty old root URLs (`career-strategy-senior-leaders.html`, `executive-career-support-saudi-arabia.html`, `executive-hiring-fintech.html`, `executive-job-search-dubai.html`, `executive-job-search-uae.html`, `executive-negotiation-support.html`, `executive-resume-strategy.html`, `executive-search-chros.html`, `executive-search-europe.html`, `executive-search-north-america.html`, `executive-search-saas-leaders.html`, `executive-search-support.html`, `healthcare-executive-search.html`, `interview-coaching-executives.html`, `leadership-hiring-gcc.html`, `linkedin-optimization-executives.html`, `reverse-recruiting-cfos.html`, `reverse-recruiting-cmos.html`, `reverse-recruiting-ctos.html` and `reverse-recruiting.html`) contain a meta refresh and JavaScript redirect to the corresponding new category URL, with a fallback link and canonical to the destination. This helps old links resolve, but it is a browser-level redirect rather than a configured HTTP 301/308 redirect.

## C. Complete functional ecosystem

### Public discovery and inquiry flow

1. A visitor lands on a static page (often the homepage or a service/market/role/industry page).
2. Internal navigation, the search index, topic directories, related-page links, proof pages and the glossary offer different ways to learn more.
3. Candidate and company pages route to the relevant service explanation.
4. CTAs route to `contact.html` or a mail link. The contact form packages fields into a `mailto:` message; the visitor's mail app must be available and the visitor must send the message. There is no KOV-side form endpoint, inbox integration, lead table or automatic lead notification in this form flow.
5. A separate `/account.html` route offers account registration. It is not required to view the public site.

### Static site and hosting

- `vercel.json` configures Vercel's Python runtime for `server.py`, includes site assets, routes `/api/*`, `/toba` and other paths to FastAPI.
- **Vercel deployment correction:** the previous `vercel.json` combined the legacy `builds` setting with the `functions` setting. Vercel disallows using these configuration modes together, and the failed Vercel check linked to its `conflicting-functions-and-builds-configuration` documentation. The asset `includeFiles` setting is now nested in the `server.py` Python builder config, retaining the existing Python build and routes while removing the conflict. This local configuration change still needs a new Vercel deployment to verify it resolves the dashboard's failed checks.
- `server.py` serves `/` from `index.html`, mounts `/assets`, exposes a status endpoint, serves `/profiles` and `/toba`, and serves permitted static extensions. It resolves paths and rejects paths outside the repository root.
- `requirements.txt` declares FastAPI, Uvicorn, Supabase, Resend and Stripe Python packages. There is no root `package.json`, frontend build script, or checked-in standard frontend bundler configuration. The public source is a mix of static HTML, compiled JavaScript bundles and handwritten JS/CSS; the exact reproducible frontend build pipeline is not present.
- A GitHub Actions workflow runs daily to delete expired JSON blog posts from the `main` branch. It is separate from account/CV cleanup.
- No production Vercel project settings, deployment run, CDN/cache configuration, or live domain routing were inspected. `vercel.json` demonstrates intended deployment wiring, not a successful production deployment.

### Blog publishing and GitHub

- `blog.html` and `assets/blog-cms.js` read post JSON from GitHub's public Contents API; posts are stored under `posts/`. Readers do not need an account.
- The unlisted `blogpostcheck.html` uses a browser-entered personal access token to create/update/delete JSON and upload media through GitHub API calls. The token is stored in `sessionStorage`, so it is not committed to the repository, but it remains accessible to JavaScript running in that browser tab.
- Media uploads are limited to 25 MB in the dashboard; video supports browser playback and optional WebVTT captions. Posts expire based on `expiresAt`/`publishedAt`; the scheduled GitHub workflow deletes expired JSON files.
- **Verified repository layout and configuration correction:** direct read-only GitHub inspection confirmed that `Danmoneynnhfbn/KOV-CAREER-AGENCY-1` contains the blog page and six post JSON files on `master`; `main` does not contain the blog page or `posts/`. The active public page, editor dashboard, and expiry workflow had instead named a misspelled owner and/or `main`. Those source settings and the CMS setup instructions have been aligned to the verified repository and `master` branch. A local browser test then successfully loaded all six posts on the public blog and in the editor dashboard without a GitHub token; this verifies read access from the local files, not a deployed site or authorized publishing. The earlier local dashboard “Failed to fetch” observation was not reproducible after correcting the target. The cleanup workflow exists in the workspace, but its presence or successful execution on GitHub Actions has not been verified.
- The CMS inserts saved `post.content` as HTML into the public page. The editor has formatting controls and the data is expected to come from trusted editors, but this is not a general-purpose sanitization boundary. The dashboard is “unlisted,” not authenticated; `robots.txt` disallowing it does not prevent a person who knows the URL from opening it.

### Account, database and admin flow

The intended flow is browser → FastAPI on Vercel → Supabase Auth and PostgreSQL/Storage. Roles and memberships are read from server-side records; account registration/provisioning uses server-side RPCs. The browser does not receive the service-role key. Supabase owns account/session and recovery email behavior. The account UI can show the authenticated role, subscription state and employer invoices.

The data model separates public candidate profile fields from private legal/contact/screening information, has company memberships and verification status, and tracks candidate vetting, introductions, invoices, subscriptions, CV metadata and audit events. The admin console loads protected API routes and submits review/verification/introduction/invoice actions. A candidate directory request is only returned for an employer membership that is verified and has an active current-period subscription.

### Payment and email

- Stripe checkout and webhook routes exist in backend code. Checkout is disabled unless `STRIPE_BILLING_ENABLED=true`; configured plan Price IDs are checked against active server-side plan amount/currency/interval; requests use idempotency reservations; webhook signatures are validated before a database RPC changes state.
- The account UI has candidate/employer subscription buttons and employer invoice payment links. Docs describe proposed candidate premium and employer monthly plans; these are not proof of approved commercial prices or active charges. Public pricing says fees are agreed individually, so the account subscription UX and public pricing language need business-owner confirmation before activation.
- Supabase Auth is the intended source of registration/recovery messages. `resend` is listed as a dependency, but a Resend mail flow was not found. No scheduling provider, calendar booking integration, SMS provider, or lead-notification integration was found.

### Analytics, tracking and external services

- The admin-only placement success metric is derived from introduction records; it is not web analytics.
- No Google Analytics/Tag Manager, tracking pixel, Plausible/PostHog script, Google/Bing site-verification token, or search-console integration was found in the inspected first-party code.
- External dependencies visible in source include Google Fonts, an Unsplash homepage image, GitHub's REST API for the blog, and Supabase/Stripe as intended backend providers. No evidence was found of a job-board feed or third-party scheduling system.

## D. Account-related functionality

| Feature | What exists and how it is meant to work | Status / verification |
|---|---|---|
| Candidate registration | Account tab captures identity, email, 12+ character password, title, summary, skills, target roles/industries/geography, objectives and privacy acknowledgement. FastAPI validates and provisions Auth plus candidate records. | UI, endpoint, migration and tests exist. Requires configured Supabase Auth/DB to complete; local preview says unavailable. |
| Company registration | Captures company name/email, password, website, description, hiring roles/industries/geography and privacy acknowledgement; provisions company and membership records. | UI, endpoint, migration and tests exist. Provider-backed operation unverified. |
| Sign-in | Password form posts to `/api/v1/auth/login`; server verifies with Supabase Auth and sets access/refresh cookies. | Code and tests exist; no production sign-in verified. |
| Session/refresh/logout | `assets/account-api.js` uses same-origin credentials and attempts refresh after a 401 for protected endpoints; backend sets HttpOnly, SameSite=Lax cookies and clears them on logout/failure. Secure-cookie behavior is enabled when running on Vercel or by explicit configuration. | Implemented and covered by focused tests; deployed cookie/domain settings unverified. |
| Email confirmation/recovery | Supabase Auth is intended to handle confirmation and recovery emails. The page has a reset-email button and handles provider redirect tokens; it removes the URL fragment before exchanging the session with FastAPI. A recovery session reveals the new-password form. | Flow is represented in UI/API and tests cover session/password contracts; actual Supabase templates, redirect allow-list and delivery are not configured/verified in repository evidence. |
| Password update | Authenticated update endpoint and a 12-character minimum form exist. | Implemented and tested at API-contract level; no live password change run. |
| Profiles/account settings | Registration stores candidate/employer data. A candidate profile read endpoint exists. The account page displays role and billing, but no complete self-service profile-edit/settings dashboard was found. | Partially implemented. |
| Candidate dashboard | No standalone private candidate workspace with search activity, applications, recruiter outreach or progress tracking was found. | Not found as a functioning UI. |
| Company dashboard | The account page can show subscriptions and eligible invoices; employer directory access exists separately. | Partial account/billing UI, not a full employer search-management dashboard. |
| Admin account/roles | `toba.html` is intended for verified administrators. Server-side role checks gate admin APIs; migration role values include candidate, employer and administrator. Admin provisioning is a trusted operator action, not a public self-promotion feature. | Code and tests exist; no real admin account verified. |
| Candidate directory | `profiles.html` calls protected `/api/v1/profiles`; server requires verified employer plus active employer subscription. | UI/API/migration exist; actual directory data/provider behavior unverified. |
| CV upload and access | Candidate API accepts PDF up to 10 MB, checks the `%PDF-` signature, records metadata and returns short-lived signed URLs for authorized requests. Migration intends a private storage bucket. | Backend/migration implementation exists. No upload control was found in the account UI; bucket and real storage policy are not configured/verified. |
| Billing/invoices | Account frontend can start subscriptions and pay employer invoices; admin can draft/issue invoices. Backend checks ownership, membership, plan and webhook state; migration holds billing records. | Source, migration and mocked tests exist. Stripe billing intentionally disabled without explicit configuration and live end-to-end validation. |
| Account deletion | No user-facing deletion control or account-deletion API was found. | Not implemented in the inspected surface. |

**Account-system conclusion:** an account system is present in source and is more than a mock-up, but it is an additive backend foundation, not a verified production service. Do not treat successful API unit tests as evidence that users can currently register, authenticate, upload files or pay in production.

## E. SEO assets and advantages

### Implemented and verified locally

- **Sitemap:** `sitemap.xml` contains 76 URLs, all of which map to local page files. The entries have `lastmod` values of 2026-10-12. It includes the 16 main pages and all 60 generated pages; private account/admin/publishing pages and old redirect stubs are not included.
- **Robots rules:** `robots.txt` allows general crawling, blocks `/blogpostcheck.html` and `.bak` files, and names the sitemap. This is crawler guidance, not access control.
- **Metadata:** each of the 76 sitemap pages has one canonical URL matching the sitemap URL, a meta description, Open Graph title, Twitter card, and `index,follow` directive. The validator passes these checks.
- **Structured data:** all sitemap pages have valid JSON-LD. The validator parses 77 blocks and checks the KOV organization/founder graph, page relationships and FAQ content. The generator adds `Service` entities for service/market/role/industry pages and page/breadcrumb entities; root pages include page-appropriate types. Schema validity does not guarantee rich-result display.
- **Canonical consolidation:** old flat URLs point to the nested-page canonical and redirect in the browser. The sitemap points only to the nested destinations.
- **Internal links:** root navigation, audience links, related pages, grouped topic menus, generated page footers, and the full-page search index cross-connect the 76 public URLs. The SEO validator confirms 76 search-index page entries.
- **Machine-readable content:** `llms.txt` describes the business and links to the primary service/market/role/industry/resource pages; the validator checks its sitemap URL coverage. It is a discoverability aid, not evidence of AI-search inclusion.
- **Image delivery:** the main logo is preloaded on key pages; the homepage preloads its hero image and preconnects to Google Fonts. Original diagrams are SVG; mobile variants and lazy-loaded interactive visual assets are used where implemented. Many image elements have dimensions/alt text, though no complete image-by-image accessibility/performance audit was run.
- **Crawl-friendly content:** primary copy and generated SEO page content are in static HTML, and the sitemap references pages that physically exist. This limits reliance on JavaScript for the core text and links.

### Not established

There is no repository evidence of search-engine rankings, click-throughs, impressions, indexed-page counts, conversion attribution, analytics, Search Console/Bing verification, or Core Web Vitals. Therefore, this report describes implementation advantages only; it does not claim traffic, rankings or AI visibility.

## F. Design system as implemented

The styles reflect a coherent editorial/career-agency direction—warm paper backgrounds, dark ink, orange accent, restrained typography and generous spacing—but there are multiple related token sets rather than one perfectly unified design system.

### Main public-site tokens

The compiled `assets/styles-DateywTe.css` defines, among others:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#090e13` | Main headline/brand ink |
| `--ink-soft` | `#1f242b` | Secondary dark text |
| `--cream` | `#f8f5ef` | Warm section backgrounds |
| `--line` | `#cdd1d6` | Borders/dividers |
| `--orange` | `#fc5c24` | Accent/CTA emphasis |
| `--background` | `#fcfaf6` in the light theme | Main paper background |
| `--foreground` | `#0e1217` in the light theme | Main body text |
| `--border` | `#d4d8dd` in the light theme | General border color |
| `--font-sans` / `--default-font-family` | Inter, system sans fallbacks | Body/UI text |
| `--font-display` | Fraunces, Georgia, serif | Editorial headings |
| `--spacing` | `.25rem` | Utility spacing scale |
| `--container-7xl` | `80rem` | Common wide content container |

The compiled theme also contains dark-theme color values; individual sections use dark backgrounds. Major public headings use responsive `clamp()` sizing, and utility classes commonly use 12–16px interface text with larger serif display headings.

### Related page-family tokens

- `assets/site-fixes.css` contains a second palette (`--kov-navy: #0e1b2b`, `--kov-ink: #101821`, `--kov-paper: #f6f1ea`, `--kov-brass: #b57b44`, `--kov-orange: #d76a2a`) used by refinements and directory/footer styles.
- `assets/seo-pages.css` uses `--seo-paper: #f7f4ee`, `--seo-white: #fcfbf8`, `--seo-ink: #111820`, `--seo-muted: #59636b`, `--seo-line: rgba(17,24,32,.13)`, and `--seo-orange: #c96b3c`. Its nav buttons are squared and uppercase, distinct from the rounder public-page CTAs.
- `assets/backend-pages.css` defines an intentionally different brown/green scheme: brown `#463629`, warm background `#fbf8f3`, line `#dfd1c1`, green `#315c43`, and orange `#a7491c`.
- Proof, two-sided-service and blog sections add further scoped colors, borders and shadows. Cards range from plain line cards through editorial shadow cards; this is often intentional page-family differentiation, but accent oranges and paper shades vary across CSS files.

### Responsive, typography and interaction rules

- Public layout uses utility-style responsive breakpoints such as `sm`, `lg`, plus explicit media queries including 540px, 680px and 767px in specialized styles. Backend grids collapse to a single column below 980px.
- Main public nav is sticky, 64px tall in the principal compiled layout, and switches to a mobile drawer/menu. Generated landing pages instead use a 76px-style header with a native `details` mobile menu.
- Layouts use grid/flex, a common wide container, and adaptive `clamp()` sizing. Interactive illustrations reposition hotspot coordinates on mobile.
- Focus-visible outlines, hover treatments, button state styles, reduced-motion overrides and `sr-only` utility support keyboard and assistive-technology use.

**Design assessment:** KOV's recognizable ingredients (logo, Inter/Fraunces, ink/paper/orange, editorial tone and clear CTA) recur across the site. The strongest consistency is in branding and information hierarchy; the main system, generated SEO family, proof pages and backend pages are not pixel-identical. Consolidating duplicated/scoped palettes and ensuring color contrast across all variants would be a reasonable later consistency/accessibility check, not a prerequisite to understanding the existing work.

## G. Code and technical decisions

- **Static-first public architecture:** the site has individual HTML files and compiled JS/CSS bundles. This makes core content directly renderable and supports simple hosting. A few source artifacts show React-rendered/hydrated pages and hashed bundles; handwritten enhancement scripts also operate directly on the DOM. There is no checked-in `package.json` or frontend build command, so the exact original bundling workflow cannot be reproduced from this repository alone.
- **FastAPI/Vercel backend:** `server.py` is the app entry point and `backend_api.py` mounts typed API routes. This reuses the existing Vercel Python runtime rather than replacing the website with a full server-rendered frontend. Public pages remain separate static assets.
- **Shared enhancements:** page files load discrete features such as `site-search.js`, `audience-nav.js`, `reactive-visuals.js`, homepage interactions, proof-library modules, country-code picker and CMS module. CSS is split between compiled utility styles and focused page-family styles.
- **Search/SEO page authoring:** five page families are fed by JSON and a Node generator. The generator validates page counts, escapes rendered text, resolves related routes and emits HTML/schema. Generated HTML and its source JSON are both checked in; keeping them synchronized requires running the generator when page data changes.
- **Application state:** public site has little cross-page state; widgets keep local UI state in JavaScript. Account state uses provider sessions in cookies, and blog editor token state uses tab session storage. Account API requests share a refresh helper.
- **Data retrieval/submission:** public page text is local HTML; generated-page data is build-time JSON; public blog reads GitHub at runtime; account/admin data is requested from FastAPI and intended Supabase; contact form goes to the local mail app; billing calls FastAPI then redirects to Stripe Checkout.
- **Configuration:** deployment routing is in `vercel.json`; dependencies are in `requirements.txt`; SQL migration is versioned in `supabase/migrations/`; environment-variable names and setup requirements are documented in `docs/architecture/backend-architecture.md`. No secrets are included in this report.
- **Validation:** `tests/test_backend_api.py` uses FastAPI's test client and mocks for provider/database boundaries. `validate_schema.py` is a separate repository-specific SEO consistency validator. No frontend test suite or browser automation suite was found.
- **Maintainability trade-offs:** static HTML and explicit outputs keep runtime simple, but there are many repeated page files, multiple style token systems, prebuilt bundles without their full build manifests/source tree, and a 1,900+ line backend module. This is understandable for the current site shape but makes future cross-cutting edits easier to drift.

## H. Feature inventory

| Feature | Purpose / location | Status and dependencies | Test evidence / good implementation / limitations |
|---|---|---|---|
| Audience split and service navigation | Homepage, candidate/company service pages, nav/footer scripts | Implemented in static content and JS; no provider dependency | Source and browser rendering. Clear separation and repeated entry points. |
| Public site search | `assets/site-search.js`, `site-search-index.js` | Implemented client-side across the 76-page public index | SEO validator reports 76 indexed URLs; no dedicated interaction test found. |
| Responsive menus and account link | Main pages, `audience-nav.js`; generated page nav | Implemented as menu and DOM augmentation | Source checked; no automated visual/a11y suite found. |
| Homepage tabs, carousel, visual hotspots | Homepage enhancement/visual scripts and CSS | Implemented client-side | Source shows ARIA roles, keyboard semantics and reduced-motion handling; not browser-automated here. |
| Candidate/company proof library | `candidate-proof.html`, `company-proof.html`, `proof-library*.js/css` | Implemented with local sample records; no backend dependency | Source indicates filters/dialog/focus return and escaped display data. Records are illustrative, not verified outcomes. |
| Contact inquiry | `contact.html`, contact bundle, email link | Mail-client handoff only | Form exists; no server submission, CRM, persistence, or delivery receipt. Visitor must send from their email app. |
| Country/calling-code selection | Contact form and `assets/country-codes.js` | Local UI helper | Accessible combobox/listbox semantics in markup. No contact API consumes the value. |
| Public blog and videos | `blog.html`, `assets/blog-cms.js`, `posts/*.json` | Runtime GitHub API dependency; hardcoded owner mismatch noted | Local preview fetch failed. Static review content remains available separately; dynamic post loading requires network/repo. |
| Blog editor/drafts/publishing | `blogpostcheck.html`, `blog-cms.js` | GitHub write token required; token held in sessionStorage | UI supports draft/publish/delete, preview, rich-text toolbar. Unlisted, not authenticated; content is rendered as trusted HTML. |
| Blog expiration automation | `.github/workflows/cleanup-expired-blog-posts.yml` | Daily GitHub Actions workflow; requires workflow enabled and write permission | Workflow source exists; no execution history inspected. |
| Candidate/company account access | `account.html`, `account-api.js`, `/api/v1/auth/*` | Implemented but requires Supabase config | API tests cover registration/session/recovery contracts; local UI reports unavailable. |
| Roles, permissions and protected data | `backend_api.py`, Supabase migration | Implemented at code/schema level | Tests cover anonymous denial, role/membership checks and RLS intent. Real provider/RLS exercise not available. |
| Candidate directory | `profiles.html`, `/api/v1/profiles` | Requires verified subscribed employer and data | Page/test route exists; no live directory dataset verified. |
| Candidate CV upload/access | `/api/v1/candidate/cv*`, private storage schema | API supports bounded PDF upload and signed links; bucket/config required | Upload signature/size checks and tests exist. No account-page upload UI found; production storage unverified. |
| Admin operations | `toba.html`, `/api/v1/admin/*` | Requires administrator role and configured database | Admin UI and endpoint tests present for parts; no real admin identity/data verified. Some admin update/audit paths are separate writes rather than one database transaction, as architecture notes acknowledge. |
| Subscriptions and invoices | Account UI, Stripe API routes, SQL RPCs | Billing explicitly disabled until provider/config/approval | Mocked tests verify idempotency, price matching, memberships, webhooks and invoice state. No real charges or Stripe account verified. |
| SEO metadata/schema/sitemap | All 76 sitemap pages; generator, validator, `robots.txt`, `llms.txt` | Implemented in repository | Validator passes. No claim about external index/rankings. |
| Backend health/status | `/api/v1/status`, `/api/v1/backend/health` | Health checks report configured/unconfigured booleans | Unit tests pass; do not expose secrets. Local preview's API route was unavailable. |
| CV expiry cleanup | `/api/v1/maintenance/cleanup-expired-cvs` | Secret-protected endpoint exists; scheduled invocation absent per architecture doc | Endpoint/migration source exists; no configured scheduler or live cleanup verified. |
| Analytics/tracking | No general web analytics found; private placement metric exists | Web analytics absent; admin metric requires database | No analytics provider or verification tags found. Placement calculation has API tests but is not visitor analytics. |

## I. Balanced overall assessment

### What is already built

KOV has a broad, organized public website; clearly differentiated candidate/employer narratives; a 60-page static landing-page system; main service/process/pricing/FAQ/about/contact/proof/reference pages; a client-side search index; responsive navigation and interactive proof/homepage components; a blog workflow; and a sizable backend foundation for account roles, profiles, private data, employer verification, admin operations, CV storage and gated payments.

### What is working well in source and local validation

- The public SEO footprint is systematically built and passes the repository's own consistency validator.
- The page taxonomy, internal topic navigation, audience-specific calls to action, and reusable generated-page template are strong foundations.
- There are meaningful accessibility details in interactive controls, input labels, focus, live statuses, mobile behavior and reduced-motion handling.
- Backend implementation has typed input models, server-owned role checks, separation of private/public data, transactional provisioning/invoice RPCs, secure-by-design session handling and payment idempotency safeguards.
- All 32 focused backend tests pass, and the local schema/sitemap check passes.

### What is partial, disconnected or needs verification

- The contact form is not an integrated lead system: the final send is performed by the visitor's email client.
- Account/billing/admin features depend on external Supabase/Stripe setup and have not been exercised end-to-end. The account page was unavailable in the local static preview.
- The CMS is a different identity/storage mechanism from user accounts, uses a browser-held GitHub token, has a repository-owner mismatch relative to this workspace, and did not load posts in the local preview.
- Candidate self-service is incomplete as a visitor experience: there is no full candidate dashboard/profile editor or visible CV upload control; the backend has more capabilities than the account UI exposes.
- The CV-cleanup endpoint has no configured scheduler. Resend is declared but not implemented as a transactional-email integration. No website analytics or search-verification integration was found.
- Legacy root redirects work through meta refresh/JavaScript, not a demonstrated server-side permanent redirect.
- Multiple CSS token sets and duplicated/static generated output create opportunities for visual/content drift.
- Some public outcome/volume statements would benefit from owner-provided evidence, since this source audit cannot verify their accuracy.

### Ready for further development

The public-page structure, SEO generation/validation workflow, topic organization, candidate/company separation, account API contracts, database schema and focused tests give a useful base for planned work. The most consequential prerequisite before relying on the account ecosystem is operational setup and end-to-end validation of Supabase, Vercel environment variables, storage policies, Auth redirects/email, Stripe test mode/webhooks and the scheduled CV-cleanup call.

### Additional evidence needed for a complete production assessment

1. Vercel deployment settings, build/deployment history, current production response headers and a crawl of every live URL.
2. Supabase project/migration state, Auth templates/redirect configuration, RLS tests, storage bucket configuration and test accounts (without sharing credentials in a report).
3. Stripe test-mode configuration/webhook delivery evidence and business-approved plan/pricing terms.
4. GitHub repository/API access confirmation for the CMS owner/branch, plus recent Actions workflow runs.
5. Mail-client coverage or a decision to use a server-side inquiry/inbox workflow.
6. Accessibility testing with a keyboard/screen reader and a contrast audit; performance/Core Web Vitals; analytics/Search Console data if performance conclusions are wanted.
7. Evidence and approval for public numerical outcome claims and confirmation of the images/logos' usage rights.

**Bottom line:** this is not merely a small marketing brochure. It has a strong public information architecture, a sizable and validated technical SEO foundation, and a thoughtfully designed but not yet production-verified account/backend capability. The public brochure and SEO assets are the most complete layers; the lead-capture and provider-backed customer/account journeys are the main areas where the source implementation and proven live operation currently diverge.
