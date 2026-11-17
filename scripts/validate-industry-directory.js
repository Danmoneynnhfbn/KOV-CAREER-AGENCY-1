const { industryDirectory } = require('../assets/industry-directory.js');

const expectedIndustryCount = 2125;
const seenCodes = new Set();
const seenSlugs = new Set();

for (const industry of industryDirectory) {
  if (!industry.code || !industry.name || !industry.level) {
    throw new Error(`Invalid industry entry: ${JSON.stringify(industry)}`);
  }
  if (seenCodes.has(industry.code)) {
    throw new Error(`Duplicate industry code detected: ${industry.code}`);
  }
  if (seenSlugs.has(industry.slug)) {
    throw new Error(`Duplicate industry slug detected: ${industry.slug}`);
  }
  seenCodes.add(industry.code);
  seenSlugs.add(industry.slug);
}

if (industryDirectory.length !== expectedIndustryCount) {
  throw new Error(`Expected ${expectedIndustryCount} industries; found ${industryDirectory.length}.`);
}

const uniqueLevels = new Set(industryDirectory.map((industry) => industry.level));
console.log(`Industry records validated: ${industryDirectory.length}`);
console.log(`Distinct levels: ${[...uniqueLevels].join(', ')}`);
console.log('NAICS directory integrity check passed.');
