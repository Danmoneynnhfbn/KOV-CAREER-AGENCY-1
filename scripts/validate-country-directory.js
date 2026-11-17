const { countryDirectory, worldCities } = require('../assets/country-directory.js');
const geoNamesDirectory = require('../assets/geonames-admin1.js');
const admin2Candidates = require('../assets/geonames-admin2-label-candidates.js');
const cityCrosswalk = require('../data/taxonomy/geonames-city-crosswalk.json');

const expectedCountryCount = 197;
const expectedGeoNamesCountryCount = 195;
const expectedCityCount = 50250;

const countryNames = countryDirectory.map((entry) => entry.country);
const uniqueCountries = new Set(countryNames);
const duplicateCountries = countryNames.filter((country, index) => countryNames.indexOf(country) !== index);
const invalidEntries = countryDirectory.filter((entry) => {
  if (!entry.country || !entry.region) return true;
  if (!Array.isArray(entry.divisions) ||
      (entry.divisions.length === 0 && !['Singapore', 'Vatican City'].includes(entry.country))) return true;
  if (!Array.isArray(entry.cities) || entry.cities.length === 0) return true;
  return false;
});

if (countryDirectory.length !== expectedCountryCount) {
  throw new Error(`Expected ${expectedCountryCount} countries; found ${countryDirectory.length}.`);
}
if (uniqueCountries.size !== countryDirectory.length) {
  throw new Error(`Duplicate country entries detected: ${[...new Set(duplicateCountries)].join(', ')}`);
}
if (invalidEntries.length) {
  throw new Error(`Invalid country entries: ${invalidEntries.map((entry) => entry.country).join(', ')}`);
}
if (worldCities.length !== expectedCityCount) {
  throw new Error(`Expected ${expectedCityCount} city records; found ${worldCities.length}.`);
}

const totalDivisions = countryDirectory.reduce((sum, entry) => sum + entry.divisions.length, 0);
const totalCities = countryDirectory.reduce((sum, entry) => sum + entry.cities.length, 0);
const geoCountryCodes = new Set(geoNamesDirectory.countries.map((entry) => entry.iso2));
const geoCountryNames = new Set(geoNamesDirectory.countries.map((entry) => entry.country));
const sourceCountriesByIso2 = new Map(geoNamesDirectory.sourceCountries.map((entry) => [entry.iso2, entry]));
const directoryByIso2 = new Map(countryDirectory.map((entry) => [entry.iso2, entry]));
const divisionsByIso2 = new Map();
const divisionCodes = new Set();
let geoDivisionCount = 0;
const countriesWithoutDivisions = [];

for (const country of geoNamesDirectory.countries) {
  if (!country.country || !/^[A-Z]{2}$/.test(country.iso2)) {
    throw new Error(`Invalid GeoNames country record: ${JSON.stringify(country)}`);
  }
  if (divisionsByIso2.has(country.iso2)) {
    throw new Error(`Duplicate GeoNames country code: ${country.iso2}`);
  }
  const countryDivisions = new Set();
  for (const division of country.divisions) {
    if (!division.code || !division.name || !division.asciiName || !Number.isInteger(division.geonameId)) {
      throw new Error(`Incomplete GeoNames division for ${country.country}: ${JSON.stringify(division)}`);
    }
    if (divisionCodes.has(division.code)) {
      throw new Error(`Duplicate GeoNames division code: ${division.code}`);
    }
    divisionCodes.add(division.code);
    countryDivisions.add(division.name.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase());
    countryDivisions.add(division.asciiName.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase());
    geoDivisionCount += 1;
  }
  if (!country.divisions.length) countriesWithoutDivisions.push(country.country);
  divisionsByIso2.set(country.iso2, countryDivisions);
}

if (geoNamesDirectory.countries.length !== expectedGeoNamesCountryCount || geoCountryNames.size !== expectedGeoNamesCountryCount) {
  throw new Error(`Expected ${expectedGeoNamesCountryCount} GeoNames administrative country records; found ${geoNamesDirectory.countries.length}.`);
}
if (geoDivisionCount !== geoNamesDirectory.metadata.divisionRecordCount) {
  throw new Error('GeoNames division metadata does not match the individual division records.');
}

let missingCityFields = 0;
let inconsistentIsoCodes = 0;
let citiesWithoutAdminName = 0;
let cityAdminNotMatchedToDivision = 0;
const sourceCountryLabels = new Set();
const sourceCitiesOutsideCountryDirectory = new Set();
const settlementKeys = new Set();
let duplicateSettlementKeys = 0;
let citiesWithVerifiedGeoNamesAdmin1 = 0;
let mismatchedLabelsWithVerifiedGeoNamesAdmin1 = 0;
let missingLabelsWithVerifiedGeoNamesAdmin1 = 0;
const crosswalkByCityKey = new Map(cityCrosswalk.records.map((record) => [
  [record.sourceIso2, record.sourceCity, record.sourceLat, record.sourceLng].join('|'), record,
]));

