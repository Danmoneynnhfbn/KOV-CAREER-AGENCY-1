# KOV Career Agency: Search Console baseline and search-intent alignment

**Prepared:** 28 November 2026  
**Source:** Connected Google Search Console property `sc-domain:kovcareeragency.org`  
**Period:** 25 August–25 November 2026 (last three complete months available at review time)

## What the data says

Search Console returned:

- **554 query rows** when grouped by query.
- **548 page rows** when grouped by page.
- **817 query/page pairs** when grouped by both query and page.

These are dimension-specific row counts. They are not unique visitors, nor should they be added together.

The highest-click query is branded: `kov career agency` generated 81 clicks across the main homepage and other brand destinations. The two primary homepage URL variants appeared separately in page data:

- `https://kovcareeragency.org/`: 69 clicks, 1,017 impressions, 6.78% CTR, average position 5.3.
- `https://www.kovcareeragency.org/`: 57 clicks, 3,208 impressions, 1.78% CTR, average position 6.3.

Because these host variants are reported separately, canonical/host consistency should remain a technical monitoring item. No change to canonical or redirect policy is included in this content phase.

## Service-page examples

The pages most relevant to KOV's service model show room to improve how clearly the offer is communicated and connected:

| Page | Clicks | Impressions | Average position |
|---|---:|---:|---:|
| `/services.html` | 2 | 303 | 4.4 |
| `/career-positioning-optimization.html` | 1 | 34 | 11.6 |
| `/services/career-strategy-senior-leaders.html` | 2 | 15 | 20.1 |
| `/services/reverse-recruiting.html` | 2 | 46 | 8.2 |

These are page-level totals, not necessarily clicks from non-branded service queries. They are diagnostic, not conversion metrics.

Candidate-side searches are present but comparatively small in the retrieved query set. Examples include `candidate representation services` (17 impressions across the paired page results) and `executive career representation` (8 impressions in query-level data). These need clearer, more consistent service naming and internal pathways, not a promise of search growth.

## Candidate-side query evidence and page priorities

A full query-level extraction for the same 25 August–25 November 2026 period shows that candidate-side service phrases exist, but most have limited impressions and/or weak average positions. The most actionable service cluster is executive interview preparation:

| Query | Impressions | Average position |
|---|---:|---:|
| `executive interview coaching` | 161 | 61.9 |
| `interview coaching for executives` | 124 | 27.4 |
| `senior leadership interview coach` | 69 | 48.0 |
| `ceo interview coaching` | 60 | 39.5 |
| `ceo interview coach` | 57 | 37.0 |
| `executive career representation` | 8 | 16.4 |
| `candidate representation services` | 17 | 36.6 |
| `career positioning` | 4 | 15.5 |
| `executive job search` | 3 | 14.7 |

These are Search Console query impressions and average positions, not keyword-tool search volumes, difficulty estimates or forecasts. Small impression counts are directional signals, not proof of a commercially meaningful market.

### Current page priorities

1. **Executive interview coaching:** strengthen the existing `/services/interview-coaching-executives.html` page with practical, leadership-specific preparation guidance. The page should help candidates explain mandate, judgment, trade-offs, personal contribution, evidence and learning. A new answer framework has been added in this branch.
2. **Private Career Representation:** keep the primary service page focused on the professional's problem, the managed work KOV coordinates, client approvals, deliverables and boundaries. Use `/services.html` and the existing executive representation pages; do not create a second product for reverse recruiting.
3. **Career positioning:** strengthen the existing `/career-positioning-optimization.html` pathway around the decision a professional needs to make, the evidence reviewed, the role directions considered and the deliverables actually agreed.
4. **Resume/CV and career documents:** maintain separate pages for genuinely separate deliverables, but do not split normal document sections or format options into artificial standalone services.

### Do not optimise for the wrong buyer

The same query extraction includes employer-oriented phrases with materially larger impression counts, including `executive search energy` (506), `energy executive search` (271), `saas executive search` (106), `executive search saas` (81), and `portfolio company executive search` (92). Those phrases commonly indicate that an employer is looking to hire a search firm. They are not a reason to position KOV as an employer-side recruiter. Retain clear candidate-side language and do not create employer service offers around those queries.

Occupation-code and SOC taxonomy searches also appear in Search Console. They are relevant to the public reference library, but they should not turn those reference pages into sales pages. Keep reference content factual and distinct from service conversion content.

## Search intent mismatch

A material share of non-brand query demand is for employer-side recruitment or retained executive search, including:

- `executive search energy`
- `fintech executive search`
- `energy executive search`
- `private equity executive search`
- `saas executive search`
- `portfolio company executive search`

These phrases commonly describe an employer buying a search firm. That is not KOV's candidate-side positioning. KOV should not create or optimise sales pages that imply it is retained to recruit for employers.

For a rough diagnostic only, excluding obvious KOV brand strings from the 554 query rows leaves approximately 530 rows, 4,986 impressions and 6 clicks. This is a simple text-based heuristic, not Google's official branded/non-branded classification: the official branded-classification request returned no rows for this property in this retrieval, and the filter result was therefore not used as a definitive brand split.

## Candidate-side intent to strengthen

Prioritise language that identifies a professional looking for help with their own career, such as:

- private career representation
- executive career representation
- candidate-side career search support
- resume/CV writing and optimisation
- LinkedIn profile optimisation
- career positioning and transition strategy
- executive interview preparation
- career documents and professional biography
- portfolio and personal career website development

Do not mechanically insert these terms. The page should answer the searcher's real question and explain what KOV actually does.

## Work completed in this phase

- Added contextual cross-links between the seven existing individual career-service pages. Each link includes a short explanation of when the related service is useful, rather than a generic “related services” list.
- Kept the service catalogue at 120 candidates, with only the eight existing offers marked canonical; specialist ideas require distinct-scope, capability and keyword validation.
- Added a sitemap-wide content audit. The latest report confirms that all 1,424 sitemap entries reconcile with the published coverage register and all corresponding HTML files exist.
- Avoided an Analytics-based opportunity score because the Search Console + GA4 join returned an error. No conversion or business-value score is claimed.

## Prioritised next actions

1. Keep the customer-facing distinction unmistakable: KOV works on behalf of professionals, not employers hiring staff.
2. Continue improving candidate-side service pages and internal connections; do not create employer-facing executive-search product pages just because those terms have impressions.
3. Use query/page pairs and the current audit to decide which specific subject pages deserve a different opening or a stronger contextual service handoff.
4. Resolve the 610-page publication-status conflict described separately in the Phase 2 audit. Those pages visibly disclose staged/internal-planning status while the source coverage says published, sitemap=yes and their robots directives allow indexing. This is not a copywriting or keyword decision.
5. Recheck the same Search Console window after changes; compare clicks, impressions, CTR and page/query alignment without promising rankings or leads.

## Limitations

- Search Console reports search performance, not leads, qualified enquiries, signed clients or revenue.
- The Search Console + GA4 opportunity join failed in this review; no engagement or conversion value was imputed.
- The page/query sample can include duplicate URL variants and low-volume terms.
- No search-volume or keyword-difficulty claims are included here.
