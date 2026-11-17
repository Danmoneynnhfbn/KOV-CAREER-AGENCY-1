# Approved Hub Research Batch

**Research date:** 2026-11-04  
**Development branch:** `copilot/first-stage-foundations`  
**Publication:** No public page, sitemap entry, navigation link, or search-index entry was added.

## Staging implementation status — 2026-11-04

The two development-approved hubs now have content-bearing, noindex staging pages:

- **Career Resources Hub:** Curates nine existing sitemap-eligible resource, FAQ, and glossary pages by user task. Search and topic filters work in the browser. The hub links to the existing full pages and does not rewrite, shorten, or replace their content.
- **Research Hub:** States that no original KOV labor-market report is approved for publication; explains the intended disclosure standards; links to four independently authored reference sources with scope notes; and records correction/update expectations. It does not present internal candidate research as a published study or claim KOV-owned data.

Both previews retain the owner-reference visual design gate, remain noindex, and are excluded from public navigation, sitemap, and search. Browser smoke tests cover the resource filters, source links, page rendering, and responsive viewport behavior. The site coverage audit still reports 703/703 eligible pages indexed and 4,515 baseline link failures with zero regressions. Their implementation and QA states are tracked in `PAGE-TRACKER.csv`; release approval remains pending.

## Career Resources Hub — `/career-resources/`

Individual research record and blueprint are complete to the development-screen stage. Repository review found 11 resource pages, 30 FAQ pages, and a glossary; therefore the hub's unique role is navigation over existing researched information, not a duplicate content page. HBR Career Planning, its executive-career article, and O*NET OnLine were reviewed as adjacent references. Indeed Career Advice returned HTTP 403 and remains unassessed. Search intent is a hypothesis; volume and SERP ranking are unknown.

## Research Hub — `/research/`

Individual research record and blueprint are complete to the development-screen stage. CIPD Reports, HBR Career Planning, and ILO's World Employment and Social Outlook 2025 were reviewed as research/editorial references. The ILO report is a publishing benchmark, not evidence that KOV has an original dataset. The repository has taxonomy source notes and internal research material, but no validated portfolio of original quantitative executive-market research. Do not imply proprietary forecasts; public release requires at least one approved, citeable item and methodology review.

## Professional Profile Directory — `/professional-directory/`

The route is **held**, not qualified for public implementation. `/profiles.html` already describes a Candidate Directory and is canonical but `noindex,nofollow`. BoardProspects and LinkedIn were reviewed as adjacent profile-discovery/network references; The Org's Stripe page was reviewed only as an organization-profile presentation example, not a candidate-directory or consent model. The European Commission data-protection guidance and LinkedIn privacy policy were reviewed for risk framing. No consent records, public audience, data fields, retention, withdrawal, moderation, or deletion process were verified. Resolve route consolidation and privacy/operating requirements before collecting or displaying personal data.

## SERP and demand limits

Direct page reviews are not search-engine results analysis. No Google/Bing SERP positions, query volumes, keyword difficulty, traffic, or conversions were measured. These are development research findings, not claims of search demand.

## Next batch

The 23 missing SOC-major-group destinations now have individual provisional records and blueprints, as do ten additional industry-guide concepts and three narrow leadership/board guides. All remain unqualified. Next: map the SOC groups to existing role pages, complete candidate-specific overlap and search-result validation, and resolve first-party demand and serviceability gaps before any page implementation or publication.
