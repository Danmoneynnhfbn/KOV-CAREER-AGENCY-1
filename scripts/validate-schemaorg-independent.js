'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ENDPOINT = 'https://validator.schema.org/validate?output=json';
const samples = [
  ['homepage', 'index.html'],
  ['industry', 'industries/finance-insurance/index.html'],
  ['occupation', 'roles/soc-occupation-41/index.html'],
  ['service', 'services/executive-job-search-support.html'],
  ['role', 'roles/ceo/finance-insurance.html'],
];

function extractJsonLd(filePath, sampleLargeGraph = false) {
  const html = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
  const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi)]
    .map((match) => match[1]);
  if (!blocks.length) throw new Error(`No JSON-LD script found in ${filePath}`);
  const objects = blocks.map((block) => JSON.parse(block));
  const full = objects.map((object) => `<script type="application/ld+json">${JSON.stringify(object)}</script>`).join('\n');
  if (!sampleLargeGraph || Buffer.byteLength(full) < 500000) return { markup: full, sampled: false, nodes: null };

  const graph = objects.flatMap((object) => object['@graph'] || [object]);
  const selected = [];
  const selectedIds = new Set();
  const add = (node) => {
    const id = node?.['@id'] || JSON.stringify(node);
    if (selectedIds.has(id)) return;
    selectedIds.add(id);
    selected.push(node);
  };
  const importantTypes = new Set(['Organization', 'ProfessionalService', 'WebSite', 'WebPage', 'Dataset', 'Service', 'BreadcrumbList']);
  for (const node of graph) {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    if (types.some((type) => importantTypes.has(type))) add(node);
  }
  let terms = 0;
  for (const node of graph) {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    if (types.includes('DefinedTerm') && terms < 12) { add(node); terms += 1; }
  }
  return {
    markup: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': selected })}</script>`,
    sampled: true,
    nodes: selected.length,
  };
}

function parseJsonResponse(text) {
  const start = text.indexOf('{');
  if (start < 0) throw new Error(`Schema.org validator returned non-JSON output: ${text.slice(0, 300)}`);
  return JSON.parse(text.slice(start));
}

async function main() {
  const results = [];
  for (const [kind, filePath] of samples) {
    const payload = extractJsonLd(filePath, kind === 'homepage');
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ html: payload.markup }),
    });
    const responseText = await response.text();
    if (!response.ok) {
      results.push({ sample: kind, file: filePath, homepageRepresentativeSubset: payload.sampled, submittedBytes: Buffer.byteLength(payload.markup), validatorHttpStatus: response.status, outcome: 'UNVERIFIED', error: responseText.slice(0, 500) });
      continue;
    }
    const report = parseJsonResponse(responseText);
    const validatorErrors = Number(report.totalNumErrors ?? NaN);
    const validatorWarnings = Number(report.totalNumWarnings ?? 0);
    const validatorObjects = Number(report.numObjects ?? 0);
    const hasStructuredResult = Number.isFinite(validatorErrors) && Number.isFinite(validatorObjects);
    results.push({
      sample: kind,
      file: filePath,
      homepageRepresentativeSubset: payload.sampled,
      submittedNodeCount: payload.nodes,
      submittedBytes: Buffer.byteLength(payload.markup),
      validatorHttpStatus: response.status,
      validatorObjects,
      validatorErrors: Number.isFinite(validatorErrors) ? validatorErrors : null,
      validatorWarnings,
      fetchError: report.fetchError || null,
      outcome: !hasStructuredResult || report.fetchError ? 'UNVERIFIED' : validatorErrors ? 'FAIL' : validatorObjects ? 'PASS' : 'UNVERIFIED',
      tripleGroups: report.tripleGroups?.length ?? null,
      extractedTypes: [...new Set((report.tripleGroups || []).flatMap((group) => group.nodes || []).flatMap((node) => (node.types || []).map((type) => type.value)))],
    });
    if (kind !== samples.at(-1)[0]) await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  const output = {
    validator: 'https://validator.schema.org/',
    validatorInterface: 'POST /validate?output=json using the saved page JSON-LD; homepage uses a representative node subset because the full 7.6 MB graph exceeds validator document-size limit',
    checkedAt: new Date().toISOString(),
    results,
  };
  const outPath = path.join(ROOT, 'docs/research/schema.org-independent-validation-2026-11-17.json');
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ report: path.relative(ROOT, outPath), results }, null, 2));
  if (results.some((result) => result.outcome !== 'PASS')) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
