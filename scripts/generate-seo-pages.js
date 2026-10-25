const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const newOnly = process.argv.includes('--new-only');
const originalPages = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'seo-pages.json'), 'utf8')
);
const additions = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'seo-pages-additions.json'), 'utf8')
);
const categoryForExistingPage = new Map([
  ['reverse-recruiting', 'services'],
  ['career-strategy-senior-leaders', 'services'],
  ['executive-resume-strategy', 'services'],
  ['interview-coaching-executives', 'services'],
  ['executive-negotiation-support', 'services'],
  ['linkedin-optimization-executives', 'services'],
  ['executive-job-search-dubai', 'markets'],
  ['executive-job-search-uae', 'markets'],
  ['executive-career-support-saudi-arabia', 'markets'],
  ['reverse-recruiting-cfos', 'roles'],
  ['reverse-recruiting-ctos', 'roles'],
  ['reverse-recruiting-cmos', 'roles'],
  ['roles', 'roles'],
  ['industries', 'industries'],
]);
const groupLabels = new Map([
  ['services', 'Core services'],
  ['markets', 'Geography and markets'],
  ['roles', 'Leadership roles and occupations'],
  ['resources', 'Proof and next steps'],
  ['industries', 'Industry directory'],
]);
const existingPages = new Set(
  fs.readdirSync(root).filter((file) => file.endsWith('.html'))
);
const pages = [
  ...originalPages.map((page) => ({
    ...page,
    category: categoryForExistingPage.get(page.slug) || page.category,
  })),
  ...additions,
];

function additionToPage(page) {
  const audienceLabel = 'the professional';
  const imageByCategory = {
    services: ['assets/kov-search-grid.svg', 'Structured executive search process overview.'],
    markets: ['assets/kov-global-grid.svg', 'Global market and talent-search overview.'],
    roles: ['assets/kov-search-grid.svg', 'Structured leadership career search overview.'],
    resources: ['assets/kov-intelligence-grid.svg', 'Structured career and talent-search process overview.'],
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
    ? 'KOV uses process examples to clarify how a search can be organized and where client details are kept private. Any public material is framed as process and context, not as a claim about a specific placement or hiring outcome.'
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
      { slug: 'candidate-services', label: 'Individual Career Services' },
      { slug: 'contact', label: 'Contact KOV' },
    ],
  };
}

const completePages = pages.map((page) =>
  page.sections ? page : additionToPage(page)
);
const pagePaths = new Map(
  completePages.map((page) => [
    page.slug,
    page.path || `${page.category}/${page.slug}.html`,
  ])
);
const expectedCounts = new Map([
  ['services', 8],
  ['markets', 6],
  ['roles', 34],
  ['resources', 11],
  ['industries', 21],
]);

if (completePages.length !== 80) {
  throw new Error(`Expected 80 pages; received ${completePages.length}.`);
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
  const table = section.table
    ? `<div class="kov-guide-table-wrap" tabindex="0" aria-label="${escapeHtml(section.table.caption)}"><table class="kov-guide-table"><caption>${escapeHtml(section.table.caption)}</caption><thead><tr>${section.table.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : '';
  const scenarioNote = '';
  return `<section class="kov-section"><div class="kov-section-heading"><p class="kov-eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2></div><div class="kov-copy">${scenarioNote}${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul class="kov-list">${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${table}</div></section>`;
}

function renderFaq(item) {
  return `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`;
}

function renderDirectory(directory) {
  const facts = directory.quickFacts.map((fact) =>
    `<div class="kov-directory-fact"><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`
  ).join('');
  const entries = directory.entries.map((entry) =>
    `<tr><td>${escapeHtml(entry.level || '')}</td><th scope="row">${escapeHtml(entry.code)}</th><td><strong>${escapeHtml(entry.name)}</strong>${entry.sourceMarker === 'T' ? '<span class="kov-source-marker" title="Trilateral agreement"> T</span>' : ''}${entry.parentCode ? `<p class="kov-directory-parent">Parent code: ${escapeHtml(entry.parentCode)}</p>` : ''}${entry.definition ? `<p>${escapeHtml(entry.definition)}</p>` : entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : ''}</td></tr>`
  ).join('');
  return `<section class="kov-section kov-directory" aria-labelledby="directory-heading"><div class="kov-section-heading"><p class="kov-eyebrow">${escapeHtml(directory.sourceLabel)}</p><h2 id="directory-heading">${escapeHtml(directory.heading)}</h2></div><p class="kov-directory-intro">${escapeHtml(directory.description)}</p><dl class="kov-directory-facts">${facts}</dl><div class="kov-guide-table-wrap" tabindex="0" aria-label="Scroll the complete classification directory"><table class="kov-guide-table"><thead><tr><th scope="col">Classification level</th><th scope="col">Official code</th><th scope="col">Official title and definition</th></tr></thead><tbody>${entries}</tbody></table></div><p class="kov-directory-source">Source: <a href="${escapeHtml(directory.sourceUrl)}" rel="noopener noreferrer">${escapeHtml(directory.sourceName)}</a>. ${escapeHtml(directory.sourceNote || 'Codes and labels are included for reference; consult the source classification for official definitions and updates.')}</p></section>`;
}

