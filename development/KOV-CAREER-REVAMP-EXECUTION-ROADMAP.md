# KOV Career Agency Revamp — Master Roadmap and Execution Checkpoint

Last checked: 28 November 2026
Owner: KOV Career Agency
Repository: https://github.com/Danmoneynnhfbn/KOV-CAREER-AGENCY-1
Production domain: https://kovcareeragency.org

## Command protocol

Use these commands to resume this exact programme in a new chat:

- `KOV CAREER REVAMP STEP 1` — re-check current state and release readiness. Do not assume old SHAs or statuses remain current.
- `KOV CAREER REVAMP STEP 2` through `STEP 11` — execute the named stage against the live repository, current preview and production state.
- `KOV CAREER REVAMP CONTINUE` — inspect the latest checkpoint and execute the next unfinished stage.
- `KOV CAREER REVAMP STATUS` — verify and report overall status without restarting work.

Always inspect current GitHub, CI and Cloudflare state before acting. This document is the continuity record, not proof that an old deployment or check remains current.

## Business strategy and non-negotiable logic

KOV Career Agency is a candidate-side private career representation business. It represents professionals, not employers. It is not an employer-side executive search agency and not a job board.

The main managed offer is Private Career Representation. Seven separate Individual Career Services support it: resume/CV writing, LinkedIn profile optimisation, career documents, career portfolio development, personal career websites, career positioning and coaching. Eight published executive-specialist URLs are existing routes, not eight extra paid products.

Customer-first sales logic:
1. Recognise the visitor's real problem and concern.
2. Explain why it matters without fear-based or manipulative claims.
3. Show the progress the customer is seeking.
4. Introduce KOV's practical solution.
5. State actual deliverables, scope, responsibilities and limits.
6. Make the next step easy.

Lead with customer outcomes and benefits, not internal process, jargon, tools or technology. Do not promise interviews, offers, employment, placement, timelines or outcomes outside KOV's control.

The 120-row service catalogue is an internal research backlog, not 120 approved services or URLs. Publish a dedicated service page only where customer, problem, intent, genuine capability and deliverables are materially distinct. Do not create thin keyword variants.

Preserve existing useful public URLs and topics. Do not mass-delete or noindex based only on placeholder wording. Preserve the 18 existing datasets, central JSON-LD catalogue and existing HEAD metadata unless a specifically justified change is approved. Do not rewrite canonical, robots, title, description, Open Graph, Twitter or schema HEAD fields as part of body-only work without explicit justification.

The editorial queue has 610 pages for individual review: P0 47; P1 generic-placeholder 411; P1 value review 73; P2 accuracy/source/differentiation 79. These are review priorities, not proof that every URL is indexed by Google.

The contact form currently uses a mailto handoff. The FastAPI/Supabase/Resend API is not connected to the production Pages hostname. Never claim reliable server-side lead capture until end-to-end submission, persistence and notification tests pass. Do not incur paid hosting, upgrade or usage charges without approval.

## 11-stage execution roadmap

### Step 1 — Current State and Release Readiness
Inspect the repository, open PRs, latest commits, Cloudflare Pages project, production and preview deployments, CI, changed files, data preservation, service architecture and release risks. Record verified blockers and the next stage.

**Exit condition:** an evidence-based readiness report and a persistent current checkpoint.

### Step 2 — Complete Phase 2 and Release the Existing Work
Fix confirmed packaging, QA and content defects; re-run all required checks; inspect the current preview and confirm no private/internal material is public; keep production unchanged until checks and review pass; then make the approved merge and deploy decision.

### Step 3 — Homepage Commercial Transformation
Refine the homepage so professionals immediately understand the candidate-side offer, the problem KOV solves, the desired outcomes, the service pathways, credible proof, the representation process and the next step. Remove unsupported or confusing promises.

### Step 4 — Rebuild the Core Service Ecosystem
Strengthen the Private Career Representation page, seven Individual Career Services and eight existing executive-specialist pages. Make scope, audience, deliverables, boundaries, related services and enquiry paths clear.

### Step 5 — Validate and Expand the Service Market
Review all 120 service candidates. Use genuine customer needs, search intent, capability and deliverables to decide which are real separate offers, page variants, service components or resource topics. Publish only approved, differentiated offers.

