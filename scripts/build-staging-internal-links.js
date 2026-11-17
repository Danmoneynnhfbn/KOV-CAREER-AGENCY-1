const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sessionUrlList = 'C:/Users/USER/.copilot/session-state/72a47f4e-fd03-44f5-af5d-1ce11d14fff1/files/577-stage-urls.txt';

function readStageRoutes() {
  const raw = fs.readFileSync(sessionUrlList, 'utf8');
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function stageFileFor(stageUrl) {
  return path.join(repoRoot, stageUrl.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
}

function urlToTitle(url) {
  const last = url.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean).pop() || 'Page';
  const value = last.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!value) return 'KOV page';
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function makeAbsoluteHref(href) {
  if (href.startsWith('/')) return href;
  return href;
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return 'Staging page';
  return match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Staging page';
}

function routeGroup(url) {
  const stable = url.replace(/\/$/, '');
  if (stable.includes('/staging/roles/')) return 'roles';
  if (stable.includes('/staging/career-resources/')) {
    const after = stable.split('/staging/career-resources/')[1] || '';
    if (!after) return 'career-resources';
    const parts = after.split('/');
    return parts.length > 1 ? parts[0] : 'career-resources';
  }
  if (stable.includes('/staging/resources/')) return 'resources';
  if (stable.includes('/staging/research/')) return 'research';
  if (stable.includes('/staging/professional-directory/')) return 'professional-directory';
  if (stable.includes('/staging/templates/')) return 'templates';
  return 'staging';
}

function humanizeGroup(group) {
  const map = {
    roles: 'Leadership roles',
    'career-resources': 'Career resources',
    mobility: 'International mobility',
    'country-market-guides': 'Country market guides',
    'country-role-pages': 'Country role pages',
    'industry-specific-career-guides': 'Industry-specific guides',
    'board-non-executive-career': 'Board and non-executive career',
    'comparison-educational': 'Comparison guides',
    'executive-career-guides': 'Executive career guides',
    'salary-compensation-guides': 'Salary guides',
    'transition-guides': 'Career transition guides',
    'interview-guides': 'Interview guides',
    'leadership-skills-competencies': 'Leadership competency guides',
    'market-reports': 'Market reports',
    resources: 'Resources',
    research: 'Research hub',
    'professional-directory': 'Professional profiles',
    templates: 'Templates',
    staging: 'Staging index',
  };
  return map[group] || group;
}

function breadcrumbTrail(url) {
  const clean = url.replace(/\/$/, '');
  const parts = clean.split('/').filter(Boolean);
  const labels = [];
  let current = '/';
  if (parts[0] === 'staging') {
    labels.push({ label: 'Staging', href: '/staging/' });
    current = '/staging/';
    const rest = parts.slice(1);
    if (rest.length === 0) return labels;
    if (rest[0] === 'career-resources') {
      labels.push({ label: 'Career resources', href: '/staging/career-resources/' });
      if (rest.length > 1) {
        const groupName = rest[1];
        labels.push({ label: humanizeGroup(groupName), href: current + 'career-resources/' + groupName + '/' });
      }
    } else if (rest[0] === 'roles') {
      labels.push({ label: 'Roles', href: '/staging/roles/' });
    } else if (rest[0] === 'resources') {
      labels.push({ label: 'Resources', href: '/staging/resources/' });
    }
  }
  return labels;
}

function buildBreadcrumbNav(url, title) {
  const trail = [{ label: 'Home', href: '/' }, { label: 'Staging', href: '/staging/' }];
  const clean = url.replace(/\/$/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'staging') {
    const rest = parts.slice(1);
    if (rest[0] === 'career-resources') {
      trail.push({ label: 'Career resources', href: '/staging/career-resources/' });
      if (rest[1]) trail.push({ label: humanizeGroup(rest[1]), href: '/staging/career-resources/' + rest[1] + '/' });
    } else if (rest[0] === 'roles') {
      trail.push({ label: 'Roles', href: '/staging/roles/' });
    } else if (rest[0] === 'resources') {
      trail.push({ label: 'Resources', href: '/staging/resources/' });
    }
  }
  trail.push({ label: title, href: url });
  return '<nav class="kov-breadcrumb" aria-label="Breadcrumb">' + trail.map((item, index) => {
    if (index === trail.length - 1) return '<span aria-current="page">' + item.label + '</span>';
    return '<a href="' + item.href + '">' + item.label + '</a> / ';
  }).join('') + '</nav>';
}

function publicLinkCandidates(url) {
  const candidates = [
    { href: '/services.html', label: 'KOV individual services' },
    { href: '/candidate-services.html', label: 'Private career representation' },
    { href: '/resources/executive-job-search-in-your-market.html', label: 'Executive job search in your market' },
    { href: '/roles/ceo/', label: 'CEO career representation' },
    { href: '/industries/finance-insurance/', label: 'Finance and insurance industry' },
    { href: '/markets/executive-job-search-dubai.html', label: 'Executive job search in Dubai' },
    { href: '/faq/about-1.html', label: 'KOV FAQ' },
    { href: '/services/career-strategy-senior-leaders.html', label: 'Senior-leader career strategy' },
  ];
  if (url.includes('/mobility/')) {
    candidates.unshift({ href: '/markets/executive-job-search-dubai.html', label: 'Executive job search in Dubai' });
  }
  if (url.includes('/roles/')) {
    candidates.unshift({ href: '/roles/senior-leader-career-strategy.html', label: 'Senior-leader career strategy' });
  }
  if (url.includes('/country-market-guides/')) {
    candidates.unshift({ href: '/resources/executive-job-search-in-your-market.html', label: 'Executive job search in your market' });
  }
  return candidates;
}

function getRelatedStageLinks(url, stageRoutes) {
  const currentGroup = routeGroup(url);
  const sameGroup = stageRoutes.filter((candidate) => candidate !== url && routeGroup(candidate) === currentGroup);
  const fallback = stageRoutes.filter((candidate) => candidate !== url && routeGroup(candidate) !== currentGroup).slice(0, 6);
  const pool = sameGroup.length ? sameGroup : fallback;
  const unique = [];
  const seen = new Set();
  for (const candidate of pool) {
    if (unique.length >= 4) break;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      unique.push(candidate);
    }
  }
  return unique.map((destination) => ({ href: destination, label: urlToTitle(destination) }));
}

