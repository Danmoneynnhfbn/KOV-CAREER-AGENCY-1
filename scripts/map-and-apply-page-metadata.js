const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const mapPath = path.join(root, 'docs/research/page-category-implementation-map-2026-11-13.csv');
const reportPath = path.join(root, 'docs/research/page-category-implementation-map-2026-11-13.md');
const excludedDirectories = new Set(['.git', 'node_modules', '.venv', '.venv-newpc']);

const names = [
  'professional-audience', 'job-title', 'occupation', 'industry', 'skill',
  'qualification', 'professional-term', 'job-function', 'seniority-level',
  'employment-type', 'career-challenge', 'career-search-intent', 'faq-question',
  'faq-answer', 'language', 'country', 'city', 'town-locality', 'institution',
];

const industrySectors = {
  'agriculture-food-forestry': ['11'],
  'arts-entertainment-sports': ['71'],
  'business-support-facilities': ['56'],
  'construction-engineering': ['23'],
  'consulting-professional-services': ['54'],
  'legal-services': ['54'],
  education: ['61'],
  'energy-mining-oil-gas': ['21', '22'],
  'finance-insurance': ['52'],
  'healthcare-social-care': ['62'],
  'holding-companies': ['55'],
  'hospitality-food-service': ['72'],
  manufacturing: ['31', '32', '33'],
  'other-services': ['81'],
  'public-sector-government': ['92'],
  'real-estate-leasing': ['53'],
  'retail-ecommerce': ['44', '45'],
  'technology-media-telecom': ['51'],
  'transportation-logistics': ['48', '49'],
  utilities: ['22'],
  'wholesale-distribution': ['42'],
};

const countryAliases = {
  AU: ['australia'], SA: ['saudi arabia'], AE: ['united arab emirates', 'uae'],
  GB: ['united kingdom', 'uk', 'britain', 'great britain', 'london'],
  US: ['united states', 'usa', 'united states of america'],
};

function norm(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('en')
    .replace(/&amp;/g, ' and ').replace(/&nbsp;/g, ' ')
    .replace(/&#(?:39|x27);/g, "'").replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim().replace(/\s+/g, ' ');
}

function unescapeHtml(value) {
  return String(value ?? '')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;|&#x27;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function tagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, 'i'));
  return match ? norm(unescapeHtml(match[1].replace(/<[^>]*>/g, ' '))) : '';
}

function headings(html) {
  return [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]\s*>/gi)]
    .map((match) => norm(unescapeHtml(match[1].replace(/<[^>]*>/g, ' '))))
    .filter(Boolean);
}

function attrEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseMeta(html) {
  const found = new Set();
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const name = m[0].match(/\bname\s*=\s*(["'])([^"']+)\1/i)?.[2];
    const content = m[0].match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)?.[2];
    if (name && content !== undefined) found.add(`${name}\u0000${unescapeHtml(content)}`);
  }
  return found;
}

function readHtmlInventory() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'PAGE_MANIFEST.json'), 'utf8'));
  const inventory = manifest.repository_html_inventory.files;
  const actual = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (excludedDirectories.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) actual.push(path.relative(root, full).replace(/\\/g, '/'));
    }
  }
  walk(root);
  const invPaths = new Set(inventory.map((row) => row.path.replace(/\\/g, '/')));
  const actualSet = new Set(actual);
  const missingFromManifest = actual.filter((item) => !invPaths.has(item));
  const missingFromDisk = [...invPaths].filter((item) => !actualSet.has(item));
  if (missingFromManifest.length || missingFromDisk.length) {
    throw new Error(`HTML inventory mismatch: ${missingFromManifest.length} missing from manifest, ${missingFromDisk.length} missing on disk.`);
  }
  return { inventory, manifest };
}

