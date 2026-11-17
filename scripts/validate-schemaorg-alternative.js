'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_PATH = process.argv[2] || process.env.KOV_SCHEMA_ORG_VALIDATOR;
if (!PACKAGE_PATH) throw new Error('Pass the installed schema-org-validate package path as argument 1.');

const samples = [
  ['homepage', 'index.html'],
  ['industry', 'industries/finance-insurance/index.html'],
  ['occupation', 'roles/soc-occupation-41/index.html'],
  ['service', 'services/executive-job-search-support.html'],
  ['role', 'roles/ceo/finance-insurance.html'],
];

function extractGraphs(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi)];
  if (!blocks.length) throw new Error(`No JSON-LD block in ${file}`);
  return blocks.map(([, content]) => JSON.parse(content));
}

function nodesFrom(graphs) {
  return graphs.flatMap((graph) => Array.isArray(graph['@graph']) ? graph['@graph'] : [graph]);
}

function schemaTypes(node) {
  return Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']].filter(Boolean);
}

function representativeHomepageNodes(nodes) {
  const importantTypes = new Set(['Organization', 'ProfessionalService', 'WebSite', 'WebPage', 'Dataset', 'Service', 'BreadcrumbList']);
  const selected = [];
  const seen = new Set();
  const add = (node) => {
    const key = node['@id'] || JSON.stringify(node);
    if (!seen.has(key)) { selected.push(node); seen.add(key); }
  };
  for (const node of nodes) if (schemaTypes(node).some((type) => importantTypes.has(type))) add(node);
  let terms = 0;
  for (const node of nodes) {
    if (schemaTypes(node).includes('DefinedTerm') && terms < 12) { add(node); terms += 1; }
  }
  return selected;
}

function collectNodeTypes(value, typesById = new Map()) {
  if (Array.isArray(value)) value.forEach((entry) => collectNodeTypes(entry, typesById));
  else if (value && typeof value === 'object') {
    const id = value['@id'];
    const types = schemaTypes(value);
    if (id && types.length) typesById.set(id, types);
    for (const child of Object.values(value)) collectNodeTypes(child, typesById);
  }
  return typesById;
}

function cleanForValidator(value, typesById, unionTypeByKey) {
  if (Array.isArray(value)) return value.map((entry) => cleanForValidator(entry, typesById, unionTypeByKey));
  if (!value || typeof value !== 'object') return value;
  const clean = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === '@context' || key === '@id' || key === '@graph') continue;
    clean[key] = cleanForValidator(child, typesById, unionTypeByKey);
  }
  const types = schemaTypes(value).length ? schemaTypes(value) : (value['@id'] ? typesById.get(value['@id']) || ['Thing'] : []);
  if (types.length > 1) clean['@type'] = unionTypeByKey.get(types.slice().sort().join('|'));
  else if (types.length === 1) clean['@type'] = types[0];
  return clean;
}

function validateNode(node, errors, page, nodeId, unionTypeByKey, validator) {
  if (!schemaTypes(node).length) return;
  const cleaned = cleanForValidator(node, currentTypesById, unionTypeByKey);
  for (const error of validator.validate(cleaned)) errors.push({ page, node: nodeId, ...error });
}

let currentTypesById = new Map();
function setupVocabularyAdapter(packagePath, allGraphs) {
  const adapterPath = path.join(path.dirname(packagePath), `package-kov-adapter-${Date.now()}`);
  fs.cpSync(packagePath, adapterPath, { recursive: true });
  const typeMapPath = path.join(adapterPath, 'data/typeMap.json');
  const subclassMapPath = path.join(adapterPath, 'data/subclassMap.json');
  const typeMap = JSON.parse(fs.readFileSync(typeMapPath, 'utf8'));
  const subclassMap = JSON.parse(fs.readFileSync(subclassMapPath, 'utf8'));
  // Current Schema.org models Country and City below AdministrativeArea;
  // the bundled third-party vocabulary snapshot predates these two entries.
  if (!typeMap.Country) { typeMap.Country = {}; subclassMap.Country = 'AdministrativeArea'; }
  if (!typeMap.City) { typeMap.City = {}; subclassMap.City = 'AdministrativeArea'; }
  const combinations = new Map();
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      const types = schemaTypes(value).filter((type) => typeMap[type]);
      if (types.length > 1) combinations.set(types.slice().sort().join('|'), types.slice().sort());
      Object.values(value).forEach(visit);
    }
  };
  allGraphs.forEach(visit);
  const unionTypeByKey = new Map();
  for (const [key, types] of combinations) {
    const virtualType = `KovValidatedUnion${unionTypeByKey.size + 1}`;
    const ancestors = new Set(['Thing']);
    for (const type of types) {
      let current = type;
      const chain = new Set();
      while (subclassMap[current] && !chain.has(current)) {
        chain.add(current);
        current = subclassMap[current];
        ancestors.add(current);
      }
      ancestors.add(type);
    }
    const props = {};
    for (const type of ancestors) {
      for (const [name, ranges] of Object.entries(typeMap[type] || {})) {
        props[name] = [...new Set([...(props[name] || []), ...ranges])];
      }
    }
    typeMap[virtualType] = props;
    subclassMap[virtualType] = 'Thing';
    unionTypeByKey.set(key, virtualType);
  }
  fs.writeFileSync(typeMapPath, `${JSON.stringify(typeMap)}\n`);
  fs.writeFileSync(subclassMapPath, `${JSON.stringify(subclassMap)}\n`);
  return { adapterPath, unionTypeByKey, multiTypeCombinations: combinations.size };
}