function ensureTrailingSlash(url) {
  if (url === '/') return '/';
  return url.endsWith('/') ? url : url + '/';
}

function stagePageLinkHtml(url, label) {
  return '<li><a href="' + ensureTrailingSlash(url.replace(/\/index\.html$/, '')) + '">' + label + '</a></li>';
}

function injectLinks() {
  const stageRoutes = readStageRoutes();
  const fileSet = new Set(stageRoutes.map((url) => stageFileFor(url)));

  for (const url of stageRoutes) {
    const filePath = stageFileFor(url);
    if (!fs.existsSync(filePath)) continue;

    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('data-kov-internal-links')) continue;

    const title = extractH1(html);
    const breadcrumb = buildBreadcrumbNav(url, title);
    const relatedStage = getRelatedStageLinks(url, stageRoutes).slice(0, 4);
    const publicLinks = publicLinkCandidates(url).slice(0, 2);

    const relatedList = [
      ...relatedStage.map((item) => ({ href: item.href, label: item.label })),
      ...publicLinks.map((item) => ({ href: item.href, label: item.label }))
    ].filter((item, index, array) => array.findIndex((entry) => entry.href === item.href) === index);

    const relatedHtml = '<section data-kov-internal-links>' +
      '<h2>Related KOV pages</h2>' +
      '<ul>' +
      relatedList.map((item) => '<li><a href="' + makeAbsoluteHref(item.href) + '">' + item.label + '</a></li>').join('') +
      '</ul>' +
      '</section>';

    const beforeMainClose = /<\/main>/i;
    if (!beforeMainClose.test(html)) continue;
    html = html.replace(beforeMainClose, breadcrumb + '\n' + relatedHtml + '\n</main>');
    fs.writeFileSync(filePath, html, 'utf8');
  }

  const indexFile = path.join(repoRoot, 'staging', 'index.html');
  if (fs.existsSync(indexFile)) {
    let html = fs.readFileSync(indexFile, 'utf8');
    if (!html.includes('data-kov-staging-link-hub')) {
      const selected = stageRoutes.filter((url) => url !== '/staging/' && !url.includes('/country-market-guides/') && !url.includes('/company-') && !url.includes('/research/') && !url.includes('/professional-directory/')).slice(0, 12);
      const list = selected.map((url) => '<li><a href="' + ensureTrailingSlash(url.replace(/\/index\.html$/, '')) + '">' + urlToTitle(url) + '</a></li>').join('');
      const block = '<section data-kov-staging-link-hub>' +
        '<h2>Staging route quick links</h2>' +
        '<ul>' + list + '</ul>' +
        '</section>';
      html = html.replace(/<\/main>/i, block + '</main>');
      fs.writeFileSync(indexFile, html, 'utf8');
    }
  }

  const careerResourcesHub = path.join(repoRoot, 'staging', 'career-resources', 'index.html');
  if (fs.existsSync(careerResourcesHub)) {
    let html = fs.readFileSync(careerResourcesHub, 'utf8');
    if (!html.includes('data-kov-career-hub-links')) {
      const selected = stageRoutes.filter((url) => url.includes('/staging/career-resources/')).slice(0, 18);
      const list = selected.map((url) => '<li><a href="' + ensureTrailingSlash(url.replace(/\/index\.html$/, '')) + '">' + urlToTitle(url) + '</a></li>').join('');
      const block = '<section data-kov-career-hub-links>' +
        '<h2>Related resource routes</h2>' +
        '<ul>' + list + '</ul>' +
        '</section>';
      html = html.replace(/<\/main>/i, block + '</main>');
      fs.writeFileSync(careerResourcesHub, html, 'utf8');
    }
  }

  const audit = runAudit(stageRoutes);
  fs.mkdirSync(path.join(repoRoot, 'development'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'development', 'staging-link-audit.json'), JSON.stringify(audit, null, 2), 'utf8');

  const proposals = [
    { sourceUrl: 'https://www.kovcareeragency.org/services.html', destinationUrl: '/staging/career-resources/mobility/choosing-an-international-mobility-route-as-an-executive/', anchorText: 'Choosing an international mobility route as an executive', reason: 'Supports visitors who are evaluating international career moves after exploring service options.' },
    { sourceUrl: 'https://www.kovcareeragency.org/services/career-strategy-senior-leaders.html', destinationUrl: '/staging/career-resources/executive-career-guides/financial-leader-to-ceo-transition/', anchorText: 'Financial leader to CEO transition guide', reason: 'Relevant for senior leaders planning a transition strategy and reviewing role-fit questions.' },
    { sourceUrl: 'https://www.kovcareeragency.org/roles/ceo/', destinationUrl: '/staging/roles/cfo/', anchorText: 'CFO leadership guide', reason: 'A CEO audience often researches adjacent executive roles and role-to-role transitions.' },
    { sourceUrl: 'https://www.kovcareeragency.org/industries/finance-insurance/', destinationUrl: '/staging/career-resources/industry-specific-career-guides/fintech-payments-career-guide/', anchorText: 'Fintech payments career guide', reason: 'Relevant for finance and insurance visitors exploring adjacent industry transitions.' },
    { sourceUrl: 'https://www.kovcareeragency.org/markets/executive-job-search-dubai.html', destinationUrl: '/staging/career-resources/country-market-guides/uae-executive-job-search-market-guide/', anchorText: 'UAE executive job-search market guide', reason: 'A UAE market page naturally benefits from a regional market-research resource.' },
    { sourceUrl: 'https://www.kovcareeragency.org/resources/executive-job-search-in-your-market.html', destinationUrl: '/staging/career-resources/country-market-guides/canada-executive-job-search-market-guide/', anchorText: 'Canada executive job-search market research guide', reason: 'Useful for country-specific search planning and evidence-checking methodology.' },
    { sourceUrl: 'https://www.kovcareeragency.org/resources/case-studies.html', destinationUrl: '/staging/career-resources/board-non-executive-career/non-executive-director-readiness-assessment/', anchorText: 'Board readiness assessment', reason: 'Relevant when readers want a decision-quality framework for non-executive board opportunities.' },
    { sourceUrl: 'https://www.kovcareeragency.org/resources/salary-offer-negotiation-guide.html', destinationUrl: '/staging/career-resources/salary-compensation-guides/us-federal-executive-pay-table-career-guide/', anchorText: 'US federal executive pay table career guide', reason: 'Useful context for compensation review and benchmarking discussions.' },
  ];

  const csvRows = ['sourceUrl,destinationUrl,anchorText,reason'];
  for (const proposal of proposals) {
    csvRows.push([proposal.sourceUrl, proposal.destinationUrl, proposal.anchorText, proposal.reason].map((value) => '"' + String(value).replace(/"/g, '""') + '"').join(','));
  }
  fs.writeFileSync(path.join(repoRoot, 'development', 'existing-page-link-proposals.csv'), csvRows.join('\n') + '\n', 'utf8');

  console.log(JSON.stringify({
    pagesUpdated: stageRoutes.length,
    validNewToNewLinks: audit.validNewToNewLinks,
    validNewToExistingLinks: audit.validNewToExistingLinks,
    pagesWithIncomingLinks: audit.pagesWithIncomingLinks,
    pagesWithOutgoingLinks: audit.pagesWithOutgoingLinks,
    orphanPages: audit.orphanPages,
    brokenLinks: audit.brokenLinks,
    breadcrumbValidation: audit.breadcrumbValidation,
  }, null, 2));
}

function runAudit(stageRoutes) {
  const inMap = new Map();
  const outMap = new Map();
  let validNewToNewLinks = 0;
  let validNewToExistingLinks = 0;
  let brokenLinks = 0;
  let breadcrumbValid = 0;
  const stageSet = new Set(stageRoutes);
  const publicFileSet = new Set([
    '/index.html',
    '/services.html',
    '/candidate-services.html',
    '/services/career-strategy-senior-leaders.html',
    '/industries/finance-insurance/',
    '/markets/executive-job-search-dubai.html',
    '/faq/about-1.html',
    '/resources/executive-job-search-in-your-market.html',
    '/roles/ceo/',
    '/roles/senior-leader-career-strategy.html',
    '/resources/case-studies.html',
    '/resources/salary-offer-negotiation-guide.html',
  ]);

  for (const url of stageRoutes) {
    const filePath = stageFileFor(url);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf8');
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]);
    outMap.set(url, hrefs.length);
    for (const href of hrefs) {
      const normalized = href.startsWith('http') ? new URL(href).pathname : href;
      if (normalized.startsWith('/staging/')) {
        const destUrl = normalized.replace(/\/index\.html$/, '/');
        const isValid = stageSet.has(destUrl.replace(/\/$/, '/')) || stageSet.has(destUrl) || stageSet.has(destUrl + '/');
        if (isValid) validNewToNewLinks += 1;
        else brokenLinks += 1;
        if (!inMap.has(destUrl)) inMap.set(destUrl, 0);
        inMap.set(destUrl, inMap.get(destUrl) + 1);
      } else if (normalized.startsWith('/')) {
        const exists = publicFileSet.has(normalized.replace(/\/$/, '/')) || fs.existsSync(path.join(repoRoot, normalized.replace(/^\//, '').replace(/\/$/, '')));
        if (exists) validNewToExistingLinks += 1;
        else brokenLinks += 1;
      }
    }
    if (html.includes('kov-breadcrumb')) breadcrumbValid += 1;
  }

  let pagesWithIncomingLinks = 0;
  let pagesWithOutgoingLinks = 0;
  let orphanPages = 0;
  for (const url of stageRoutes) {
    const hasIncoming = inMap.has(url);
    const hasOutgoing = outMap.has(url) && (outMap.get(url) > 0);
    if (hasIncoming) pagesWithIncomingLinks += 1;
    if (hasOutgoing) pagesWithOutgoingLinks += 1;
    if (!hasIncoming) orphanPages += 1;
  }

  return {
    totalPages: stageRoutes.length,
    validNewToNewLinks,
    validNewToExistingLinks,
    pagesWithIncomingLinks,
    pagesWithOutgoingLinks,
    orphanPages,
    brokenLinks,
    breadcrumbValidation: breadcrumbValid,
    urlListFile: sessionUrlList,
  };
}

injectLinks();
