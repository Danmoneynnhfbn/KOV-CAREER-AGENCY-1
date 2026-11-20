const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const CATALOG = 'https://www.kovcareeragency.org/#metadata-catalog';
const SIX_TAXONOMY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taxonomy/kov-six-category-taxonomies.json'), 'utf8'));
const CATEGORY = {
  'professional-audience': ['audiences', 471], 'job-title': ['job-titles', 98380],
  occupation: ['occupations', 1655], industry: ['industries', 1000], skill: ['skills', 560],
  qualification: ['qualifications', 15000], 'professional-term': ['professional-terms', 50000],
  'job-function': ['job-functions', 100], 'seniority-level': ['seniority-levels', 10],
  'employment-type': ['employment-types', 30], 'career-challenge': ['career-challenges', 250],
  'career-search-intent': ['career-search-intents', 5000], faq: ['faqs', 500],
  language: ['languages', 30], country: ['countries', 197], city: ['cities', 50250],
  'town-locality': ['towns-localities', 1323], institution: ['institutions', 1300],
};
const META_NAMES = Object.keys(CATEGORY).flatMap((key) => key === 'faq' ? ['faq-question', 'faq-answer'] : [key]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function matchingTags(html, regex) { return [...html.matchAll(regex)].map((m) => m[0]); }
function isType(node, type) { return node['@type'] === type || (Array.isArray(node['@type']) && node['@type'].includes(type)); }
function globalCount(description) {
  const match = description.match(/(?:Record rows in the retained local source snapshot|Verified record-level sources present): ([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}
function pageCatalog(file) {
  if (file === 'index.html') return CATALOG;
  const normalized = String(file).normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
  const digest = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  return `${CATALOG}/page-${digest}`;
}

function validate() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'PAGE_MANIFEST.json'), 'utf8'));
  const files = manifest.repository_html_inventory.files.map((item) => item.path.replace(/\\/g, '/'));
  assert(files.length === 2076, `Expected 2,076 repository HTML pages; found ${files.length}`);
  const expectedCounts = {
    'professional-audience': SIX_TAXONOMY.categories['professional-audience'].length, 'job-title': 98380, occupation: 1655, industry: 2125,
    skill: 583, qualification: 17268, 'professional-term': 50000, 'job-function': SIX_TAXONOMY.categories['job-function'].length,
    'seniority-level': SIX_TAXONOMY.categories['seniority-level'].length, 'employment-type': SIX_TAXONOMY.categories['employment-type'].length, 'career-challenge': SIX_TAXONOMY.categories['career-challenge'].length,
    'career-search-intent': SIX_TAXONOMY.categories['career-search-intent'].length, faq: 500, language: 30, country: 197, city: 50250,
    'town-locality': 1323, institution: 832,
  };
  const summary = {
    date: '2026-11-15', pages: files.length, eligiblePublicPages: 0, eligibleWithWebPage: 0,
    pagesWithKovJsonLd: 0,
    pagesWithTaxonomyRecords: 0, taxonomyRecordNodes: 0, taxonomyCategoryCoverage: {},
    homepage: { datasets: {}, individualRecords: {} }, pageMap: {},
  };
  const errors = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const scriptMatches = matchingTags(html, /<script\b[^>]*data-kov="discovery"[^>]*>[\s\S]*?<\/script\s*>/gi);
    if (scriptMatches.length !== 1) { errors.push(`${file}: expected one generated KOV JSON-LD script, found ${scriptMatches.length}`); continue; }
    summary.pagesWithKovJsonLd += 1;
    const remainingMeta = new RegExp(`<meta\\b(?=[^>]*\\bname\\s*=\\s*(["'])(?:${META_NAMES.join('|')})\\1)[^>]*>`, 'i');
    if (remainingMeta.test(html)) errors.push(`${file}: project taxonomy meta remains`);
    let document;
    try { document = JSON.parse(scriptMatches[0].replace(/^<script[^>]*>/i, '').replace(/<\/script\s*>$/i, '')); }
    catch (error) { errors.push(`${file}: invalid JSON-LD: ${error.message}`); continue; }
    const graph = document['@graph'];
    if (!Array.isArray(graph)) { errors.push(`${file}: missing @graph`); continue; }
    const ids = graph.map((node) => node['@id']).filter(Boolean);
    if (new Set(ids).size !== ids.length) errors.push(`${file}: duplicate @id values`);
    if (ids.some((id) => id.indexOf('#') !== id.lastIndexOf('#'))) errors.push(`${file}: @id contains multiple raw fragment delimiters`);
    for (const node of graph) {
      const sameAs = node.sameAs == null ? [] : Array.isArray(node.sameAs) ? node.sameAs : [node.sameAs];
      if (sameAs.some((value) => typeof value !== 'string' || !/^https?:\/\//i.test(value))) errors.push(`${file}: sameAs must contain URL values`);
    }
    if (graph.some((node) => Object.hasOwn(node, 'recordCount') || Object.hasOwn(node, 'numberOfItems'))) errors.push(`${file}: unsupported numeric record-count property`);
    if (graph.some((node) => String(node['@id'] || '').startsWith('urn:kov:career-agency:metadata#'))) errors.push(`${file}: unverified legacy taxonomy graph remains`);
    const counts = {};
    const pageCatalogId = pageCatalog(file);
    const inventoryItem = manifest.repository_html_inventory.files.find((item) => item.path.replace(/\\/g, '/') === file);
    const eligiblePublic = Boolean(inventoryItem?.indexable) && !file.startsWith('staging/') && !file.startsWith('_design-reference/');
    if (eligiblePublic) {
      summary.eligiblePublicPages += 1;
      if (!graph.some((node) => isType(node, 'WebPage'))) errors.push(`${file}: eligible public page has no WebPage node`);
      else summary.eligibleWithWebPage += 1;
    }
    for (const category of Object.keys(CATEGORY)) {
      const setId = `${pageCatalogId}/set-${CATEGORY[category][0]}`;
      const faqId = `${pageCatalogId}/dataset-faqs`;
      const records = graph.filter((node) => node.inDefinedTermSet?.['@id'] === setId || (category === 'faq' && node.isPartOf?.['@id'] === faqId));
      if (records.length) counts[category] = records.length;
      if (file === 'index.html') summary.homepage.individualRecords[category] = records.length;
      if (records.length) {
        summary.taxonomyCategoryCoverage[category] = (summary.taxonomyCategoryCoverage[category] || 0) + 1;
        summary.taxonomyRecordNodes += records.length;
      }
    }
    if (!eligiblePublic && Object.values(counts).some((count) => count > 0)) errors.push(`${file}: excluded/nonindexable page carries taxonomy records`);
    if (Object.keys(counts).length) summary.pagesWithTaxonomyRecords += 1;
    if (Object.keys(counts).length) summary.pageMap[file] = counts;
    if (file === 'index.html') {
      const datasets = graph.filter((node) => isType(node, 'Dataset') && String(node['@id'] || '').startsWith(`${CATALOG}/dataset-`));
      if (datasets.length !== Object.keys(CATEGORY).length) errors.push(`index.html: expected 18 Dataset nodes, found ${datasets.length}`);
      for (const category of Object.keys(CATEGORY)) {
        const [slug] = CATEGORY[category];
        const node = datasets.find((item) => item['@id'] === `${CATALOG}/dataset-${slug}`);
        if (!node) { errors.push(`index.html: missing ${category} Dataset node`); continue; }
        const count = globalCount(node.description || '');
        if (count !== expectedCounts[category]) errors.push(`index.html: ${category} reports ${count}, expected ${expectedCounts[category]}`);
        summary.homepage.datasets[category] = { verifiedLocalRecords: count, target: CATEGORY[category][1], description: node.description };
      }
      const qualifications = datasets.find((item) => item['@id'] === `${CATALOG}/dataset-qualifications`);
      if (qualifications?.creator?.name !== 'Office of Qualifications and Examinations Regulation (Ofqual)' || qualifications?.distribution?.contentUrl !== 'https://www.kovcareeragency.org/data/taxonomy/ofqual-active-qualifications.json' || qualifications?.distribution?.encodingFormat !== 'application/json' || !qualifications?.license) {
        errors.push('index.html: Ofqual qualification source, distribution, or license provenance is missing');
      }
      const expectedIndividuals = {
        'professional-audience': SIX_TAXONOMY.categories['professional-audience'].length,
        occupation: 1655, industry: 2125, skill: 583, faq: 500, language: 30, country: 197, 'town-locality': 1323, institution: 832,
        'job-function': SIX_TAXONOMY.categories['job-function'].length,
        'seniority-level': SIX_TAXONOMY.categories['seniority-level'].length,
        'employment-type': SIX_TAXONOMY.categories['employment-type'].length,
        'career-challenge': SIX_TAXONOMY.categories['career-challenge'].length,
        'career-search-intent': SIX_TAXONOMY.categories['career-search-intent'].length,
      };
      for (const [category, count] of Object.entries(expectedIndividuals)) if (summary.homepage.individualRecords[category] !== count) errors.push(`index.html: ${category} individual record nodes ${summary.homepage.individualRecords[category]}, expected ${count}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  if (summary.eligiblePublicPages !== 703 || summary.eligibleWithWebPage !== 703) throw new Error(`Expected 703 eligible public pages with WebPage data; got ${summary.eligiblePublicPages}/${summary.eligibleWithWebPage}`);
  const reportPath = path.join(ROOT, 'docs/research/jsonld-implementation-validation-2026-11-13.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    pages: summary.pages, eligiblePublicPages: summary.eligiblePublicPages,
    eligibleWithWebPage: summary.eligibleWithWebPage, pagesWithKovJsonLd: summary.pagesWithKovJsonLd,
    pagesWithTaxonomyRecords: summary.pagesWithTaxonomyRecords,
    taxonomyRecordNodes: summary.taxonomyRecordNodes,
    taxonomyCategoryCoverage: summary.taxonomyCategoryCoverage,
    homepageDatasets: Object.fromEntries(Object.entries(summary.homepage.datasets).map(([key, value]) => [key, value.verifiedLocalRecords])),
    homepageIndividualRecords: summary.homepage.individualRecords,
    report: path.relative(ROOT, reportPath), errors: 0,
  }, null, 2));
}

validate();