function hrefForPage(page, slug) {
  let targetPath = pagePaths.get(slug) ||
    (existingPages.has(`${slug}.html`) ? `${slug}.html` : null);
  if (!targetPath) {
    throw new Error(`Unknown page "${slug}" linked from "${page.slug}".`);
  }
  if (targetPath.endsWith('/')) targetPath += 'index.html';
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
  const summary = isMobile ? `Browse all ${completePages.length} pages` : 'Explore pages';
  return `<details class="${className}"><summary aria-label="Browse all ${completePages.length} pages by topic">${summary}</summary><div class="kov-topic-nav-panel">${groups}</div></details>`;
}

function renderFooterCategories(page) {
  const groups = [...expectedCounts.keys()].map((category) => {
    const entries = completePages.filter((entry) => entry.category === category);
    const links = entries.map((entry) =>
      `<li><a href="${escapeHtml(hrefForPage(page, entry.slug))}">${escapeHtml(entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''))}</a></li>`
    ).join('');
    return `<details class="kov-footer-category"><summary>${escapeHtml(groupLabels.get(category))}</summary><ul>${links}</ul></details>`;
  }).join('');
  return `<nav class="kov-footer-categories" data-kov-footer-categories aria-label="Browse all ${completePages.length} pages"><h2>Explore all ${completePages.length} pages</h2><div class="kov-footer-category-grid">${groups}</div></nav>`;
}

