const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const stagingRoot = path.join(root, "staging");
const developmentRoot = path.join(root, "development");
const publicOrigin = "https://www.kovcareeragency.org";

const supportCopies = [
  {
    source: "staging/career-resources/index.html",
    destination: "career-resources/index.html",
    sourceRoute: "/staging/career-resources/",
    route: "/career-resources/",
    kind: "Career Resources Hub",
  },
  {
    source: "staging/research/index.html",
    destination: "research/index.html",
    sourceRoute: "/staging/research/",
    route: "/research/",
    kind: "Research Hub",
  },
  {
    source: "staging/professional-directory/index.html",
    destination: "professional-directory/index.html",
    sourceRoute: "/staging/professional-directory/",
    route: "/professional-directory/",
    kind: "Professional Profile Directory",
  },
  ...[
    "board-non-executive-career",
    "comparison-educational",
    "country-market-guides",
    "country-role-pages",
    "executive-career-guides",
    "industry-specific-career-guides",
    "interview-guides",
    "leadership-skills-competencies",
    "market-reports",
    "mobility",
    "salary-compensation-guides",
    "transition-guides",
  ].map((category) => ({
    source: `staging/career-resources/${category}/index.html`,
    destination: `career-resources/${category}/index.html`,
    sourceRoute: `/staging/career-resources/${category}/`,
    route: `/career-resources/${category}/`,
    kind: `${category} category index`,
  })),
];

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
  if (!headers?.length) throw new Error("Tracker CSV has no headers");
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function escapeCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.map(escapeCsv).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function filePathForUrl(url) {
  const pathname = new URL(url, publicOrigin).pathname;
  const relativePath = pathname.replace(/^\/+/, "");
  const destination = path.resolve(root, relativePath, "index.html");
  if (!destination.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Public route escapes repository root: ${url}`);
  }
  return destination;
}

function publicRouteForStagingRoute(route, routeMap, supportRouteMap) {
  const exact = routeMap.get(route);
  if (exact) return exact;
  const withoutTrailingSlash = route.replace(/\/$/, "");
  if (routeMap.has(withoutTrailingSlash)) return routeMap.get(withoutTrailingSlash);
  if (supportRouteMap.has(route)) return supportRouteMap.get(route);
  if (supportRouteMap.has(withoutTrailingSlash)) return supportRouteMap.get(withoutTrailingSlash);
  return null;
}

function lookupPublicRoute(stagingPath, routeMap, supportRouteMap) {
  const withSlash = stagingPath.endsWith("/") ? stagingPath : `${stagingPath}/`;
  const withoutSlash = withSlash.slice(0, -1);
  return routeMap.get(withSlash) ??
    routeMap.get(withoutSlash) ??
    supportRouteMap.get(withSlash) ??
    supportRouteMap.get(withoutSlash) ??
    null;
}

function rewriteProgrammeLinks(html, sourceStagingRoute, routeMap, supportRouteMap) {
  const baseUrl = `${publicOrigin}${sourceStagingRoute}`;
  return html.replace(
    /(<a\b[^>]*\bhref=["'])([^"']*)(["'][^>]*>)/gi,
    (tag, before, rawHref, after) => {
      const href = rawHref.replace(/&amp;/gi, "&");
      if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) return tag;
      let destination;
      try {
        destination = new URL(href, baseUrl);
      } catch {
        return tag;
      }
      if (destination.origin !== publicOrigin || !destination.pathname.startsWith("/staging/")) return tag;
      const publicRoute = lookupPublicRoute(destination.pathname, routeMap, supportRouteMap);
      if (!publicRoute) return tag;
      return `${before}${publicRoute}${destination.search}${destination.hash}${after}`;
    }
  );
}

function makeProgrammePageIndexable(html) {
  const updated = html.replace(
    /<meta\b(?=[^>]*\bname=["'](?:robots|googlebot)["'])[^>]*>/gi,
    (tag) => tag.replace(/\bcontent=["'][^"']*["']/i, 'content="index, follow"')
  );
  if (/<meta\b[^>]*\bname=["'](?:robots|googlebot)["'][^>]*\bnoindex\b/i.test(updated)) {
    throw new Error("Programme page still contains a noindex directive");
  }
  for (const name of ["robots", "googlebot"]) {
    if (!new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])`, "i").test(updated)) {
      throw new Error(`Programme page is missing its ${name} directive`);
    }
  }
  return updated;
}

