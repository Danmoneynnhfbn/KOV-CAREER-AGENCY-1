const fs = require("node:fs");
const path = require("node:path");
const {
  RESPONSIVE_IMAGE_VARIANTS,
  addResponsivePictureSources,
} = require("./lib/visual-preservation");

const root = path.resolve(__dirname, "..");
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
  for (const variants of RESPONSIVE_IMAGE_VARIANTS.values()) {
    for (const assetPath of Object.values(variants)) {
      const filePath = path.join(root, assetPath.slice(1));
      if (!fs.existsSync(filePath)) throw new Error(`Missing responsive image asset: ${assetPath}`);
    }
  }

  const files = walkHtml(root);
  let pagesUpdated = 0;
  let picturesAdded = 0;
  for (const filePath of files) {
    const html = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(root, filePath).split(path.sep).join("/");
    const { markup, added } = addResponsivePictureSources(html, relativePath);
    if (!added) continue;
    fs.writeFileSync(filePath, markup, "utf8");
    pagesUpdated += 1;
    picturesAdded += added;
  }

  console.log(JSON.stringify({
    htmlRoutesScanned: files.length,
    pagesUpdated,
    responsivePicturesAdded: picturesAdded,
    originalJpegFallbacksPreserved: true,
  }, null, 2));
}

main();
