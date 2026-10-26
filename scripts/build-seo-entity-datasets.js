const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'data', 'seo-entity-datasets.jsonld');
const catalogUrl =
  'https://www.kovcareeragency.org/data/seo-entity-datasets.jsonld';
const baseUrl = 'https://www.kovcareeragency.org';
const licenseBy = 'https://creativecommons.org/licenses/by/4.0/';
const licenseCc0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) {
    throw new Error(`Missing required argument: ${name} <path>.`);
  }
  return path.resolve(process.argv[index + 1]);
}

function normalized(value) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function readTabularFile(filename) {
  const lines = fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
  if (!lines.length) throw new Error(`Source file is empty: ${filename}`);
  const headers = lines[0].split('\t');
  const rows = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const values = line.split('\t');
    rows.push(Object.fromEntries(headers.map((header, index) => [
      header.trim(),
      (values[index] || '').trim(),
    ])));
  }
  return rows;
}

function geoNamesRecords(filename) {
  const records = [];
  for (const line of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
    if (!line) continue;
    const fields = line.split('\t');
    if (fields.length < 19 || !/^\d+$/.test(fields[0])) continue;
    records.push({
      id: fields[0],
      name: fields[1].trim(),
      latitude: Number(fields[4]),
      longitude: Number(fields[5]),
      featureClass: fields[6],
      featureCode: fields[7],
      countryCode: fields[8],
      population: Number(fields[14]) || 0,
    });
  }
  return records;
}

function sortedByPopulation(records) {
  return records.sort((left, right) =>
    right.population - left.population || Number(left.id) - Number(right.id)
  );
}

function property(name, value) {
  return { '@type': 'PropertyValue', name, value };
}

function placeEntity(record) {
  return {
    '@type': 'Place',
    '@id': `${catalogUrl}#place-${record.id}`,
    name: record.name,
    identifier: `https://www.geonames.org/${record.id}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: record.latitude,
      longitude: record.longitude,
    },
    additionalProperty: [
      property('GeoNames feature class', record.featureClass),
      property('GeoNames feature code', record.featureCode),
      property('GeoNames country code', record.countryCode),
      property('Population in source record', record.population),
    ],
  };
}

function occupationEntity(title, codes) {
  const id = crypto.createHash('sha256').update(normalized(title)).digest('hex');
  return {
    '@type': 'Occupation',
    '@id': `${catalogUrl}#role-${id}`,
    name: title,
    identifier: codes.map((code) => property('O*NET-SOC code', code)),
  };
}

function isSpecificOrganization(record) {
  const label = record.label.trim();
  const description = record.description.trim();
  const lowerLabel = normalized(label);
  const organizationTerms =
    /\b(university|college|school|polytechnic|institute|government|agency|ministry|department|council|hospital|company|corporation|business|bank|employer|nonprofit|organization|organisation|firm|foundation|authority|trust|association|enterprise|service|airport|museum|charity|institution|clinic|medical center|political party|union|network|group|university|laboratory|commission|office|bureau|administration|society|federation|congregation|conservatory)\b/i;
  const genericDescriptions =
    /\b(type of|class of|kind of|academic discipline|administrative division|administrative area|building used|sports team|profession|occupation|job title|person who|group of people|in fiction|fictional|method of|form of government)\b/i;
  const genericLabels = new Set([
    'university', 'college', 'school', 'government agency', 'government department',
    'government ministry', 'public institution', 'public institute', 'municipality',
    'company', 'corporation', 'business', 'small business', 'bank', 'hospital',
    'nonprofit organization', 'nonprofit organisation', 'organization', 'organisation',
    'institution', 'association', 'foundation', 'airport', 'museum', 'authority',
  ]);
  return /^Q\d+$/.test(record.id) &&
    label.length > 1 &&
    label[0] === label[0].toLocaleUpperCase('en') &&
    description.length > 10 &&
    organizationTerms.test(`${label} ${description}`) &&
    !genericDescriptions.test(description) &&
    !genericLabels.has(lowerLabel);
}

