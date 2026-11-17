const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');

const execFileAsync = promisify(execFile);
const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'assets', 'geonames-admin1.js');
const DOWNLOADS = {
  countries: 'https://download.geonames.org/export/dump/countryInfo.txt',
  divisions: 'https://download.geonames.org/export/dump/admin1CodesASCII.txt',
};
const COUNTRY_ALIASES = {
  'Congo (Republic of the)': 'CG',
  'Congo (Democratic Republic of the)': 'CD',
  Türkiye: 'TR',
};

async function download(url) {
  const { stdout } = await execFileAsync('curl.exe', [
    '--fail',
    '--location',
    '--silent',
    '--show-error',
    '--max-time',
    '90',
    url,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

function parseTsv(text) {
  return text.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => line.split('\t'));
}

async function main() {
  const [countryText, divisionText] = await Promise.all([
    download(DOWNLOADS.countries),
    download(DOWNLOADS.divisions),
  ]);
  const countryRows = parseTsv(countryText);
  const divisionRows = parseTsv(divisionText);
  const countryNames = new Map(countryRows.map((row) => [row[0], row[4]]));
  const isoByCountryName = new Map(countryRows.map((row) => [row[4], row[0]]));
  const divisionByCountry = new Map();

  for (const [code, name, asciiName, geonameId] of divisionRows) {
    const iso2 = code.split('.')[0];
    if (!divisionByCountry.has(iso2)) divisionByCountry.set(iso2, []);
    divisionByCountry.get(iso2).push({
      code,
      name,
      asciiName,
      geonameId: Number(geonameId),
    });
  }

  const { countryDirectory, worldCities } = require('../assets/country-directory.js');
  const isoByCityCountry = new Map();
  for (const city of worldCities) {
    if (!isoByCityCountry.has(city.country)) isoByCityCountry.set(city.country, city.iso2);
  }
  const countries = countryDirectory.map(({ country }) => {
    const iso2 = COUNTRY_ALIASES[country] || isoByCountryName.get(country) || isoByCityCountry.get(country);
    if (!iso2) throw new Error(`Could not map "${country}" to an official GeoNames country code.`);
    return {
      country,
      iso2,
      geoNamesCountryName: countryNames.get(iso2),
      divisions: (divisionByCountry.get(iso2) || []).sort((left, right) => left.name.localeCompare(right.name)),
    };
  });
  const mappedIsoCodes = new Set(countries.map((entry) => entry.iso2));
  if (mappedIsoCodes.size !== countryDirectory.length) {
    throw new Error('The country directory contains duplicate GeoNames ISO codes.');
  }

  const dataset = {
    metadata: {
      source: 'GeoNames countryInfo.txt and admin1CodesASCII.txt',
      countrySource: DOWNLOADS.countries,
      divisionSource: DOWNLOADS.divisions,
      accessed: new Date().toISOString().slice(0, 10),
      countryRecordCount: countries.length,
      divisionRecordCount: countries.reduce((total, entry) => total + entry.divisions.length, 0),
      sourceDivisionRecordCount: divisionRows.length,
      sourceCountryRecordCount: countryRows.length,
    },
    sourceCountries: countryRows.map((row) => ({ iso2: row[0], iso3: row[1], country: row[4] })),
    countries,
  };
  const source = `(function () {\n  const kovGeoNamesAdmin1 = ${JSON.stringify(dataset, null, 2)};\n  if (typeof window !== 'undefined') window.kovGeoNamesAdmin1 = kovGeoNamesAdmin1;\n  if (typeof module !== 'undefined' && module.exports) module.exports = kovGeoNamesAdmin1;\n})();\n`;
  await fs.writeFile(OUTPUT, source, 'utf8');

  const noDivisionCountries = countries.filter((entry) => entry.divisions.length === 0).map((entry) => entry.country);
  console.log(`Generated ${dataset.metadata.divisionRecordCount} GeoNames first-level divisions for ${countries.length} country records.`);
  console.log(`Countries with no GeoNames first-level division records: ${noDivisionCountries.join(', ') || 'none'}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
