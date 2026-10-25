# Strict Visible-Body Overlap Audit

- Page records audited: 615
- Within-role and within-industry page comparisons: 12919
- Pair comparisons over 30%: 3
- Text scope: all visible page-body copy, excluding only header, footer, navigation, and non-visible scripts/styles/hidden elements.
- Similarity: Jaccard overlap of exact contiguous 8-word passages; any score above 30% is a failure.
- Role groups contain the role hub and every generated pair page for that role. Industry groups contain the industry hub and every generated pair page for that industry.
- Page word caps: role hubs 5,000; role-in-industry pages 3,500. Existing minimum lengths and unique-FAQ checks remain enforced.

## Word counts

| Type | Pages | Required minimum | Observed visible-word range | Maximum cap |
|---|---:|---:|---:|---:|
| role | 40 | 3,000 | 3,442–4,265 | 5,000 |
| pair | 554 | 1,500 | 2,365–3,243 | 3,500 |
| industry | 21 | 2,000 | 3,508–4,417 | not set |

## Within each role

### board-director

Pages: 22; comparisons: 231; average overlap: 20.04%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.53% | `/roles/board-director/finance-insurance.html` | `/roles/board-director/retail-ecommerce.html` |
| 2 | 26.13% | `/roles/board-director/business-support-facilities.html` | `/roles/board-director/wholesale-distribution.html` |
| 3 | 25.69% | `/roles/board-director/transportation-logistics.html` | `/roles/board-director/utilities.html` |
| 4 | 25.30% | `/roles/board-director/education.html` | `/roles/board-director/hospitality-food-service.html` |
| 5 | 24.94% | `/roles/board-director/healthcare-social-care.html` | `/roles/board-director/manufacturing.html` |
| 6 | 24.85% | `/roles/board-director/holding-companies.html` | `/roles/board-director/real-estate-leasing.html` |
| 7 | 24.64% | `/roles/board-director/arts-entertainment-sports.html` | `/roles/board-director/utilities.html` |
| 8 | 24.39% | `/roles/board-director/hospitality-food-service.html` | `/roles/board-director/real-estate-leasing.html` |
| 9 | 24.35% | `/roles/board-director/agriculture-food-forestry.html` | `/roles/board-director/education.html` |
| 10 | 24.32% | `/roles/board-director/construction-engineering.html` | `/roles/board-director/utilities.html` |
| 11 | 24.28% | `/roles/board-director/other-services.html` | `/roles/board-director/retail-ecommerce.html` |
| 12 | 24.17% | `/roles/board-director/healthcare-social-care.html` | `/roles/board-director/utilities.html` |
| 13 | 24.13% | `/roles/board-director/arts-entertainment-sports.html` | `/roles/board-director/construction-engineering.html` |
| 14 | 24.10% | `/roles/board-director/holding-companies.html` | `/roles/board-director/transportation-logistics.html` |
| 15 | 23.99% | `/roles/board-director/finance-insurance.html` | `/roles/board-director/manufacturing.html` |
| 16 | 23.98% | `/roles/board-director/manufacturing.html` | `/roles/board-director/real-estate-leasing.html` |
| 17 | 23.89% | `/roles/board-director/consulting-professional-services.html` | `/roles/board-director/utilities.html` |
| 18 | 23.86% | `/roles/board-director/hospitality-food-service.html` | `/roles/board-director/technology-media-telecom.html` |
| 19 | 23.85% | `/roles/board-director/consulting-professional-services.html` | `/roles/board-director/transportation-logistics.html` |
| 20 | 23.66% | `/roles/board-director/manufacturing.html` | `/roles/board-director/utilities.html` |

### ceo

Pages: 22; comparisons: 231; average overlap: 18.48%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.84% | `/roles/ceo/education.html` | `/roles/ceo/holding-companies.html` |
| 2 | 26.78% | `/roles/ceo/energy-mining-oil-gas.html` | `/roles/ceo/wholesale-distribution.html` |
| 3 | 26.52% | `/roles/ceo/consulting-professional-services.html` | `/roles/ceo/energy-mining-oil-gas.html` |
| 4 | 26.04% | `/roles/ceo/real-estate-leasing.html` | `/roles/ceo/technology-media-telecom.html` |
| 5 | 25.94% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/ceo/manufacturing.html` |
| 6 | 25.92% | `/roles/ceo/hospitality-food-service.html` | `/roles/ceo/real-estate-leasing.html` |
| 7 | 25.91% | `/roles/ceo/agriculture-food-forestry.html` | `/roles/ceo/transportation-logistics.html` |
| 8 | 25.64% | `/roles/ceo/hospitality-food-service.html` | `/roles/ceo/technology-media-telecom.html` |
| 9 | 25.55% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/ceo/other-services.html` |
| 10 | 25.14% | `/roles/ceo/other-services.html` | `/roles/ceo/public-sector-government.html` |
| 11 | 25.01% | `/roles/ceo/energy-mining-oil-gas.html` | `/roles/ceo/retail-ecommerce.html` |
| 12 | 24.99% | `/roles/ceo/finance-insurance.html` | `/roles/ceo/utilities.html` |
| 13 | 24.92% | `/roles/ceo/hospitality-food-service.html` | `/roles/ceo/retail-ecommerce.html` |
| 14 | 24.88% | `/roles/ceo/manufacturing.html` | `/roles/ceo/other-services.html` |
| 15 | 24.77% | `/roles/ceo/consulting-professional-services.html` | `/roles/ceo/retail-ecommerce.html` |
| 16 | 24.68% | `/roles/ceo/manufacturing.html` | `/roles/ceo/retail-ecommerce.html` |
| 17 | 24.68% | `/roles/ceo/business-support-facilities.html` | `/roles/ceo/manufacturing.html` |
| 18 | 24.57% | `/roles/ceo/education.html` | `/roles/ceo/wholesale-distribution.html` |
| 19 | 24.57% | `/roles/ceo/holding-companies.html` | `/roles/ceo/wholesale-distribution.html` |
| 20 | 24.52% | `/roles/ceo/agriculture-food-forestry.html` | `/roles/ceo/real-estate-leasing.html` |

### cfo

Pages: 22; comparisons: 231; average overlap: 20.71%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.38% | `/roles/cfo/education.html` | `/roles/cfo/retail-ecommerce.html` |
| 2 | 27.35% | `/roles/cfo/transportation-logistics.html` | `/roles/cfo/utilities.html` |
| 3 | 27.19% | `/roles/cfo/legal-services.html` | `/roles/cfo/other-services.html` |
| 4 | 26.43% | `/roles/cfo/legal-services.html` | `/roles/cfo/wholesale-distribution.html` |
| 5 | 26.34% | `/roles/cfo/construction-engineering.html` | `/roles/cfo/utilities.html` |
| 6 | 26.24% | `/roles/cfo/business-support-facilities.html` | `/roles/cfo/other-services.html` |
| 7 | 26.13% | `/roles/cfo/manufacturing.html` | `/roles/cfo/public-sector-government.html` |
| 8 | 25.61% | `/roles/cfo/hospitality-food-service.html` | `/roles/cfo/legal-services.html` |
| 9 | 25.53% | `/roles/cfo/healthcare-social-care.html` | `/roles/cfo/utilities.html` |
| 10 | 25.46% | `/roles/cfo/construction-engineering.html` | `/roles/cfo/healthcare-social-care.html` |
| 11 | 25.45% | `/roles/cfo/arts-entertainment-sports.html` | `/roles/cfo/education.html` |
| 12 | 25.28% | `/roles/cfo/legal-services.html` | `/roles/cfo/public-sector-government.html` |
| 13 | 25.20% | `/roles/cfo/business-support-facilities.html` | `/roles/cfo/wholesale-distribution.html` |
| 14 | 25.16% | `/roles/cfo/energy-mining-oil-gas.html` | `/roles/cfo/hospitality-food-service.html` |
| 15 | 25.04% | `/roles/cfo/manufacturing.html` | `/roles/cfo/retail-ecommerce.html` |
| 16 | 25.04% | `/roles/cfo/business-support-facilities.html` | `/roles/cfo/legal-services.html` |
| 17 | 25.02% | `/roles/cfo/other-services.html` | `/roles/cfo/wholesale-distribution.html` |
| 18 | 24.93% | `/roles/cfo/legal-services.html` | `/roles/cfo/retail-ecommerce.html` |
| 19 | 24.92% | `/roles/cfo/healthcare-social-care.html` | `/roles/cfo/holding-companies.html` |
| 20 | 24.86% | `/roles/cfo/healthcare-social-care.html` | `/roles/cfo/public-sector-government.html` |

### chair

Pages: 22; comparisons: 231; average overlap: 19.30%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.18% | `/roles/chair/legal-services.html` | `/roles/chair/utilities.html` |
| 2 | 25.40% | `/roles/chair/holding-companies.html` | `/roles/chair/manufacturing.html` |
| 3 | 25.06% | `/roles/chair/manufacturing.html` | `/roles/chair/other-services.html` |
| 4 | 24.99% | `/roles/chair/public-sector-government.html` | `/roles/chair/utilities.html` |
| 5 | 24.51% | `/roles/chair/retail-ecommerce.html` | `/roles/chair/transportation-logistics.html` |
| 6 | 24.40% | `/roles/chair/consulting-professional-services.html` | `/roles/chair/wholesale-distribution.html` |
| 7 | 24.29% | `/roles/chair/legal-services.html` | `/roles/chair/retail-ecommerce.html` |
| 8 | 24.27% | `/roles/chair/consulting-professional-services.html` | `/roles/chair/utilities.html` |
| 9 | 24.08% | `/roles/chair/hospitality-food-service.html` | `/roles/chair/legal-services.html` |
| 10 | 23.88% | `/roles/chair/education.html` | `/roles/chair/healthcare-social-care.html` |
| 11 | 23.72% | `/roles/chair/construction-engineering.html` | `/roles/chair/utilities.html` |
| 12 | 23.68% | `/roles/chair/hospitality-food-service.html` | `/roles/chair/utilities.html` |
| 13 | 23.51% | `/roles/chair/energy-mining-oil-gas.html` | `/roles/chair/holding-companies.html` |
| 14 | 23.50% | `/roles/chair/finance-insurance.html` | `/roles/chair/utilities.html` |
| 15 | 23.27% | `/roles/chair/education.html` | `/roles/chair/utilities.html` |
| 16 | 23.08% | `/roles/chair/energy-mining-oil-gas.html` | `/roles/chair/other-services.html` |
| 17 | 23.03% | `/roles/chair/construction-engineering.html` | `/roles/chair/other-services.html` |
| 18 | 22.96% | `/roles/chair/education.html` | `/roles/chair/other-services.html` |
| 19 | 22.86% | `/roles/chair/healthcare-social-care.html` | `/roles/chair/utilities.html` |
| 20 | 22.79% | `/roles/chair/education.html` | `/roles/chair/finance-insurance.html` |

### chief-product-officer

