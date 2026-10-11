const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const originalPages = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'seo-pages.json'), 'utf8')
);
const additions = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'seo-pages-additions.json'), 'utf8')
);
const categoryForExistingPage = new Map([
  ['reverse-recruiting', 'services'],
  ['executive-search-support', 'services'],
  ['career-strategy-senior-leaders', 'services'],
  ['executive-resume-strategy', 'services'],
  ['interview-coaching-executives', 'services'],
  ['executive-negotiation-support', 'services'],
  ['linkedin-optimization-executives', 'services'],
  ['executive-job-search-dubai', 'markets'],
  ['executive-job-search-uae', 'markets'],
  ['executive-career-support-saudi-arabia', 'markets'],
  ['leadership-hiring-gcc', 'markets'],
  ['executive-search-europe', 'markets'],
  ['executive-search-north-america', 'markets'],
  ['reverse-recruiting-cfos', 'roles'],
  ['reverse-recruiting-ctos', 'roles'],
  ['reverse-recruiting-cmos', 'roles'],
  ['executive-search-chros', 'roles'],
  ['executive-search-saas-leaders', 'industries'],
  ['healthcare-executive-search', 'industries'],
  ['executive-hiring-fintech', 'industries'],
]);
const groupLabels = new Map([
  ['services', 'Core services'],
  ['markets', 'Geography and markets'],
  ['roles', 'Seniority and roles'],
  ['industries', 'Industries'],
  ['resources', 'Proof and next steps'],
]);
const existingPages = new Set(
  fs.readdirSync(root).filter((file) => file.endsWith('.html'))
);
const pages = [
  ...originalPages.map((page) => ({
    ...page,
    category: categoryForExistingPage.get(page.slug),
  })),
  ...additions,
];

function additionToPage(page) {
  const serviceAudience = ['services', 'roles'].includes(page.category)
    ? page.slug.includes('search-support') || page.slug.includes('global-talent')
      ? 'employer'
      : 'professional'
    : page.category === 'industries'
      ? 'employer'
      : page.category === 'markets'
        ? page.slug.includes('hiring') || page.slug.includes('sourcing') || page.slug.includes('search-singapore') || page.slug.includes('search-middle-east')
          ? 'employer'
          : 'professional'
        : 'mixed';
  const audienceLabel = serviceAudience === 'employer'
    ? 'the hiring team'
    : serviceAudience === 'professional'
      ? 'the professional'
      : 'you and KOV';
  const imageByCategory = {
    services: ['assets/kov-search-grid.svg', 'Illustration of a structured executive search process.'],
    markets: ['assets/kov-global-grid.svg', 'Illustration of a global market and talent search.'],
    roles: ['assets/kov-search-grid.svg', 'Illustration of a structured leadership career search.'],
    industries: ['assets/kov-research-layer.svg', 'Illustration of research used to define an executive talent market.'],
    resources: ['assets/kov-intelligence-grid.svg', 'Illustration of a structured career and talent-search process.'],
  };
  const [image, imageAlt] = imageByCategory[page.category];
  const isProof = new Set([
    'case-studies',
    'candidate-success-stories',
    'anonymous-executive-reviews',
    'client-hiring-results',
    'executive-career-outcomes',
  ]).has(page.slug);
  const researchGuidance = isProof
    ? 'KOV distinguishes illustrative process material from verified client evidence. No testimonial, placement, salary figure or hiring result is invented for this page.'
    : page.category === 'resources'
      ? `${page.points.join('; ')}. Use these points as a starting framework and confirm current facts with the relevant employer or qualified adviser.`
      : 'Titles and broad market labels do not establish fit by themselves. Confirm the remit, requirements and practical boundaries before any application, outreach or shortlist activity.';
  const generalFaqs = [
    {
      question: 'What should I share to start?',
      answer: `${page.lead} Start with the role or question, relevant markets and practical constraints; share sensitive details only when they are needed.`,
    },
    {
      question: 'Does this service guarantee a job, hire or timeline?',
      answer: 'No. KOV can carry out only the activities agreed in writing. Employers control hiring decisions, and market conditions and timing remain outside KOV’s control.',
    },
    {
      question: 'How are fees handled?',
      answer: 'Fees are discussed directly by message, alongside scope and deliverables, and agreed in writing before work begins.',
    },
  ];
  return {
    ...page,
    eyebrow: `${groupLabels.get(page.category).toUpperCase()} · KOV CAREER AGENCY`,
    introduction: page.focus,
    image,
    imageAlt,
    sections: [
      {
        eyebrow: 'DEFINE THE CONTEXT',
        title: 'Start with the role, market or question—not assumptions.',
        paragraphs: [
          page.focus,
          `${page.lead} The first step is to make the decision criteria clear enough to guide useful research and practical next actions.`,
        ],
        bullets: page.points.slice(0, 3),
      },
      {
        eyebrow: 'RESEARCH BEFORE ACTION',
        title: 'Use relevant evidence to set priorities.',
        paragraphs: [
          `${page.points.join('; ')}. These considerations help ${audienceLabel} distinguish a genuine fit from a surface-level match.`,
          researchGuidance,
        ],
        bullets: page.points.slice(1),
      },
      {
        eyebrow: 'AGREE THE NEXT STEP',
        title: 'Keep scope, approvals and expectations explicit.',
        paragraphs: [
          page.ctaCopy,
          'Before work begins, KOV and the client confirm responsibilities, deliverables, approvals, communication and fees in writing. The client remains responsible for their decisions and any specialist legal, immigration, tax or compensation advice.',
        ],
        bullets: [
          'Confirm the target and the work included',
          'Agree information-sharing and approval preferences',
          'Set practical updates and review points',
        ],
      },
    ],
    faqs: generalFaqs,
    related: [
      { slug: 'candidate-services', label: 'Executive Career Representation' },
      { slug: 'company-services', label: 'Global Talent Sourcing for Employers' },
      { slug: 'contact', label: 'Contact KOV' },
    ],
  };
}

