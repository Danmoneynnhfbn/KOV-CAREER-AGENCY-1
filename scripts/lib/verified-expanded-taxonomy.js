'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '../..');
const SITE = 'https://www.kovcareeragency.org';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const normalize = (value) => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
const stableId = (prefix, value) => `${prefix}:${crypto.createHash('sha256').update(normalize(value)).digest('hex').slice(0, 20)}`;

function sourceFor(record, fallback) {
  const sourceUrl = record.sourceUrl || record.sourceUrls?.[0] || record.citation;
  return { source: record.sourceType || fallback, ...(sourceUrl ? { sourceUrl } : {}) };
}

function sixCategoryRecords(document) {
  const mapping = {
    audienceDirectory: 'professional-audience',
    seniorityLevels: 'seniority-level',
    jobFunctionDirectory: 'job-function',
    employmentTypeDirectory: 'employment-type',
    careerChallengeDirectory: 'career-challenge',
    searchIntentDirectory: 'career-search-intent',
  };
  return Object.fromEntries(Object.entries(mapping).map(([outputKey, category]) => [
    outputKey,
    document.categories[category].map((record) => ({
      ...record,
      id: record.id,
      name: record.name,
      description: record.description,
      category,
      ...sourceFor(record, record.sourceType),
      provenanceType: record.sourceType,
      verification: { status: 'source-backed', classification: record.sourceType },
      ...(category === 'career-search-intent' ? { query: record.name, observedSearchConsoleQuery: false } : {}),
    })),
  ]));
}

function buildTaxonomies() {
  const six = readJson('data/taxonomy/kov-six-category-taxonomies.json');
  const languages = readJson('data/taxonomy/languages.json');
  const qualifications = readJson('data/taxonomy/ofqual-active-qualifications.json');
  const esco = require(path.join(ROOT, 'assets/esco-taxonomy.js'));
  const seoGraph = readJson('data/seo-entity-datasets.jsonld')['@graph'];
  const sixRecords = sixCategoryRecords(six);

  const languageDirectory = languages.records.map((record) => ({
    id: `iso639-1:${record.code}`,
    code: record.code,
    name: record.name,
    description: `ISO 639 language name and code reference (${record.code}).`,
    category: 'language',
    source: languages.source,
    sourceUrl: languages.sourceUrls[0],
    sourceUrls: languages.sourceUrls,
    verification: { status: 'source-backed', standard: 'ISO 639' },
  }));

  const skillDirectory = esco.skillDirectory.map((record) => ({
    ...record,
    id: record.id,
    source: esco.metadata.source,
    sourceUrl: record.id,
    category: 'professional skill',
    verification: { status: 'source-backed', standard: 'ESCO' },
  }));

  const qualificationDirectory = qualifications.records.map((record) => ({
    ...record,
    id: `ofqual:${record.code}`,
    category: 'qualification',
    description: `${record.name}. Ofqual register status: ${record.status}; qualification number ${record.code}.`,
    source: qualifications.source.name,
    sourceUrl: record.specificationUrl || qualifications.source.sourcePage,
    sourceUrls: [qualifications.source.downloadUrl, qualifications.source.sourcePage, ...(record.specificationUrl ? [record.specificationUrl] : [])],
    verification: { status: 'source-backed', registerStatus: record.status, qualificationNumber: record.code },
  }));

  const synonymRows = new Map();
  for (const record of esco.professionalSynonymDirectory) {
    const key = `${record.language}:${record.conceptUri}:${normalize(record.term)}`;
    if (!synonymRows.has(key)) synonymRows.set(key, record);
  }
  const professionalSynonymDirectory = [...synonymRows.values()].map((record) => ({
    ...record,
    id: stableId('esco-alt-label', `${record.language}:${record.conceptUri}:${record.term}`),
    name: record.term,
    description: `ESCO ${record.conceptType} alternative label (${record.language}) for “${record.preferredLabel}”; concept ${record.conceptUri}.`,
    category: 'professional synonym',
    source: esco.metadata.source,
    sourceUrl: record.conceptUri,
    verification: { status: 'source-backed', standard: 'ESCO', language: record.language },
  }));

  const institutionsDataset = seoGraph.find((record) => String(record['@id'] || '').endsWith('#institutions'));
  if (!institutionsDataset) throw new Error('Verified Wikidata institution dataset is missing.');
  const seoById = new Map(seoGraph.map((record) => [record['@id'], record]));
  const institutionDirectory = (institutionsDataset.about || []).map(({ '@id': ref }) => seoById.get(ref)).filter(Boolean).map((record) => {
    const qid = record.identifier || String(record['@id']).split('#organization-').at(-1);
    return {
      id: `wikidata:${qid}`,
      identifier: qid,
      name: record.name,
      description: record.description,
      category: 'organization or institution',
      source: 'Wikidata contributors; existing English-language entity-search selection',
      sourceUrl: record.sameAs || `https://www.wikidata.org/wiki/${qid}`,
      verification: { status: 'source-backed', sourceDataset: institutionsDataset['@id'] },
    };
  });

  return {
    metadata: {
      generatedOn: six.generatedAt,
      sourceFile: 'data/taxonomy/verified-expanded-taxonomy.json',
      statement: 'Verified-source compatibility snapshot. KOV-defined categories are internally classified from KOV pages; ESCO, ISO, Ofqual, and Wikidata records retain source identifiers and provenance. Search-intent entries are hypotheses, not observed Search Console queries.',
      sourceRegistry: {
        sixCategories: `${SITE}/data/taxonomy/kov-six-category-taxonomies.json`,
        isoLanguages: languages.sourceUrls,
        esco: esco.metadata.api,
        ofqual: qualifications.source.downloadUrl,
        wikidata: institutionsDataset.citation,
      },
    },
    ...sixRecords,
    languageDirectory,
    skillDirectory,
    qualificationDirectory,
    professionalSynonymDirectory,
    institutionDirectory,
  };
}

module.exports = { buildTaxonomies };
