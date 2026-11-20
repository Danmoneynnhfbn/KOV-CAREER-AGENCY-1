const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/languages.json'), 'utf8'));
const translateSource = fs.readFileSync(path.join(root, 'assets/google-translate.js'), 'utf8');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const includedLanguages = translateSource.match(/includedLanguages:\s*"([^"]+)"/);
const configured = includedLanguages?.[1].split(',') || [];
const pageLanguage = translateSource.match(/pageLanguage:\s*"([^"]+)"/)?.[1] || '';
const validIso6391 = new Set(['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'bn', 'ha', 'hi', 'ig', 'id', 'it', 'ja', 'ko', 'nl', 'fa', 'pl', 'ru', 'sw', 'sv', 'th', 'tr', 'uk', 'ur', 'vi', 'yo', 'el', 'he', 'ms']);
const names = new Set();
const codes = new Set();
const failures = [];

for (const record of dataset.records) {
  if (!record.name || !validIso6391.has(record.code) || !record.siteCode) failures.push(`Invalid language record: ${JSON.stringify(record)}`);
  if (names.has(record.name) || codes.has(record.code)) failures.push(`Duplicate language record: ${record.name} (${record.code})`);
  names.add(record.name);
  codes.add(record.code);
  const configuredCodes = record.siteCode.split('|');
  if (includedLanguages && !configuredCodes.every((code) => code === pageLanguage || configured.includes(code))) {
    failures.push(`Site translation allowlist does not include ${record.name}: ${configuredCodes.join(', ')}`);
  }
}
if (dataset.records.length !== 30) failures.push(`Expected 30 records, found ${dataset.records.length}.`);
if (!dataset.sourceUrls?.some((url) => url.includes('iso.org')) || !dataset.sourceUrls?.some((url) => url.includes('loc.gov'))) {
  failures.push('ISO language-code source documentation is incomplete.');
}
const script = homepage.match(/<script\b[^>]*data-kov="discovery"[^>]*>([\s\S]*?)<\/script\s*>/i)?.[1];
let languageNodes = [];
try {
  const graph = JSON.parse(script || '{}')['@graph'] || [];
  const setId = 'https://www.kovcareeragency.org/#metadata-catalog/set-languages';
  languageNodes = graph.filter((node) => node.inDefinedTermSet?.['@id'] === setId);
} catch (error) {
  failures.push(`Homepage KOV JSON-LD could not be parsed: ${error.message}`);
}
const actual = new Map(languageNodes.map((node) => [node.identifier?.value, node.name]));
for (const record of dataset.records) if (actual.get(record.code) !== record.name) failures.push(`Homepage JSON-LD language missing or mismatched: ${record.name} (${record.code}).`);
if (languageNodes.length !== dataset.records.length) failures.push(`Homepage JSON-LD contains ${languageNodes.length} language records; expected ${dataset.records.length}.`);
if (/name\s*=\s*(["'])language\1/i.test(homepage)) failures.push('Legacy language meta tags remain after JSON-LD migration.');
if (pageLanguage !== 'en') failures.push(`Expected the Google Translate widget's source language to be en; found ${pageLanguage || 'none'}.`);
if (!translateSource.includes('https://translate.google.com/translate_a/element.js')) failures.push('Google Translate widget loader is missing.');
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Verified ${dataset.records.length} unique ISO language records against homepage JSON-LD and the Google Translate integration${includedLanguages ? ' allowlist' : ' (no target-language allowlist configured)'}.`);