function datasetNode({
  id,
  name,
  description,
  sourceName,
  sourceUrl,
  license,
  count,
  entityIds,
}) {
  return {
    '@type': 'Dataset',
    '@id': `${catalogUrl}#${id}`,
    name,
    description,
    url: `${catalogUrl}#${id}`,
    license,
    citation: sourceUrl,
    creditText: sourceName,
    creator: { '@type': 'Organization', name: sourceName },
    distribution: {
      '@type': 'DataDownload',
      contentUrl: catalogUrl,
      encodingFormat: 'application/ld+json',
    },
    includedInDataCatalog: { '@id': `${catalogUrl}#catalog` },
    numberOfItems: count,
    about: entityIds.map((entityId) => ({ '@id': entityId })),
  };
}

const geoNamesPath = argument('--geonames');
const onetDirectory = argument('--onet-directory');
const wikidataPath = argument('--wikidata');
const geoNames = geoNamesRecords(geoNamesPath);
const cityFeatureCodes = new Set([
  'PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLA5', 'PPLG',
]);
const cityCandidates = sortedByPopulation(geoNames.filter((record) =>
  record.name && record.featureClass === 'P' && cityFeatureCodes.has(record.featureCode)
));
const cities = cityCandidates.slice(0, 1000);
if (cities.length < 1000) {
  throw new Error(`Expected at least 1,000 GeoNames administrative city candidates; found ${cities.length}.`);
}
const cityIds = new Set(cities.map((record) => record.id));
const townCandidates = sortedByPopulation(geoNames.filter((record) =>
  record.name && record.featureClass === 'P' && record.featureCode === 'PPL' &&
  !cityIds.has(record.id)
));
const towns = townCandidates.slice(0, 1323);
if (towns.length < 1323) {
  throw new Error(`Expected at least 1,323 GeoNames populated-place candidates; found ${towns.length}.`);
}
if (
  new Set(cities.map((record) => record.id)).size !== cities.length ||
  new Set(towns.map((record) => record.id)).size !== towns.length
) {
  throw new Error('GeoNames collections contain duplicate record identifiers.');
}

const titleFile = path.join(onetDirectory, 'Job Titles.txt');
const titlesByName = new Map();
for (const row of readTabularFile(titleFile)) {
  const title = row['Job Title'].trim();
  if (!title) continue;
  const key = normalized(title);
  if (!titlesByName.has(key)) titlesByName.set(key, { title, codes: new Set() });
  if (row['O*NET-SOC Code']) {
    titlesByName.get(key).codes.add(row['O*NET-SOC Code']);
  }
}
const roles = [...titlesByName.values()]
  .sort((left, right) => normalized(left.title).localeCompare(normalized(right.title), 'en'))
  .map(({ title, codes }) => occupationEntity(title, [...codes].sort()));
if (roles.length < 1095) {
  throw new Error(`Expected at least 1,095 unique O*NET job titles; found ${roles.length}.`);
}

const activityFile = path.join(onetDirectory, 'GWAs to IWAs to DWAs.txt');
const activityRows = readTabularFile(activityFile);
const activitiesById = new Map();
for (const row of activityRows) {
  const id = row['DWA Element ID'];
  const name = row['DWA Element Name'];
  if (id && name && !activitiesById.has(id)) {
    activitiesById.set(id, { id, name });
  }
}
const functions = [...activitiesById.values()]
  .sort((left, right) => left.id.localeCompare(right.id, 'en'))
  .map(({ id, name }) => ({
    '@type': 'DefinedTerm',
    '@id': `${catalogUrl}#work-activity-${encodeURIComponent(id)}`,
    name,
    identifier: `O*NET Detailed Work Activity ${id}`,
  }));
if (functions.length < 200) {
  throw new Error(`Expected at least 200 O*NET detailed work activities; found ${functions.length}.`);
}

const wikidataResults = JSON.parse(fs.readFileSync(wikidataPath, 'utf8'));
const institutionsById = new Map();
const institutionNames = new Set();
for (const record of wikidataResults) {
  if (!isSpecificOrganization(record)) continue;
  const key = normalized(record.label);
  if (institutionsById.has(record.id) || institutionNames.has(key)) continue;
  institutionsById.set(record.id, record);
  institutionNames.add(key);
}
const institutions = [...institutionsById.values()]
  .sort((left, right) => left.id.localeCompare(right.id, 'en'))
  .map((record) => ({
    '@type': 'Organization',
    '@id': `${catalogUrl}#organization-${record.id.toLocaleLowerCase('en')}`,
    name: record.label,
    description: record.description,
    identifier: record.id,
    sameAs: `https://www.wikidata.org/wiki/${record.id}`,
  }));
