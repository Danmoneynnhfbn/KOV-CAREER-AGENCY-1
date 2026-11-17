'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildTaxonomies } = require('./lib/verified-expanded-taxonomy');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'data/taxonomy/verified-expanded-taxonomy.json');
const datasets = buildTaxonomies();
fs.writeFileSync(output, `${JSON.stringify(datasets, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(Object.fromEntries(Object.entries(datasets).filter(([, value]) => Array.isArray(value)).map(([key, records]) => [key, records.length])), null, 2));
console.log(`Wrote ${path.relative(root, output)}`);