for (const city of worldCities) {
  if (!city.city || !city.country || !/^[A-Z]{2}$/.test(city.iso2 || '') ||
      !/^[A-Z]{3}$/.test(city.iso3 || '') || !Number.isFinite(city.lat) ||
      !Number.isFinite(city.lng) || Math.abs(city.lat) > 90 || Math.abs(city.lng) > 180) {
    missingCityFields += 1;
    continue;
  }
  sourceCountryLabels.add(city.country);
  const cityCrosswalkRecord = crosswalkByCityKey.get([city.iso2, city.city, city.lat, city.lng].join('|'));
  if (cityCrosswalkRecord?.admin1GeoNamesId) citiesWithVerifiedGeoNamesAdmin1 += 1;
  const sourceCountry = sourceCountriesByIso2.get(city.iso2);
  const directoryCountry = directoryByIso2.get(city.iso2);
  const acceptedIso3 = new Set([directoryCountry?.iso3, ...(directoryCountry?.sourceCodeAliases || []).map((alias) => alias.code)].filter(Boolean));
  if (sourceCountry && directoryCountry && !acceptedIso3.has(city.iso3)) inconsistentIsoCodes += 1;
  if (!directoryCountry) sourceCitiesOutsideCountryDirectory.add(city.iso2);

  const normalizedSettlementKey = [
    city.city,
    city.country,
    city.iso2,
    city.admin_name || '',
    city.lat,
    city.lng,
  ].join('|').normalize('NFKC').toLocaleLowerCase();
  if (settlementKeys.has(normalizedSettlementKey)) duplicateSettlementKeys += 1;
  settlementKeys.add(normalizedSettlementKey);

  if (!city.admin_name) {
    citiesWithoutAdminName += 1;
    if (cityCrosswalkRecord?.admin1GeoNamesId) missingLabelsWithVerifiedGeoNamesAdmin1 += 1;
  } else {
    const divisions = divisionsByIso2.get(city.iso2);
    const normalizedAdmin = city.admin_name.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
    if (!divisions?.has(normalizedAdmin)) {
      cityAdminNotMatchedToDivision += 1;
      if (cityCrosswalkRecord?.admin1GeoNamesId) mismatchedLabelsWithVerifiedGeoNamesAdmin1 += 1;
    }
  }
}

console.log(`Country cards preserved: ${countryDirectory.length}; first-level GeoNames divisions: ${geoDivisionCount}.`);
console.log(`Legacy representative division entries: ${totalDivisions}; representative city entries: ${totalCities}.`);
console.log(`Source city records preserved: ${worldCities.length}; source country labels: ${sourceCountryLabels.size}.`);
console.log(`City records missing required fields: ${missingCityFields}; ISO2/ISO3 inconsistencies: ${inconsistentIsoCodes}.`);
console.log(`City records missing an admin label: ${citiesWithoutAdminName}; admin labels without an exact GeoNames division match: ${cityAdminNotMatchedToDivision}.`);console.log(`Independently verified GeoNames admin1 relationships via place-ID crosswalk: ${citiesWithVerifiedGeoNamesAdmin1}; among those, labels missing: ${missingLabelsWithVerifiedGeoNamesAdmin1}, labels not text-matching the first-level directory: ${mismatchedLabelsWithVerifiedGeoNamesAdmin1}.`);

console.log(`GeoNames admin2 label candidates: ${admin2Candidates.metadata.candidateCount} unique labels across ${admin2Candidates.candidates.reduce((sum, row) => sum + row.cities, 0)} city records; ambiguous labels: ${admin2Candidates.metadata.ambiguousLabelCount}. These do not assert city-parent relationships.`);
console.log(`Repeated city/country/admin/location keys retained: ${duplicateSettlementKeys}.`);
console.log(`City labels outside the 197-country directory (territory aliases require separate parent mapping): ${[...sourceCitiesOutsideCountryDirectory].sort().join(', ') || 'none'}.`);
console.log(`Countries with no GeoNames first-level division records: ${countriesWithoutDivisions.join(', ') || 'none'}.`);

if (missingCityFields || inconsistentIsoCodes || citiesWithoutAdminName || cityAdminNotMatchedToDivision ||
    sourceCitiesOutsideCountryDirectory.size || countriesWithoutDivisions.length) {
  console.error('Geographic relationship validation: NOT COMPLETE; listed city records require research or administrative mapping.');
  process.exitCode = 1;
} else {
  console.log('Geographic relationship validation: VERIFIED COMPLETE.');
}
