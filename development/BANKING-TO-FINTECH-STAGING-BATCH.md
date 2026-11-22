# Banking-to-Fintech Research and Staging Batch

- **Research and implementation date:** 2026-11-04
- **Branch:** `copilot/first-stage-foundations`
**Disposition:** One candidate qualified for development; one substantive noindex staging page built. Publication is not approved.

## Candidate decision

- **Page:** From Banking Leadership to Fintech: Translating Your Experience
- **Candidate ID:** `bank-executive-to-fintech-career-transition`
- **Proposed URL:** `/career-resources/industry-specific-career-guides/bank-executive-to-fintech-career-transition/`
- **Staging preview:** `/directory/career-resources/industry-specific-career-guides/bank-executive-to-fintech-career-transition/`

The candidate addresses a specific executive transition task rather than repeating the existing finance or technology sector overviews. The existing senior-leader strategy and executive-resume pages provide general candidate-side career-positioning context. The new guide does not claim that KOV recruits for fintech, provides sector-specific placement, or can secure an outcome.

### Research evidence

- **Intent and audience:** Informational, candidate-side guidance for senior banking executives assessing fintech roles. The phrase is a query hypothesis, not a measured keyword.
- **Localized results:** A Google results screen using `hl=en-US` and `gl=US` for `bank executive to fintech career transition` displayed PaymentGenes and Hunter Bond transition content, a CFA Institute research result, and user discussion results. This is qualitative, dynamic evidence only; it is not a rank-tracking study or demand measurement.
- **Direct competitors reviewed:** Hunter Bond, “Career Migration: From Banking to Fintech”; and PaymentGenes, “How to Transition from Traditional Banking to a FinTech Career.” Both show existing general transition content. The staging guide differentiates through executive-level scope, employer-model due diligence, substantiated evidence mapping, and careful U.S. regulatory boundaries.
- **Authoritative reference:** Federal Reserve SR 23-4 was rechecked. The page limits its description to banking organizations supervised by the Federal Reserve and notes that the guidance discusses some fintech relationships and does not impose new requirements.
- **Overlap:** The current KOV finance and technology hubs cover broad sectors; the senior-leader strategy and executive-resume pages cover general positioning. The new page is limited to cross-industry evidence mapping. All recommended internal links were verified as existing pages.
- **Demand limits:** No Search Console, keyword-volume, difficulty, traffic, conversion, or first-party query export was available. No such claim is made.

The candidate is qualified for development under the owner's `approve_qualified` instruction. This does not authorize production publication.

## Staging implementation

The page contains:

- A distinct introduction and scope boundary.
- A five-row experience-to-role evidence map.
- Employer-model and role-fit questions.
- A practical narrative structure with explicitly hypothetical placeholders.
- Opportunity due-diligence prompts and three focused FAQs.
- A dated, limited-scope authoritative citation and links to four existing KOV resources.
- Noindex/nofollow metadata, provisional-design notice, structured WebPage metadata, shared navigation/footer integration, and no public canonical URL.

The page is not linked from public navigation, sitemap, or the public internal-search catalog. It remains on staging pending visual-reference and publication approval.

## Status and counts

- **Pages built in this batch:** 1.
- **Industry-specific candidate URLs defined:** 13 of 45.
- **Industry-specific candidates qualified for development:** 1.
- **Industry-specific quota slots not assigned to a candidate URL:** 32.
- **Other industry candidates:** remain provisional or held; candidate presence is not qualification.
- **Candidate pages published:** 0.

The master lifecycle state is recorded in `PAGE-TRACKER.csv`; research details are in the individual record and blueprint.

## Validation

Validation completed:

- `npm run test:foundations`: passed, including desktop/mobile render, noindex, shared navigation/footer, source links, table content, section anchors, and structured WebPage metadata.
- `python scripts/validate-research-programme.py`: passed; 55 individual records validate, with 55/577 candidate URLs defined and all unpublished/excluded.
- `npm run audit:site-coverage`: 730 HTML files scanned; 703 unique sitemap pages and search entries; all 703 have the shared footer hook; 4,515 link-validation failures match the committed baseline, with zero introduced.
- `git diff --check` reports trailing whitespace in pre-existing modified `assets/site-search.js`; no changes were made to that file in this batch.

The page remains excluded from the public sitemap, search index, and navigation.

## Next batch

Continue the occupation-classification and remaining industry candidates only where candidate-specific authoritative evidence, differentiated user intent, overlap review, and usable localized competitor/SERP evidence can be established. Keep unresolved topics provisional and do not assign URLs solely to close category quotas.
