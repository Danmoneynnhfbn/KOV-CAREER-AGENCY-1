const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepagePath = path.join(root, 'index.html');
const datasetPath = path.join(root, 'data/taxonomy/languages.json');
const records = JSON.parse(fs.readFileSync(datasetPath, 'utf8')).records;
const html = fs.readFileSync(homepagePath, 'utf8');
const marker = '<!-- KOV global descriptive metadata';
if (!html.includes(marker) || !/<head\b[\s\S]*<\/head>/i.test(html)) {
  throw new Error('Expected the existing homepage global metadata block and head.');
}
const existing = [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*(["'])language\1[^>]*>/gi)];
const expectedTags = records.map(({ name }) => `<meta name="language" content="${name}">`);
if (existing.length) {
  const actual = existing.map((match) => match[0]);
  if (JSON.stringify(actual) !== JSON.stringify(expectedTags)) {
    throw new Error(`Homepage already contains ${existing.length} language tags that differ from the verified dataset.`);
  }
  console.log(`Homepage already has the ${records.length} verified language records; no write needed.`);
  process.exit(0);
}
const updated = html.replace(/<\/head\s*>/i, `${expectedTags.join('\n')}\n</head>`);
if (updated === html) throw new Error('Homepage has no closing head tag.');
fs.writeFileSync(homepagePath, updated, 'utf8');
console.log(`Added ${expectedTags.length} language metadata records to index.html.`);
