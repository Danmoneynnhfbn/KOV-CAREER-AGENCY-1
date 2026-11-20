'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'data/taxonomy/kov-six-category-taxonomies.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'PAGE_MANIFEST.json'), 'utf8'));
const pages = new Map(manifest.repository_html_inventory.files.map((item) => [
  item.path.replace(/\\/g, '/'), Boolean(item.indexable),
]));
const faq = require('../assets/faq-directory.js').faqDirectory;
const keywordSource = fs.readFileSync(path.join(ROOT, 'development/KEYWORD-INTENT-MAP.csv'), 'utf8');
const researchRecords = new Map();
const researchRoot = path.join(ROOT, 'development/research/records');
for (const name of fs.readdirSync(researchRoot).filter((name) => name.endsWith('.json'))) {
  try {
    const relative = 'development/research/records/' + name;
    const source = fs.readFileSync(path.join(researchRoot, name), 'utf8');
    const record = JSON.parse(source.replace(/^\uFEFF/, ''));
    researchRecords.set(relative, { source, record });
  } catch (_) { /* malformed source records are not eligible for taxonomies */ }
}
const gscQuerySourcePath = 'data/taxonomy/gsc-observed-search-queries.json';
const gscQuerySource = JSON.parse(fs.readFileSync(path.join(ROOT, gscQuerySourcePath), 'utf8'));
const gscQueries = new Map((gscQuerySource.records || [])
  .filter((record) => record.includedInTaxonomy)
  .map((record) => [normalize(record.query), record]));
