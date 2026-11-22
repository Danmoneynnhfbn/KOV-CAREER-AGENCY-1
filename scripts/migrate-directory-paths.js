#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SELF = path.relative(ROOT, __filename).split(path.sep).join("/");
const SKIP_DIRS = new Set([
  ".git", "node_modules", ".venv", "venv", ".next", ".vercel",
  "dist", "build", "coverage", ".cache"
]);
const TEXT_EXTENSIONS = new Set([
  ".html", ".htm", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
  ".css", ".scss", ".json", ".jsonld", ".xml", ".txt", ".csv", ".md",
  ".yml", ".yaml", ".py", ".ps1", ".sh", ".toml", ".ini", ".sql",
  ".properties", ".conf", ".config", ".svg", ".webmanifest", ".map"
]);

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function walk(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, results);
    else if (entry.isFile() && isTextFile(absolute)) results.push(absolute);
  }
  return results;
}

function migrate(source) {
  let output = source;
  output = output.replaceAll("https://www.kovcareeragency.org/staging/", "https://www.kovcareeragency.org/directory/");
  output = output.replaceAll("http://www.kovcareeragency.org/staging/", "http://www.kovcareeragency.org/directory/");
  output = output.replaceAll("/staging/", "/directory/");
  output = output.replace(/\bstaging\//g, "directory/");
  output = output.replace(/staging\\\//g, "directory\\/");
  output = output.replaceAll('path.join(root, "staging")', 'path.join(root, "directory")');
  output = output.replaceAll("path.join(root, 'staging')", "path.join(root, 'directory')");
  output = output.replaceAll('path.join(repoRoot, "staging")', 'path.join(repoRoot, "directory")');
  output = output.replaceAll("path.join(repoRoot, 'staging')", "path.join(repoRoot, 'directory')");
  output = output.replaceAll('path.join(__dirname, "staging")', 'path.join(__dirname, "directory")');
  output = output.replaceAll("path.join(__dirname, 'staging')", "path.join(__dirname, 'directory')");
  output = output.replaceAll('ROOT / "staging"', 'ROOT / "directory"');
  output = output.replaceAll("ROOT / 'staging'", "ROOT / 'directory'");
  return output;
}

const files = walk(ROOT);
let updatedFiles = 0;
let replacements = 0;
const residuals = [];

for (const absolute of files) {
  const relative = path.relative(ROOT, absolute).split(path.sep).join("/");
  // Keep the legacy source routes in the redirect file so old URLs still resolve.
  if (relative === "_redirects" || relative === SELF) continue;

  const original = fs.readFileSync(absolute, "utf8");
  if (original.includes("\0")) continue;
  const updated = migrate(original);
  if (updated !== original) {
    fs.writeFileSync(absolute, updated, "utf8");
    updatedFiles += 1;
    replacements += (original.match(/\/staging\//g) || []).length;
  }
  if (/\/staging\//.test(updated) || /\bstaging\//.test(updated)) {
    residuals.push(relative);
  }
}

console.log(JSON.stringify({
  scannedTextFiles: files.length,
  updatedFiles,
  replacedLegacyPathOccurrences: replacements,
  residualFiles: residuals
}, null, 2));

if (residuals.length) {
  throw new Error("Legacy staging path references remain outside _redirects: " + residuals.join(", "));
}
