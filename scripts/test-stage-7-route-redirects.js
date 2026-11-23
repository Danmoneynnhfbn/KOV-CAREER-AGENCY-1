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
  const text = contents.replace(/^\\uFEFF/, "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\\r" || ch === "\\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = []; field = "";
      if (ch === "\\r" && text[i + 1] === "\\n") i += 1;
    } else field += ch;
  }
  if (field !== "" || row.length) rows.push([...row, field]);
  const [headers, ...records] = rows;
  return records.map((values) => Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""])));
}

function resolveHtmlRoute(route) {
  const pathname = route.replace(/^\\/+/, "").replace(/\\/+$/, "");
  const candidate = path.resolve(root, pathname, "index.html");
  assert.ok(candidate.startsWith(root + path.sep), `Route escapes repository root: ${route}`);
  return candidate;
}

function run() {
  const manifest = parseCsv(fs.readFileSync(manifestPath, "utf8"));
  const rules = fs.readFileSync(redirectsPath, "utf8").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean);
  const redirectMap = new Map();
  const duplicateSources = [];

  for (const line of rules) {
    const [source, destination, status, ...extra] = line.split(/\\s+/);
    if (extra.length || !source || !destination || !status) continue;
    if (redirectMap.has(source)) duplicateSources.push(source);
    redirectMap.set(source, { destination, status });
  }

  const mappings = manifest.map((row) => ({
    id: row.programme_id || row.kind,
    source: row.source_staging_url,
    destination: row.intended_url,
    destinationFile: row.file_path,
    kind: row.kind,
  }));

  assert.equal(mappings.length, 593, "Expected all 577 programme pages and 16 support indexes");
  assert.equal(new Set(mappings.map((row) => row.source)).size, mappings.length, "Preview source routes must be unique");
  assert.equal(new Set(mappings.map((row) => row.destination)).size, mappings.length, "Clean destination routes must be unique");
  assert.deepEqual(duplicateSources, [], "Redirect sources must not be duplicated");

  const failures = [];
  for (const row of mappings) {
    const redirect = redirectMap.get(row.source);
    const legacySource = row.source.replace(/^\\/directory(?=\\/|$)/, "/staging");
    const legacyRedirect = redirectMap.get(legacySource);
    if (!redirect || redirect.destination !== row.destination || redirect.status !== "301" || !legacyRedirect || legacyRedirect.destination !== row.destination || legacyRedirect.status !== "301") {
      failures.push({ id: row.id, source: row.source, expected: row.destination, actual: { preview: redirect ?? null, legacy: legacyRedirect ?? null } });
      continue;
    }
    assert.ok(fs.existsSync(resolveHtmlRoute(row.source)), `Missing preview source: ${row.source}`);
    assert.ok(fs.existsSync(path.join(root, row.destinationFile)), `Missing clean destination: ${row.destinationFile}`);
    assert.ok(!redirect.destination.startsWith("/directory/"), `Redirect still points to preview namespace: ${row.source}`);
  }
  assert.deepEqual(failures, [], "Every manifest route must have one exact permanent redirect");

  assert.ok(redirectMap.has("/staging"), "Legacy /staging fallback must be preserved");
  assert.ok(redirectMap.has("/staging/*"), "Legacy /staging wildcard fallback must be preserved");

  console.log(JSON.stringify({
    status: "PASS",
    programmeRoutes: mappings.filter((row) => row.kind === "programme page").length,
    supportIndexes: mappings.filter((row) => row.kind !== "programme page").length,
    exactPermanentRedirects: mappings.length,
    directLegacyStagingRedirects: mappings.length,
    previewSourcesVerified: mappings.length,
    cleanDestinationFilesVerified: mappings.length,
    duplicateRedirectSources: duplicateSources.length,
    legacyStagingFallbacksPreserved: 2,
  }, null, 2));
}

run();
