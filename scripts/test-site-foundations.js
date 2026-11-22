const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
function hasSharedVisualStylesheet(html) {
  const link = html.match(/<link\b(?=[^>]*\bdata-kov-global-redesign\b)[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  if (!link) return false;
  const href = link[1].split(/[?#]/, 1)[0];
  return href === "/css/kov-global-redesign.css" && fs.existsSync(path.join(root, "css", "kov-global-redesign.css"));
}
const previewRoutes = [
  "/directory/",
  "/directory/career-resources/",
  "/directory/research/",
  "/directory/professional-directory/",
  "/directory/templates/",
  "/directory/templates/international-mobility.html",
  "/directory/visual-assets/",
  "/directory/career-resources/mobility/choosing-an-international-mobility-route-as-an-executive/",
  "/directory/career-resources/mobility/employer-sponsored-vs-independent-work-routes/",
  "/directory/career-resources/mobility/canada-express-entry-senior-managers/",
  "/directory/career-resources/mobility/uk-expansion-worker-route-overseas-business-leaders/",
  "/directory/career-resources/mobility/uk-global-talent-digital-technology-leaders/",
  "/directory/career-resources/industry-specific-career-guides/bank-executive-to-fintech-career-transition/",
  "/directory/career-resources/industry-specific-career-guides/oil-gas-to-offshore-wind-executive-transition/",
  "/directory/resources/executive-decision-quality-accountability/",
];
const hypotheticalScenarioSlugs = [
  "banking-to-fintech-leadership",
  "energy-to-offshore-wind",
  "return-after-career-break",
  "cross-border-relocation",
  "founder-to-enterprise-role",
  "public-sector-to-private",
  "functional-leader-to-chro",
  "technology-leader-to-board",
  "cfo-company-stage-choice",
  "multiple-opportunities",
  "first-enterprise-leadership-role",
  "after-reorganization",
];
const socMajorGroupSlugs = [
  "soc-major-group-13-business-financial-operations",
  "soc-major-group-15-computer-mathematical",
  "soc-major-group-17-architecture-engineering",
  "soc-major-group-19-life-physical-social-science",
  "soc-major-group-21-community-social-service",
  "soc-major-group-23-legal",
  "soc-major-group-25-education-library",
  "soc-major-group-27-arts-media-sports",
  "soc-major-group-29-healthcare-practitioners-technical",
  "soc-major-group-31-healthcare-support",
  "soc-major-group-33-protective-service",
  "soc-major-group-35-food-preparation-serving",
  "soc-major-group-37-building-grounds-cleaning",
  "soc-major-group-39-personal-care-service",
  "soc-major-group-41-sales-related",
  "soc-major-group-43-office-administrative-support",
  "soc-major-group-45-farming-fishing-forestry",
  "soc-major-group-47-construction-extraction",
  "soc-major-group-49-installation-maintenance-repair",
  "soc-major-group-51-production",
  "soc-major-group-53-transportation-material-moving",
  "soc-major-group-55-military-specific",
];
const socManagementSubgroupSlugs = [
  "soc-management-subgroup-111000",
  "soc-management-subgroup-113000",
  "soc-management-subgroup-119000",
];
const definedCandidatePreviewRoutes = [
  "/directory/career-resources/industry-specific-career-guides/aerospace-defense-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/biopharma-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/cybersecurity-services-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/data-center-cloud-infrastructure-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/ev-battery-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/federal-executive-private-sector-job-search-ethics/",
  "/directory/career-resources/industry-specific-career-guides/fintech-payments-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/freight-forwarding-3pl-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/medical-device-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/renewable-power-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/semiconductor-career-guide/",
  "/directory/career-resources/industry-specific-career-guides/us-medicare-provider-operations-leadership-career-guide/",
  "/directory/career-resources/executive-career-guides/financial-leader-to-ceo-transition/",
  "/directory/career-resources/leadership-skills-competencies/federal-executive-core-qualifications-career-evidence/",
  "/directory/career-resources/salary-compensation-guides/us-federal-executive-pay-table-career-guide/",
  "/directory/career-resources/country-market-guides/canada-executive-job-search-market-guide/",
  "/directory/career-resources/interview-guides/us-federal-executive-structured-interview-preparation/",
  "/directory/career-resources/country-market-guides/uk-executive-job-search-market-guide/",
  "/directory/career-resources/country-market-guides/australia-executive-job-search-market-guide/",
  "/directory/career-resources/country-market-guides/japan-executive-job-search-market-guide/",
  "/directory/career-resources/country-market-guides/singapore-executive-job-search-market-guide/",
  "/directory/career-resources/country-market-guides/germany-executive-job-search-market-guide/",
  "/directory/career-resources/comparison-educational/eu-employment-rate-comparison-for-market-research/",
  "/directory/career-resources/board-non-executive-career/uk-non-executive-director-board-opportunity-research/",
  "/directory/career-resources/executive-career-guides/uk-civil-service-senior-role-success-profiles-evidence/",
  "/directory/career-resources/mobility/canada-express-entry-senior-managers/",
  "/directory/career-resources/mobility/eu-blue-card-senior-professionals/",
  "/directory/career-resources/mobility/choosing-an-international-mobility-route-as-an-executive/",
  "/directory/career-resources/mobility/employer-sponsored-vs-independent-work-routes/",
  "/directory/career-resources/mobility/professional-qualification-recognition-cross-border-executive-moves/",
  "/directory/career-resources/mobility/new-zealand-skilled-migrant-category-executives/",
  "/directory/career-resources/mobility/occupational-codes-cross-border-executive-search/",
  "/directory/career-resources/mobility/singapore-employment-pass-executives/",
  "/directory/career-resources/mobility/uk-expansion-worker-route-overseas-business-leaders/",
  "/directory/career-resources/mobility/uk-global-talent-digital-technology-leaders/",
  "/directory/career-resources/mobility/uk-global-talent-research-leaders/",
  "/directory/career-resources/mobility/uk-innovator-founder-route-executive-founders/",
  "/directory/career-resources/mobility/uk-senior-specialist-worker-executive-transfers/",
];
const existingRoutes = [
  "/index.html",
  "/services/career-strategy-senior-leaders.html",
  "/markets/executive-job-search-dubai.html",
  "/roles/ceo/index.html",
  "/industries/finance-insurance/index.html",
  "/resources/case-studies.html",
  "/faq/about-1.html",
  "/404.html",
];
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function createServer() {
  return http.createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }

    let filePath = path.resolve(root, `.${pathname}`);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404).end("Not found");
        return;
      }
      const contentType = contentTypes[path.extname(filePath)] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` }).end(content);
    });
  });
}

function getHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

function parseCsvRows(contents) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const text = contents.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\r" || character === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }
  if (field !== "" || row.length > 0) rows.push([...row, field]);

  const [headers, ...records] = rows;
  assert.ok(headers?.length, "CSV should have a header row");
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

async function assertRenderedRoute(page, baseUrl, route, isPreview) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200, `${route} should load`);
  try {
    await page.waitForFunction(
      (currentRoute) => {
        const hasSearchRuntime = [...document.scripts].some((script) =>
          /(?:site-search|kov-discovery-search)(?:\.js|\.bundle\.js)/i.test(script.src)
        );
        const searchReady = !hasSearchRuntime || window.kovSiteSearchReady || document.querySelector(".site-search-fallback");
        const navigationReady = window.kovGlobalNavigationReady || document.querySelector("header nav.kov-react-nav__links") || document.querySelector("body > nav") || (currentRoute === "/404.html" && document.querySelector("main a.home-link"));
        return searchReady && navigationReady;
      },
      route,
      { timeout: 15000 }
    );
  } catch (error) {
    throw new Error(`${route} did not initialize search and navigation`, { cause: error });
  }
  if (await page.locator("header").count()) {
    const reactNavigation = page.locator("header nav.kov-react-nav__links");
    if (await reactNavigation.count()) {
      assert.ok(await reactNavigation.locator("a").count() >= 3, `${route} React navigation should expose its primary destinations`);
    } else {
      const navigations = page.locator('header nav[aria-label="Primary navigation"]');
      const navigationCount = await navigations.count();
      assert.ok(navigationCount >= 1 && navigationCount <= 2, `${route} should have shared navigation`);
      for (let index = 0; index < navigationCount; index += 1) {
        const linkCount = await navigations.nth(index).locator(":scope > a.kov-global-nav-link").count();
        assert.ok([4, 5].includes(linkCount), `${route} navigation ${index} has ${linkCount} shared links`);
      }
    }
  } else {
    if (route === "/404.html") {
      assert.equal(await page.locator("main a.home-link[href='/']").count(), 1, "404 page should provide a working return-home action");
    } else if (await page.locator(".site-search-fallback").count()) {
      const searchFallback = page.locator(".site-search-fallback");
      assert.equal(await searchFallback.isVisible(), true);
    } else {
      const standaloneNavigation = page.locator("body > nav");
      assert.equal(await standaloneNavigation.count(), 1, `${route} should retain its standalone navigation`);
      assert.ok(await standaloneNavigation.locator("a").count() >= 3, `${route} standalone navigation should expose its destinations`);
    }
  }
  assert.equal(
    await page.locator('header a.kov-global-nav-link[href^="/directory/"]').count(),
    0,
    `${route} should not expose staging candidates in public navigation`
  );
  assert.equal(await page.locator("footer.kov-uniform-footer").count(), 1, `${route} should render the shared footer`);
  assert.equal(await page.locator("h1").count(), 1, `${route} should render its existing page heading`);

  if (isPreview) {
    assert.equal(
      await page.locator('link[rel="stylesheet"][data-kov-global-redesign][href^="/css/kov-global-redesign.css"]').count(),
      1,
      `${route} should use the approved shared KOV visual foundation stylesheet`
    );
    assert.equal(
      await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(),
      1
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      `${route} should not overflow at mobile width`
    );
  }
}

async function main() {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const searchIndex = fs.readFileSync(path.join(root, "assets", "site-search-index.js"), "utf8");
  const searchRuntime = fs.readFileSync(path.join(root, "assets", "site-search.js"), "utf8");
  const discoveryTrackerRows = parseCsvRows(
    fs.readFileSync(path.join(root, "development", "PAGE-TRACKER.csv"), "utf8")
  );
  const programmePaths = new Set(discoveryTrackerRows.map((row) => {
    const route = row.proposed_url.replace(/\/$/, "");
    return `${route.slice(1)}/index.html`;
  }));
  assert.equal(programmePaths.size, discoveryTrackerRows.length, "Every defined programme candidate must have a unique route");
  const scenarioDirectory = path.join(root, "staging", "resources", "hypothetical-career-scenarios");
  const scenarioIndex = fs.readFileSync(path.join(scenarioDirectory, "index.html"), "utf8");
  assert.equal(hypotheticalScenarioSlugs.length, 12);
  assert.equal(scenarioIndex.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(scenarioIndex.includes('data-kov-react-navigation'), true);
  assert.equal(scenarioIndex.includes("None is based on a real KOV client"), true);
  assert.equal([...scenarioIndex.matchAll(/<h1\b/gi)].length, 1);
  assert.equal(sitemap.includes("/directory/resources/hypothetical-career-scenarios"), false);
  assert.equal(searchIndex.includes("/directory/resources/hypothetical-career-scenarios"), false);
  for (const slug of hypotheticalScenarioSlugs) {
    const scenario = fs.readFileSync(path.join(scenarioDirectory, slug, "index.html"), "utf8");
    assert.equal(scenario.includes('name="robots" content="noindex, nofollow"'), true, `${slug} should be noindex`);
    assert.equal(scenario.includes("data-kov-react-navigation"), true, `${slug} should use the shared navigation layer`);
    assert.equal(scenario.includes("<strong>Fictional scenario — not a real KOV client"), true, `${slug} should disclose fiction`);
    assert.match(scenario, /not a client case or testimonial/i, `${slug} should disclaim client evidence`);
    assert.equal([...scenario.matchAll(/<h1\b/gi)].length, 1, `${slug} should have one H1`);
    assert.equal(sitemap.includes(`/directory/resources/hypothetical-career-scenarios/${slug}`), false);
    assert.equal(searchIndex.includes(`/directory/resources/hypothetical-career-scenarios/${slug}`), false);
  }
  const socDirectoryPath = path.join(root, "staging", "roles", "soc-major-groups", "index.html");
  const socDirectory = fs.readFileSync(socDirectoryPath, "utf8");
  assert.equal(socMajorGroupSlugs.length, 22);
  assert.equal(socDirectory.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal([...socDirectory.matchAll(/<li><a href="\/staging\/roles\//g)].length, 23);
  assert.equal(socDirectory.includes("https://www.bls.gov/soc/2018/home.htm"), true);
  for (const slug of socMajorGroupSlugs) {
    const pagePath = path.join(root, "staging", "roles", slug, "index.html");
    const source = fs.readFileSync(pagePath, "utf8");
    assert.equal(source.includes('name="robots" content="noindex, nofollow"'), true, `${slug} should be noindex`);
    assert.equal(hasSharedVisualStylesheet(source), true, `${slug} should load the shared visual stylesheet`);
    assert.equal(source.includes("2018 U.S. Standard Occupational Classification"), true);
    assert.equal(source.includes("Minor groups"), true);
    assert.equal(source.includes("Broad occupations"), true);
    assert.equal(source.includes("https://www.bls.gov/soc/2018/home.htm"), true);
    assert.equal([...source.matchAll(/<h1\b/gi)].length, 1, `${slug} should have one H1`);
    assert.equal(sitemap.includes(`/directory/roles/${slug}`), false);
    assert.equal(searchIndex.includes(`/directory/roles/${slug}`), false);
  }
  assert.equal(sitemap.includes("/directory/roles/soc-major-groups"), false);
  assert.equal(searchIndex.includes("/directory/roles/soc-major-groups"), false);
  assert.equal(new Set(definedCandidatePreviewRoutes).size, 38);
  for (const route of definedCandidatePreviewRoutes) {
    const localPath = path.join(root, route.slice(1), "index.html");
    const source = fs.readFileSync(localPath, "utf8");
    assert.equal(source.includes('name="robots" content="noindex, nofollow"'), true, `${route} should be noindex`);
    assert.equal([...source.matchAll(/<h1\b/gi)].length, 1, `${route} should have one H1`);
    assert.equal(source.includes('rel="canonical"'), false, `${route} should not declare a public canonical`);
    assert.equal(sitemap.includes(route.replace(/\/$/, "")), false, `${route} must remain out of sitemap`);
    assert.equal(searchIndex.includes(route), false, `${route} must remain out of search`);
  }
  const candidateRows = parseCsvRows(
    fs.readFileSync(path.join(root, "development", "CANDIDATE-REGISTER.csv"), "utf8")
  );
  const trackerRows = parseCsvRows(
    fs.readFileSync(path.join(root, "development", "PAGE-TRACKER.csv"), "utf8")
  );
  const programmeRows = parseCsvRows(
    fs.readFileSync(path.join(root, "development", "PAGE-PROGRAMME.csv"), "utf8")
  );
  const trackerById = new Map(trackerRows.map((row) => [row.id, row]));
  assert.equal(new Set(candidateRows.map((row) => row.candidate_id)).size, candidateRows.length);
  const candidateCountByCategory = new Map();
  for (const candidate of candidateRows) {
    candidateCountByCategory.set(
      candidate.category,
      (candidateCountByCategory.get(candidate.category) ?? 0) + 1
    );
  }
  const targetCount = programmeRows.reduce((total, row) => total + Number(row.target_count), 0);
  const definedCount = programmeRows.reduce(
    (total, row) => total + Number(row.candidate_urls_defined),
    0
  );
  assert.equal(targetCount, 577, "The page programme should retain its 577-page target");
  assert.equal(definedCount, candidateRows.length, "Defined route totals should match the candidate register");
  for (const row of programmeRows) {
    const categoryCount = candidateCountByCategory.get(row.page_group) ?? 0;
    assert.equal(Number(row.candidate_urls_defined), categoryCount, `${row.page_group} defined count should match the candidate register`);
    assert.equal(
      Number(row.candidate_url_shortfall),
      Number(row.target_count) - categoryCount,
      `${row.page_group} shortfall should reconcile`
    );
  }
  for (const candidate of candidateRows) {
    const tracked = trackerById.get(candidate.candidate_id);
    assert.ok(tracked, `${candidate.candidate_id} should have a tracker row`);
    assert.equal(tracked.proposed_url, candidate.proposed_url);
    assert.equal(tracked.search_sitemap_status, "excluded");
    const route = tracked.staging_preview_url;
    assert.match(route, /^\/staging\//, `${candidate.candidate_id} should use a staging route`);
    const relativePath = route.slice(1);
    const candidatePath = route.endsWith("/")
      ? path.join(root, relativePath, "index.html")
      : path.join(root, relativePath);
    assert.equal(fs.existsSync(candidatePath), true, `${candidate.candidate_id} needs staging HTML`);
    const source = fs.readFileSync(candidatePath, "utf8");
    assert.equal(
      source.includes('name="robots" content="noindex, nofollow"'),
      true,
      `${candidate.candidate_id} should be noindex`
    );
    const canonicalUrl = source.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (definedCandidatePreviewRoutes.includes(route)) {
      assert.equal(canonicalUrl, undefined, `${candidate.candidate_id} staging preview must not declare a public canonical`);
    } else {
      assert.equal(
        canonicalUrl,
        `https://www.kovcareeragency.org${candidate.proposed_url}`,
        `${candidate.candidate_id} canonical should match its registered intended public URL`
      );
    }
    assert.equal(sitemap.includes(route.replace(/\/$/, "")), false, `${route} must remain out of sitemap`);
    assert.equal(searchIndex.includes(route), false, `${route} must remain out of search`);
  }
  const aerospaceGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "aerospace-defense-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(aerospaceGuide.includes("Build a verifiable account of program leadership"), true);
  assert.equal(aerospaceGuide.includes("https://www.acquisition.gov/far/part-15"), true);
  const biopharmaGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "biopharma-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(biopharmaGuide.includes("A career-planning guide to biotechnology and pharmaceutical leadership"), true);
  assert.equal(biopharmaGuide.includes("https://www.fda.gov/drugs/development-approval-process-drugs"), true);
  const cybersecurityGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "cybersecurity-services-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(cybersecurityGuide.includes("Separate service leadership from technical execution"), true);
  assert.equal(cybersecurityGuide.includes("https://www.nist.gov/cyberframework"), true);
  const semiconductorGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "semiconductor-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(semiconductorGuide.includes("A career-planning guide to semiconductor leadership"), true);
  assert.equal(semiconductorGuide.includes("https://www.nist.gov/chips"), true);
  const evBatteryGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "ev-battery-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(evBatteryGuide.includes("A career-planning guide to EV and battery leadership"), true);
  assert.equal(evBatteryGuide.includes("https://www.energy.gov/cmei/vehicles/batteries"), true);
  const renewableGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "renewable-power-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(renewableGuide.includes("A career-planning guide to wind and solar leadership"), true);
  assert.equal(renewableGuide.includes("https://www.eia.gov/energyexplained/renewable-sources/"), true);
  const federalEthicsGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "federal-executive-private-sector-job-search-ethics", "index.html"),
    "utf8"
  );
  assert.equal(federalEthicsGuide.includes("Plan a private-sector search with agency ethics guidance"), true);
  assert.equal(federalEthicsGuide.includes("https://www.epa.gov/foia/ethics-rules-employees-leaving-federal-service"), true);
  const fintechGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "fintech-payments-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(fintechGuide.includes("Clarify which side of the relationship you served"), true);
  assert.equal(fintechGuide.includes("https://www.federalreserve.gov/supervisionreg/srletters/SR2304.htm"), true);
  const logisticsGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "freight-forwarding-3pl-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(logisticsGuide.includes("A career-planning guide to freight forwarding and 3PL leadership"), true);
  assert.equal(logisticsGuide.includes("https://www.fmc.gov/licensing-and-certification/"), true);
  const medicalDeviceGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "medical-device-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(medicalDeviceGuide.includes("Map your product and leadership evidence"), true);
  assert.equal(medicalDeviceGuide.includes("It does not explain device classification"), true);
  const dataCenterGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "data-center-cloud-infrastructure-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(dataCenterGuide.includes("Map the operating system you were responsible for"), true);
  assert.equal(dataCenterGuide.includes("https://www.energy.gov/cmei/buildings/data-centers-and-servers"), true);
  const medicareProviderGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "industry-specific-career-guides", "us-medicare-provider-operations-leadership-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(medicareProviderGuide.includes("Build a role-specific evidence map"), true);
  assert.equal(medicareProviderGuide.includes("https://www.cms.gov/medicare/health-safety-standards/certification-compliance"), true);
  const financeToCeoGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "executive-career-guides", "financial-leader-to-ceo-transition", "index.html"),
    "utf8"
  );
  assert.equal(financeToCeoGuide.includes("not a progression to assume"), true);
  assert.equal(financeToCeoGuide.includes("https://www.bls.gov/soc/2018/home.htm"), true);
  const federalEcqGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "leadership-skills-competencies", "federal-executive-core-qualifications-career-evidence", "index.html"),
    "utf8"
  );
  assert.equal(federalEcqGuide.includes("The five OPM qualification areas"), true);
  assert.equal(federalEcqGuide.includes("https://www.opm.gov/policy-data-oversight/senior-executive-service/executive-core-qualifications/"), true);
  const federalPayTableGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "salary-compensation-guides", "us-federal-executive-pay-table-career-guide", "index.html"),
    "utf8"
  );
  assert.equal(federalPayTableGuide.includes("Build a careful career comparison"), true);
  assert.equal(federalPayTableGuide.includes("https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/executive-senior-level/"), true);
  const canadaMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "canada-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(canadaMarketGuide.includes("What Canada's Job Bank provides"), true);
  assert.equal(canadaMarketGuide.includes("https://www.jobbank.gc.ca/trend-analysis"), true);
  const federalInterviewGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "interview-guides", "us-federal-executive-structured-interview-preparation", "index.html"),
    "utf8"
  );
  assert.equal(federalInterviewGuide.includes("Prepare around the stated competencies"), true);
  assert.equal(federalInterviewGuide.includes("https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/"), true);
  const ukMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "uk-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(ukMarketGuide.includes("Separate the indicators before drawing conclusions"), true);
  assert.equal(ukMarketGuide.includes("https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/latest"), true);
  const ukCivilServiceGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "executive-career-guides", "uk-civil-service-senior-role-success-profiles-evidence", "index.html"),
    "utf8"
  );
  assert.equal(ukCivilServiceGuide.includes("Build an evidence-to-criterion matrix"), true);
  assert.equal(ukCivilServiceGuide.includes("https://www.gov.uk/government/publications/success-profiles/success-profiles-experience"), true);
  const australiaMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "australia-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(australiaMarketGuide.includes("Read the national release with its methodology"), true);
  assert.equal(australiaMarketGuide.includes("https://www.abs.gov.au/statistics/labour/employment-and-unemployment/regional-labour-force/latest-release"), true);
  const japanMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "japan-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(japanMarketGuide.includes("Check comparability before reading a trend"), true);
  assert.equal(japanMarketGuide.includes("https://www.stat.go.jp/english/data/roudou/sa/index.html"), true);
  const singaporeMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "singapore-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(singaporeMarketGuide.includes("resident labour force"), true);
  assert.equal(singaporeMarketGuide.includes("https://stats.mom.gov.sg/Pages/Labour-Force-in-Singapore-2025.aspx"), true);
  const germanyMarketGuide = fs.readFileSync(
    path.join(root, "staging", "career-resources", "country-market-guides", "germany-executive-job-search-market-guide", "index.html"),
    "utf8"
  );
  assert.equal(germanyMarketGuide.includes("81.5%"), true);
  assert.equal(germanyMarketGuide.includes("https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsi_emp_q"), true);
  const euEmploymentComparison = fs.readFileSync(
    path.join(root, "staging", "career-resources", "comparison-educational", "eu-employment-rate-comparison-for-market-research", "index.html"),
    "utf8"
  );
  assert.equal(euEmploymentComparison.includes("Netherlands</td><td>83.2%"), true);
  assert.equal(euEmploymentComparison.includes("EU-27 aggregate"), true);
  const ukBoardResearch = fs.readFileSync(
    path.join(root, "staging", "career-resources", "board-non-executive-career", "uk-non-executive-director-board-opportunity-research", "index.html"),
    "utf8"
  );
  assert.equal(ukBoardResearch.includes("Read board disclosures as evidence, not a vacancy signal"), true);
  assert.equal(ukBoardResearch.includes("Financial Reporting Council: UK Corporate Governance Code 2024"), true);
  const managementOccupationDirectoryPath = path.join(
    root,
    "staging",
    "roles",
    "soc-management-detail",
    "index.html"
  );
  const managementOccupationDirectory = fs.readFileSync(managementOccupationDirectoryPath, "utf8");
  const occupationSlugs = [
    ...managementOccupationDirectory.matchAll(
      /<li><a href="\/staging\/roles\/(soc-occupation-[^/]+)\/">/g
    ),
  ].map((match) => match[1]);
  assert.equal(occupationSlugs.length, 38, "The management SOC directory should link to all 38 detailed occupations");
  assert.equal(new Set(occupationSlugs).size, 38, "The management SOC directory should not duplicate routes");
  assert.equal(managementOccupationDirectory.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(hasSharedVisualStylesheet(managementOccupationDirectory), true);
  assert.equal(managementOccupationDirectory.includes("https://www.bls.gov/soc/2018/home.htm"), true);
  assert.equal(socManagementSubgroupSlugs.length, 3);
  for (const slug of socManagementSubgroupSlugs) {
    assert.equal(managementOccupationDirectory.includes(`/directory/roles/${slug}/`), true);
    const subgroupPath = path.join(root, "staging", "roles", slug, "index.html");
    const source = fs.readFileSync(subgroupPath, "utf8");
    assert.equal(source.includes('name="robots" content="noindex, nofollow"'), true);
    assert.equal(hasSharedVisualStylesheet(source), true);
    assert.equal(source.includes("https://www.bls.gov/soc/2018/home.htm"), true);
    assert.ok([...source.matchAll(/<li><a href="\/staging\/roles\/soc-occupation-11-/g)].length > 0);
    assert.equal(sitemap.includes(`/directory/roles/${slug}`), false);
    assert.equal(searchIndex.includes(`/directory/roles/${slug}`), false);
  }
  assert.equal(sitemap.includes("/directory/roles/soc-management-detail"), false);
  assert.equal(searchIndex.includes("/directory/roles/soc-management-detail"), false);
  for (const slug of occupationSlugs) {
    const occupationPath = path.join(root, "staging", "roles", slug, "index.html");
    const source = fs.readFileSync(occupationPath, "utf8");
    assert.equal(source.includes('name="robots" content="noindex, nofollow"'), true, `${slug} should be noindex`);
    assert.equal(hasSharedVisualStylesheet(source), true, `${slug} should load the shared visual stylesheet`);
    assert.match(source, /U\.S\. SOC 11-\d{4}/, `${slug} should identify its classification code`);
    assert.match(source, /<blockquote>\s*<p>.+<\/p>\s*<\/blockquote>/s, `${slug} should include its sourced definition`);
    assert.equal(source.includes("https://www.bls.gov/soc/2018/home.htm"), true);
    assert.equal([...source.matchAll(/<h1\b/gi)].length, 1, `${slug} should have one H1`);
    assert.equal(sitemap.includes(`/directory/roles/${slug}`), false);
    assert.equal(searchIndex.includes(`/directory/roles/${slug}`), false);
  }
  for (const htmlPath of getHtmlFiles(path.join(root, "staging"))) {
    const html = fs.readFileSync(htmlPath, "utf8");
    const exampleLanguage = html.match(/\b(?:examples?|illustrative|case\s+studies?)\b/i);
    assert.equal(
      exampleLanguage,
      null,
      `${path.relative(root, htmlPath)} must not present examples or case studies as page content`
    );
  }
  const searchContent = fs.readFileSync(path.join(root, "assets", "site-search-content.js"), "utf8");
  const contentWindow = { window: {} };
  const catalogWindow = { window: {} };
  vm.runInNewContext(searchContent, contentWindow);
  vm.runInNewContext(searchIndex, catalogWindow);
  const catalog = catalogWindow.window.kovSeoPageCatalog;
  const content = contentWindow.window.kovSiteSearchContent;
  const runtimePagesSource = searchRuntime.split("const movedLandingPages")[0];
  const runtimePageHrefs = new Set(
    [...runtimePagesSource.matchAll(/href:\s*["']([^"']+)["']/g)].map((match) => match[1])
  );
  const sitemapPaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => {
    const urlPath = new URL(match[1].trim()).pathname;
    if (urlPath === "/") return "index.html";
    if (urlPath === "/blog") return "blog.html";
    if (urlPath.endsWith("/")) return `${urlPath.slice(1)}index.html`;
    return urlPath.slice(1).endsWith(".html") ? urlPath.slice(1) : `${urlPath.slice(1)}.html`;
  });
  const catalogHrefs = new Set(catalog.map((page) => page.href));

  assert.equal(new Set(sitemapPaths).size, sitemapPaths.length, "Sitemap paths should be unique");
  assert.equal(
    sitemapPaths.filter((pagePath) => programmePaths.has(pagePath)).length,
    0,
    "Unpublished programme candidates must remain excluded from the sitemap"
  );
  for (const publicCandidate of ["/career-resources/", "/research/", "/professional-directory/"]) {
    const localPath = `${publicCandidate.slice(1)}index.html`;
    assert.equal(sitemapPaths.includes(localPath), false, `${publicCandidate} must remain out of sitemap`);
    assert.equal(catalogHrefs.has(localPath), false, `${publicCandidate} must remain out of search`);
  }
  for (const pagePath of sitemapPaths) {
    assert.equal(fs.existsSync(path.join(root, pagePath)), true, `${pagePath} should exist`);
    const source = fs.readFileSync(path.join(root, pagePath), "utf8");
    const noindex = [...source.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
      const meta = Object.fromEntries(
        [...match[0].matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
          .map((attribute) => [
            attribute[1].toLowerCase(),
            attribute[2] ?? attribute[3] ?? attribute[4] ?? "",
          ])
      );
      return meta.name?.toLowerCase() === "robots" &&
        meta.content.split(",").some((directive) => directive.trim().toLowerCase() === "noindex");
    });
    if (programmePaths.has(pagePath)) {
      assert.equal(catalogHrefs.has(pagePath), true, `${pagePath} should be included in public search`);
      assert.equal(noindex, false, `${pagePath} should be indexable at its public route`);
      assert.equal(Object.hasOwn(content, pagePath), true, `${pagePath} should have bundled search content`);
    } else {
      if (!["index.html", "services.html"].includes(pagePath)) {
        if (catalogHrefs.has(pagePath)) {
          assert.equal(
            Object.hasOwn(content, pagePath),
            true,
            `${pagePath} should have bundled full-text search content`
          );
        } else {
          assert.equal(
            runtimePageHrefs.has(pagePath),
            true,
            `${pagePath} should appear in the searchable catalog or runtime entries`
          );
          assert.equal(
            Object.hasOwn(content, pagePath),
            true,
            `${pagePath} should retain its bundled full-text search content`
          );
        }
      }
      assert.equal(noindex, false, `${pagePath} is noindex and must not be in the search index`);
      assert.equal(source.includes("assets/uniform-footer.js"), true, `${pagePath} needs shared shell coverage`);
    }
  }

  for (const route of previewRoutes) {
    assert.equal(sitemap.includes(route.replace(/\/$/, "")), false, `${route} must remain out of sitemap`);
    assert.equal(searchIndex.includes(route), false, `${route} must remain out of search index`);
  }

  const occupationDraftPath = path.join(
    root,
    "staging",
    "roles",
    "management-occupations",
    "index.html"
  );
  const boardCvDraftPath = path.join(
    root,
    "staging",
    "resources",
    "board-cv-and-director-biography",
    "index.html"
  );
  const nedDueDiligenceDraftPath = path.join(
    root,
    "staging",
    "resources",
    "non-executive-director-opportunity-due-diligence",
    "index.html"
  );
  const occupationDraft = fs.readFileSync(occupationDraftPath, "utf8");
  const boardCvDraft = fs.readFileSync(boardCvDraftPath, "utf8");
  const nedDueDiligenceDraft = fs.readFileSync(nedDueDiligenceDraftPath, "utf8");
  assert.equal(occupationDraft.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(hasSharedVisualStylesheet(occupationDraft), true, "The occupation draft should load the shared visual stylesheet");
  assert.equal(occupationDraft.includes('rel="canonical"'), false, "The unpublished draft must not declare a public canonical");
  assert.equal([...occupationDraft.matchAll(/<h1\b/gi)].length, 1, "The occupation draft should have one H1");
  assert.equal(occupationDraft.includes("Management Occupations: U.S. SOC Major Group 11-0000"), true);
  assert.equal(occupationDraft.includes("https://www.onetonline.org/link/summary/11-1011.00"), true);
  assert.equal(occupationDraft.includes('href="/directory/roles/soc-management-detail/"'), true);
  for (const rolePath of ["/roles/ceo/", "/roles/cfo/", "/roles/cio/", "/roles/coo/", "/roles/cto/"]) {
    assert.equal(occupationDraft.includes(`href="${rolePath}"`), true, `${rolePath} should be linked from the draft`);
    const roleIndex = path.join(root, rolePath.slice(1), "index.html");
    assert.equal(fs.existsSync(roleIndex), true, `${rolePath} should resolve to an existing role page`);
  }
  assert.equal(
    sitemap.includes("/directory/roles/management-occupations"),
    false,
    "The occupation draft must remain out of the public sitemap"
  );
  assert.equal(
    searchIndex.includes("/directory/roles/management-occupations"),
    false,
    "The occupation draft must remain out of public search"
  );
  assert.equal(boardCvDraft.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(hasSharedVisualStylesheet(boardCvDraft), true, "The board CV draft should load the shared visual stylesheet");
  assert.equal(boardCvDraft.includes('rel="canonical"'), false, "The unpublished board CV draft must not declare a public canonical");
  assert.equal([...boardCvDraft.matchAll(/<h1\b/gi)].length, 1, "The board CV draft should have one H1");
  assert.equal(boardCvDraft.includes("Financial Reporting Council"), true);
  assert.equal(boardCvDraft.includes("does not prescribe a board CV"), true);
  assert.equal(sitemap.includes("/directory/resources/board-cv-and-director-biography"), false);
  assert.equal(searchIndex.includes("/directory/resources/board-cv-and-director-biography"), false);
  assert.equal(nedDueDiligenceDraft.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(hasSharedVisualStylesheet(nedDueDiligenceDraft), true, "The NED guide should load the shared visual stylesheet");
  assert.equal(nedDueDiligenceDraft.includes('rel="canonical"'), false);
  assert.equal([...nedDueDiligenceDraft.matchAll(/<h1\b/gi)].length, 1);
  assert.equal(nedDueDiligenceDraft.includes("Financial Reporting Council"), true);
  assert.equal(nedDueDiligenceDraft.includes("does not determine legal duties"), true);
  assert.equal(/\b(?:examples?|illustrative|case studies?)\b/i.test(nedDueDiligenceDraft), false);
  assert.equal(sitemap.includes("/directory/resources/non-executive-director-opportunity-due-diligence"), false);
  assert.equal(searchIndex.includes("/directory/resources/non-executive-director-opportunity-due-diligence"), false);

  const globalTalentDraft = fs.readFileSync(
    path.join(root, "staging", "career-resources", "mobility", "uk-global-talent-digital-technology-leaders", "index.html"),
    "utf8"
  );
  assert.equal(globalTalentDraft.includes('name="robots" content="noindex, nofollow"'), true);
  assert.equal(globalTalentDraft.includes("checked 5 November 2026"), true);
  assert.equal(globalTalentDraft.includes("job offer is not required"), true);
  assert.equal(globalTalentDraft.includes("does not assess anyone's eligibility"), true);
  assert.equal(globalTalentDraft.includes("exceptional ability"), false);
  assert.equal(sitemap.includes("/directory/career-resources/mobility/uk-global-talent-digital-technology-leaders"), false);
  assert.equal(searchIndex.includes("/directory/career-resources/mobility/uk-global-talent-digital-technology-leaders"), false);

  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    const browserOptions = { headless: true };
    if (!fs.existsSync(chromium.executablePath())) {
      const edgeCandidates = [
        path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe"),
      ];
      const installedEdge = edgeCandidates.find((candidate) => fs.existsSync(candidate));
      assert.ok(installedEdge, "Playwright Chromium is unavailable and no installed Microsoft Edge fallback was found");
      browserOptions.executablePath = installedEdge;
    }
    browser = await chromium.launch(browserOptions);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === baseUrl ? route.continue() : route.abort()
    );
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const route of [...existingRoutes, ...previewRoutes]) {
      await assertRenderedRoute(page, baseUrl, route, previewRoutes.includes(route));
    }
    for (const route of definedCandidatePreviewRoutes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      assert.equal(response?.status(), 200, `${route} should load in the browser`);
      assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        true,
        `${route} should fit a mobile viewport`
      );
    }

    await page.goto(`${baseUrl}/directory/roles/management-occupations/`, {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.locator("h1").innerText(), /Management Occupations/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
    assert.equal(await page.locator("footer").count(), 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The occupation draft with the approved shared visual layer should fit a mobile viewport"
    );
    assert.equal(await page.locator('a[href="https://www.bls.gov/soc/2018/home.htm"][target="_blank"][rel="noopener noreferrer"]').count(), 1);
    assert.equal(await page.locator('a[href="https://www.onetonline.org/link/summary/11-1011.00"][target="_blank"][rel="noopener noreferrer"]').count(), 1);

    await page.goto(`${baseUrl}/directory/resources/board-cv-and-director-biography/`, {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.locator("h1").innerText(), /Board CV and Director Biography/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
    assert.equal(await page.locator("footer").count(), 1);
    assert.equal(await page.locator('a[href="https://www.frc.org.uk/docs/6709/html/"][target="_blank"][rel="noopener noreferrer"]').count(), 1);
    assert.equal(await page.locator('a[href="https://www.spencerstuart.com/what-we-do/functional-roles/board-and-ceo"][target="_blank"][rel="noopener noreferrer"]').count(), 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The board CV draft with the approved shared visual layer should fit a mobile viewport"
    );

    await page.goto(`${baseUrl}/directory/resources/non-executive-director-opportunity-due-diligence/`, {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.locator("h1").innerText(), /Assessing a Non-Executive Director Opportunity/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
    assert.equal(await page.locator("footer").count(), 1);
    assert.equal(await page.locator("main table tbody tr").count(), 6);
    assert.equal(await page.locator('a[href="https://www.frc.org.uk/docs/6709/html/"][target="_blank"][rel="noopener noreferrer"]').count(), 1);
    assert.equal(await page.locator('a[href="https://www.spencerstuart.com/what-we-do/functional-roles/board-and-ceo"][target="_blank"][rel="noopener noreferrer"]').count(), 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The unstyled NED guide should fit a mobile viewport"
    );

    await page.goto(`${baseUrl}/directory/career-resources/mobility/uk-global-talent-digital-technology-leaders/`, {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.locator("h1").innerText(), /UK Global Talent Route: Digital Technology/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('a[href^="https://www.gov.uk/"]').count(), 2);
    assert.match(await page.locator("main").innerText(), /does not assess anyone's eligibility/);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The Global Talent staging draft should fit a mobile viewport"
    );

    await page.goto(`${baseUrl}/directory/resources/hypothetical-career-scenarios/`, {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.locator("h1").innerText(), /Hypothetical Career Scenarios/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
    assert.equal(await page.locator("main ol a").count(), hypotheticalScenarioSlugs.length);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The hypothetical scenario index should fit a mobile viewport"
    );
    for (const slug of hypotheticalScenarioSlugs) {
      const response = await page.goto(
        `${baseUrl}/directory/resources/hypothetical-career-scenarios/${slug}/`,
        { waitUntil: "domcontentloaded" }
      );
      assert.equal(response?.status(), 200, `${slug} should load in the browser`);
      assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
      assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
      assert.match(await page.locator("main > p").first().innerText(), /Fictional scenario — not a real KOV client/);
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(await page.locator("main").innerText(), /not a real KOV client, engagement, testimonial, placement, or outcome/i);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        true,
        `${slug} should fit a mobile viewport`
      );
    }

    await page.goto(`${baseUrl}/directory/roles/soc-major-groups/`, { waitUntil: "domcontentloaded" });
    assert.match(await page.locator("h1").innerText(), /U.S. SOC Major-Group Directory/);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator("main ol a").count(), 23);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "The SOC major-group directory should fit a mobile viewport"
    );
    for (const slug of socMajorGroupSlugs) {
      const response = await page.goto(`${baseUrl}/directory/roles/${slug}/`, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response?.status(), 200, `${slug} should load in the browser`);
      assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
      assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
      assert.equal(await page.locator("main h1").count(), 1);
      assert.ok(await page.locator("main section ul").nth(0).locator("li").count() > 0, `${slug} should list minor groups`);
      assert.ok(await page.locator("main section ul").nth(1).locator("li").count() > 0, `${slug} should list broad groups`);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        true,
        `${slug} should fit a mobile viewport`
      );
    }

    const managementDirectoryResponse = await page.goto(
        `${baseUrl}/directory/roles/soc-management-detail/`,
        { waitUntil: "domcontentloaded" }
    );
    assert.equal(managementDirectoryResponse?.status(), 200);
    assert.equal(await page.locator("main ol a").count(), 38);
    assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
    assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
    assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        true,
        "The detailed SOC directory should fit a mobile viewport"
    );
    for (const slug of socManagementSubgroupSlugs) {
        const response = await page.goto(`${baseUrl}/directory/roles/${slug}/`, {
          waitUntil: "domcontentloaded",
        });
        assert.equal(response?.status(), 200, `${slug} should load in the browser`);
        assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
        assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
        assert.ok(await page.locator("main ol a").count() > 0);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          true,
          `${slug} should fit a mobile viewport`
        );
    }
    for (const slug of occupationSlugs) {
        const response = await page.goto(`${baseUrl}/directory/roles/${slug}/`, {
          waitUntil: "domcontentloaded",
        });
        assert.equal(response?.status(), 200, `${slug} should load in the browser`);
        assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1);
        assert.equal(await page.locator('link[rel="stylesheet"][data-kov-global-redesign]').count(), 1);
        assert.equal(await page.locator("main h1").count(), 1);
        assert.ok((await page.locator("main blockquote").innerText()).length > 20);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          true,
          `${slug} should fit a mobile viewport`
        );
    }

    await page.goto(`${baseUrl}/directory/templates/`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#template-cards .kov-expansion-card").count(), 6);
    assert.equal(await page.locator("#research-table tbody tr").count(), 4);
    assert.equal(await page.locator("#research-note .kov-expansion-note").count(), 1);

    await page.goto(`${baseUrl}/directory/templates/international-mobility.html`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#mobility-cards .kov-expansion-card").count(), 4);
    assert.equal(await page.locator("#evidence-table tbody tr").count(), 4);
    assert.equal(await page.locator("#mobility-note .kov-expansion-note").count(), 1);

    await page.goto(`${baseUrl}/directory/career-resources/`, { waitUntil: "domcontentloaded" });
    const resourceCards = page.locator("[data-resource-card]");
    const visibleResourceCards = page.locator("[data-resource-card]:not([hidden])");
    assert.equal(await resourceCards.count(), 18);
    assert.equal(await page.locator("#resource-results").textContent(), "18 resources shown.");
    await page.locator("#resource-query").fill("salary");
    assert.equal(await visibleResourceCards.count(), 1);
    assert.match(await page.locator("#resource-results").textContent(), /1 resource shown/);
    await page.locator("#resource-query").fill("");
    await page.locator("#resource-category").selectOption("approach");
    assert.equal(await visibleResourceCards.count(), 4);
    await page.locator("#resource-category").selectOption("offers");
    await page.locator("#resource-query").fill("no matching item");
    assert.equal(await visibleResourceCards.count(), 0);
    assert.equal(await page.locator("#resource-empty").isVisible(), true);

    await page.goto(`${baseUrl}/directory/research/`, { waitUntil: "domcontentloaded" });
    const researchSources = page.locator('section[aria-labelledby="research-sources-heading"]');
    assert.equal(await researchSources.locator('a[href^="https://"]').count(), 4);
    assert.equal(await researchSources.locator('a[target="_blank"][rel="noopener noreferrer"]').count(), 4);
    assert.match(await page.locator("main").innerText(), /No original KOV labor-market research reports are approved/);

    await page.goto(
      `${baseUrl}/directory/career-resources/industry-specific-career-guides/bank-executive-to-fintech-career-transition/`,
      { waitUntil: "domcontentloaded" }
    );
    assert.match(await page.locator("h1").innerText(), /Banking Leadership to Fintech/);
    assert.equal(await page.locator("#transfer-map tbody tr").count(), 5);
    assert.equal(await page.locator('a[href="#transfer-map"]').count(), 1);
    assert.equal(await page.locator('a[href="https://www.federalreserve.gov/supervisionreg/srletters/SR2304.htm"]').count(), 2);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.match(await page.locator("main").innerText(), /No keyword volume, hiring forecast, salary benchmark, placement, or career outcome is claimed/);
    assert.equal(
      await page.evaluate(() => {
        const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
        return graph['@graph'].find((node) =>
          node['@type'] === 'WebPage' ||
          (Array.isArray(node['@type']) && node['@type'].includes('WebPage'))
        )?.name;
      }),
      "From Banking Leadership to Fintech: Translating Your Experience"
    );

    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForFunction(() => document.querySelectorAll(".site-mobile-menu-nav a").length === 14);
    assert.equal(await page.locator(".site-mobile-menu-nav a").count(), 14);
    await page.setViewportSize({ width: 1280, height: 844 });
    const desktopSearch = page.locator(".kov-react-nav__search");
    assert.equal(await desktopSearch.isVisible(), true);
    await desktopSearch.click();
    const input = page.locator("#site-search-input");
    await input.fill("services");
    await page.waitForFunction(
      () => document.querySelectorAll(".site-search-results a").length > 0,
      { timeout: 15000 }
    );
    const result = page.locator(".site-search-results a").first();
    assert.equal(new URL(await result.getAttribute("href"), baseUrl).origin, new URL(baseUrl).origin);

    assert.deepEqual(pageErrors, []);
    await context.close();
    console.log("Site foundation smoke checks passed.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
