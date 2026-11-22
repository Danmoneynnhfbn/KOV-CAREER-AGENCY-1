const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const stagingRoot = path.join(root, "staging");
const hubDefinitions = [
  {
    directory: "career-resources/board-non-executive-career",
    label: "Board and Non-Executive Career",
    description: "Staging index of board and non-executive career resources in the KOV development programme.",
  },
  {
    directory: "career-resources/comparison-educational",
    label: "Career and Market Comparisons",
    description: "Staging index of comparison and educational resources in the KOV development programme.",
  },
  {
    directory: "career-resources/country-market-guides",
    label: "Country Market Guides",
    description: "Staging index of country-specific career-market research guides in the KOV development programme.",
  },
  {
    directory: "career-resources/country-role-pages",
    label: "Country-Specific Role Guides",
    description: "Staging index of country-specific role resources in the KOV development programme.",
  },
  {
    directory: "career-resources/executive-career-guides",
    label: "Executive Career Guides",
    description: "Staging index of executive career planning guides in the KOV development programme.",
  },
  {
    directory: "career-resources/industry-specific-career-guides",
    label: "Industry-Specific Career Guides",
    description: "Staging index of industry-specific career resources in the KOV development programme.",
  },
  {
    directory: "career-resources/interview-guides",
    label: "Interview Guides",
    description: "Staging index of role-specific interview resources in the KOV development programme.",
  },
  {
    directory: "career-resources/leadership-skills-competencies",
    label: "Leadership Skills and Competencies",
    description: "Staging index of leadership competency resources in the KOV development programme.",
  },
  {
    directory: "career-resources/market-reports",
    label: "Executive Market Reports",
    description: "Staging index of executive market research resources in the KOV development programme.",
  },
  {
    directory: "career-resources/mobility",
    label: "International Career Mobility",
    description: "Staging index of international career mobility resources in the KOV development programme.",
  },
  {
    directory: "career-resources/salary-compensation-guides",
    label: "Salary and Compensation Guides",
    description: "Staging index of salary and compensation resources in the KOV development programme.",
  },
  {
    directory: "career-resources/transition-guides",
    label: "Career Transition Guides",
    description: "Staging index of career transition resources in the KOV development programme.",
  },
  {
    directory: "roles",
    label: "Occupation and Role Guides",
    description: "Staging index of occupation and role resources in the KOV development programme.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function walkHtml(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(entryPath);
    return entry.isFile() && /\.html?$/i.test(entry.name) ? [entryPath] : [];
  });
}

function routeForFile(filePath) {
  const relative = path.relative(stagingRoot, filePath).split(path.sep).join("/");
  return relative.endsWith("/index.html")
    ? `/directory/${relative.slice(0, -"index.html".length)}`
    : `/directory/${relative}`;
}

function titleForFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? path.basename(path.dirname(filePath)))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeHub(definition) {
  const directory = path.join(stagingRoot, definition.directory);
  const indexPath = path.join(directory, "index.html");
  if (fs.existsSync(indexPath)) {
    throw new Error(`Refusing to overwrite existing staging file: ${path.relative(root, indexPath)}`);
  }

  const childFiles = walkHtml(directory).sort((left, right) => left.localeCompare(right));
  const links = childFiles.map((filePath) =>
    `      <li><a href="${escapeHtml(routeForFile(filePath))}">${escapeHtml(titleForFile(filePath))}</a></li>`
  );
  const parentHub = definition.directory.startsWith("career-resources/")
    ? "/directory/career-resources/"
    : "/directory/";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="googlebot" content="noindex, nofollow">
  <title>${escapeHtml(definition.label)} | KOV Staging Index</title>
  <meta name="description" content="${escapeHtml(definition.description)}">
</head>
<body>
  <header><a href="/directory/">KOV staging home</a> | <a href="${parentHub}">Parent hub</a></header>
  <main>
    <p><strong>Unpublished staging support index.</strong> This directory supports navigation among staged resources and is not a programme page or publication approval.</p>
    <nav aria-label="Breadcrumb"><a href="/directory/">Staging</a> / <a href="${parentHub}">${definition.directory.startsWith("career-resources/") ? "Career resources" : "Roles"}</a> / <span aria-current="page">${escapeHtml(definition.label)}</span></nav>
    <h1>${escapeHtml(definition.label)}</h1>
    <p>${escapeHtml(definition.description)} The linked pages remain unpublished and noindex pending review.</p>
    <ul>
${links.join("\n")}
    </ul>
  </main>
  <footer><p>Staging only. No public sitemap or search-index inclusion.</p></footer>
</body>
</html>
`;
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(indexPath, html, "utf8");
  return { file: path.relative(root, indexPath).split(path.sep).join("/"), route: routeForFile(indexPath), links: links.length };
}

const created = hubDefinitions.map(makeHub);
console.log(JSON.stringify({ supportHubsCreated: created.length, created }, null, 2));