function renderPage(page) {
  const pageUrl = `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`;
  const parentPage = page.parentHub
    ? completePages.find((entry) => entry.slug === page.parentHub)
    : null;
  const related = page.related.map((item) => {
    const filename = hrefForPage(page, item.slug);
    return `<li><a href="${escapeHtml(filename)}">${escapeHtml(item.label)}</a></li>`;
  }).join('');
  const rootAsset = (filename) => `../${filename}`;
  const contactHref = hrefForPage(page, 'contact');
  const homeHref = hrefForPage(page, 'index');
  const breadcrumbHtml = `<nav class="kov-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="${homeHref}">Home</a></li>${parentPage ? `<li><a href="${escapeHtml(hrefForPage(page, parentPage.slug))}">${escapeHtml(parentPage.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''))}</a></li>` : ''}<li aria-current="page">${escapeHtml(page.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''))}</li></ol></nav>`;
  const imageHref = page.image.startsWith('http')
    ? page.image
    : rootAsset(page.image);
  const relatedHref = hrefForPage(page, page.related[0].slug);
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.kovcareeragency.org/',
      },
      ...(page.parentHub ? [{
        '@type': 'ListItem',
        position: 2,
        name: completePages.find((entry) => entry.slug === page.parentHub).title,
        item: `https://www.kovcareeragency.org/${pagePaths.get(page.parentHub)}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: page.parentHub ? 3 : 2,
        name: page.title,
        item: pageUrl,
      },
    ],
  };
  const isServicePage = !page.directory &&
    ['services', 'markets', 'roles'].includes(page.category);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': 'https://www.kovcareeragency.org/#organization',
        name: 'KOV Career Agency',
        alternateName: ['KOV Career', 'KovCareer'],
        url: 'https://www.kovcareeragency.org/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.kovcareeragency.org/kov-logo.png',
        },
        image: 'https://www.kovcareeragency.org/preview.png',
        email: 'daniel@kovcareeragency.org',
        founder: { '@id': 'https://www.kovcareeragency.org/#founder' },
      },
      {
        '@type': 'Person',
        '@id': 'https://www.kovcareeragency.org/#founder',
        name: 'Adekunle Ayotoba Daniel',
        alternateName: 'Daniel Ade',
        jobTitle: 'Founder and Principal Agent',
        worksFor: { '@id': 'https://www.kovcareeragency.org/#organization' },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.kovcareeragency.org/#website',
        name: 'KOV Career Agency',
        url: 'https://www.kovcareeragency.org/',
        publisher: { '@id': 'https://www.kovcareeragency.org/#organization' },
      },
      {
        '@type': ['WebPage', ...(page.slug === 'book-confidential-consultation' ? ['ContactPage'] : [])],
        '@id': `${pageUrl}#webpage`,
        name: page.title,
        description: page.description,
        url: pageUrl,
        inLanguage: 'en',
        isPartOf: { '@id': 'https://www.kovcareeragency.org/#website' },
        about: { '@id': 'https://www.kovcareeragency.org/#organization' },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      { ...breadcrumb, '@id': `${pageUrl}#breadcrumb` },
      ...(isServicePage ? [{
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: page.title,
        description: page.description,
        provider: { '@id': 'https://www.kovcareeragency.org/#organization' },
        mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      }] : []),
      ...(page.directory ? [{
        '@type': 'Dataset',
        '@id': `${pageUrl}#dataset`,
        name: page.directory.classification,
        description: page.directory.description,
        url: page.directory.sourceUrl,
        creator: { '@type': 'Organization', name: page.directory.sourceName },
        mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      }] : []),
      ...(page.faqs?.length ? [{
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: page.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }] : []),
    ],
  }, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="robots" content="index,follow">
  <meta name="author" content="KOV Career Agency">
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" type="image/png" href="${rootAsset('kov-logo.png')}">
  <link rel="stylesheet" href="${rootAsset('assets/styles-DateywTe.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/site-fixes.css?v=15')}">
  <link rel="stylesheet" href="${rootAsset('assets/two-sided.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/two-sided-type.css')}">
  <link rel="stylesheet" href="${rootAsset('assets/seo-pages.css?v=2')}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,800&family=Inter:wght@300;400;500;600;700&display=swap">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="KOV Career Agency">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:image" content="https://www.kovcareeragency.org/preview.png">
  <meta property="og:image:alt" content="KOV Career Agency">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="https://www.kovcareeragency.org/preview.png">
  <script src="${rootAsset('assets/google-translate.js')}" defer></script>
  <script src="${rootAsset('assets/site-search-index.js')}" defer></script>
  <script src="${rootAsset('assets/site-search.js?v=3')}" defer></script>
  <script src="${rootAsset('assets/reactive-visuals.js?v=7')}" defer></script>
  <script src="${rootAsset('assets/audience-nav.js?v=3')}" defer></script>
  <script type="application/ld+json" data-kov="discovery">${jsonLd}</script>
</head>
<body>
  <div class="two-sided-page seo-landing-page">
    <header class="kov-header">
      <a class="kov-brand" href="${homeHref}"><img src="${rootAsset('kov-logo.png')}" alt="KOV"><span>KOV <small>Career Agency</small></span></a>
      <nav class="kov-nav" aria-label="Primary navigation">
        <a href="${hrefForPage(page, 'services')}">Private Career Representation</a><a href="${hrefForPage(page, 'countries-we-serve')}">Global markets</a><a class="audience-link" href="${hrefForPage(page, 'candidate-services')}">Individual Career Services</a>${renderTopicMenu(page)}<a class="kov-nav-cta" href="${contactHref}">Start a Conversation</a>
      </nav>
      <details class="seo-mobile-menu">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <a href="${hrefForPage(page, 'services')}">Private Career Representation</a><a href="${hrefForPage(page, 'countries-we-serve')}">Global markets</a><a href="${hrefForPage(page, 'candidate-services')}">Individual Career Services</a>${renderTopicMenu(page, true)}<a href="${contactHref}">Start a Conversation</a>
        </nav>
      </details>
    </header>
    <main>
      ${breadcrumbHtml}
      <section class="kov-hero seo-hero">
        <div class="kov-hero-copy">
          <p class="kov-eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="kov-lead">${escapeHtml(page.lead)}</p>
          <p>${escapeHtml(page.introduction)}</p>
          <div class="kov-actions"><a class="kov-button" href="${contactHref}">${escapeHtml(page.cta)}</a><a class="kov-text-link" href="${escapeHtml(relatedHref)}">Explore related KOV support</a></div>
        </div>
        <figure class="seo-hero-art"><img src="${escapeHtml(imageHref)}" alt="${escapeHtml(page.imageAlt)}"><figcaption>Career research and planning aligned to the agreed engagement scope.</figcaption></figure>
      </section>
      ${page.directory ? renderDirectory(page.directory) : ''}
      ${page.parentHub ? '' : page.directoryLinks?.length ? `<section class="kov-section kov-directory-links"><div class="kov-section-heading"><p class="kov-eyebrow">PRIORITY DETAIL PAGES</p><h2>Explore selected classifications.</h2></div><ul class="seo-related-links">${page.directoryLinks.map((item) => `<li><a href="${escapeHtml(hrefForPage(page, item.slug))}">${escapeHtml(item.label)}</a></li>`).join('')}</ul></section>` : ''}
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
      <nav aria-label="Footer navigation"><div><b>EXPLORE</b><a href="${hrefForPage(page, 'candidate-services')}">Individual Career Services</a><a href="${hrefForPage(page, 'services')}">Private Career Representation</a><a href="${hrefForPage(page, 'countries-we-serve')}">Countries We Serve</a></div><div><b>ABOUT</b><a href="${hrefForPage(page, 'why-kov')}">Why KOV</a><a href="${hrefForPage(page, 'about')}">Founder</a><a href="${contactHref}">Contact</a></div></nav>
      ${renderFooterCategories(page)}
      <p class="kov-legal">© 2026 KOV Career Agency. Engagement scope and deliverables are agreed directly.</p>
    </footer>
  </div>
</body>
</html>
`;
}

const pagesToWrite = newOnly
  ? completePages.filter((page) => page.newPage === true)
  : completePages;
if (newOnly && !pagesToWrite.length) {
  throw new Error('No pages marked newPage were found in data/seo-pages.json.');
}

function outputPathFor(page) {
  const route = pagePaths.get(page.slug);
  return path.join(root, route.endsWith('/') ? route + 'index.html' : route);
}

for (const page of pagesToWrite) {
  if (!/^[a-z0-9-]+$/.test(page.slug) ||
      !expectedCounts.has(page.category)) {
    throw new Error(`Invalid slug "${page.slug}".`);
  }
  const destination = outputPathFor(page);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const rendered = renderPage(page);
  fs.writeFileSync(
    destination,
    newOnly ? rendered.replace(/\r?\n/g, '\r\n') : rendered,
    'utf8'
  );
}

if (!newOnly) for (const page of originalPages) {
  const destination = pagePaths.get(page.slug);
  const target = destination;
  const redirect = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${target}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="https://www.kovcareeragency.org/${target}">
  <title>Page moved | KOV Career Agency</title>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
</head>
<body><p>This page has moved. <a href="${destination}">Continue to the updated page.</a></p></body>
</html>
`;
  fs.writeFileSync(path.join(root, `${page.slug}.html`), redirect, 'utf8');
}

