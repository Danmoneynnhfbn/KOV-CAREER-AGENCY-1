const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');

const execFileAsync = promisify(execFile);
const API = 'https://ec.europa.eu/esco/api/resource/concept';
const PAGE_SIZE = 50;
const SKILL_TARGET = 560;
const SYNONYM_TARGET = 50000;
const OUTPUT = path.join(__dirname, '..', 'assets', 'esco-taxonomy.js');
const LANGUAGE_SCHEME = 'http://data.europa.eu/esco/concept-scheme/';

async function fetchConceptPage(scheme, offset) {
  const url = new URL(API);
  url.searchParams.set('isInScheme', `${LANGUAGE_SCHEME}${scheme}`);
  url.searchParams.set('language', 'en');
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(PAGE_SIZE));

  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const { stdout } = await execFileAsync('curl.exe', [
        '--silent',
        '--show-error',
        '--fail',
        '--max-time',
        '90',
        url.href,
      ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const payload = JSON.parse(stdout);
      const concepts = Object.values(payload._embedded || {});
      if (concepts.length !== payload.count) {
        throw new Error(`ESCO API returned ${concepts.length} concepts but declared ${payload.count}.`);
      }
      return { concepts, total: payload.total };
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
}

async function fetchScheme(scheme, targetCount) {
  const first = await fetchConceptPage(scheme, 0);
  const concepts = [...first.concepts];
  const pageCount = Math.ceil(Math.min(first.total, targetCount) / PAGE_SIZE);
  const offsets = Array.from({ length: pageCount - 1 }, (_, index) => index + 1);
  for (const offset of offsets) {
    const page = await fetchConceptPage(scheme, offset);
    concepts.push(...page.concepts);
  }
  return { concepts, total: first.total };
}

function labelAt(labels, language) {
  const value = labels?.[language];
  return typeof value === 'string' ? value.trim() : '';
}

function descriptionAt(descriptions, language) {
  const value = descriptions?.[language];
  if (typeof value === 'string') return value.trim();
  return typeof value?.literal === 'string' ? value.literal.trim() : '';
}

function synonymsFromConcepts(concepts, category, seen) {
  const result = [];
  for (const concept of concepts) {
    const preferredLabel = labelAt(concept.preferredLabel, 'en') || concept.title?.trim();
    if (!preferredLabel) continue;

    for (const [language, labels] of Object.entries(concept.alternativeLabel || {})) {
      if (!Array.isArray(labels)) continue;
      for (const value of labels) {
        const term = typeof value === 'string' ? value.trim() : '';
        if (!term) continue;
        const normalizedTerm = term.normalize('NFKC').toLocaleLowerCase(language);
        const key = `${language}:${normalizedTerm}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          term,
          language,
          preferredLabel,
          conceptUri: concept.uri,
          conceptType: category,
        });
      }
    }
  }
  return result;
}

function formatRecords(records) {
  return `[\n${records.map((record) => `      ${JSON.stringify(record)}`).join(',\n')}\n    ]`;
}

async function main() {
  const skills = await fetchScheme('skills', SKILL_TARGET + PAGE_SIZE);
  const occupations = await fetchScheme('occupations', 1200);
  const uniqueSkills = new Map();
  for (const concept of skills.concepts) {
    const name = labelAt(concept.preferredLabel, 'en') || concept.title?.trim();
    if (!name || uniqueSkills.has(concept.uri)) continue;
    uniqueSkills.set(concept.uri, {
      id: concept.uri,
      name,
      description: descriptionAt(concept.description, 'en'),
      alternativeLabels: (concept.alternativeLabel?.en || []).filter((label) => typeof label === 'string' && label.trim()),
      status: concept.status || null,
    });
    if (uniqueSkills.size === SKILL_TARGET) break;
  }
  if (uniqueSkills.size !== SKILL_TARGET) {
    throw new Error(`Expected ${SKILL_TARGET} ESCO skills; found ${uniqueSkills.size}.`);
  }

  const seenSynonyms = new Set();
  const synonyms = [
    ...synonymsFromConcepts(skills.concepts, 'skill', seenSynonyms),
    ...synonymsFromConcepts(occupations.concepts, 'occupation', seenSynonyms),
  ].slice(0, SYNONYM_TARGET);
  if (synonyms.length !== SYNONYM_TARGET) {
    throw new Error(`Expected ${SYNONYM_TARGET} unique ESCO alternative labels; found ${synonyms.length}.`);
  }

  const dataset = {
    metadata: {
      source: 'European Commission ESCO classification API',
      api: API,
      skillsScheme: `${LANGUAGE_SCHEME}skills`,
      occupationsScheme: `${LANGUAGE_SCHEME}occupations`,
      accessed: new Date().toISOString().slice(0, 10),
      sourceTotals: {
        skills: skills.total,
        occupations: occupations.total,
      },
    },
    skillDirectory: [...uniqueSkills.values()],
    professionalSynonymDirectory: synonyms,
  };

  const metadata = JSON.stringify(dataset.metadata, null, 2).replace(/\n/g, '\n    ');
  const output = `(function () {\n  const kovEscoTaxonomy = {\n    metadata: ${metadata},\n    skillDirectory: ${formatRecords(dataset.skillDirectory)},\n    professionalSynonymDirectory: ${formatRecords(dataset.professionalSynonymDirectory)}\n  };\n  if (typeof window !== 'undefined') window.kovEscoTaxonomy = kovEscoTaxonomy;\n  if (typeof module !== 'undefined' && module.exports) module.exports = kovEscoTaxonomy;\n})();\n`;
  await fs.writeFile(OUTPUT, output, 'utf8');
  console.log(`Generated ${dataset.skillDirectory.length} ESCO skills and ${dataset.professionalSynonymDirectory.length} unique ESCO alternative labels.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