Pages: 22; comparisons: 231; average overlap: 20.79%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.27% | `/roles/chief-product-officer/energy-mining-oil-gas.html` | `/roles/chief-product-officer/legal-services.html` |
| 2 | 26.81% | `/roles/chief-product-officer/education.html` | `/roles/chief-product-officer/finance-insurance.html` |
| 3 | 26.51% | `/roles/chief-product-officer/arts-entertainment-sports.html` | `/roles/chief-product-officer/education.html` |
| 4 | 26.46% | `/roles/chief-product-officer/education.html` | `/roles/chief-product-officer/retail-ecommerce.html` |
| 5 | 25.95% | `/roles/chief-product-officer/construction-engineering.html` | `/roles/chief-product-officer/legal-services.html` |
| 6 | 25.88% | `/roles/chief-product-officer/manufacturing.html` | `/roles/chief-product-officer/technology-media-telecom.html` |
| 7 | 25.75% | `/roles/chief-product-officer/education.html` | `/roles/chief-product-officer/manufacturing.html` |
| 8 | 25.75% | `/roles/chief-product-officer/energy-mining-oil-gas.html` | `/roles/chief-product-officer/healthcare-social-care.html` |
| 9 | 25.75% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/chief-product-officer/healthcare-social-care.html` |
| 10 | 25.68% | `/roles/chief-product-officer/healthcare-social-care.html` | `/roles/chief-product-officer/retail-ecommerce.html` |
| 11 | 25.64% | `/roles/chief-product-officer/arts-entertainment-sports.html` | `/roles/chief-product-officer/legal-services.html` |
| 12 | 25.62% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/chief-product-officer/wholesale-distribution.html` |
| 13 | 25.59% | `/roles/chief-product-officer/arts-entertainment-sports.html` | `/roles/chief-product-officer/utilities.html` |
| 14 | 25.25% | `/roles/chief-product-officer/education.html` | `/roles/chief-product-officer/hospitality-food-service.html` |
| 15 | 25.25% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/chief-product-officer/legal-services.html` |
| 16 | 25.17% | `/roles/chief-product-officer/hospitality-food-service.html` | `/roles/chief-product-officer/public-sector-government.html` |
| 17 | 25.17% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/chief-product-officer/energy-mining-oil-gas.html` |
| 18 | 25.11% | `/roles/chief-product-officer/education.html` | `/roles/chief-product-officer/real-estate-leasing.html` |
| 19 | 25.06% | `/roles/chief-product-officer/legal-services.html` | `/roles/chief-product-officer/utilities.html` |
| 20 | 25.01% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/chief-product-officer/other-services.html` |

### chief-revenue-officer

Pages: 22; comparisons: 231; average overlap: 20.10%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.74% | `/roles/chief-revenue-officer/manufacturing.html` | `/roles/chief-revenue-officer/other-services.html` |
| 2 | 27.26% | `/roles/chief-revenue-officer/legal-services.html` | `/roles/chief-revenue-officer/retail-ecommerce.html` |
| 3 | 27.21% | `/roles/chief-revenue-officer/consulting-professional-services.html` | `/roles/chief-revenue-officer/other-services.html` |
| 4 | 26.77% | `/roles/chief-revenue-officer/healthcare-social-care.html` | `/roles/chief-revenue-officer/manufacturing.html` |
| 5 | 26.65% | `/roles/chief-revenue-officer/finance-insurance.html` | `/roles/chief-revenue-officer/public-sector-government.html` |
| 6 | 26.18% | `/roles/chief-revenue-officer/construction-engineering.html` | `/roles/chief-revenue-officer/utilities.html` |
| 7 | 25.81% | `/roles/chief-revenue-officer/public-sector-government.html` | `/roles/chief-revenue-officer/technology-media-telecom.html` |
| 8 | 25.21% | `/roles/chief-revenue-officer/construction-engineering.html` | `/roles/chief-revenue-officer/manufacturing.html` |
| 9 | 25.21% | `/roles/chief-revenue-officer/consulting-professional-services.html` | `/roles/chief-revenue-officer/manufacturing.html` |
| 10 | 24.96% | `/roles/chief-revenue-officer/manufacturing.html` | `/roles/chief-revenue-officer/technology-media-telecom.html` |
| 11 | 24.87% | `/roles/chief-revenue-officer/consulting-professional-services.html` | `/roles/chief-revenue-officer/healthcare-social-care.html` |
| 12 | 24.73% | `/roles/chief-revenue-officer/business-support-facilities.html` | `/roles/chief-revenue-officer/retail-ecommerce.html` |
| 13 | 24.70% | `/roles/chief-revenue-officer/energy-mining-oil-gas.html` | `/roles/chief-revenue-officer/other-services.html` |
| 14 | 24.68% | `/roles/chief-revenue-officer/finance-insurance.html` | `/roles/chief-revenue-officer/technology-media-telecom.html` |
| 15 | 24.62% | `/roles/chief-revenue-officer/healthcare-social-care.html` | `/roles/chief-revenue-officer/other-services.html` |
| 16 | 24.57% | `/roles/chief-revenue-officer/consulting-professional-services.html` | `/roles/chief-revenue-officer/transportation-logistics.html` |
| 17 | 24.55% | `/roles/chief-revenue-officer/energy-mining-oil-gas.html` | `/roles/chief-revenue-officer/wholesale-distribution.html` |
| 18 | 24.51% | `/roles/chief-revenue-officer/manufacturing.html` | `/roles/chief-revenue-officer/retail-ecommerce.html` |
| 19 | 24.28% | `/roles/chief-revenue-officer/arts-entertainment-sports.html` | `/roles/chief-revenue-officer/holding-companies.html` |
| 20 | 24.20% | `/roles/chief-revenue-officer/agriculture-food-forestry.html` | `/roles/chief-revenue-officer/arts-entertainment-sports.html` |

### chief-strategy-officer

Pages: 22; comparisons: 231; average overlap: 21.04%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.17% | `/roles/chief-strategy-officer/real-estate-leasing.html` | `/roles/chief-strategy-officer/transportation-logistics.html` |
| 2 | 27.72% | `/roles/chief-strategy-officer/consulting-professional-services.html` | `/roles/chief-strategy-officer/utilities.html` |
| 3 | 27.67% | `/roles/chief-strategy-officer/technology-media-telecom.html` | `/roles/chief-strategy-officer/wholesale-distribution.html` |
| 4 | 26.87% | `/roles/chief-strategy-officer/agriculture-food-forestry.html` | `/roles/chief-strategy-officer/manufacturing.html` |
| 5 | 26.81% | `/roles/chief-strategy-officer/real-estate-leasing.html` | `/roles/chief-strategy-officer/utilities.html` |
| 6 | 26.77% | `/roles/chief-strategy-officer/construction-engineering.html` | `/roles/chief-strategy-officer/manufacturing.html` |
| 7 | 26.66% | `/roles/chief-strategy-officer/energy-mining-oil-gas.html` | `/roles/chief-strategy-officer/real-estate-leasing.html` |
| 8 | 26.65% | `/roles/chief-strategy-officer/construction-engineering.html` | `/roles/chief-strategy-officer/legal-services.html` |
| 9 | 26.56% | `/roles/chief-strategy-officer/arts-entertainment-sports.html` | `/roles/chief-strategy-officer/consulting-professional-services.html` |
| 10 | 26.42% | `/roles/chief-strategy-officer/hospitality-food-service.html` | `/roles/chief-strategy-officer/technology-media-telecom.html` |
| 11 | 26.32% | `/roles/chief-strategy-officer/manufacturing.html` | `/roles/chief-strategy-officer/transportation-logistics.html` |
| 12 | 26.27% | `/roles/chief-strategy-officer/business-support-facilities.html` | `/roles/chief-strategy-officer/consulting-professional-services.html` |
| 13 | 26.13% | `/roles/chief-strategy-officer/arts-entertainment-sports.html` | `/roles/chief-strategy-officer/technology-media-telecom.html` |
| 14 | 25.83% | `/roles/chief-strategy-officer/manufacturing.html` | `/roles/chief-strategy-officer/other-services.html` |
| 15 | 25.63% | `/roles/chief-strategy-officer/agriculture-food-forestry.html` | `/roles/chief-strategy-officer/utilities.html` |
| 16 | 25.56% | `/roles/chief-strategy-officer/healthcare-social-care.html` | `/roles/chief-strategy-officer/real-estate-leasing.html` |
| 17 | 25.25% | `/roles/chief-strategy-officer/energy-mining-oil-gas.html` | `/roles/chief-strategy-officer/transportation-logistics.html` |
| 18 | 25.24% | `/roles/chief-strategy-officer/arts-entertainment-sports.html` | `/roles/chief-strategy-officer/utilities.html` |
| 19 | 25.19% | `/roles/chief-strategy-officer/other-services.html` | `/roles/chief-strategy-officer/technology-media-telecom.html` |
| 20 | 25.11% | `/roles/chief-strategy-officer/business-support-facilities.html` | `/roles/chief-strategy-officer/legal-services.html` |

### chro

Pages: 22; comparisons: 231; average overlap: 20.94%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.04% | `/roles/chro/energy-mining-oil-gas.html` | `/roles/chro/public-sector-government.html` |
| 2 | 27.61% | `/roles/chro/energy-mining-oil-gas.html` | `/roles/chro/legal-services.html` |
| 3 | 27.14% | `/roles/chro/business-support-facilities.html` | `/roles/chro/transportation-logistics.html` |
| 4 | 27.08% | `/roles/chro/arts-entertainment-sports.html` | `/roles/chro/technology-media-telecom.html` |
| 5 | 26.96% | `/roles/chro/legal-services.html` | `/roles/chro/retail-ecommerce.html` |
| 6 | 26.92% | `/roles/chro/healthcare-social-care.html` | `/roles/chro/wholesale-distribution.html` |
| 7 | 26.67% | `/roles/chro/healthcare-social-care.html` | `/roles/chro/transportation-logistics.html` |
| 8 | 26.35% | `/roles/chro/legal-services.html` | `/roles/chro/other-services.html` |
| 9 | 26.28% | `/roles/chro/legal-services.html` | `/roles/chro/public-sector-government.html` |
| 10 | 26.16% | `/roles/chro/agriculture-food-forestry.html` | `/roles/chro/education.html` |
| 11 | 25.95% | `/roles/chro/construction-engineering.html` | `/roles/chro/healthcare-social-care.html` |
| 12 | 25.38% | `/roles/chro/legal-services.html` | `/roles/chro/manufacturing.html` |
| 13 | 25.36% | `/roles/chro/energy-mining-oil-gas.html` | `/roles/chro/retail-ecommerce.html` |
| 14 | 25.19% | `/roles/chro/consulting-professional-services.html` | `/roles/chro/healthcare-social-care.html` |
| 15 | 25.07% | `/roles/chro/construction-engineering.html` | `/roles/chro/wholesale-distribution.html` |
| 16 | 25.05% | `/roles/chro/education.html` | `/roles/chro/manufacturing.html` |
| 17 | 24.98% | `/roles/chro/energy-mining-oil-gas.html` | `/roles/chro/wholesale-distribution.html` |
| 18 | 24.96% | `/roles/chro/hospitality-food-service.html` | `/roles/chro/manufacturing.html` |
| 19 | 24.92% | `/roles/chro/construction-engineering.html` | `/roles/chro/transportation-logistics.html` |
| 20 | 24.89% | `/roles/chro/business-support-facilities.html` | `/roles/chro/finance-insurance.html` |

### cio

Pages: 22; comparisons: 231; average overlap: 20.78%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.51% | `/roles/cio/education.html` | `/roles/cio/wholesale-distribution.html` |
| 2 | 26.09% | `/roles/cio/transportation-logistics.html` | `/roles/cio/utilities.html` |
| 3 | 26.00% | `/roles/cio/construction-engineering.html` | `/roles/cio/real-estate-leasing.html` |
| 4 | 25.92% | `/roles/cio/manufacturing.html` | `/roles/cio/transportation-logistics.html` |
| 5 | 25.86% | `/roles/cio/education.html` | `/roles/cio/hospitality-food-service.html` |
| 6 | 25.77% | `/roles/cio/manufacturing.html` | `/roles/cio/wholesale-distribution.html` |
| 7 | 25.71% | `/roles/cio/manufacturing.html` | `/roles/cio/utilities.html` |
| 8 | 25.64% | `/roles/cio/healthcare-social-care.html` | `/roles/cio/manufacturing.html` |
| 9 | 25.38% | `/roles/cio/manufacturing.html` | `/roles/cio/real-estate-leasing.html` |
| 10 | 25.35% | `/roles/cio/consulting-professional-services.html` | `/roles/cio/other-services.html` |
| 11 | 25.15% | `/roles/cio/public-sector-government.html` | `/roles/cio/utilities.html` |
| 12 | 25.09% | `/roles/cio/education.html` | `/roles/cio/healthcare-social-care.html` |
| 13 | 25.09% | `/roles/cio/agriculture-food-forestry.html` | `/roles/cio/real-estate-leasing.html` |
| 14 | 25.04% | `/roles/cio/construction-engineering.html` | `/roles/cio/manufacturing.html` |
| 15 | 24.99% | `/roles/cio/construction-engineering.html` | `/roles/cio/utilities.html` |
| 16 | 24.71% | `/roles/cio/arts-entertainment-sports.html` | `/roles/cio/real-estate-leasing.html` |
| 17 | 24.55% | `/roles/cio/construction-engineering.html` | `/roles/cio/wholesale-distribution.html` |
| 18 | 24.51% | `/roles/cio/healthcare-social-care.html` | `/roles/cio/transportation-logistics.html` |
| 19 | 24.50% | `/roles/cio/healthcare-social-care.html` | `/roles/cio/wholesale-distribution.html` |
| 20 | 24.37% | `/roles/cio/agriculture-food-forestry.html` | `/roles/cio/arts-entertainment-sports.html` |

### ciso

Pages: 22; comparisons: 231; average overlap: 21.09%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.46% | `/roles/ciso/finance-insurance.html` | `/roles/ciso/legal-services.html` |
| 2 | 27.91% | `/roles/ciso/construction-engineering.html` | `/roles/ciso/utilities.html` |
| 3 | 27.65% | `/roles/ciso/consulting-professional-services.html` | `/roles/ciso/manufacturing.html` |
| 4 | 27.35% | `/roles/ciso/education.html` | `/roles/ciso/public-sector-government.html` |
| 5 | 26.89% | `/roles/ciso/construction-engineering.html` | `/roles/ciso/education.html` |
| 6 | 26.84% | `/roles/ciso/legal-services.html` | `/roles/ciso/other-services.html` |
| 7 | 26.80% | `/roles/ciso/construction-engineering.html` | `/roles/ciso/retail-ecommerce.html` |
| 8 | 26.74% | `/roles/ciso/agriculture-food-forestry.html` | `/roles/ciso/retail-ecommerce.html` |
| 9 | 26.52% | `/roles/ciso/agriculture-food-forestry.html` | `/roles/ciso/construction-engineering.html` |
| 10 | 26.51% | `/roles/ciso/finance-insurance.html` | `/roles/ciso/other-services.html` |
| 11 | 26.30% | `/roles/ciso/technology-media-telecom.html` | `/roles/ciso/wholesale-distribution.html` |
| 12 | 26.24% | `/roles/ciso/education.html` | `/roles/ciso/retail-ecommerce.html` |
| 13 | 26.20% | `/roles/ciso/retail-ecommerce.html` | `/roles/ciso/utilities.html` |
| 14 | 26.00% | `/roles/ciso/education.html` | `/roles/ciso/real-estate-leasing.html` |
| 15 | 25.84% | `/roles/ciso/other-services.html` | `/roles/ciso/transportation-logistics.html` |
| 16 | 25.55% | `/roles/ciso/legal-services.html` | `/roles/ciso/transportation-logistics.html` |
| 17 | 25.54% | `/roles/ciso/healthcare-social-care.html` | `/roles/ciso/transportation-logistics.html` |
| 18 | 25.39% | `/roles/ciso/legal-services.html` | `/roles/ciso/technology-media-telecom.html` |
| 19 | 25.37% | `/roles/ciso/agriculture-food-forestry.html` | `/roles/ciso/finance-insurance.html` |
| 20 | 25.34% | `/roles/ciso/education.html` | `/roles/ciso/utilities.html` |

### cmo

Pages: 22; comparisons: 231; average overlap: 20.85%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.55% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/healthcare-social-care.html` |
| 2 | 27.33% | `/roles/cmo/hospitality-food-service.html` | `/roles/cmo/other-services.html` |
| 3 | 27.32% | `/roles/cmo/finance-insurance.html` | `/roles/cmo/manufacturing.html` |
| 4 | 26.77% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/transportation-logistics.html` |
| 5 | 26.30% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/technology-media-telecom.html` |
| 6 | 26.12% | `/roles/cmo/real-estate-leasing.html` | `/roles/cmo/wholesale-distribution.html` |
| 7 | 26.06% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/wholesale-distribution.html` |
| 8 | 25.88% | `/roles/cmo/manufacturing.html` | `/roles/cmo/utilities.html` |
| 9 | 25.80% | `/roles/cmo/public-sector-government.html` | `/roles/cmo/technology-media-telecom.html` |
| 10 | 25.46% | `/roles/cmo/holding-companies.html` | `/roles/cmo/transportation-logistics.html` |
| 11 | 25.36% | `/roles/cmo/holding-companies.html` | `/roles/cmo/wholesale-distribution.html` |
| 12 | 25.18% | `/roles/cmo/finance-insurance.html` | `/roles/cmo/other-services.html` |
| 13 | 24.96% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/manufacturing.html` |
| 14 | 24.87% | `/roles/cmo/healthcare-social-care.html` | `/roles/cmo/utilities.html` |
| 15 | 24.77% | `/roles/cmo/business-support-facilities.html` | `/roles/cmo/transportation-logistics.html` |
| 16 | 24.74% | `/roles/cmo/other-services.html` | `/roles/cmo/utilities.html` |
| 17 | 24.74% | `/roles/cmo/consulting-professional-services.html` | `/roles/cmo/legal-services.html` |
| 18 | 24.72% | `/roles/cmo/finance-insurance.html` | `/roles/cmo/transportation-logistics.html` |
| 19 | 24.63% | `/roles/cmo/transportation-logistics.html` | `/roles/cmo/wholesale-distribution.html` |
| 20 | 24.58% | `/roles/cmo/arts-entertainment-sports.html` | `/roles/cmo/finance-insurance.html` |

### coo

Pages: 22; comparisons: 231; average overlap: 21.03%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.62% | `/roles/coo/business-support-facilities.html` | `/roles/coo/other-services.html` |
| 2 | 27.40% | `/roles/coo/agriculture-food-forestry.html` | `/roles/coo/real-estate-leasing.html` |
| 3 | 27.32% | `/roles/coo/hospitality-food-service.html` | `/roles/coo/manufacturing.html` |
| 4 | 27.17% | `/roles/coo/healthcare-social-care.html` | `/roles/coo/legal-services.html` |
| 5 | 27.16% | `/roles/coo/real-estate-leasing.html` | `/roles/coo/technology-media-telecom.html` |
| 6 | 26.82% | `/roles/coo/hospitality-food-service.html` | `/roles/coo/utilities.html` |
| 7 | 26.76% | `/roles/coo/agriculture-food-forestry.html` | `/roles/coo/technology-media-telecom.html` |
| 8 | 26.29% | `/roles/coo/consulting-professional-services.html` | `/roles/coo/legal-services.html` |
| 9 | 26.11% | `/roles/coo/consulting-professional-services.html` | `/roles/coo/transportation-logistics.html` |
| 10 | 26.09% | `/roles/coo/legal-services.html` | `/roles/coo/transportation-logistics.html` |
| 11 | 25.87% | `/roles/coo/finance-insurance.html` | `/roles/coo/hospitality-food-service.html` |
| 12 | 25.84% | `/roles/coo/manufacturing.html` | `/roles/coo/public-sector-government.html` |
| 13 | 25.78% | `/roles/coo/healthcare-social-care.html` | `/roles/coo/hospitality-food-service.html` |
| 14 | 25.71% | `/roles/coo/legal-services.html` | `/roles/coo/other-services.html` |
| 15 | 25.62% | `/roles/coo/healthcare-social-care.html` | `/roles/coo/other-services.html` |
| 16 | 25.57% | `/roles/coo/energy-mining-oil-gas.html` | `/roles/coo/transportation-logistics.html` |
| 17 | 25.56% | `/roles/coo/construction-engineering.html` | `/roles/coo/education.html` |
| 18 | 25.53% | `/roles/coo/legal-services.html` | `/roles/coo/utilities.html` |
| 19 | 25.43% | `/roles/coo/manufacturing.html` | `/roles/coo/utilities.html` |
| 20 | 25.17% | `/roles/coo/education.html` | `/roles/coo/retail-ecommerce.html` |

### cto

Pages: 22; comparisons: 231; average overlap: 20.76%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.64% | `/roles/cto/education.html` | `/roles/cto/real-estate-leasing.html` |
| 2 | 28.75% | `/roles/cto/arts-entertainment-sports.html` | `/roles/cto/retail-ecommerce.html` |
| 3 | 27.97% | `/roles/cto/education.html` | `/roles/cto/holding-companies.html` |
| 4 | 27.81% | `/roles/cto/other-services.html` | `/roles/cto/utilities.html` |
| 5 | 26.75% | `/roles/cto/education.html` | `/roles/cto/hospitality-food-service.html` |
| 6 | 26.47% | `/roles/cto/arts-entertainment-sports.html` | `/roles/cto/education.html` |
| 7 | 26.22% | `/roles/cto/finance-insurance.html` | `/roles/cto/transportation-logistics.html` |
| 8 | 26.12% | `/roles/cto/legal-services.html` | `/roles/cto/other-services.html` |
| 9 | 26.08% | `/roles/cto/manufacturing.html` | `/roles/cto/wholesale-distribution.html` |
| 10 | 26.00% | `/roles/cto/construction-engineering.html` | `/roles/cto/manufacturing.html` |
| 11 | 25.97% | `/roles/cto/energy-mining-oil-gas.html` | `/roles/cto/technology-media-telecom.html` |
| 12 | 25.91% | `/roles/cto/manufacturing.html` | `/roles/cto/utilities.html` |
| 13 | 25.77% | `/roles/cto/agriculture-food-forestry.html` | `/roles/cto/manufacturing.html` |
| 14 | 25.68% | `/roles/cto/manufacturing.html` | `/roles/cto/transportation-logistics.html` |
| 15 | 25.63% | `/roles/cto/arts-entertainment-sports.html` | `/roles/cto/manufacturing.html` |
| 16 | 25.19% | `/roles/cto/construction-engineering.html` | `/roles/cto/utilities.html` |
| 17 | 25.14% | `/roles/cto/arts-entertainment-sports.html` | `/roles/cto/other-services.html` |
| 18 | 25.03% | `/roles/cto/healthcare-social-care.html` | `/roles/cto/manufacturing.html` |
| 19 | 24.91% | `/roles/cto/technology-media-telecom.html` | `/roles/cto/utilities.html` |
| 20 | 24.90% | `/roles/cto/agriculture-food-forestry.html` | `/roles/cto/finance-insurance.html` |

### director-engineering

Pages: 9; comparisons: 36; average overlap: 18.98%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.18% | `/roles/director-engineering/energy-mining-oil-gas.html` | `/roles/director-engineering/utilities.html` |
| 2 | 24.27% | `/roles/director-engineering/healthcare-social-care.html` | `/roles/director-engineering/utilities.html` |
| 3 | 24.23% | `/roles/director-engineering/manufacturing.html` | `/roles/director-engineering/transportation-logistics.html` |
| 4 | 23.72% | `/roles/director-engineering/energy-mining-oil-gas.html` | `/roles/director-engineering/transportation-logistics.html` |
| 5 | 23.61% | `/roles/director-engineering/healthcare-social-care.html` | `/roles/director-engineering/manufacturing.html` |
| 6 | 23.31% | `/roles/director-engineering/construction-engineering.html` | `/roles/director-engineering/finance-insurance.html` |
| 7 | 23.31% | `/roles/director-engineering/construction-engineering.html` | `/roles/director-engineering/manufacturing.html` |
| 8 | 22.96% | `/roles/director-engineering/finance-insurance.html` | `/roles/director-engineering/transportation-logistics.html` |
| 9 | 22.88% | `/roles/director-engineering/healthcare-social-care.html` | `/roles/director-engineering/transportation-logistics.html` |
| 10 | 22.82% | `/roles/director-engineering/transportation-logistics.html` | `/roles/director-engineering/utilities.html` |
| 11 | 22.65% | `/roles/director-engineering/manufacturing.html` | `/roles/director-engineering/utilities.html` |
| 12 | 22.56% | `/roles/director-engineering/finance-insurance.html` | `/roles/director-engineering/technology-media-telecom.html` |
| 13 | 22.36% | `/roles/director-engineering/healthcare-social-care.html` | `/roles/director-engineering/technology-media-telecom.html` |
| 14 | 22.24% | `/roles/director-engineering/construction-engineering.html` | `/roles/director-engineering/technology-media-telecom.html` |
| 15 | 22.19% | `/roles/director-engineering/finance-insurance.html` | `/roles/director-engineering/healthcare-social-care.html` |
| 16 | 21.93% | `/roles/director-engineering/construction-engineering.html` | `/roles/director-engineering/transportation-logistics.html` |
| 17 | 21.93% | `/roles/director-engineering/technology-media-telecom.html` | `/roles/director-engineering/utilities.html` |
| 18 | 21.57% | `/roles/director-engineering/finance-insurance.html` | `/roles/director-engineering/manufacturing.html` |
| 19 | 20.72% | `/roles/director-engineering/construction-engineering.html` | `/roles/director-engineering/utilities.html` |
| 20 | 20.71% | `/roles/director-engineering/energy-mining-oil-gas.html` | `/roles/director-engineering/healthcare-social-care.html` |

### director-finance