async function main() {
  const pageGraphs = samples.map(([sample, file]) => ({ sample, file, graphs: extractGraphs(file) }));
  const adapter = setupVocabularyAdapter(PACKAGE_PATH, pageGraphs.flatMap((entry) => entry.graphs));
  const { SchemaOrgValidator } = require(adapter.adapterPath);
  const validator = new SchemaOrgValidator();
  const inheritedCheck = validator.isTypeOrSubtype.bind(validator);
  const typeMap = JSON.parse(fs.readFileSync(path.join(adapter.adapterPath, 'data/typeMap.json'), 'utf8'));
  const subclassMap = JSON.parse(fs.readFileSync(path.join(adapter.adapterPath, 'data/subclassMap.json'), 'utf8'));
  const unionMembers = new Map();
  for (const [key, types] of adapter.unionTypeByKey) unionMembers.set(types, key.split('|'));
  validator.isTypeOrSubtype = (actualType, expectedTypes) => {
    const sourceTypes = unionMembers.get(actualType);
    if (sourceTypes) return sourceTypes.some((sourceType) => inheritedCheck(sourceType, expectedTypes));
    return inheritedCheck(actualType, expectedTypes);
  };
  const guessValueType = validator.guessValueType.bind(validator);
  validator.guessValueType = (value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return 'DateTime';
    return guessValueType(value);
  };
  const results = [];
  for (const { sample, file, graphs } of pageGraphs) {
    const allNodes = nodesFrom(graphs);
    currentTypesById = collectNodeTypes(graphs);
    const selected = sample === 'homepage' ? representativeHomepageNodes(allNodes) : allNodes;
    const errors = [];
    for (const node of selected) validateNode(node, errors, file, node['@id'] || schemaTypes(node).join(','), adapter.unionTypeByKey, validator);
    results.push({
      sample,
      file,
      sourceBlocks: graphs.length,
      graphNodes: allNodes.length,
      validatedNodes: selected.length,
      homepageRepresentativeSubset: sample === 'homepage',
      errors: errors.length,
      firstErrors: errors.slice(0, 30),
      outcome: errors.length ? 'FAIL' : 'PASS',
    });
  }
  const reportPath = path.join(ROOT, 'docs/research/schema.org-independent-validation-2026-11-17.json');
  const existing = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {};
  existing.alternativeIndependentValidation = {
    validator: 'schema-org-validate@0.1.0',
    publisher: 'a4csi (third-party, not affiliated with Schema.org)',
    source: 'https://github.com/a4csi/schema-org-validate',
    license: 'MIT',
    method: 'Local JavaScript validator using its bundled Schema.org type and subclass maps; parsed the saved repository JSON-LD, traversed graph objects, removed JSON-LD control keys for vocabulary-property checking, and resolved local @id references when the target type was available.',
    limitation: 'Not an official Schema.org validator. It uses the third-party package’s bundled vocabulary maps with a temporary adapter that unions official ranges for valid multi-typed nodes. The homepage result validates selected representative graph nodes because the full page contains 7.6 MB of structured data. JSON-LD @id references are resolved to in-page types, or treated as the general Thing type when an external/forward target is absent.',
    vocabularyAdapter: { multiTypeCombinations: adapter.multiTypeCombinations, packageVersion: '0.1.0' },
    checkedAt: new Date().toISOString(),
    results,
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ report: path.relative(ROOT, reportPath), results }, null, 2));
  if (results.some((result) => result.outcome !== 'PASS')) process.exitCode = 1;
}

main().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