function sourceData() {
  const roles = require('../assets/role-taxonomy.js').kovRoleTaxonomy;
  const industries = require('../assets/industry-directory.js').industryDirectory;
  const esco = require('../assets/esco-taxonomy.js');
  const onetChiefExecutiveSkills = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/onet-chief-executives-skills.json'), 'utf8'));
  const faq = require('../assets/faq-directory.js').faqDirectory;
  const cities = require('../assets/world-cities.js').worldCities;
  const discovery = JSON.parse(fs.readFileSync(path.join(root, 'data/kov-discovery-catalog.jsonld'), 'utf8'))['@graph'];
  const geo = JSON.parse(fs.readFileSync(path.join(root, 'data/seo-entity-datasets.jsonld'), 'utf8'))['@graph'];
  const soc = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/soc-occupation-index.json'), 'utf8')).records;
  const countries = discovery.filter((item) => item['@type'] === 'Country');
  const geoById = new Map(geo.map((item) => [item['@id'], item]));
  const dataset = (suffix) => geo.find((item) => item['@id']?.endsWith(suffix));
  const towns = (dataset('#towns')?.about || []).map((ref) => geoById.get(ref['@id'])).filter(Boolean);
  const institutions = (dataset('#institutions')?.about || []).map((ref) => geoById.get(ref['@id'])).filter(Boolean);

  const countryCodes = new Map(countries.map((item) => [item.name, item['@id'].split('#country-')[1]?.toUpperCase()]));
  const codeToCountry = new Map(countries.map((item) => [item['@id'].split('#country-')[1]?.toUpperCase(), item.name]));
  const countryByCode = new Map(countries.map((item) => [item['@id'].split('#country-')[1]?.toUpperCase(), item]));
  const cityRecords = cities.map((item) => ({
    value: [item.city, item.admin_name, item.country].filter(Boolean).join(', '),
    city: item.city, admin: item.admin_name, country: item.country, code: item.iso2,
  }));
  const townRecords = towns.map((item) => {
    const properties = item.additionalProperty || [];
    const code = properties.find((p) => p.name === 'GeoNames country code')?.value;
    const country = codeToCountry.get(code) || '';
    return { value: country ? `${item.name}, ${country}` : item.name, name: item.name, code, country, id: item['@id'] };
  });
  const industryByCode = new Map(industries.map((item) => [item.code, item]));
  const titleByName = new Map(roles.jobTitles.map((item) => [norm(item), item]));
  const occupationByName = new Map(roles.occupations.map((item) => [norm(item), item]));
  const synonymGroups = new Map();
  for (const item of esco.professionalSynonymDirectory) {
    if (item.conceptType !== 'occupation') continue;
    const key = norm(item.preferredLabel);
    const group = synonymGroups.get(key) || [];
    group.push(`${item.term} [${item.language}]`);
    synonymGroups.set(key, group);
  }
  const onetTitles = geo.filter((item) => item['@type'] === 'Occupation' && item.name &&
    Array.isArray(item.identifier) && item.identifier.some((identifier) => identifier.name === 'O*NET-SOC code'));
  const socByCode = new Map(soc.map((item) => [item.code, item]));
  const onetTitlesByLabel = new Map();
  const addOnetAlias = (label, record) => {
    const key = norm(label);
    if (!key) return;
    const group = onetTitlesByLabel.get(key) || [];
    group.push(record);
    onetTitlesByLabel.set(key, group);
  };
  for (const item of onetTitles) {
    addOnetAlias(item.name, item);
    for (const match of item.name.matchAll(/\(([^)]+)\)/g)) addOnetAlias(match[1], item);
    const leading = item.name.split(' (')[0];
    if (leading !== item.name) addOnetAlias(leading, item);
  }

  function sourceRoleMatches(roleName) {
    const key = norm(roleName);
    return [...new Map((onetTitlesByLabel.get(key) || []).map((item) => [item['@id'], item])).values()];
  }

  function sourceOccupationsFor(roleName) {
    const found = new Set();
    for (const item of sourceRoleMatches(roleName)) {
      for (const identifier of item.identifier || []) {
        if (identifier.name !== 'O*NET-SOC code') continue;
        const code = String(identifier.value).replace(/\.\d+$/, '');
        const socRecord = socByCode.get(code);
        if (socRecord) found.add(socRecord.title);
      }
    }
    return found;
  }

  return {
    roles, industries, esco, onetChiefExecutiveSkills, faq, cities, countries, cityRecords, townRecords,
    countryCodes, countryByCode, codeToCountry, industryByCode,
    titleByName, occupationByName, synonymGroups, institutions,
    sourceRoleMatches, sourceOccupationsFor,
  };
}

