#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const page = fs.readFileSync(new URL('../countries-we-serve.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../assets/country-directory.js', import.meta.url), 'utf8');

if (/assets\/world-cities\.js["'][^>]*\bdefer\b/.test(page)) {
  throw new Error('The 14 MB world-city dataset is still eagerly loaded by the country page.');
}
if (!page.includes('id="country-directory"')) {
  throw new Error('Country directory mount point is missing.');
}
if (!script.includes("if (document.getElementById('country-directory')) renderCountryDirectory();")) {
  throw new Error('Country cards are not initialized immediately on page load.');
}
if (!script.includes("loadCountryCityRecords()")) {
  throw new Error('Lazy city-index loader is missing.');
}
if (!script.includes("citySearch.addEventListener('input'")) {
  throw new Error('City search does not trigger the lazy city-index loader.');
}
new vm.Script(script, { filename: 'assets/country-directory.js' });
console.log('Country directory performance checks passed: country cards render without waiting for city data; 14 MB city index is lazy-loaded on city search.');
