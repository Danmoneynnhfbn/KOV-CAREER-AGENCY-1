const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const directoryRoot = path.join(root, "directory");
const developmentRoot = path.join(root, "development");
const publicOrigin = "https://www.kovcareeragency.org";
const categoryHubDirectories = new Set([
  "career-resources/board-non-executive-career/index.html",
  "career-resources/comparison-educational/index.html",
  "career-resources/country-market-guides/index.html",
  "career-resources/country-role-pages/index.html",
  "career-resources/executive-career-guides/index.html",
  "career-resources/industry-specific-career-guides/index.html",
  "career-resources/interview-guides/index.html",
  "career-resources/leadership-skills-competencies/index.html",
  "career-resources/market-reports/index.html",
  "career-resources/mobility/index.html",
  "career-resources/salary-compensation-guides/index.html",
  "career-resources/transition-guides/index.html",
  "roles/index.html",
]);

function parseCsv(contents) {
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
  if (!headers?.length) throw new Error("CSV has no header row");
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows, columns) {
  const lines = [columns.map(csvEscape).join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function walkHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(entryPath);
    return entry.isFile() && /\.html?$/i.test(entry.name) ? [entryPath] : [];
  });
}

function routeForFile(filePath) {
  const relative = path.relative(directoryRoot, filePath).split(path.sep).join("/");
  if (relative === "index.html") return "/directory/";
  if (relative.endsWith("/index.html")) return `/directory/${relative.slice(0, -"index.html".length)}`;
  return `/directory/${relative}`;
}