Pages: 9; comparisons: 36; average overlap: 18.61%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 24.31% | `/roles/director-finance/education.html` | `/roles/director-finance/finance-insurance.html` |
| 2 | 24.17% | `/roles/director-finance/holding-companies.html` | `/roles/director-finance/manufacturing.html` |
| 3 | 24.16% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-finance/holding-companies.html` |
| 4 | 24.07% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-finance/real-estate-leasing.html` |
| 5 | 24.00% | `/roles/director-finance/real-estate-leasing.html` | `/roles/director-finance/technology-media-telecom.html` |
| 6 | 23.98% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-finance/technology-media-telecom.html` |
| 7 | 22.90% | `/roles/director-finance/manufacturing.html` | `/roles/director-finance/real-estate-leasing.html` |
| 8 | 22.39% | `/roles/director-finance/holding-companies.html` | `/roles/director-finance/technology-media-telecom.html` |
| 9 | 22.10% | `/roles/director-finance/finance-insurance.html` | `/roles/director-finance/healthcare-social-care.html` |
| 10 | 21.75% | `/roles/director-finance/education.html` | `/roles/director-finance/holding-companies.html` |
| 11 | 21.57% | `/roles/director-finance/education.html` | `/roles/director-finance/public-sector-government.html` |
| 12 | 21.51% | `/roles/director-finance/holding-companies.html` | `/roles/director-finance/real-estate-leasing.html` |
| 13 | 21.44% | `/roles/director-finance/finance-insurance.html` | `/roles/director-finance/holding-companies.html` |
| 14 | 21.37% | `/roles/director-finance/holding-companies.html` | `/roles/director-finance/public-sector-government.html` |
| 15 | 21.33% | `/roles/director-finance/public-sector-government.html` | `/roles/director-finance/technology-media-telecom.html` |
| 16 | 21.17% | `/roles/director-finance/education.html` | `/roles/director-finance/technology-media-telecom.html` |
| 17 | 20.95% | `/roles/director-finance/manufacturing.html` | `/roles/director-finance/technology-media-telecom.html` |
| 18 | 20.88% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-finance/public-sector-government.html` |
| 19 | 20.82% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-finance/manufacturing.html` |
| 20 | 20.78% | `/roles/director-finance/public-sector-government.html` | `/roles/director-finance/real-estate-leasing.html` |

### director-legal

Pages: 9; comparisons: 36; average overlap: 18.87%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 25.99% | `/roles/director-legal/legal-services.html` | `/roles/director-legal/technology-media-telecom.html` |
| 2 | 25.78% | `/roles/director-legal/consulting-professional-services.html` | `/roles/director-legal/real-estate-leasing.html` |
| 3 | 24.77% | `/roles/director-legal/healthcare-social-care.html` | `/roles/director-legal/legal-services.html` |
| 4 | 23.76% | `/roles/director-legal/consulting-professional-services.html` | `/roles/director-legal/legal-services.html` |
| 5 | 23.19% | `/roles/director-legal/finance-insurance.html` | `/roles/director-legal/public-sector-government.html` |
| 6 | 22.98% | `/roles/director-legal/holding-companies.html` | `/roles/director-legal/legal-services.html` |
| 7 | 22.46% | `/roles/director-legal/healthcare-social-care.html` | `/roles/director-legal/holding-companies.html` |
| 8 | 22.24% | `/roles/director-legal/consulting-professional-services.html` | `/roles/director-legal/healthcare-social-care.html` |
| 9 | 22.24% | `/roles/director-legal/finance-insurance.html` | `/roles/director-legal/real-estate-leasing.html` |
| 10 | 22.03% | `/roles/director-legal/healthcare-social-care.html` | `/roles/director-legal/public-sector-government.html` |
| 11 | 22.00% | `/roles/director-legal/public-sector-government.html` | `/roles/director-legal/technology-media-telecom.html` |
| 12 | 21.99% | `/roles/director-legal/holding-companies.html` | `/roles/director-legal/technology-media-telecom.html` |
| 13 | 21.86% | `/roles/director-legal/holding-companies.html` | `/roles/director-legal/real-estate-leasing.html` |
| 14 | 21.84% | `/roles/director-legal/holding-companies.html` | `/roles/director-legal/public-sector-government.html` |
| 15 | 21.67% | `/roles/director-legal/finance-insurance.html` | `/roles/director-legal/technology-media-telecom.html` |
| 16 | 21.55% | `/roles/director-legal/real-estate-leasing.html` | `/roles/director-legal/technology-media-telecom.html` |
| 17 | 21.47% | `/roles/director-legal/legal-services.html` | `/roles/director-legal/public-sector-government.html` |
| 18 | 21.35% | `/roles/director-legal/finance-insurance.html` | `/roles/director-legal/holding-companies.html` |
| 19 | 21.26% | `/roles/director-legal/healthcare-social-care.html` | `/roles/director-legal/technology-media-telecom.html` |
| 20 | 21.01% | `/roles/director-legal/legal-services.html` | `/roles/director-legal/real-estate-leasing.html` |

### director-marketing

Pages: 9; comparisons: 36; average overlap: 18.93%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.16% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/real-estate-leasing.html` |
| 2 | 25.14% | `/roles/director-marketing/finance-insurance.html` | `/roles/director-marketing/real-estate-leasing.html` |
| 3 | 24.60% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 4 | 24.52% | `/roles/director-marketing/consulting-professional-services.html` | `/roles/director-marketing/healthcare-social-care.html` |
| 5 | 24.08% | `/roles/director-marketing/finance-insurance.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 6 | 23.86% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/healthcare-social-care.html` |
| 7 | 23.45% | `/roles/director-marketing/real-estate-leasing.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 8 | 23.38% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 9 | 23.17% | `/roles/director-marketing/finance-insurance.html` | `/roles/director-marketing/healthcare-social-care.html` |
| 10 | 22.90% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/finance-insurance.html` |
| 11 | 22.55% | `/roles/director-marketing/healthcare-social-care.html` | `/roles/director-marketing/retail-ecommerce.html` |
| 12 | 22.43% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/hospitality-food-service.html` |
| 13 | 22.35% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/consulting-professional-services.html` |
| 14 | 22.33% | `/roles/director-marketing/healthcare-social-care.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 15 | 22.01% | `/roles/director-marketing/arts-entertainment-sports.html` | `/roles/director-marketing/retail-ecommerce.html` |
| 16 | 21.79% | `/roles/director-marketing/retail-ecommerce.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 17 | 21.74% | `/roles/director-marketing/real-estate-leasing.html` | `/roles/director-marketing/retail-ecommerce.html` |
| 18 | 21.68% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/director-marketing/real-estate-leasing.html` |
| 19 | 21.36% | `/roles/director-marketing/consulting-professional-services.html` | `/roles/director-marketing/finance-insurance.html` |
| 20 | 20.68% | `/roles/director-marketing/consulting-professional-services.html` | `/roles/director-marketing/real-estate-leasing.html` |

### director-operations

Pages: 9; comparisons: 36; average overlap: 18.67%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.86% | `/roles/director-operations/retail-ecommerce.html` | `/roles/director-operations/utilities.html` |
| 2 | 25.40% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-operations/retail-ecommerce.html` |
| 3 | 24.89% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-operations/utilities.html` |
| 4 | 24.20% | `/roles/director-operations/business-support-facilities.html` | `/roles/director-operations/transportation-logistics.html` |
| 5 | 23.83% | `/roles/director-operations/agriculture-food-forestry.html` | `/roles/director-operations/manufacturing.html` |
| 6 | 23.30% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-operations/hospitality-food-service.html` |
| 7 | 22.52% | `/roles/director-operations/hospitality-food-service.html` | `/roles/director-operations/transportation-logistics.html` |
| 8 | 22.46% | `/roles/director-operations/manufacturing.html` | `/roles/director-operations/utilities.html` |
| 9 | 22.37% | `/roles/director-operations/hospitality-food-service.html` | `/roles/director-operations/manufacturing.html` |
| 10 | 22.33% | `/roles/director-operations/agriculture-food-forestry.html` | `/roles/director-operations/transportation-logistics.html` |
| 11 | 22.25% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-operations/manufacturing.html` |
| 12 | 21.84% | `/roles/director-operations/business-support-facilities.html` | `/roles/director-operations/manufacturing.html` |
| 13 | 21.51% | `/roles/director-operations/agriculture-food-forestry.html` | `/roles/director-operations/healthcare-social-care.html` |
| 14 | 21.46% | `/roles/director-operations/transportation-logistics.html` | `/roles/director-operations/utilities.html` |
| 15 | 21.37% | `/roles/director-operations/hospitality-food-service.html` | `/roles/director-operations/retail-ecommerce.html` |
| 16 | 21.05% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-operations/transportation-logistics.html` |
| 17 | 20.77% | `/roles/director-operations/business-support-facilities.html` | `/roles/director-operations/hospitality-food-service.html` |
| 18 | 20.53% | `/roles/director-operations/agriculture-food-forestry.html` | `/roles/director-operations/business-support-facilities.html` |
| 19 | 20.39% | `/roles/director-operations/manufacturing.html` | `/roles/director-operations/transportation-logistics.html` |
| 20 | 20.36% | `/roles/director-operations/manufacturing.html` | `/roles/director-operations/retail-ecommerce.html` |

### director-people

Pages: 9; comparisons: 36; average overlap: 18.45%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 25.79% | `/roles/director-people/healthcare-social-care.html` | `/roles/director-people/retail-ecommerce.html` |
| 2 | 24.09% | `/roles/director-people/education.html` | `/roles/director-people/healthcare-social-care.html` |
| 3 | 23.59% | `/roles/director-people/finance-insurance.html` | `/roles/director-people/technology-media-telecom.html` |
| 4 | 23.47% | `/roles/director-people/healthcare-social-care.html` | `/roles/director-people/public-sector-government.html` |
| 5 | 23.44% | `/roles/director-people/retail-ecommerce.html` | `/roles/director-people/technology-media-telecom.html` |
| 6 | 22.98% | `/roles/director-people/business-support-facilities.html` | `/roles/director-people/healthcare-social-care.html` |
| 7 | 22.41% | `/roles/director-people/public-sector-government.html` | `/roles/director-people/technology-media-telecom.html` |
| 8 | 21.96% | `/roles/director-people/education.html` | `/roles/director-people/retail-ecommerce.html` |
| 9 | 21.81% | `/roles/director-people/manufacturing.html` | `/roles/director-people/technology-media-telecom.html` |
| 10 | 21.49% | `/roles/director-people/public-sector-government.html` | `/roles/director-people/retail-ecommerce.html` |
| 11 | 21.45% | `/roles/director-people/education.html` | `/roles/director-people/manufacturing.html` |
| 12 | 21.39% | `/roles/director-people/finance-insurance.html` | `/roles/director-people/manufacturing.html` |
| 13 | 21.28% | `/roles/director-people/business-support-facilities.html` | `/roles/director-people/technology-media-telecom.html` |
| 14 | 21.15% | `/roles/director-people/healthcare-social-care.html` | `/roles/director-people/technology-media-telecom.html` |
| 15 | 21.10% | `/roles/director-people/business-support-facilities.html` | `/roles/director-people/finance-insurance.html` |
| 16 | 21.08% | `/roles/director-people/education.html` | `/roles/director-people/public-sector-government.html` |
| 17 | 20.91% | `/roles/director-people/business-support-facilities.html` | `/roles/director-people/education.html` |
| 18 | 20.79% | `/roles/director-people/finance-insurance.html` | `/roles/director-people/retail-ecommerce.html` |
| 19 | 20.44% | `/roles/director-people/education.html` | `/roles/director-people/technology-media-telecom.html` |
| 20 | 19.90% | `/roles/director-people/business-support-facilities.html` | `/roles/director-people/retail-ecommerce.html` |

### director-product

Pages: 9; comparisons: 36; average overlap: 19.34%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.97% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/education.html` |
| 2 | 26.12% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/healthcare-social-care.html` |
| 3 | 26.06% | `/roles/director-product/finance-insurance.html` | `/roles/director-product/transportation-logistics.html` |
| 4 | 25.69% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/finance-insurance.html` |
| 5 | 25.04% | `/roles/director-product/manufacturing.html` | `/roles/director-product/retail-ecommerce.html` |
| 6 | 24.96% | `/roles/director-product/education.html` | `/roles/director-product/manufacturing.html` |
| 7 | 23.93% | `/roles/director-product/education.html` | `/roles/director-product/finance-insurance.html` |
| 8 | 23.63% | `/roles/director-product/finance-insurance.html` | `/roles/director-product/healthcare-social-care.html` |
| 9 | 23.47% | `/roles/director-product/education.html` | `/roles/director-product/healthcare-social-care.html` |
| 10 | 23.22% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/manufacturing.html` |
| 11 | 23.06% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/retail-ecommerce.html` |
| 12 | 22.80% | `/roles/director-product/finance-insurance.html` | `/roles/director-product/manufacturing.html` |
| 13 | 22.48% | `/roles/director-product/retail-ecommerce.html` | `/roles/director-product/technology-media-telecom.html` |
| 14 | 22.37% | `/roles/director-product/education.html` | `/roles/director-product/retail-ecommerce.html` |
| 15 | 22.18% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/technology-media-telecom.html` |
| 16 | 21.96% | `/roles/director-product/technology-media-telecom.html` | `/roles/director-product/transportation-logistics.html` |
| 17 | 21.79% | `/roles/director-product/finance-insurance.html` | `/roles/director-product/retail-ecommerce.html` |
| 18 | 21.67% | `/roles/director-product/arts-entertainment-sports.html` | `/roles/director-product/transportation-logistics.html` |
| 19 | 21.50% | `/roles/director-product/healthcare-social-care.html` | `/roles/director-product/technology-media-telecom.html` |
| 20 | 21.48% | `/roles/director-product/retail-ecommerce.html` | `/roles/director-product/transportation-logistics.html` |

### director-sales

Pages: 9; comparisons: 36; average overlap: 18.36%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 24.58% | `/roles/director-sales/finance-insurance.html` | `/roles/director-sales/hospitality-food-service.html` |
| 2 | 24.35% | `/roles/director-sales/hospitality-food-service.html` | `/roles/director-sales/retail-ecommerce.html` |
| 3 | 23.89% | `/roles/director-sales/consulting-professional-services.html` | `/roles/director-sales/manufacturing.html` |
| 4 | 23.64% | `/roles/director-sales/finance-insurance.html` | `/roles/director-sales/retail-ecommerce.html` |
| 5 | 23.61% | `/roles/director-sales/consulting-professional-services.html` | `/roles/director-sales/hospitality-food-service.html` |
| 6 | 23.35% | `/roles/director-sales/hospitality-food-service.html` | `/roles/director-sales/manufacturing.html` |
| 7 | 22.93% | `/roles/director-sales/healthcare-social-care.html` | `/roles/director-sales/manufacturing.html` |
| 8 | 22.68% | `/roles/director-sales/finance-insurance.html` | `/roles/director-sales/wholesale-distribution.html` |
| 9 | 22.65% | `/roles/director-sales/finance-insurance.html` | `/roles/director-sales/manufacturing.html` |
| 10 | 22.54% | `/roles/director-sales/healthcare-social-care.html` | `/roles/director-sales/hospitality-food-service.html` |
| 11 | 22.42% | `/roles/director-sales/manufacturing.html` | `/roles/director-sales/wholesale-distribution.html` |
| 12 | 22.20% | `/roles/director-sales/finance-insurance.html` | `/roles/director-sales/healthcare-social-care.html` |
| 13 | 21.92% | `/roles/director-sales/consulting-professional-services.html` | `/roles/director-sales/healthcare-social-care.html` |
| 14 | 21.64% | `/roles/director-sales/retail-ecommerce.html` | `/roles/director-sales/wholesale-distribution.html` |
| 15 | 21.55% | `/roles/director-sales/technology-media-telecom.html` | `/roles/director-sales/wholesale-distribution.html` |
| 16 | 21.12% | `/roles/director-sales/healthcare-social-care.html` | `/roles/director-sales/wholesale-distribution.html` |
| 17 | 20.81% | `/roles/director-sales/hospitality-food-service.html` | `/roles/director-sales/wholesale-distribution.html` |
| 18 | 20.68% | `/roles/director-sales/consulting-professional-services.html` | `/roles/director-sales/finance-insurance.html` |
| 19 | 20.22% | `/roles/director-sales/consulting-professional-services.html` | `/roles/director-sales/retail-ecommerce.html` |
| 20 | 19.85% | `/roles/director-sales/hospitality-food-service.html` | `/roles/director-sales/technology-media-telecom.html` |

### general-counsel

Pages: 22; comparisons: 231; average overlap: 21.51%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 30.04% | `/roles/general-counsel/real-estate-leasing.html` | `/roles/general-counsel/transportation-logistics.html` |
| 2 | 29.92% | `/roles/general-counsel/healthcare-social-care.html` | `/roles/general-counsel/manufacturing.html` |
| 3 | 29.20% | `/roles/general-counsel/transportation-logistics.html` | `/roles/general-counsel/utilities.html` |
| 4 | 28.92% | `/roles/general-counsel/real-estate-leasing.html` | `/roles/general-counsel/utilities.html` |
| 5 | 28.46% | `/roles/general-counsel/legal-services.html` | `/roles/general-counsel/other-services.html` |
| 6 | 28.10% | `/roles/general-counsel/healthcare-social-care.html` | `/roles/general-counsel/technology-media-telecom.html` |
| 7 | 27.99% | `/roles/general-counsel/healthcare-social-care.html` | `/roles/general-counsel/retail-ecommerce.html` |
| 8 | 27.66% | `/roles/general-counsel/manufacturing.html` | `/roles/general-counsel/technology-media-telecom.html` |
| 9 | 27.51% | `/roles/general-counsel/energy-mining-oil-gas.html` | `/roles/general-counsel/finance-insurance.html` |
| 10 | 27.10% | `/roles/general-counsel/manufacturing.html` | `/roles/general-counsel/retail-ecommerce.html` |
| 11 | 26.94% | `/roles/general-counsel/consulting-professional-services.html` | `/roles/general-counsel/hospitality-food-service.html` |
| 12 | 26.77% | `/roles/general-counsel/retail-ecommerce.html` | `/roles/general-counsel/technology-media-telecom.html` |
| 13 | 26.70% | `/roles/general-counsel/hospitality-food-service.html` | `/roles/general-counsel/utilities.html` |
| 14 | 26.65% | `/roles/general-counsel/public-sector-government.html` | `/roles/general-counsel/wholesale-distribution.html` |
| 15 | 26.40% | `/roles/general-counsel/hospitality-food-service.html` | `/roles/general-counsel/wholesale-distribution.html` |
| 16 | 26.36% | `/roles/general-counsel/hospitality-food-service.html` | `/roles/general-counsel/public-sector-government.html` |
| 17 | 26.17% | `/roles/general-counsel/legal-services.html` | `/roles/general-counsel/retail-ecommerce.html` |
| 18 | 26.12% | `/roles/general-counsel/hospitality-food-service.html` | `/roles/general-counsel/transportation-logistics.html` |
| 19 | 25.74% | `/roles/general-counsel/education.html` | `/roles/general-counsel/other-services.html` |
| 20 | 25.69% | `/roles/general-counsel/legal-services.html` | `/roles/general-counsel/technology-media-telecom.html` |

### head-business-development

Pages: 9; comparisons: 36; average overlap: 19.48%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.09% | `/roles/head-business-development/real-estate-leasing.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 2 | 26.08% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/technology-media-telecom.html` |
| 3 | 25.81% | `/roles/head-business-development/energy-mining-oil-gas.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 4 | 25.76% | `/roles/head-business-development/energy-mining-oil-gas.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 5 | 25.18% | `/roles/head-business-development/consulting-professional-services.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 6 | 25.08% | `/roles/head-business-development/finance-insurance.html` | `/roles/head-business-development/real-estate-leasing.html` |
| 7 | 24.38% | `/roles/head-business-development/consulting-professional-services.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 8 | 24.27% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 9 | 24.25% | `/roles/head-business-development/consulting-professional-services.html` | `/roles/head-business-development/real-estate-leasing.html` |
| 10 | 24.24% | `/roles/head-business-development/healthcare-social-care.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 11 | 23.30% | `/roles/head-business-development/consulting-professional-services.html` | `/roles/head-business-development/energy-mining-oil-gas.html` |
| 12 | 23.20% | `/roles/head-business-development/finance-insurance.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 13 | 22.62% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/wholesale-distribution.html` |
| 14 | 22.39% | `/roles/head-business-development/finance-insurance.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 15 | 22.34% | `/roles/head-business-development/real-estate-leasing.html` | `/roles/head-business-development/technology-media-telecom.html` |
| 16 | 21.96% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/real-estate-leasing.html` |
| 17 | 21.83% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/energy-mining-oil-gas.html` |
| 18 | 21.63% | `/roles/head-business-development/construction-engineering.html` | `/roles/head-business-development/finance-insurance.html` |
| 19 | 21.54% | `/roles/head-business-development/healthcare-social-care.html` | `/roles/head-business-development/technology-media-telecom.html` |
| 20 | 21.43% | `/roles/head-business-development/consulting-professional-services.html` | `/roles/head-business-development/finance-insurance.html` |

### head-compliance

