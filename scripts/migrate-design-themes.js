const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "PAGE_MANIFEST.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const applyChanges = process.argv.includes("--apply");
const publicPage = (page) => !page.path.startsWith(".private_admin/");

function setAttribute(tag, name, value) {
  const attribute = new RegExp(`\\s${name}\\s*=\\s*(["']).*?\\1`, "i");
  if (attribute.test(tag)) {
    return tag.replace(attribute, ` ${name}="${value}"`);
  }
  return tag.replace(/>$/, ` ${name}="${value}">`);
}

function updatePage(source, theme) {
  let output = source;
  const bodyTag = /<body\b[^>]*>/i;
  const bodyMatch = output.match(bodyTag);
  if (!bodyMatch) throw new Error("Missing body element");
  output = output.replace(bodyTag, setAttribute(bodyMatch[0], "data-theme", theme));

  const styles = [
    '<link rel="stylesheet" href="/css/design-system.css">',
    `<link rel="stylesheet" href="/css/theme-${theme}.css">`,
  ];
  for (const style of styles) {
    const href = style.match(/href="([^"]+)"/)[1];
    if (!output.includes(href)) {
      if (!/<\/head\s*>/i.test(output)) throw new Error("Missing closing head element");
      output = output.replace(/<\/head\s*>/i, `${style}\n</head>`);
    }
  }

  const siteScript = '<script src="/js/site.js" defer></script>';
  if (!output.includes('src="/js/site.js"')) {
    if (/<\/body\s*>/i.test(output)) {
      output = output.replace(/<\/body\s*>/i, `${siteScript}\n</body>`);
    } else if (/<\/html\s*>/i.test(output)) {
      output = output.replace(/<\/html\s*>/i, `${siteScript}\n</html>`);
    } else {
      output += `\n${siteScript}\n`;
    }
  }
  return output;
}

let changed = 0;
let skipped = 0;
for (const page of manifest.pages) {
  if (!publicPage(page)) {
    skipped += 1;
    continue;
  }

  const filePath = path.join(root, ...page.path.split("/"));
  const before = fs.readFileSync(filePath, "utf8");
  const after = updatePage(before, page.theme);
  if (before === after) {
    page.status = "done";
    continue;
  }
  changed += 1;
  if (applyChanges) {
    fs.writeFileSync(filePath, after);
    page.status = "done";
  }
}

if (applyChanges) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`${applyChanges ? "Applied" : "Dry run"}: ${changed} pages need design wiring.`);
console.log(`Already wired: ${manifest.pages.length - changed - skipped}; excluded private pages: ${skipped}.`);
if (!applyChanges) console.log("Run with --apply to wire the shared design assets and theme attributes.");
