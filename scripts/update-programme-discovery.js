const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const origin = "https://www.kovcareeragency.org";
const manifestPath = path.join(root, "development", "INSTALLED-PROGRAMME-ROUTES.csv");
const sitemapPath = path.join(root, "sitemap.xml");
const robotsPath = path.join(root, "robots.txt");
const llmsPath = path.join(root, "llms.txt");
const searchContentPath = path.join(root, "assets", "site-search-content.js");
const searchIndexPath = path.join(root, "assets", "site-search-index.js");
const sectionStart = "<!-- BEGIN STAGED PROGRAMME ROUTES -->";
const sectionEnd = "<!-- END STAGED PROGRAMME ROUTES -->";

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
  if (!headers?.length) throw new Error("Installed-route manifest has no headers");
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function getLineEnding(text) {
  return text.match(/\r\n|\n|\r/)?.[0] ?? "\n";
}

function plainText(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeading(html, fallback) {
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (!heading) throw new Error(`Programme page has no H1: ${fallback}`);
  return plainText(heading);
}

function isStagedPlaceholder(html) {
  const description = getMetaContent(html, "description");
  return /staged KOV research page kept unpublished, noindex and excluded from public search and sitemap/i.test(description)
    && /Research-stage draft[\s\S]*?unpublished and excluded from public search and sitemap/i.test(html);
}

function getMetaContent(html, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((candidate) => new RegExp(`\\bname=["']${name}["']`, "i").test(candidate));
  return tag?.match(/\bcontent=(["'])(.*?)\1/i)?.[2] ?? "";
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function extractSearchContent(html) {
  const description = getMetaContent(html, "description");
  const visible = html
    .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/gi, " $1 ")
    .replace(/<input\b[^>]*\bplaceholder=["']([^"']*)["'][^>]*>/gi, " $1 ")
    .replace(/<[^>]*>/g, " ");
  return `${description} ${decodeHtmlEntities(visible).replace(/\s+/g, " ").trim()}`.trim();
}

function readAssignedJson(filePath, variableName) {
  const source = fs.readFileSync(filePath, "utf8");
  const assignment = source.indexOf("=");
  const terminator = source.lastIndexOf(";");
  if (!source.startsWith(`window.${variableName}`) || assignment < 0 || terminator < assignment) {
    throw new Error(`Unexpected generated search asset format: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(source.slice(assignment + 1, terminator).trim());
}

function writeSearchAssets(routes) {
  const content = readAssignedJson(searchContentPath, "kovSiteSearchContent");
  const catalog = readAssignedJson(searchIndexPath, "kovSeoPageCatalog");

  for (const route of routes) {
    const html = fs.readFileSync(route.filePath, "utf8");
    const pagePath = path.relative(root, route.filePath).replace(/\\/g, "/");
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    if (!title) throw new Error(`Programme page has no title: ${route.route}`);
    const summary = getMetaContent(html, "description");
    content[pagePath] = extractSearchContent(html);
    const existing = catalog.findIndex((page) => page.href === pagePath);
    const entry = {
      href: pagePath,
      title: plainText(title),
      summary,
      terms: `${plainText(title)} ${summary} Career resources`,
      category: "career-resources",
    };
    if (existing < 0) catalog.push(entry);
    else catalog[existing] = entry;
  }

  fs.writeFileSync(
    searchContentPath,
    `window.kovSiteSearchContent = ${JSON.stringify(content)};\n`,
    "utf8"
  );
  fs.writeFileSync(
    searchIndexPath,
    `window.kovSeoPageCatalog = ${JSON.stringify(catalog)};\n`,
    "utf8"
  );
  return routes.length;
}

function removeSearchRoutes(routes) {
  const content = readAssignedJson(searchContentPath, "kovSiteSearchContent");
  const catalog = readAssignedJson(searchIndexPath, "kovSeoPageCatalog");
  const excludedPaths = new Set(routes.map((route) => path.relative(root, route.filePath).replace(/\\/g, "/")));
  let removed = 0;

  for (const pagePath of excludedPaths) {
    if (Object.hasOwn(content, pagePath)) {
      delete content[pagePath];
      removed += 1;
    }
  }
  const filteredCatalog = catalog.filter((page) => !excludedPaths.has(page.href));
  removed += catalog.length - filteredCatalog.length;

  fs.writeFileSync(searchContentPath, `window.kovSiteSearchContent = ${JSON.stringify(content)};\n`, "utf8");
  fs.writeFileSync(searchIndexPath, `window.kovSeoPageCatalog = ${JSON.stringify(filteredCatalog)};\n`, "utf8");
  return removed;
}

function getProgrammeRoutes() {
  const manifest = parseCsv(fs.readFileSync(manifestPath, "utf8"))
    .filter((row) => row.kind === "programme page");
  if (manifest.length !== 577) {
    throw new Error(`Expected 577 programme routes; found ${manifest.length}`);
  }

  const routes = manifest.map((row) => {
    const filePath = path.resolve(root, row.file_path);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Manifest file path escapes repository: ${row.file_path}`);
    }
    if (!fs.existsSync(filePath)) throw new Error(`Programme page is missing: ${row.file_path}`);

    const html = fs.readFileSync(filePath, "utf8");
    const expectedUrl = `${origin}${row.intended_url}`;
    if (!html.includes(`rel="canonical" href="${expectedUrl}"`)) {
      throw new Error(`Canonical URL does not match manifest for ${row.intended_url}`);
    }
    const stagedPlaceholder = isStagedPlaceholder(html);
    const noindex = /<meta\b[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html);
    if (stagedPlaceholder && !noindex) throw new Error(`Staged placeholder must remain noindex: ${row.intended_url}`);
    return {
      url: expectedUrl,
      route: row.intended_url,
      title: extractHeading(html, row.intended_url),
      filePath,
      stagedPlaceholder,
      indexable: !noindex,
    };
  });

  const urls = new Set(routes.map((route) => route.url));
  if (urls.size !== 577) throw new Error(`Expected unique programme URLs; found ${urls.size}`);
  return routes;
}

function addToSitemap(routes) {
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const listedUrls = new Set(
    [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => match[1].trim())
  );
  const existingCount = routes.filter((route) => listedUrls.has(route.url)).length;
  if (existingCount !== 0 && existingCount !== routes.length) {
    throw new Error(`Sitemap contains only ${existingCount} of the 577 programme routes`);
  }
  if (existingCount === routes.length) return 0;

  const lineEnding = getLineEnding(sitemap);
  const entries = routes.map((route) =>
    `  <url><loc>${route.url}</loc></url>`
  ).join(lineEnding);
  if (!/<\/urlset>\s*$/i.test(sitemap)) throw new Error("Sitemap has no closing urlset element");
  sitemap = sitemap.replace(/<\/urlset>\s*$/i, `${entries}${lineEnding}</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  return routes.length;
}

function removeExcludedRoutesFromSitemap(routes) {
  if (routes.length === 0) return 0;
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const excludedUrls = new Set(routes.map((route) => route.url));
  let removed = 0;
  sitemap = sitemap.replace(/^[\t ]*<url\b[\s\S]*?<\/url>[\t ]*(?:\r?\n)?/gim, (entry) => {
    const location = entry.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    if (!excludedUrls.has(location)) return entry;
    removed += 1;
    return "";
  });
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  return removed;
}

function updateLlms(routes) {
  let llms = fs.readFileSync(llmsPath, "utf8");
  const lineEnding = getLineEnding(llms);
  const start = llms.indexOf(sectionStart);
  const end = llms.indexOf(sectionEnd);
  if (routes.length === 0) {
    if (start < 0 && end < 0) return 0;
    if (start < 0 || end < start) throw new Error("llms.txt has an incomplete staged-routes section");
    const afterEnd = end + sectionEnd.length;
    llms = `${llms.slice(0, start).trimEnd()}${lineEnding}${llms.slice(afterEnd).trimStart()}`;
    fs.writeFileSync(llmsPath, llms, "utf8");
    return 0;
  }
  const section = [
    sectionStart,
    "",
    "## Career Resource Pages",
    "",
    `These ${routes.length} substantive career-resource pages are available at their public URLs and are eligible for search indexing.`,
    "",
    ...routes.map((route) => `- [${route.title}](${route.url})`),
    "",
    sectionEnd,
  ].join(lineEnding);
  if (start >= 0 || end >= 0) {
    if (start < 0 || end < start) throw new Error("llms.txt has an incomplete staged-routes section");
    const afterEnd = end + sectionEnd.length;
    llms = `${llms.slice(0, start)}${section}${llms.slice(afterEnd)}`;
  } else {
    llms = `${llms.trimEnd()}${lineEnding}${lineEnding}${section}${lineEnding}`;
  }
  fs.writeFileSync(llmsPath, llms, "utf8");
  return routes.length;
}

function verifyRobots() {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!/^User-agent:\s*\*\s*[\r\n]+Allow:\s*\/\s*$/im.test(robots)) {
    throw new Error("robots.txt does not allow crawling all routes for the wildcard agent");
  }
  if (!/^Sitemap:\s*https:\/\/www\.kovcareeragency\.org\/sitemap\.xml\s*$/im.test(robots)) {
    throw new Error("robots.txt does not advertise the site sitemap");
  }
}

function main() {
  const allRoutes = getProgrammeRoutes();
  const routes = allRoutes.filter((route) => route.indexable && !route.stagedPlaceholder);
  const excludedRoutes = allRoutes.filter((route) => !route.indexable || route.stagedPlaceholder);
  const stagedRoutes = allRoutes.filter((route) => route.stagedPlaceholder);
  verifyRobots();
  const sitemapRoutesRemoved = removeExcludedRoutesFromSitemap(excludedRoutes);
  const sitemapRoutesAdded = addToSitemap(routes);
  const llmsRoutesListed = updateLlms(routes);
  const searchRoutesRemoved = removeSearchRoutes(excludedRoutes);
  const searchRoutesIndexed = writeSearchAssets(routes);
  console.log(JSON.stringify({
    programmeRoutes: allRoutes.length,
    stagedPlaceholderRoutes: stagedRoutes.length,
    substantiveRoutes: routes.length,
    sitemapRoutesRemoved,
    sitemapRoutesAdded,
    llmsRoutesListed,
    searchRoutesRemoved,
    searchRoutesIndexed,
    robotsAllowsAllRoutes: true,
    robotsSitemapReferencePresent: true,
    pageLevelIndexable: true,
  }, null, 2));
}

main();