### Step 6 — Rebuild the Existing Content Ecosystem
Work through the 610-page queue, starting with the 47 P0 items. Replace generic templates with useful, specific and accurate content. Preserve useful routes. Use sources for changing market, salary, legal or country information.

### Step 7 — SEO, Technical Structure and Data Integrity
Audit internal links, sitemap, robots, canonicals, titles, descriptions, structured data, 18 datasets and search coverage. Fix only evidence-backed issues and protect existing route equity and metadata.

### Step 8 — Reliable Enquiry and Client Intake
Resolve the contact API hosting decision without unapproved cost, align form and API fields, configure secrets and data/notification services, set privacy/retention/access/spam controls, and complete end-to-end tests. Maintain an honest fallback until verified.

### Step 9 — Conversion Tracking and Business Measurement
Set a baseline and track relevant service journeys, enquiry starts, successful submissions, service interests, qualified enquiries and commercial outcomes. Separate traffic and impressions from actual leads and revenue.

### Step 10 — Final Website-Wide Quality Assurance
Test public routes, navigation, links, assets, forms, mobile/tablet/desktop, browser errors, accessibility, responsive behaviour, performance, structured data and dataset delivery. Resolve launch blockers.

### Step 11 — Production Launch and Post-Launch Verification
Merge approved work, deploy through the production Pages branch, verify both custom domains and the public journeys, confirm enquiry behaviour, assets, redirects, metadata, sitemap and data delivery, record release details, and monitor post-launch issues.

## Step 1 — Verified findings as of 28 November 2026

### GitHub
- Repository: `Danmoneynnhfbn/KOV-CAREER-AGENCY-1`.
- Default branch: `master`.
- Phase 2 PR: #37 — https://github.com/Danmoneynnhfbn/KOV-CAREER-AGENCY-1/pull/37
- PR #37 is open, draft, not merged, and reported mergeable.
- Head branch: `kov-commercial-phase-2-customer-outcomes`.
- Head at the time of this check: `2edc1759ab4193a658f5de7f7ad92d8595bfa8ac`.
- Base/master at the time of this check: `de4240ecce259c8e7e711269798fcc894b339f71`.
- Compare: 60 commits ahead, 0 behind; 34 changed files in the compare response.
- These SHAs are historical checkpoints. Refresh before any future work.

### CI at head 2edc175
Three of four PR workflows passed:
- Commercial content and service catalogue audit: passed. Validated the 120-row register and audited 1,424 sitemap entries; zero missing source files and zero missing contextual primary-service handoffs.
- JSON-LD generation and lossless HEAD preservation: passed. The workflow checked published HTML output and exercised the 18 compressed catalogue URLs.
- Cloudflare Container validation: passed, including build, data/taxonomy, API and container smoke tests.
- Responsive layout regression checks: failed with exactly one reported failure out of 4,272 checks (1,424 routes × 3 viewports), plus 90 warnings.

### Responsive test diagnosis
The only failure reported was `/pricing.html` at mobile width. The test checker calculates `cardRects = cards.map(rect)` but later compares `card.top`; the element does not have a `.top` property. It should use `cardRects[index].top`. This is a test assertion bug, not evidence of a real Pricing layout defect.

The report for Pricing mobile shows four cards, zero horizontal overflow, the illustration loaded and no main-section overlap. The markup uses a four-card grid with one column below 640px and two columns from 640px.

The 90 warnings are three viewport warnings for each of 30 FAQ-library pages that lack a semantic `<main>` landmark. No layout failure was reported for those pages. Record this for the accessibility pass; do not silently treat warnings as passing.

### Cloudflare
- Pages project: `kov-career-agency`.
- Production branch: `master`.
- Both `kovcareeragency.org` and `www.kovcareeragency.org` are configured and returned active/verified domain status.
- Current Phase 2 preview for head `2edc175`: https://aaf1d4f4.kov-career-agency.pages.dev — successful preview deployment.
- Production canonical deployment at this check: commit `de4240ecce259c8e7e711269798fcc894b339f71` on `master`, with both custom-domain aliases. Phase 2 has not been merged or deployed to production.
- No DNS change, production Worker route, production secret change or paid plan upgrade was made.
- External Browserless and Geekflare checks hit usage/rate limits during this audit. Do not claim a completed independent screenshot-based visual review.

