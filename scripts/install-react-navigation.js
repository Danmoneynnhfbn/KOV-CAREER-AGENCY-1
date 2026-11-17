const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const scriptTag = '<script defer src="/assets/kov-site-header.bundle.js?v=1" data-kov-react-navigation></script>';
const excludedDirectories = new Set([
  ".git",
  ".private_admin",
  "_design-reference",
  "design-reference",
  "development",
  "node_modules",
  "tests",
]);

function walkHtml(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtml(entryPath, results);
    else if (entry.isFile() && /\.html?$/i.test(entry.name)) results.push(entryPath);
  }
  return results;
}

function main() {
  const bundlePath = path.join(root, "assets", "kov-site-header.bundle.js");
  if (!fs.existsSync(bundlePath)) throw new Error("Missing React navigation bundle; run npm run build:react first.");

  const files = walkHtml(root);
  let pagesUpdated = 0;
  let backendPagesSkipped = 0;
  for (const filePath of files) {
    const html = fs.readFileSync(filePath, "utf8");
    if (/<body\b[^>]*\bclass=["'][^"']*\bbackend-page\b/i.test(html)) {
      backendPagesSkipped += 1;
      continue;
    }
    if (/<script\b(?=[^>]*\bdata-kov-react-navigation\b)[^>]*>/i.test(html)) continue;
    const updated = html.replace(/<\/head\s*>/i, `  ${scriptTag}\n</head>`);
    if (updated === html) throw new Error(`React navigation script insertion failed for ${path.relative(root, filePath)}`);
    fs.writeFileSync(filePath, updated, "utf8");
    pagesUpdated += 1;
  }

  console.log(JSON.stringify({
    htmlRoutesScanned: files.length,
    pagesUpdated,
    backendPagesSkipped,
    reactBundle: "assets/kov-site-header.bundle.js",
  }, null, 2));
}

main();
