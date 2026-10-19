# KOV Career Agency: AI visibility pack v3

Goal: keep every question available to AI and search engines, without hidden schema and without cluttering your main pages.

| What | Where it goes |
|---|---|
| `llms-full.txt` | site root -> kovcareeragency.org/llms-full.txt (all 2496 questions, plain text, AI-only) |
| `llms.txt` | site root (now links to llms-full.txt and the FAQ library) |
| `robots.txt` | site root (95 crawlers) |
| `faq/` folder (30 pages) | upload as kovcareeragency.org/faq/ - each page has visible questions AND matching schema |
| `sitemap-additions.xml` | copy the <url> lines into your sitemap.xml |
| `footer-link-snippet.html` | one footer link to /faq/index.html |
| `1-core-jsonld.html` | <head> of every page |
| `2-service-schema-*.html` | <head> of services.html / candidate-services.html |
| `main-pages-short-faq/` | optional: 20 questions per main page. Paste BOTH the -schema and -visible file for a page, or neither |

Rules
- Never paste a -schema file without its matching visible content.
- The FAQ library pages already contain both. Nothing in them is hidden.
- Review the answers before publishing, especially the 16 site-style FAQ answers I wrote myself.
