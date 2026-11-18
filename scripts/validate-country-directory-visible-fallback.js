#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const page = fs.readFileSync(path.join(__dirname, '..', 'countries-we-serve.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'assets', 'country-directory.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'kov-global-redesign.css'), 'utf8');

const cardCount = (page.match(/class="country-directory-card"/g) || []).length;
if (!/<body[^>]*class=["'][^"']*\bkov-family-geography\b/.test(page)) throw new Error('Country page is missing the geography page class required by its scoped styles.');
if (cardCount < 190) throw new Error('Static country-card fallback is missing or incomplete: ' + cardCount);
if (!page.includes('country-directory-fallback-note')) throw new Error('Visible fallback notice is missing.');
if (!page.includes('/assets/country-directory.js?v=20261118-3')) throw new Error('Country directory JavaScript cache-buster is missing.');
if (!page.includes('/css/kov-global-redesign.css?v=30')) throw new Error('Country directory stylesheet cache-buster is missing.');
if (page.includes('assets/world-cities.js" defer')) throw new Error('Large city index is still eagerly loaded.');
if (!js.includes('loadCountryCityRecords()')) throw new Error('Lazy city loader is missing.');
if (!css.includes('main > section:has(#country-directory)') || !css.includes('visibility: visible !important')) {
  throw new Error('Country directory reveal override is missing.');
}
new vm.Script(js, { filename: 'assets/country-directory.js' });
console.log('Country directory checks passed: ' + cardCount + ' static cards, cache-busted interactive enhancement, visible mobile styles, and lazy city data.');