if (!newOnly) for (const filename of fs.readdirSync(root).filter((file) => file.endsWith('.html'))) {
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
const lastmod = new Date().toISOString().slice(0, 10);
if (newOnly) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const newline = sitemap.includes('\r\n') ? '\r\n' : '\n';
  for (const page of pagesToWrite) {
    const url = `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`;
    if (sitemap.includes(`<loc>${url}</loc>`)) continue;
    const entry = `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`;
    sitemap = sitemap.replace(/<\/urlset>\s*$/i, `${entry}${newline}</urlset>${newline}`);
  }
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');

  const llmsPath = path.join(root, 'llms.txt');
  let llms = fs.readFileSync(llmsPath, 'utf8');
  const llmsNewline = llms.includes('\r\n') ? '\r\n' : '\n';
  const taxonomyPages = completePages.filter(
    (page) => page.newTaxonomyPage === true || ['industries', 'roles'].includes(page.slug)
  );
  const taxonomyUrls = new Set(taxonomyPages.map(
    (page) => `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`
  ));
  llms = llms.split(/\r?\n/).filter((line) => {
    const linkedUrl = line.match(/\]\((https?:\/\/[^)]+)\)/)?.[1];
    return !taxonomyUrls.has(linkedUrl) &&
      line !== '## Industry and occupation directories';
  }).join(llmsNewline);
  for (const page of originalPages) {
    const url = `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`;
    if (taxonomyUrls.has(url)) continue;
    if (llms.includes(url)) continue;
    const metadata = (() => {
      const filename = pagePaths.get(page.slug);
      const source = fs.readFileSync(path.join(root, filename), 'utf8');
      const title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
      const descriptionTag = source.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0];
      const description = descriptionTag?.match(/\bcontent=["']([\s\S]*?)["']/i)?.[1]?.trim();
      if (!title || !description) {
        throw new Error(`Cannot add ${page.slug} to llms.txt without page metadata.`);
      }
      return { title, description };
    })();
    llms = `${llms.trimEnd()}${llmsNewline}- [${metadata.title}](${url}): ${metadata.description}${llmsNewline}`;
  }
  const llmsSection = [
    '',
    '## Industry and occupation directories',
    ...taxonomyPages.map((page) =>
      `- [${page.title}](https://www.kovcareeragency.org/${pagePaths.get(page.slug)}): ${page.summary}`
    ),
    '',
  ].join(llmsNewline);
  llms = `${llms.trimEnd()}${llmsSection}`;
  fs.writeFileSync(llmsPath, llms, 'utf8');

  const searchIndexPath = path.join(root, 'assets', 'site-search-index.js');
  const searchIndex = fs.readFileSync(searchIndexPath, 'utf8');
  const contentMatch = searchIndex.match(/window\.kovSiteSearchContent = (.*?);\r?\nwindow\.kovSeoPageCatalog = /s);
  const catalogMatch = searchIndex.match(/window\.kovSeoPageCatalog = (.*);\s*$/s);
  if (!contentMatch || !catalogMatch) {
    throw new Error('Could not parse the existing site-search index.');
  }
  const indexedContent = JSON.parse(contentMatch[1]);
  const catalog = JSON.parse(catalogMatch[1].trim().replace(/;$/, ''));
  const indexedPagePaths = new Set(Object.keys(indexedContent));
  const catalogPagePaths = new Set(catalog.map((entry) => entry.href));
  for (const page of pagesToWrite) {
    const route = pagePaths.get(page.slug);
    const localPath = route.endsWith('/') ? `${route}index.html` : route;
    const alreadyIndexed = indexedPagePaths.has(localPath) ||
      catalogPagePaths.has(localPath);
    if (alreadyIndexed && page.updateExistingNewPage !== true) {
      throw new Error(`Search index already contains ${localPath}; refusing to duplicate it.`);
    }
    const html = fs.readFileSync(outputPathFor(page), 'utf8');
    const visibleText = html
      .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
    indexedContent[localPath] = `${page.description} ${visibleText}`;
    const catalogEntry = {
      href: localPath,
      title: page.title,
      summary: page.description,
      terms: `${page.title} ${page.description} ${groupLabels.get(page.category)}`,
      category: page.category,
    };
    if (catalogPagePaths.has(localPath)) {
      const index = catalog.findIndex((entry) => entry.href === localPath);
      catalog[index] = catalogEntry;
    } else {
      catalog.push(catalogEntry);
    }
    indexedPagePaths.add(localPath);
    catalogPagePaths.add(localPath);
  }
  const indexNewline = searchIndex.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(
    searchIndexPath,
    `window.kovSiteSearchContent = ${JSON.stringify(indexedContent)};${indexNewline}window.kovSeoPageCatalog = ${JSON.stringify(catalog)};${indexNewline}`,
    'utf8'
  );
  console.log(`Generated ${pagesToWrite.length} new pages and appended their discovery entries without rewriting existing pages.`);
  process.exit(0);
}

