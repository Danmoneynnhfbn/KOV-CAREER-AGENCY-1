const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const excludedDirectories = new Set([".git", ".private_admin", "_design-reference", "node_modules"]);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(absolutePath);
    } else if (entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }
}

walk(root);

const duplicateShells = [];
const duplicateIds = [];
const detailRoutes = [];

for (const filePath of files) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = path.relative(root, filePath).replace(/\\/g, "/");
  const shellCounts = {
    header: (html.match(/<header\b/gi) || []).length,
    main: (html.match(/<main\b/gi) || []).length,
    footer: (html.match(/<footer\b/gi) || []).length,
  };
  if (shellCounts.header > 1 || shellCounts.main > 1 || shellCounts.footer > 1) {
    duplicateShells.push({ route, ...shellCounts });
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const seen = new Set();
  const repeatedIds = [];
  for (const id of ids) {
    if (seen.has(id) && !repeatedIds.includes(id)) repeatedIds.push(id);
    seen.add(id);
  }
  if (repeatedIds.length) duplicateIds.push({ route, ids: repeatedIds });

  const details = (html.match(/<details\b/gi) || []).length;
  if (details) detailRoutes.push({ route, details });
}

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const homepageSummary = {
  kovReferenceRoots: (homepage.match(/kov-reference-home-root/g) || []).length,
  legacyDetails: (homepage.match(/kov-reference-home__more/g) || []).length,
  runtimeDisclosureButtons: (homepage.match(/More career support, insights and answers/g) || []).length,
  homeHeaders: (homepage.match(/<header\b/gi) || []).length,
  homeMains: (homepage.match(/<main\b/gi) || []).length,
  homeFooters: (homepage.match(/<footer\b/gi) || []).length,
};

const report = {
  htmlFiles: files.length,
  duplicateShellRoutes: duplicateShells.length,
  duplicateShellExamples: duplicateShells.slice(0, 50),
  duplicateIdRoutes: duplicateIds.length,
  duplicateIdExamples: duplicateIds.slice(0, 50),
  routesContainingDetails: detailRoutes.length,
  detailExamples: detailRoutes.slice(0, 50),
  homepage: homepageSummary,
};

console.log(JSON.stringify(report, null, 2));