Pages: 9; comparisons: 36; average overlap: 18.36%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 24.33% | `/roles/head-compliance/legal-services.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 2 | 23.43% | `/roles/head-compliance/legal-services.html` | `/roles/head-compliance/public-sector-government.html` |
| 3 | 23.00% | `/roles/head-compliance/finance-insurance.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 4 | 22.90% | `/roles/head-compliance/manufacturing.html` | `/roles/head-compliance/transportation-logistics.html` |
| 5 | 22.65% | `/roles/head-compliance/finance-insurance.html` | `/roles/head-compliance/transportation-logistics.html` |
| 6 | 22.50% | `/roles/head-compliance/finance-insurance.html` | `/roles/head-compliance/legal-services.html` |
| 7 | 22.29% | `/roles/head-compliance/legal-services.html` | `/roles/head-compliance/manufacturing.html` |
| 8 | 21.80% | `/roles/head-compliance/manufacturing.html` | `/roles/head-compliance/public-sector-government.html` |
| 9 | 21.48% | `/roles/head-compliance/healthcare-social-care.html` | `/roles/head-compliance/public-sector-government.html` |
| 10 | 21.44% | `/roles/head-compliance/healthcare-social-care.html` | `/roles/head-compliance/transportation-logistics.html` |
| 11 | 21.43% | `/roles/head-compliance/energy-mining-oil-gas.html` | `/roles/head-compliance/finance-insurance.html` |
| 12 | 21.36% | `/roles/head-compliance/energy-mining-oil-gas.html` | `/roles/head-compliance/healthcare-social-care.html` |
| 13 | 21.24% | `/roles/head-compliance/energy-mining-oil-gas.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 14 | 21.22% | `/roles/head-compliance/legal-services.html` | `/roles/head-compliance/transportation-logistics.html` |
| 15 | 21.10% | `/roles/head-compliance/manufacturing.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 16 | 21.04% | `/roles/head-compliance/finance-insurance.html` | `/roles/head-compliance/public-sector-government.html` |
| 17 | 20.82% | `/roles/head-compliance/public-sector-government.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 18 | 20.56% | `/roles/head-compliance/energy-mining-oil-gas.html` | `/roles/head-compliance/public-sector-government.html` |
| 19 | 20.43% | `/roles/head-compliance/energy-mining-oil-gas.html` | `/roles/head-compliance/legal-services.html` |
| 20 | 20.10% | `/roles/head-compliance/technology-media-telecom.html` | `/roles/head-compliance/transportation-logistics.html` |

### head-data-ai

Pages: 9; comparisons: 36; average overlap: 20.02%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.83% | `/roles/head-data-ai/education.html` | `/roles/head-data-ai/public-sector-government.html` |
| 2 | 26.82% | `/roles/head-data-ai/healthcare-social-care.html` | `/roles/head-data-ai/manufacturing.html` |
| 3 | 26.76% | `/roles/head-data-ai/education.html` | `/roles/head-data-ai/manufacturing.html` |
| 4 | 26.06% | `/roles/head-data-ai/education.html` | `/roles/head-data-ai/healthcare-social-care.html` |
| 5 | 25.36% | `/roles/head-data-ai/retail-ecommerce.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 6 | 24.94% | `/roles/head-data-ai/finance-insurance.html` | `/roles/head-data-ai/healthcare-social-care.html` |
| 7 | 24.77% | `/roles/head-data-ai/manufacturing.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 8 | 24.45% | `/roles/head-data-ai/education.html` | `/roles/head-data-ai/retail-ecommerce.html` |
| 9 | 23.94% | `/roles/head-data-ai/education.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 10 | 23.92% | `/roles/head-data-ai/manufacturing.html` | `/roles/head-data-ai/retail-ecommerce.html` |
| 11 | 23.50% | `/roles/head-data-ai/public-sector-government.html` | `/roles/head-data-ai/retail-ecommerce.html` |
| 12 | 23.43% | `/roles/head-data-ai/healthcare-social-care.html` | `/roles/head-data-ai/public-sector-government.html` |
| 13 | 23.10% | `/roles/head-data-ai/finance-insurance.html` | `/roles/head-data-ai/retail-ecommerce.html` |
| 14 | 22.81% | `/roles/head-data-ai/healthcare-social-care.html` | `/roles/head-data-ai/retail-ecommerce.html` |
| 15 | 22.73% | `/roles/head-data-ai/finance-insurance.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 16 | 22.62% | `/roles/head-data-ai/public-sector-government.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 17 | 22.41% | `/roles/head-data-ai/finance-insurance.html` | `/roles/head-data-ai/public-sector-government.html` |
| 18 | 22.34% | `/roles/head-data-ai/healthcare-social-care.html` | `/roles/head-data-ai/technology-media-telecom.html` |
| 19 | 22.29% | `/roles/head-data-ai/manufacturing.html` | `/roles/head-data-ai/public-sector-government.html` |
| 20 | 22.27% | `/roles/head-data-ai/consulting-professional-services.html` | `/roles/head-data-ai/retail-ecommerce.html` |

### head-growth

Pages: 9; comparisons: 36; average overlap: 18.14%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 24.59% | `/roles/head-growth/hospitality-food-service.html` | `/roles/head-growth/other-services.html` |
| 2 | 24.34% | `/roles/head-growth/real-estate-leasing.html` | `/roles/head-growth/retail-ecommerce.html` |
| 3 | 23.50% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/retail-ecommerce.html` |
| 4 | 23.17% | `/roles/head-growth/hospitality-food-service.html` | `/roles/head-growth/technology-media-telecom.html` |
| 5 | 23.02% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/real-estate-leasing.html` |
| 6 | 22.97% | `/roles/head-growth/finance-insurance.html` | `/roles/head-growth/real-estate-leasing.html` |
| 7 | 22.73% | `/roles/head-growth/other-services.html` | `/roles/head-growth/technology-media-telecom.html` |
| 8 | 22.29% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/technology-media-telecom.html` |
| 9 | 21.85% | `/roles/head-growth/consulting-professional-services.html` | `/roles/head-growth/retail-ecommerce.html` |
| 10 | 21.59% | `/roles/head-growth/finance-insurance.html` | `/roles/head-growth/hospitality-food-service.html` |
| 11 | 21.53% | `/roles/head-growth/finance-insurance.html` | `/roles/head-growth/other-services.html` |
| 12 | 21.30% | `/roles/head-growth/consulting-professional-services.html` | `/roles/head-growth/real-estate-leasing.html` |
| 13 | 21.13% | `/roles/head-growth/finance-insurance.html` | `/roles/head-growth/technology-media-telecom.html` |
| 14 | 20.83% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/other-services.html` |
| 15 | 20.76% | `/roles/head-growth/other-services.html` | `/roles/head-growth/real-estate-leasing.html` |
| 16 | 20.76% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/consulting-professional-services.html` |
| 17 | 20.70% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/hospitality-food-service.html` |
| 18 | 20.04% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/head-growth/finance-insurance.html` |
| 19 | 19.94% | `/roles/head-growth/consulting-professional-services.html` | `/roles/head-growth/technology-media-telecom.html` |
| 20 | 19.81% | `/roles/head-growth/consulting-professional-services.html` | `/roles/head-growth/finance-insurance.html` |

### head-legal

Pages: 9; comparisons: 36; average overlap: 19.12%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 25.55% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/real-estate-leasing.html` |
| 2 | 25.23% | `/roles/head-legal/healthcare-social-care.html` | `/roles/head-legal/legal-services.html` |
| 3 | 25.01% | `/roles/head-legal/healthcare-social-care.html` | `/roles/head-legal/holding-companies.html` |
| 4 | 24.89% | `/roles/head-legal/healthcare-social-care.html` | `/roles/head-legal/real-estate-leasing.html` |
| 5 | 24.54% | `/roles/head-legal/finance-insurance.html` | `/roles/head-legal/public-sector-government.html` |
| 6 | 24.42% | `/roles/head-legal/holding-companies.html` | `/roles/head-legal/legal-services.html` |
| 7 | 24.40% | `/roles/head-legal/finance-insurance.html` | `/roles/head-legal/legal-services.html` |
| 8 | 23.99% | `/roles/head-legal/real-estate-leasing.html` | `/roles/head-legal/technology-media-telecom.html` |
| 9 | 23.96% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/technology-media-telecom.html` |
| 10 | 23.49% | `/roles/head-legal/finance-insurance.html` | `/roles/head-legal/real-estate-leasing.html` |
| 11 | 23.43% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/healthcare-social-care.html` |
| 12 | 23.11% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/legal-services.html` |
| 13 | 22.85% | `/roles/head-legal/healthcare-social-care.html` | `/roles/head-legal/technology-media-telecom.html` |
| 14 | 22.11% | `/roles/head-legal/public-sector-government.html` | `/roles/head-legal/real-estate-leasing.html` |
| 15 | 22.06% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/public-sector-government.html` |
| 16 | 21.80% | `/roles/head-legal/legal-services.html` | `/roles/head-legal/public-sector-government.html` |
| 17 | 21.71% | `/roles/head-legal/finance-insurance.html` | `/roles/head-legal/healthcare-social-care.html` |
| 18 | 21.27% | `/roles/head-legal/consulting-professional-services.html` | `/roles/head-legal/finance-insurance.html` |
| 19 | 21.02% | `/roles/head-legal/finance-insurance.html` | `/roles/head-legal/holding-companies.html` |
| 20 | 20.43% | `/roles/head-legal/healthcare-social-care.html` | `/roles/head-legal/public-sector-government.html` |

### head-strategy

Pages: 9; comparisons: 36; average overlap: 18.97%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 25.07% | `/roles/head-strategy/manufacturing.html` | `/roles/head-strategy/technology-media-telecom.html` |
| 2 | 25.01% | `/roles/head-strategy/energy-mining-oil-gas.html` | `/roles/head-strategy/manufacturing.html` |
| 3 | 24.05% | `/roles/head-strategy/holding-companies.html` | `/roles/head-strategy/public-sector-government.html` |
| 4 | 23.50% | `/roles/head-strategy/energy-mining-oil-gas.html` | `/roles/head-strategy/technology-media-telecom.html` |
| 5 | 23.31% | `/roles/head-strategy/consulting-professional-services.html` | `/roles/head-strategy/public-sector-government.html` |
| 6 | 23.18% | `/roles/head-strategy/consulting-professional-services.html` | `/roles/head-strategy/technology-media-telecom.html` |
| 7 | 23.05% | `/roles/head-strategy/manufacturing.html` | `/roles/head-strategy/public-sector-government.html` |
| 8 | 22.88% | `/roles/head-strategy/energy-mining-oil-gas.html` | `/roles/head-strategy/healthcare-social-care.html` |
| 9 | 22.74% | `/roles/head-strategy/public-sector-government.html` | `/roles/head-strategy/technology-media-telecom.html` |
| 10 | 22.39% | `/roles/head-strategy/finance-insurance.html` | `/roles/head-strategy/holding-companies.html` |
| 11 | 22.27% | `/roles/head-strategy/healthcare-social-care.html` | `/roles/head-strategy/holding-companies.html` |
| 12 | 22.20% | `/roles/head-strategy/healthcare-social-care.html` | `/roles/head-strategy/manufacturing.html` |
| 13 | 22.01% | `/roles/head-strategy/holding-companies.html` | `/roles/head-strategy/manufacturing.html` |
| 14 | 21.98% | `/roles/head-strategy/finance-insurance.html` | `/roles/head-strategy/public-sector-government.html` |
| 15 | 21.79% | `/roles/head-strategy/consulting-professional-services.html` | `/roles/head-strategy/healthcare-social-care.html` |
| 16 | 21.59% | `/roles/head-strategy/energy-mining-oil-gas.html` | `/roles/head-strategy/public-sector-government.html` |
| 17 | 21.48% | `/roles/head-strategy/consulting-professional-services.html` | `/roles/head-strategy/holding-companies.html` |
| 18 | 21.48% | `/roles/head-strategy/finance-insurance.html` | `/roles/head-strategy/manufacturing.html` |
| 19 | 21.40% | `/roles/head-strategy/finance-insurance.html` | `/roles/head-strategy/healthcare-social-care.html` |
| 20 | 21.22% | `/roles/head-strategy/energy-mining-oil-gas.html` | `/roles/head-strategy/finance-insurance.html` |

### managing-director

Pages: 22; comparisons: 231; average overlap: 20.45%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.38% | `/roles/managing-director/education.html` | `/roles/managing-director/technology-media-telecom.html` |
| 2 | 26.17% | `/roles/managing-director/arts-entertainment-sports.html` | `/roles/managing-director/manufacturing.html` |
| 3 | 26.04% | `/roles/managing-director/retail-ecommerce.html` | `/roles/managing-director/transportation-logistics.html` |
| 4 | 25.84% | `/roles/managing-director/finance-insurance.html` | `/roles/managing-director/manufacturing.html` |
| 5 | 25.81% | `/roles/managing-director/legal-services.html` | `/roles/managing-director/real-estate-leasing.html` |
| 6 | 25.67% | `/roles/managing-director/holding-companies.html` | `/roles/managing-director/manufacturing.html` |
| 7 | 25.64% | `/roles/managing-director/hospitality-food-service.html` | `/roles/managing-director/wholesale-distribution.html` |
| 8 | 25.49% | `/roles/managing-director/manufacturing.html` | `/roles/managing-director/real-estate-leasing.html` |
| 9 | 25.46% | `/roles/managing-director/hospitality-food-service.html` | `/roles/managing-director/real-estate-leasing.html` |
| 10 | 25.31% | `/roles/managing-director/business-support-facilities.html` | `/roles/managing-director/education.html` |
| 11 | 25.23% | `/roles/managing-director/education.html` | `/roles/managing-director/utilities.html` |
| 12 | 25.23% | `/roles/managing-director/real-estate-leasing.html` | `/roles/managing-director/utilities.html` |
| 13 | 24.95% | `/roles/managing-director/manufacturing.html` | `/roles/managing-director/transportation-logistics.html` |
| 14 | 24.85% | `/roles/managing-director/technology-media-telecom.html` | `/roles/managing-director/utilities.html` |
| 15 | 24.80% | `/roles/managing-director/business-support-facilities.html` | `/roles/managing-director/finance-insurance.html` |
| 16 | 24.78% | `/roles/managing-director/manufacturing.html` | `/roles/managing-director/wholesale-distribution.html` |
| 17 | 24.68% | `/roles/managing-director/business-support-facilities.html` | `/roles/managing-director/manufacturing.html` |
| 18 | 24.58% | `/roles/managing-director/agriculture-food-forestry.html` | `/roles/managing-director/education.html` |
| 19 | 24.53% | `/roles/managing-director/other-services.html` | `/roles/managing-director/real-estate-leasing.html` |
| 20 | 24.48% | `/roles/managing-director/construction-engineering.html` | `/roles/managing-director/other-services.html` |

### managing-partner

Pages: 22; comparisons: 231; average overlap: 20.25%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.98% | `/roles/managing-partner/consulting-professional-services.html` | `/roles/managing-partner/utilities.html` |
| 2 | 28.12% | `/roles/managing-partner/legal-services.html` | `/roles/managing-partner/manufacturing.html` |
| 3 | 27.90% | `/roles/managing-partner/other-services.html` | `/roles/managing-partner/utilities.html` |
| 4 | 27.86% | `/roles/managing-partner/construction-engineering.html` | `/roles/managing-partner/education.html` |
| 5 | 26.81% | `/roles/managing-partner/other-services.html` | `/roles/managing-partner/public-sector-government.html` |
| 6 | 26.32% | `/roles/managing-partner/finance-insurance.html` | `/roles/managing-partner/utilities.html` |
| 7 | 26.28% | `/roles/managing-partner/consulting-professional-services.html` | `/roles/managing-partner/other-services.html` |
| 8 | 26.04% | `/roles/managing-partner/education.html` | `/roles/managing-partner/manufacturing.html` |
| 9 | 25.80% | `/roles/managing-partner/healthcare-social-care.html` | `/roles/managing-partner/wholesale-distribution.html` |
| 10 | 25.48% | `/roles/managing-partner/healthcare-social-care.html` | `/roles/managing-partner/real-estate-leasing.html` |
| 11 | 25.05% | `/roles/managing-partner/arts-entertainment-sports.html` | `/roles/managing-partner/utilities.html` |
| 12 | 25.02% | `/roles/managing-partner/public-sector-government.html` | `/roles/managing-partner/utilities.html` |
| 13 | 25.01% | `/roles/managing-partner/healthcare-social-care.html` | `/roles/managing-partner/hospitality-food-service.html` |
| 14 | 24.82% | `/roles/managing-partner/legal-services.html` | `/roles/managing-partner/other-services.html` |
| 15 | 24.77% | `/roles/managing-partner/education.html` | `/roles/managing-partner/retail-ecommerce.html` |
| 16 | 24.75% | `/roles/managing-partner/education.html` | `/roles/managing-partner/legal-services.html` |
| 17 | 24.62% | `/roles/managing-partner/transportation-logistics.html` | `/roles/managing-partner/utilities.html` |
| 18 | 24.61% | `/roles/managing-partner/legal-services.html` | `/roles/managing-partner/utilities.html` |
| 19 | 24.50% | `/roles/managing-partner/agriculture-food-forestry.html` | `/roles/managing-partner/manufacturing.html` |
| 20 | 24.49% | `/roles/managing-partner/education.html` | `/roles/managing-partner/finance-insurance.html` |

### non-executive-director

Pages: 22; comparisons: 231; average overlap: 20.10%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.36% | `/roles/non-executive-director/finance-insurance.html` | `/roles/non-executive-director/transportation-logistics.html` |
| 2 | 26.89% | `/roles/non-executive-director/consulting-professional-services.html` | `/roles/non-executive-director/utilities.html` |
| 3 | 26.69% | `/roles/non-executive-director/education.html` | `/roles/non-executive-director/wholesale-distribution.html` |
| 4 | 26.25% | `/roles/non-executive-director/healthcare-social-care.html` | `/roles/non-executive-director/utilities.html` |
| 5 | 25.61% | `/roles/non-executive-director/construction-engineering.html` | `/roles/non-executive-director/legal-services.html` |
| 6 | 25.06% | `/roles/non-executive-director/arts-entertainment-sports.html` | `/roles/non-executive-director/healthcare-social-care.html` |
| 7 | 25.01% | `/roles/non-executive-director/healthcare-social-care.html` | `/roles/non-executive-director/wholesale-distribution.html` |
| 8 | 24.91% | `/roles/non-executive-director/education.html` | `/roles/non-executive-director/retail-ecommerce.html` |
| 9 | 24.85% | `/roles/non-executive-director/business-support-facilities.html` | `/roles/non-executive-director/real-estate-leasing.html` |
| 10 | 24.74% | `/roles/non-executive-director/consulting-professional-services.html` | `/roles/non-executive-director/manufacturing.html` |
| 11 | 24.74% | `/roles/non-executive-director/education.html` | `/roles/non-executive-director/utilities.html` |
| 12 | 24.69% | `/roles/non-executive-director/manufacturing.html` | `/roles/non-executive-director/other-services.html` |
| 13 | 24.66% | `/roles/non-executive-director/arts-entertainment-sports.html` | `/roles/non-executive-director/manufacturing.html` |
| 14 | 24.59% | `/roles/non-executive-director/energy-mining-oil-gas.html` | `/roles/non-executive-director/hospitality-food-service.html` |
| 15 | 24.56% | `/roles/non-executive-director/other-services.html` | `/roles/non-executive-director/retail-ecommerce.html` |
| 16 | 24.51% | `/roles/non-executive-director/energy-mining-oil-gas.html` | `/roles/non-executive-director/manufacturing.html` |
| 17 | 24.50% | `/roles/non-executive-director/agriculture-food-forestry.html` | `/roles/non-executive-director/education.html` |
| 18 | 24.42% | `/roles/non-executive-director/construction-engineering.html` | `/roles/non-executive-director/other-services.html` |
| 19 | 24.40% | `/roles/non-executive-director/finance-insurance.html` | `/roles/non-executive-director/hospitality-food-service.html` |
| 20 | 24.30% | `/roles/non-executive-director/consulting-professional-services.html` | `/roles/non-executive-director/other-services.html` |