const completePages = pages.map((page) =>
  page.sections ? page : additionToPage(page)
);
const pagePaths = new Map(
  completePages.map((page) => [page.slug, `${page.category}/${page.slug}.html`])
);
const expectedCounts = new Map([
  ['services', 10],
  ['markets', 12],
  ['roles', 12],
  ['industries', 12],
  ['resources', 14],
]);

if (completePages.length !== 60) {
  throw new Error(`Expected 60 pages; received ${completePages.length}.`);
}
for (const [category, expected] of expectedCounts) {
  const actual = completePages.filter((page) => page.category === category).length;
  if (actual !== expected) {
    throw new Error(`Expected ${expected} ${category} pages; received ${actual}.`);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function renderSection(section) {
  return `<section class="kov-section"><div class="kov-section-heading"><p class="kov-eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2></div><div class="kov-copy">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul class="kov-list">${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</div></section>`;
}

function renderFaq(item) {
  return `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`;
}

function hrefForPage(page, slug) {
  const targetPath = pagePaths.get(slug) ||
    (existingPages.has(`${slug}.html`) ? `${slug}.html` : null);
  if (!targetPath) {
    throw new Error(`Unknown page "${slug}" linked from "${page.slug}".`);
  }
  return path.posix.relative(page.category, targetPath);
}

function renderTopicMenu(page, isMobile = false) {
  const groups = [...expectedCounts.keys()].map((category) => {
    const label = groupLabels.get(category);
    const links = completePages
      .filter((entry) => entry.category === category)
      .map((entry) => `<li><a href="${escapeHtml(hrefForPage(page, entry.slug))}">${escapeHtml(entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''))}</a></li>`)
      .join('');
    return isMobile
      ? `<details class="kov-topic-nav-group"><summary>${escapeHtml(label)}</summary><ul>${links}</ul></details>`
      : `<section class="kov-topic-nav-group"><h3>${escapeHtml(label)}</h3><ul>${links}</ul></section>`;
  }).join('');
  const className = isMobile
    ? 'kov-topic-nav kov-topic-nav-mobile'
    : 'kov-topic-nav';
  const summary = isMobile ? 'Browse all 60 pages' : 'Explore pages';
  return `<details class="${className}"><summary aria-label="Browse all 60 pages by topic">${summary}</summary><div class="kov-topic-nav-panel">${groups}</div></details>`;
}

function renderFooterCategories(page) {
  const groups = [...expectedCounts.keys()].map((category) => {
    const entries = completePages.filter((entry) => entry.category === category);
    const links = entries.map((entry) =>
      `<li><a href="${escapeHtml(hrefForPage(page, entry.slug))}">${escapeHtml(entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''))}</a></li>`
    ).join('');
    return `<section class="kov-footer-category"><h3>${escapeHtml(groupLabels.get(category))}</h3><ul>${links}</ul></section>`;
  }).join('');
  return `<nav class="kov-footer-categories" data-kov-footer-categories aria-label="Browse all 60 pages"><h2>Explore all 60 pages</h2><div class="kov-footer-category-grid">${groups}</div></nav>`;
}

function renderPage(page) {
  const pageUrl = `https://kovcareeragency.org/${pagePaths.get(page.slug)}`;
  const related = page.related.map((item) => {
    const filename = hrefForPage(page, item.slug);
    return `<li><a href="${escapeHtml(filename)}">${escapeHtml(item.label)}</a></li>`;
  }).join('');
  const rootAsset = (filename) => `../${filename}`;
  const contactHref = hrefForPage(page, 'contact');
  const homeHref = hrefForPage(page, 'index');
  const imageHref = page.image.startsWith('http')
    ? page.image
    : rootAsset(page.image);
  const relatedHref = hrefForPage(page, page.related[0].slug);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['ProfessionalService', 'EmploymentAgency'],
        '@id': 'https://kovcareeragency.org/#organization',
        name: 'KOV Career Agency',
        url: 'https://kovcareeragency.org/',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kovcareeragency.org/#website',
        name: 'KOV Career Agency',
        url: 'https://kovcareeragency.org/',
        publisher: { '@id': 'https://kovcareeragency.org/#organization' },
      },
      {
        '@type': 'WebPage',
        name: page.title,
        description: page.description,
        url: pageUrl,
        isPartOf: { '@id': 'https://kovcareeragency.org/#website' },
        about: { '@id': 'https://kovcareeragency.org/#organization' },
      },
    ],
  }, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="KOV Career Agency">
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" type="image/png" href="${rootAsset('kov-logo.png')}">
  <link rel="stylesheet" href="${rootAsset('assets/styles-DateywTe.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/site-fixes.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/two-sided.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/two-sided-type.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/seo-pages.css')}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,800&family=Inter:wght@300;400;500;600;700&display=swap">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="KOV Career Agency">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:image" content="https://kovcareeragency.org/preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="https://kovcareeragency.org/preview.png">
  <script src="${rootAsset('assets/google-translate.js')}" defer></script>
  <script src="${rootAsset('assets/site-search-index.js')}" defer></script>
  <script src="${rootAsset('assets/site-search.js')}" defer></script>
  <script src="${rootAsset('assets/reactive-visuals.js?v=6')}" defer></script>
  <script src="${rootAsset('assets/audience-nav.js')}" defer></script>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <div class="two-sided-page seo-landing-page">
    <header class="kov-header">
      <a class="kov-brand" href="${homeHref}"><img src="${rootAsset('kov-logo.png')}" alt="KOV"><span>KOV <small>Career Agency</small></span></a>
      <nav class="kov-nav" aria-label="Primary navigation">
        <a href="${hrefForPage(page, 'services')}">Services</a><a href="${hrefForPage(page, 'countries-we-serve')}">Global markets</a><a class="audience-link" href="${hrefForPage(page, 'candidate-services')}">For Candidates</a><a class="audience-link" href="${hrefForPage(page, 'company-services')}">For Companies</a>${renderTopicMenu(page)}<a class="kov-nav-cta" href="${contactHref}">Start a Conversation</a>
      </nav>
      <details class="seo-mobile-menu">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <a href="${hrefForPage(page, 'services')}">Services</a><a href="${hrefForPage(page, 'countries-we-serve')}">Global markets</a><a href="${hrefForPage(page, 'candidate-services')}">For Candidates</a><a href="${hrefForPage(page, 'company-services')}">For Companies</a>${renderTopicMenu(page, true)}<a href="${contactHref}">Start a Conversation</a>
        </nav>
      </details>
    </header>
    <main>
      <section class="kov-hero seo-hero">
        <div class="kov-hero-copy">
          <p class="kov-eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="kov-lead">${escapeHtml(page.lead)}</p>
          <p>${escapeHtml(page.introduction)}</p>
          <div class="kov-actions"><a class="kov-button" href="${contactHref}">${escapeHtml(page.cta)}</a><a class="kov-text-link" href="${escapeHtml(relatedHref)}">Explore related KOV support</a></div>
        </div>
        <figure class="seo-hero-art"><img src="${escapeHtml(imageHref)}" alt="${escapeHtml(page.imageAlt)}"><figcaption>Illustrative visual · engagement scope confirmed directly with KOV</figcaption></figure>
      </section>
      ${page.sections.map(renderSection).join('\n      ')}
      <section class="kov-section kov-section-tint seo-faq" aria-labelledby="seo-faq-heading">
        <div class="kov-section-heading"><p class="kov-eyebrow">COMMON QUESTIONS</p><h2 id="seo-faq-heading">Before you start a conversation.</h2></div>
        ${page.faqs.map(renderFaq).join('\n        ')}
      </section>
      <section class="kov-section seo-related"><div class="kov-section-heading"><p class="kov-eyebrow">EXPLORE THE KOV MODEL</p><h2>Related services and markets.</h2></div><ul class="seo-related-links">${related}</ul></section>
      <section class="kov-final-cta">
        <p class="kov-eyebrow">START A CONFIDENTIAL CONVERSATION</p>
        <h2>${escapeHtml(page.ctaHeading)}</h2>
        <p>${escapeHtml(page.ctaCopy)}</p>
        <p class="seo-scope-note">KOV works remotely across agreed markets; this page does not imply a local office or guaranteed outcome. Engagement scope and fees are discussed directly by message and agreed in writing before work begins.</p>
        <div class="kov-actions kov-actions-center"><a class="kov-button" href="${contactHref}">${escapeHtml(page.cta)}</a></div>
      </section>
    </main>
    <footer class="kov-footer">
      <a class="kov-brand" href="${homeHref}"><img src="${rootAsset('kov-logo.png')}" alt="KOV"><span>KOV <small>Career Agency</small></span></a>
      <nav aria-label="Footer navigation"><div><b>EXPLORE</b><a href="${hrefForPage(page, 'candidate-services')}">Candidate representation</a><a href="${hrefForPage(page, 'company-services')}">Company talent sourcing</a><a href="${hrefForPage(page, 'countries-we-serve')}">Countries We Serve</a></div><div><b>ABOUT</b><a href="${hrefForPage(page, 'why-kov')}">Why KOV</a><a href="${hrefForPage(page, 'about')}">Founder</a><a href="${contactHref}">Contact</a></div></nav>
      ${renderFooterCategories(page)}
      <p class="kov-legal">© 2026 KOV Career Agency. Engagement scope and deliverables are agreed directly.</p>
    </footer>
  </div>