function isUnpublishedProgrammePage(html) {
  return /research-stage draft|route was generated to satisfy the programme register|staged KOV research page kept unpublished/i.test(html);
}

function makeProgrammePageNoindex(html) {
  const updated = html.replace(
    /<meta\b(?=[^>]*\bname=["'](?:robots|googlebot)["'])[^>]*>/gi,
    (tag) => tag.replace(/\bcontent=["'][^"']*["']/i, 'content="noindex, nofollow"')
  );
  for (const name of ["robots", "googlebot"]) {
    const directive = updated.match(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i"))?.[0];
    if (!directive || !/\bnoindex\b/i.test(directive)) {
      throw new Error(`Unpublished programme page is missing its ${name} noindex directive`);
    }
  }
  return updated;
}

function createOccupationHub(programmeRoutes) {
  const links = programmeRoutes
    .filter((route) => route.publicUrl.startsWith("/career-resources/occupation-guides/"))
    .map((route) => {
      const source = fs.readFileSync(route.sourcePath, "utf8");
      const title = source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
        ?.replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() ?? route.id;
      return `      <li><a href="${route.publicUrl}">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a></li>`;
    });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="googlebot" content="noindex, nofollow">
  <title>Occupation and Role Guides | KOV Staging Index</title>
  <meta name="description" content="Unpublished, noindex directory of staged occupation and role guides.">
  <link rel="canonical" href="https://www.kovcareeragency.org/career-resources/occupation-guides/">
</head>
<body>
  <header><a href="/">KOV Career Agency</a> | <a href="/career-resources/">Career Resources</a></header>
  <main>
    <p><strong>Unpublished development index.</strong> The listed pages are noindex and are not included in the public sitemap or search index.</p>
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/career-resources/">Career Resources</a> / <span aria-current="page">Occupation and Role Guides</span></nav>
    <h1>Occupation and Role Guides</h1>
    <p>These 65 occupation and role routes are available in the website directory structure for development review. Each remains noindex and unpublished pending content validation and approval.</p>
    <ul>
${links.join("\n")}
    </ul>
  </main>
</body>
</html>
`;
}

function main() {
  const trackerPath = path.join(developmentRoot, "PAGE-TRACKER.csv");
  const tracker = parseCsv(fs.readFileSync(trackerPath, "utf8"));
  if (tracker.length !== 577) throw new Error(`Expected 577 programme rows, found ${tracker.length}`);

  const routeMap = new Map();
  const publicRoutes = new Set();
  const programmeRoutes = tracker.map((row) => {
    if (!row.id || !row.staging_preview_url || !row.proposed_url) {
      throw new Error(`Incomplete programme tracker row: ${row.id || "(missing id)"}`);
    }
    const sourcePath = path.join(stagingRoot, row.staging_preview_url.replace(/^\/staging\//, ""), "index.html");
    const destinationPath = filePathForUrl(`${publicOrigin}${row.proposed_url}`);
    if (!fs.existsSync(sourcePath)) throw new Error(`Staging source is missing for ${row.id}: ${sourcePath}`);
    if (publicRoutes.has(row.proposed_url)) throw new Error(`Duplicate public route: ${row.proposed_url}`);
    publicRoutes.add(row.proposed_url);
    const actualCanonical = fs.readFileSync(sourcePath, "utf8")
      .match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)?.[1];
    if (actualCanonical !== `${publicOrigin}${row.proposed_url}`) {
      throw new Error(`Canonical mismatch for ${row.id}: ${actualCanonical} != ${publicOrigin}${row.proposed_url}`);
    }
    routeMap.set(row.staging_preview_url, row.proposed_url);
    return {
      id: row.id,
      sourcePath,
      destinationPath,
      stagingRoute: row.staging_preview_url,
      publicUrl: row.proposed_url,
      kind: "programme page",
    };
  });

  const supportRouteMap = new Map([
    ["/staging/", "/"],
    ["/staging/career-resources/", "/career-resources/"],
    ["/staging/research/", "/research/"],
    ["/staging/professional-directory/", "/professional-directory/"],
    ["/staging/roles/", "/career-resources/occupation-guides/"],
  ]);
  for (const support of supportCopies) {
    const sourcePath = path.resolve(root, support.source);
    if (!fs.existsSync(sourcePath)) throw new Error(`Support source is missing: ${support.source}`);
    if (publicRoutes.has(support.route)) {
      throw new Error(`Support route conflicts with a programme route: ${support.route}`);
    }
    supportRouteMap.set(support.sourceRoute, support.route);
  }
  const occupationHubRoute = "/career-resources/occupation-guides/";
  if (publicRoutes.has(occupationHubRoute)) throw new Error(`Occupation hub conflicts with a programme route: ${occupationHubRoute}`);
  supportRouteMap.set("/staging/roles/", occupationHubRoute);

  const occupationHubPath = filePathForUrl(`${publicOrigin}${occupationHubRoute}`);
  const installTargets = [
    ...programmeRoutes,
    ...supportCopies.map((support) => ({
      sourcePath: path.resolve(root, support.source),
      destinationPath: path.resolve(root, support.destination),
      stagingRoute: `/staging/${support.route.slice(1)}`,
      publicUrl: support.route,
      kind: "support index",
    })),
    {
      sourcePath: "",
      destinationPath: occupationHubPath,
      stagingRoute: "/staging/roles/",
      publicUrl: occupationHubRoute,
      kind: "occupation hub index",
    },
  ];

  const duplicateDestinations = installTargets
    .map((target) => target.destinationPath.toLowerCase())
    .filter((destination, index, all) => all.indexOf(destination) !== index);
  if (duplicateDestinations.length) throw new Error(`Duplicate install destinations: ${duplicateDestinations.join(", ")}`);

  const manifestPath = path.join(developmentRoot, "INSTALLED-PROGRAMME-ROUTES.csv");
  const previouslyInstalledPaths = fs.existsSync(manifestPath)
    ? new Set(parseCsv(fs.readFileSync(manifestPath, "utf8")).map((row) => row.file_path))
    : new Set();
  const existingTargets = installTargets.filter((target) => {
    const relativePath = path.relative(root, target.destinationPath).split(path.sep).join("/");
    return fs.existsSync(target.destinationPath) && !previouslyInstalledPaths.has(relativePath);
  });
  const existingGeneratedTargets = installTargets.filter((target) => {
    const relativePath = path.relative(root, target.destinationPath).split(path.sep).join("/");
    return fs.existsSync(target.destinationPath) && previouslyInstalledPaths.has(relativePath);
  });
  if (existingTargets.length) {
    throw new Error(`Refusing to overwrite existing files: ${existingTargets.map((target) => path.relative(root, target.destinationPath)).join(", ")}`);
  }

  const preparedFiles = [];
  let indexableProgrammePages = 0;
  let noindexPlaceholderPages = 0;
  for (const route of programmeRoutes) {
    const source = fs.readFileSync(route.sourcePath, "utf8");
    const hasUnpublishedPlaceholder = isUnpublishedProgrammePage(source);
    const linked = rewriteProgrammeLinks(source, route.stagingRoute, routeMap, supportRouteMap);
    const rewritten = hasUnpublishedPlaceholder
      ? makeProgrammePageNoindex(linked)
      : makeProgrammePageIndexable(linked);
    if (!hasUnpublishedPlaceholder && /name=["'](?:robots|googlebot)["']\s+content=["'][^"']*noindex/i.test(rewritten)) {
      throw new Error(`Refusing to install noindex programme page: ${route.id}`);
    }
    if (hasUnpublishedPlaceholder) noindexPlaceholderPages += 1;
    else indexableProgrammePages += 1;
    const remainingMappedStageLinks = [...rewritten.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
      .map((match) => match[1])
      .filter((href) => {
        try {
          const parsed = new URL(href, `${publicOrigin}${route.publicUrl}`);
          return lookupPublicRoute(parsed.pathname, routeMap, supportRouteMap) !== null;
        } catch {
          return false;
        }
      });
    if (remainingMappedStageLinks.length) {
      throw new Error(`Unrewritten programme links remain in ${route.id}: ${remainingMappedStageLinks.join(", ")}`);
    }
    preparedFiles.push({
      destinationPath: route.destinationPath,
      content: rewritten,
      programme_id: route.id,
      file_path: path.relative(root, route.destinationPath).split(path.sep).join("/"),
      intended_url: route.publicUrl,
      source_staging_url: route.stagingRoute,
      kind: route.kind,
      indexable: !hasUnpublishedPlaceholder,
    });
  }

  for (const support of supportCopies) {
    const source = fs.readFileSync(path.resolve(root, support.source), "utf8");
    const rewritten = rewriteProgrammeLinks(source, support.sourceRoute, routeMap, supportRouteMap);
    if (!/name=["']robots["']\s+content=["'][^"']*noindex/i.test(rewritten)) {
      throw new Error(`Refusing to install indexable support page: ${support.source}`);
    }
    const destinationPath = path.resolve(root, support.destination);
    preparedFiles.push({
      destinationPath,
      content: rewritten,
      programme_id: "",
      file_path: path.relative(root, destinationPath).split(path.sep).join("/"),
      intended_url: support.route,
      source_staging_url: support.sourceRoute,
      kind: support.kind,
    });
  }

  const occupationHubHtml = createOccupationHub(programmeRoutes);
  if (!occupationHubHtml.includes('name="robots" content="noindex, nofollow"')) {
    throw new Error("Occupation guide hub must remain noindex");
  }
  preparedFiles.push({
    destinationPath: occupationHubPath,
    content: occupationHubHtml,
    programme_id: "",
    file_path: path.relative(root, occupationHubPath).split(path.sep).join("/"),
    intended_url: occupationHubRoute,
    source_staging_url: "/staging/roles/",
    kind: "occupation guides support index",
  });

  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({
      dryRun: true,
      programmeHtmlPagesReady: programmeRoutes.length,
      supportAndHubIndexesReady: preparedFiles.length - programmeRoutes.length,
      totalNewRouteFiles: preparedFiles.length,
      newTargets: preparedFiles.length - existingGeneratedTargets.length,
      previouslyGeneratedTargetsToRefresh: existingGeneratedTargets.length,
      programmeRoutesUnique: publicRoutes.size === programmeRoutes.length,
      allTargetsDistinct: duplicateDestinations.length === 0,
      indexableProgrammePages,
      noindexPlaceholderPages,
    }, null, 2));
    return;
  }

  for (const prepared of preparedFiles) {
    fs.mkdirSync(path.dirname(prepared.destinationPath), { recursive: true });
    fs.writeFileSync(prepared.destinationPath, prepared.content, "utf8");
  }

  const copied = preparedFiles.map(({ content, destinationPath, ...manifestRow }) => manifestRow);
  writeCsv(path.join(developmentRoot, "INSTALLED-PROGRAMME-ROUTES.csv"), copied, [
    "programme_id", "file_path", "intended_url", "source_staging_url", "kind",
  ]);
  console.log(JSON.stringify({
    programmeHtmlPagesInstalled: programmeRoutes.length,
    supportAndHubIndexesInstalled: copied.length - programmeRoutes.length,
    totalNewRouteFiles: copied.length,
    previouslyGeneratedRouteFilesRefreshed: existingGeneratedTargets.length,
    indexableProgrammePages,
    noindexPlaceholderPages,
    sitemapOrSearchFilesChanged: false,
    originalStagingSourcesPreserved: true,
    manifest: path.join(developmentRoot, "INSTALLED-PROGRAMME-ROUTES.csv"),
  }, null, 2));
}

main();
