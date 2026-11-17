const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const names = [
  'professional-audience', 'job-title', 'occupation', 'industry', 'skill',
  'qualification', 'professional-term', 'job-function', 'seniority-level',
  'employment-type', 'career-challenge', 'career-search-intent',
  'faq-question', 'faq-answer', 'language', 'country', 'city',
  'town-locality', 'institution',
];

function normalize(value) {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ');
}

function escapeAttribute(value) {
  return normalize(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loadRecords() {
  const role = require('../assets/role-taxonomy.js').kovRoleTaxonomy;
  const industry = require('../assets/industry-directory.js').industryDirectory;
  const esco = require('../assets/esco-taxonomy.js');
  const languages = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/languages.json'), 'utf8'));
  const onetSkills = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/onet-chief-executives-skills.json'), 'utf8'));
  const faqs = require('../assets/faq-directory.js').faqDirectory;
  const cities = require('../assets/world-cities.js').worldCities;
  const discovery = JSON.parse(fs.readFileSync(path.join(root, 'data/kov-discovery-catalog.jsonld'), 'utf8'))['@graph'];
  const seo = JSON.parse(fs.readFileSync(path.join(root, 'data/seo-entity-datasets.jsonld'), 'utf8'))['@graph'];

  const countryRecords = discovery.filter((item) => item['@type'] === 'Country');
  const byId = new Map(seo.map((item) => [item['@id'], item]));
  const townDataset = seo.find((item) => item['@id']?.endsWith('#towns'));
  const institutionDataset = seo.find((item) => item['@id']?.endsWith('#institutions'));
  const towns = (townDataset?.about || []).map((ref) => byId.get(ref['@id'])).filter(Boolean);
  const institutions = (institutionDataset?.about || []).map((ref) => byId.get(ref['@id'])).filter(Boolean);

  const records = new Map(names.map((name) => [name, []]));
  const add = (name, values) => records.set(name, values.map(normalize).filter(Boolean));

  add('job-title', role.jobTitles);
  add('occupation', role.occupations);
  add('industry', industry.map((item) => `${item.code} — ${item.name}`));
  add('skill', [...new Set([...esco.skillDirectory.map((item) => item.name), ...onetSkills.records.map((item) => item.metadataValue)])]);
  add('professional-term', esco.professionalSynonymDirectory.map((item) => `${item.term} [${item.language}]`));
  add('faq-question', faqs.map((item) => item.question));
  add('faq-answer', faqs.map((item) => item.answer));
  add('country', countryRecords.map((item) => item.name));
  add('city', cities.map((item) => [item.city, item.admin_name, item.country].filter(Boolean).join(', ')));
  add('town-locality', towns.map((item) => item.name));
  add('institution', institutions.map((item) => item.name));
  add('language', languages.records.map((item) => item.name));

  const gaps = [
    ['professional-audience', 471, 'No record-level source evidence; the local 471 records are explicitly unverified.'],
    ['qualification', 15000, 'No local qualification registry records; the local target-matched list is explicitly unverified.'],
    ['job-function', 100, 'The local target-matched list has no record-level source evidence.'],
    ['seniority-level', 10, 'The local target-matched list has no record-level source evidence.'],
    ['employment-type', 30, 'The local target-matched list has no record-level source evidence.'],
    ['career-challenge', 250, 'The local target-matched list has no record-level source evidence.'],
    ['career-search-intent', 5000, 'No search-log or other record-level query evidence is present; local list is explicitly unverified.'],
  ];

  return { records, gaps, countryRecords, towns, institutions, cities, industry, esco, faqs, role };
}

function buildTags(records) {
  const tags = [];
  const counts = {};
  for (const name of names) {
    const values = records.get(name) || [];
    counts[name] = values.length;
    for (const value of values) {
      tags.push(`<meta name="${name}" content="${escapeAttribute(value)}">`);
    }
  }
  return { html: tags.join('\n'), counts };
}

function inject(html, metadata) {
  const close = /<\/head\s*>/i;
  if (!close.test(html)) throw new Error('HTML has no closing </head> tag.');
  if (names.some((name) => new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*["']${name}["']`, 'i').test(html))) {
    throw new Error('At least one approved metadata name already exists; refusing to append duplicate records.');
  }
  return html.replace(close, `${metadata}\n</head>`);
}

function countMeta(html) {
  const result = Object.fromEntries(names.map((name) => [name, 0]));
  const re = /<meta\b[^>]*\bname\s*=\s*(["'])([^"']+)\1[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    if (Object.hasOwn(result, match[2])) result[match[2]] += 1;
  }
  return result;
}

function main() {
  const mode = process.argv[2] || '--homepage';
  const { records, gaps } = loadRecords();
  const built = buildTags(records);
  const metadata = `<!-- KOV global descriptive metadata records; source status and gaps are documented in docs/research/metadata-implementation-status-2026-11-13.md -->\n${built.html}`;

  if (mode === '--counts') {
    console.log(JSON.stringify({ counts: built.counts, gaps, metadataBytes: Buffer.byteLength(metadata) }, null, 2));
    return;
  }

  if (mode === '--verify-homepage') {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const actual = countMeta(html);
    const failures = names.filter((name) => actual[name] !== built.counts[name]);
    if (!html.includes('KOV global descriptive metadata')) failures.push('global-marker');
    if (failures.length) throw new Error(`Homepage verification failed: ${failures.join(', ')}`);
    console.log(JSON.stringify({ verified: true, counts: actual, recordedDatasetBytes: Buffer.byteLength(metadata) }, null, 2));
    return;
  }

  if (mode !== '--homepage') throw new Error(`Unsupported mode ${mode}; only --homepage, --counts, and --verify-homepage are available.`);
  const homepage = path.join(root, 'index.html');
  const current = fs.readFileSync(homepage, 'utf8');
  const updated = inject(current, metadata);
  fs.writeFileSync(homepage, updated, 'utf8');
  console.log(JSON.stringify({
    homepage: path.relative(root, homepage),
    counts: built.counts,
    metadataBytes: Buffer.byteLength(metadata),
    sourceGaps: gaps,
    replication: 'not performed: missing/unverified categories prevent a complete 19-name dataset',
  }, null, 2));
}

main();
