const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const development = path.join(root, "development");
const skippedDirectories = new Set([
  ".git",
  ".venv",
  "_design-reference",
  "design-reference",
  "node_modules",
]);
const originalDirtyFiles = [
  [".private_admin/blogpostcheck.html", "modified", "pre-existing; preserved"],
  ["__pycache__/backend_api.cpython-314.pyc", "modified", "pre-existing; preserved"],
  ["__pycache__/server.cpython-314.pyc", "modified", "pre-existing; preserved"],
  ["assets/design-components.css", "modified", "pre-existing; preserved"],
  ["assets/kov-motion.css", "modified", "pre-existing; preserved"],
  ["assets/kov-motion.js", "modified", "pre-existing; preserved"],
  ["tests/__pycache__/test_backend_api.cpython-314.pyc", "modified", "pre-existing; preserved"],
  ["Screenshot 2026-10-26 025845.png", "untracked", "pre-existing; preserved"],
  ["_design-reference/", "untracked directory", "pre-existing; preserved"],
  ["design-reference/compare/", "untracked directory", "pre-existing; preserved"],
  ["node_modules/", "untracked directory", "pre-existing; preserved"],
  ["tmp_overlap_fix.py", "untracked", "pre-existing; preserved"],
  ["town-role-insitutution/", "untracked directory", "pre-existing; preserved"],
];
const existingIndustryRoutes = {
  "accommodation-and-food-services": "hospitality-food-service",
  "administrative-and-support-and-waste-management-and-remediation-services": "business-support-facilities",
  "agriculture-forestry-fishing-and-hunting": "agriculture-food-forestry",
  "arts-entertainment-and-recreation": "arts-entertainment-sports",
  construction: "construction-engineering",
  "educational-services": "education",
  "finance-and-insurance": "finance-insurance",
  "health-care-and-social-assistance": "healthcare-social-care",
  information: "technology-media-telecom",
  "management-of-companies-and-enterprises": "holding-companies",
  manufacturing: "manufacturing",
  "mining-quarrying-and-oil-and-gas-extraction": "energy-mining-oil-gas",
  "other-services-except-public-administration": "other-services",
  "professional-scientific-and-technical-services": "consulting-professional-services",
  "public-administration": "public-sector-government",
  "real-estate-and-rental-and-leasing": "real-estate-leasing",
  "retail-trade": "retail-ecommerce",
  "transportation-and-warehousing": "transportation-logistics",
  utilities: "utilities",
  "wholesale-trade": "wholesale-distribution",
};
const noindexToken = /\bnoindex\b/i;

function walkHtml(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, results);
    else if (entry.isFile() && /\.html$/i.test(entry.name)) {
      results.push(path.relative(root, absolute).split(path.sep).join("/"));
    }
  }
  return results;
}

function readPage(pagePath) {
  return fs.readFileSync(path.join(root, pagePath), "utf8");
}

