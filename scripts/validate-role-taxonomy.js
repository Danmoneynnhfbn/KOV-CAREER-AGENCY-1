const { kovRoleTaxonomy } = require('../assets/role-taxonomy.js');

const expectedJobTitleCount = 98380;
const expectedOccupationCount = 1655;

if (!Array.isArray(kovRoleTaxonomy.jobTitles) || kovRoleTaxonomy.jobTitles.length !== expectedJobTitleCount) {
  throw new Error(`Expected ${expectedJobTitleCount} job titles; found ${kovRoleTaxonomy.jobTitles.length}.`);
}
if (!Array.isArray(kovRoleTaxonomy.occupations) || kovRoleTaxonomy.occupations.length !== expectedOccupationCount) {
  throw new Error(`Expected ${expectedOccupationCount} occupations; found ${kovRoleTaxonomy.occupations.length}.`);
}
if (new Set(kovRoleTaxonomy.jobTitles).size !== kovRoleTaxonomy.jobTitles.length) {
  throw new Error('Duplicate job titles detected in the taxonomy.');
}
if (new Set(kovRoleTaxonomy.occupations).size !== kovRoleTaxonomy.occupations.length) {
  throw new Error('Duplicate occupations detected in the taxonomy.');
}

console.log(`Job titles validated: ${kovRoleTaxonomy.jobTitles.length}`);
console.log(`Occupations validated: ${kovRoleTaxonomy.occupations.length}`);
console.log('Role taxonomy integrity check passed.');
