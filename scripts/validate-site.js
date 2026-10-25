const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const excludedDirectories = new Set([
  ".git",
  ".venv",
  "_design-reference",
  "design-reference",
  "node_modules",
]);
const htmlFiles = [];
const failures = [];
const brokenTargets = new Map();
let checkedLinks = 0;
let checkedImages = 0;
let h1Pages = 0;
let redirectPages = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolutePath);
    else if (entry.isFile() && /\.html$/i.test(entry.name)) htmlFiles.push(absolutePath);
  }
}

function resolveInternalUrl(value, pagePath) {
  if (!value || /^(?:#|data:|javascript:|mailto:|tel:|blob:)/i.test(value)) return null;
  let url;
  try {
    url = new URL(value, `https://www.kovcareeragency.org/${pagePath}`);
  } catch {
    return null;
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

walk(root);
for (const absolutePath of htmlFiles) {
  const pagePath = path.relative(root, absolutePath).split(path.sep).join("/");
  const source = fs.readFileSync(absolutePath, "utf8");
  const h1Count = (source.match(/<h1\b/gi) || []).length;
  const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(source);
  if (isRedirect) redirectPages += 1;
  else if (h1Count === 1) h1Pages += 1;
  else failures.push(`${pagePath}: expected one H1, found ${h1Count}`);

  for (const match of source.matchAll(/<(a|link|script|img|source)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[1].toLowerCase();
    const value = match[2];
    const error = resolveInternalUrl(value, pagePath);
    if (error) {
      failures.push({ pagePath, error, tag });
      const key = `${tag}: ${error}`;
      const entry = brokenTargets.get(key) || { count: 0, examples: [] };
      entry.count += 1;
      if (entry.examples.length < 2) entry.examples.push(pagePath);
      brokenTargets.set(key, entry);
      continue;
    }
    if (/^(?:#|data:|javascript:|mailto:|tel:|blob:)/i.test(value)) continue;
    let url;
    try {
      url = new URL(value, `https://www.kovcareeragency.org/${pagePath}`);
    } catch {
      continue;
    }
    if (!["www.kovcareeragency.org", "kovcareeragency.org"].includes(url.hostname)) continue;
    checkedLinks += 1;
    if (tag === "img" || tag === "source") checkedImages += 1;
  }
}

console.log(`HTML pages: ${htmlFiles.length}`);
console.log(`Internal links/assets checked: ${checkedLinks} (${checkedImages} image/source references)`);
console.log(`Pages with one H1: ${h1Pages}; redirect stubs excluded from H1 check: ${redirectPages}`);
console.log(`Failures: ${failures.length}`);
if (failures.length) {
  const summary = [...brokenTargets.entries()]
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 25)
    .map(([target, value]) => `${value.count}x ${target} (e.g. ${value.examples.join(", ")})`);
  console.error(summary.join("\n"));
  process.exitCode = 1;
}
