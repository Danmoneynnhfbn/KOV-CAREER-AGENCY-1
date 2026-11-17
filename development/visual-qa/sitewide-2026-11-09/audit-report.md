# Site-wide visual audit — 2026-11-09

**Scope:** all 1280 distinct URL paths listed in the published sitemap, tested at desktop (1440px), tablet (768px) and mobile (390px), in light and dark color schemes. The automated test covered 7680 rendered route/view/theme combinations.

## Results

- Routes with at least one measurable visual or loading defect: 1280.
- Routes with no detected automated defect: 0.
- New before/after screenshots: 40 after screenshots, compared with existing representative screenshots in `../screenshots/`.
- Screenshot capture failures: 0.
- The page-level statuses are recorded in `page-tracker.csv`; raw route and viewport evidence is in `route-findings.json`.

| Page family | Sitemap routes | Routes with a detected defect |
|---|---:|---:|
| About | 1 | 1 |
| Blog | 1 | 1 |
| Contact | 1 | 1 |
| Geography and markets | 6 | 6 |
| Homepage | 1 | 1 |
| Industry | 22 | 22 |
| Resources and FAQs | 618 | 618 |
| Roles | 605 | 605 |
| Services and site pages | 25 | 25 |

## Before-and-after screenshot set

Existing light-theme screenshots are from the prior visual QA captured on 2026-11-08. New screenshots were captured during this audit at desktop, tablet and mobile sizes, plus dark-theme mobile, for each family below.

| Page family | Before screenshots | New screenshots |
|---|---|---|
| Homepage | `../screenshots/homepage-desktop.jpg`, `../screenshots/homepage-tablet.jpg`, `../screenshots/homepage-mobile.jpg` | `./screenshots/homepage-desktop.png`, `./screenshots/homepage-tablet.png`, `./screenshots/homepage-mobile.png` |
| Service | `../screenshots/service-desktop.jpg`, `../screenshots/service-tablet.jpg`, `../screenshots/service-mobile.jpg` | `./screenshots/candidate-services-desktop.png`, `./screenshots/candidate-services-tablet.png`, `./screenshots/candidate-services-mobile.png` |
| Executive role | `../screenshots/executive-role-desktop.jpg`, `../screenshots/executive-role-tablet.jpg`, `../screenshots/executive-role-mobile.jpg` | `./screenshots/roles-ceo-desktop.png`, `./screenshots/roles-ceo-tablet.png`, `./screenshots/roles-ceo-mobile.png` |
| Industry | `../screenshots/industry-desktop.jpg`, `../screenshots/industry-tablet.jpg`, `../screenshots/industry-mobile.jpg` | `./screenshots/industries-finance-insurance-desktop.png`, `./screenshots/industries-finance-insurance-tablet.png`, `./screenshots/industries-finance-insurance-mobile.png` |
| International market | `../screenshots/international-market-desktop.jpg`, `../screenshots/international-market-tablet.jpg`, `../screenshots/international-market-mobile.jpg` | `./screenshots/markets-executive-job-search-dubai-desktop.png`, `./screenshots/markets-executive-job-search-dubai-tablet.png`, `./screenshots/markets-executive-job-search-dubai-mobile.png` |
| Career resource | `../screenshots/career-resource-desktop.jpg`, `../screenshots/career-resource-tablet.jpg`, `../screenshots/career-resource-mobile.jpg` | `./screenshots/resources-case-studies-desktop.png`, `./screenshots/resources-case-studies-tablet.png`, `./screenshots/resources-case-studies-mobile.png` |
| FAQ | `../screenshots/faq-desktop.jpg`, `../screenshots/faq-tablet.jpg`, `../screenshots/faq-mobile.jpg` | `./screenshots/faqs-desktop.png`, `./screenshots/faqs-tablet.png`, `./screenshots/faqs-mobile.png` |
| Blog | `./screenshots-before/blog-desktop.png`, `./screenshots-before/blog-tablet.png`, `./screenshots-before/blog-mobile.png` | `./screenshots/blog-desktop.png`, `./screenshots/blog-tablet.png`, `./screenshots/blog-mobile.png` |
| About | `../screenshots/about-desktop.jpg`, `../screenshots/about-tablet.jpg`, `../screenshots/about-mobile.jpg` | `./screenshots/about-desktop.png`, `./screenshots/about-tablet.png`, `./screenshots/about-mobile.png` |
| Contact | `../screenshots/contact-desktop.jpg`, `../screenshots/contact-tablet.jpg`, `../screenshots/contact-mobile.jpg` | `./screenshots/contact-desktop.png`, `./screenshots/contact-tablet.png`, `./screenshots/contact-mobile.png` |

## Scope and limits

- Each sitemap URL was navigated in a local browser build; external requests and fonts were blocked to keep the audit reproducible.
- The scan checks HTTP status, the shared stylesheet, page errors, horizontal overflow, clipped document overflow, failed local images/requests and text contrast on solid backgrounds.
- Contrast checks intentionally skip gradient/image backdrops; screenshots require human visual review before final completion.
- Existing noindex and staged pages excluded from the sitemap were not treated as published sitemap routes.
- Contact notifications are sent through Resend by the API, but the development workspace has no Supabase or Resend credentials. Live delivery remains unverified until the deployment has those credentials and a verified sender.
