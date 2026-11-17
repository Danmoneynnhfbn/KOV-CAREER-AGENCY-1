const taxonomy = require('../assets/esco-taxonomy.js');

const expectedSkillCount = 560;
const expectedSynonymCount = 50000;

if (taxonomy.metadata?.source !== 'European Commission ESCO classification API') {
  throw new Error('ESCO source metadata is missing.');
}
if (taxonomy.metadata.api !== 'https://ec.europa.eu/esco/api/resource/concept' ||
    !taxonomy.metadata.skillsScheme?.endsWith('/skills') ||
    !taxonomy.metadata.occupationsScheme?.endsWith('/occupations')) {
  throw new Error('ESCO API or classification-scheme provenance is incomplete.');
}
if (taxonomy.metadata.sourceTotals?.skills < expectedSkillCount ||
    taxonomy.metadata.sourceTotals?.occupations < 1) {
  throw new Error('ESCO API source totals are missing or smaller than the generated records.');
}
if (taxonomy.skillDirectory.length !== expectedSkillCount) {
  throw new Error(`Expected ${expectedSkillCount} ESCO skills; found ${taxonomy.skillDirectory.length}.`);
}
if (taxonomy.professionalSynonymDirectory.length !== expectedSynonymCount) {
  throw new Error(`Expected ${expectedSynonymCount} ESCO alternative labels; found ${taxonomy.professionalSynonymDirectory.length}.`);
}

const skillUris = new Set();
const skillNames = new Set();
for (const skill of taxonomy.skillDirectory) {
  if (!skill.id || !skill.id.startsWith('http://data.europa.eu/esco/skill/')) {
    throw new Error(`Invalid ESCO skill URI: ${skill.id}`);
  }
  if (!skill.name || !skill.description) {
    throw new Error(`Incomplete ESCO skill record: ${skill.id}`);
  }
  if (skillUris.has(skill.id)) throw new Error(`Duplicate ESCO skill URI: ${skill.id}`);
  const normalizedName = skill.name.normalize('NFKC').toLocaleLowerCase('en');
  if (skillNames.has(normalizedName)) throw new Error(`Duplicate ESCO skill label: ${skill.name}`);
  skillUris.add(skill.id);
  skillNames.add(normalizedName);
}

const synonymKeys = new Set();
for (const synonym of taxonomy.professionalSynonymDirectory) {
  if (!synonym.term || !synonym.language || !synonym.preferredLabel || !synonym.conceptUri) {
    throw new Error(`Incomplete ESCO alternative label: ${JSON.stringify(synonym)}`);
  }
  if (!['skill', 'occupation'].includes(synonym.conceptType)) {
    throw new Error(`Unexpected ESCO concept type: ${synonym.conceptType}`);
  }
  const expectedPrefix = synonym.conceptType === 'skill'
    ? 'http://data.europa.eu/esco/skill/'
    : 'http://data.europa.eu/esco/occupation/';
  if (!synonym.conceptUri.startsWith(expectedPrefix)) {
    throw new Error(`ESCO alternative label URI does not match ${synonym.conceptType}: ${synonym.conceptUri}`);
  }
  const key = `${synonym.language}:${synonym.term.normalize('NFKC').toLocaleLowerCase(synonym.language)}`;
  if (synonymKeys.has(key)) throw new Error(`Duplicate ESCO alternative label: ${key}`);
  synonymKeys.add(key);
}

console.log(`ESCO records validated: ${skillUris.size} skills and ${synonymKeys.size} unique alternative labels across ${new Set(taxonomy.professionalSynonymDirectory.map((item) => item.language)).size} languages.`);