function getRoleName(pathname, html) {
  const heading = tagText(html, 'h1');
  const title = tagText(html, 'title');
  const candidates = [heading, title];
  for (const candidate of candidates) {
    const m = candidate.match(/^(.+?)\s+career representation(?:\s+in\s+.+)?$/i);
    if (m) return m[1].trim();
    const hub = candidate.match(/^career representation for\s+(.+?)\s+professionals?$/i);
    if (hub) return hub[1].trim();
  }
  const parts = pathname.split('/');
  const roleSlug = parts[1] || '';
  const fromSlug = roleSlug.replace(/-/g, ' ');
  const titleMatches = [...new Set([...require('../assets/role-taxonomy.js').kovRoleTaxonomy.jobTitles,
    ...require('../assets/role-taxonomy.js').kovRoleTaxonomy.occupations])]
    .filter((value) => norm(value) === norm(fromSlug));
  return titleMatches[0] || '';
}

function classify(pathname, inventoryRow) {
  if (pathname.startsWith('.private_admin/')) return { type: 'private-admin', apply: false, reason: 'Private admin HTML is not a public key page.' };
  if (pathname.startsWith('_design-reference/')) return { type: 'design-reference', apply: false, reason: 'Design reference artifact; not a website content page.' };
  if (pathname.startsWith('directory/')) return { type: 'staging', apply: false, reason: 'Staging page; preserve its current publication/indexing controls.' };
  if (!inventoryRow.indexable) return { type: 'noindex', apply: false, reason: 'Repository inventory marks the page nonindexable.' };
  if (pathname === 'index.html') return { type: 'homepage-global-reference', apply: false, reason: 'Retain the existing global metadata block.' };
  if (pathname.startsWith('roles/')) return { type: 'job-role', apply: true, reason: 'Role-specific subject in route and page heading.' };
  if (pathname.startsWith('industries/')) return { type: 'industry-hub', apply: true, reason: 'Industry hub; use the mapped NAICS sector and occupations linked to role pages for that sector.' };
  if (pathname === 'industries.html') return { type: 'industry-directory', apply: true, reason: 'Global industry taxonomy index.' };
  if (pathname === 'countries-we-serve.html' || pathname.startsWith('markets/') || /(?:australia|saudi-arabia|dubai|london|uae|africa)/i.test(pathname)) {
    return { type: 'geographic', apply: true, reason: 'Geographic page; add only directly identified country, city, locality, and source-linked FAQ records.' };
  }
  if (pathname.startsWith('faq/') || pathname === 'faqs.html') return { type: 'faq', apply: true, reason: 'FAQ page; add records directly present on the page or explicitly sourced to it.' };
  if (pathname.includes('institution') || pathname.includes('university') || pathname.includes('college')) {
    return { type: 'institution', apply: true, reason: 'Institution-focused route; only exact named local institution matches are eligible.' };
  }
  if (/qualification|credential/i.test(pathname)) return { type: 'qualification', apply: true, reason: 'Qualification-focused route; no verified qualification records are currently available.' };
  return { type: 'other-indexable', apply: true, reason: 'Public key page; add only FAQ records whose source path is this page.' };
}