const expectedKeys = [
  'professional-audience', 'job-function', 'seniority-level',
  'employment-type', 'career-challenge', 'career-search-intent',
];
const approvedTargets = {
  'professional-audience': 471, 'job-function': 100, 'seniority-level': 10,
  'employment-type': 30, 'career-challenge': 250, 'career-search-intent': 5000,
};
const errors = [];
const counts = {};
function normalize(value) { return String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en'); }

if (data.schemaVersion !== 1) errors.push('Unsupported taxonomy data schema version.');
for (const category of expectedKeys) {
  const records = data.categories?.[category];
  if (!Array.isArray(records)) { errors.push(category + ': records are missing.'); continue; }
  counts[category] = records.length;
  const ids = new Set();
  const labels = new Set();
  for (const record of records) {
    const label = normalize(record.name);
    if (!label || labels.has(label)) errors.push(category + ': empty or duplicate label ' + record.name);
    if (!record.id || ids.has(record.id)) errors.push(category + ': empty or duplicate identifier ' + record.id);
    if (!record.description || !record.sourceType) errors.push(category + ': missing definition or provenance classification for ' + record.name);
    const hasProvenance = Boolean(record.sourcePath || record.sourcePaths?.length || record.sourceUrl || record.sourceUrls?.length || record.citation);
    if (!hasProvenance) errors.push(category + ': missing record provenance ' + record.name);
    for (const sourcePath of [record.sourcePath, ...(record.sourcePaths || [])].filter(Boolean)) {
      if (!fs.existsSync(path.join(ROOT, sourcePath))) errors.push(category + ': source file missing for ' + record.name + ': ' + sourcePath);
    }
    for (const url of [record.sourceUrl, record.citation, ...(record.sourceUrls || [])].filter(Boolean)) {
      if (!/^https?:\/\//i.test(url)) errors.push(category + ': malformed source URL for ' + record.name + ': ' + url);
    }
    if (!Array.isArray(record.pagePaths)) errors.push(category + ': pagePaths must be an array for ' + record.name);
    else for (const page of record.pagePaths) {
      if (!pages.get(page) || page.startsWith('staging/')) errors.push(category + ': page mapping is missing, excluded, or noindex: ' + page);
    }
    if (category === 'career-search-intent') {
      if (record.observedSearchConsoleQuery === true) {
        if (record.sourcePath !== gscQuerySourcePath) errors.push('Observed search query must cite the GSC source file: ' + record.name);
        const observed = gscQueries.get(normalize(record.name));
        if (!observed) errors.push('Observed search query is absent from the retained Search Console source: ' + record.name);
        else {
          if (Number(record.searchConsoleClicks || 0) !== Number(observed.clicks || 0)) errors.push('GSC clicks differ from source for: ' + record.name);
          if (Number(record.searchConsoleImpressions || 0) !== Number(observed.impressions || 0)) errors.push('GSC impressions differ from source for: ' + record.name);
          if (Number(record.searchConsoleCtr || 0) !== Number(observed.ctr || 0)) errors.push('GSC CTR differs from source for: ' + record.name);
          if (Number(record.searchConsoleAveragePosition || 0) !== Number(observed.position || 0)) errors.push('GSC position differs from source for: ' + record.name);
        }
        if (record.searchVolumeStatus === 'available') errors.push('GSC impressions must not be represented as search volume: ' + record.name);
      } else {
        if (record.observedSearchConsoleQuery !== false) errors.push('Search intent must declare whether it was observed in Search Console: ' + record.name);
        if (record.searchVolumeStatus === 'available') errors.push('Unsupported search-volume claim: ' + record.name);
        if (record.sourcePath === 'development/KEYWORD-INTENT-MAP.csv') {
          const candidateId = String(record.identifier || '').split(':')[0];
          if (!candidateId || !keywordSource.includes('"' + candidateId + '"')) errors.push('Search intent candidate ID is absent from the source keyword map: ' + record.name);
        } else if (record.sourcePath === 'assets/faq-directory.js') {
          if (!record.sourceQuestion || !faq.some((item) => item.question === record.sourceQuestion && item.question === record.name)) {
            errors.push('FAQ-derived intent is not an exact FAQ question: ' + record.name);
          }
        } else {
          const sourceEntry = researchRecords.get(record.sourcePath);
          if (!sourceEntry) errors.push('Search intent research-record source is unavailable: ' + record.sourcePath);
          else {
            const terms = [...(sourceEntry.record.primary_keywords || []), ...(sourceEntry.record.secondary_keywords || [])].map(normalize);
            if (!terms.includes(normalize(record.name))) errors.push('Search intent text is not a primary/secondary keyword in its cited research record: ' + record.name);
            if (!String(record.identifier || '').startsWith(String(sourceEntry.record.id || '') + ':')) errors.push('Search intent identifier does not match the cited research record: ' + record.name);
          }
        }
      }
    }
    if (category === 'career-challenge') {
      if (!faq.some((item) => item.question === record.sourceQuestion)) errors.push('Challenge source question not found in FAQ directory: ' + record.name);
    }
    labels.add(label); ids.add(record.id);
  }
}
const targets = data.targetCounts || {};
for (const category of expectedKeys) {
  const target = targets[category];
  if (target !== approvedTargets[category]) errors.push(category + ': approved target changed or missing.');
}
if (counts['employment-type'] !== 30) errors.push('Employment-type dataset must retain the 30 documented cross-dimensional records.');
if (counts['seniority-level'] !== 10) errors.push('Seniority dataset must contain 10 KOV-defined levels.');
if (errors.length) {
  console.error(errors.slice(0, 40).join('\n'));
  console.error('Six-category dataset validation failed with ' + errors.length + ' issue(s).');
  process.exitCode = 1;
} else {
  const summary = Object.fromEntries(expectedKeys.map((category) => [category, {
    target: targets[category], actual: counts[category], gap: Math.max(0, targets[category] - counts[category]),
    aboveTarget: Math.max(0, counts[category] - targets[category]),
    unique: counts[category],
    provenanceRecords: data.categories[category].length,
    mappedRecords: data.categories[category].filter((record) => record.pagePaths.length).length,
  }]));
  console.log(JSON.stringify({ categories: summary, validation: 'PASS' }, null, 2));
}
