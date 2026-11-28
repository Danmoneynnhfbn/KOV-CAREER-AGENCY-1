# KOV publication and content review: 610 routes

**Prepared:** 28 November 2026  
**Scope:** The 610 sitemap-published pages whose visible source content identifies them as research-stage, staged, draft or internal-planning material while their coverage record says `published`, `sitemap=yes` and their source robots directives permit indexing.

## Decision

Treat this primarily as an editorial quality and publication-register reconciliation task, not a bulk de-indexing task.

The 610 routes are part of the current directory publishing programme and are included in the intended public publishing manifest. Do not delete them, redirect them to the homepage or remove them from the sitemap solely because their body copy contains staging language. Preserve their URLs and existing protected HEAD metadata while they receive individual editorial review.

This is a source-repository mismatch count, not a Google indexed-page count. Google URL Inspection must be checked for each route before any indexing-policy change.

## Latest audit results

- Sitemap and published coverage rows: **1,424 / 1,424**
- Pages read: **1,424**
- Missing source files: **0**
- Source-level staged/internal disclosure conflicts: **610**
- Placeholder-style content flags across all published pages: **470**
- Placeholder-style flags within the 610-route review group: **458**
- Routes in the review group without that additional placeholder flag: **152**
- Pages below the audit's basic visible-copy threshold across the complete site: **140**
- Substantial repeated paragraph strings across the complete site: **165**
- Missing contextual primary-service handoffs after path resolution: **0**

The 458 placeholder flags within this 610-route queue are a subset of the 470 placeholders detected across all 1,424 sitemap pages; the counts must not be added together.

## Page-family distribution

| Family | Routes |
|---|---:|
| Country market guides | 150 |
| Executive career guides | 104 |
| Other directory role/resource indexes | 67 |
| Industry-specific career guides | 57 |
| Country-role pages | 50 |
| Interview guides | 31 |
| Transition guides | 30 |
| Leadership skills and competencies | 28 |
| Salary and compensation guides | 22 |
| Market reports | 20 |
| Mobility | 20 |
| Career and market comparisons | 17 |
| Board and non-executive career | 14 |
| **Total** | **610** |

## Editorial queue priorities

| Priority | Routes | Required treatment |
|---|---:|---|
| P0 | 47 | Replace very thin placeholder pages with meaningful subject-specific material before further promotion |
| P1 | 411 | Replace generic placeholder passages with genuinely distinct editorial content |
| P1 | 73 | Conduct a substantive rewrite/value review where word count or specificity is weak |
| P2 | 79 | Verify accuracy, source quality, differentiation and whether the page answers a real reader question |

The route-level CSV generated with this review contains each path, canonical, title, page family, visible word count, placeholder flag, priority, Google inspection status field and recommended action. The Google inspection status is intentionally “not individually inspected” for every row; no status has been inferred from the source HTML.

## Editorial acceptance criteria

For every route:

1. Identify the actual reader, question and decision the page should help with.
2. Replace staging language and route placeholders with useful, page-specific guidance, examples, limitations and next steps.
3. Separate general career guidance from claims about current vacancies, employer demand, compensation, market ranking or regulation. Date and cite time-sensitive facts.
4. Distinguish confirmed opportunities from role hypotheses or longer-term target organisations.
5. State what is known, what remains uncertain and what the reader should verify next.
6. Connect to a KOV service only when that service genuinely helps with the reader's stated problem. Do not turn reference pages into sales pages.
7. Check for overlap with existing routes and retain a separate page only when its audience, purpose and useful content are distinct.
8. Obtain human editorial approval before promotion. Inspect the exact URL in Search Console before changing robots, canonical or sitemap treatment.

## Google evidence: sampled, not universal

The 28 November 2026 Search Console inspection sample found a mixture of states: some directory guides were excluded by a Google-reported noindex directive, one board guide was discovered but not indexed, and several legacy `/staging/` URLs were still reported as indexed. These states do not establish the indexing state of all 610 routes.

Use the route-level Search Console inspection before any page-specific index-policy decision. Preserve useful and relevant routes; do not redirect unrelated pages to the homepage.

## Protected

- No public URL, canonical, robots directive, Open Graph, Twitter, schema HEAD or sitemap record is changed by this review.
- All 18 metadata datasets and the shared JSON-LD catalogue remain intact.
- No employer-side recruitment offering is revived.
- No guaranteed job, interview or placement claim is introduced.

## Source

Generated from the 28 November 2026 `kov-commercial-content-audit` workflow artifact on the Phase 2 branch. The latest audit reconciles the 1,424 sitemap entries with the coverage register and reads all corresponding HTML sources.