const corePages = [
  'services.html',
  'how-it-works.html',
  'pricing.html',
  'faqs.html',
  'blog.html',
  'about.html',
  'contact.html',
  'candidate-services.html',
  'resume-cv-writing.html',
  'linkedin-profile-optimization.html',
  'career-documents.html',
  'career-portfolio-development.html',
  'personal-career-website.html',
  'career-positioning-optimization.html',
  'career-coaching.html',
  'candidate-proof.html',
  'why-kov.html',
  'countries-we-serve.html',
  'glossary.html',
];
const sitemapPages = [
  { url: 'https://www.kovcareeragency.org/', file: 'index.html' },
  ...corePages.map((filename) => ({
    url: `https://www.kovcareeragency.org/${filename}`,
    file: filename,
  })),
  ...completePages.map((page) => ({
    url: `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`,
    file: pagePaths.get(page.slug),
  })),
];
const sitemapUrls = new Set();
for (const page of sitemapPages) {
  if (!fs.existsSync(path.join(root, page.file))) {
    throw new Error(`Sitemap page does not exist: ${page.file}`);
  }
  if (sitemapUrls.has(page.url)) {
    throw new Error(`Duplicate sitemap URL: ${page.url}`);
  }
  sitemapUrls.add(page.url);
}
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapPages.map(({ url }) =>
    `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`
  ),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

