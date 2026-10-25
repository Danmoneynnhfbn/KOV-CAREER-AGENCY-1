const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const baseline = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!baseline || !fs.existsSync(baseline)) {
  console.error("Usage: node scripts/verify-design-invariants.js <baseline-directory>");
  process.exit(2);
}

const ignoredDirectories = new Set([
  ".git",
  ".venv",
  "_design-reference",
  "design-reference",
  "node_modules",
]);
const pages = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolutePath);
    else if (entry.isFile() && /\.html$/i.test(entry.name)) pages.push(absolutePath);
  }
}

function decodeEntities(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
    const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? match;
    const codePoint = entity[1].toLowerCase() === "x"
      ? Number.parseInt(entity.slice(2), 16)
      : Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  });
}

function visibleText(source) {
  return decodeEntities(source
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractAll(source, expression) {
  return [...source.matchAll(expression)].map((match) => match[0]);
}

function frozenMetadata(source) {
  return {
    title: extractAll(source, /<title\b[^>]*>[\s\S]*?<\/title\s*>/gi),
    description: extractAll(source, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi),
    canonical: extractAll(source, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi),
    structuredData: extractAll(source, /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script\s*>/gi),
    anchors: extractAll(source, /<a\b[^>]*\bhref=["'][^"']*["'][^>]*>/gi),
    imageAlt: extractAll(source, /<img\b[^>]*>/gi).map((tag) => tag.match(/\balt=["'][^"']*["']/i)?.[0] || ""),
  };
}

walk(root);
let textChanges = 0;
let metadataChanges = 0;
const failures = [];

for (const currentPath of pages) {
  const relativePath = path.relative(root, currentPath);
  const baselinePath = path.join(baseline, relativePath);
  if (!fs.existsSync(baselinePath)) {
    failures.push(`${relativePath}: missing from baseline`);
    continue;
  }

  const current = fs.readFileSync(currentPath, "utf8");
  const original = fs.readFileSync(baselinePath, "utf8");
  if (visibleText(current) !== visibleText(original)) {
    textChanges += 1;
    failures.push(`${relativePath}: visible text differs`);
  }
  if (JSON.stringify(frozenMetadata(current)) !== JSON.stringify(frozenMetadata(original))) {
    metadataChanges += 1;
    failures.push(`${relativePath}: frozen metadata, links, or image alt text differs`);
  }
}

console.log(`Compared ${pages.length} HTML pages.`);
console.log(`Visible-text differences: ${textChanges}`);
console.log(`Frozen metadata/link/alt differences: ${metadataChanges}`);
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exitCode = 1;
}