### Critical Step 2 release blocker — internal docs packaging
The Cloudflare Pages builder is `scripts/build_cloudflare_pages.py`. Its `SKIP_DIRS` includes `development`, `research`, `scripts` and private/system directories, but does not include `docs`. Its file-walk copies other files into `dist`. PR #37 adds internal commercial documents under `docs/commercial/`, including the service register, Search Console baseline and publication audit. Therefore these internal Markdown files are packaged into the public Pages output unless the builder is corrected.

**Do not merge or release PR #37 until Step 2 fixes this.** Explicitly exclude private/internal documentation or use a strict public allowlist. Keep this execution checkpoint under `development/`, which the builder already excludes. Verify the internal preview URLs return 404 or otherwise are not served after the fix.

### Step 2 patch scope

- Exclude the repository's root `docs/` directory and Markdown/reStructuredText files from the public Pages package.
- Add a fail-closed post-build check so internal documentation cannot silently enter `dist/`.
- Correct the mobile Pricing checker to compare measured rectangles, not a nonexistent element property.
- Keep the 30 FAQ-library missing-`<main>` warnings in the Step 10 accessibility workstream; these warnings are separate from the mobile Pricing failure.
- Production remains on `master` until all release gates are verified.

### Other recorded items
- PR #37 body itself documents that the contact form stays on its mailto handoff. Backend is not connected to production; this is a Step 8 task.
- The latest commit has a red `Vercel` status context pointing to an account deployment-blocked help page. Cloudflare Pages preview succeeded. Determine whether this is an obsolete/non-required integration before treating it as a release blocker; do not switch hosting or buy a plan based only on that status.
- A 30-page FAQ library accessibility improvement (semantic `<main>` landmarks) is recorded for Step 10 unless subsequent checks establish it should be fixed sooner.

## Step 2 execution order

1. Fix the Pages build so internal `docs/commercial` material is not copied or publicly served. Prefer a strict explicit publication allowlist or precise directory exclusions; do not remove legitimate public resources accidentally.
2. Fix the mobile Pricing test to compare `cardRects[index].top` rather than `card.top`.
3. Treat the 30 FAQ-library pages without a semantic main landmark as a Step 10 accessibility work item. They are warnings, not the cause of the only failed layout check; keep this narrow release patch focused unless a real content or navigation defect is found.
4. Build and deploy a fresh PR preview. Verify internal documentation paths are not served, and that the homepage, core service pages, Pricing, How It Works and Contact routes load.
5. Re-run all four required workflows on the new head. Review the full layout report and any remaining warnings. Check Pages preview deployment status.
6. Review the complete diff and release scope. Keep PR draft until every agreed gate passes. Only then prepare the approved merge and production release, followed by custom-domain verification. Do not change production prematurely.

## Completion ledger

- [x] Step 1 — Current state and release-readiness audit completed; current blockers recorded.
- [ ] Step 2 — Phase 2 fixes, validation and approved release.
- [ ] Step 3 — Homepage commercial transformation.
- [ ] Step 4 — Core service ecosystem.
- [ ] Step 5 — Service-market validation and expansion.
- [ ] Step 6 — Existing content quality programme.
- [ ] Step 7 — SEO and technical/data integrity.
- [ ] Step 8 — Reliable enquiry and intake.
- [ ] Step 9 — Conversion measurement.
- [ ] Step 10 — Website-wide QA.
- [ ] Step 11 — Production launch and post-launch verification.

## Persistent execution rules

- Never claim a preview is production or a build is live on the custom domain.
- Never merge a draft PR while a required check fails or private assets may be exposed.
- Never make destructive sitemap, route, data or metadata changes without route-specific evidence.
- Never invent capabilities, testimonials, client results or guaranteed hiring outcomes.
- Never claim a form is working until the entire journey is tested.
- Never incur unapproved paid charges.
- At every stage, update this file's completion ledger and verified current checkpoint on the active working branch. Since this file is in `development/`, it is excluded from the Pages build.