if (institutions.length < 486) {
  throw new Error(
    `Expected at least 486 distinct Wikidata institution/organization entities; found ${institutions.length}. Expand source searches before building.`
  );
}

const placeUrl = (record) => `${catalogUrl}#place-${record.id}`;
const roleUrl = (entity) => entity['@id'];
const functionUrl = (entity) => entity['@id'];
const organizationUrl = (entity) => entity['@id'];
const datasets = [
  datasetNode({
    id: 'cities',
    name: 'GeoNames administrative city and capital candidates',
    description: 'The 1,000 highest-population GeoNames cities1000 records with administrative-seat or capital feature codes PPLC, PPLA, PPLA2, PPLA3, PPLA4, PPLA5, or PPLG. GeoNames feature classifications are retained; they are not a universal legal city classification.',
    sourceName: 'GeoNames',
    sourceUrl: 'https://download.geonames.org/export/dump/cities1000.zip',
    license: licenseBy,
    count: cities.length,
    entityIds: cities.map(placeUrl),
  }),
  datasetNode({
    id: 'towns',
    name: 'GeoNames populated-place records (town candidates)',
    description: 'The 1,323 highest-population GeoNames cities1000 records with feature code PPL. GeoNames identifies these as populated places and does not consistently distinguish legal towns from cities; the source feature code is preserved.',
    sourceName: 'GeoNames',
    sourceUrl: 'https://download.geonames.org/export/dump/cities1000.zip',
    license: licenseBy,
    count: towns.length,
    entityIds: towns.map(placeUrl),
  }),
  datasetNode({
    id: 'professional-roles',
    name: 'O*NET 31.0 job titles',
    description: 'All distinct job-title strings in the O*NET 31.0 Job Titles file, normalized only for deduplication. Each title retains its associated O*NET-SOC code or codes.',
    sourceName: 'O*NET 31.0 Database, U.S. Department of Labor, Employment and Training Administration',
    sourceUrl: 'https://www.onetcenter.org/database.html',
    license: licenseBy,
    count: roles.length,
    entityIds: roles.map(roleUrl),
  }),
  datasetNode({
    id: 'institutions',
    name: 'Wikidata institutions and organizations',
    description: 'Distinct named Wikidata organizations selected from the recorded English-language entity-search results when the label and description identify a real organization or institution. Descriptions and QIDs are retained; no unsupported addresses, relationships, or small-business classifications are inferred.',
    sourceName: 'Wikidata contributors',
    sourceUrl: 'https://www.wikidata.org/w/api.php',
    license: licenseCc0,
    count: institutions.length,
    entityIds: institutions.map(organizationUrl),
  }),
  datasetNode({
    id: 'job-functions',
    name: 'O*NET 31.0 detailed work activities',
    description: 'Distinct Detailed Work Activity identifiers and names from the O*NET 31.0 GWAs to IWAs to DWAs file. These are source-defined work activities and are not reclassified as occupations.',
    sourceName: 'O*NET 31.0 Database, U.S. Department of Labor, Employment and Training Administration',
    sourceUrl: 'https://www.onetcenter.org/database.html',
    license: licenseBy,
    count: functions.length,
    entityIds: functions.map(functionUrl),
  }),
];
const graph = [
  {
    '@type': 'DataCatalog',
    '@id': `${catalogUrl}#catalog`,
    name: 'KOV Career Agency SEO entity datasets',
    url: catalogUrl,
    hasPart: datasets.map((dataset) => ({ '@id': dataset['@id'] })),
  },
  ...datasets,
  ...cities.map(placeEntity),
  ...towns.map(placeEntity),
  ...roles,
  ...institutions,
  ...functions,
];
const jsonLd = { '@context': 'https://schema.org', '@graph': graph };
JSON.parse(JSON.stringify(jsonLd));
fs.writeFileSync(catalogPath, `${JSON.stringify(jsonLd)}\n`, 'utf8');
console.log(
  `Generated ${catalogPath}: ${cities.length} cities, ${towns.length} populated-place candidates, ${roles.length} job titles, ${institutions.length} organizations, ${functions.length} detailed work activities.`
);