function selectMetadata(pathname, html, data, roleAssociations) {
  const out = new Map(names.map((name) => [name, name === 'faq-answer' ? [] : new Set()]));
  const add = (name, value) => {
    if (!value) return;
    if (name === 'faq-answer') out.get(name).push(String(value));
    else out.get(name).add(String(value));
  };
  const pageClass = classify(pathname, { indexable: true });
  const title = tagText(html, 'title');
  const hs = headings(html);
  const h1 = hs[0] || '';
  const context = norm([title, ...hs].join(' '));
  const rolePage = pathname.startsWith('roles/');
  let roleName = '';
  if (rolePage) {
    roleName = getRoleName(pathname, html);
    const key = norm(roleName);
    add('job-title', data.titleByName.get(key));
    add('occupation', data.occupationByName.get(key));
    for (const titleRecord of data.sourceRoleMatches(roleName)) add('job-title', titleRecord.name);
    for (const occupation of data.sourceOccupationsFor(roleName)) add('occupation', occupation);
    for (const alias of data.synonymGroups.get(key) || []) add('professional-term', alias);
    if (pathname.split('/')[1] === 'ceo' || key === norm(data.onetChiefExecutiveSkills.occupation)) {
      for (const record of data.onetChiefExecutiveSkills.records) add('skill', record.metadataValue);
    }
    const industrySlug = pathname.split('/')[2]?.replace(/\.html$/, '');
    if (industrySlug && industrySlug !== 'index') {
      const codes = industrySectors[industrySlug] || [];
      for (const [code, item] of data.industryByCode) {
        if (codes.some((prefix) => code === prefix || code.startsWith(prefix) || code === `${prefix}-${String(Number(prefix) + 1)}`)) {
          add('industry', `${item.code} — ${item.name}`);
        }
      }
    }
    const roleBody = norm(html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' '));
    for (const skill of data.esco.skillDirectory) {
      const label = norm(skill.name);
      if (label.length >= 8 && label.includes(' ') && roleBody.includes(label)) add('skill', skill.name);
    }
  }

  if (pathname === 'industries.html') {
    for (const item of data.industries) add('industry', `${item.code} — ${item.name}`);
    for (const association of roleAssociations.values()) {
      for (const item of association.occupations) add('occupation', item);
    }
  } else if (pathname.startsWith('industries/')) {
    const slug = pathname.split('/')[1];
    const codes = industrySectors[slug] || [];
    for (const [code, item] of data.industryByCode) {
      if (codes.some((prefix) => code === prefix || code.startsWith(prefix) || code === `${prefix}-${String(Number(prefix) + 1)}`)) {
        add('industry', `${item.code} — ${item.name}`);
      }
    }
    for (const item of roleAssociations.get(slug)?.occupations || []) add('occupation', item);
  }

  const isGeographic = pageClass.type === 'geographic';
  const identifiedCodes = new Set();
  if (isGeographic) {
    if (pathname === 'countries-we-serve.html') {
      for (const item of data.countries) add('country', item.name);
      for (const [code] of data.countryByCode) identifiedCodes.add(code);
    } else {
      const local = `${pathname} ${title} ${h1}`.toLocaleLowerCase('en').replace(/-/g, ' ');
      for (const [code, aliases] of Object.entries(countryAliases)) {
        if (aliases.some((alias) => local.includes(alias))) identifiedCodes.add(code);
      }
      for (const [name, code] of data.countryCodes) {
        if (name.length > 3 && context.includes(norm(name))) identifiedCodes.add(code);
      }
      for (const code of identifiedCodes) {
        const item = data.countryByCode.get(code);
        if (item) add('country', item.name);
      }
    }
    const targetCountries = identifiedCodes;
    const namedCityKeys = new Set();
    for (const record of data.cityRecords) {
      const cityKey = norm(record.city);
      if (cityKey.length < 5) continue;
      const explicitlyNamed = hs.some((heading) => ` ${heading} `.includes(` ${cityKey} `)) ||
        title.includes(cityKey) || pathname.toLocaleLowerCase('en').replace(/-/g, ' ').includes(cityKey);
      if (!explicitlyNamed) continue;
      if (targetCountries.size && !targetCountries.has(record.code)) continue;
      namedCityKeys.add(`${record.city}\u0000${record.code}`);
      add('city', record.value);
    }
    for (const record of data.townRecords) {
      const placeKey = norm(record.name);
      if (placeKey.length < 5) continue;
      const explicit = hs.some((heading) => ` ${heading} `.includes(` ${placeKey} `)) ||
        title.includes(placeKey) || pathname.toLocaleLowerCase('en').replace(/-/g, ' ').includes(placeKey);
      if (!explicit) continue;
      if (targetCountries.size && record.code && !targetCountries.has(record.code)) continue;
      add('town-locality', record.value);
    }
  }

  const faqPage = pathname.startsWith('faq/');
  const sourcePath = `/${pathname}`;
  const bodyText = faqPage
    ? norm(html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' '))
    : '';
  for (const item of data.faq) {
    const exactSource = item.source === sourcePath;
    const questionKey = norm(item.question);
    const exactVisibleQuestion = faqPage && questionKey.length > 20 && bodyText.includes(questionKey);
    if (exactSource || exactVisibleQuestion) {
      add('faq-question', item.question);
      add('faq-answer', item.answer);
    }
  }

  if (pageClass.type === 'institution') {
    for (const item of data.institutions) {
      if (norm(item.name).length > 5 && context.includes(norm(item.name))) add('institution', item.name);
    }
  }

  return { out, roleName, title, h1, identifiedCodes };
}