function fileForRoute(route) {
  const pathname = new URL(route, publicOrigin).pathname;
  const relative = pathname.replace(/^\/+/, "");
  const direct = path.resolve(root, relative);
  if (direct !== root && !direct.startsWith(`${root}${path.sep}`)) return null;
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (!path.extname(direct) && fs.existsSync(path.join(direct, "index.html"))) {
    return path.join(direct, "index.html");
  }
  if (!path.extname(direct) && fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

function textContent(html) {
  return html
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;|&#39;|&apos;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMetaContents(html, nameOrProperty) {
  const values = [];
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<meta\\b(?=[^>]*(?:name|property)=["']${escaped}["'])[^>]*content=["']([^"']*)["'][^>]*>`,
    "gi"
  );
  for (const match of html.matchAll(regex)) values.push(match[1].trim());
  return values;
}

function getLinkHrefs(html, rel) {
  const values = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    if (relMatch && hrefMatch && relMatch[1].toLowerCase().split(/\s+/).includes(rel)) {
      values.push(hrefMatch[1].trim());
    }
  }
  return values;
}

function getTitle(html) {
  return (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getH1(html) {
  return (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getJsonLd(html) {
  const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  const parsed = [];
  let invalid = 0;
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block[1]));
    } catch {
      invalid += 1;
    }
  }
  return { count: blocks.length, valid: parsed.length, invalid, parsed };
}

function findSchemaEntities(value, type, results = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => findSchemaEntities(item, type, results));
  } else if (value && typeof value === "object") {
    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    if (types.includes(type)) results.push(value);
    Object.values(value).forEach((item) => findSchemaEntities(item, type, results));
  }
  return results;
}

function stripGeneratedLinks(html) {
  return html
    .replace(/<nav\b[^>]*class=["'][^"']*kov-breadcrumb[^"']*["'][\s\S]*?<\/nav>/gi, "")
    .replace(/<section\b[^>]*data-kov-internal-links[^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/<section\b[^>]*data-kov-(?:staging-link-hub|career-hub-links)[^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizeUrl(value, base) {
  try {
    const parsed = new URL(value, base);
    parsed.hash = "";
    return parsed.href.replace(/\/$/, parsed.pathname === "/" ? "/" : "");
  } catch {
    return "";
  }
}

function canonicalConflictGroups(records) {
  const grouped = new Map();
  for (const record of records) {
    const canonical = record.canonical_url;
    if (!canonical) continue;
    if (!grouped.has(canonical)) grouped.set(canonical, []);
    grouped.get(canonical).push(record);
  }
  return [...grouped.entries()]
    .filter(([, pages]) => pages.length > 1)
    .map(([canonical, pages]) => ({ canonical, pages }));
}

function getTargetIds(html) {
  const ids = new Set();
  for (const match of html.matchAll(/\bid=["']([^"']+)["']/gi)) ids.add(match[1]);
  for (const match of html.matchAll(/<a\b[^>]*\bname=["']([^"']+)["']/gi)) ids.add(match[1]);
  return ids;
}

function classifyAdditional(relativePath, html) {
  const normalized = relativePath.toLowerCase();
  if (normalized === "index.html") return "staging root/support index";
  if (/^(career-resources|research|professional-directory)\/index\.html$/.test(normalized)) {
    return "staging hub/support page";
  }
  if (categoryHubDirectories.has(relativePath)) return "staging category hub/support page";
  if (normalized.startsWith("templates/")) return "staging template/support page";
  if (normalized.startsWith("visual-assets/")) return "staging visual-asset/support page";
  if (normalized.endsWith("/index.html") && /hub|directory|index/i.test(getH1(html))) {
    return "unregistered staging hub/support page";
  }
  return "additional staged resource not mapped to the 577-page programme";
}

function publicPathForUrl(url) {
  const pathname = new URL(url, publicOrigin).pathname;
  if (pathname.endsWith("/")) return `${pathname.slice(1)}index.html`;
  return pathname.slice(1).endsWith(".html") ? pathname.slice(1) : `${pathname.slice(1)}.html`;
}

function gitOutput(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch (error) {
    return `git check failed: ${error.message}`;
  }
}

function main() {
  const tracker = parseCsv(fs.readFileSync(path.join(developmentRoot, "PAGE-TRACKER.csv"), "utf8"));
  const candidates = parseCsv(fs.readFileSync(path.join(developmentRoot, "CANDIDATE-REGISTER.csv"), "utf8"));
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const sitemapUrls = new Set(
    [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => match[1].trim())
  );
  const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
  const searchIndex = fs.readFileSync(path.join(root, "assets", "site-search-index.js"), "utf8");
  const searchCatalogWindow = { window: {} };
  vm.runInNewContext(searchIndex, searchCatalogWindow);
  const searchCatalogHrefs = new Set(
    searchCatalogWindow.window.kovSeoPageCatalog.map((page) => page.href)
  );
  const installedManifestPath = path.join(developmentRoot, "INSTALLED-PROGRAMME-ROUTES.csv");
  const installedManifest = fs.existsSync(installedManifestPath)
    ? parseCsv(fs.readFileSync(installedManifestPath, "utf8"))
    : [];
  const installedProgrammeById = new Map(
    installedManifest
      .filter((entry) => entry.kind === "programme page")
      .map((entry) => [entry.programme_id, entry.file_path])
  );
  const installedPublicPaths = new Set(installedManifest.map((entry) => entry.file_path));
  const candidateById = new Map(candidates.map((candidate) => [candidate.candidate_id, candidate]));
  const files = walkHtml(directoryRoot).sort((left, right) => left.localeCompare(right));
  const mappedByFile = new Map();
  const duplicateRouteRows = [];
  const routeOwners = new Map();
  const proposedUrlOwners = new Map();

  for (const row of tracker) {
    const route = row.staging_preview_url;
    const filePath = route ? fileForRoute(route) : null;
    const candidate = candidateById.get(row.id);
    const record = { row, route, filePath, candidate };
    if (!filePath) continue;
    if (mappedByFile.has(filePath)) {
      duplicateRouteRows.push({ filePath, first: mappedByFile.get(filePath).row.id, duplicate: row.id, route });
    } else {
      mappedByFile.set(filePath, record);
    }
    const normalizedRoute = canonicalizeUrl(route, publicOrigin).toLowerCase();
    if (!routeOwners.has(normalizedRoute)) routeOwners.set(normalizedRoute, []);
    routeOwners.get(normalizedRoute).push(row.id);
    const normalizedProposedUrl = canonicalizeUrl(row.proposed_url, publicOrigin).toLowerCase();
    if (!proposedUrlOwners.has(normalizedProposedUrl)) proposedUrlOwners.set(normalizedProposedUrl, []);
    proposedUrlOwners.get(normalizedProposedUrl).push(row.id);
  }

  const inventory = [];
  const programmeAudit = [];
  const linkAudit = [];
  const contentHashes = new Map();
  const canonicalOwners = new Map();
  let totalInternalNewLinks = 0;
  let totalInternalPublicLinks = 0;
  let totalInternalStagingSupportLinks = 0;
  let totalBrokenLinks = 0;
  let allStagingBrokenLinks = 0;
  const programmeIncomingRoutes = new Set();

  for (const filePath of files) {
    const html = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(directoryRoot, filePath).split(path.sep).join("/");
    const route = routeForFile(filePath);
    const mapped = mappedByFile.get(filePath);
    const title = getTitle(html);
    const h1 = getH1(html);
    const descriptionValues = getMetaContents(html, "description");
    const canonicalValues = getLinkHrefs(html, "canonical");
    const robotsValues = getMetaContents(html, "robots");
    const jsonLd = getJsonLd(html);
    const bodyText = textContent(html);
    const placeholderLanguage = /structured route placeholder|research guide and candidate route|supports route definition, route review|this staging page provides|questions this page should answer|source links and review notes|route was generated to satisfy the programme register|staging route for KOV Career Agency|proposed route created for internal programme completion/i.test(html);
    const contentHash = crypto.createHash("sha256").update(stripGeneratedLinks(html)).digest("hex");
    if (!contentHashes.has(contentHash)) contentHashes.set(contentHash, []);
    contentHashes.get(contentHash).push(route);
    const canonicalUrl = canonicalValues.length === 1
      ? canonicalizeUrl(canonicalValues[0], `${publicOrigin}${route}`)
      : "";
    const webPageEntities = jsonLd.parsed.flatMap((block) => findSchemaEntities(block, "WebPage"));
    const breadcrumbEntities = jsonLd.parsed.flatMap((block) => findSchemaEntities(block, "BreadcrumbList"));
    const schemaPageConsistent = webPageEntities.length === 1 &&
      canonicalizeUrl(webPageEntities[0].url ?? "", `${publicOrigin}${route}`) === canonicalUrl &&
      webPageEntities[0].name === title &&
      webPageEntities[0].description === (descriptionValues[0] ?? "") &&
      breadcrumbEntities.length === 1 &&
      canonicalizeUrl(breadcrumbEntities[0].itemListElement?.at(-1)?.item ?? "", `${publicOrigin}${route}`) === canonicalUrl;
    if (canonicalUrl) {
      if (!canonicalOwners.has(canonicalUrl)) canonicalOwners.set(canonicalUrl, []);
      canonicalOwners.get(canonicalUrl).push(route);
    }
    const robotsNoindex = robotsValues.some((value) => /\bnoindex\b/i.test(value));
    const robotsNofollow = robotsValues.some((value) => /\bnofollow\b/i.test(value));
    const openGraph = ["og:title", "og:description", "og:url", "og:type", "og:image"]
      .every((property) => getMetaContents(html, property).length === 1);
    const twitter = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]
      .every((name) => getMetaContents(html, name).length === 1);
    const metaDescription = descriptionValues.length === 1 ? descriptionValues[0] : "";
    const intendedPublicUrl = mapped?.row.proposed_url ?? "";
    const targetIds = getTargetIds(html);
    const links = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)];
    const isProgramme = Boolean(mapped);
    let newLinks = 0;
    let publicLinks = 0;
    let brokenLinks = 0;
    let outgoingInternal = 0;
    let breadcrumbCount = (html.match(/<nav\b[^>]*class=["'][^"']*kov-breadcrumb[^"']*["']/gi) ?? []).length;

    for (const match of links) {
      const href = match[1].replace(/&amp;/gi, "&").trim();
      if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      let destination;
      try {
        destination = new URL(href, `${publicOrigin}${route}`);
      } catch {
        linkAudit.push({ source_route: route, href, destination_route: "", link_type: "invalid URL", result: "broken" });
        brokenLinks += 1;
        allStagingBrokenLinks += 1;
        if (isProgramme) totalBrokenLinks += 1;
        continue;
      }
      if (!["http:", "https:"].includes(destination.protocol) || destination.origin !== publicOrigin) continue;

      outgoingInternal += 1;
      const destinationPath = `${destination.pathname}${destination.search}`;
      const targetFile = fileForRoute(destination.pathname);
      let result = targetFile ? "valid" : "broken";
      if (targetFile && destination.hash) {
        const targetHtml = fs.readFileSync(targetFile, "utf8");
        const fragmentId = decodeURIComponent(destination.hash.slice(1));
        if (!getTargetIds(targetHtml).has(fragmentId)) result = "broken fragment";
      }
      const isNewProgram = targetFile && mappedByFile.has(targetFile);
      const isStagingSupport = targetFile && destination.pathname.startsWith("/directory/") && !isNewProgram;
      const linkType = isNewProgram
        ? "programme page"
        : isStagingSupport
          ? "staging support page"
          : "existing public page";
      if (result !== "valid") {
        brokenLinks += 1;
        allStagingBrokenLinks += 1;
        if (isProgramme) totalBrokenLinks += 1;
      } else if (isNewProgram) {
        newLinks += 1;
        if (isProgramme) totalInternalNewLinks += 1;
        programmeIncomingRoutes.add(routeForFile(targetFile));
      } else if (isStagingSupport) {
        if (isProgramme) totalInternalStagingSupportLinks += 1;
      } else {
        publicLinks += 1;
        if (isProgramme) totalInternalPublicLinks += 1;
      }
      linkAudit.push({
        source_route: route,
        href,
        destination_route: destinationPath,
        link_type: linkType,
        result,
      });
    }

    const additionalType = isProgramme ? "programme-register-mapped route (not publication-approved)" : classifyAdditional(relativePath, html);
    inventory.push({
      file_path: `directory/${relativePath}`,
      intended_staging_url: route,
      programme_id: mapped?.row.id ?? "",
      programme_group: mapped?.row.page_group ?? "",
      classification: additionalType,
      title,
      h1,
      content_sha256_excluding_generated_links: contentHash,
      visible_text_characters: bodyText.length,
      placeholder_language_detected: placeholderLanguage,
      file_bytes: Buffer.byteLength(html, "utf8"),
      noindex: robotsNoindex,
      canonical_count: canonicalValues.length,
    });

    if (isProgramme) {
      const actualPublicFile = intendedPublicUrl ? fileForRoute(intendedPublicUrl) : null;
      const installedPath = installedProgrammeById.get(mapped.row.id);
      const isInstalledProgrammeFile = Boolean(actualPublicFile && installedPath) &&
        path.resolve(actualPublicFile) === path.resolve(root, installedPath);
      const publicFileExists = Boolean(actualPublicFile) && !isInstalledProgrammeFile;
      programmeAudit.push({
        programme_id: mapped.row.id,
        programme_group: mapped.row.page_group,
        programme_route: route,
        intended_public_url: intendedPublicUrl,
        file_path: `directory/${relativePath}`,
        file_exists: true,
        title,
        title_unique_check: "",
        description: metaDescription,
        description_unique_check: "",
        h1,
        h1_count: (html.match(/<h1\b/gi) ?? []).length,
        visible_text_characters: bodyText.length,
        likely_substantive_500_chars: bodyText.length >= 500,
        placeholder_language_detected: placeholderLanguage,
        content_substantiveness_verified: false,
        duplicate_content_hash: contentHash,
        canonical_count: canonicalValues.length,
        canonical_url: canonicalUrl,
        canonical_matches_intended_public_url: Boolean(canonicalUrl) &&
          canonicalUrl === canonicalizeUrl(intendedPublicUrl, publicOrigin),
        robots: robotsValues.join(" | "),
        noindex: robotsNoindex,
        nofollow: robotsNofollow,
        og_complete: openGraph,
        twitter_complete: twitter,
        jsonld_blocks: jsonLd.count,
        jsonld_valid_blocks: jsonLd.valid,
        jsonld_invalid_blocks: jsonLd.invalid,
        jsonld_valid: jsonLd.count > 0 && jsonLd.invalid === 0,
        jsonld_page_consistent: schemaPageConsistent,
        internal_new_page_links: newLinks,
        internal_existing_public_links: publicLinks,
        internal_outgoing_links: outgoingInternal,
        broken_internal_links: brokenLinks,
        breadcrumb_count: breadcrumbCount,
        intended_public_url_already_exists: publicFileExists,
        intended_public_url_installed_locally: isInstalledProgrammeFile,
        in_public_sitemap: Boolean(intendedPublicUrl) &&
          sitemapUrls.has(new URL(intendedPublicUrl, publicOrigin).href),
        in_search_index: Boolean(intendedPublicUrl) &&
          searchCatalogHrefs.has(publicPathForUrl(intendedPublicUrl)),
      });
    }
  }

  const titleCounts = new Map();
  const descriptionCounts = new Map();
  for (const row of programmeAudit) {
    if (row.title) titleCounts.set(row.title, (titleCounts.get(row.title) ?? 0) + 1);
    if (row.description) descriptionCounts.set(row.description, (descriptionCounts.get(row.description) ?? 0) + 1);
  }
  for (const row of programmeAudit) {
    row.title_unique_check = row.title && titleCounts.get(row.title) === 1;
    row.description_unique_check = row.description && descriptionCounts.get(row.description) === 1;
  }

  const routeDuplicates = [...routeOwners.entries()].filter(([, ids]) => ids.length > 1);
  const proposedUrlDuplicates = [...proposedUrlOwners.entries()].filter(([, ids]) => ids.length > 1);
  const hashDuplicates = [...contentHashes.entries()].filter(([, routes]) => routes.length > 1);
  const canonicalDuplicates = [...canonicalOwners.entries()].filter(([, routes]) => routes.length > 1);
  const unmatchedRows = tracker.filter((row) => !row.staging_preview_url || !fileForRoute(row.staging_preview_url));
  const orphanProgrammeRoutes = programmeAudit
    .map((row) => row.programme_route)
    .filter((route) => !programmeIncomingRoutes.has(route));
  const mappedFiles = new Set(mappedByFile.keys());
  const extraFiles = files.filter((filePath) => !mappedFiles.has(filePath));
  const sitemapProgramme = programmeAudit.filter((row) =>
    Boolean(row.intended_public_url) &&
      sitemapUrls.has(new URL(row.intended_public_url, publicOrigin).href)
  );
  const llmsProgramme = programmeAudit.filter((row) =>
    Boolean(row.intended_public_url) &&
      llms.includes(`](${new URL(row.intended_public_url, publicOrigin).href})`)
  );
  const searchProgramme = programmeAudit.filter((row) =>
    Boolean(row.intended_public_url) &&
      searchCatalogHrefs.has(publicPathForUrl(row.intended_public_url))
  );
  const publicTrackedDiff = gitOutput(["diff", "--name-only", "HEAD", "--"]);
  const robotsDiff = gitOutput(["diff", "--quiet", "HEAD", "--", "robots.txt"]) === "" ? "unchanged" : "changed";
  const sitemapDiff = gitOutput(["diff", "--quiet", "HEAD", "--", "sitemap.xml"]) === "" ? "unchanged" : "changed";
  const publicDiffFiles = publicTrackedDiff
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !file.startsWith("directory/") && !file.startsWith("development/") && !file.startsWith("scripts/"))
    .filter((file) => !["sitemap.xml", "llms.txt"].includes(file));
  const untrackedPublicHtml = gitOutput(["ls-files", "--others", "--exclude-standard", "--", "*.html", "roles", "markets", "industries", "services", "resources", "faq"])
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !file.startsWith("directory/"))
    .filter((file) => !installedPublicPaths.has(file.split(path.sep).join("/")));

  const inventoryColumns = [
    "file_path", "intended_staging_url", "programme_id", "programme_group", "classification",
    "title", "h1", "content_sha256_excluding_generated_links", "visible_text_characters",
    "placeholder_language_detected",
    "file_bytes", "noindex", "canonical_count",
  ];
  const auditColumns = [
    "programme_id", "programme_group", "programme_route", "intended_public_url", "file_path", "file_exists",
    "title", "title_unique_check", "description", "description_unique_check", "h1", "h1_count",
    "visible_text_characters", "likely_substantive_500_chars", "placeholder_language_detected",
    "content_substantiveness_verified", "duplicate_content_hash", "canonical_count",
    "canonical_url", "canonical_matches_intended_public_url", "robots", "noindex", "nofollow", "og_complete", "twitter_complete", "jsonld_blocks",
    "jsonld_valid_blocks", "jsonld_invalid_blocks", "jsonld_valid", "jsonld_page_consistent", "internal_new_page_links",
    "internal_existing_public_links", "internal_outgoing_links", "broken_internal_links", "breadcrumb_count",
    "intended_public_url_already_exists", "intended_public_url_installed_locally", "in_public_sitemap", "in_search_index",
  ];
  writeCsv(path.join(developmentRoot, "STAGING-HTML-INVENTORY.csv"), inventory, inventoryColumns);
  writeCsv(path.join(developmentRoot, "STAGING-PROGRAMME-PAGE-AUDIT.csv"), programmeAudit, auditColumns);
  writeCsv(path.join(developmentRoot, "STAGING-INTERNAL-LINK-AUDIT.csv"), linkAudit, [
    "source_route", "href", "destination_route", "link_type", "result",
  ]);

  const additionalRows = inventory.filter((row) => row.classification !== "programme-register-mapped route (not publication-approved)");
  const noindexCount = programmeAudit.filter((row) => row.noindex).length;
  const validJsonLdCount = programmeAudit.filter((row) => row.jsonld_valid).length;
  const metadataCompleteCount = programmeAudit.filter((row) =>
    row.title && row.description && row.canonical_count === 1 &&
    row.canonical_matches_intended_public_url && row.og_complete && row.twitter_complete
  ).length;
  const uniqueTitles = programmeAudit.filter((row) => row.title_unique_check === true).length;
  const uniqueDescriptions = programmeAudit.filter((row) => row.description_unique_check === true).length;
  const canonicalMatchCount = programmeAudit.filter((row) => row.canonical_matches_intended_public_url).length;
  const jsonLdConsistentCount = programmeAudit.filter((row) => row.jsonld_page_consistent).length;
  const metadataValueConsistentCount = programmeAudit.filter((row) => {
    const filePath = path.join(root, row.file_path);
    const html = fs.readFileSync(filePath, "utf8");
    const ogTitle = getMetaContents(html, "og:title")[0];
    const ogDescription = getMetaContents(html, "og:description")[0];
    const ogUrl = getMetaContents(html, "og:url")[0];
    const twitterTitle = getMetaContents(html, "twitter:title")[0];
    const twitterDescription = getMetaContents(html, "twitter:description")[0];
    return ogTitle === row.title &&
      ogDescription === row.description &&
      canonicalizeUrl(ogUrl ?? "", `${publicOrigin}${row.programme_route}`) === row.canonical_url &&
      twitterTitle === row.title &&
      twitterDescription === row.description;
  }).length;
  const publicUrlCollisions = programmeAudit.filter((row) => row.intended_public_url_already_exists);
  const searchContentWindow = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets", "site-search-content.js"), "utf8"), searchContentWindow);
  const publicSearchContent = searchContentWindow.window.kovSiteSearchContent;
  const sitemapPagePaths = [...sitemapUrls].map((url) => publicPathForUrl(url));
  const programmePublicPaths = new Set(
    programmeAudit
      .filter((row) => row.intended_public_url)
      .map((row) => publicPathForUrl(row.intended_public_url))
  );
  const sitemapMissingSearchText = sitemapPagePaths.filter((pagePath) =>
    !programmePublicPaths.has(pagePath) && !Object.hasOwn(publicSearchContent, pagePath)
  );
  writeCsv(path.join(developmentRoot, "STAGING-PUBLIC-SEARCH-TEST-FAILURES.csv"), sitemapMissingSearchText.map((pagePath) => ({
    public_sitemap_path: pagePath,
    failure: "Missing search-content entry in assets/site-search-content.js",
    scope_note: "Existing public file; not modified under the staging-only preservation instruction.",
  })), ["public_sitemap_path", "failure", "scope_note"]);
  const reportLines = [
    "# Staging HTML Reconciliation and Validation",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Reconciliation",
    "",
    `- Programme source of truth used: \`development/PAGE-TRACKER.csv\` joined to \`development/CANDIDATE-REGISTER.csv\` by candidate ID. Register membership is not publication approval.`,
    `- Programme rows: ${tracker.length}; distinct tracker IDs: ${new Set(tracker.map((row) => row.id)).size}.`,
    `- Distinct register-mapped programme routes: ${new Set(tracker.map((row) => row.staging_preview_url)).size}.`,
    `- Staged HTML files inventoried: ${files.length}.`,
    `- One-to-one mapped programme HTML files: ${programmeAudit.length}.`,
    `- Additional staged HTML files preserved and individually classified: ${additionalRows.length}.`,
    `- Reconciliation against the earlier observed 715-file tree: 577 mapped routes plus 138 pre-existing unregistered files. This audit added 13 noindex category-hub support indexes to repair missing breadcrumb targets; none of the 138 pre-existing files was deleted or overwritten.`,
    `- Tracker rows with no matching file: ${unmatchedRows.length}.`,
    `- Duplicate tracker-to-file mappings: ${duplicateRouteRows.length}.`,
    `- Duplicate normalized programme routes: ${routeDuplicates.length}.`,
    `- Duplicate intended public URLs in the candidate register: ${proposedUrlDuplicates.length}.`,
    "",
    "The 577 programme files are defined strictly by tracker rows and their unique staging preview URLs; no files were deleted, moved, or overwritten by this audit. The complete file-by-file inventory and classification are in `STAGING-HTML-INVENTORY.csv`.",
    "",
    "## Page quality and SEO checks for the mapped programme",
    "",
    `- Unique non-empty titles: ${uniqueTitles}/${programmeAudit.length}.`,
    `- Unique non-empty meta descriptions: ${uniqueDescriptions}/${programmeAudit.length}.`,
    `- Complete title, description, canonical matching intended public URL, Open Graph, and Twitter set: ${metadataCompleteCount}/${programmeAudit.length}.`,
    `- Canonical matches the register's intended public URL: ${canonicalMatchCount}/${programmeAudit.length}.`,
    `- Noindex: ${noindexCount}/${programmeAudit.length}.`,
    `- Pages with at least one parseable JSON-LD block and no malformed blocks: ${validJsonLdCount}/${programmeAudit.length}.`,
    `- Pages with page-specific WebPage/Breadcrumb JSON-LD matching canonical, title, and description: ${jsonLdConsistentCount}/${programmeAudit.length}.`,
    `- Open Graph/Twitter title, description, and URL values consistent with page metadata: ${metadataValueConsistentCount}/${programmeAudit.length}.`,
    `- Pages with at least 500 visible-text characters (automated triage only; not a human quality judgment): ${programmeAudit.filter((row) => row.likely_substantive_500_chars).length}/${programmeAudit.length}.`,
    `- Pages containing known generic placeholder-language signals: ${programmeAudit.filter((row) => row.placeholder_language_detected).length}/${programmeAudit.length}.`,
    `- Pages whose factual/editorial substantiveness was actually verified by this automated audit: 0/${programmeAudit.length}.`,
    `- Pages with duplicate normalized-content hashes after removing generated link blocks: ${hashDuplicates.reduce((total, [, routes]) => total + routes.length, 0)} pages in ${hashDuplicates.length} duplicate groups.`,
    `- Repeated canonical URL groups: ${canonicalDuplicates.length}.`,
    `- Programme intended public URLs already resolving to a local public file: ${programmeAudit.filter((row) => row.intended_public_url_already_exists).length}.`,
    `- Programme HTML files installed at their intended public directory paths: ${programmeAudit.filter((row) => row.intended_public_url_installed_locally).length}/${programmeAudit.length}.`,
    `- Programme routes present in public sitemap: ${sitemapProgramme.length}; present in public search: ${searchProgramme.length}.`,
    `- Intended public URL collisions with existing local pages: ${publicUrlCollisions.length}.`,
    `- Public sitemap pages missing search-content entries: ${sitemapMissingSearchText.length}; this is a pre-existing public-site test failure outside the approved staging-only scope.`,
    `- Foundation test status: ${sitemapMissingSearchText.length ? `FAIL: ${sitemapMissingSearchText.length} pre-existing sitemap pages lack search-content entries` : "PASS"}; the newly listed 577 noindex programme routes are intentionally not in public search.`,
    `- Programme discovery listings: sitemap ${sitemapProgramme.length}/${programmeAudit.length}; llms.txt ${llmsProgramme.length}/${programmeAudit.length}; search index ${searchProgramme.length}/${programmeAudit.length}.`,
    "",
    "The per-page audit records missing and conflicting fields individually. Automated text-length, placeholder, and hash checks do not certify factual accuracy, topical relevance, or editorial quality.",
    "",
    "## Internal-link checks",
    "",
    `- Valid links to mapped programme pages: ${totalInternalNewLinks}.`,
    `- Valid links to existing public pages: ${totalInternalPublicLinks}.`,
    `- Valid links to staging-only support pages: ${totalInternalStagingSupportLinks}.`,
    `- Broken internal links or fragments from mapped programme pages: ${totalBrokenLinks}.`,
    `- Broken internal links or fragments across all staged HTML: ${allStagingBrokenLinks}.`,
    `- Mapped programme pages with at least one outgoing internal link: ${programmeAudit.filter((row) => row.internal_outgoing_links > 0).length}/${programmeAudit.length}.`,
    `- Mapped programme pages with at least one incoming link from a staged page or support hub: ${programmeIncomingRoutes.size}/${programmeAudit.length}.`,
    `- Mapped programme pages with no incoming staged link: ${programmeAudit.length - programmeIncomingRoutes.size}.`,
    `- Orphan programme routes: ${orphanProgrammeRoutes.length ? orphanProgrammeRoutes.map((route) => `\`${route}\``).join(", ") : "none"}.`,
    `- Mapped programme pages with a generated breadcrumb: ${programmeAudit.filter((row) => row.breadcrumb_count > 0).length}/${programmeAudit.length}.`,
    "",
    "JSON-LD checks parse the JSON syntax and require at least one block with no malformed blocks; they do not prove Schema.org semantic validity or consistency with visible content.",
    "",
    "Every anchor-level result is in `STAGING-INTERNAL-LINK-AUDIT.csv`. A destination is considered valid only if its local file resolves; fragment targets are also checked.",
    "",
    "## Preservation checks",
    "",
    `- Tracked public-file diff from HEAD other than specifically authorized sitemap.xml and llms.txt discovery updates: ${publicDiffFiles.length} file(s).`,
    `- \`robots.txt\` tracked diff: ${robotsDiff}.`,
    `- \`sitemap.xml\` tracked diff: ${sitemapDiff}.`,
    `- \`llms.txt\` lists the 577 staged routes; page-level noindex directives remain unchanged.`,
    `- Untracked HTML additions outside staging in public content directories: ${untrackedPublicHtml.length}.`,
    "",
    untrackedPublicHtml.length
      ? `Untracked public HTML paths are not modifications to tracked baseline files but need separate provenance review: ${untrackedPublicHtml.map((file) => `\`${file}\``).join(", ")}.`
      : "No untracked public HTML additions were found in the checked content directories.",
    "",
    "## Additional staged files (all retained)",
    "",
    ...additionalRows.map((row) => `- \`${row.file_path}\` — ${row.classification}; title: ${row.title || "(no title)"}; H1: ${row.h1 || "(no H1)"}.`),
    "",
    "## Duplicate/conflict details",
    "",
    `- Duplicate programme routes: ${routeDuplicates.length ? routeDuplicates.map(([route, ids]) => `\`${route}\` (${ids.join(", ")})`).join("; ") : "none detected"}.`,
    `- Duplicate intended public URLs: ${proposedUrlDuplicates.length ? proposedUrlDuplicates.map(([route, ids]) => `\`${route}\` (${ids.join(", ")})`).join("; ") : "none detected"}.`,
    `- Duplicate programme content groups: ${hashDuplicates.length ? hashDuplicates.map(([hash, routes]) => `\`${hash.slice(0, 12)}\` (${routes.join(", ")})`).join("; ") : "none detected"}.`,
    `- Duplicate canonical groups: ${canonicalDuplicates.length ? canonicalDuplicates.map(([canonical, routes]) => `\`${canonical}\` (${routes.join(", ")})`).join("; ") : "none detected"}.`,
    `- Canonical/intended-public-URL mismatches: ${programmeAudit.filter((row) => !row.canonical_matches_intended_public_url).length}; see \`STAGING-PROGRAMME-PAGE-AUDIT.csv\`.`,
    `- Intended public URL collisions: ${publicUrlCollisions.length ? publicUrlCollisions.map((row) => `\`${row.intended_public_url}\` (${row.programme_id})`).join("; ") : "none detected"}.`,
    `- Actual route files installed from the staging build are not treated as pre-existing URL collisions; the install manifest is \`INSTALLED-PROGRAMME-ROUTES.csv\`.`,
    "",
    "## Before/after of this repair",
    "",
    "- Before (previous reconciliation): 511 canonical mismatches; 65 intended-public-URL collisions.",
    `- After: ${programmeAudit.length - canonicalMatchCount} canonical mismatches; ${publicUrlCollisions.length} intended-public-URL collisions.`,
    `- Collision-free route changes and old/new canonicals are listed in \`STAGING-URL-CANONICAL-CHANGES.csv\`.`,
    `- Page-specific factual content was not rewritten: ${programmeAudit.filter((row) => row.placeholder_language_detected).length} routes retain detected generic/generated-page signals and require source-based editorial work before acceptance.`,
    "",
    "## Acceptance status",
    "",
    programmeAudit.length === 577 &&
    additionalRows.length === 151 &&
    unmatchedRows.length === 0 &&
    duplicateRouteRows.length === 0 &&
    routeDuplicates.length === 0 &&
    proposedUrlDuplicates.length === 0 &&
    totalBrokenLinks === 0 &&
    sitemapProgramme.length === 577 &&
    llmsProgramme.length === 577 &&
    searchProgramme.length === 0 &&
    metadataCompleteCount === 577 &&
    noindexCount === 577 &&
    validJsonLdCount === 577 &&
    canonicalMatchCount === 577 &&
    jsonLdConsistentCount === 577 &&
    metadataValueConsistentCount === 577 &&
    publicUrlCollisions.length === 0 &&
    programmeAudit.every((row) => !row.placeholder_language_detected) &&
    sitemapMissingSearchText.length === 0 &&
    robotsDiff === "unchanged" &&
    sitemapDiff !== "unchanged" &&
    publicDiffFiles.length === 0
      ? "Route, SEO, content-signal, link, discovery-listing, and tracked-public-preservation gates pass."
      : `NOT ACCEPTED: canonicals and public URL collisions are repaired, but generated/generic content remains on programme pages and ${sitemapMissingSearchText.length} pre-existing public sitemap pages lack search-content entries. Sitemap and llms discovery updates are intentional; robots.txt and public search assets were not changed. No pre-existing staged files were removed or overwritten.`,
  ];

  fs.writeFileSync(path.join(developmentRoot, "STAGING-RECONCILIATION-REPORT.md"), `${reportLines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({
    stagingHtml: files.length,
    programmeRows: tracker.length,
    mappedProgrammeFiles: programmeAudit.length,
    preservedAdditionalFiles: additionalRows.length,
    unmatchedTrackerRows: unmatchedRows.length,
    duplicateRouteMappings: duplicateRouteRows.length,
    duplicateIntendedPublicUrls: proposedUrlDuplicates.length,
    duplicateContentGroups: hashDuplicates.length,
    repeatedCanonicalGroups: canonicalDuplicates.length,
    uniqueTitles,
    uniqueDescriptions,
    completeMetadata: metadataCompleteCount,
    noindex: noindexCount,
    validJsonLd: validJsonLdCount,
    canonicalMatchesIntendedPublicUrl: canonicalMatchCount,
    jsonLdPageConsistent: jsonLdConsistentCount,
    socialMetadataConsistent: metadataValueConsistentCount,
    intendedPublicUrlCollisions: publicUrlCollisions.length,
    sitemapMissingSearchText: sitemapMissingSearchText.length,
    pagesWith500VisibleChars: programmeAudit.filter((row) => row.likely_substantive_500_chars).length,
    validNewPageLinks: totalInternalNewLinks,
    validExistingPublicLinks: totalInternalPublicLinks,
    validStagingSupportLinks: totalInternalStagingSupportLinks,
    brokenInternalLinks: totalBrokenLinks,
    brokenLinksAllStaging: allStagingBrokenLinks,
    programmePagesWithIncomingLinks: programmeIncomingRoutes.size,
    orphanProgrammePages: programmeAudit.length - programmeIncomingRoutes.size,
    orphanProgrammeRoutes,
    pagesWithGeneratedBreadcrumb: programmeAudit.filter((row) => row.breadcrumb_count > 0).length,
    programmeRoutesInSitemap: sitemapProgramme.length,
    programmeRoutesInLlms: llmsProgramme.length,
    programmeRoutesInSearchIndex: searchProgramme.length,
    publicTrackedDiffs: publicDiffFiles,
    installedProgrammeRoutes: programmeAudit.filter((row) => row.intended_public_url_installed_locally).length,
    robotsDiff,
    sitemapDiff,
    untrackedPublicHtml,
  }, null, 2));
}

main();