</body>
</html>
`;
}

for (const page of completePages) {
  if (!/^[a-z0-9-]+$/.test(page.slug) ||
      !expectedCounts.has(page.category)) {
    throw new Error(`Invalid slug "${page.slug}".`);
  }
  const destination = pagePaths.get(page.slug);
  fs.mkdirSync(path.dirname(path.join(root, destination)), { recursive: true });
  fs.writeFileSync(
    path.join(root, destination),
    renderPage(page),
    'utf8'
  );
}

for (const page of originalPages) {
  const destination = pagePaths.get(page.slug);
  const target = destination;
  const redirect = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${target}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="https://kovcareeragency.org/${target}">
  <title>Page moved | KOV Career Agency</title>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
</head>
<body><p>This page has moved. <a href="${destination}">Continue to the updated page.</a></p></body>
</html>
`;
  fs.writeFileSync(path.join(root, `${page.slug}.html`), redirect, 'utf8');
}

for (const filename of fs.readdirSync(root).filter((file) => file.endsWith('.html'))) {
  const fullPath = path.join(root, filename);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const page of originalPages) {
    content = content.replaceAll(
      `href="${page.slug}.html"`,
      `href="${pagePaths.get(page.slug)}"`
    );
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const lastmod = new Date().toISOString().slice(0, 10);
const corePages = [
  'services.html',
  'global-talent-sourcer.html',
  'how-it-works.html',
  'faqs.html',
  'about.html',
  'contact.html',
  'candidate-services.html',
  'company-services.html',
  'candidate-proof.html',
  'company-proof.html',
  'why-kov.html',
  'countries-we-serve.html',
  'glossary.html',
];
for (const filename of corePages) {
  const pageUrl = `https://kovcareeragency.org/${filename}`;
  if (!sitemap.includes(`<loc>${pageUrl}</loc>`)) {
    sitemap = sitemap.replace(
      '</urlset>',
      `  <url><loc>${pageUrl}</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>`
    );
  }
}
for (const page of originalPages) {
  sitemap = sitemap.replace(
    new RegExp(`\\s*<url><loc>https://kovcareeragency\\.org/${page.slug}\\.html</loc><lastmod>[^<]*</lastmod></url>`),
    ''
  );
}
for (const page of completePages) {
  const pageUrl = `https://kovcareeragency.org/${pagePaths.get(page.slug)}`;
  if (!sitemap.includes(`<loc>${pageUrl}</loc>`)) {
    sitemap = sitemap.replace(
      '</urlset>',
      `  <url><loc>${pageUrl}</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>`
    );
  }
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`Generated ${completePages.length} static landing pages in five clusters and updated sitemap.xml.`);
