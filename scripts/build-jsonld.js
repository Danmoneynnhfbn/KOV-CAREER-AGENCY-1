const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.kovcareeragency.org';
const CATALOG = `${SITE}/#metadata-catalog`;
const MARKER = 'data-kov="discovery"';
const NAMES = [
  'professional-audience', 'job-title', 'occupation', 'industry', 'skill',
  'qualification', 'professional-term', 'job-function', 'seniority-level',
  'employment-type', 'career-challenge', 'career-search-intent',
  'faq-question', 'faq-answer', 'language', 'country', 'city',
  'town-locality', 'institution',
];
const CATEGORY = {
  'professional-audience': ['audiences', 'Professional audiences', 471],
  'job-title': ['job-titles', 'Job titles', 98380],
  occupation: ['occupations', 'Occupations', 1655],
  industry: ['industries', 'Industries', 1000],
  skill: ['skills', 'Skills', 560],
  qualification: ['qualifications', 'Qualifications', 15000],
  'professional-term': ['professional-terms', 'Professional synonyms and related terms', 50000],
  'job-function': ['job-functions', 'Job functions', 100],
  'seniority-level': ['seniority-levels', 'Seniority levels', 10],
  'employment-type': ['employment-types', 'Employment types', 30],
  'career-challenge': ['career-challenges', 'Career challenges', 250],
  'career-search-intent': ['career-search-intents', 'Career search intents', 5000],
  faq: ['faqs', 'Frequently asked questions', 500],
  language: ['languages', 'Languages', 30],
  country: ['countries', 'Countries', 197],
  city: ['cities', 'Cities and populated places', 50250],
  'town-locality': ['towns-localities', 'Towns and localities', 1323],
  institution: ['institutions', 'Organizations and institutions', 1300],
};
const ALL_CATEGORIES = Object.keys(CATEGORY);
const LARGE_CATEGORIES = new Set(['job-title', 'professional-term', 'city', 'qualification']);
const SIX_TAXONOMY_PATH = path.join(ROOT, 'data/taxonomy/kov-six-category-taxonomies.json');
const SIX_TAXONOMY = JSON.parse(fs.readFileSync(SIX_TAXONOMY_PATH, 'utf8'));
const SIX_CATEGORIES = new Set(Object.keys(SIX_TAXONOMY.categories));
const CATEGORY_SOURCE = {
  'professional-audience': [SITE + '/roles/'],
  'job-title': ['https://www.onetcenter.org/database.html', 'https://www.bls.gov/soc/2018/home.htm'],
  occupation: ['https://www.onetcenter.org/database.html', 'https://www.bls.gov/soc/2018/home.htm'],
  industry: ['https://www.census.gov/naics/'],
  skill: ['https://esco.ec.europa.eu/en/classification/skills', 'https://esco.ec.europa.eu/en/use-esco', 'https://www.onetcenter.org/database.html'],
  qualification: ['https://www.gov.uk/find-a-regulated-qualification', 'https://register-api.ofqual.gov.uk', 'https://downloads.find-a-qualification.services.ofqual.gov.uk/extracts/Qualifications.csv'],
  'professional-term': ['https://esco.ec.europa.eu/en/classification/skills', 'https://esco.ec.europa.eu/en/use-esco'],
  'job-function': [SITE + '/roles/'],
  'seniority-level': [SITE + '/career-strategy-senior-leaders.html'],
  'employment-type': [...new Set(SIX_TAXONOMY.categories['employment-type'].flatMap((record) => record.sourceUrls || []))],
  'career-challenge': [SITE + '/faqs.html'],
  'career-search-intent': [],
  faq: ['https://www.kovcareeragency.org/faqs.html'],
  language: ['https://www.iso.org/standard/74575.html', 'https://www.loc.gov/standards/iso639-2/'],
  country: ['https://www.kovcareeragency.org/data/kov-discovery-catalog.jsonld'],
  city: ['https://simplemaps.com/data/world-cities', 'https://simplemaps.com/data/license', 'https://download.geonames.org/export/dump/cities1000.zip'],
  'town-locality': ['https://download.geonames.org/export/dump/cities1000.zip'],
  institution: ['https://www.wikidata.org/w/api.php', 'https://www.wikidata.org/wiki/Wikidata:Licensing'],
};
const TARGET = Object.fromEntries(Object.entries(CATEGORY).map(([key, value]) => [key, value[2]]));
const CATEGORY_NAME = Object.fromEntries(Object.entries(CATEGORY).map(([key, value]) => [key, value[1]]));
const FAQ_SOURCE = require('../assets/faq-directory.js').faqDirectory;
const FAQ_BY_QUESTION = new Map(FAQ_SOURCE.map((item) => [norm(item.question), item]));
const ROLE_SOURCE = require('../assets/role-taxonomy.js').kovRoleTaxonomy;
const INDUSTRY_SOURCE = require('../assets/industry-directory.js').industryDirectory;
const ESCO_SOURCE = require('../assets/esco-taxonomy.js');
const { buildTaxonomies } = require('./lib/verified-expanded-taxonomy');
const VERIFIED_TAXONOMIES = buildTaxonomies();
const QUALIFICATION_SOURCE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taxonomy/ofqual-active-qualifications.json'), 'utf8'));
const QUALIFICATION_RECORDS = QUALIFICATION_SOURCE.records;
const ONET_SOURCE_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taxonomy/onet-chief-executives-skills.json'), 'utf8'));
const ONET_SKILL_SOURCE = ONET_SOURCE_DATA.records;
const LANGUAGE_SOURCE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taxonomy/languages.json'), 'utf8')).records;
const DISCOVERY_GRAPH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/kov-discovery-catalog.jsonld'), 'utf8'))['@graph'];
const SEO_GRAPH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seo-entity-datasets.jsonld'), 'utf8'))['@graph'];
const SEO_BY_ID = new Map(SEO_GRAPH.map((node) => [node['@id'], node]));
function linkedSourceRecords(graph, suffix) {
  const dataset = graph.find((node) => String(node['@id'] || '').endsWith(suffix));
  const byId = new Map(graph.map((node) => [node['@id'], node]));
  return (dataset?.about || []).map((ref) => byId.get(ref['@id'])).filter(Boolean);
}
const TOWN_SOURCE = linkedSourceRecords(SEO_GRAPH, '#towns');
const INSTITUTION_SOURCE = linkedSourceRecords(SEO_GRAPH, '#institutions');
const COUNTRY_SOURCE = DISCOVERY_GRAPH.filter((node) => node['@type'] === 'Country');
const QUALIFICATION_BY_UNIQUE_NAME = new Map();
const DUPLICATE_QUALIFICATION_NAMES = new Set();
for (const record of QUALIFICATION_RECORDS) {
  const key = norm(record.name);
  if (QUALIFICATION_BY_UNIQUE_NAME.has(key)) DUPLICATE_QUALIFICATION_NAMES.add(key);
  else QUALIFICATION_BY_UNIQUE_NAME.set(key, record);
}
for (const key of DUPLICATE_QUALIFICATION_NAMES) QUALIFICATION_BY_UNIQUE_NAME.delete(key);
const SOURCE_LOOKUPS = {
  occupation: new Map(ROLE_SOURCE.occupations.map((name) => [norm(name), { name }])),
  industry: new Map(INDUSTRY_SOURCE.map((item) => [`${norm(item.code)} — ${norm(item.name)}`, item])),
  skill: new Map([
    ...ESCO_SOURCE.skillDirectory.map((item) => [norm(item.name), item]),
    ...ONET_SKILL_SOURCE.map((item) => [norm(item.metadataValue), item]),
  ]),
  language: new Map(LANGUAGE_SOURCE.map((item) => [norm(item.name), item])),
  country: new Map(COUNTRY_SOURCE.map((item) => [norm(item.name), item])),
  'town-locality': new Map(TOWN_SOURCE.map((item) => [norm(item.name), item])),
  institution: new Map(INSTITUTION_SOURCE.map((item) => [norm(item.name), item])),
  qualification: QUALIFICATION_BY_UNIQUE_NAME,
};
function homepageSourceRecords(category) {
  if (SIX_TAXONOMY.categories[category]) {
    return SIX_TAXONOMY.categories[category].map((record) => ({
      name: category, value: record.name,
      source: Object.assign({}, record, {
        '@id': CATALOG + '/' + CATEGORY[category][0] + '-' + digest(record.id),
      }),
    }));
  }
  if (category === 'occupation') return ROLE_SOURCE.occupations.map((value) => ({ name: category, value }));
  if (category === 'industry') return INDUSTRY_SOURCE.map((record) => ({ name: category, value: `${record.code} — ${record.name}`, source: record }));
  if (category === 'skill') {
    const values = new Map();
    for (const item of ESCO_SOURCE.skillDirectory) {
      const relation = ONET_SKILL_SOURCE.find((record) => norm(record.metadataValue) === norm(item.name)
        || item.alternativeLabels?.some((label) => norm(label) === norm(record.onetLabel)));
      const source = relation ? { ...item, metadataValue: item.name, onetLabel: relation.onetLabel, importance: relation.importance, metadataCrosswalk: relation.metadataCrosswalk, onetSourceUrl: ONET_SOURCE_DATA.sourceUrl } : item;
      values.set(norm(item.name), { name: category, value: item.name, source });
    }
    for (const item of ONET_SKILL_SOURCE) if (!values.has(norm(item.metadataValue))) values.set(norm(item.metadataValue), { name: category, value: item.metadataValue, source: item });
    return [...values.values()];
  }
  if (category === 'faq') return FAQ_SOURCE.flatMap((item) => [{ name: 'faq-question', value: item.question }, { name: 'faq-answer', value: item.answer, source: item }]);
  if (category === 'language') return LANGUAGE_SOURCE.map((record) => ({ name: category, value: record.name, source: record }));
  if (category === 'country') return COUNTRY_SOURCE.map((record) => ({ name: category, value: record.name, source: record }));
  if (category === 'town-locality') return TOWN_SOURCE.map((record) => ({ name: category, value: record.name, source: record }));
  if (category === 'institution') return INSTITUTION_SOURCE.map((record) => ({ name: category, value: record.name, source: record }));
  if (category === 'qualification') return QUALIFICATION_RECORDS.map((record) => ({ name: category, value: record.name, source: record }));
  return null;
}

