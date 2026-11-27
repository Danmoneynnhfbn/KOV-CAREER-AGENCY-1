# KOV commercial restructure: QA and release checklist

## Changes in this working branch

- Added the master commercial service register for the one managed service and seven individual services already represented in the site.
- Added a 1,424-row page-to-customer-need map based on the current published coverage register. All 1,424 paths are unique and every row has all eight mapping fields populated.
- Rewrote the process page to describe assessment, target direction, positioning, research, approved outreach and response review without fixed application-volume claims or implied hiring guarantees.
- Rewrote the pricing page to distinguish managed representation from standalone services and make scope, deliverables, payment terms and exclusions explicit.
- Improved the managed-service page's benefit-first hero and replaced four third-party stock photographs with existing local KOV illustrations.
- Improved the Individual Career Services hub to start with the customer's presentation problem and explain that standalone work does not require full representation.
- Added service-interest query preselection for enquiry links, including the pricing enquiry route.
- Preserved existing fonts, components, page layout language, HEAD metadata and central catalogue references. No new public page URLs were created.

## Verified in Cloudflare Pages preview

- [x] Latest preview build completed successfully for commit `a4d400af20dbf554d2bf1d456bd5fda8bb15ea84`.
- [x] Preview homepage, managed-service page, process page and pricing page returned their intended content and canonical URLs.
- [x] Individual Career Services hub and all seven standalone service pages returned successfully with indexable canonical metadata.
- [x] Contact enquiry form is visible and its service-interest dropdown contains the expected service choices.
- [x] `?service=pricing` correctly preselects “Fees and engagement scope” in the enquiry form. The form was not submitted.
- [x] Managed-service page uses local KOV SVG illustrations; the four illustration assets load with non-zero dimensions.
- [x] Desktop and approximately 390px mobile visual checks passed for the managed-service page: no broken images, horizontal overflow, visible overlap or browser errors.
- [x] Page map has 1,424 rows, no duplicate paths and no blank or malformed fields.
- [x] No new public page URL or robots/noindex change was introduced by this phase.
- [x] Cloudflare Pages build completed, including the repository build pipeline and its sitemap, React-navigation, site-search and shared catalogue generation/validation steps.

## Remaining before production release

- [ ] Review the GitHub status check. The Vercel check currently reports a deployment/account-blocked failure; Cloudflare Pages preview itself succeeded.
- [ ] Merge the approved pull request to `master` only after the repository's required checks permit it.
- [ ] Confirm the production Cloudflare Pages deployment completes successfully.
- [ ] Check the live canonical pages and enquiry flow after deployment/cache refresh.
- [ ] Keep the previous successful Pages deployment available for rollback.

## Release rule

Do not force-merge or bypass a required failing status check. Do not change DNS, attach a new Worker, upgrade Cloudflare billing, or alter the backend/container architecture as part of this static-site release. If production deployment is blocked, leave the verified preview and report the exact blocker.
