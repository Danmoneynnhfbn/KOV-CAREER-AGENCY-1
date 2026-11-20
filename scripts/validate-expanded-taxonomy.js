'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildTaxonomies } = require('./lib/verified-expanded-taxonomy');

const root = path.resolve(__dirname, '..');
const snapshotPath = path.join(root, 'data/taxonomy/verified-expanded-taxonomy.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const expected = buildTaxonomies();
assert.deepEqual(snapshot, expected, 'Verified taxonomy snapshot differs from its source datasets.');

const identityKeys = {
  qualificationDirectory: (record) => record.code,
  institutionDirectory: (record) => record.identifier,
  languageDirectory: (record) => record.code,
  professionalSynonymDirectory: (record) => `${record.language}:${record.conceptUri}:${record.name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase(record.language)}`,
};
const results = {};
for (const [category, records] of Object.entries(snapshot)) {
  if (!Array.isArray(records)) continue;
  const ids = new Set();
  const identities = new Set();
  for (const record of records) {
    assert(record.id, `${category}: missing unique identifier`);
    assert(record.name?.trim(), `${category}: missing label`);
    assert(record.description?.trim(), `${category}: missing description`);
    assert(record.source?.trim(), `${category}/${record.id}: missing provenance source`);
    assert(record.sourceUrl || record.sourceUrls?.length || record.sourcePath || record.sourcePaths?.length || record.citation,
      `${category}/${record.id}: missing source locator`);
    assert(record.verification?.status !== 'unverified', `${category}/${record.id}: unverified legacy record`);
    assert(!ids.has(record.id), `${category}: duplicate identifier ${record.id}`);
    ids.add(record.id);

    const identity = identityKeys[category]
      ? identityKeys[category](record)
      : record.name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
    assert(identity, `${category}/${record.id}: missing natural identity`);
    assert(!identities.has(identity), `${category}: duplicate natural identity ${identity}`);
    identities.add(identity);
    if (category === 'searchIntentDirectory') {
      if (record.observedSearchConsoleQuery === true) {
        assert.equal(record.sourcePath, 'data/taxonomy/gsc-observed-search-queries.json', `${record.id}: observed query must cite the retained GSC export`);
        assert.equal(record.sourceType, 'observed_search_console_query', `${record.id}: observed query classification is missing`);
        assert.notEqual(record.searchVolumeStatus, 'available', `${record.id}: Search Console impressions must not be treated as search volume`);
      } else {
        assert.equal(record.observedSearchConsoleQuery, false, `${record.id}: hypothesis must remain explicitly unobserved`);
        assert.match(record.description, /hypothesis|not an observed|not measured/i, `${record.id}: missing search-intent evidence qualifier`);
      }
    }
  }
  results[category] = { records: records.length, uniqueIdentifiers: ids.size, uniqueRecords: identities.size };
}

console.log(JSON.stringify({ validation: 'PASS', categories: results }, null, 2));