function readAssignedJsonArray(filePath, variableName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const declaration = new RegExp('(?:const|let|var)\\s+' + variableName + '\\s*=\\s*');
  const match = declaration.exec(source);
  if (!match) throw new Error('Missing ' + variableName + ' array in ' + filePath);
  const start = source.indexOf('[', match.index + match[0].length);
  if (start < 0) throw new Error('Missing array opening bracket for ' + variableName);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '[') depth += 1;
    else if (char === ']') {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(start, index + 1));
    }
  }
  throw new Error('Unterminated ' + variableName + ' JSON array in ' + filePath);
}

function fullCatalogueRecords(category) {
  if (SIX_TAXONOMY.categories[category]) return SIX_TAXONOMY.categories[category];
  if (category === 'job-title') {
    const sourcePath = path.join(ROOT, 'town-role-insitutution/KOV_Job_Titles_Expanded_98380.txt');
    return fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/).map((value) => value.trim()).filter(Boolean).map((name) => ({ name }));
  }
  if (category === 'occupation') return ROLE_SOURCE.occupations.map((name) => ({ name }));
  if (category === 'industry') return INDUSTRY_SOURCE;
  if (category === 'skill') return homepageSourceRecords(category).map((record) => record.source || { name: record.value });
  if (category === 'qualification') return QUALIFICATION_RECORDS;
  if (category === 'professional-term') return VERIFIED_TAXONOMIES.professionalSynonymDirectory;
  if (category === 'faq') return FAQ_SOURCE;
  if (category === 'language') return LANGUAGE_SOURCE;
  if (category === 'country') return COUNTRY_SOURCE;
  if (category === 'city') {
    return readAssignedJsonArray(path.join(ROOT, 'assets/world-cities.js'), 'worldCities');
  }
  if (category === 'town-locality') return TOWN_SOURCE;
  if (category === 'institution') return INSTITUTION_SOURCE;
  throw new Error('No complete catalogue source configured for ' + category);
}

function writeCatalogueAssets(outputRoot, expectedCounts) {
  const directory = path.join(outputRoot, 'data/catalogues');
  fs.mkdirSync(directory, { recursive: true });
  let compressedBytes = 0;
  const packages = [];
  for (const category of ALL_CATEGORIES) {
    const records = fullCatalogueRecords(category);
    if (!Array.isArray(records) || records.length !== expectedCounts[category]) {
      throw new Error(
        category + ' catalogue source count mismatch: expected ' + expectedCounts[category]
        + ', found ' + (Array.isArray(records) ? records.length : 'non-array')
      );
    }
    const slug = CATEGORY[category][0];
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: CATEGORY_NAME[category],
      identifier: SITE + '/data/catalogues/' + slug + '.json',
      recordCount: records.length,
      records,
    };
    const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(payload), 'utf8'), {
      level: 9, mtime: 0,
    });
    const maxBytes = 25 * 1024 * 1024;
    if (compressed.length > maxBytes) {
      throw new Error(slug + ' compressed catalogue exceeds Cloudflare Pages 25 MiB limit: ' + compressed.length);
    }
    fs.writeFileSync(path.join(directory, slug + '.json.gz'), compressed);
    compressedBytes += compressed.length;
    packages.push({ category, slug, records: records.length, compressedBytes: compressed.length });
  }
  return { packages, compressedBytes };
}