function csv(value) {
  const s = String(value ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

function main() {
  const mode = process.argv[2] || '--plan';
  if (!['--plan', '--apply'].includes(mode)) throw new Error('Use --plan or --apply.');
  const { inventory, manifest } = readHtmlInventory();
  const data = sourceData();
  const manifestPages = new Map(manifest.pages.map((page) => [page.path.replace(/\\/g, '/'), page]));

  const rawByPath = new Map();
  const facts = [];
  const roleAssociations = new Map();
  for (const row of inventory) {
    const pathname = row.path.replace(/\\/g, '/');
    if (!pathname.startsWith('roles/')) continue;
    const full = path.join(root, pathname);
    const html = fs.readFileSync(full, 'utf8');
    rawByPath.set(pathname, html);
    const roleName = getRoleName(pathname, html);
    const roleKey = norm(roleName);
    const occupation = data.occupationByName.get(roleKey);
    const industrySlug = pathname.split('/')[2]?.replace(/\.html$/, '');
    if (industrySlug && industrySlug !== 'index') {
      const entry = roleAssociations.get(industrySlug) || { titles: new Set(), occupations: new Set() };
      if (data.titleByName.has(roleKey)) entry.titles.add(data.titleByName.get(roleKey));
      if (occupation) entry.occupations.add(occupation);
      for (const titleRecord of data.sourceRoleMatches(roleName)) entry.titles.add(titleRecord.name);
      for (const sourceOccupation of data.sourceOccupationsFor(roleName)) entry.occupations.add(sourceOccupation);
      roleAssociations.set(industrySlug, entry);
    }
    facts.push({ pathname, roleName, industrySlug, occupation: occupation || '' });
  }

  const roleStats = Object.fromEntries([...roleAssociations.entries()].map(([slug, item]) => [slug, {
    roles: item.titles.size, occupations: item.occupations.size,
  }]));
  const totals = Object.fromEntries(names.map((name) => [name, 0]));
  const typeCounts = {};
  const changes = [];
  const rows = [];
  const planLines = [];
  const existingNames = new Set();

  for (const row of inventory) {
    const pathname = row.path.replace(/\\/g, '/');
    const htmlPath = path.join(root, pathname);
    const manifestPage = manifestPages.get(pathname);
    const classification = classify(pathname, row);
    typeCounts[classification.type] = (typeCounts[classification.type] || 0) + 1;
    const html = rawByPath.get(pathname) || fs.readFileSync(htmlPath, 'utf8');
    const chosen = classification.apply
      ? selectMetadata(pathname, html, data, roleAssociations)
      : { out: new Map(names.map((name) => [name, new Set()])), roleName: '', title: tagText(html, 'title'), h1: tagText(html, 'h1') };
    const present = parseMeta(html);
    const additions = [];
    const counts = {};
    const samples = {};
    for (const name of names) {
      const records = [...(chosen.out.get(name) || [])];
      const newValues = records.filter((value) => !present.has(`${name}\u0000${value}`));
      counts[name] = newValues.length;
      if (newValues.length) samples[name] = newValues.slice(0, 3);
      totals[name] += newValues.length;
      for (const value of newValues) additions.push(`<meta name="${name}" content="${attrEscape(value)}">`);
    }
    if (pathname === 'index.html') {
      const existingCounts = Object.fromEntries(names.map((name) => [name, 0]));
      const metaRe = /<meta\b[^>]*>/gi;
      let metaMatch;
      while ((metaMatch = metaRe.exec(html))) {
        const name = metaMatch[0].match(/\bname\s*=\s*(["'])([^"']+)\1/i)?.[2];
        if (name && Object.hasOwn(existingCounts, name)) existingCounts[name] += 1;
      }
      for (const [name, count] of Object.entries(existingCounts)) if (count) counts[name] = count;
    }
    const summary = Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 0));
    if (additions.length) {
      changes.push({ pathname, classification: classification.type, count: additions.length, counts: summary });
      if (mode === '--apply') {
        const close = /<\/head\s*>/i;
        if (!close.test(html)) throw new Error(`${pathname}: missing closing </head>; no further files have been written.`);
        const block = `<!-- KOV page-specific descriptive metadata -->\n${additions.join('\n')}\n`;
        fs.writeFileSync(htmlPath, html.replace(close, `${block}</head>`), 'utf8');
      }
      planLines.push({ pathname, classification: classification.type, count: additions.length, counts: summary });
    }
    rows.push([
      pathname, row.indexable ? 'indexable' : 'noindex', classification.type,
      manifestPage?.template_type || (row.inPageManifest ? 'manifest-other' : 'missing-from-manifest'),
      classification.apply ? 'eligible' : 'excluded',
      JSON.stringify(summary), JSON.stringify(samples), classification.reason,
    ]);
  }

  const header = ['path', 'indexability', 'page_class', 'manifest_template', 'treatment', 'metadata_record_counts', 'sample_records', 'mapping_reason'];
  const csvText = [header.map(csv).join(','), ...rows.map((row) => row.map(csv).join(','))].join('\r\n') + '\r\n';
  fs.writeFileSync(mapPath, csvText, 'utf8');

  const indexableChanges = changes.filter((item) => !item.pathname.startsWith('directory/'));
  const byClass = {};
  for (const item of indexableChanges) {
    const entry = byClass[item.classification] || { pages: 0, tags: 0 };
    entry.pages += 1;
    entry.tags += item.count;
    byClass[item.classification] = entry;
  }
  const summary = [
    '# Page-category implementation map', '',
    'Date: 13 November 2026', '',
    'This map covers every HTML file in `PAGE_MANIFEST.json` repository inventory. It assigns records only to public key pages with a direct subject match. The homepage retains its global reference block. Noindex, staging, private-admin, and design-reference HTML is mapped but not edited.', '',
    `- HTML inventory: ${inventory.length} files (${manifest.repository_html_inventory.indexable} marked indexable; ${manifest.repository_html_inventory.noindex} marked noindex).`,
    `- Indexable staging routes intentionally excluded from edits: ${inventory.filter((row) => row.path.startsWith('directory/') && row.indexable).length}.`,
    `- Pages with page-specific additions: ${indexableChanges.length}.`,
    `- Page-specific tags added in this run: ${indexableChanges.reduce((sum, item) => sum + item.count, 0)}.`,
    `- Existing global homepage tags retained: 206,352.`, '',
    '## Classification', '',
    '| Page class | HTML files |', '| --- | ---: |',
    ...Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([key, value]) => `| ${key} | ${value} |`), '',
    '## Implemented page groups', '',
    '| Key page group | Pages changed | Additional tags |', '| --- | ---: | ---: |',
    ...Object.entries(byClass).sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => `| ${key} | ${value.pages} | ${value.tags} |`), '',
    '## Category selection rules', '',
    '- Role pages: exact role heading matched against the existing title and occupation lists; ESCO skills may be added when their preferred labels appear in page copy. The O*NET 11-1011.00 Chief Executives skills are assigned to CEO routes from the source-backed role relation dataset.',
    '- Industry hubs and role/industry pages: NAICS records are selected from the sector crosswalk in the implementation script. Industry hubs receive exact occupation labels connected to published role/industry routes.',
    '- Geographic pages: countries are selected for named markets; the countries directory receives the full 197-country list. City and GeoNames locality values are added only when explicitly named in the page title, heading, or route and when the country can be matched.',
    '- Career and FAQ pages: question/answer pairs are added only when their recorded source path is the page or the exact question text appears on a FAQ subpage.',
    '- Institution, qualification, audience, job-function, seniority, employment-type, career-challenge, and search-intent records remain unassigned where verified source records are unavailable. This prevents placeholder records from being presented as verified.',
    '', '## Route-level role association counts', '',
    '| Industry route slug | Distinct title labels | Exact occupation matches |', '| --- | ---: | ---: |',
    ...Object.entries(roleStats).sort((a, b) => a[0].localeCompare(b[0])).map(([slug, value]) => `| ${slug} | ${value.roles} | ${value.occupations} |`), '',
    `Detailed all-page map (counts and sample records): [page-category-implementation-map-2026-11-13.csv](./page-category-implementation-map-2026-11-13.csv).`, '',
    `Run used: \`node scripts/map-and-apply-page-metadata.js ${mode}\`.`,
  ].join('\n') + '\n';
  fs.writeFileSync(reportPath, summary, 'utf8');

  console.log(JSON.stringify({
    mode, inventoryCount: inventory.length,
    indexable: manifest.repository_html_inventory.indexable,
    noindex: manifest.repository_html_inventory.noindex,
    classifications: typeCounts,
    pagesWithAdditions: indexableChanges.length,
    pageSpecificTags: indexableChanges.reduce((sum, item) => sum + item.count, 0),
    categoryTotals: totals,
    roleAssociations: roleStats,
    map: path.relative(root, mapPath),
    report: path.relative(root, reportPath),
  }, null, 2));
}

main();