function readPageMetadata(filename) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  const decodeHtmlEntities = (value) => value.replace(
    /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/gi,
    (entity, reference) => {
      const normalized = reference.toLowerCase();
      if (normalized.startsWith('#x') || normalized.startsWith('#')) {
        const codePoint = Number.parseInt(
          normalized.startsWith('#x') ? normalized.slice(2) : normalized.slice(1),
          normalized.startsWith('#x') ? 16 : 10
        );
        return Number.isInteger(codePoint) && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity;
      }
      return {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
        nbsp: ' ',
        ndash: '–',
        mdash: '—',
        rsquo: '’',
        lsquo: '‘',
        rdquo: '”',
        ldquo: '“',
      }[normalized] || entity;
    }
  );
  const title = decodeHtmlEntities(
    source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
  ).replace(/\s+/g, ' ').trim();
  const descriptionTag = source.match(/<meta\b[^>]*>/gi)?.find((tag) =>
    /\bname=["']description["']/i.test(tag)
  );
  const description = decodeHtmlEntities(
    descriptionTag?.match(/\bcontent=["']([\s\S]*?)["']/i)?.[1] || ''
  );
  if (!title || !description) {
    throw new Error(`Missing title or meta description on ${filename}.`);
  }
  return { title, description };
}

const llmsSections = [
  '# KOV Career Agency',
  '',
  '> Founder-led career agency providing career representation and individual career services for professionals.',
  '',
  'KOV agrees candidate-service scope, deliverables, fees, approvals, and reporting before work begins. Employers control their hiring decisions; KOV does not guarantee interviews, offers, employment, or timelines.',
  '',
  '## Core pages',
  (() => {
    const metadata = readPageMetadata('index.html');
    return `- [${metadata.title}](https://www.kovcareeragency.org/): ${metadata.description}`;
  })(),
  ...corePages.map((filename) => {
    const metadata = readPageMetadata(filename);
    return `- [${metadata.title}](https://www.kovcareeragency.org/${filename}): ${metadata.description}`;
  }),
  '',
  '## Full Q&A',
  '- [Full question and answer set](https://www.kovcareeragency.org/llms-full.txt): frequently asked questions about fit, services, process, fees, and outcomes.',
];
for (const [category, label] of groupLabels) {
  const categoryPages = completePages.filter((page) => page.category === category);
  llmsSections.push('', `## ${label}`);
  for (const page of categoryPages) {
    const relativePath = pagePaths.get(page.slug);
    llmsSections.push(
      `- [${page.title}](https://www.kovcareeragency.org/${relativePath}): ${page.description}`
    );
  }
}
const faqPages = sitemapPages.filter(({ file }) => file.startsWith('faq/'));
if (faqPages.length) {
  llmsSections.push('', '## Frequently asked questions');
  for (const { file } of faqPages) {
    const metadata = readPageMetadata(file);
    llmsSections.push(
      `- [${metadata.title}](https://www.kovcareeragency.org/${file}): ${metadata.description}`
    );
  }
}
llmsSections.push(
  '',
  '## Entity',
  '',
  '- Organization: KOV Career Agency',
  '- Founder: Adekunle Ayotoba Daniel (Daniel Ade), Founder and Principal Agent',
  '- Website: https://www.kovcareeragency.org/',
  '- Contact: daniel@kovcareeragency.org',
  '',
  '## Use and attribution',
  '',
  'Use the linked pages as the source of current service descriptions and process details. Do not infer guaranteed outcomes, local offices, client results, fees, or market coverage that a page does not state. Confirm engagement details directly with KOV.',
  ''
);
fs.writeFileSync(path.join(root, 'llms.txt'), llmsSections.join('\n'), 'utf8');
console.log(`Generated ${completePages.length} static landing pages and indexed ${sitemapPages.length} URLs in sitemap.xml and llms.txt.`);