function norm(value) { return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en'); }
function digest(value) { return crypto.createHash('sha256').update(norm(value)).digest('hex').slice(0, 24); }
function decode(value) {
  return value.replace(/&(?:amp|quot|apos|#39|lt|gt);/gi, (entity) => ({
    '&amp;': '&', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&lt;': '<', '&gt;': '>',
  }[entity.toLowerCase()]));
}
function safeJson(value) {
  // Compact JSON-LD without dropping or changing any graph nodes or properties.
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
function canonicalFor(html, file) {
  const tag = html.match(/<link\b(?=[^>]*\brel\s*=\s*(["'])canonical\1)[^>]*>/i)?.[0];
  const href = tag?.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
  if (href) return new URL(href, `${SITE}/`).href;
  const clean = file.replace(/\\/g, '/').replace(/(?:^|\/)index\.html$/i, '');
  return clean ? `${SITE}/${clean}` : SITE;
}
function titleFor(html) {
  return html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
}
function sourceCitation(category) {
  return CATEGORY_SOURCE[category] || [];
}
function metaRecords(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
  if (!head) throw new Error('Page has no head element.');
  const found = Object.fromEntries(ALL_CATEGORIES.map((key) => [key, []]));
  const tagRE = /<meta\b[^>]*>/gi;
  for (const match of head[1].matchAll(tagRE)) {
    const tag = match[0];
    const name = tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase();
    if (NAMES.includes(name)) {
      const value = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
      if (value == null) throw new Error(`Metadata ${name} has no content.`);
      const category = name === 'faq-question' || name === 'faq-answer' ? 'faq' : name;
      found[category].push({ name, value: decode(value) });
    }
  }
  return { head: head[1], found };
}
function uniqueByValue(records) {
  const seen = new Set();
  return records.filter(({ value }) => {
    const key = norm(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function typeFor(category) {
  return ({
    'professional-audience': ['Audience', 'DefinedTerm'], occupation: ['Occupation', 'DefinedTerm'],
    country: ['Country', 'DefinedTerm'], city: ['City', 'DefinedTerm'],
    'town-locality': ['Place', 'DefinedTerm'], institution: ['Organization', 'DefinedTerm'],
  })[category] || 'DefinedTerm';
}
function nodeFor(category, record, datasetId, faqIndex) {
  if (category === 'faq') {
    const question = record.name === 'faq-question' ? record.value : '';
    const answerRecord = faqIndex.get(norm(question));
    if (!question || !answerRecord) return null;
    return {
      '@type': 'Question', '@id': `${CATALOG}/faq-${digest(question)}`,
      name: question, text: question,
      acceptedAnswer: { '@type': 'Answer', text: answerRecord.value },
      isPartOf: { '@id': datasetId },
    };
  }
  const raw = record.value;
  const source = record.source || SOURCE_LOOKUPS[category]?.get(norm(raw));
  const node = { '@type': typeFor(category), '@id': source?.['@id'] || `${CATALOG}/${CATEGORY[category][0]}-${digest(raw)}`, name: raw, inDefinedTermSet: { '@id': datasetId } };
  if (source?.description) node.description = source.description;
  if (source?.identifier) node.identifier = source.identifier;
  if (source?.id && !source?.identifier) {
    node.identifier = source.id;
    if (/^https?:\/\//i.test(source.id)) node.sameAs = source.id;
  }
  if (source?.sourceUrl) node.url = source.sourceUrl;
  if (source?.sourceUrls?.length || source?.sourcePaths?.length || source?.sourcePath) {
    const provenance = source.sourceUrls?.length ? source.sourceUrls.join('; ')
      : source.sourcePaths?.length ? source.sourcePaths.join('; ') : source.sourcePath;
    node.description = (node.description ? node.description + ' ' : '') + 'Record provenance: ' + provenance + '.';
  }
  if (source?.sourceQuestion) {
    node.description = (node.description ? node.description + ' ' : '') + 'Source FAQ question: ' + source.sourceQuestion;
  }
  if (source?.relatedRole || source?.relatedIndustry) {
    node.description = (node.description ? node.description + ' ' : '') + 'Mapped role: ' + (source.relatedRole || 'not specified') + '; mapped industry: ' + (source.relatedIndustry || 'not specified') + '.';
  }
  if (source?.relatedRoleSlugs?.length) {
    node.description = (node.description ? node.description + ' ' : '') + 'Related KOV role directories: ' + source.relatedRoleSlugs.join(', ') + '.';
  }
  if (source?.dimension) {
    node.description = (node.description ? node.description + ' ' : '') + 'Classification dimension: ' + source.dimension + '.';
  }
  if (source?.methodology) {
    node.description = (node.description ? node.description + ' ' : '') + 'Classification method: ' + source.methodology;
  }
  if (source?.keywordSource || source?.searchVolumeStatus) {
    node.description = (node.description ? node.description + ' ' : '') + 'Keyword evidence: ' + (source.keywordSource || 'documented editorial research') + '; search-volume status: ' + (source.searchVolumeStatus || 'not available') + '.';
  }
  if (source?.sourceType === 'editorial_hypothesis') {
    node.description = (node.description ? node.description + ' ' : '') + 'Evidence classification: editorial search-intent hypothesis; not an observed Search Console query.';
  }
  if (source?.sameAs) node.sameAs = source.sameAs;
  if (source?.url) node.url = source.url;
  if (source?.geo) node.geo = source.geo;
  if (source?.containedInPlace && category !== 'city') node.containedInPlace = source.containedInPlace;
  if (source?.alternativeLabels?.length) node.alternateName = source.alternativeLabels;
  if (source?.status) node.description = `${node.description ? `${node.description} ` : ''}ESCO concept status: ${source.status}.`;
  if (source?.metadataValue) {
    node.identifier = { '@type': 'PropertyValue', propertyID: 'O*NET skill label', value: source.onetLabel };
    node.subjectOf = { '@type': 'WebPage', '@id': source.onetSourceUrl || ONET_SOURCE_DATA.sourceUrl };
    node.description = `${node.description ? `${node.description} ` : ''}O*NET importance rating: ${source.importance}.${source.metadataCrosswalk ? ` Crosswalk: ${source.metadataCrosswalk}.` : ''}`;
  }
  if (category === 'professional-audience') node.audienceType = raw;
  if (category === 'qualification' && source) {
    node.termCode = source.code;
    node.identifier = { '@type': 'PropertyValue', propertyID: 'Ofqual qualification number', value: source.code };
    node.subjectOf = {
      '@type': 'DataDownload',
      contentUrl: QUALIFICATION_SOURCE.source.downloadUrl,
      name: 'Official Ofqual active-qualifications source download',
    };
    node.description = [source.level, source.qualificationType, source.subjectArea].filter(Boolean).join('; ');
    if (source.specificationUrl) node.url = source.specificationUrl;
  }
  if (category === 'city') {
    const [cityName, ...locationParts] = raw.split(',').map((part) => part.trim());
    node.name = cityName;
    if (locationParts.length) node.alternateName = raw;
    node.description = 'City label from the retained source record. Administrative and country relationships are not asserted here because some source rows do not have validated division mappings.';
  }
  if (category === 'industry') {
    const match = raw.match(/^([^\s—-]+)\s+[—-]\s+(.+)$/);
    if (match) { node.termCode = match[1]; node.name = match[2]; }
  }
  if (category === 'language' && source?.code) node.identifier = { '@type': 'PropertyValue', propertyID: 'ISO 639 language code', value: source.code };
  if (category === 'institution' && /^Q\d+$/.test(String(source?.identifier || ''))) node.sameAs = `https://www.wikidata.org/wiki/${source.identifier}`;
  if (category === 'language' && /^https?:\/\//.test(raw)) node.url = raw;
  return node;
}
function descriptions(globalRecords) {
  const counts = {};
  for (const category of ALL_CATEGORIES) counts[category] = globalRecords[category].length;
  counts.faq = Math.min(counts.faq, uniqueByValue(globalRecords.faq.filter((r) => r.name === 'faq-question')).length);
  return counts;
}
function buildGraph(existing, records, isHome, counts, file, canonical, pageTitle, eligible) {
  const prefix = 'urn:kov:career-agency:metadata#';
  const termSetSuffixes = ALL_CATEGORIES.flatMap((category) => [`/set-${CATEGORY[category][0]}`, `#set-${CATEGORY[category][0]}`]);
  const isCatalogRecord = (node) => termSetSuffixes.some((suffix) => (node.inDefinedTermSet?.['@id'] || '').endsWith(suffix))
    || termSetSuffixes.some((suffix) => (node.isPartOf?.['@id'] || '').endsWith(suffix))
    || (node['@type'] === 'Question' && /(?:\/|#)dataset-faqs$/.test(node.isPartOf?.['@id'] || ''));
  const taxonomyIds = new Set(existing.filter(isCatalogRecord).map((node) => node['@id']).filter(Boolean));
  const graph = existing.filter((node) => !String(node['@id'] || '').startsWith(prefix) && !String(node['@id'] || '').startsWith(CATALOG) && !isCatalogRecord(node));
  // Remove legacy references to unverified target-shaped taxonomy nodes while retaining every unrelated node.
  for (const node of graph) {
    for (const key of ['mentions', 'hasPart', 'dataset', 'about', 'mainEntity', 'subjectOf']) {
      if (Array.isArray(node[key])) node[key] = node[key].filter((ref) => !String(ref?.['@id'] || '').startsWith(prefix) && !String(ref?.['@id'] || '').startsWith(CATALOG) && !taxonomyIds.has(ref?.['@id']));
      else if (String(node[key]?.['@id'] || '').startsWith(prefix) || String(node[key]?.['@id'] || '').startsWith(CATALOG) || taxonomyIds.has(node[key]?.['@id'])) delete node[key];
    }
  }
  const catalogId = isHome || eligible ? CATALOG : `${CATALOG}/page-${digest(file)}`;
  const local = [];
  const datasets = [];
  const termSets = [];
  for (const category of ALL_CATEGORIES) {
    const fromSource = isHome ? homepageSourceRecords(category) : null;
    const mappedSourceRecords = !isHome && SIX_TAXONOMY.categories[category]
      ? SIX_TAXONOMY.categories[category].filter((record) => record.pagePaths.includes(file)).map((record) => ({
        name: category, value: record.name,
        source: Object.assign({}, record, {
          '@id': CATALOG + '/' + CATEGORY[category][0] + '-' + digest(record.id),
        }),
      }))
      : [];
    const present = category === 'faq' && fromSource
      ? fromSource
      : fromSource || uniqueByValue([...(records[category] || []), ...mappedSourceRecords]);
    const globalCount = counts[category];
    const title = CATEGORY_NAME[category];
    const id = `${catalogId}/dataset-${CATEGORY[category][0]}`;
    const includeGlobal = isHome || eligible;
    const includePage = !includeGlobal && present.length > 0;
    if (!includeGlobal && !includePage) continue;
    let detail;
    if (includeGlobal) {
      detail = `Record rows in the retained local source snapshot: ${globalCount}. Approved target: ${TARGET[category]}.`;
      if (!globalCount && TARGET[category]) detail += ` Verified record-level sources present: 0; the target is not met.`;
      if (category === 'occupation') detail += ' Record-level source lineage is not attached; these are retained local taxonomy entries.';
      if (category === 'industry') detail += ' U.S. NAICS 2022 classification records; not a global industry register.';
      if (category === 'qualification') detail += ` Ofqual Register records with status “Available to learners” in England and Northern Ireland; ${QUALIFICATION_SOURCE.source.rawRows} source rows were screened, with one record per unique qualification number. ${QUALIFICATION_SOURCE.source.duplicateTitlesWithDistinctIdentifiers} title duplicates have distinct official qualification numbers. Retrieved ${QUALIFICATION_SOURCE.source.retrievedOn}; this is not a global qualifications register.`;
      if (category === 'skill') detail += ' 560 ESCO concepts plus 23 O*NET skill labels; the O*NET set contains 24 role relations.';
      if (category === 'professional-term') detail += ' ESCO alternative labels retaining their language codes.';
      if (category === 'job-title') detail += ' The count is validated against the supplied local file; individual title provenance is not attached, and older project source notes document conflicting smaller counts.';
      if (category === 'professional-term') detail += ' ESCO alternative labels retaining their language codes; the local validator confirms 50,000 unique language/term records.';
      if (category === 'city') detail += ' 50,249 SimpleMaps Basic World Cities 2026 records plus one deduplicated GeoNames record. The row count is validated; some city-to-administrative-area relationships remain unresolved.';
      if (category === 'town-locality') detail += ' GeoNames populated-place candidates; no universal legal town classification is asserted.';
      if (category === 'institution') detail += ' Selected English-language Wikidata organization/institution search results, not an exhaustive worldwide register; verify current details at each Wikidata entity.';
      if (category === 'faq') detail += ' Existing site FAQ entries with source page paths retained in the FAQ directory.';
      if (category === 'occupation') detail += ' The local row count and uniqueness are validated; the source snapshot has no attached record-level provenance.';
      if (SIX_CATEGORIES.has(category)) {
        const assessmentKey = ({
          'professional-audience': 'audiences', 'job-function': 'jobFunctions',
          'seniority-level': 'seniorityLevels', 'employment-type': 'employmentTypes',
          'career-challenge': 'careerChallenges', 'career-search-intent': 'careerSearchIntents',
        })[category];
        detail += ' ' + SIX_TAXONOMY.sourceAssessment[assessmentKey];
        if (globalCount < TARGET[category]) detail += ' Verified target gap: ' + (TARGET[category] - globalCount) + ' record(s).';
        if (globalCount > TARGET[category]) detail += ' The verified local set exceeds the requested target by ' + (globalCount - TARGET[category]) + ' source-backed record(s); no records were discarded to force the target.';
        detail += ' Per-record identifiers, source paths, citations, classification type and page mappings are retained in the published taxonomy distribution.';
      }
    } else {
      detail = `${present.length} page-associated ${title.toLocaleLowerCase('en')} record${present.length === 1 ? '' : 's'} represented from the page-specific source metadata; this is not the global collection count.`;
    }
    const dataset = {
      '@type': 'Dataset', '@id': id, name: title, description: detail,
      citation: sourceCitation(category),
      includedInDataCatalog: { '@id': catalogId },
    };
    if (SIX_CATEGORIES.has(category)) {
      dataset.distribution = {
        '@type': 'DataDownload',
        contentUrl: SITE + '/data/taxonomy/kov-six-category-taxonomies.json',
        encodingFormat: 'application/json',
        name: 'KOV six-category taxonomy snapshot with record provenance',
      };
      dataset.creator = category === 'employment-type'
        ? [{ '@type': 'Organization', name: 'International Labour Organization' }, { '@type': 'Organization', name: 'KOV Career Agency' }]
        : { '@type': 'Organization', name: 'KOV Career Agency' };
    }
    if (category === 'industry') dataset.creator = { '@type': 'Organization', name: 'U.S. Census Bureau' };
    if (category === 'qualification') {
      dataset.creator = { '@type': 'Organization', name: 'Office of Qualifications and Examinations Regulation (Ofqual)' };
      dataset.license = QUALIFICATION_SOURCE.source.license;
      dataset.distribution = { '@type': 'DataDownload', contentUrl: `${SITE}/data/taxonomy/ofqual-active-qualifications.json`, encodingFormat: 'application/json', name: 'KOV normalized active Ofqual qualification records' };
      dataset.dateModified = QUALIFICATION_SOURCE.source.retrievedOn;
    }
    if (category === 'skill' || category === 'professional-term') dataset.creator = { '@type': 'Organization', name: 'European Commission (ESCO)' };
    if (category === 'city') {
      dataset.creator = [{ '@type': 'Organization', name: 'SimpleMaps' }, { '@type': 'Organization', name: 'GeoNames' }];
      dataset.license = 'https://creativecommons.org/licenses/by/4.0/';
    }
    if (category === 'town-locality') {
      dataset.creator = { '@type': 'Organization', name: 'GeoNames' };
      dataset.license = 'https://creativecommons.org/licenses/by/4.0/';
    }
    if (includeGlobal) {
      const catalogueUrl = `${SITE}/data/catalogues/${CATEGORY[category][0]}.json`;
      const fullCatalogueDownload = {
        '@type': 'DataDownload',
        contentUrl: catalogueUrl,
        encodingFormat: 'application/json',
        name: `Complete ${title} catalogue (${globalCount} records)`,
      };
      const previousDistributions = dataset.distribution == null
        ? []
        : Array.isArray(dataset.distribution) ? dataset.distribution : [dataset.distribution];
      dataset.distribution = [...previousDistributions, fullCatalogueDownload];
    }
    datasets.push(dataset);
    const setId = `${catalogId}/set-${CATEGORY[category][0]}`;
    const terms = [];
    if (category === 'faq') {
      const questions = present.filter((r) => r.name === 'faq-question');
      const answers = present.filter((r) => r.name === 'faq-answer');
      const answerMap = new Map(answers.map((answer, i) => [i, answer]));
      const qSeen = new Set();
      questions.forEach((question, index) => {
        if (qSeen.has(norm(question.value))) return;
        qSeen.add(norm(question.value));
        const sourceFaq = FAQ_BY_QUESTION.get(norm(question.value));
        const answer = sourceFaq?.answer || answerMap.get(index)?.value;
        if (!answer) return;
        local.push({ '@type': 'Question', '@id': `${catalogId}/faq-${digest(question.value)}`, name: question.value, text: question.value, acceptedAnswer: { '@type': 'Answer', text: answer }, citation: sourceFaq?.source ? `${SITE}${sourceFaq.source}` : undefined, isPartOf: { '@id': id } });
        terms.push({ '@id': `${catalogId}/faq-${digest(question.value)}` });
      });
    } else if (!LARGE_CATEGORIES.has(category)) {
      for (const record of present) {
        const node = nodeFor(category, record, setId);
        if (!node) continue;
        local.push(node);
        terms.push({ '@id': node['@id'] });
      }
    } else if (!isHome) {
      for (const record of present) {
        const node = nodeFor(category, record, setId);
        if (node) { local.push(node); terms.push({ '@id': node['@id'] }); }
      }
    }
    if (terms.length && category === 'faq') {
      datasets[datasets.length - 1].hasPart = terms;
    } else if (terms.length) {
      termSets.push({ '@type': 'DefinedTermSet', '@id': setId, name: title, hasDefinedTerm: terms });
      datasets[datasets.length - 1].hasPart = { '@id': setId };
    }
  }
  if (datasets.length) {
    local.unshift({ '@type': 'DataCatalog', '@id': catalogId, name: 'KOV Career Agency verified metadata catalog', description: 'Metadata records represented on this page. Dataset descriptions report verified local record counts and identify unmet targets without claiming records that are not present.', hasPart: datasets.map((dataset) => ({ '@id': dataset['@id'] })) });
    local.unshift(...datasets);
    local.push(...termSets);
  }
  const isWebPageNode = (node) => node['@type'] === 'WebPage' || node['@type']?.includes?.('WebPage');
  // Prefer the existing WebPage that already represents this page's canonical URL.
  // Some staged/public pages retain an older WebPage node for their previous path.
  // Selecting the first WebPage blindly can overwrite its ID and collide with the
  // separate current-page node.
  const pageNode = canonical && (
    graph.find((node) => isWebPageNode(node) && (node.url === canonical || node['@id'] === `${canonical}#webpage`))
    || graph.find(isWebPageNode)
  );
  if (pageNode) {
      const previousPageId = pageNode['@id'];
      pageNode['@id'] = `${canonical}#webpage`;
      pageNode.url = canonical;
      if (pageTitle) pageNode.name = pageTitle;
      for (const node of graph) {
        for (const key of ['mainEntityOfPage', 'isPartOf', 'about', 'mainEntity']) {
          const value = node[key];
          if (Array.isArray(value)) node[key] = value.map((ref) => ref?.['@id'] === previousPageId ? { ...ref, '@id': pageNode['@id'] } : ref);
          else if (value?.['@id'] === previousPageId) node[key] = { ...value, '@id': pageNode['@id'] };
        }
      }
      if (datasets.length) {
        const about = pageNode.about == null ? [] : Array.isArray(pageNode.about) ? pageNode.about : [pageNode.about];
        const keys = new Set(about.map((value) => value?.['@id'] || JSON.stringify(value)));
        pageNode.about = [...about, ...datasets.map((dataset) => ({ '@id': dataset['@id'] })).filter((ref) => !keys.has(ref['@id']))];
      }
      const localReferences = local
        .filter((node) => !['DataCatalog', 'Dataset', 'DefinedTermSet'].includes(node['@type']) && node['@id'])
        .map((node) => ({ '@id': node['@id'] }));
      if (localReferences.length) {
        const mentions = pageNode.mentions == null ? [] : Array.isArray(pageNode.mentions) ? pageNode.mentions : [pageNode.mentions];
        const mentionedIds = new Set(mentions.map((value) => value?.['@id']));
        pageNode.mentions = [...mentions, ...localReferences.filter((ref) => !mentionedIds.has(ref['@id']))];
      }
  }
  return [...graph, ...local];
}
function parseExisting(html) {
  const match = html.match(new RegExp(`<script\\b(?=[^>]*${MARKER})[^>]*>([\\s\\S]*?)<\\/script\\s*>`, 'i'));
  if (!match) return { nodes: [], oldScript: null };
  try {
    const object = JSON.parse(match[1]);
    return { nodes: Array.isArray(object['@graph']) ? object['@graph'] : [object], oldScript: match[0] };
  } catch (error) { throw new Error(`Cannot parse existing KOV JSON-LD: ${error.message}`); }
}
function hydratedRecords(file, tagRecords, existingNodes) {
  const found = Object.fromEntries(ALL_CATEGORIES.map((category) => [category, [...(tagRecords[category] || [])]]));
  const sets = new Map(ALL_CATEGORIES.flatMap((category) => [[`/set-${CATEGORY[category][0]}`, category], [`#set-${CATEGORY[category][0]}`, category]]));
  for (const node of existingNodes) {
    const setReference = node.inDefinedTermSet?.['@id'] || '';
    const partReference = node.isPartOf?.['@id'] || '';
    const category = [...sets].find(([suffix]) => setReference.endsWith(suffix))?.[1]
      || [...sets].find(([suffix]) => partReference.endsWith(suffix))?.[1]
      || (/(?:\/|#)dataset-faqs$/.test(partReference) ? 'faq' : undefined);
    if (!category) continue;
    if (category === 'faq') {
      if (node['@type'] !== 'Question' || !node.acceptedAnswer?.text) continue;
      found.faq.push({ name: 'faq-question', value: node.name || node.text });
      found.faq.push({ name: 'faq-answer', value: node.acceptedAnswer.text });
      continue;
    }
    let value = node.name || node.audienceType || '';
    if (category === 'city') value = node.alternateName || value;
    if (category === 'industry' && node.termCode) value = `${node.termCode} — ${value}`;
    if (value) found[category].push({ name: category, value });
  }
  // Large collections are intentionally summaries, so restore their validated raw-row counts from the existing summary descriptions.
  if (file === 'index.html' && found['job-title'].length === 0) {
    const priorDatasets = new Map(existingNodes.filter((node) => node['@type'] === 'Dataset').map((node) => [node['@id'], node]));
    for (const category of ALL_CATEGORIES) {
      const id = `${CATALOG}/dataset-${CATEGORY[category][0]}`;
      const description = priorDatasets.get(id)?.description || '';
      const match = description.match(/(?:Record rows in the retained local source snapshot: |Verified record-level sources present: )([\d,]+)|([\d,]+) verified local record/);
      if (match && !found[category].length) {
        const count = Number((match[1] || match[2]).replace(/,/g, ''));
        if (LARGE_CATEGORIES.has(category)) found[category] = Array.from({ length: count }, (_, i) => ({ name: category, value: `__summary_row_${i + 1}` }));
      }
    }
  }
  return found;
}
function countsFromPublishedSummary(nodes) {
  const datasets = new Map(nodes.filter((node) => node['@type'] === 'Dataset').map((node) => [node['@id'], node]));
  const counts = {};
  for (const category of ALL_CATEGORIES) {
    const id = `${CATALOG}/dataset-${CATEGORY[category][0]}`;
    const oldId = `${CATALOG}#dataset-${CATEGORY[category][0]}`;
    const description = datasets.get(id)?.description || datasets.get(oldId)?.description || '';
    const match = description.match(/(?:Record rows in the retained local source snapshot|Verified record-level sources present): ([\d,]+)|([\d,]+) verified local record/);
    counts[category] = match ? Number((match[1] || match[2]).replace(/,/g, '')) : 0;
  }
  return counts;
}
function escapeScript(html, nodes) {
  const tag = `<script type="application/ld+json" ${MARKER}>${safeJson({ '@context': 'https://schema.org', '@graph': nodes })}</script>`;
  const withoutGenerated = html.replace(/<script\b(?=[^>]*data-kov="discovery")[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  // Keep the complete graph, but place it after normal metadata at the end of HEAD.
  return withoutGenerated.replace(/<\/head\s*>/i, `${tag}\n</head>`);
}
function removeTaxonomyTags(html) {
  return html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i, (all, open, head, close) => {
    const names = NAMES.join('|');
    const cleaned = head.replace(new RegExp(`<meta\\b(?=[^>]*\\bname\\s*=\\s*(["'])(?:${names})\\1)[^>]*>\\s*`, 'gi'), '');
    return `${open}${cleaned.replace(/<!--\s*KOV (?:global|page-specific) descriptive metadata[^>]*-->/gi, '')}${close}`;
  });
}
function tagValues(html, expression) { return [...html.matchAll(expression)].map((match) => match[0]); }
function validateRendered(file, before, after, categoryCounts, isHome, eligible) {
  const extractHead = (html) => html.match(/(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i);
  const managedHeadContent = (html) => {
    const match = extractHead(html);
    if (!match) throw new Error(`Missing HEAD during preservation validation: ${file}`);
    let content = match[2];
    const generatedScript = new RegExp(`<script\\b(?=[^>]*${MARKER})[^>]*>[\\s\\S]*?<\\/script\\s*>`, 'gi');
    content = content.replace(generatedScript, '');
    const taxonomyTags = new RegExp(`<meta\\b(?=[^>]*\\bname\\s*=\\s*(["'])(?:${NAMES.join('|')})\\1)[^>]*>\\s*`, 'gi');
    content = content.replace(taxonomyTags, '');
    content = content.replace(/<!--\s*KOV (?:global|page-specific) descriptive metadata[^>]*-->/gi, '');
    return match[1] + content.trimEnd() + match[3];
  };
  if (managedHeadContent(before) !== managedHeadContent(after)) {
    throw new Error(`Unrelated HEAD content changed (including social metadata, scripts, stylesheets or other attributes): ${file}`);
  }
  const outsideHead = (html) => {
    if (!extractHead(html)) throw new Error(`Missing HEAD during document preservation validation: ${file}`);
    return html.replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/i, '<!-- KOV_HEAD_BLOCK -->');
  };
  if (outsideHead(before) !== outsideHead(after)) {
    throw new Error(`HTML outside HEAD changed during metadata migration: ${file}`);
  }
  const body = (html) => html.match(/<body\b[^>]*>[\s\S]*?<\/body\s*>/i)?.[0] || '';
  if (body(before) !== body(after)) throw new Error(`Body markup changed during metadata migration: ${file}`);
  const customMeta = new RegExp(`<meta\\b(?=[^>]*\\bname\\s*=\\s*(["'])(?:${NAMES.join('|')})\\1)[^>]*>`, 'i');
  const nonTaxMeta = (html) => tagValues(html, /<meta\b[^>]*>/gi).filter((tag) => !customMeta.test(tag));
  const beforeMeta = nonTaxMeta(before);
  const afterMeta = nonTaxMeta(after);
  if (JSON.stringify(beforeMeta) !== JSON.stringify(afterMeta)) throw new Error(`Non-taxonomy meta tags changed: ${file}`);
  const canonRobots = (html) => tagValues(html, /<(?:link|meta)\b[^>]*(?:rel\s*=\s*(["'])(?:canonical|alternate)\1|name\s*=\s*(["'])robots\2)[^>]*>/gi);
  if (JSON.stringify(canonRobots(before)) !== JSON.stringify(canonRobots(after))) throw new Error(`Canonical or robots directives changed: ${file}`);
  const oldScripts = tagValues(before, /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>[\s\S]*?<\/script\s*>/gi).filter((tag) => !tag.includes(MARKER));
  const newScripts = tagValues(after, /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>[\s\S]*?<\/script\s*>/gi).filter((tag) => !tag.includes(MARKER));
  if (JSON.stringify(oldScripts) !== JSON.stringify(newScripts)) throw new Error(`Unrelated JSON-LD changed: ${file}`);
  if (customMeta.test(after)) throw new Error(`Project taxonomy meta remains after JSON-LD migration: ${file}`);
  const scripts = tagValues(after, new RegExp(`<script\\b(?=[^>]*${MARKER})[^>]*>[\\s\\S]*?<\\/script\\s*>`, 'gi'));
  if (scripts.length !== 1) throw new Error(`Expected one KOV JSON-LD script in ${file}; found ${scripts.length}`);
  const parsed = JSON.parse(scripts[0].replace(/^<script[^>]*>/i, '').replace(/<\/script\s*>$/i, ''));
  const graph = parsed['@graph'];
  if (!Array.isArray(graph)) throw new Error(`KOV JSON-LD graph missing on ${file}`);
  const ids = graph.map((node) => node['@id']).filter(Boolean);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate JSON-LD @id on ${file}`);
  if (eligible) {
    const canonical = canonicalFor(after, file);
    const isWebPageNode = (node) => node['@type'] === 'WebPage' || node['@type']?.includes?.('WebPage');
    const pageNode = graph.find((node) => isWebPageNode(node) && (node.url === canonical || node['@id'] === `${canonical}#webpage`))
      || graph.find(isWebPageNode);
    if (pageNode && pageNode.url !== canonical) throw new Error(`WebPage URL does not match canonical for ${file}`);
  }
  if (graph.some((node) => node.numberOfItems != null || /\brecordCount\b/i.test(JSON.stringify(node)))) throw new Error(`Unsupported numeric record-count field in ${file}`);
  if (graph.some((node) => String(node['@id'] || '').startsWith('urn:kov:career-agency:metadata#'))) throw new Error(`Legacy metadata graph node remains in ${file}`);
  if (eligible) {
    const datasetNodes = graph.filter((node) => node['@type'] === 'Dataset');
    const datasetIds = new Set(datasetNodes.map((node) => node['@id']));
    if (datasetIds.size !== ALL_CATEGORIES.length) {
      throw new Error('Active page must reference all 18 global catalogues; found ' + datasetIds.size + ': ' + file);
    }
    for (const category of ALL_CATEGORIES) {
      const slug = CATEGORY[category][0];
      const expectedUrl = SITE + '/data/catalogues/' + slug + '.json';
      const dataset = datasetNodes.find((node) => node['@id'] === CATALOG + '/dataset-' + slug);
      const distributions = dataset
        ? (Array.isArray(dataset.distribution) ? dataset.distribution : [dataset.distribution])
        : [];
      if (!distributions.some((item) => item?.contentUrl === expectedUrl)) {
        throw new Error('Active page is missing the full ' + category + ' catalogue download: ' + file);
      }
    }
  }
  if (isHome) {
    const datasetIds = new Set(graph.filter((node) => node['@type'] === 'Dataset').map((node) => node['@id']));
    if (datasetIds.size !== ALL_CATEGORIES.length) throw new Error(`Homepage needs ${ALL_CATEGORIES.length} global dataset summaries; found ${datasetIds.size}`);
    for (const [category, count] of Object.entries(categoryCounts)) {
      const id = `${CATALOG}/dataset-${CATEGORY[category][0]}`;
      const dataset = graph.find((node) => node['@id'] === id);
      const describedCount = dataset?.description.match(/(?:Record rows in the retained local source snapshot|Verified record-level sources present): ([\d,]+)/);
      if (!dataset || !describedCount || Number(describedCount[1].replace(/,/g, '')) !== count) throw new Error(`Homepage source count missing for ${category}`);
    }
  }
  return graph.length;
}
function filesFromOutputRoot(outputRoot) {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
        files.push(path.relative(outputRoot, fullPath).split(path.sep).join('/'));
      }
    }
  }
  if (!fs.existsSync(outputRoot) || !fs.statSync(outputRoot).isDirectory()) {
    throw new Error(`Cloudflare HTML output directory does not exist: ${outputRoot}`);
  }
  walk(outputRoot);
  return files.sort();
}
function hasNoindexDirective(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] || '';
  for (const match of head.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const name = tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase();
    if (!['robots', 'googlebot', 'bingbot'].includes(name)) continue;
    const content = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
    if (/(?:^|[,\s])noindex(?:$|[,\s])/i.test(content)) return true;
  }
  return false;
}
function main() {
  const dryRun = process.argv.includes('--dry-run');
  const reportChangedFiles = process.argv.includes('--report-changes');
  const rootArg = process.argv.indexOf('--root');
  if (rootArg >= 0 && !process.argv[rootArg + 1]) throw new Error('--root requires an output directory.');
  const outputRoot = path.resolve(ROOT, rootArg >= 0 ? process.argv[rootArg + 1] : 'dist');
  const files = filesFromOutputRoot(outputRoot);
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'PAGE_MANIFEST.json'), 'utf8'));
  const inventory = manifest.repository_html_inventory?.files || manifest.pages || [];
  const manifestPaths = new Set(inventory.map((page) => page.path.replace(/\\/g, '/')));
  // The Cloudflare build publishes only explicitly allowlisted staging paths.
  // Treat those allowlisted files as public; do not exclude the whole staging tree.
  const publicStagingPaths = new Set(
    fs.readFileSync(path.join(ROOT, 'scripts/staging-public-pages.txt'), 'utf8')
      .split(/\r?\n/)
      .map((value) => value.trim().replace(/\\/g, '/'))
      .filter(Boolean)
  );
  const eligiblePublic = (file, html) => {
    const firstSegment = file.split('/')[0].toLowerCase();
    if ((file.startsWith('staging/') && !publicStagingPaths.has(file)) || file.startsWith('_design-reference/') || file.startsWith('design-reference/') || firstSegment === 'private' || firstSegment === 'admin' || firstSegment.startsWith('private-') || firstSegment.startsWith('admin-') || firstSegment.startsWith('private_') || firstSegment.startsWith('admin_')) return false;
    // The manifest's historical "indexable" flag is not authoritative for current
    // publication eligibility. Every shipped public page is eligible unless its
    // actual robots/googlebot/bingbot directives explicitly contain noindex.
    return !hasNoindexDirective(html);
  };
  const homePath = 'index.html';
  if (!files.includes(homePath)) throw new Error('Homepage missing from Cloudflare output.');
  const publishedSet = new Set(files);
  const missingManifestPages = [...manifestPaths].filter((file) => !publishedSet.has(file)).sort();
  const unmanifestedPublishedPages = files.filter((file) => !manifestPaths.has(file));
  const original = new Map(files.map((file) => [file, fs.readFileSync(path.join(outputRoot, file), 'utf8')]));
  const recordsByFile = new Map();
  for (const [file, html] of original) {
    const tags = metaRecords(html).found;
    const { nodes } = parseExisting(html);
    recordsByFile.set(file, hydratedRecords(file, tags, nodes));
  }
  const globalRecords = recordsByFile.get(homePath);
  const globalTags = metaRecords(original.get(homePath)).found;
  const homeNodes = parseExisting(original.get(homePath)).nodes;
  const counts = Object.values(globalTags).some((records) => records.length)
    ? descriptions(globalTags)
    : countsFromPublishedSummary(homeNodes);
  counts.qualification = QUALIFICATION_RECORDS.length;
  counts.language = LANGUAGE_SOURCE.length;
  counts.institution = INSTITUTION_SOURCE.length;
  counts['professional-term'] = VERIFIED_TAXONOMIES.professionalSynonymDirectory.length;
  for (const category of SIX_CATEGORIES) counts[category] = SIX_TAXONOMY.categories[category].length;
  const issues = [];
  for (const category of ALL_CATEGORIES) {
    const actualCount = counts[category];
    if (actualCount > TARGET[category] && !['industry', 'skill', 'qualification', 'town-locality', 'institution'].includes(category) && !SIX_CATEGORIES.has(category)) issues.push(category + ' count ' + actualCount + ' exceeds approved target ' + TARGET[category]);
  }
  const catalogueAssets = writeCatalogueAssets(outputRoot, counts);
  const outputs = new Map();
  let jsonldNodes = 0;
  const summary = {
    pages: files.length,
    publishedHtmlPages: files.length,
    manifestInventoryPages: manifestPaths.size,
    manifestPagesPublished: files.length - unmanifestedPublishedPages.length,
    manifestPagesNotPublished: missingManifestPages.length,
    publishedPagesMissingFromManifest: unmanifestedPublishedPages.length,
    inventoryToBuildNetDifference: manifestPaths.size - files.length,
    indexablePublicPages: files.filter((file) => eligiblePublic(file, original.get(file))).length,
    manifestPagesNotPublishedList: missingManifestPages,
    publishedPagesMissingFromManifestList: unmanifestedPublishedPages,
    changed: 0, changedFiles: reportChangedFiles ? [] : undefined,
    removedCustomMeta: 0, homepageGlobalTags: 0, homepageRecords: counts,
    cataloguePackages: catalogueAssets.packages,
    catalogueCompressedBytes: catalogueAssets.compressedBytes,
    pageCategoryCoverage: {}, pageSpecificMetaRecords: 0,
    duplicateKovScripts: 0, dryRun
  };
  for (const file of files) {
    let html = original.get(file);
    const found = recordsByFile.get(file);
    const { nodes, oldScript } = parseExisting(html);
    const isHome = file === homePath;
    const eligible = eligiblePublic(file, html);
    const canonical = eligible ? canonicalFor(html, file) : null;
    const graph = buildGraph(nodes, found, isHome, counts, file, canonical, titleFor(html), eligible);
    const before = html;
    const headScan = metaRecords(html).found;
    const localTagCount = Object.values(headScan).reduce((sum, values) => sum + values.length, 0);
    if (isHome) summary.homepageGlobalTags = localTagCount;
    else if (localTagCount) {
      summary.pageSpecificMetaRecords += localTagCount;
      for (const [key, values] of Object.entries(headScan)) if (values.length) summary.pageCategoryCoverage[key] = (summary.pageCategoryCoverage[key] || 0) + 1;
    }
    summary.removedCustomMeta += localTagCount;
    if ((html.match(new RegExp(`<script\\b(?=[^>]*${MARKER})`, 'gi')) || []).length > 1) summary.duplicateKovScripts += 1;
    html = removeTaxonomyTags(html);
    html = escapeScript(html, graph);
    jsonldNodes += validateRendered(file, before, html, counts, isHome, eligible);
    if (html !== before) {
      summary.changed += 1;
      if (reportChangedFiles) summary.changedFiles.push(file);
    }
    outputs.set(file, html);
  }
  if (summary.duplicateKovScripts) issues.push(`multiple generated KOV JSON-LD scripts on ${summary.duplicateKovScripts} pages`);
  if (issues.length) throw new Error(issues.join('; '));
  if (!dryRun) for (const [file, html] of outputs) fs.writeFileSync(path.join(outputRoot, file), html, 'utf8');
  console.log(JSON.stringify(summary, null, 2));
}
main();
