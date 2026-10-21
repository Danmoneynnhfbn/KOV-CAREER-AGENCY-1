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
const modelImageByCategory = new Map([
  ['services', 'executive-professional.jpg'],
  ['markets', 'executive-leader.jpg'],
  ['roles', 'executive-woman.jpg'],
  ['industries', 'leadership-team.jpg'],
  ['resources', 'executive-leader.jpg'],
]);
const modelImageAltByCategory = new Map([
  ['services', 'Illustrative stock portrait of a business professional; not a KOV client or team member.'],
  ['markets', 'Illustrative stock photograph of a professional working at a laptop; no KOV client relationship implied.'],
  ['roles', 'Illustrative stock portrait of a professional woman; not a KOV client or team member.'],
  ['industries', 'Illustrative stock portrait of a business professional; not a KOV client or team member.'],
  ['resources', 'Illustrative stock photograph of a professional working at a laptop; no KOV client relationship implied.'],
]);
const sectionImageByCategory = new Map([
  ['services', ['executive-woman.jpg', 'leadership-meeting.jpg', 'executive-leader.jpg']],
  ['markets', ['executive-professional.jpg', 'leadership-meeting.jpg', 'executive-woman.jpg']],
  ['roles', ['executive-professional.jpg', 'leadership-meeting.jpg', 'executive-leader.jpg']],
  ['industries', ['executive-woman.jpg', 'leadership-meeting.jpg', 'executive-professional.jpg']],
  ['resources', ['leadership-team.jpg', 'leadership-meeting.jpg', 'executive-woman.jpg']],
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

function renderSection(section, index, page) {
  const imageName = sectionImageByCategory.get(page.category)[index];
  const imageAlt = index === 1
    ? 'Illustrative stock photo of a professional team discussing research; not a KOV client team.'
    : index === 2
      ? 'Illustrative stock photo of a professional working at a laptop; not a KOV client or team member.'
      : 'Illustrative stock portrait of a professional; not a KOV client or team member.';
  const imageHref = path.posix.relative(page.category, `assets/people/${imageName}`);
  const sectionImage = `<figure class="seo-section-visual"><img src="${escapeHtml(imageHref)}" alt="${imageAlt}" loading="lazy" decoding="async"></figure>`;
  return `<section class="kov-section"><div class="kov-section-heading"><p class="kov-eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2></div>${sectionImage}<div class="kov-copy">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul class="kov-list">${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</div></section>`;
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
    return `<details class="kov-footer-category"><summary>${escapeHtml(groupLabels.get(category))}</summary><ul>${links}</ul></details>`;
  }).join('');
  return `<nav class="kov-footer-categories" data-kov-footer-categories aria-label="Browse all 60 pages"><h2>Explore all 60 pages</h2><div class="kov-footer-category-grid">${groups}</div></nav>`;
}

function renderPage(page) {
  const pageUrl = `https://www.kovcareeragency.org/${pagePaths.get(page.slug)}`;
  const related = page.related.map((item) => {
    const filename = hrefForPage(page, item.slug);
    return `<li><a href="${escapeHtml(filename)}">${escapeHtml(item.label)}</a></li>`;
  }).join('');
  const rootAsset = (filename) => `../${filename}`;
  const contactHref = hrefForPage(page, 'contact');
  const homeHref = hrefForPage(page, 'index');
  const modelImageHref = rootAsset(`assets/people/${modelImageByCategory.get(page.category)}`);
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
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: pageUrl,
      },
    ],
  };
  const isServicePage = ['services', 'markets', 'roles', 'industries'].includes(page.category);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService', 'EmploymentAgency'],
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
  <link rel="stylesheet" href="${rootAsset('assets/seo-pages.css?v=18')}">
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
  <script src="${rootAsset('assets/reactive-visuals.js?v=11')}" defer></script>
  <script src="${rootAsset('assets/audience-nav.js?v=3')}" defer></script>
  <script type="application/ld+json" data-kov="discovery">${jsonLd}</script>
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
        <figure class="seo-hero-art"><img class="seo-hero-portrait" src="${escapeHtml(modelImageHref)}" alt="${escapeHtml(modelImageAltByCategory.get(page.category))}" fetchpriority="high" decoding="async"></figure>
      </section>
      ${page.sections.map((section, index) => renderSection(section, index, page)).join('\n      ')}
      <section class="kov-section kov-section-tint seo-faq" aria-labelledby="seo-faq-heading">
        <div class="kov-section-heading"><p class="kov-eyebrow">COMMON QUESTIONS</p><h2 id="seo-faq-heading">Before you start a conversation.</h2></div>
        ${page.faqs.map(renderFaq).join('\n        ')}
      </section>
      <section class="kov-section seo-related"><div class="kov-section-heading"><p class="kov-eyebrow">EXPLORE THE KOV MODEL</p><h2>Related services and markets.</h2></div><ul class="seo-related-links">${related}</ul></section>
      <section class="kov-final-cta">
        <p class="kov-eyebrow">START A CONFIDENTIAL CONVERSATION</p>
        <h2>${escapeHtml(page.ctaHeading)}</h2>
        <p>${escapeHtml(page.ctaCopy)}</p>
        <p class="seo-scope-note">KOV works remotely across agreed markets. Engagement scope and fees are discussed directly by message and agreed in writing before work begins.</p>
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
  <link rel="canonical" href="https://www.kovcareeragency.org/${target}">
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
const lastmod = new Date().toISOString().slice(0, 10);
const corePages = [
  'services.html',
  'global-talent-sourcer.html',
  'how-it-works.html',
  'pricing.html',
  'faqs.html',
  'blog.html',
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
  '> Founder-led career agency with separate candidate-side career representation and company-side executive talent sourcing engagements.',
  '',
  'KOV agrees scope, markets, deliverables, fees, approvals, and reporting before work begins. Hiring decisions remain with employers; search activity does not guarantee interviews, offers, placement, or timelines. Coverage and suitability are confirmed for each engagement.',
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
