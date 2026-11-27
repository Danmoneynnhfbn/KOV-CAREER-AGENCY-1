# KOV commercial restructure: QA and release checklist

## Changes in this working branch

- Added the master commercial service register for the one managed service and seven individual services already represented in the site.
- Added a 1,424-row page-to-customer-need map based on the current published coverage register.
- Rewrote the process page to describe assessment, target direction, positioning, research, approved outreach and response review without fixed application-volume claims or implied hiring guarantees.
- Rewrote the pricing page to distinguish managed representation from standalone services and make scope, deliverables, payment terms and exclusions explicit.
- Improved the managed-service page's benefit-first hero and replaced its third-party stock-image URL with an existing local KOV visual asset.
- Improved the Individual Career Services hub to start with the customer's presentation problem and explain that standalone work does not require full representation.
- Preserved all existing page HEAD content and central catalogue references by changing only the relevant body sections/copy.

## Automated and manual validation still required before merge

- [ ] Cloudflare Pages preview build completes successfully for this branch.
- [ ] Preview process page renders and its six stages are readable on desktop and mobile.
- [ ] Preview pricing page renders, all links resolve and the scope/fee wording is consistent.
- [ ] Managed-service page loads the local SVG visual.
- [ ] Individual Career Services hub routes to all seven existing standalone pages.
- [ ] Contact links and service query parameters reach the existing inquiry form.
- [ ] Sitemap and current coverage register remain in agreement.
- [ ] Build-time JSON-LD generator validates the existing 18 datasets and one shared catalogue root reference per eligible page.
- [ ] No new public URL or noindex change is introduced by this phase.
- [ ] Production deployment is successful and live pages are checked after cache refresh.

## Release rule

Do not merge to `master` or deploy to production if the preview build or any release-critical check fails. Keep the previous successful Pages deployment available for rollback.