### partner

Pages: 22; comparisons: 231; average overlap: 19.75%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.45% | `/roles/partner/manufacturing.html` | `/roles/partner/transportation-logistics.html` |
| 2 | 26.44% | `/roles/partner/construction-engineering.html` | `/roles/partner/manufacturing.html` |
| 3 | 24.99% | `/roles/partner/finance-insurance.html` | `/roles/partner/transportation-logistics.html` |
| 4 | 24.61% | `/roles/partner/finance-insurance.html` | `/roles/partner/manufacturing.html` |
| 5 | 24.59% | `/roles/partner/business-support-facilities.html` | `/roles/partner/transportation-logistics.html` |
| 6 | 24.44% | `/roles/partner/business-support-facilities.html` | `/roles/partner/manufacturing.html` |
| 7 | 24.43% | `/roles/partner/consulting-professional-services.html` | `/roles/partner/legal-services.html` |
| 8 | 24.39% | `/roles/partner/business-support-facilities.html` | `/roles/partner/technology-media-telecom.html` |
| 9 | 24.37% | `/roles/partner/healthcare-social-care.html` | `/roles/partner/manufacturing.html` |
| 10 | 24.31% | `/roles/partner/public-sector-government.html` | `/roles/partner/technology-media-telecom.html` |
| 11 | 24.30% | `/roles/partner/education.html` | `/roles/partner/energy-mining-oil-gas.html` |
| 12 | 24.24% | `/roles/partner/construction-engineering.html` | `/roles/partner/healthcare-social-care.html` |
| 13 | 24.22% | `/roles/partner/manufacturing.html` | `/roles/partner/wholesale-distribution.html` |
| 14 | 24.05% | `/roles/partner/transportation-logistics.html` | `/roles/partner/wholesale-distribution.html` |
| 15 | 24.01% | `/roles/partner/business-support-facilities.html` | `/roles/partner/public-sector-government.html` |
| 16 | 23.77% | `/roles/partner/arts-entertainment-sports.html` | `/roles/partner/retail-ecommerce.html` |
| 17 | 23.74% | `/roles/partner/construction-engineering.html` | `/roles/partner/transportation-logistics.html` |
| 18 | 23.63% | `/roles/partner/consulting-professional-services.html` | `/roles/partner/energy-mining-oil-gas.html` |
| 19 | 23.52% | `/roles/partner/consulting-professional-services.html` | `/roles/partner/transportation-logistics.html` |
| 20 | 23.50% | `/roles/partner/construction-engineering.html` | `/roles/partner/finance-insurance.html` |

### vp-engineering

Pages: 9; comparisons: 36; average overlap: 20.15%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 31.07% | `/roles/vp-engineering/manufacturing.html` | `/roles/vp-engineering/transportation-logistics.html` |
| 2 | 28.31% | `/roles/vp-engineering/energy-mining-oil-gas.html` | `/roles/vp-engineering/finance-insurance.html` |
| 3 | 27.18% | `/roles/vp-engineering/manufacturing.html` | `/roles/vp-engineering/utilities.html` |
| 4 | 26.01% | `/roles/vp-engineering/technology-media-telecom.html` | `/roles/vp-engineering/utilities.html` |
| 5 | 25.78% | `/roles/vp-engineering/finance-insurance.html` | `/roles/vp-engineering/healthcare-social-care.html` |
| 6 | 25.11% | `/roles/vp-engineering/construction-engineering.html` | `/roles/vp-engineering/utilities.html` |
| 7 | 24.95% | `/roles/vp-engineering/finance-insurance.html` | `/roles/vp-engineering/transportation-logistics.html` |
| 8 | 24.67% | `/roles/vp-engineering/transportation-logistics.html` | `/roles/vp-engineering/utilities.html` |
| 9 | 24.52% | `/roles/vp-engineering/finance-insurance.html` | `/roles/vp-engineering/manufacturing.html` |
| 10 | 24.30% | `/roles/vp-engineering/construction-engineering.html` | `/roles/vp-engineering/finance-insurance.html` |
| 11 | 23.97% | `/roles/vp-engineering/manufacturing.html` | `/roles/vp-engineering/technology-media-telecom.html` |
| 12 | 23.45% | `/roles/vp-engineering/construction-engineering.html` | `/roles/vp-engineering/manufacturing.html` |
| 13 | 23.25% | `/roles/vp-engineering/healthcare-social-care.html` | `/roles/vp-engineering/transportation-logistics.html` |
| 14 | 22.66% | `/roles/vp-engineering/finance-insurance.html` | `/roles/vp-engineering/utilities.html` |
| 15 | 22.52% | `/roles/vp-engineering/energy-mining-oil-gas.html` | `/roles/vp-engineering/technology-media-telecom.html` |
| 16 | 22.42% | `/roles/vp-engineering/healthcare-social-care.html` | `/roles/vp-engineering/manufacturing.html` |
| 17 | 22.37% | `/roles/vp-engineering/technology-media-telecom.html` | `/roles/vp-engineering/transportation-logistics.html` |
| 18 | 22.17% | `/roles/vp-engineering/construction-engineering.html` | `/roles/vp-engineering/technology-media-telecom.html` |
| 19 | 22.09% | `/roles/vp-engineering/energy-mining-oil-gas.html` | `/roles/vp-engineering/manufacturing.html` |
| 20 | 21.76% | `/roles/vp-engineering/construction-engineering.html` | `/roles/vp-engineering/healthcare-social-care.html` |

### vp-finance

Pages: 9; comparisons: 36; average overlap: 19.29%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.60% | `/roles/vp-finance/healthcare-social-care.html` | `/roles/vp-finance/real-estate-leasing.html` |
| 2 | 25.67% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-finance/holding-companies.html` |
| 3 | 25.45% | `/roles/vp-finance/manufacturing.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 4 | 24.65% | `/roles/vp-finance/finance-insurance.html` | `/roles/vp-finance/public-sector-government.html` |
| 5 | 24.29% | `/roles/vp-finance/real-estate-leasing.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 6 | 23.28% | `/roles/vp-finance/manufacturing.html` | `/roles/vp-finance/real-estate-leasing.html` |
| 7 | 23.16% | `/roles/vp-finance/holding-companies.html` | `/roles/vp-finance/manufacturing.html` |
| 8 | 23.01% | `/roles/vp-finance/holding-companies.html` | `/roles/vp-finance/real-estate-leasing.html` |
| 9 | 22.91% | `/roles/vp-finance/healthcare-social-care.html` | `/roles/vp-finance/manufacturing.html` |
| 10 | 22.79% | `/roles/vp-finance/healthcare-social-care.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 11 | 22.78% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-finance/finance-insurance.html` |
| 12 | 22.71% | `/roles/vp-finance/holding-companies.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 13 | 22.70% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-finance/healthcare-social-care.html` |
| 14 | 22.63% | `/roles/vp-finance/public-sector-government.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 15 | 22.56% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 16 | 22.54% | `/roles/vp-finance/manufacturing.html` | `/roles/vp-finance/public-sector-government.html` |
| 17 | 21.82% | `/roles/vp-finance/finance-insurance.html` | `/roles/vp-finance/manufacturing.html` |
| 18 | 21.56% | `/roles/vp-finance/healthcare-social-care.html` | `/roles/vp-finance/holding-companies.html` |
| 19 | 21.38% | `/roles/vp-finance/finance-insurance.html` | `/roles/vp-finance/holding-companies.html` |
| 20 | 21.35% | `/roles/vp-finance/finance-insurance.html` | `/roles/vp-finance/healthcare-social-care.html` |

### vp-marketing

Pages: 9; comparisons: 36; average overlap: 18.41%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 25.36% | `/roles/vp-marketing/hospitality-food-service.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 2 | 25.06% | `/roles/vp-marketing/finance-insurance.html` | `/roles/vp-marketing/healthcare-social-care.html` |
| 3 | 23.70% | `/roles/vp-marketing/finance-insurance.html` | `/roles/vp-marketing/hospitality-food-service.html` |
| 4 | 23.56% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/real-estate-leasing.html` |
| 5 | 23.46% | `/roles/vp-marketing/real-estate-leasing.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 6 | 22.63% | `/roles/vp-marketing/consulting-professional-services.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 7 | 22.50% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/healthcare-social-care.html` |
| 8 | 22.36% | `/roles/vp-marketing/retail-ecommerce.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 9 | 22.12% | `/roles/vp-marketing/consulting-professional-services.html` | `/roles/vp-marketing/real-estate-leasing.html` |
| 10 | 22.08% | `/roles/vp-marketing/finance-insurance.html` | `/roles/vp-marketing/real-estate-leasing.html` |
| 11 | 21.96% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/consulting-professional-services.html` |
| 12 | 21.91% | `/roles/vp-marketing/healthcare-social-care.html` | `/roles/vp-marketing/hospitality-food-service.html` |
| 13 | 21.36% | `/roles/vp-marketing/healthcare-social-care.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 14 | 21.25% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 15 | 20.76% | `/roles/vp-marketing/finance-insurance.html` | `/roles/vp-marketing/retail-ecommerce.html` |
| 16 | 20.46% | `/roles/vp-marketing/real-estate-leasing.html` | `/roles/vp-marketing/retail-ecommerce.html` |
| 17 | 20.31% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/hospitality-food-service.html` |
| 18 | 20.31% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-marketing/retail-ecommerce.html` |
| 19 | 19.94% | `/roles/vp-marketing/hospitality-food-service.html` | `/roles/vp-marketing/real-estate-leasing.html` |
| 20 | 19.93% | `/roles/vp-marketing/hospitality-food-service.html` | `/roles/vp-marketing/retail-ecommerce.html` |

### vp-operations

Pages: 9; comparisons: 36; average overlap: 19.35%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.02% | `/roles/vp-operations/business-support-facilities.html` | `/roles/vp-operations/healthcare-social-care.html` |
| 2 | 25.46% | `/roles/vp-operations/healthcare-social-care.html` | `/roles/vp-operations/manufacturing.html` |
| 3 | 24.96% | `/roles/vp-operations/manufacturing.html` | `/roles/vp-operations/utilities.html` |
| 4 | 24.87% | `/roles/vp-operations/agriculture-food-forestry.html` | `/roles/vp-operations/business-support-facilities.html` |
| 5 | 24.73% | `/roles/vp-operations/agriculture-food-forestry.html` | `/roles/vp-operations/manufacturing.html` |
| 6 | 24.27% | `/roles/vp-operations/business-support-facilities.html` | `/roles/vp-operations/manufacturing.html` |
| 7 | 24.04% | `/roles/vp-operations/hospitality-food-service.html` | `/roles/vp-operations/manufacturing.html` |
| 8 | 24.03% | `/roles/vp-operations/agriculture-food-forestry.html` | `/roles/vp-operations/utilities.html` |
| 9 | 23.96% | `/roles/vp-operations/healthcare-social-care.html` | `/roles/vp-operations/utilities.html` |
| 10 | 23.83% | `/roles/vp-operations/manufacturing.html` | `/roles/vp-operations/transportation-logistics.html` |
| 11 | 23.65% | `/roles/vp-operations/agriculture-food-forestry.html` | `/roles/vp-operations/healthcare-social-care.html` |
| 12 | 23.56% | `/roles/vp-operations/business-support-facilities.html` | `/roles/vp-operations/utilities.html` |
| 13 | 22.69% | `/roles/vp-operations/hospitality-food-service.html` | `/roles/vp-operations/transportation-logistics.html` |
| 14 | 22.54% | `/roles/vp-operations/healthcare-social-care.html` | `/roles/vp-operations/hospitality-food-service.html` |
| 15 | 22.37% | `/roles/vp-operations/business-support-facilities.html` | `/roles/vp-operations/transportation-logistics.html` |
| 16 | 22.33% | `/roles/vp-operations/manufacturing.html` | `/roles/vp-operations/retail-ecommerce.html` |
| 17 | 22.23% | `/roles/vp-operations/healthcare-social-care.html` | `/roles/vp-operations/transportation-logistics.html` |
| 18 | 22.02% | `/roles/vp-operations/healthcare-social-care.html` | `/roles/vp-operations/retail-ecommerce.html` |
| 19 | 20.88% | `/roles/vp-operations/agriculture-food-forestry.html` | `/roles/vp-operations/transportation-logistics.html` |
| 20 | 20.84% | `/roles/vp-operations/transportation-logistics.html` | `/roles/vp-operations/utilities.html` |

### vp-people

Pages: 9; comparisons: 36; average overlap: 18.81%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.06% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/retail-ecommerce.html` |
| 2 | 25.24% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/finance-insurance.html` |
| 3 | 24.76% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/public-sector-government.html` |
| 4 | 24.25% | `/roles/vp-people/finance-insurance.html` | `/roles/vp-people/manufacturing.html` |
| 5 | 24.23% | `/roles/vp-people/finance-insurance.html` | `/roles/vp-people/public-sector-government.html` |
| 6 | 24.19% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/education.html` |
| 7 | 23.86% | `/roles/vp-people/education.html` | `/roles/vp-people/manufacturing.html` |
| 8 | 23.60% | `/roles/vp-people/education.html` | `/roles/vp-people/finance-insurance.html` |
| 9 | 23.42% | `/roles/vp-people/public-sector-government.html` | `/roles/vp-people/retail-ecommerce.html` |
| 10 | 23.26% | `/roles/vp-people/finance-insurance.html` | `/roles/vp-people/retail-ecommerce.html` |
| 11 | 22.89% | `/roles/vp-people/manufacturing.html` | `/roles/vp-people/retail-ecommerce.html` |
| 12 | 22.57% | `/roles/vp-people/public-sector-government.html` | `/roles/vp-people/technology-media-telecom.html` |
| 13 | 22.29% | `/roles/vp-people/education.html` | `/roles/vp-people/retail-ecommerce.html` |
| 14 | 22.13% | `/roles/vp-people/education.html` | `/roles/vp-people/healthcare-social-care.html` |
| 15 | 21.97% | `/roles/vp-people/education.html` | `/roles/vp-people/technology-media-telecom.html` |
| 16 | 21.87% | `/roles/vp-people/education.html` | `/roles/vp-people/public-sector-government.html` |
| 17 | 20.76% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/healthcare-social-care.html` |
| 18 | 20.51% | `/roles/vp-people/business-support-facilities.html` | `/roles/vp-people/manufacturing.html` |
| 19 | 20.15% | `/roles/vp-people/manufacturing.html` | `/roles/vp-people/technology-media-telecom.html` |
| 20 | 20.08% | `/roles/vp-people/healthcare-social-care.html` | `/roles/vp-people/manufacturing.html` |

### vp-product

Pages: 9; comparisons: 36; average overlap: 19.22%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.97% | `/roles/vp-product/manufacturing.html` | `/roles/vp-product/technology-media-telecom.html` |
| 2 | 26.17% | `/roles/vp-product/healthcare-social-care.html` | `/roles/vp-product/transportation-logistics.html` |
| 3 | 25.70% | `/roles/vp-product/education.html` | `/roles/vp-product/manufacturing.html` |
| 4 | 25.08% | `/roles/vp-product/education.html` | `/roles/vp-product/finance-insurance.html` |
| 5 | 24.99% | `/roles/vp-product/healthcare-social-care.html` | `/roles/vp-product/manufacturing.html` |
| 6 | 24.41% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/technology-media-telecom.html` |
| 7 | 23.89% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/manufacturing.html` |
| 8 | 23.76% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/finance-insurance.html` |
| 9 | 23.39% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/healthcare-social-care.html` |
| 10 | 23.27% | `/roles/vp-product/education.html` | `/roles/vp-product/technology-media-telecom.html` |
| 11 | 23.26% | `/roles/vp-product/finance-insurance.html` | `/roles/vp-product/manufacturing.html` |
| 12 | 23.02% | `/roles/vp-product/technology-media-telecom.html` | `/roles/vp-product/transportation-logistics.html` |
| 13 | 23.01% | `/roles/vp-product/healthcare-social-care.html` | `/roles/vp-product/technology-media-telecom.html` |
| 14 | 22.32% | `/roles/vp-product/manufacturing.html` | `/roles/vp-product/transportation-logistics.html` |
| 15 | 22.24% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/transportation-logistics.html` |
| 16 | 21.63% | `/roles/vp-product/education.html` | `/roles/vp-product/retail-ecommerce.html` |
| 17 | 21.57% | `/roles/vp-product/arts-entertainment-sports.html` | `/roles/vp-product/education.html` |
| 18 | 21.30% | `/roles/vp-product/finance-insurance.html` | `/roles/vp-product/transportation-logistics.html` |
| 19 | 21.19% | `/roles/vp-product/manufacturing.html` | `/roles/vp-product/retail-ecommerce.html` |
| 20 | 21.18% | `/roles/vp-product/finance-insurance.html` | `/roles/vp-product/healthcare-social-care.html` |

### vp-sales

