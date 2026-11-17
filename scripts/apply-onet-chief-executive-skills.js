const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/onet-chief-executives-skills.json'), 'utf8'));
const values = [...new Set(dataset.records.map((record) => record.metadataValue))];
const escape = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tag = (value) => `<meta name="skill" content="${escape(value)}">`;

function insertMissing(file, expectedValues, marker) {
  const html = fs.readFileSync(file, 'utf8');
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0];
  if (!head) throw new Error(`${path.relative(root, file)} has no head.`);
  const missing = expectedValues.filter((value) => !head.includes(tag(value)));
  if (!missing.length) return 0;
  const block = `${marker}\n${missing.map(tag).join('\n')}\n`;
  const updated = html.replace(/<\/head\s*>/i, `${block}</head>`);
  fs.writeFileSync(file, updated, 'utf8');
  return missing.length;
}

const homepage = path.join(root, 'index.html');
const globalAdded = insertMissing(homepage, values, '<!-- O*NET skill records; record-level provenance in data/taxonomy/onet-chief-executives-skills.json -->');
const roleDirectory = path.join(root, 'roles', 'ceo');
const rolePages = fs.readdirSync(roleDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
  .map((entry) => path.join(roleDirectory, entry.name));
const pageRecordValues = values;
const changed = rolePages.map((file) => ({ file, count: insertMissing(
  file,
  pageRecordValues,
  '<!-- O*NET 11-1011.00 Chief Executives skills; source crosswalk recorded in data/taxonomy/onet-chief-executives-skills.json -->',
)})).filter((entry) => entry.count);
if (!rolePages.length || changed.length && changed.length !== rolePages.length) {
  throw new Error(`Expected an all-or-none role update; found ${changed.length} changed of ${rolePages.length} CEO pages.`);
}
console.log(JSON.stringify({ homepageSkillRecordsAdded: globalAdded, rolePagesUpdated: changed.length, pageSkillRecordsEach: pageRecordValues.length }, null, 2));
