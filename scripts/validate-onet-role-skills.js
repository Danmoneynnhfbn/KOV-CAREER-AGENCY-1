const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/taxonomy/onet-chief-executives-skills.json'), 'utf8'));
const esco = require('../assets/esco-taxonomy.js');
const jsonLd = (html) => {
  const text = html.match(/<script\b[^>]*data-kov="discovery"[^>]*>([\s\S]*?)<\/script\s*>/i)?.[1];
  return JSON.parse(text || '{}')['@graph'] || [];
};
const skillNodes = (html) => jsonLd(html).filter((node) => node.inDefinedTermSet?.['@id']?.endsWith('/set-skills'));
const hasVerifiedOnetProvenance = (node) => node.subjectOf?.['@id'] === data.sourceUrl;
const hasSkill = (nodes, record) => nodes.some((node) => node.name === record.metadataValue &&
  hasVerifiedOnetProvenance(node) && node.identifier?.value === record.onetLabel);
const failures = [];
const recordKeys = new Set();
if (!data.sourceUrl.includes('onetonline.org/link/details/11-1011.00') || !data.license.includes('creativecommons.org/licenses/by/4.0')) failures.push('O*NET source or license missing.');
for (const record of data.records) {
  if (!record.onetLabel || !record.metadataValue || record.importance < 53 || !['Essential Skills', 'Transferable Skills'].includes(record.category)) failures.push(`Invalid selected skill record: ${JSON.stringify(record)}`);
  const key = record.metadataValue.normalize('NFKC').toLocaleLowerCase('en');
  if (recordKeys.has(key)) failures.push(`Duplicate metadata skill: ${record.metadataValue}`);
  recordKeys.add(key);
}
const activeListening = data.records.find((record) => record.onetLabel === 'Active Listening');
const escoCrosswalk = esco.skillDirectory.some((skill) => skill.name === activeListening?.metadataValue &&
  skill.alternativeLabels.some((label) => label.normalize('NFKC').toLocaleLowerCase('en') === activeListening.onetLabel.normalize('NFKC').toLocaleLowerCase('en')));
if (!activeListening?.metadataCrosswalk || !escoCrosswalk) failures.push('The Active Listening ESCO label crosswalk is not validated.');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const homepageSkills = skillNodes(homepage);
for (const record of data.records) {
  const found = hasSkill(homepageSkills, record);
  if (!found) failures.push(`Homepage JSON-LD is missing source-backed skill ${record.metadataValue}.`);
}
const homepageSkillKeys = homepageSkills.map((node) => node.name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en'));
if (new Set(homepageSkillKeys).size !== homepageSkillKeys.length) failures.push('Homepage JSON-LD skill records contain duplicate normalized values.');
if (/name\s*=\s*(["'])skill\1/i.test(homepage)) failures.push('Legacy skill meta tags remain on homepage.');
const roleFiles = fs.readdirSync(path.join(root, 'roles', 'ceo')).filter((name) => name.endsWith('.html'));
if (roleFiles.length !== 22) failures.push(`Expected 22 CEO key pages; found ${roleFiles.length}.`);
for (const file of roleFiles) {
  const html = fs.readFileSync(path.join(root, 'roles', 'ceo', file), 'utf8');
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] || '';
  const actual = skillNodes(head);
  for (const record of data.records) if (!hasSkill(actual, record)) failures.push(`${file}: JSON-LD missing skill ${record.metadataValue}.`);
  if (/name\s*=\s*(["'])skill\1/i.test(head)) failures.push(`${file}: legacy skill meta tags remain.`);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Validated ${data.records.length} O*NET occupation-linked skills across ${roleFiles.length} CEO role pages; homepage also contains every record.`);