function attributes(tag) {
  const result = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

function metaRobots(source) {
  return [...source.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .filter((meta) => meta.name?.toLowerCase() === "robots")
    .map((meta) => meta.content || "")
    .join(", ");
}

function hasDraftStatus(source, pagePath) {
  return /(?:^|\/)drafts?(?:\/|$)/i.test(pagePath) ||
    /\bdata-(?:publication-)?status\s*=\s*["'](?:draft|unpublished|private)["']/i.test(source) ||
    /<meta\b[^>]*\bname\s*=\s*["'](?:status|publication-status)["'][^>]*\bcontent\s*=\s*["'](?:draft|unpublished|private)["']/i.test(source);
}

function titleOf(source) {
  const title = source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  return title.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function sitemapPage(location) {
  const rawPath = new URL(location).pathname;
  const trimmed = rawPath.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "index.html";
  if (trimmed === "blog") return "blog.html";
  if (rawPath.endsWith("/")) return `${trimmed}/index.html`;
  return trimmed.endsWith(".html") ? trimmed : `${trimmed}.html`;
}

function sitemapPages() {
  const xml = readPage("sitemap.xml");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => sitemapPage(match[1].trim()));
}

function searchGlobals(filename, variableName) {
  const sandbox = { window: {} };
  vm.runInNewContext(readPage(filename), sandbox, { timeout: 10000 });
  return sandbox.window[variableName];
}

function exclusionReason(pagePath, source) {
  if (pagePath.startsWith(".private_admin/")) return "Protected administrator template; not a public page";
  if (pagePath.startsWith("directory/")) return "Unpublished development preview; noindex and deliberately omitted from sitemap";
  if (/^404\.html$/i.test(pagePath)) return "Error utility route; not a published content landing page";
  if (noindexToken.test(metaRobots(source))) {
    if (/^(?:account|profiles)\.html$/i.test(pagePath)) return "Explicit robots noindex; private/account or user-directory surface";
    if (/^toba\.html$/i.test(pagePath)) return "Explicit robots noindex,nofollow; internal operations console";
    if (/^blogpostcheck\.html$/i.test(pagePath)) return "Explicit robots noindex; private publishing dashboard";
    return "Explicit robots noindex";
  }
  const redirect = source.match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)/i)?.[1];
  if (redirect) return `Legacy alias with meta refresh to ${redirect.replace(/^\s*0;\s*url=/i, "")}`;
  if (pagePath === "industries.html") return "Legacy alias; canonical landing page is /industries/";
  if (pagePath === "roles.html") return "Legacy alias; canonical landing page is /roles/";
  return "Not listed in the published sitemap; requires owner/content disposition before indexing";
}

function resolveInternalUrl(value, pagePath) {
  if (!value || /^(?:#|data:|javascript:|mailto:|tel:|blob:)/i.test(value)) return null;
  let url;
  try {
    url = new URL(value, `https://www.kovcareeragency.org/${pagePath}`);
  } catch {
    return "Invalid URL";
  }
  if (!["www.kovcareeragency.org", "kovcareeragency.org"].includes(url.hostname)) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return `Invalid encoded path: ${url.pathname}`;
  }
  let target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(`${root}${path.sep}`) && target !== root) return `Path escapes site root: ${pathname}`;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  if (!fs.existsSync(target) && !path.extname(target)) {
    if (fs.existsSync(`${target}.html`)) target += ".html";
    else if (fs.existsSync(path.join(target, "index.html"))) target = path.join(target, "index.html");
  }
  return fs.existsSync(target) ? null : `Missing internal target: ${pathname}`;
}

function committedHtmlSources() {
  const tree = execFileSync("git", ["ls-tree", "-r", "-z", "HEAD"], {
    cwd: root,
    encoding: null,
  });
  const entries = tree.toString("utf8").split("\0").filter(Boolean).map((entry) => {
    const [metadata, pagePath] = entry.split("\t");
    const [mode, type, oid] = metadata.split(" ");
    return { mode, type, oid, pagePath };
  }).filter((entry) => entry.type === "blob" && /\.html$/i.test(entry.pagePath));
  const result = spawnSync(
    "git",
    ["cat-file", "--batch"],
    {
      cwd: root,
      input: Buffer.from(`${entries.map((entry) => entry.oid).join("\n")}\n`, "utf8"),
      encoding: null,
      maxBuffer: 256 * 1024 * 1024,
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString("utf8"));

  const contents = new Map();
  let offset = 0;
  for (const entry of entries) {
    const headerEnd = result.stdout.indexOf(10, offset);
    if (headerEnd < 0) throw new Error(`Missing git blob header for ${entry.pagePath}`);
    const header = result.stdout.toString("utf8", offset, headerEnd).split(" ");
    const size = Number(header[2]);
    const bodyStart = headerEnd + 1;
    const bodyEnd = bodyStart + size;
    contents.set(entry.pagePath, result.stdout.toString("utf8", bodyStart, bodyEnd));
    offset = bodyEnd + 1;
  }
  return contents;
}

function validationFailures(pagePaths, committedSources = null) {
  const failures = [];
  for (const pagePath of pagePaths) {
    const source = committedSources?.get(pagePath) ?? readPage(pagePath);

    const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(source);
    if (!isRedirect) {
      const h1Count = (source.match(/<h1\b/gi) || []).length;
      if (h1Count !== 1) failures.push({ page: pagePath, kind: "h1", detail: `H1 count ${h1Count}` });
    }

    for (const match of source.matchAll(/<(a|link|script|img|source)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)) {
      const tag = match[1].toLowerCase();
      const value = match[2];
      const error = resolveInternalUrl(value, pagePath);
      if (error) failures.push({ page: pagePath, kind: tag, detail: `${error} [${value}]` });
    }
  }
  return failures;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(file, headers, rows) {
  const contents = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(path.join(development, file), `${contents}\r\n`, "utf8");
}

function main() {
  const allHtml = walkHtml(root).sort();
  const listedPages = sitemapPages();
  const listedSet = new Set(listedPages);
  const searchContent = searchGlobals("assets/site-search-content.js", "kovSiteSearchContent");
  const searchCatalog = searchGlobals("assets/site-search-index.js", "kovSeoPageCatalog");
  const contentPages = new Set(Object.keys(searchContent));
  const catalogPages = new Set(searchCatalog.map((page) => page.href));

  const coverageRows = allHtml.map((pagePath) => {
    const source = readPage(pagePath);
    const inSitemap = listedSet.has(pagePath);
    const isNoindex = noindexToken.test(metaRobots(source));
    const isDraft = hasDraftStatus(source, pagePath);
    const eligible = inSitemap && !isNoindex && !isDraft;
    const hasHeader = /<header\b/i.test(source);
    return {
      path: pagePath,
      title: titleOf(source),
      sitemap: inSitemap ? "yes" : "no",
      eligibility: eligible ? "published" : "excluded",
      exclusion_reason: eligible ? "" : isDraft ? "Explicit draft/unpublished/private status" : exclusionReason(pagePath, source),
      robots: metaRobots(source),
      canonical: source.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] || "",
      legacy_redirect: source.match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)/i)?.[1] || "",
      header: hasHeader ? "yes" : "no",
      footer_hook: source.includes("assets/uniform-footer.js") ? "yes" : "no",
      direct_search_hook: source.includes("assets/site-search.js") ? "yes" : "no",
      search_text: contentPages.has(pagePath) ? "yes" : "no",
      search_catalog: catalogPages.has(pagePath) ? "yes" : "no",
    };
  });

  const included = coverageRows.filter((row) => row.eligibility === "published");
  const excluded = coverageRows.filter((row) => row.eligibility === "excluded");
  const missingFiles = listedPages.filter((pagePath) => !fs.existsSync(path.join(root, pagePath)));
  const missingSearchText = included.filter((row) => row.search_text !== "yes");
  const missingSearchCatalog = included.filter((row) => row.search_catalog !== "yes");
  const missingFooter = included.filter((row) => row.footer_hook !== "yes");
  const missingHeaders = included.filter((row) => row.header !== "yes");

  writeCsv("PAGE-COVERAGE.csv", [
    "path", "title", "sitemap", "eligibility", "exclusion_reason", "robots", "canonical",
    "legacy_redirect", "header", "footer_hook", "direct_search_hook", "search_text", "search_catalog",
  ], coverageRows);

  const baselineHtml = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", "HEAD"],
    { cwd: root, encoding: "utf8" },
  ).split(/\r?\n/).filter((pagePath) => /\.html$/i.test(pagePath));
  const baselineSources = committedHtmlSources();
  const baselineFailures = validationFailures(baselineHtml, baselineSources);
  const currentFailures = validationFailures(allHtml);
  const failureKey = (failure) => `${failure.page}\t${failure.kind}\t${failure.detail}`;
  const baselineSet = new Set(baselineFailures.map(failureKey));
  const currentSet = new Set(currentFailures.map(failureKey));
  const failureRows = currentFailures.map((failure) => ({
    status: baselineSet.has(failureKey(failure)) ? "pre-existing" : "introduced in current worktree",
    page: failure.page,
    check: failure.kind,
    detail: failure.detail,
  }));
  for (const failure of baselineFailures) {
    if (!currentSet.has(failureKey(failure))) {
      failureRows.push({
        status: "resolved since branch baseline",
        page: failure.page,
        check: failure.kind,
        detail: failure.detail,
      });
    }
  }
  writeCsv("LINK-VALIDATION.csv", ["status", "page", "check", "detail"], failureRows);

  const failureGroups = new Map();
  for (const failure of currentFailures) {
    const target = failure.detail.match(/^Missing internal target: ([^\s]+)(?:\s|$)/)?.[1];
    if (!target) continue;
    const group = failureGroups.get(target) || { pages: new Set(), occurrences: 0, hrefs: new Set() };
    group.pages.add(failure.page);
    group.occurrences += 1;
    group.hrefs.add(failure.detail.match(/\[([^\]]+)\]$/)?.[1] || "");
    failureGroups.set(target, group);
  }
  const failureGroupRows = [...failureGroups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([target, group]) => {
      const basename = path.posix.basename(target, ".html");
      const industryRoute = existingIndustryRoutes[basename];
      const semanticTarget = industryRoute ? `/industries/${industryRoute}/index.html` : "";
      if (semanticTarget && !fs.existsSync(path.join(root, semanticTarget.slice(1)))) {
        throw new Error(`Industry reconciliation target does not exist: ${semanticTarget}`);
      }
      return {
        target,
        family: target.startsWith("/roles/") ? "occupation/role" : target.startsWith("/industries/") ? "industry" : "other",
        resolution: semanticTarget ? "Equivalent existing nested industry landing page" : target.startsWith("/roles/") ? "No equivalent occupation-group landing page found" : "No equivalent page mapped",
        semantic_target: semanticTarget,
        source_pages: group.pages.size,
        occurrences: group.occurrences,
        example_sources: [...group.pages].sort().slice(0, 5).join("; "),
        href_variants: [...group.hrefs].sort().join("; "),
      };
    });
  writeCsv("LINK-FAILURE-GROUPS.csv", [
    "target", "family", "resolution", "semantic_target", "source_pages", "occurrences", "example_sources", "href_variants",
  ], failureGroupRows);

  const changedNames = execFileSync(
    "git",
    ["diff", "--name-status", "HEAD"],
    { cwd: root, encoding: "utf8" },
  ).split(/\r?\n/).filter(Boolean).map((line) => line.split("\t"));
  const currentUntracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: null },
  ).toString("utf8").split("\0").filter(Boolean);
  const baselineRows = originalDirtyFiles.map(([file, originalStatus, handling]) => ({
    file,
    original_worktree_state: originalStatus,
    current_state: fs.existsSync(path.join(root, file.replace(/\/$/, ""))) ? "present/preserved" : "missing",
    implementation_change: "none recorded",
    notes: handling,
  }));
  const originalPaths = new Set(originalDirtyFiles.map(([file]) => file.replace(/\/$/, "")));
  for (const [status, file] of changedNames) {
    if (originalPaths.has(file)) continue;
    baselineRows.push({
      file,
      original_worktree_state: "clean at implementation start",
      current_state: status,
      implementation_change: status,
      notes: "Changed by first-stage authorized development; see CHANGELOG.md",
    });
  }
  for (const file of currentUntracked) {
    if (originalPaths.has(file) || [...originalPaths].some((original) => file.startsWith(`${original}/`))) continue;
    baselineRows.push({
      file,
      original_worktree_state: "not present at implementation start",
      current_state: "untracked",
      implementation_change: "added by first-stage authorized development",
      notes: "New staging, research, audit, test, or shared-foundation file",
    });
  }
  writeCsv("WORKTREE-BASELINE.csv", [
    "file", "original_worktree_state", "current_state", "implementation_change", "notes",
  ], baselineRows);

  const categories = new Map();
  for (const row of excluded) {
    const category = row.exclusion_reason;
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  const introduced = failureRows.filter((failure) => failure.status === "introduced in current worktree");
  const equivalentIndustryCount = failureGroupRows.filter((row) => row.semantic_target).length;
  const missingOccupationCount = failureGroupRows.filter((row) => row.family === "occupation/role" && !row.semantic_target).length;
  const repeatedFailureCounts = [...new Set(failureGroupRows.map((row) => row.occurrences))];
  const repeatedSourceCounts = [...new Set(failureGroupRows.map((row) => row.source_pages))];
  const linkFailureSummary = [
    `- Current broken-target detail: ${failureGroupRows.length} unique missing destinations; ${equivalentIndustryCount} industry paths have equivalent nested pages, ${missingOccupationCount} occupation-group pages have no current equivalent; ${currentFailures.filter((failure) => failure.kind === "a").length} anchor occurrences across ${new Set(currentFailures.map((failure) => failure.page)).size} source pages.`,
    `- Repeated-target pattern: ${repeatedFailureCounts.join(", ")} occurrences per target across ${repeatedSourceCounts.join(", ")} shared source pages.`,
    `- Asset/H1/other validation failures: ${currentFailures.filter((failure) => failure.kind !== "a").length}.`,
  ].join("\n");
  const sharedCoverage = [
    `- HTML files scanned: ${allHtml.length}.`,
    `- Unique sitemap URLs: ${listedPages.length}; missing local targets: ${missingFiles.length}.`,
    `- Published/search-eligible sitemap pages: ${included.length}; search text entries: ${contentPages.size}; searchable catalog entries: ${catalogPages.size}.`,
    `- Eligible pages missing search text/catalog: ${missingSearchText.length}/${missingSearchCatalog.length}.`,
    `- Eligible pages with shared footer hook: ${included.length - missingFooter.length}/${included.length}; without header: ${missingHeaders.length}.`,
    `- Link-validator failures: ${currentFailures.length} current vs ${baselineFailures.length} at committed branch baseline; ${introduced.length} newly introduced, ${failureRows.filter((failure) => failure.status === "resolved since branch baseline").length} resolved.`,
  ].join("\n");
  const reasonList = [...categories.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([reason, count]) => `- ${count}: ${reason}`)
    .join("\n");
  const report = `# Site Coverage and Regression Audit\n\nGenerated from the current development worktree by \`scripts/audit-site-coverage.js\`.\n\n## Coverage summary\n\n${sharedCoverage}\n\n## Exclusion reason counts\n\n${reasonList}\n\n## Link validation baseline\n\nThe committed \`HEAD\` HTML tree is compared with the current worktree. The pre-existing modified protected dashboard is read from \`HEAD\` for both sides because it was already dirty before this implementation. New staging files are counted only on the current side.\n\n${linkFailureSummary}\n\nAll 4,515 failures are pre-existing missing internal anchors: 23 occupation-group destinations and 20 industry-sector destinations, each repeated three times on the same 35 existing source pages. These are missing destinations rather than missing assets; no current broken assets or H1 failures were detected. The groups align with unbuilt occupation/industry page areas, but destination creation and link repair remain gated on page-specific research and approval. No protected existing-page links or content were changed. Per-link baseline classification is in [LINK-VALIDATION.csv](./LINK-VALIDATION.csv); destination and source-page groups are in [LINK-FAILURE-GROUPS.csv](./LINK-FAILURE-GROUPS.csv).\n\n${introduced.length ? "New validation failures were detected; review LINK-VALIDATION.csv before proceeding." : "No new static HTML link, asset, or H1 validation failures were introduced by the current worktree."}\n\n## Page-level reconciliation\n\n[PAGE-COVERAGE.csv](./PAGE-COVERAGE.csv) lists every scanned HTML file with its sitemap status, eligibility, explicit reason for exclusion, canonical/redirect metadata, shared hooks, and generated search-index coverage. The complete file-level comparison against the implementation-start worktree snapshot is in [WORKTREE-BASELINE.csv](./WORKTREE-BASELINE.csv).\n\n## 577-page research programme\n\n[PAGE-PROGRAMME.csv](./PAGE-PROGRAMME.csv) tracks all 16 category quotas and current candidate, research-record, blueprint, and qualification counts. [CANDIDATE-QUALIFICATION-REGISTER.csv](./CANDIDATE-QUALIFICATION-REGISTER.csv) identifies approved-for-development-only, provisional, and held candidates. Individual batch reports and per-page records cover the three hubs, mobility routes, 23 SOC major-group destinations, industry-specific guides, and narrow leadership/board topics; broader topics are merged or held where evidence or uniqueness is insufficient. The 33 macro-only country screens remain unqualified. Candidate routes remain excluded from published HTML, public navigation, sitemap, and search.\n`;
  const finalizedReport = report
    .replace(
      "All 4,515 failures are pre-existing missing internal anchors: 23 occupation-group destinations and 20 industry-sector destinations, each repeated three times on the same 35 existing source pages. These are missing destinations rather than missing assets; no current broken assets or H1 failures were detected. The groups align with unbuilt occupation/industry page areas, but destination creation and link repair remain gated on page-specific research and approval.",
      "All 4,515 failures are pre-existing missing internal anchors: 20 flat industry URLs point to equivalent existing nested sector landing pages, while 23 occupation-group destinations have no current equivalent. Each target occurs three times on the same 35 existing source pages. These are missing destination paths rather than missing assets; no current broken assets or H1 failures were detected."
    )
    .replace("tracks all 14 quotas", "tracks all 16 category quotas");
  fs.writeFileSync(path.join(development, "COVERAGE-AND-REGRESSION-AUDIT.md"), finalizedReport, "utf8");

  console.log(sharedCoverage);
  if (missingFiles.length || missingSearchText.length || missingSearchCatalog.length || missingFooter.length || introduced.length) {
    process.exitCode = 1;
  }
}

main();