Pages: 9; comparisons: 36; average overlap: 18.68%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 23.66% | `/roles/vp-sales/technology-media-telecom.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 2 | 23.61% | `/roles/vp-sales/finance-insurance.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 3 | 22.85% | `/roles/vp-sales/hospitality-food-service.html` | `/roles/vp-sales/retail-ecommerce.html` |
| 4 | 22.72% | `/roles/vp-sales/hospitality-food-service.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 5 | 22.62% | `/roles/vp-sales/finance-insurance.html` | `/roles/vp-sales/retail-ecommerce.html` |
| 6 | 22.59% | `/roles/vp-sales/healthcare-social-care.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 7 | 22.51% | `/roles/vp-sales/consulting-professional-services.html` | `/roles/vp-sales/healthcare-social-care.html` |
| 8 | 22.34% | `/roles/vp-sales/consulting-professional-services.html` | `/roles/vp-sales/manufacturing.html` |
| 9 | 22.20% | `/roles/vp-sales/consulting-professional-services.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 10 | 22.10% | `/roles/vp-sales/manufacturing.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 11 | 21.99% | `/roles/vp-sales/consulting-professional-services.html` | `/roles/vp-sales/retail-ecommerce.html` |
| 12 | 21.88% | `/roles/vp-sales/manufacturing.html` | `/roles/vp-sales/retail-ecommerce.html` |
| 13 | 21.79% | `/roles/vp-sales/healthcare-social-care.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 14 | 21.57% | `/roles/vp-sales/hospitality-food-service.html` | `/roles/vp-sales/manufacturing.html` |
| 15 | 21.56% | `/roles/vp-sales/finance-insurance.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 16 | 21.41% | `/roles/vp-sales/healthcare-social-care.html` | `/roles/vp-sales/hospitality-food-service.html` |
| 17 | 21.23% | `/roles/vp-sales/retail-ecommerce.html` | `/roles/vp-sales/technology-media-telecom.html` |
| 18 | 21.13% | `/roles/vp-sales/hospitality-food-service.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 19 | 21.01% | `/roles/vp-sales/finance-insurance.html` | `/roles/vp-sales/hospitality-food-service.html` |
| 20 | 20.93% | `/roles/vp-sales/retail-ecommerce.html` | `/roles/vp-sales/wholesale-distribution.html` |

### vp-strategy

Pages: 9; comparisons: 36; average overlap: 18.70%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 24.38% | `/roles/vp-strategy/finance-insurance.html` | `/roles/vp-strategy/public-sector-government.html` |
| 2 | 24.14% | `/roles/vp-strategy/finance-insurance.html` | `/roles/vp-strategy/manufacturing.html` |
| 3 | 23.82% | `/roles/vp-strategy/holding-companies.html` | `/roles/vp-strategy/public-sector-government.html` |
| 4 | 23.11% | `/roles/vp-strategy/healthcare-social-care.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 5 | 22.99% | `/roles/vp-strategy/consulting-professional-services.html` | `/roles/vp-strategy/public-sector-government.html` |
| 6 | 22.63% | `/roles/vp-strategy/public-sector-government.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 7 | 22.63% | `/roles/vp-strategy/consulting-professional-services.html` | `/roles/vp-strategy/holding-companies.html` |
| 8 | 22.52% | `/roles/vp-strategy/finance-insurance.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 9 | 22.45% | `/roles/vp-strategy/consulting-professional-services.html` | `/roles/vp-strategy/healthcare-social-care.html` |
| 10 | 22.34% | `/roles/vp-strategy/consulting-professional-services.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 11 | 22.25% | `/roles/vp-strategy/healthcare-social-care.html` | `/roles/vp-strategy/public-sector-government.html` |
| 12 | 22.10% | `/roles/vp-strategy/holding-companies.html` | `/roles/vp-strategy/manufacturing.html` |
| 13 | 21.83% | `/roles/vp-strategy/holding-companies.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 14 | 21.82% | `/roles/vp-strategy/energy-mining-oil-gas.html` | `/roles/vp-strategy/healthcare-social-care.html` |
| 15 | 21.52% | `/roles/vp-strategy/energy-mining-oil-gas.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 16 | 21.39% | `/roles/vp-strategy/manufacturing.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 17 | 21.26% | `/roles/vp-strategy/manufacturing.html` | `/roles/vp-strategy/public-sector-government.html` |
| 18 | 21.19% | `/roles/vp-strategy/consulting-professional-services.html` | `/roles/vp-strategy/finance-insurance.html` |
| 19 | 20.88% | `/roles/vp-strategy/energy-mining-oil-gas.html` | `/roles/vp-strategy/public-sector-government.html` |
| 20 | 20.68% | `/roles/vp-strategy/energy-mining-oil-gas.html` | `/roles/vp-strategy/holding-companies.html` |


## Within each industry

### agriculture-food-forestry

Pages: 21; comparisons: 210; average overlap: 19.40%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.69% | `/roles/chair/agriculture-food-forestry.html` | `/roles/partner/agriculture-food-forestry.html` |
| 2 | 26.52% | `/roles/chief-product-officer/agriculture-food-forestry.html` | `/roles/cio/agriculture-food-forestry.html` |
| 3 | 25.81% | `/roles/chief-revenue-officer/agriculture-food-forestry.html` | `/roles/cto/agriculture-food-forestry.html` |
| 4 | 25.61% | `/roles/chief-revenue-officer/agriculture-food-forestry.html` | `/roles/cio/agriculture-food-forestry.html` |
| 5 | 25.57% | `/roles/cio/agriculture-food-forestry.html` | `/roles/general-counsel/agriculture-food-forestry.html` |
| 6 | 25.51% | `/roles/cfo/agriculture-food-forestry.html` | `/roles/chro/agriculture-food-forestry.html` |
| 7 | 25.25% | `/roles/chief-product-officer/agriculture-food-forestry.html` | `/roles/cto/agriculture-food-forestry.html` |
| 8 | 25.06% | `/roles/ceo/agriculture-food-forestry.html` | `/roles/chief-strategy-officer/agriculture-food-forestry.html` |
| 9 | 25.03% | `/roles/cfo/agriculture-food-forestry.html` | `/roles/managing-partner/agriculture-food-forestry.html` |
| 10 | 24.75% | `/roles/chief-strategy-officer/agriculture-food-forestry.html` | `/roles/coo/agriculture-food-forestry.html` |
| 11 | 24.73% | `/roles/chro/agriculture-food-forestry.html` | `/roles/cto/agriculture-food-forestry.html` |
| 12 | 24.57% | `/roles/ceo/agriculture-food-forestry.html` | `/roles/cmo/agriculture-food-forestry.html` |
| 13 | 24.53% | `/roles/chief-product-officer/agriculture-food-forestry.html` | `/roles/cmo/agriculture-food-forestry.html` |
| 14 | 24.37% | `/roles/cio/agriculture-food-forestry.html` | `/roles/cto/agriculture-food-forestry.html` |
| 15 | 24.18% | `/roles/managing-director/agriculture-food-forestry.html` | `/roles/managing-partner/agriculture-food-forestry.html` |
| 16 | 24.14% | `/roles/chief-product-officer/agriculture-food-forestry.html` | `/roles/chief-revenue-officer/agriculture-food-forestry.html` |
| 17 | 24.14% | `/roles/board-director/agriculture-food-forestry.html` | `/roles/ciso/agriculture-food-forestry.html` |
| 18 | 24.04% | `/roles/ciso/agriculture-food-forestry.html` | `/roles/coo/agriculture-food-forestry.html` |
| 19 | 24.02% | `/roles/cio/agriculture-food-forestry.html` | `/roles/ciso/agriculture-food-forestry.html` |
| 20 | 23.92% | `/roles/ceo/agriculture-food-forestry.html` | `/roles/coo/agriculture-food-forestry.html` |

### arts-entertainment-sports

Pages: 24; comparisons: 276; average overlap: 19.57%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.67% | `/roles/cio/arts-entertainment-sports.html` | `/roles/cmo/arts-entertainment-sports.html` |
| 2 | 27.17% | `/roles/cto/arts-entertainment-sports.html` | `/roles/managing-director/arts-entertainment-sports.html` |
| 3 | 27.08% | `/roles/chro/arts-entertainment-sports.html` | `/roles/managing-partner/arts-entertainment-sports.html` |
| 4 | 26.96% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/vp-marketing/arts-entertainment-sports.html` |
| 5 | 26.33% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/ciso/arts-entertainment-sports.html` |
| 6 | 26.00% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/cio/arts-entertainment-sports.html` |
| 7 | 25.88% | `/roles/cio/arts-entertainment-sports.html` | `/roles/ciso/arts-entertainment-sports.html` |
| 8 | 25.78% | `/roles/head-growth/arts-entertainment-sports.html` | `/roles/partner/arts-entertainment-sports.html` |
| 9 | 25.45% | `/roles/vp-marketing/arts-entertainment-sports.html` | `/roles/vp-product/arts-entertainment-sports.html` |
| 10 | 25.41% | `/roles/cio/arts-entertainment-sports.html` | `/roles/partner/arts-entertainment-sports.html` |
| 11 | 25.29% | `/roles/board-director/arts-entertainment-sports.html` | `/roles/managing-partner/arts-entertainment-sports.html` |
| 12 | 25.01% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/partner/arts-entertainment-sports.html` |
| 13 | 25.01% | `/roles/chair/arts-entertainment-sports.html` | `/roles/chief-product-officer/arts-entertainment-sports.html` |
| 14 | 24.99% | `/roles/chro/arts-entertainment-sports.html` | `/roles/cto/arts-entertainment-sports.html` |
| 15 | 24.99% | `/roles/ceo/arts-entertainment-sports.html` | `/roles/cmo/arts-entertainment-sports.html` |
| 16 | 24.90% | `/roles/chair/arts-entertainment-sports.html` | `/roles/managing-director/arts-entertainment-sports.html` |
| 17 | 24.55% | `/roles/partner/arts-entertainment-sports.html` | `/roles/vp-marketing/arts-entertainment-sports.html` |
| 18 | 24.47% | `/roles/board-director/arts-entertainment-sports.html` | `/roles/chro/arts-entertainment-sports.html` |
| 19 | 24.47% | `/roles/chair/arts-entertainment-sports.html` | `/roles/general-counsel/arts-entertainment-sports.html` |
| 20 | 24.46% | `/roles/chief-product-officer/arts-entertainment-sports.html` | `/roles/general-counsel/arts-entertainment-sports.html` |

### business-support-facilities

Pages: 23; comparisons: 253; average overlap: 20.22%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.81% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/chief-strategy-officer/business-support-facilities.html` |
| 2 | 29.12% | `/roles/cio/business-support-facilities.html` | `/roles/ciso/business-support-facilities.html` |
| 3 | 28.97% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/cio/business-support-facilities.html` |
| 4 | 27.94% | `/roles/ceo/business-support-facilities.html` | `/roles/chief-strategy-officer/business-support-facilities.html` |
| 5 | 27.71% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/cmo/business-support-facilities.html` |
| 6 | 27.54% | `/roles/chief-strategy-officer/business-support-facilities.html` | `/roles/cio/business-support-facilities.html` |
| 7 | 27.35% | `/roles/chief-product-officer/business-support-facilities.html` | `/roles/ciso/business-support-facilities.html` |
| 8 | 27.18% | `/roles/chair/business-support-facilities.html` | `/roles/general-counsel/business-support-facilities.html` |
| 9 | 26.54% | `/roles/coo/business-support-facilities.html` | `/roles/director-operations/business-support-facilities.html` |
| 10 | 26.37% | `/roles/board-director/business-support-facilities.html` | `/roles/chair/business-support-facilities.html` |
| 11 | 26.26% | `/roles/chro/business-support-facilities.html` | `/roles/non-executive-director/business-support-facilities.html` |
| 12 | 26.24% | `/roles/ceo/business-support-facilities.html` | `/roles/chief-product-officer/business-support-facilities.html` |
| 13 | 25.95% | `/roles/ciso/business-support-facilities.html` | `/roles/managing-partner/business-support-facilities.html` |
| 14 | 25.68% | `/roles/cfo/business-support-facilities.html` | `/roles/ciso/business-support-facilities.html` |
| 15 | 25.61% | `/roles/ciso/business-support-facilities.html` | `/roles/cmo/business-support-facilities.html` |
| 16 | 25.59% | `/roles/chair/business-support-facilities.html` | `/roles/non-executive-director/business-support-facilities.html` |
| 17 | 25.49% | `/roles/chief-strategy-officer/business-support-facilities.html` | `/roles/ciso/business-support-facilities.html` |
| 18 | 25.36% | `/roles/managing-partner/business-support-facilities.html` | `/roles/partner/business-support-facilities.html` |
| 19 | 25.23% | `/roles/cfo/business-support-facilities.html` | `/roles/cmo/business-support-facilities.html` |
| 20 | 25.19% | `/roles/ceo/business-support-facilities.html` | `/roles/ciso/business-support-facilities.html` |

### construction-engineering

Pages: 22; comparisons: 231; average overlap: 19.21%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.97% | `/roles/cio/construction-engineering.html` | `/roles/ciso/construction-engineering.html` |
| 2 | 28.38% | `/roles/cfo/construction-engineering.html` | `/roles/cio/construction-engineering.html` |
| 3 | 26.97% | `/roles/cio/construction-engineering.html` | `/roles/cmo/construction-engineering.html` |
| 4 | 26.18% | `/roles/chief-product-officer/construction-engineering.html` | `/roles/chro/construction-engineering.html` |
| 5 | 26.10% | `/roles/ceo/construction-engineering.html` | `/roles/coo/construction-engineering.html` |
| 6 | 26.09% | `/roles/coo/construction-engineering.html` | `/roles/cto/construction-engineering.html` |
| 7 | 25.70% | `/roles/chro/construction-engineering.html` | `/roles/general-counsel/construction-engineering.html` |
| 8 | 25.60% | `/roles/cfo/construction-engineering.html` | `/roles/cmo/construction-engineering.html` |
| 9 | 25.57% | `/roles/cto/construction-engineering.html` | `/roles/general-counsel/construction-engineering.html` |
| 10 | 25.25% | `/roles/chro/construction-engineering.html` | `/roles/cto/construction-engineering.html` |
| 11 | 24.87% | `/roles/chief-revenue-officer/construction-engineering.html` | `/roles/cto/construction-engineering.html` |
| 12 | 24.84% | `/roles/ciso/construction-engineering.html` | `/roles/cmo/construction-engineering.html` |
| 13 | 24.83% | `/roles/chair/construction-engineering.html` | `/roles/partner/construction-engineering.html` |
| 14 | 24.81% | `/roles/chair/construction-engineering.html` | `/roles/chro/construction-engineering.html` |
| 15 | 24.76% | `/roles/chro/construction-engineering.html` | `/roles/cio/construction-engineering.html` |
| 16 | 24.73% | `/roles/chro/construction-engineering.html` | `/roles/partner/construction-engineering.html` |
| 17 | 24.65% | `/roles/chro/construction-engineering.html` | `/roles/ciso/construction-engineering.html` |
| 18 | 24.60% | `/roles/cfo/construction-engineering.html` | `/roles/ciso/construction-engineering.html` |
| 19 | 24.59% | `/roles/chief-revenue-officer/construction-engineering.html` | `/roles/managing-partner/construction-engineering.html` |
| 20 | 24.53% | `/roles/chief-revenue-officer/construction-engineering.html` | `/roles/cio/construction-engineering.html` |

### consulting-professional-services

Pages: 31; comparisons: 465; average overlap: 20.21%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.39% | `/roles/partner/consulting-professional-services.html` | `/roles/vp-finance/consulting-professional-services.html` |
| 2 | 28.78% | `/roles/chief-strategy-officer/consulting-professional-services.html` | `/roles/cio/consulting-professional-services.html` |
| 3 | 28.36% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/head-strategy/consulting-professional-services.html` |
| 4 | 28.29% | `/roles/cfo/consulting-professional-services.html` | `/roles/partner/consulting-professional-services.html` |
| 5 | 28.08% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-strategy/consulting-professional-services.html` |
| 6 | 27.57% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/cio/consulting-professional-services.html` |
| 7 | 27.48% | `/roles/chair/consulting-professional-services.html` | `/roles/coo/consulting-professional-services.html` |
| 8 | 27.22% | `/roles/chief-revenue-officer/consulting-professional-services.html` | `/roles/cmo/consulting-professional-services.html` |
| 9 | 27.16% | `/roles/chief-product-officer/consulting-professional-services.html` | `/roles/cmo/consulting-professional-services.html` |
| 10 | 27.07% | `/roles/director-sales/consulting-professional-services.html` | `/roles/head-data-ai/consulting-professional-services.html` |
| 11 | 26.98% | `/roles/cto/consulting-professional-services.html` | `/roles/director-legal/consulting-professional-services.html` |
| 12 | 26.61% | `/roles/cfo/consulting-professional-services.html` | `/roles/vp-strategy/consulting-professional-services.html` |
| 13 | 26.45% | `/roles/cfo/consulting-professional-services.html` | `/roles/vp-finance/consulting-professional-services.html` |
| 14 | 26.30% | `/roles/director-marketing/consulting-professional-services.html` | `/roles/head-growth/consulting-professional-services.html` |
| 15 | 26.27% | `/roles/cio/consulting-professional-services.html` | `/roles/ciso/consulting-professional-services.html` |
| 16 | 26.26% | `/roles/cio/consulting-professional-services.html` | `/roles/cmo/consulting-professional-services.html` |
| 17 | 26.07% | `/roles/chair/consulting-professional-services.html` | `/roles/non-executive-director/consulting-professional-services.html` |
| 18 | 25.78% | `/roles/ciso/consulting-professional-services.html` | `/roles/cto/consulting-professional-services.html` |
| 19 | 25.64% | `/roles/vp-finance/consulting-professional-services.html` | `/roles/vp-marketing/consulting-professional-services.html` |
| 20 | 25.54% | `/roles/chief-strategy-officer/consulting-professional-services.html` | `/roles/cmo/consulting-professional-services.html` |

### education

Pages: 25; comparisons: 300; average overlap: 18.56%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.33% | `/roles/chief-revenue-officer/education.html` | `/roles/coo/education.html` |
| 2 | 24.77% | `/roles/cio/education.html` | `/roles/cto/education.html` |
| 3 | 24.61% | `/roles/managing-director/education.html` | `/roles/managing-partner/education.html` |
| 4 | 24.33% | `/roles/chair/education.html` | `/roles/managing-partner/education.html` |
| 5 | 24.10% | `/roles/board-director/education.html` | `/roles/partner/education.html` |
| 6 | 24.05% | `/roles/ceo/education.html` | `/roles/chief-strategy-officer/education.html` |
| 7 | 24.00% | `/roles/non-executive-director/education.html` | `/roles/vp-people/education.html` |
| 8 | 23.98% | `/roles/cio/education.html` | `/roles/managing-director/education.html` |
| 9 | 23.75% | `/roles/board-director/education.html` | `/roles/chair/education.html` |
| 10 | 23.67% | `/roles/ceo/education.html` | `/roles/cfo/education.html` |
| 11 | 23.64% | `/roles/chief-product-officer/education.html` | `/roles/vp-product/education.html` |
| 12 | 23.63% | `/roles/chief-revenue-officer/education.html` | `/roles/cmo/education.html` |
| 13 | 23.51% | `/roles/cfo/education.html` | `/roles/managing-director/education.html` |
| 14 | 23.45% | `/roles/cfo/education.html` | `/roles/cio/education.html` |
| 15 | 23.44% | `/roles/director-finance/education.html` | `/roles/director-people/education.html` |
| 16 | 23.43% | `/roles/cio/education.html` | `/roles/ciso/education.html` |
| 17 | 23.43% | `/roles/chief-product-officer/education.html` | `/roles/chief-strategy-officer/education.html` |
| 18 | 23.39% | `/roles/vp-people/education.html` | `/roles/vp-product/education.html` |
| 19 | 23.38% | `/roles/chro/education.html` | `/roles/cto/education.html` |
| 20 | 23.35% | `/roles/cfo/education.html` | `/roles/chief-strategy-officer/education.html` |

### energy-mining-oil-gas

Pages: 25; comparisons: 300; average overlap: 20.47%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.17% | `/roles/chief-strategy-officer/energy-mining-oil-gas.html` | `/roles/cto/energy-mining-oil-gas.html` |
| 2 | 28.38% | `/roles/cfo/energy-mining-oil-gas.html` | `/roles/chief-revenue-officer/energy-mining-oil-gas.html` |
| 3 | 28.34% | `/roles/cmo/energy-mining-oil-gas.html` | `/roles/vp-strategy/energy-mining-oil-gas.html` |
| 4 | 28.25% | `/roles/head-business-development/energy-mining-oil-gas.html` | `/roles/head-strategy/energy-mining-oil-gas.html` |
| 5 | 26.80% | `/roles/cio/energy-mining-oil-gas.html` | `/roles/head-compliance/energy-mining-oil-gas.html` |
| 6 | 26.72% | `/roles/cfo/energy-mining-oil-gas.html` | `/roles/coo/energy-mining-oil-gas.html` |
| 7 | 26.66% | `/roles/chief-product-officer/energy-mining-oil-gas.html` | `/roles/vp-engineering/energy-mining-oil-gas.html` |
| 8 | 26.19% | `/roles/managing-partner/energy-mining-oil-gas.html` | `/roles/vp-strategy/energy-mining-oil-gas.html` |
| 9 | 26.18% | `/roles/ceo/energy-mining-oil-gas.html` | `/roles/chief-product-officer/energy-mining-oil-gas.html` |
| 10 | 26.17% | `/roles/cmo/energy-mining-oil-gas.html` | `/roles/coo/energy-mining-oil-gas.html` |
| 11 | 26.09% | `/roles/chief-strategy-officer/energy-mining-oil-gas.html` | `/roles/partner/energy-mining-oil-gas.html` |
| 12 | 26.04% | `/roles/board-director/energy-mining-oil-gas.html` | `/roles/chair/energy-mining-oil-gas.html` |
| 13 | 25.91% | `/roles/ciso/energy-mining-oil-gas.html` | `/roles/managing-director/energy-mining-oil-gas.html` |
| 14 | 25.63% | `/roles/cfo/energy-mining-oil-gas.html` | `/roles/cio/energy-mining-oil-gas.html` |
| 15 | 25.62% | `/roles/board-director/energy-mining-oil-gas.html` | `/roles/vp-strategy/energy-mining-oil-gas.html` |
| 16 | 25.54% | `/roles/cio/energy-mining-oil-gas.html` | `/roles/coo/energy-mining-oil-gas.html` |
| 17 | 25.53% | `/roles/cmo/energy-mining-oil-gas.html` | `/roles/managing-partner/energy-mining-oil-gas.html` |
| 18 | 25.50% | `/roles/chair/energy-mining-oil-gas.html` | `/roles/chief-product-officer/energy-mining-oil-gas.html` |
| 19 | 25.49% | `/roles/chro/energy-mining-oil-gas.html` | `/roles/cio/energy-mining-oil-gas.html` |
| 20 | 25.43% | `/roles/managing-partner/energy-mining-oil-gas.html` | `/roles/partner/energy-mining-oil-gas.html` |

