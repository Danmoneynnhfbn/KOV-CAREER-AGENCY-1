"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "development/INSTALLED-PROGRAMME-ROUTES.csv");
const redirectsPath = path.join(root, "_redirects");

function parseCsv(contents) {
  const rows = [];
  let row = [], field = "", quoted = false;
  const source = contents.charCodeAt(0) === 0xfeff ? contents.slice(1) : contents;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\r" || ch === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = []; field = "";
      if (ch === "\r" && source[i + 1] === "\n") i += 1;
    } else field += ch;
  }
  if (field !== "" || row.length) rows.push([...row, field]);
  const [headers, ...records] = rows;
  return records.map((values) => Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""])));
}

function routeFile(route) {
  const pathname = route.split("/").filter(Boolean).join(path.sep);
  const candidate = path.resolve(root, pathname, "index.html");
  assert.ok(candidate.startsWith(root + path.sep), "Route escapes repository root: " + route);
  return candidate;
}

const manifest = parseCsv(fs.readFileSync(manifestPath, "utf8"));
const lines = fs.readFileSync(redirectsPath, "utf8").split("\n").map((line) => line.trim()).filter(Boolean);
const redirectMap = new Map();
const duplicates = [];
for (const line of lines) {
  const [source, destination, status] = line.split(/\s+/);
  if (!source || !destination || !status) continue;
  if (redirectMap.has(source)) duplicates.push(source);
  redirectMap.set(source, { destination, status });
}

const mappings = manifest.map((row) => ({
  id: row.programme_id || row.kind,
  source: row.source_staging_url,
  destination: row.intended_url,
  destinationFile: row.file_path,
  kind: row.kind,
}));

assert.equal(mappings.length, 593, "Expected 577 programme pages and 16 support indexes");
assert.equal(new Set(mappings.map((row) => row.source)).size, mappings.length);
assert.equal(new Set(mappings.map((row) => row.destination)).size, mappings.length);
assert.deepEqual(duplicates, [], "Redirect sources must be unique");

const failures = [];
for (const row of mappings) {
  const preview = redirectMap.get(row.source);
  const legacySource = row.source.replace("/directory", "/staging");
  const legacy = redirectMap.get(legacySource);
  if (!preview || preview.destination !== row.destination || preview.status !== "301" ||
      !legacy || legacy.destination !== row.destination || legacy.status !== "301") {
    failures.push({ id: row.id, source: row.source, expected: row.destination });
    continue;
  }
  assert.ok(fs.existsSync(routeFile(row.source)), "Missing preview source: " + row.source);
  assert.ok(fs.existsSync(path.join(root, row.destinationFile)), "Missing clean destination: " + row.destinationFile);
  assert.ok(!preview.destination.startsWith("/directory/"));
}
assert.deepEqual(failures, [], "Every manifest route needs exact 301 preview and legacy redirects");
assert.ok(redirectMap.has("/staging"), "Missing /staging fallback");
assert.ok(redirectMap.has("/staging/*"), "Missing /staging/* fallback");

console.log(JSON.stringify({
  status: "PASS",
  programmeRoutes: mappings.filter((row) => row.kind === "programme page").length,
  supportIndexes: mappings.filter((row) => row.kind !== "programme page").length,
  previewRedirects: mappings.length,
  legacyStagingRedirects: mappings.length,
  sourceFilesVerified: mappings.length,
  destinationFilesVerified: mappings.length,
  duplicateSources: duplicates.length
}, null, 2));
