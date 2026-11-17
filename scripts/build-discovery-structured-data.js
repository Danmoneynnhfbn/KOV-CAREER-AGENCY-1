const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = process.cwd();
const SITE = "https://www.kovcareeragency.org";
const CATALOG_URL = "urn:kov:career-agency:metadata";
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "PAGE_MANIFEST.json"), "utf8"));
const expandedTaxonomy = require("../assets/expanded-taxonomy.js");
const industries = require("../assets/industry-directory.js").industryDirectory;
const faqs = require("../assets/faq-directory.js").faqDirectory;
const worldCities = require("../assets/world-cities.js").worldCities;

const TAXONOMY_DATASETS = [
  ["audiences", "Professional audiences", "audienceDirectory"],
  ["languages", "Languages", "languageDirectory"],
  ["seniority-levels", "Seniority levels", "seniorityLevels"],
  ["job-functions", "Job functions", "jobFunctionDirectory"],
  ["employment-types", "Employment types", "employmentTypeDirectory"],
  ["career-challenges", "Career challenges", "careerChallengeDirectory"],
  ["search-intents", "Career search intents", "searchIntentDirectory"],
  ["skills", "Professional skills", "skillDirectory"],
  ["qualifications", "Qualifications", "qualificationDirectory"],
  ["professional-synonyms", "Professional synonyms and related terminology", "professionalSynonymDirectory"],
  ["institutions", "Organizations and institutions", "institutionDirectory"],
];
const TAXONOMY_SEARCH_INDEX = new Map();
for (const [id, , key] of TAXONOMY_DATASETS) {
  const byToken = new Map();
  for (const record of expandedTaxonomy[key] || []) {
    const label = record.name || record.label || record.title || record.term || record.query || "";
    const phrase = label.toLocaleLowerCase("en").normalize("NFKC")
      .replace(/[-_/]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (phrase.length < 5) continue;
    const firstToken = phrase.split(" ").find((token) => token.length >= 4);
    if (!firstToken) continue;
    if (!byToken.has(firstToken)) byToken.set(firstToken, []);
    byToken.get(firstToken).push({ record, label, phrase });
  }
  for (const records of byToken.values()) records.sort((left, right) => right.phrase.length - left.phrase.length);
  TAXONOMY_SEARCH_INDEX.set(id, byToken);
}
const CITY_SEARCH_INDEX = new Map();
for (const place of worldCities) {
  const label = place.city || place.city_ascii || "";
  const phrase = label.toLocaleLowerCase("en").normalize("NFKC")
    .replace(/[-_/]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const firstToken = phrase.split(" ").find((token) => token.length >= 5);
  if (!firstToken) continue;
  if (!CITY_SEARCH_INDEX.has(firstToken)) CITY_SEARCH_INDEX.set(firstToken, []);
  CITY_SEARCH_INDEX.get(firstToken).push({ place, label, phrase });
}
for (const places of CITY_SEARCH_INDEX.values()) places.sort((left, right) => right.phrase.length - left.phrase.length);

const COUNTRIES = [
  ["Afghanistan", "AF"], ["Albania", "AL"], ["Algeria", "DZ"], ["Andorra", "AD"],
  ["Angola", "AO"], ["Antigua and Barbuda", "AG"], ["Argentina", "AR"], ["Armenia", "AM"],
  ["Australia", "AU"], ["Austria", "AT"], ["Azerbaijan", "AZ"], ["Bahamas", "BS"],
  ["Bahrain", "BH"], ["Bangladesh", "BD"], ["Barbados", "BB"], ["Belarus", "BY"],
  ["Belgium", "BE"], ["Belize", "BZ"], ["Benin", "BJ"], ["Bhutan", "BT"],
  ["Bolivia", "BO"], ["Bosnia and Herzegovina", "BA"], ["Botswana", "BW"], ["Brazil", "BR"],
  ["Brunei", "BN"], ["Bulgaria", "BG"], ["Burkina Faso", "BF"], ["Burundi", "BI"],
  ["Cabo Verde", "CV"], ["Cambodia", "KH"], ["Cameroon", "CM"], ["Canada", "CA"],
  ["Central African Republic", "CF"], ["Chad", "TD"], ["Chile", "CL"], ["China", "CN"],
  ["Colombia", "CO"], ["Comoros", "KM"], ["Republic of the Congo", "CG"], ["Costa Rica", "CR"],
  ["Côte d'Ivoire", "CI"], ["Croatia", "HR"], ["Cuba", "CU"], ["Cyprus", "CY"],
  ["Czechia", "CZ"], ["Democratic Republic of the Congo", "CD"], ["Denmark", "DK"],
  ["Djibouti", "DJ"], ["Dominica", "DM"], ["Dominican Republic", "DO"], ["Ecuador", "EC"],
  ["Egypt", "EG"], ["El Salvador", "SV"], ["Equatorial Guinea", "GQ"], ["Eritrea", "ER"],
  ["Estonia", "EE"], ["Eswatini", "SZ"], ["Ethiopia", "ET"], ["Fiji", "FJ"],
  ["Finland", "FI"], ["France", "FR"], ["Gabon", "GA"], ["Gambia", "GM"],
  ["Georgia", "GE"], ["Germany", "DE"], ["Ghana", "GH"], ["Greece", "GR"],
  ["Grenada", "GD"], ["Guatemala", "GT"], ["Guinea", "GN"], ["Guinea-Bissau", "GW"],
  ["Guyana", "GY"], ["Haiti", "HT"], ["Honduras", "HN"], ["Hungary", "HU"],
  ["Iceland", "IS"], ["India", "IN"], ["Indonesia", "ID"], ["Iran", "IR"],
  ["Iraq", "IQ"], ["Ireland", "IE"], ["Israel", "IL"], ["Italy", "IT"],
  ["Jamaica", "JM"], ["Japan", "JP"], ["Jordan", "JO"], ["Kazakhstan", "KZ"],
  ["Kenya", "KE"], ["Kiribati", "KI"], ["Kosovo", "XK"], ["Kuwait", "KW"],
  ["Kyrgyzstan", "KG"], ["Laos", "LA"], ["Latvia", "LV"], ["Lebanon", "LB"],
  ["Lesotho", "LS"], ["Liberia", "LR"], ["Libya", "LY"], ["Liechtenstein", "LI"],
  ["Lithuania", "LT"], ["Luxembourg", "LU"], ["Madagascar", "MG"], ["Malawi", "MW"],
  ["Malaysia", "MY"], ["Maldives", "MV"], ["Mali", "ML"], ["Malta", "MT"],
  ["Marshall Islands", "MH"], ["Mauritania", "MR"], ["Mauritius", "MU"], ["Mexico", "MX"],
  ["Micronesia", "FM"], ["Moldova", "MD"], ["Monaco", "MC"], ["Mongolia", "MN"],
  ["Montenegro", "ME"], ["Morocco", "MA"], ["Mozambique", "MZ"], ["Myanmar", "MM"],
  ["Namibia", "NA"], ["Nauru", "NR"], ["Nepal", "NP"], ["Netherlands", "NL"],
  ["New Zealand", "NZ"], ["Nicaragua", "NI"], ["Niger", "NE"], ["Nigeria", "NG"],
  ["North Korea", "KP"], ["North Macedonia", "MK"], ["Norway", "NO"], ["Oman", "OM"],
  ["Pakistan", "PK"], ["Palau", "PW"], ["Palestine", "PS"], ["Panama", "PA"],
  ["Papua New Guinea", "PG"], ["Paraguay", "PY"], ["Peru", "PE"], ["Philippines", "PH"],
  ["Poland", "PL"], ["Portugal", "PT"], ["Qatar", "QA"], ["Romania", "RO"],
  ["Russia", "RU"], ["Rwanda", "RW"], ["Saint Kitts and Nevis", "KN"], ["Saint Lucia", "LC"],
  ["Saint Vincent and the Grenadines", "VC"], ["Samoa", "WS"], ["San Marino", "SM"],
  ["Sao Tome and Principe", "ST"], ["Saudi Arabia", "SA"], ["Senegal", "SN"], ["Serbia", "RS"],
  ["Seychelles", "SC"], ["Sierra Leone", "SL"], ["Singapore", "SG"], ["Slovakia", "SK"],
  ["Slovenia", "SI"], ["Solomon Islands", "SB"], ["Somalia", "SO"], ["South Africa", "ZA"],
  ["South Korea", "KR"], ["South Sudan", "SS"], ["Spain", "ES"], ["Sri Lanka", "LK"],
  ["Sudan", "SD"], ["Suriname", "SR"], ["Sweden", "SE"], ["Switzerland", "CH"],
  ["Syria", "SY"], ["Taiwan", "TW"], ["Tajikistan", "TJ"], ["Tanzania", "TZ"],
  ["Thailand", "TH"], ["Timor-Leste", "TL"], ["Togo", "TG"], ["Tonga", "TO"],
  ["Trinidad and Tobago", "TT"], ["Tunisia", "TN"], ["Türkiye", "TR"], ["Turkmenistan", "TM"],
  ["Tuvalu", "TV"], ["Uganda", "UG"], ["Ukraine", "UA"], ["United Arab Emirates", "AE"],
  ["United Kingdom", "GB"], ["United States", "US"], ["Uruguay", "UY"], ["Uzbekistan", "UZ"],
  ["Vanuatu", "VU"], ["Vatican City", "VA"], ["Venezuela", "VE"], ["Vietnam", "VN"],
  ["Yemen", "YE"], ["Zambia", "ZM"], ["Zimbabwe", "ZW"],
];

const ROLE_ALIASES = {
  ceo: ["Chief Executive Officer", "CEO"],
  cfo: ["Chief Financial Officer", "CFO"],
  cmo: ["Chief Marketing Officer", "CMO"],
  coo: ["Chief Operating Officer", "COO"],
  cpo: ["Chief Product Officer", "CPO"],
  cro: ["Chief Revenue Officer", "CRO"],
  cto: ["Chief Technology Officer", "CTO"],
  "board-director": ["Board Director", "Board Member"],
  chair: ["Chair", "Chairperson", "Chairman"],
  "chief-product-officer": ["Chief Product Officer", "CPO"],
  "chief-revenue-officer": ["Chief Revenue Officer", "CRO"],
};

const INDUSTRIES = {
  "agriculture-food-forestry": ["Agriculture, Food and Forestry", ["Agriculture", "Food production", "Forestry"]],
  "arts-entertainment-sports": ["Arts, Entertainment and Sports", ["Arts and entertainment", "Sports"]],
  "business-support-facilities": ["Business Support and Facilities", ["Business operations", "Facilities management"]],
  "construction-engineering": ["Construction and Engineering", ["Construction", "Engineering"]],
  "consulting-professional-services": ["Consulting and Professional Services", ["Consulting"]],
  education: ["Education", ["Education"]],
  "energy-mining-oil-gas": ["Energy, Mining and Oil and Gas", ["Energy", "Mining"]],
  "finance-insurance": ["Finance and Insurance", ["Finance and accounting", "Banking"]],
  "healthcare-social-care": ["Healthcare and Social Care", ["Healthcare"]],
  "holding-companies": ["Holding Companies", ["Business leadership", "Finance"]],
  "hospitality-food-service": ["Hospitality and Food Service", ["Hospitality", "Food service"]],
  "legal-services": ["Legal Services", ["Legal"]],
  manufacturing: ["Manufacturing", ["Manufacturing", "Engineering"]],
  "other-services": ["Other Services", ["Professional services"]],
  "public-sector-government": ["Public Sector and Government", ["Public sector", "Government"]],
  "real-estate-leasing": ["Real Estate and Leasing", ["Real estate"]],
  "retail-ecommerce": ["Retail and E-commerce", ["Retail", "E-commerce"]],
  "technology-media-telecom": ["Technology, Media and Telecommunications", ["Technology and IT", "Software engineering", "Data and analytics"]],
  "transportation-logistics": ["Transportation and Logistics", ["Transportation", "Logistics"]],
  utilities: ["Utilities", ["Utilities", "Engineering"]],
  "wholesale-distribution": ["Wholesale and Distribution", ["Wholesale", "Distribution"]],
};

const SERVICE_TOPICS = [
  ["ATS optimization", /\bats\b|applicant tracking/i],
  ["Career development", /career|coaching|professional development/i],
  ["Career transitions", /career transition|career change|transition/i],
  ["Executive career representation", /executive|reverse recruiting|career representation/i],
  ["International career opportunities", /international|global|market|country|worldwide/i],
  ["Job-search strategy", /job search|job-search|reverse recruiting/i],
  ["Leadership opportunities", /executive|leader|director|chief|board/i],
  ["LinkedIn profile optimization", /linkedin/i],
  ["Professional positioning", /positioning|professional profile/i],
  ["Professional profile assessment", /profile assessment|career assessment/i],
  ["Professional visibility", /linkedin|portfolio|personal career website|resume|cv/i],
  ["Resume and CV services", /resume|cv writing|curriculum vitae/i],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function hash(value) {
  return crypto.createHash("sha256").update(normalize(value), "utf8").digest("hex").slice(0, 20);
}

function idFor(kind, value, ordinal = "") {
  const digest = crypto.createHash("sha256").update(String(value), "utf8").digest("hex").slice(0, 20);
  return `${CATALOG_URL}#${kind}-${digest}${ordinal ? `-${ordinal}` : ""}`;
}

function escapeJsonForHtml(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSingleColumnCsv(text) {
  const rows = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      rows.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  if (value.length) rows.push(value);
  return rows;
}

function loadTerms() {
  const dataDirectory = path.join(ROOT, "town-role-insitutution");
  const jobPath = path.join(dataDirectory, "KOV_Job_Titles_Expanded_98380.txt");
  const occupationPath = path.join(dataDirectory, "KOV_Occupations_Expanded_1655.csv");
  const originalJobPath = path.join(dataDirectory, "job-titles.txt");
  const originalOccupationPath = path.join(dataDirectory, "occupations.csv");
  const jobTitles = fs.readFileSync(jobPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const occupationRows = parseSingleColumnCsv(fs.readFileSync(occupationPath, "utf8").replace(/^\uFEFF/, ""));
  assert(occupationRows[0]?.trim().toLowerCase() === "occupations", "Unexpected occupation CSV header.");
  const occupations = occupationRows.slice(1).map((s) => s.trim()).filter(Boolean);
  const originalJobTitles = fs.readFileSync(originalJobPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const originalOccupationRows = parseSingleColumnCsv(fs.readFileSync(originalOccupationPath, "utf8").replace(/^\uFEFF/, ""));
  assert(originalOccupationRows[0]?.trim().toLowerCase() === "occupations", "Unexpected original occupation CSV header.");
  const originalOccupations = originalOccupationRows.slice(1).map((s) => s.trim()).filter(Boolean);

  assert(jobTitles.length === 98380, `Expected 98,380 expanded job titles; found ${jobTitles.length}.`);
  assert(occupations.length === 1655, `Expected 1,655 expanded occupations; found ${occupations.length}.`);
  assert(unique(occupations).length === occupations.length, "Duplicate expanded occupations found.");
  const expandedJobTitles = new Set(jobTitles.map(normalize));
  const expandedOccupations = new Set(occupations.map(normalize));
  assert(originalJobTitles.every((title) => expandedJobTitles.has(normalize(title))), "Expanded job-title list does not preserve every original title.");
  assert(originalOccupations.every((name) => expandedOccupations.has(normalize(name))), "Expanded occupation list does not preserve every original occupation.");

  return { jobTitles, occupations };
}

function refItems(items) {
  return items.map((item) => ({ "@id": item }));
}

function addList(graph, { id, name, items }) {
  graph.push({
    "@type": "ItemList",
    "@id": id,
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@id": item },
    })),
  });
}

function writeCatalog(jobTitles, occupations) {
  assert(COUNTRIES.length === 197, `Expected 197 country entries; found ${COUNTRIES.length}.`);
  assert(new Set(COUNTRIES.map(([, code]) => code)).size === COUNTRIES.length, "Duplicate country identifiers found.");
  assert(new Set(COUNTRIES.map(([name]) => normalize(name))).size === COUNTRIES.length, "Duplicate country names found.");

  const catalogId = `${CATALOG_URL}#catalog`;
  const countrySetId = `${CATALOG_URL}#countries`;
  const jobSetId = `${CATALOG_URL}#job-titles`;
  const occupationSetId = `${CATALOG_URL}#occupations`;
  const countryListId = `${CATALOG_URL}#country-list`;
  const occupationListId = `${CATALOG_URL}#occupation-list`;
  const jobTermSetId = `${CATALOG_URL}#job-title-terms`;
  const graph = [
    {
      "@type": "DataCatalog",
      "@id": catalogId,
      name: "KOV Career Agency Discovery Reference Catalog",
      url: CATALOG_URL,
      publisher: { "@id": `${SITE}/#organization` },
      description: "Reference lists for country, job-title and occupation discovery. Inclusion does not claim that KOV has an office, branch, client, vacancy or established operation in a country, or that KOV offers a service for every listed role.",
      dataset: refItems([
        countrySetId,
        jobSetId,
        occupationSetId,
        ...TAXONOMY_DATASETS.map(([id]) => `${CATALOG_URL}#dataset-${id}`),
        `${CATALOG_URL}#dataset-industries`,
        `${CATALOG_URL}#dataset-faqs`,
        `${CATALOG_URL}#dataset-cities`,
        `${CATALOG_URL}#dataset-towns`,
      ]),
    },
    {
      "@type": "Dataset",
      "@id": countrySetId,
      name: "197-country international reference list",
      description: "A country-name and ISO 3166-1 alpha-2 reference list for geographical discovery. It does not define KOV service coverage or physical operations.",
      includedInDataCatalog: { "@id": catalogId },
      mentions: { "@id": countryListId },
      distribution: {
        "@type": "DataDownload",
        contentUrl: CATALOG_URL,
        encodingFormat: "application/ld+json",
      },
    },
    {
      "@type": "Dataset",
      "@id": jobSetId,
      name: "Complete job-title reference list",
      description: `Every nonblank entry from KOV_Job_Titles_Expanded_98380.txt (${jobTitles.length} entries), which preserves every original job title. This is a career-discovery reference, not a vacancy list or a promise of service for every title.`,
      includedInDataCatalog: { "@id": catalogId },
      hasPart: [
        { "@id": jobTermSetId },
      ],
      distribution: {
        "@type": "DataDownload",
        contentUrl: CATALOG_URL,
        encodingFormat: "application/ld+json",
      },
    },
    {
      "@type": "Dataset",
      "@id": occupationSetId,
      name: "Complete occupation reference list",
      description: `Every nonblank entry from KOV_Occupations_Expanded_1655.csv (${occupations.length} distinct occupations), which preserves every original occupation. The list is a reference taxonomy, not a vacancy list or a promise of service for every occupation.`,
      includedInDataCatalog: { "@id": catalogId },
      mentions: { "@id": occupationListId },
      distribution: {
        "@type": "DataDownload",
        contentUrl: CATALOG_URL,
        encodingFormat: "application/ld+json",
      },
    },
    {
      "@type": "DefinedTermSet",
      "@id": jobTermSetId,
      name: "Job-title terms from the existing project source list",
      hasDefinedTerm: refItems(jobTitles.map((title, index) => idFor("job-title", title, index + 1))),
    },
  ];

  const taxonomyDistribution = {
    "@type": "DataDownload",
    contentUrl: `${SITE}/data/taxonomy/verified-expanded-taxonomy.json`,
    encodingFormat: "application/json",
  };
  for (const [id, name, key] of TAXONOMY_DATASETS) {
    const records = expandedTaxonomy[key];
    assert(Array.isArray(records), `Missing taxonomy dataset ${key}.`);
    graph.push({
      "@type": "Dataset",
      "@id": `${CATALOG_URL}#dataset-${id}`,
      name,
      description: `${records.length} source-backed records in the ${name.toLocaleLowerCase("en")} reference collection. Record identifiers and provenance fields are retained in the downloadable JSON distribution. Career-search entries are explicitly editorial hypotheses, not observed Search Console queries.`,
      numberOfItems: records.length,
      includedInDataCatalog: { "@id": catalogId },
      distribution: taxonomyDistribution,
    });
  }
  const industries = require("../assets/industry-directory.js").industryDirectory;
  const faqs = require("../assets/faq-directory.js").faqDirectory;
  for (const [id, name, records] of [
    ["industries", "Industry classifications", industries],
    ["faqs", "Frequently asked questions", faqs],
  ]) {
    assert(Array.isArray(records) && records.length > 0, `Missing ${name} records.`);
    graph.push({
      "@type": "Dataset",
      "@id": `${CATALOG_URL}#dataset-${id}`,
      name,
      description: `${records.length} existing project records in the ${name.toLocaleLowerCase("en")} collection.`,
      numberOfItems: records.length,
      includedInDataCatalog: { "@id": catalogId },
      distribution: {
        "@type": "DataDownload",
        contentUrl: id === "industries"
          ? `${SITE}/assets/industry-directory.js`
          : `${SITE}/assets/faq-directory.js`,
        encodingFormat: "application/javascript",
      },
    });
  }

  const countryIds = [];
  for (const [name, code] of COUNTRIES) {
    const id = `${CATALOG_URL}#country-${code.toLowerCase()}`;
    countryIds.push(id);
    graph.push({
      "@type": "Country",
      "@id": id,
      name,
      identifier: {
        "@type": "PropertyValue",
        propertyID: code === "XK" ? "ISO 3166-1 alpha-2 (user-assigned)" : "ISO 3166-1 alpha-2",
        value: code,
      },
    });
  }

  for (const [index, title] of jobTitles.entries()) {
    const id = idFor("job-title", title, index + 1);
    graph.push({
      "@type": "DefinedTerm",
      "@id": id,
      name: title,
    });
  }

  const occupationIds = [];
  for (const name of occupations) {
    const id = idFor("occupation", name);
    occupationIds.push(id);
    graph.push({
      "@type": "Occupation",
      "@id": id,
      name,
    });
  }

  addList(graph, { id: countryListId, name: "197 countries", items: countryIds });
  addList(graph, { id: occupationListId, name: "All source occupations", items: occupationIds });

  return {
    catalogId,
    countryListId,
    occupationListId,
    datasetRows: [
      ...TAXONOMY_DATASETS.map(([id, name, key]) => [id, name, expandedTaxonomy[key].length]),
      ["job-titles", "Job titles", jobTitles.length],
      ["occupations", "Occupations", occupations.length],
      ["industries", "Industries", industries.length],
      ["faqs", "Frequently asked questions", faqs.length],
      ["countries", "Countries", COUNTRIES.length],
      ["cities", "Cities and populated places", worldCities.length],
      ["towns", "Towns and localities", 1323],
    ],
    jobTitleIds: new Map(jobTitles.map((name, index) => [normalize(name), idFor("job-title", name, index + 1)])),
    occupationIds: new Map(occupations.map((name) => [normalize(name), idFor("occupation", name)])),
    countries: new Map(COUNTRIES.map(([name, code]) => [normalize(name), { id: `${CATALOG_URL}#country-${code.toLowerCase()}`, name, code }])),
  };
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function attributes(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attrs[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function htmlMetadata(html, filePath) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, "").trim()) : "";
  let description = "";
  let canonical = "";
  let language = "en";
  let redirect = false;
  for (const tag of html.matchAll(/<(meta|link|html)\b[^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    if (tag[1].toLowerCase() === "meta" && attrs.name?.toLowerCase() === "description") description = attrs.content || "";
    if (tag[1].toLowerCase() === "meta" && attrs["http-equiv"]?.toLowerCase() === "refresh") redirect = true;
    if (tag[1].toLowerCase() === "link" && attrs.rel?.toLowerCase().split(/\s+/).includes("canonical")) canonical = attrs.href || "";
    if (tag[1].toLowerCase() === "html" && attrs.lang) language = attrs.lang;
  }
  const inferred = urlFromPath(filePath);
  let url = inferred;
  if (canonical) {
    try {
      const canonicalUrl = new URL(canonical, `${SITE}/`);
      if (["www.kovcareeragency.org", "kovcareeragency.org"].includes(canonicalUrl.hostname)) url = canonicalUrl.href;
    } catch {}
  }
  if (!description && redirect) description = `This page redirects to ${url}.`;
  if (!title) {
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i);
    title = h1 ? decodeHtml(h1[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) : titleCase(path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, " "));
  }
  if (!description) {
    const paragraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/i);
    if (paragraph) description = decodeHtml(paragraph[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 300);
  }
  return { title, description, url, language };
}

function escapeAttribute(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ensureHeadMetadata(html, meta, filePath) {
  let headEnd = html.search(/<\/head\s*>/i);
  if (headEnd < 0) {
    const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi)].map((match) => match[0]);
    html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi, "");
    const htmlTag = html.match(/<html\b[^>]*>/i);
    const insertion = `<head>${jsonLd.join("\n")}</head>`;
    html = htmlTag
      ? html.replace(htmlTag[0], `${htmlTag[0]}${insertion}`)
      : `${insertion}${html}`;
    headEnd = html.search(/<\/head\s*>/i);
  }
  let head = html.slice(0, headEnd);
  const hasTitle = /<title\b/i.test(head);
  if (!hasTitle && meta.title) head += `<title>${escapeAttribute(meta.title)}</title>\n`;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const present = (key, value) => metas.some((item) => item[key]?.toLocaleLowerCase("en") === value.toLocaleLowerCase("en"));
  const addMeta = (key, value, content) => {
    if (!content || present(key, value)) return;
    head += `<meta ${key}="${escapeAttribute(value)}" content="${escapeAttribute(content)}">\n`;
  };
  addMeta("name", "description", meta.description || `${meta.title}.`);
  addMeta("property", "og:type", "website");
  addMeta("property", "og:url", meta.url);
  addMeta("property", "og:title", meta.title);
  addMeta("property", "og:description", meta.description || `${meta.title}.`);
  const privateOrReference = /^(?:\.private_admin|_design-reference|design-reference|vscode)(?:\/|$)/i.test(filePath.replace(/\\/g, "/"));
  const hasImage = metas.some((item) => item.property?.toLocaleLowerCase("en") === "og:image");
  if (!hasImage && !privateOrReference && fs.existsSync(path.join(ROOT, "preview.png"))) {
    addMeta("property", "og:image", `${SITE}/preview.png`);
    addMeta("property", "og:image:alt", "KOV Career Agency");
  }
  addMeta("name", "twitter:card", hasImage || (!privateOrReference && fs.existsSync(path.join(ROOT, "preview.png"))) ? "summary_large_image" : "summary");
  addMeta("name", "twitter:title", meta.title);
  addMeta("name", "twitter:description", meta.description || `${meta.title}.`);
  const imageTag = metas.find((item) => item.property?.toLocaleLowerCase("en") === "og:image");
  const image = imageTag?.content || (!privateOrReference && fs.existsSync(path.join(ROOT, "preview.png")) ? `${SITE}/preview.png` : "");
  addMeta("name", "twitter:image", image);
  return head + html.slice(headEnd);
}

function preservedDirectives(html) {
  return [...html.matchAll(/<(?:meta|link)\b[^>]*(?:name\s*=\s*["']robots["']|rel\s*=\s*["'][^"']*canonical[^"']*["'])[^>]*>/gi)]
    .map((match) => match[0]);
}

function bodyMarkup(html) {
  const start = html.search(/<body\b/i);
  if (start < 0) return html
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/i, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi, "");
  const end = html.search(/<\/body\s*>/i);
  return html.slice(start, end < 0 ? html.length : end + 7);
}

function urlFromPath(filePath) {
  const relative = filePath.replace(/\\/g, "/");
  return relative.endsWith("/index.html")
    ? `${SITE}/${relative.slice(0, -"index.html".length)}`
    : relative === "index.html"
      ? `${SITE}/`
      : `${SITE}/${relative}`;
}

function graphNodes(document) {
  if (Array.isArray(document)) return document;
  if (Array.isArray(document["@graph"])) return document["@graph"];
  return [document];
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function mergeValue(previous, incoming) {
  if (stable(previous) === stable(incoming)) return previous;
  const values = [...(Array.isArray(previous) ? previous : [previous]), ...(Array.isArray(incoming) ? incoming : [incoming])];
  const seen = new Set();
  return values.filter((value) => {
    const key = stable(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeNode(existing, incoming) {
  for (const [key, value] of Object.entries(incoming)) {
    if (key === "@type") {
      existing[key] = unique([...(Array.isArray(existing[key]) ? existing[key] : existing[key] ? [existing[key]] : []), ...(Array.isArray(value) ? value : [value])]);
    } else {
      existing[key] = Object.hasOwn(existing, key) ? mergeValue(existing[key], value) : value;
    }
  }
  return existing;
}

function addType(node, type) {
  const types = Array.isArray(node["@type"]) ? node["@type"] : node["@type"] ? [node["@type"]] : [];
  if (!types.includes(type)) types.push(type);
  node["@type"] = types;
}

function scriptDocument(nodes) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

function makeTag(existingTag, json) {
  const openingEnd = existingTag.indexOf(">");
  let opening = existingTag.slice(0, openingEnd + 1);
  if (!/\bdata-kov\s*=/i.test(opening)) opening = opening.slice(0, -1) + ' data-kov="discovery">';
  else opening = opening.replace(/\bdata-kov\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, 'data-kov="discovery"');
  return `${opening}${escapeJsonForHtml(json)}</script>`;
}

function titleCase(value) {
  return value.split(/[-\s]+/).filter(Boolean).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function pageRole(relative) {
  const parts = relative.replace(/\\/g, "/").split("/");
  if (parts[0] !== "roles") return null;
  const key = parts[1]?.replace(/\.html$/, "");
  const aliases = ROLE_ALIASES[key];
  if (aliases) return { key, name: aliases[0], aliases };
  if (key && key !== "index.html") {
    const name = titleCase(key);
    return { key, name, aliases: [name] };
  }
  const file = parts.at(-1)?.replace(/\.html$/, "") || "";
  for (const [roleKey, roleAliases] of Object.entries(ROLE_ALIASES)) {
    if (file.includes(roleKey)) return { key: roleKey, name: roleAliases[0], aliases: roleAliases };
  }
  return null;
}

function relevantCountryAndPlaces(meta, relative, catalog) {
  const text = `${relative} ${meta.title}`.toLocaleLowerCase("en");
  const countries = [];
  for (const country of catalog.countries.values()) {
    const escaped = country.name.toLocaleLowerCase("en").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(text)) countries.push(country);
  }
  if (/\buae\b/i.test(text) && !countries.some((item) => item.code === "AE")) countries.push(catalog.countries.get("united arab emirates"));

  const places = [];
  if (/\bdubai\b/i.test(text)) places.push({ name: "Dubai", country: "United Arab Emirates" });
  if (/\blondon\b/i.test(text)) places.push({ name: "London", country: "United Kingdom" });
  if (/\bafrica\b/i.test(text)) places.push({ name: "Africa" });
  return { countries: unique(countries.map((entry) => entry.code)).map((code) => countries.find((entry) => entry.code === code)), places };
}

function pageClassification(row, relative, meta) {
  const lower = `${relative} ${meta.title} ${meta.description}`.toLocaleLowerCase("en");
  const audiences = [];
  if (/\b(senior|executive|chief|ceo|cfo|cmo|coo|cto|cro|director|board)\b/.test(lower)) audiences.push("Senior professionals");
  if (/\b(executive|chief|ceo|cfo|cmo|coo|cto|cro)\b/.test(lower)) audiences.push("Executives");
  if (/\b(c-suite|chief|ceo|cfo|cmo|coo|cto|cro)\b/.test(lower)) audiences.push("C-suite professionals");
  if (/\b(board|director)\b/.test(lower)) audiences.push("Directors");
  if (/\b(manager|management)\b/.test(lower)) audiences.push("Managers");
  if (/\b(career transition|career change|changing careers)\b/.test(lower)) audiences.push("Career changers");
  if (/\b(job search|job-search|job seeker|jobseeker|reverse recruiting|career representation)\b/.test(lower)) audiences.push("Job seekers");
  if (/\b(exploring|opportunities|career development|career coaching)\b/.test(lower)) audiences.push("Professionals exploring new opportunities");
  if (row.template_type === "service" && audiences.length === 0) audiences.push("Professionals exploring new opportunities");

  const topics = SERVICE_TOPICS.filter(([, pattern]) => pattern.test(lower)).map(([name]) => name);
  const industrySlug = relative.replace(/\\/g, "/").match(/^(?:industries|roles\/[^/]+)\/([^/]+)(?:\/index\.html|\.html)$/)?.[1];
  const industry = industrySlug ? INDUSTRIES[industrySlug] : null;
  if (industry) topics.push(...industry[1]);
  return {
    audiences: unique(audiences),
    topics: unique(topics),
    industry: industry ? industry[0] : null,
  };
}

function taxonomyRecordsForPage(key, corpus, limit = 6) {
  const normalizedCorpus = normalize(corpus).replace(/[-_/]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const datasetId = TAXONOMY_DATASETS.find(([, , directory]) => directory === key)?.[0];
  const byToken = TAXONOMY_SEARCH_INDEX.get(datasetId);
  if (!byToken) return [];
  const candidates = new Set();
  for (const token of new Set(normalizedCorpus.split(" ").filter((word) => word.length >= 4))) {
    for (const item of byToken.get(token) || []) candidates.add(item);
  }
  const matches = [];
  const seen = new Set();
  for (const item of candidates) {
    if (!normalizedCorpus.includes(item.phrase)) continue;
    const id = item.record.id || item.record.code || item.record.uri || item.label;
    if (seen.has(id)) continue;
    seen.add(id);
    matches.push(item);
    matches.sort((left, right) => right.phrase.length - left.phrase.length);
    if (matches.length > limit) matches.pop();
  }
  return matches;
}

function cityRecordsForPage(corpus, limit = 8) {
  const normalizedCorpus = normalize(corpus).replace(/[-_/]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const candidates = new Set();
  for (const token of new Set(normalizedCorpus.split(" ").filter((word) => word.length >= 5))) {
    for (const item of CITY_SEARCH_INDEX.get(token) || []) candidates.add(item);
  }
  const matches = [];
  for (const item of candidates) {
    if (!normalizedCorpus.includes(item.phrase)) continue;
    matches.push(item);
    matches.sort((left, right) => right.phrase.length - left.phrase.length);
    if (matches.length > limit) matches.pop();
  }
  return matches;
}

function pageType(row, relative) {
  const types = ["WebPage"];
  const lower = relative.toLocaleLowerCase("en");
  if (row.template_type === "about" || /kov-founder-profile/.test(lower)) types.push("AboutPage");
  if (row.template_type === "contact" || /contact|book-confidential-consultation/.test(lower)) types.push("ContactPage");
  if (["blog index", "country page", "FAQ library index"].includes(row.template_type)
    || /^(roles\.html|industries\.html|industries\/index\.html|glossary\.html|countries-we-serve\.html|faqs\.html)$/.test(relative.replace(/\\/g, "/"))) {
    types.push("CollectionPage");
  }
  return types;
}

function breadcrumbsFor(relative, meta, pageByPath) {
  const normalized = relative.replace(/\\/g, "/");
  const segments = normalized.split("/");
  const isIndex = segments.at(-1) === "index.html";
  const dirs = isIndex ? segments.slice(0, -1) : segments.slice(0, -1);
  const items = [{ name: "Home", url: `${SITE}/` }];
  for (let i = 1; i <= dirs.length; i += 1) {
    const prefix = dirs.slice(0, i).join("/");
    if (prefix === ".private_admin") continue;
    let parentPath = `${prefix}/index.html`;
    if (prefix === "roles" && pageByPath.has("roles.html")) parentPath = "roles.html";
    if (prefix === "industries" && pageByPath.has("industries/index.html")) parentPath = "industries/index.html";
    const parent = pageByPath.get(parentPath);
    if (!parent || parent.url === meta.url || items.some((item) => item.url === parent.url)) continue;
    items.push({ name: parent.title || titleCase(prefix.split("/").at(-1)), url: parent.url });
  }
  items.push({ name: meta.title || titleCase(path.basename(normalized, ".html")), url: meta.url });
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  }));
}

function buildScriptIndexes(html) {
  const scripts = [];
  for (const match of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)) {
    if (!/type=["']application\/ld\+json["']/i.test(match[0].slice(0, match[0].indexOf(">") + 1))) continue;
    const openEnd = match[0].indexOf(">");
    const closeStart = match[0].toLowerCase().lastIndexOf("</script");
    const root = JSON.parse(match[0].slice(openEnd + 1, closeStart).trim());
    const nodes = graphNodes(root);
    scripts.push({
      start: match.index,
      end: match.index + match[0].length,
      tag: match[0],
      root,
      nodes,
      hadDiscovery: /\bdata-kov=["']discovery["']/i.test(match[0].slice(0, openEnd + 1)),
      dirty: false,
    });
  }
  return scripts;
}

function locateNode(scripts, predicate) {
  for (const script of scripts) {
    for (const node of script.nodes) {
      if (node && typeof node === "object" && predicate(node)) return { script, node };
    }
  }
  return null;
}

function ensureNode(scripts, target, node) {
  const existing = locateNode(scripts, (candidate) => candidate["@id"] === node["@id"]);
  if (existing) {
    mergeNode(existing.node, node);
    existing.script.dirty = true;
    return existing.node;
  }
  target.nodes.push(node);
  target.dirty = true;
  return node;
}

function renderPage(html, scripts, target, pagePath) {
  let output = html;
  if (scripts.length === 0) {
    const headInsertion = html.search(/<\/head\s*>/i);
    const bodyInsertion = headInsertion >= 0 ? headInsertion : html.search(/<\/body\s*>/i);
    const index = bodyInsertion >= 0 ? bodyInsertion : html.length;
    const tag = `<script type="application/ld+json" data-kov="discovery">${escapeJsonForHtml(scriptDocument(target.nodes))}</script>`;
    return html.slice(0, index) + tag + html.slice(index);
  }
  const replace = [];
  for (const script of scripts) {
    if (script === target) {
      const currentTag = output.slice(script.start, script.end);
      const document = scriptDocument(script.nodes);
      replace.push({ start: script.start, end: script.end, text: makeTag(currentTag, document) });
    } else {
      replace.push({ start: script.start, end: script.end, text: "" });
    }
  }
  for (const item of replace.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, item.start) + item.text + output.slice(item.end);
  }
  return output;
}

function setOrAdd(node, key, value) {
  if (value === undefined || value === null || value === "") return;
  node[key] = value;
}

function stripExternalJsonCatalogReferences(nodes) {
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean).filter((item) => item !== undefined);
    if (!value || typeof value !== "object") return value;
    if (typeof value["@id"] === "string" && /\/data\/[^/]+\.jsonld(?:#|$)/i.test(value["@id"])) {
      return undefined;
    }
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = clean(item);
      if (cleaned !== undefined) output[key] = cleaned;
    }
    return output;
  }
  return nodes.map(clean).filter((node) => node !== undefined);
}

function processPage(row, catalog, pageByPath, stats) {
  const filePath = row.path;
  const absolutePath = path.join(ROOT, filePath);
  const original = fs.readFileSync(absolutePath, "utf8");
  const meta = { ...htmlMetadata(original, filePath), ...pageByPath.get(filePath.replace(/\\/g, "/")) };
  if (!meta.description) meta.description = `${meta.title || "Career information"}.`;
  assert(meta.url.startsWith(`${SITE}/`), `Unexpected page URL for ${filePath}: ${meta.url}`);
  const originalScripts = buildScriptIndexes(original);
  const originalNodeCount = originalScripts.reduce((sum, script) => sum + script.nodes.length, 0);
  const pageScript = locateNode(originalScripts, (node) => {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("WebPage") && (node.url === meta.url || node["@id"]?.startsWith(`${meta.url}#`));
  })?.script
    || originalScripts.find((script) => script.hadDiscovery)
    || originalScripts[0]
    || { nodes: [], dirty: true, hadDiscovery: false, start: -1, end: -1 };
  const mergedNodes = [];
  const nodesById = new Map();
  for (const script of originalScripts) {
    for (const node of script.nodes) {
      if (!node || typeof node !== "object" || typeof node["@id"] !== "string") {
        mergedNodes.push(node);
        continue;
      }
      const existing = nodesById.get(node["@id"]);
      if (existing) mergeNode(existing, node);
      else {
        nodesById.set(node["@id"], node);
        mergedNodes.push(node);
      }
    }
  }
  pageScript.nodes = stripExternalJsonCatalogReferences(mergedNodes);
  pageScript.dirty = true;
  const scripts = [pageScript];

  const initialPageMatch = locateNode(scripts, (node) => {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("WebPage") && (node.url === meta.url || node["@id"]?.startsWith(`${meta.url}#`));
  });
  const pageId = initialPageMatch?.node["@id"] || `${meta.url}#webpage`;
  const page = ensureNode(scripts, pageScript, {
    "@type": pageType(row, filePath),
    "@id": pageId,
    name: meta.title || undefined,
    url: meta.url,
    inLanguage: meta.language,
    publisher: { "@id": `${SITE}/#organization` },
    isPartOf: { "@id": `${SITE}/#website` },
  });
  addType(page, "WebPage");
  for (const type of pageType(row, filePath)) addType(page, type);
  if (!page.mainEntity) {
    page["@type"] = (Array.isArray(page["@type"]) ? page["@type"] : [page["@type"]])
      .filter((type) => type !== "FAQPage");
  }
  setOrAdd(page, "name", meta.title);
  setOrAdd(page, "description", meta.description);
  setOrAdd(page, "url", meta.url);
  setOrAdd(page, "inLanguage", meta.language);
  setOrAdd(page, "publisher", { "@id": `${SITE}/#organization` });
  setOrAdd(page, "isPartOf", { "@id": `${SITE}/#website` });

  const organization = ensureNode(scripts, pageScript, {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE}/#organization`,
    name: "KOV Career Agency",
    alternateName: ["KOV", "KOV Career"],
    url: `${SITE}/`,
    email: "daniel@kovcareeragency.org",
    sameAs: ["https://www.reddit.com/user/KOV_CAREER_AGENCY/"],
    description: "An independent career agency providing candidate-side career representation and individual career services.",
    founder: { "@id": `${SITE}/#founder` },
    knowsAbout: [
      "Career development",
      "Professional profile assessment",
      "Resume and CV services",
      "LinkedIn profile optimization",
      "Executive career representation",
      "Career transitions",
      "Professional positioning",
      "Leadership opportunities",
      "International career opportunities",
      "Professional visibility",
      "Job-search strategy",
    ],
  });
  organization["@type"] = (Array.isArray(organization["@type"]) ? organization["@type"] : [organization["@type"]])
    .filter((type) => type && type !== "EmploymentAgency");
  addType(organization, "Organization");
  addType(organization, "ProfessionalService");
  const founderReferences = Array.isArray(organization.founder)
    ? organization.founder
    : organization.founder ? [organization.founder] : [];
  organization.founder = founderReferences.find((item) => item && item["@id"] === `${SITE}/#founder`)
    || { "@id": `${SITE}/#founder` };
  const logo = path.join(ROOT, "kov-logo.png");
  if (fs.existsSync(logo) && !organization.logo) organization.logo = { "@type": "ImageObject", url: `${SITE}/kov-logo.png` };
  const preview = path.join(ROOT, "preview.png");
  if (fs.existsSync(preview) && !organization.image) organization.image = `${SITE}/preview.png`;

  const founder = ensureNode(scripts, pageScript, {
    "@type": "Person",
    "@id": `${SITE}/#founder`,
    name: "Adekunle Ayotoba Daniel",
    alternateName: "Daniel Ade",
    jobTitle: "Founder and Principal Agent",
    worksFor: { "@id": `${SITE}/#organization` },
  });
  const founderNameValues = [
    ...(Array.isArray(founder.name) ? founder.name : [founder.name]),
    ...(Array.isArray(founder.alternateName) ? founder.alternateName : founder.alternateName ? [founder.alternateName] : []),
  ].filter((name) => typeof name === "string" && name.trim());
  founder.name = "Adekunle Ayotoba Daniel";
  founder.alternateName = unique(founderNameValues.filter((name) => name !== founder.name));

  const website = ensureNode(scripts, pageScript, {
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: "KOV Career Agency",
    url: `${SITE}/`,
    publisher: { "@id": `${SITE}/#organization` },
    hasPart: { "@id": catalog.catalogId },
    mentions: catalog.datasetRows.map(([id]) => ({ "@id": `${CATALOG_URL}#dataset-${id}` })),
  });
  website.hasPart = mergeValue(website.hasPart, { "@id": catalog.catalogId });
  website.mentions = (Array.isArray(website.mentions) ? website.mentions : [website.mentions])
    .filter((item) => !JSON.stringify(item).includes("/data/") && !JSON.stringify(item).includes(".jsonld"));
  website.mentions = mergeValue(website.mentions, catalog.datasetRows.map(([id]) => ({ "@id": `${CATALOG_URL}#dataset-${id}` })));

  const breadcrumbId = `${meta.url}#breadcrumb`;
  const breadcrumbItems = breadcrumbsFor(filePath, meta, pageByPath);
  const breadcrumbMatch = locateNode(scripts, (node) => {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("BreadcrumbList") && (
      node["@id"] === breadcrumbId
      || (Array.isArray(node.itemListElement) && node.itemListElement.some((item) => item.item === meta.url))
    );
  });
  const breadcrumb = breadcrumbMatch?.node || ensureNode(scripts, pageScript, {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: breadcrumbItems,
  });
  breadcrumb["@id"] ||= breadcrumbId;
  addType(breadcrumb, "BreadcrumbList");
  breadcrumb.itemListElement = breadcrumbItems;
  page.breadcrumb = { "@id": breadcrumb["@id"] };

  const classification = pageClassification(row, filePath, meta);
  const references = [];
  const localNodes = [];
  const datasetIds = catalog.datasetRows.map(([id]) => `${CATALOG_URL}#dataset-${id}`);
  localNodes.push({
    "@type": "DataCatalog",
    "@id": catalog.catalogId,
    name: "KOV Career Agency Global HTML Metadata Catalog",
    hasPart: datasetIds.map((id) => ({ "@id": id })),
  });
  const inlineDatasetNodes = new Map();
  for (const [id, name, numberOfItems] of catalog.datasetRows) {
    const datasetId = `${CATALOG_URL}#dataset-${id}`;
    references.push({ "@id": datasetId });
    const datasetNode = {
      "@type": "Dataset",
      "@id": datasetId,
      name,
      description: `${numberOfItems} existing ${name.toLocaleLowerCase("en")} reference records. This count describes the supplied project records; page-specific entity associations are added only where the page content supports them.`,
      numberOfItems,
      includedInDataCatalog: { "@id": catalog.catalogId },
    };
    inlineDatasetNodes.set(id, datasetNode);
    localNodes.push(datasetNode);
  }
  const pageCorpus = `${filePath} ${meta.title} ${meta.description}`;
  const matchedTaxonomyTerms = [];
  for (const [id, , key] of TAXONOMY_DATASETS) {
    const datasetId = `${CATALOG_URL}#dataset-${id}`;
    const datasetNode = inlineDatasetNodes.get(id);
    const matchingRecords = taxonomyRecordsForPage(key, pageCorpus);
    for (const { record, label } of matchingRecords) {
      const identifier = record.id || record.code || record.uri || record["@id"] || label;
      const termId = `${CATALOG_URL}#term-${id}-${hash(identifier)}`;
      const term = {
        "@type": "DefinedTerm",
        "@id": termId,
        name: label,
        identifier,
        inDefinedTermSet: { "@id": datasetId },
      };
      if (record.description || record.definition) term.description = record.description || record.definition;
      localNodes.push(term);
      references.push({ "@id": termId });
      datasetNode.hasPart = mergeValue(datasetNode.hasPart || [], { "@id": termId });
      matchedTaxonomyTerms.push(label);
    }
  }
  for (const audienceName of classification.audiences) {
    const audienceId = `${SITE}/#audience-${hash(audienceName)}`;
    references.push({ "@id": audienceId });
    localNodes.push({
      "@type": "Audience",
      "@id": audienceId,
      audienceType: audienceName,
    });
  }
  if (classification.industry) {
    const industryId = `${SITE}/#industry-${hash(classification.industry)}`;
    references.push({ "@id": industryId });
    localNodes.push({
      "@type": "DefinedTerm",
      "@id": industryId,
      name: classification.industry,
      mainEntityOfPage: { "@id": pageId },
    });
    const industryDataset = inlineDatasetNodes.get("industries");
    industryDataset.hasPart = mergeValue(industryDataset.hasPart || [], { "@id": industryId });
  }

  const role = pageRole(filePath);
  if (role) {
    for (const alias of role.aliases) {
      const key = normalize(alias);
      const jobTitleId = catalog.jobTitleIds.get(key);
      const occupationId = catalog.occupationIds.get(key);
      if (jobTitleId) {
        references.push({ "@id": jobTitleId });
        localNodes.push({ "@type": "DefinedTerm", "@id": jobTitleId, name: alias });
        inlineDatasetNodes.get("job-titles").hasPart = mergeValue(inlineDatasetNodes.get("job-titles").hasPart || [], { "@id": jobTitleId });
      }
      if (occupationId) {
        references.push({ "@id": occupationId });
        localNodes.push({ "@type": "Occupation", "@id": occupationId, name: alias });
        inlineDatasetNodes.get("occupations").hasPart = mergeValue(inlineDatasetNodes.get("occupations").hasPart || [], { "@id": occupationId });
      }
    }
    const roleName = role.name.toLocaleLowerCase("en");
    const roleTopics = [];
    if (/chief executive|ceo|chair|board|director/.test(roleName)) roleTopics.push("Business leadership");
    if (/chief marketing|cmo|marketing/.test(roleName)) roleTopics.push("Marketing", "Sales");
    if (/chief technology|cto|technology|software|data/.test(roleName)) roleTopics.push("Technology and IT", "Software engineering", "Data and analytics", "Artificial intelligence", "Engineering");
    if (/chief financial|cfo|finance/.test(roleName)) roleTopics.push("Finance and accounting", "Banking");
    if (/chief operating|coo|operations/.test(roleName)) roleTopics.push("Operations", "Project management");
    if (/chief product|cpo|product/.test(roleName)) roleTopics.push("Product management");
    if (/human resources|hr director|people/.test(roleName)) roleTopics.push("Human resources");
    classification.topics = unique([...classification.topics, ...roleTopics]);
  }

  const geography = relevantCountryAndPlaces(meta, filePath, catalog);
  for (const country of geography.countries) {
    references.push({ "@id": country.id });
    localNodes.push({
      "@type": "Country",
      "@id": country.id,
      name: country.name,
      identifier: {
        "@type": "PropertyValue",
        propertyID: country.code === "XK" ? "ISO 3166-1 alpha-2 (user-assigned)" : "ISO 3166-1 alpha-2",
        value: country.code,
      },
    });
    inlineDatasetNodes.get("countries").hasPart = mergeValue(inlineDatasetNodes.get("countries").hasPart || [], { "@id": country.id });
  }
  for (const place of geography.places) {
    const placeId = `${SITE}/#place-${hash(place.name)}`;
    references.push({ "@id": placeId });
    const placeNode = {
      "@type": "Place",
      "@id": placeId,
      name: place.name,
      mainEntityOfPage: { "@id": pageId },
    };
    if (place.country) {
      const country = catalog.countries.get(normalize(place.country));
      placeNode.containedInPlace = { "@id": country.id };
    }
    localNodes.push(placeNode);
    inlineDatasetNodes.get("cities").hasPart = mergeValue(inlineDatasetNodes.get("cities").hasPart || [], { "@id": placeId });
  }
  const cityMatches = cityRecordsForPage(pageCorpus);
  for (const { place: record } of cityMatches) {
    const name = record.city || record.city_ascii;
    let placeNode = localNodes.find((node) => node["@type"] === "Place" && normalize(node.name) === normalize(name));
    if (!placeNode) {
      placeNode = { "@type": "Place", "@id": `${CATALOG_URL}#city-${record.simplemaps_id || hash(name)}`, name };
      localNodes.push(placeNode);
    }
    placeNode.identifier = record.simplemaps_id || record.geonames_id || undefined;
    placeNode.geo = { "@type": "GeoCoordinates", latitude: Number(record.lat), longitude: Number(record.lng) };
    const cityCountry = catalog.countries.get(normalize(record.country || ""));
    if (cityCountry) placeNode.containedInPlace = { "@id": cityCountry.id };
    if (record.admin_name) {
      const areaId = `${CATALOG_URL}#area-${hash(`${record.iso2 || ""}-${record.admin_name}`)}`;
      localNodes.push({
        "@type": "AdministrativeArea",
        "@id": areaId,
        name: record.admin_name,
        identifier: record.iso2 ? `${record.iso2}-${record.admin_name}` : undefined,
        containedInPlace: cityCountry ? { "@id": cityCountry.id } : undefined,
      });
      placeNode.containedInPlace = { "@id": areaId };
    }
    references.push({ "@id": placeNode["@id"] });
    inlineDatasetNodes.get("cities").hasPart = mergeValue(inlineDatasetNodes.get("cities").hasPart || [], { "@id": placeNode["@id"] });
  }

  if (/^countries-we-serve\.html$/i.test(filePath.replace(/\\/g, "/"))) {
    const countryItems = [];
    for (const [name, code] of COUNTRIES) {
      const country = catalog.countries.get(normalize(name));
      if (!country) continue;
      countryItems.push({ "@type": "ListItem", position: countryItems.length + 1, item: { "@id": country.id } });
      references.push({ "@id": country.id });
      localNodes.push({
        "@type": "Country",
        "@id": country.id,
        name,
        identifier: {
          "@type": "PropertyValue",
          propertyID: code === "XK" ? "ISO 3166-1 alpha-2 (user-assigned)" : "ISO 3166-1 alpha-2",
          value: code,
        },
      });
      inlineDatasetNodes.get("countries").hasPart = mergeValue(inlineDatasetNodes.get("countries").hasPart || [], { "@id": country.id });
    }
    localNodes.push({
      "@type": "ItemList",
      "@id": catalog.countryListId,
      name: "Countries in the KOV global discovery reference",
      numberOfItems: countryItems.length,
      itemListOrder: "https://schema.org/ItemListUnordered",
      itemListElement: countryItems,
    });
    references.push({ "@id": catalog.countryListId });
  }

  const topics = classification.topics;
  for (const topic of topics) {
    const topicId = `${SITE}/#topic-${hash(topic)}`;
    references.push({ "@id": topicId });
    localNodes.push({
      "@type": "DefinedTerm",
      "@id": topicId,
      name: topic,
      mainEntityOfPage: { "@id": pageId },
    });
  }

  const jobSearchPage = /job search|job-search|reverse recruiting|career representation/i.test(`${filePath} ${meta.title} ${meta.description}`);
  if (jobSearchPage) {
    const roleTerms = unique([...(role?.aliases || []), ...(role ? [role.name] : [])]);
    for (const term of roleTerms) {
      const id = catalog.jobTitleIds.get(normalize(term));
      if (!id) continue;
      references.push({ "@id": id });
      localNodes.push({ "@type": "DefinedTerm", "@id": id, name: term });
    }
  }

  const about = uniqueReferences([...(Array.isArray(page.about) ? page.about : page.about ? [page.about] : []), ...localNodes.filter((node) => ["Occupation", "Country", "Place"].includes(node["@type"]) || node["@id"].includes("#industry-")).map((node) => ({ "@id": node["@id"] }))]);
  if (about.length) page.about = about;
  else delete page.about;
  const audience = uniqueReferences([...(Array.isArray(page.audience) ? page.audience : page.audience ? [page.audience] : []), ...classification.audiences.map((name) => ({ "@id": `${SITE}/#audience-${hash(name)}` }))]);
  if (audience.length) page.audience = audience;
  else delete page.audience;
  const mentions = uniqueReferences([...(Array.isArray(page.mentions) ? page.mentions : page.mentions ? [page.mentions] : []), ...references]);
  if (mentions.length) page.mentions = mentions;
  else delete page.mentions;
  if (topics.length || matchedTaxonomyTerms.length) {
    page.keywords = unique([
      ...(Array.isArray(page.keywords) ? page.keywords : page.keywords ? [page.keywords] : []),
      ...topics,
      ...(role?.aliases || []),
      ...matchedTaxonomyTerms,
    ]);
  }

  for (const node of localNodes) ensureNode(scripts, pageScript, node);

  const servicePage = row.template_type === "service" || /^services[\\/]/i.test(filePath);
  if (servicePage) {
    const serviceId = `${meta.url}#service`;
    const service = ensureNode(scripts, pageScript, {
      "@type": "Service",
      "@id": serviceId,
      name: meta.title || "Career service",
      description: meta.description || undefined,
      url: meta.url,
      provider: { "@id": `${SITE}/#organization` },
      mainEntityOfPage: { "@id": pageId },
    });
    addType(service, "Service");
    page.mainEntity = { "@id": serviceId };
  }

  const currentMarker = originalScripts.some((script) => script.hadDiscovery);
  if (!currentMarker) pageScript.dirty = true;
  const rendered = renderPage(original, originalScripts, pageScript, filePath);
  const changed = ensureHeadMetadata(rendered, meta, filePath);
  assert(bodyMarkup(original) === bodyMarkup(changed), `BODY content changed in ${filePath}.`);
  assert(stable(preservedDirectives(original)) === stable(preservedDirectives(changed)), `Robots or canonical directives changed in ${filePath}.`);

  const parsed = buildScriptIndexes(changed);
  assert(parsed.length === 1, `Expected one consolidated JSON-LD block in ${filePath}; found ${parsed.length}.`);
  assert(parsed[0].hadDiscovery, `Discovery marker missing in ${filePath}.`);
  const ids = parsed[0].nodes.map((node) => node && node["@id"]).filter(Boolean);
  assert(new Set(ids).size === ids.length, `Duplicate @id values remain in ${filePath}.`);
  assert(parsed[0].nodes.some((node) => {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("WebPage") && node.url === meta.url;
  }), `Page-specific WebPage is missing from ${filePath}.`);
  stats.pages += 1;
  stats.originalNodes += originalNodeCount;
  stats.finalNodes += parsed[0].nodes.length;
  stats.contextChanges += originalScripts.length > 1 ? originalScripts.length - 1 : 0;
  stats.pageIds.push(`${meta.url}#webpage`);
  stats.changes.push({ absolutePath, content: changed });
}

function uniqueReferences(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (value === undefined || value === null || value === "") return false;
    const key = value && typeof value === "object" && value["@id"] ? value["@id"] : stable(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  assert(Array.isArray(manifest.pages) && manifest.pages.length > 0, "PAGE_MANIFEST.json contains no pages.");
  const inventory = manifest.repository_html_inventory?.files || [];
  assert(inventory.length > 0, "PAGE_MANIFEST.json contains no complete HTML inventory.");
  const listed = new Map(manifest.pages.map((row) => [row.path.replace(/\\/g, "/"), row]));
  const pageRows = inventory.map((entry) => {
    const filePath = entry.path.replace(/\\/g, "/");
    const listedPage = listed.get(filePath);
    return {
      ...(listedPage || {}),
      path: filePath,
      template_type: listedPage?.template_type || (filePath.startsWith("faq/") ? "FAQ content" : "content"),
      indexable: Boolean(entry.indexable),
    };
  });
  const inventoryPaths = new Set(pageRows.map((row) => row.path));
  for (const row of manifest.pages) {
    if (!inventoryPaths.has(row.path.replace(/\\/g, "/"))) {
      pageRows.push({ ...row, path: row.path.replace(/\\/g, "/"), indexable: false });
    }
  }
  assert(new Set(pageRows.map((row) => row.path)).size === pageRows.length, "HTML inventory contains duplicate paths.");
  for (const row of pageRows) assert(fs.existsSync(path.join(ROOT, row.path)), `Inventory HTML file is missing: ${row.path}`);
  const { jobTitles, occupations } = loadTerms();
  const catalog = writeCatalog(jobTitles, occupations);
  const pageByPath = new Map();
  const urlPaths = new Map();
  for (const row of pageRows) {
    const pagePath = row.path.replace(/\\/g, "/");
    const html = fs.readFileSync(path.join(ROOT, row.path), "utf8");
    const meta = htmlMetadata(html, row.path);
    if (!urlPaths.has(meta.url)) urlPaths.set(meta.url, []);
    urlPaths.get(meta.url).push({ pagePath, title: meta.title, url: meta.url });
  }
  for (const duplicates of urlPaths.values()) {
    for (const page of duplicates) {
      if (duplicates.length > 1) page.url = urlFromPath(page.pagePath);
      pageByPath.set(page.pagePath, page);
    }
  }
  const stats = { pages: 0, originalNodes: 0, finalNodes: 0, contextChanges: 0, pageIds: [], changes: [] };
  for (const row of pageRows) processPage(row, catalog, pageByPath, stats);
  assert(new Set(stats.pageIds).size === pageRows.length, "Page URLs or WebPage identifiers are not unique.");
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun) {
    for (const change of stats.changes) fs.writeFileSync(change.absolutePath, change.content, "utf8");
  }
  console.log(JSON.stringify({
    pagesCovered: stats.pages,
    inventoryFiles: inventory.length,
    nonIndexableFilesKeptNoindex: inventory.filter((entry) => !entry.indexable).length,
    countries: COUNTRIES.length,
    jobTitles: jobTitles.length,
    normalizedDistinctJobTitles: unique(jobTitles).length,
    normalizedDuplicateJobTitleEntries: jobTitles.length - unique(jobTitles).length,
    occupations: occupations.length,
    inlineDatasetCategories: catalog.datasetRows.length,
    originalJsonLdNodes: stats.originalNodes,
    finalJsonLdNodes: stats.finalNodes,
    consolidatedJsonLdScripts: stats.pages,
    dryRun,
    sourceFilesPreserved: [
      "town-role-insitutution/job-titles.txt",
      "town-role-insitutution/occupations.csv",
      "town-role-insitutution/KOV_Job_Titles_Expanded_98380.txt",
      "town-role-insitutution/KOV_Occupations_Expanded_1655.csv",
    ],
  }, null, 2));
}

main();