### finance-insurance

Pages: 39; comparisons: 741; average overlap: 19.58%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.80% | `/roles/cfo/finance-insurance.html` | `/roles/coo/finance-insurance.html` |
| 2 | 28.40% | `/roles/head-strategy/finance-insurance.html` | `/roles/vp-strategy/finance-insurance.html` |
| 3 | 28.26% | `/roles/director-people/finance-insurance.html` | `/roles/director-product/finance-insurance.html` |
| 4 | 27.07% | `/roles/chief-product-officer/finance-insurance.html` | `/roles/chro/finance-insurance.html` |
| 5 | 27.06% | `/roles/director-product/finance-insurance.html` | `/roles/director-sales/finance-insurance.html` |
| 6 | 26.69% | `/roles/vp-people/finance-insurance.html` | `/roles/vp-product/finance-insurance.html` |
| 7 | 26.55% | `/roles/vp-finance/finance-insurance.html` | `/roles/vp-people/finance-insurance.html` |
| 8 | 26.41% | `/roles/cfo/finance-insurance.html` | `/roles/managing-partner/finance-insurance.html` |
| 9 | 26.40% | `/roles/head-business-development/finance-insurance.html` | `/roles/managing-partner/finance-insurance.html` |
| 10 | 25.92% | `/roles/chair/finance-insurance.html` | `/roles/ciso/finance-insurance.html` |
| 11 | 25.83% | `/roles/head-legal/finance-insurance.html` | `/roles/head-strategy/finance-insurance.html` |
| 12 | 25.81% | `/roles/vp-people/finance-insurance.html` | `/roles/vp-strategy/finance-insurance.html` |
| 13 | 25.66% | `/roles/cfo/finance-insurance.html` | `/roles/director-legal/finance-insurance.html` |
| 14 | 25.50% | `/roles/director-legal/finance-insurance.html` | `/roles/managing-partner/finance-insurance.html` |
| 15 | 25.43% | `/roles/head-growth/finance-insurance.html` | `/roles/head-strategy/finance-insurance.html` |
| 16 | 25.39% | `/roles/chief-strategy-officer/finance-insurance.html` | `/roles/cmo/finance-insurance.html` |
| 17 | 25.34% | `/roles/cfo/finance-insurance.html` | `/roles/chief-revenue-officer/finance-insurance.html` |
| 18 | 25.01% | `/roles/head-growth/finance-insurance.html` | `/roles/head-legal/finance-insurance.html` |
| 19 | 24.95% | `/roles/chair/finance-insurance.html` | `/roles/general-counsel/finance-insurance.html` |
| 20 | 24.87% | `/roles/director-legal/finance-insurance.html` | `/roles/head-business-development/finance-insurance.html` |

### healthcare-social-care

Pages: 40; comparisons: 780; average overlap: 19.84%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.52% | `/roles/chief-strategy-officer/healthcare-social-care.html` | `/roles/cmo/healthcare-social-care.html` |
| 2 | 28.55% | `/roles/chief-product-officer/healthcare-social-care.html` | `/roles/general-counsel/healthcare-social-care.html` |
| 3 | 28.03% | `/roles/vp-engineering/healthcare-social-care.html` | `/roles/vp-people/healthcare-social-care.html` |
| 4 | 27.42% | `/roles/chief-strategy-officer/healthcare-social-care.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 5 | 27.31% | `/roles/vp-finance/healthcare-social-care.html` | `/roles/vp-marketing/healthcare-social-care.html` |
| 6 | 27.26% | `/roles/director-engineering/healthcare-social-care.html` | `/roles/vp-finance/healthcare-social-care.html` |
| 7 | 26.89% | `/roles/vp-people/healthcare-social-care.html` | `/roles/vp-sales/healthcare-social-care.html` |
| 8 | 26.59% | `/roles/director-operations/healthcare-social-care.html` | `/roles/director-sales/healthcare-social-care.html` |
| 9 | 26.32% | `/roles/director-product/healthcare-social-care.html` | `/roles/head-legal/healthcare-social-care.html` |
| 10 | 26.20% | `/roles/director-finance/healthcare-social-care.html` | `/roles/director-sales/healthcare-social-care.html` |
| 11 | 26.08% | `/roles/managing-director/healthcare-social-care.html` | `/roles/non-executive-director/healthcare-social-care.html` |
| 12 | 26.05% | `/roles/chief-product-officer/healthcare-social-care.html` | `/roles/chief-strategy-officer/healthcare-social-care.html` |
| 13 | 26.03% | `/roles/chief-product-officer/healthcare-social-care.html` | `/roles/ciso/healthcare-social-care.html` |
| 14 | 25.98% | `/roles/chair/healthcare-social-care.html` | `/roles/chief-revenue-officer/healthcare-social-care.html` |
| 15 | 25.93% | `/roles/vp-engineering/healthcare-social-care.html` | `/roles/vp-marketing/healthcare-social-care.html` |
| 16 | 25.86% | `/roles/cmo/healthcare-social-care.html` | `/roles/head-business-development/healthcare-social-care.html` |
| 17 | 25.84% | `/roles/director-people/healthcare-social-care.html` | `/roles/director-sales/healthcare-social-care.html` |
| 18 | 25.62% | `/roles/chief-product-officer/healthcare-social-care.html` | `/roles/chief-revenue-officer/healthcare-social-care.html` |
| 19 | 25.62% | `/roles/vp-product/healthcare-social-care.html` | `/roles/vp-sales/healthcare-social-care.html` |
| 20 | 25.61% | `/roles/ceo/healthcare-social-care.html` | `/roles/cto/healthcare-social-care.html` |

### holding-companies

Pages: 25; comparisons: 300; average overlap: 20.40%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.40% | `/roles/chief-strategy-officer/holding-companies.html` | `/roles/cio/holding-companies.html` |
| 2 | 29.37% | `/roles/cmo/holding-companies.html` | `/roles/coo/holding-companies.html` |
| 3 | 28.98% | `/roles/chief-strategy-officer/holding-companies.html` | `/roles/cto/holding-companies.html` |
| 4 | 28.57% | `/roles/ceo/holding-companies.html` | `/roles/chief-product-officer/holding-companies.html` |
| 5 | 28.38% | `/roles/cfo/holding-companies.html` | `/roles/cio/holding-companies.html` |
| 6 | 28.03% | `/roles/cfo/holding-companies.html` | `/roles/chief-strategy-officer/holding-companies.html` |
| 7 | 27.99% | `/roles/chief-revenue-officer/holding-companies.html` | `/roles/ciso/holding-companies.html` |
| 8 | 27.97% | `/roles/chief-revenue-officer/holding-companies.html` | `/roles/managing-partner/holding-companies.html` |
| 9 | 27.49% | `/roles/chief-product-officer/holding-companies.html` | `/roles/ciso/holding-companies.html` |
| 10 | 27.22% | `/roles/chief-product-officer/holding-companies.html` | `/roles/cmo/holding-companies.html` |
| 11 | 27.21% | `/roles/board-director/holding-companies.html` | `/roles/ciso/holding-companies.html` |
| 12 | 26.97% | `/roles/chief-product-officer/holding-companies.html` | `/roles/general-counsel/holding-companies.html` |
| 13 | 26.94% | `/roles/chief-strategy-officer/holding-companies.html` | `/roles/director-finance/holding-companies.html` |
| 14 | 26.70% | `/roles/cfo/holding-companies.html` | `/roles/cto/holding-companies.html` |
| 15 | 26.55% | `/roles/cfo/holding-companies.html` | `/roles/chro/holding-companies.html` |
| 16 | 26.23% | `/roles/chair/holding-companies.html` | `/roles/partner/holding-companies.html` |
| 17 | 26.15% | `/roles/cmo/holding-companies.html` | `/roles/director-legal/holding-companies.html` |
| 18 | 26.13% | `/roles/cto/holding-companies.html` | `/roles/director-finance/holding-companies.html` |
| 19 | 26.10% | `/roles/managing-director/holding-companies.html` | `/roles/vp-finance/holding-companies.html` |
| 20 | 26.06% | `/roles/chief-product-officer/holding-companies.html` | `/roles/chief-revenue-officer/holding-companies.html` |

### hospitality-food-service

Pages: 26; comparisons: 325; average overlap: 19.66%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.15% | `/roles/chief-product-officer/hospitality-food-service.html` | `/roles/cio/hospitality-food-service.html` |
| 2 | 28.76% | `/roles/chair/hospitality-food-service.html` | `/roles/managing-partner/hospitality-food-service.html` |
| 3 | 28.42% | `/roles/cfo/hospitality-food-service.html` | `/roles/chro/hospitality-food-service.html` |
| 4 | 27.64% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/vp-operations/hospitality-food-service.html` |
| 5 | 27.62% | `/roles/managing-director/hospitality-food-service.html` | `/roles/partner/hospitality-food-service.html` |
| 6 | 27.49% | `/roles/chief-product-officer/hospitality-food-service.html` | `/roles/ciso/hospitality-food-service.html` |
| 7 | 26.84% | `/roles/cio/hospitality-food-service.html` | `/roles/ciso/hospitality-food-service.html` |
| 8 | 26.52% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/partner/hospitality-food-service.html` |
| 9 | 26.47% | `/roles/chief-strategy-officer/hospitality-food-service.html` | `/roles/cto/hospitality-food-service.html` |
| 10 | 26.25% | `/roles/chair/hospitality-food-service.html` | `/roles/chro/hospitality-food-service.html` |
| 11 | 26.01% | `/roles/partner/hospitality-food-service.html` | `/roles/vp-operations/hospitality-food-service.html` |
| 12 | 25.25% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/director-operations/hospitality-food-service.html` |
| 13 | 25.20% | `/roles/ciso/hospitality-food-service.html` | `/roles/director-operations/hospitality-food-service.html` |
| 14 | 25.16% | `/roles/chair/hospitality-food-service.html` | `/roles/director-marketing/hospitality-food-service.html` |
| 15 | 25.03% | `/roles/director-marketing/hospitality-food-service.html` | `/roles/vp-marketing/hospitality-food-service.html` |
| 16 | 24.91% | `/roles/chief-product-officer/hospitality-food-service.html` | `/roles/chief-strategy-officer/hospitality-food-service.html` |
| 17 | 24.81% | `/roles/chro/hospitality-food-service.html` | `/roles/cmo/hospitality-food-service.html` |
| 18 | 24.75% | `/roles/ceo/hospitality-food-service.html` | `/roles/cmo/hospitality-food-service.html` |
| 19 | 24.75% | `/roles/ciso/hospitality-food-service.html` | `/roles/cmo/hospitality-food-service.html` |
| 20 | 24.72% | `/roles/chief-revenue-officer/hospitality-food-service.html` | `/roles/partner/hospitality-food-service.html` |

### legal-services

Pages: 22; comparisons: 231; average overlap: 17.49%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.80% | `/roles/board-director/legal-services.html` | `/roles/managing-director/legal-services.html` |
| 2 | 26.72% | `/roles/chief-strategy-officer/legal-services.html` | `/roles/chro/legal-services.html` |
| 3 | 26.36% | `/roles/managing-director/legal-services.html` | `/roles/managing-partner/legal-services.html` |
| 4 | 26.05% | `/roles/chief-product-officer/legal-services.html` | `/roles/general-counsel/legal-services.html` |
| 5 | 25.91% | `/roles/head-legal/legal-services.html` | `/roles/partner/legal-services.html` |
| 6 | 25.51% | `/roles/cio/legal-services.html` | `/roles/ciso/legal-services.html` |
| 7 | 25.42% | `/roles/chief-strategy-officer/legal-services.html` | `/roles/cmo/legal-services.html` |
| 8 | 25.19% | `/roles/cio/legal-services.html` | `/roles/coo/legal-services.html` |
| 9 | 25.02% | `/roles/board-director/legal-services.html` | `/roles/managing-partner/legal-services.html` |
| 10 | 24.44% | `/roles/chief-strategy-officer/legal-services.html` | `/roles/coo/legal-services.html` |
| 11 | 24.33% | `/roles/chro/legal-services.html` | `/roles/cmo/legal-services.html` |
| 12 | 24.26% | `/roles/chief-strategy-officer/legal-services.html` | `/roles/cio/legal-services.html` |
| 13 | 24.07% | `/roles/chief-product-officer/legal-services.html` | `/roles/chro/legal-services.html` |
| 14 | 23.97% | `/roles/chief-product-officer/legal-services.html` | `/roles/cto/legal-services.html` |
| 15 | 23.96% | `/roles/cmo/legal-services.html` | `/roles/partner/legal-services.html` |
| 16 | 23.91% | `/roles/chief-product-officer/legal-services.html` | `/roles/head-compliance/legal-services.html` |
| 17 | 23.90% | `/roles/chief-product-officer/legal-services.html` | `/roles/ciso/legal-services.html` |
| 18 | 23.68% | `/roles/cfo/legal-services.html` | `/roles/ciso/legal-services.html` |
| 19 | 23.67% | `/roles/board-director/legal-services.html` | `/roles/general-counsel/legal-services.html` |
| 20 | 23.59% | `/roles/chief-revenue-officer/legal-services.html` | `/roles/cio/legal-services.html` |

### manufacturing

Pages: 35; comparisons: 595; average overlap: 19.03%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.89% | `/roles/cfo/manufacturing.html` | `/roles/chief-revenue-officer/manufacturing.html` |
| 2 | 26.69% | `/roles/ceo/manufacturing.html` | `/roles/coo/manufacturing.html` |
| 3 | 26.65% | `/roles/vp-sales/manufacturing.html` | `/roles/vp-strategy/manufacturing.html` |
| 4 | 26.53% | `/roles/vp-product/manufacturing.html` | `/roles/vp-sales/manufacturing.html` |
| 5 | 25.77% | `/roles/director-engineering/manufacturing.html` | `/roles/non-executive-director/manufacturing.html` |
| 6 | 25.65% | `/roles/vp-finance/manufacturing.html` | `/roles/vp-product/manufacturing.html` |
| 7 | 25.56% | `/roles/chief-strategy-officer/manufacturing.html` | `/roles/chro/manufacturing.html` |
| 8 | 25.49% | `/roles/chief-strategy-officer/manufacturing.html` | `/roles/cio/manufacturing.html` |
| 9 | 25.49% | `/roles/vp-engineering/manufacturing.html` | `/roles/vp-people/manufacturing.html` |
| 10 | 25.28% | `/roles/chief-revenue-officer/manufacturing.html` | `/roles/head-data-ai/manufacturing.html` |
| 11 | 25.23% | `/roles/director-product/manufacturing.html` | `/roles/vp-product/manufacturing.html` |
| 12 | 25.15% | `/roles/director-engineering/manufacturing.html` | `/roles/director-people/manufacturing.html` |
| 13 | 25.14% | `/roles/chro/manufacturing.html` | `/roles/cmo/manufacturing.html` |
| 14 | 25.05% | `/roles/cio/manufacturing.html` | `/roles/partner/manufacturing.html` |
| 15 | 25.02% | `/roles/cio/manufacturing.html` | `/roles/managing-director/manufacturing.html` |
| 16 | 24.88% | `/roles/cmo/manufacturing.html` | `/roles/vp-strategy/manufacturing.html` |
| 17 | 24.71% | `/roles/director-engineering/manufacturing.html` | `/roles/director-operations/manufacturing.html` |
| 18 | 24.69% | `/roles/board-director/manufacturing.html` | `/roles/vp-sales/manufacturing.html` |
| 19 | 24.45% | `/roles/ceo/manufacturing.html` | `/roles/general-counsel/manufacturing.html` |
| 20 | 24.41% | `/roles/director-sales/manufacturing.html` | `/roles/vp-sales/manufacturing.html` |

### other-services

Pages: 20; comparisons: 190; average overlap: 19.36%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.00% | `/roles/chief-revenue-officer/other-services.html` | `/roles/cmo/other-services.html` |
| 2 | 26.42% | `/roles/head-growth/other-services.html` | `/roles/managing-director/other-services.html` |
| 3 | 26.21% | `/roles/chief-revenue-officer/other-services.html` | `/roles/cio/other-services.html` |
| 4 | 26.14% | `/roles/chro/other-services.html` | `/roles/cto/other-services.html` |
| 5 | 25.78% | `/roles/chair/other-services.html` | `/roles/partner/other-services.html` |
| 6 | 25.49% | `/roles/cmo/other-services.html` | `/roles/partner/other-services.html` |
| 7 | 25.41% | `/roles/board-director/other-services.html` | `/roles/partner/other-services.html` |
| 8 | 24.98% | `/roles/board-director/other-services.html` | `/roles/managing-director/other-services.html` |
| 9 | 24.67% | `/roles/board-director/other-services.html` | `/roles/chief-revenue-officer/other-services.html` |
| 10 | 24.60% | `/roles/ceo/other-services.html` | `/roles/chief-product-officer/other-services.html` |
| 11 | 24.50% | `/roles/chief-product-officer/other-services.html` | `/roles/general-counsel/other-services.html` |
| 12 | 24.49% | `/roles/board-director/other-services.html` | `/roles/chair/other-services.html` |
| 13 | 24.35% | `/roles/chief-product-officer/other-services.html` | `/roles/chro/other-services.html` |
| 14 | 24.32% | `/roles/chief-product-officer/other-services.html` | `/roles/cio/other-services.html` |
| 15 | 24.09% | `/roles/cio/other-services.html` | `/roles/cmo/other-services.html` |
| 16 | 24.02% | `/roles/chair/other-services.html` | `/roles/managing-director/other-services.html` |
| 17 | 23.87% | `/roles/chief-product-officer/other-services.html` | `/roles/cmo/other-services.html` |
| 18 | 23.86% | `/roles/cfo/other-services.html` | `/roles/coo/other-services.html` |
| 19 | 23.83% | `/roles/cfo/other-services.html` | `/roles/ciso/other-services.html` |
| 20 | 23.81% | `/roles/head-growth/other-services.html` | `/roles/partner/other-services.html` |

### public-sector-government

