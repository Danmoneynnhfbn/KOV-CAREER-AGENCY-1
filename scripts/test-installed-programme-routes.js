"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const origin = "https://www.kovcareeragency.org";

function parseCsv(contents) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const text = contents.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\r" || character === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else field += character;
  }
  if (field !== "" || row.length) rows.push([...row, field]);
  const [headers, ...records] = rows;
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function localFile(routeOrPath) {
  const relative = routeOrPath.replace(/^\/+/, "");
  const direct = path.resolve(root, relative);
  assert.ok(direct === root || direct.startsWith(`${root}${path.sep}`), `Path escapes repository: ${routeOrPath}`);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (!path.extname(direct) && fs.existsSync(path.join(direct, "index.html"))) return path.join(direct, "index.html");
  if (!path.extname(direct) && fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

function hasNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["'](?:robots|googlebot)["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b)[^>]*>/i.test(html);
}

function canonicalOf(html) {
  return html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1] ?? null;
}

function assertJsonLdParses(html, label) {
  const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi)];
  assert.ok(blocks.length, `${label} must retain JSON-LD`);
  for (const block of blocks) assert.doesNotThrow(() => JSON.parse(block[1]), `${label} JSON-LD must parse`);
}

async function checkLocalHttpRoutes(routes) {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = localFile(pathname);
    if (!file) { response.writeHead(404).end("Not found"); return; }
    fs.readFile(file, (error, body) => {
      if (error) { response.writeHead(500).end(); return; }
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    for (let start = 0; start < routes.length; start += 40) {
      await Promise.all(routes.slice(start, start + 40).map(async (route) => {
        const response = await fetch(`http://127.0.0.1:${port}${route}`);
        assert.equal(response.status, 200, `${route} should resolve locally`);
        assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
        assert.match(await response.text(), /<h1\b/i, `${route} should serve HTML content`);
      }));
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function run() {
  const tracker = parseCsv(fs.readFileSync(path.join(root, "development/PAGE-TRACKER.csv"), "utf8"));
  const manifest = parseCsv(fs.readFileSync(path.join(root, "development/INSTALLED-PROGRAMME-ROUTES.csv"), "utf8"));
  const programmePages = manifest.filter((row) => row.kind === "programme page");
  const supportPages = manifest.filter((row) => row.kind !== "programme page");
  const sitemapText = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const sitemap = new Set([...sitemapText.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => match[1].trim()));
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
  const searchIndex = fs.readFileSync(path.join(root, "assets/site-search-index.js"), "utf8");

  const uniqueTrackerUrls = new Set(tracker.map((row) => row.proposed_url));
  const uniqueManifestUrls = new Set(programmePages.map((row) => row.intended_url));
  assert.equal(uniqueTrackerUrls.size, tracker.length, "Candidate tracker URLs must be unique");
  assert.equal(uniqueManifestUrls.size, programmePages.length, "Installed programme URLs must be unique");
  assert.equal(programmePages.length, 577, "Installed route inventory should retain its 577 source rows");
  assert.equal(supportPages.length, 16, "Installed support index inventory should retain its 16 source rows");
  assert.match(robots, /^User-agent:\s*\*\s*[\r\n]+Allow:\s*\/\s*$/im, "robots.txt should allow public crawling");
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.kovcareeragency\.org\/sitemap\.xml\s*$/im);

  let candidateStagingPages = 0;
  let installedNoindexPages = 0;
  let installedRoutesAbsentFromPublicDiscovery = 0;
  const candidateRouteGaps = [];
  for (const candidate of tracker) {
    const previewPath = localFile(candidate.staging_preview_url);
    assert.ok(previewPath, `${candidate.staging_preview_url} staging preview should exist`);
    const previewHtml = fs.readFileSync(previewPath, "utf8");
    assert.ok(hasNoindex(previewHtml), `${candidate.id} staging preview must remain noindex`);
    assertJsonLdParses(previewHtml, `${candidate.id} staging preview`);
    assert.equal(sitemap.has(`${origin}${candidate.staging_preview_url}`), false, `${candidate.staging_preview_url} must stay out of sitemap`);
    assert.equal(llms.includes(`${origin}${candidate.staging_preview_url}`), false, `${candidate.staging_preview_url} must stay out of llms.txt`);
    candidateStagingPages += 1;

    const publicPath = localFile(candidate.proposed_url);
    if (!publicPath) {
      candidateRouteGaps.push(candidate.proposed_url);
      assert.notEqual(candidate.publication_status, "published", `${candidate.id} has a missing route but is marked published`);
      continue;
    }
    const publicHtml = fs.readFileSync(publicPath, "utf8");
    assert.equal(canonicalOf(publicHtml), `${origin}${candidate.proposed_url}`, `${candidate.id} canonical must match proposed route`);
    if (candidate.publication_status !== "published") {
      assert.ok(hasNoindex(publicHtml), `${candidate.id} unpublished proposed route must stay noindex`);
      assert.equal(sitemap.has(`${origin}${candidate.proposed_url}`), false, `${candidate.proposed_url} unpublished route must stay out of sitemap`);
      assert.equal(llms.includes(`${origin}${candidate.proposed_url}`), false, `${candidate.proposed_url} unpublished route must stay out of llms.txt`);
    }
  }

  for (const page of programmePages) {
    const file = localFile(page.file_path);
    assert.ok(file, `${page.file_path} must exist`);
    const html = fs.readFileSync(file, "utf8");
    assert.equal(canonicalOf(html), `${origin}${page.intended_url}`, `${page.intended_url} canonical must match manifest`);
    assert.ok(hasNoindex(html), `${page.intended_url} must retain its current noindex gate pending publication approval`);
    assert.equal(sitemap.has(`${origin}${page.intended_url}`), false, `${page.intended_url} must stay out of sitemap while noindex`);
    assert.equal(llms.includes(`${origin}${page.intended_url}`), false, `${page.intended_url} must stay out of llms.txt while noindex`);
    assert.equal(searchIndex.includes(page.intended_url), false, `${page.intended_url} must stay out of public search while noindex`);
    assertJsonLdParses(html, page.intended_url);
    const sourcePath = localFile(page.source_staging_url);
    assert.ok(sourcePath, `${page.source_staging_url} source staging page must remain available`);
    installedNoindexPages += 1;
    installedRoutesAbsentFromPublicDiscovery += 1;
  }

  for (const support of supportPages) {
    const file = localFile(support.file_path);
    assert.ok(file, `${support.file_path} should exist`);
    const html = fs.readFileSync(file, "utf8");
    assert.ok(hasNoindex(html), `${support.file_path} should remain noindex`);
    assert.equal(sitemap.has(`${origin}${support.intended_url}`), false, `${support.intended_url} must stay out of sitemap`);
    assert.equal(llms.includes(`${origin}${support.intended_url}`), false, `${support.intended_url} must stay out of llms.txt`);
    assert.equal(searchIndex.includes(support.intended_url), false, `${support.intended_url} must stay out of public search`);
  }

  const installedRouteUrls = programmePages.map((page) => page.intended_url);
  await checkLocalHttpRoutes(installedRouteUrls);
  console.log(JSON.stringify({
    status: "PASS",
    trackerCandidateRows: tracker.length,
    stagingPreviewsNoindexAndExcluded: candidateStagingPages,
    missingProposedRoutesNotMarkedPublished: candidateRouteGaps.length,
    missingProposedRouteExamples: candidateRouteGaps.slice(0, 15),
    installedProgrammePages: programmePages.length,
    installedSupportIndexes: supportPages.length,
    installedPagesWithCanonicalAndNoindex: installedNoindexPages,
    installedPagesExcludedFromSitemapLlmsSearch: installedRoutesAbsentFromPublicDiscovery,
    localHttpRoutesChecked: installedRouteUrls.length,
    noindexPolicy: "preserved; no routes published or added to public discovery by this test",
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