Pages: 29; comparisons: 406; average overlap: 20.08%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 29.99% | `/roles/chair/public-sector-government.html` | `/roles/chief-revenue-officer/public-sector-government.html` |
| 2 | 28.77% | `/roles/non-executive-director/public-sector-government.html` | `/roles/partner/public-sector-government.html` |
| 3 | 28.45% | `/roles/cfo/public-sector-government.html` | `/roles/chro/public-sector-government.html` |
| 4 | 27.99% | `/roles/coo/public-sector-government.html` | `/roles/director-people/public-sector-government.html` |
| 5 | 27.89% | `/roles/board-director/public-sector-government.html` | `/roles/director-people/public-sector-government.html` |
| 6 | 27.77% | `/roles/chief-strategy-officer/public-sector-government.html` | `/roles/cto/public-sector-government.html` |
| 7 | 27.13% | `/roles/board-director/public-sector-government.html` | `/roles/coo/public-sector-government.html` |
| 8 | 26.96% | `/roles/managing-director/public-sector-government.html` | `/roles/partner/public-sector-government.html` |
| 9 | 26.69% | `/roles/cfo/public-sector-government.html` | `/roles/cmo/public-sector-government.html` |
| 10 | 26.05% | `/roles/managing-partner/public-sector-government.html` | `/roles/non-executive-director/public-sector-government.html` |
| 11 | 25.93% | `/roles/chief-product-officer/public-sector-government.html` | `/roles/chief-revenue-officer/public-sector-government.html` |
| 12 | 25.84% | `/roles/ceo/public-sector-government.html` | `/roles/chro/public-sector-government.html` |
| 13 | 25.83% | `/roles/partner/public-sector-government.html` | `/roles/vp-finance/public-sector-government.html` |
| 14 | 25.73% | `/roles/cio/public-sector-government.html` | `/roles/ciso/public-sector-government.html` |
| 15 | 25.71% | `/roles/managing-partner/public-sector-government.html` | `/roles/partner/public-sector-government.html` |
| 16 | 25.63% | `/roles/chief-strategy-officer/public-sector-government.html` | `/roles/managing-director/public-sector-government.html` |
| 17 | 25.62% | `/roles/ceo/public-sector-government.html` | `/roles/partner/public-sector-government.html` |
| 18 | 25.52% | `/roles/ceo/public-sector-government.html` | `/roles/chief-strategy-officer/public-sector-government.html` |
| 19 | 25.44% | `/roles/ciso/public-sector-government.html` | `/roles/partner/public-sector-government.html` |
| 20 | 25.33% | `/roles/chief-revenue-officer/public-sector-government.html` | `/roles/cmo/public-sector-government.html` |

### real-estate-leasing

Pages: 27; comparisons: 351; average overlap: 19.53%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.73% | `/roles/board-director/real-estate-leasing.html` | `/roles/cmo/real-estate-leasing.html` |
| 2 | 27.65% | `/roles/chro/real-estate-leasing.html` | `/roles/partner/real-estate-leasing.html` |
| 3 | 26.81% | `/roles/managing-director/real-estate-leasing.html` | `/roles/non-executive-director/real-estate-leasing.html` |
| 4 | 26.27% | `/roles/partner/real-estate-leasing.html` | `/roles/vp-finance/real-estate-leasing.html` |
| 5 | 26.24% | `/roles/head-growth/real-estate-leasing.html` | `/roles/head-legal/real-estate-leasing.html` |
| 6 | 25.76% | `/roles/cmo/real-estate-leasing.html` | `/roles/coo/real-estate-leasing.html` |
| 7 | 25.59% | `/roles/managing-partner/real-estate-leasing.html` | `/roles/partner/real-estate-leasing.html` |
| 8 | 25.51% | `/roles/chief-revenue-officer/real-estate-leasing.html` | `/roles/partner/real-estate-leasing.html` |
| 9 | 25.15% | `/roles/director-finance/real-estate-leasing.html` | `/roles/head-legal/real-estate-leasing.html` |
| 10 | 24.85% | `/roles/cio/real-estate-leasing.html` | `/roles/partner/real-estate-leasing.html` |
| 11 | 24.77% | `/roles/cfo/real-estate-leasing.html` | `/roles/coo/real-estate-leasing.html` |
| 12 | 24.77% | `/roles/cfo/real-estate-leasing.html` | `/roles/head-growth/real-estate-leasing.html` |
| 13 | 24.60% | `/roles/non-executive-director/real-estate-leasing.html` | `/roles/vp-marketing/real-estate-leasing.html` |
| 14 | 24.58% | `/roles/ciso/real-estate-leasing.html` | `/roles/partner/real-estate-leasing.html` |
| 15 | 24.45% | `/roles/chief-revenue-officer/real-estate-leasing.html` | `/roles/chro/real-estate-leasing.html` |
| 16 | 24.38% | `/roles/director-finance/real-estate-leasing.html` | `/roles/head-growth/real-estate-leasing.html` |
| 17 | 24.38% | `/roles/cfo/real-estate-leasing.html` | `/roles/head-legal/real-estate-leasing.html` |
| 18 | 24.33% | `/roles/chief-product-officer/real-estate-leasing.html` | `/roles/cio/real-estate-leasing.html` |
| 19 | 24.25% | `/roles/cto/real-estate-leasing.html` | `/roles/general-counsel/real-estate-leasing.html` |
| 20 | 24.24% | `/roles/director-legal/real-estate-leasing.html` | `/roles/vp-finance/real-estate-leasing.html` |

### retail-ecommerce

Pages: 31; comparisons: 465; average overlap: 19.99%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.40% | `/roles/chief-product-officer/retail-ecommerce.html` | `/roles/general-counsel/retail-ecommerce.html` |
| 2 | 27.03% | `/roles/chair/retail-ecommerce.html` | `/roles/chief-strategy-officer/retail-ecommerce.html` |
| 3 | 26.93% | `/roles/chief-strategy-officer/retail-ecommerce.html` | `/roles/cio/retail-ecommerce.html` |
| 4 | 26.90% | `/roles/cfo/retail-ecommerce.html` | `/roles/chief-product-officer/retail-ecommerce.html` |
| 5 | 26.87% | `/roles/director-marketing/retail-ecommerce.html` | `/roles/non-executive-director/retail-ecommerce.html` |
| 6 | 26.79% | `/roles/non-executive-director/retail-ecommerce.html` | `/roles/partner/retail-ecommerce.html` |
| 7 | 26.31% | `/roles/cfo/retail-ecommerce.html` | `/roles/chro/retail-ecommerce.html` |
| 8 | 26.25% | `/roles/ciso/retail-ecommerce.html` | `/roles/director-product/retail-ecommerce.html` |
| 9 | 26.12% | `/roles/cto/retail-ecommerce.html` | `/roles/vp-operations/retail-ecommerce.html` |
| 10 | 25.98% | `/roles/managing-partner/retail-ecommerce.html` | `/roles/partner/retail-ecommerce.html` |
| 11 | 25.87% | `/roles/board-director/retail-ecommerce.html` | `/roles/chief-product-officer/retail-ecommerce.html` |
| 12 | 25.67% | `/roles/chief-product-officer/retail-ecommerce.html` | `/roles/coo/retail-ecommerce.html` |
| 13 | 25.58% | `/roles/vp-operations/retail-ecommerce.html` | `/roles/vp-product/retail-ecommerce.html` |
| 14 | 25.57% | `/roles/vp-marketing/retail-ecommerce.html` | `/roles/vp-sales/retail-ecommerce.html` |
| 15 | 25.54% | `/roles/ciso/retail-ecommerce.html` | `/roles/cto/retail-ecommerce.html` |
| 16 | 25.52% | `/roles/cmo/retail-ecommerce.html` | `/roles/cto/retail-ecommerce.html` |
| 17 | 25.36% | `/roles/ceo/retail-ecommerce.html` | `/roles/coo/retail-ecommerce.html` |
| 18 | 25.34% | `/roles/cmo/retail-ecommerce.html` | `/roles/coo/retail-ecommerce.html` |
| 19 | 25.19% | `/roles/director-sales/retail-ecommerce.html` | `/roles/vp-marketing/retail-ecommerce.html` |
| 20 | 25.15% | `/roles/chief-revenue-officer/retail-ecommerce.html` | `/roles/cmo/retail-ecommerce.html` |

### technology-media-telecom

Pages: 39; comparisons: 741; average overlap: 19.80%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 30.18% | `/roles/chief-revenue-officer/technology-media-telecom.html` | `/roles/cio/technology-media-telecom.html` |
| 2 | 28.88% | `/roles/director-people/technology-media-telecom.html` | `/roles/director-sales/technology-media-telecom.html` |
| 3 | 28.81% | `/roles/director-product/technology-media-telecom.html` | `/roles/director-sales/technology-media-telecom.html` |
| 4 | 27.44% | `/roles/chief-product-officer/technology-media-telecom.html` | `/roles/chro/technology-media-telecom.html` |
| 5 | 27.40% | `/roles/chief-product-officer/technology-media-telecom.html` | `/roles/ciso/technology-media-telecom.html` |
| 6 | 26.73% | `/roles/chief-revenue-officer/technology-media-telecom.html` | `/roles/cmo/technology-media-telecom.html` |
| 7 | 26.38% | `/roles/managing-partner/technology-media-telecom.html` | `/roles/vp-people/technology-media-telecom.html` |
| 8 | 26.24% | `/roles/chair/technology-media-telecom.html` | `/roles/director-sales/technology-media-telecom.html` |
| 9 | 26.11% | `/roles/director-legal/technology-media-telecom.html` | `/roles/director-marketing/technology-media-telecom.html` |
| 10 | 25.97% | `/roles/cio/technology-media-telecom.html` | `/roles/cmo/technology-media-telecom.html` |
| 11 | 25.91% | `/roles/director-people/technology-media-telecom.html` | `/roles/vp-marketing/technology-media-telecom.html` |
| 12 | 25.88% | `/roles/cfo/technology-media-telecom.html` | `/roles/partner/technology-media-telecom.html` |
| 13 | 25.74% | `/roles/director-product/technology-media-telecom.html` | `/roles/vp-product/technology-media-telecom.html` |
| 14 | 25.43% | `/roles/coo/technology-media-telecom.html` | `/roles/vp-finance/technology-media-telecom.html` |
| 15 | 25.39% | `/roles/coo/technology-media-telecom.html` | `/roles/cto/technology-media-telecom.html` |
| 16 | 25.37% | `/roles/head-business-development/technology-media-telecom.html` | `/roles/head-compliance/technology-media-telecom.html` |
| 17 | 25.34% | `/roles/vp-sales/technology-media-telecom.html` | `/roles/vp-strategy/technology-media-telecom.html` |
| 18 | 25.24% | `/roles/head-data-ai/technology-media-telecom.html` | `/roles/head-legal/technology-media-telecom.html` |
| 19 | 25.22% | `/roles/managing-partner/technology-media-telecom.html` | `/roles/non-executive-director/technology-media-telecom.html` |
| 20 | 25.04% | `/roles/chief-revenue-officer/technology-media-telecom.html` | `/roles/ciso/technology-media-telecom.html` |

### transportation-logistics

Pages: 26; comparisons: 325; average overlap: 19.42%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 28.77% | `/roles/chief-strategy-officer/transportation-logistics.html` | `/roles/cto/transportation-logistics.html` |
| 2 | 26.97% | `/roles/chro/transportation-logistics.html` | `/roles/cio/transportation-logistics.html` |
| 3 | 26.20% | `/roles/chief-revenue-officer/transportation-logistics.html` | `/roles/managing-partner/transportation-logistics.html` |
| 4 | 25.91% | `/roles/cfo/transportation-logistics.html` | `/roles/cio/transportation-logistics.html` |
| 5 | 25.87% | `/roles/chro/transportation-logistics.html` | `/roles/coo/transportation-logistics.html` |
| 6 | 25.81% | `/roles/ciso/transportation-logistics.html` | `/roles/cmo/transportation-logistics.html` |
| 7 | 25.46% | `/roles/vp-operations/transportation-logistics.html` | `/roles/vp-product/transportation-logistics.html` |
| 8 | 25.36% | `/roles/vp-engineering/transportation-logistics.html` | `/roles/vp-operations/transportation-logistics.html` |
| 9 | 25.31% | `/roles/ciso/transportation-logistics.html` | `/roles/non-executive-director/transportation-logistics.html` |
| 10 | 25.15% | `/roles/cfo/transportation-logistics.html` | `/roles/chief-revenue-officer/transportation-logistics.html` |
| 11 | 25.09% | `/roles/cmo/transportation-logistics.html` | `/roles/non-executive-director/transportation-logistics.html` |
| 12 | 25.04% | `/roles/managing-director/transportation-logistics.html` | `/roles/partner/transportation-logistics.html` |
| 13 | 25.04% | `/roles/ceo/transportation-logistics.html` | `/roles/ciso/transportation-logistics.html` |
| 14 | 24.94% | `/roles/ceo/transportation-logistics.html` | `/roles/vp-operations/transportation-logistics.html` |
| 15 | 24.79% | `/roles/ceo/transportation-logistics.html` | `/roles/chro/transportation-logistics.html` |
| 16 | 24.52% | `/roles/cfo/transportation-logistics.html` | `/roles/cto/transportation-logistics.html` |
| 17 | 24.48% | `/roles/coo/transportation-logistics.html` | `/roles/vp-operations/transportation-logistics.html` |
| 18 | 24.19% | `/roles/director-engineering/transportation-logistics.html` | `/roles/head-compliance/transportation-logistics.html` |
| 19 | 24.08% | `/roles/board-director/transportation-logistics.html` | `/roles/director-product/transportation-logistics.html` |
| 20 | 24.06% | `/roles/director-operations/transportation-logistics.html` | `/roles/vp-operations/transportation-logistics.html` |

### utilities

Pages: 23; comparisons: 253; average overlap: 18.56%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 26.98% | `/roles/chro/utilities.html` | `/roles/partner/utilities.html` |
| 2 | 25.31% | `/roles/chief-strategy-officer/utilities.html` | `/roles/vp-operations/utilities.html` |
| 3 | 25.15% | `/roles/cmo/utilities.html` | `/roles/partner/utilities.html` |
| 4 | 24.39% | `/roles/ceo/utilities.html` | `/roles/chief-strategy-officer/utilities.html` |
| 5 | 24.33% | `/roles/chro/utilities.html` | `/roles/cmo/utilities.html` |
| 6 | 24.09% | `/roles/chief-revenue-officer/utilities.html` | `/roles/cto/utilities.html` |
| 7 | 24.06% | `/roles/vp-engineering/utilities.html` | `/roles/vp-operations/utilities.html` |
| 8 | 23.99% | `/roles/director-operations/utilities.html` | `/roles/managing-partner/utilities.html` |
| 9 | 23.72% | `/roles/chief-product-officer/utilities.html` | `/roles/cio/utilities.html` |
| 10 | 23.61% | `/roles/ciso/utilities.html` | `/roles/partner/utilities.html` |
| 11 | 23.54% | `/roles/cio/utilities.html` | `/roles/ciso/utilities.html` |
| 12 | 23.42% | `/roles/chief-product-officer/utilities.html` | `/roles/general-counsel/utilities.html` |
| 13 | 23.12% | `/roles/chief-product-officer/utilities.html` | `/roles/managing-partner/utilities.html` |
| 14 | 23.05% | `/roles/chro/utilities.html` | `/roles/coo/utilities.html` |
| 15 | 23.00% | `/roles/board-director/utilities.html` | `/roles/chair/utilities.html` |
| 16 | 22.93% | `/roles/board-director/utilities.html` | `/roles/cmo/utilities.html` |
| 17 | 22.91% | `/roles/chro/utilities.html` | `/roles/ciso/utilities.html` |
| 18 | 22.83% | `/roles/ceo/utilities.html` | `/roles/vp-operations/utilities.html` |
| 19 | 22.74% | `/roles/cfo/utilities.html` | `/roles/ciso/utilities.html` |
| 20 | 22.69% | `/roles/chair/utilities.html` | `/roles/chief-revenue-officer/utilities.html` |

### wholesale-distribution

Pages: 22; comparisons: 231; average overlap: 19.26%.

| Rank | Overlap | Page A | Page B |
|---:|---:|---|---|
| 1 | 27.29% | `/roles/chief-product-officer/wholesale-distribution.html` | `/roles/coo/wholesale-distribution.html` |
| 2 | 26.60% | `/roles/chief-strategy-officer/wholesale-distribution.html` | `/roles/partner/wholesale-distribution.html` |
| 3 | 26.16% | `/roles/board-director/wholesale-distribution.html` | `/roles/managing-director/wholesale-distribution.html` |
| 4 | 26.09% | `/roles/ceo/wholesale-distribution.html` | `/roles/cto/wholesale-distribution.html` |
| 5 | 25.79% | `/roles/ciso/wholesale-distribution.html` | `/roles/cmo/wholesale-distribution.html` |
| 6 | 25.67% | `/roles/ciso/wholesale-distribution.html` | `/roles/coo/wholesale-distribution.html` |
| 7 | 25.31% | `/roles/chief-revenue-officer/wholesale-distribution.html` | `/roles/chief-strategy-officer/wholesale-distribution.html` |
| 8 | 25.12% | `/roles/chief-revenue-officer/wholesale-distribution.html` | `/roles/cmo/wholesale-distribution.html` |
| 9 | 24.84% | `/roles/chief-revenue-officer/wholesale-distribution.html` | `/roles/ciso/wholesale-distribution.html` |
| 10 | 24.55% | `/roles/chief-product-officer/wholesale-distribution.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 11 | 24.47% | `/roles/chief-strategy-officer/wholesale-distribution.html` | `/roles/coo/wholesale-distribution.html` |
| 12 | 24.41% | `/roles/chief-product-officer/wholesale-distribution.html` | `/roles/ciso/wholesale-distribution.html` |
| 13 | 24.21% | `/roles/cmo/wholesale-distribution.html` | `/roles/coo/wholesale-distribution.html` |
| 14 | 24.15% | `/roles/cto/wholesale-distribution.html` | `/roles/managing-partner/wholesale-distribution.html` |
| 15 | 24.14% | `/roles/chief-strategy-officer/wholesale-distribution.html` | `/roles/vp-sales/wholesale-distribution.html` |
| 16 | 23.80% | `/roles/chief-revenue-officer/wholesale-distribution.html` | `/roles/general-counsel/wholesale-distribution.html` |
| 17 | 23.78% | `/roles/chair/wholesale-distribution.html` | `/roles/non-executive-director/wholesale-distribution.html` |
| 18 | 23.77% | `/roles/head-business-development/wholesale-distribution.html` | `/roles/managing-partner/wholesale-distribution.html` |
| 19 | 23.62% | `/roles/chro/wholesale-distribution.html` | `/roles/cmo/wholesale-distribution.html` |
| 20 | 23.61% | `/roles/chief-revenue-officer/wholesale-distribution.html` | `/roles/coo/wholesale-distribution.html` |

## Every failing comparison

| Group | Overlap | Page A | Page B |
|---|---:|---|---|
| vp-engineering | 31.07% | `/roles/vp-engineering/manufacturing.html` | `/roles/vp-engineering/transportation-logistics.html` |
| technology-media-telecom | 30.18% | `/roles/chief-revenue-officer/technology-media-telecom.html` | `/roles/cio/technology-media-telecom.html` |
| general-counsel | 30.04% | `/roles/general-counsel/real-estate-leasing.html` | `/roles/general-counsel/transportation-logistics.html` |
