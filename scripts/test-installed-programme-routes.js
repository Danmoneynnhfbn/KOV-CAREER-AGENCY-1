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
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\r" || character === "\n") {
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }
  if (field !== "" || row.length > 0) rows.push([...row, field]);
  const [headers, ...records] = rows;
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function pathForUrl(url) {
  const parsed = new URL(url, origin);
  const relative = parsed.pathname.replace(/^\/+/, "");
  const direct = path.resolve(root, relative);
  assert.ok(direct === root || direct.startsWith(`${root}${path.sep}`), `Route escapes repository: ${url}`);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (!path.extname(direct) && fs.existsSync(path.join(direct, "index.html"))) {
    return path.join(direct, "index.html");
  }
  if (!path.extname(direct) && fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

function idsIn(html) {
  return new Set([
    ...[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]),
    ...[...html.matchAll(/<a\b[^>]*\bname=["']([^"']+)["']/gi)].map((match) => match[1]),
  ]);
}

async function assertHttpRoutes(tracker) {
  const server = http.createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }

    let filePath = path.resolve(root, `.${pathname}`);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(content);
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    for (let offset = 0; offset < tracker.length; offset += 40) {
      const batch = tracker.slice(offset, offset + 40);
      await Promise.all(batch.map(async (candidate) => {
        const response = await fetch(`http://127.0.0.1:${address.port}${candidate.proposed_url}`);
        assert.equal(response.status, 200, `${candidate.proposed_url} should resolve over HTTP`);
        assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
        const html = await response.text();
        assert.match(html, /<h1\b/i, `${candidate.proposed_url} should serve HTML content`);
      }));
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function run() {
  const tracker = parseCsv(fs.readFileSync(path.join(root, "development", "PAGE-TRACKER.csv"), "utf8"));
  const manifest = parseCsv(fs.readFileSync(path.join(root, "development", "INSTALLED-PROGRAMME-ROUTES.csv"), "utf8"));
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/gs)].map((match) => match[1].trim()));
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
  const searchIndex = fs.readFileSync(path.join(root, "assets", "site-search-index.js"), "utf8");
  const searchContent = fs.readFileSync(path.join(root, "assets", "site-search-content.js"), "utf8");
  const registerRoutes = new Set(tracker.map((row) => row.proposed_url));
  const programmeSitemapRoutes = tracker.filter((row) =>
    sitemapUrls.has(`${origin}${row.proposed_url}`)
  );
  const programmeLlmsRoutes = tracker.filter((row) =>
    llms.includes(`](${origin}${row.proposed_url})`)
  );
  assert.equal(tracker.length, 577, "Programme tracker must have 577 pages");
  assert.equal(registerRoutes.size, 577, "Programme intended URLs must be unique");
  assert.equal(manifest.length, 593, "Installed manifest must include 577 programme routes and 16 support indexes");
  assert.equal(manifest.filter((row) => row.kind === "programme page").length, 577);
  assert.equal(programmeSitemapRoutes.length, 577, "All programme routes should appear in sitemap.xml");
  assert.equal(programmeLlmsRoutes.length, 577, "All programme routes should appear in llms.txt");
  assert.match(robots, /^User-agent:\s*\*\s*[\r\n]+Allow:\s*\/\s*$/im, "robots.txt should allow crawling all routes");
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.kovcareeragency\.org\/sitemap\.xml\s*$/im);
  assert.match(llms, /Career Resource Pages/);
  assert.equal((llms.match(/<!-- BEGIN STAGED PROGRAMME ROUTES -->/g) ?? []).length, 1);
  assert.equal((llms.match(/<!-- END STAGED PROGRAMME ROUTES -->/g) ?? []).length, 1);

  let checkedLinks = 0;
  let brokenLinks = 0;
  let pagesIndexable = 0;
  for (const candidate of tracker) {
    const filePath = pathForUrl(candidate.proposed_url);
    assert.ok(filePath, `${candidate.proposed_url} should resolve to a local HTML file`);
    const html = fs.readFileSync(filePath, "utf8");
    const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)?.[1];
    assert.equal(canonical, `${origin}${candidate.proposed_url}`, `${candidate.id} canonical should match its intended URL`);
    assert.doesNotMatch(html, /<meta\b[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*noindex/i, `${candidate.id} should be indexable`);
    pagesIndexable += 1;
    assert.equal(sitemapUrls.has(`${origin}${candidate.proposed_url}`), true, `${candidate.proposed_url} should be in the sitemap`);
    assert.equal(llms.includes(`${origin}${candidate.proposed_url}`), true, `${candidate.proposed_url} should be listed in llms.txt`);
    const installedPage = manifest.find((row) =>
      row.kind === "programme page" && row.intended_url === candidate.proposed_url
    );
    assert.ok(installedPage, `${candidate.proposed_url} should have an installed manifest entry`);
    assert.ok(searchIndex.includes(`"href":"${installedPage.file_path}"`), `${candidate.proposed_url} should appear in public search`);
    assert.ok(searchContent.includes(`"${installedPage.file_path}"`), `${candidate.proposed_url} should have searchable page content`);
    assert.equal(html.includes(candidate.staging_preview_url), false, `${candidate.id} must not retain its staging self-link`);

    const jsonLdBlocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
    assert.ok(jsonLdBlocks.length > 0, `${candidate.id} needs JSON-LD`);
    for (const block of jsonLdBlocks) assert.doesNotThrow(() => JSON.parse(block[1]), `${candidate.id} JSON-LD must parse`);

    const ids = idsIn(html);
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
      const href = match[1].replace(/&amp;/gi, "&").trim();
      if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      let destination;
      try {
        destination = new URL(href, `${origin}${candidate.proposed_url}`);
      } catch {
        brokenLinks += 1;
        continue;
      }
      if (!["http:", "https:"].includes(destination.protocol) || destination.origin !== origin) continue;
      checkedLinks += 1;
      const destinationPath = pathForUrl(destination.href);
      if (!destinationPath) {
        brokenLinks += 1;
        continue;
      }
      if (destination.hash) {
        const destinationHtml = fs.readFileSync(destinationPath, "utf8");
        if (!idsIn(destinationHtml).has(decodeURIComponent(destination.hash.slice(1)))) brokenLinks += 1;
      }
    }
  }

  const supportRows = manifest.filter((row) => row.kind !== "programme page");
  for (const support of supportRows) {
    const filePath = path.join(root, support.file_path);
    assert.ok(fs.existsSync(filePath), `${support.file_path} should exist`);
    const html = fs.readFileSync(filePath, "utf8");
    assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i, `${support.file_path} should remain noindex`);
    assert.equal(sitemapUrls.has(`${origin}${support.intended_url}`), false, `${support.intended_url} must remain out of sitemap`);
    assert.equal(llms.includes(`](${origin}${support.intended_url})`), false, `${support.intended_url} must remain out of llms.txt`);
    assert.equal(searchIndex.includes(support.intended_url), false, `${support.intended_url} must remain out of public search`);
  }

  assert.equal(pagesIndexable, 577);
  assert.equal(brokenLinks, 0, "Installed programme pages should have no broken internal links");
  await assertHttpRoutes(tracker);
  console.log(JSON.stringify({
    programmeRoutes: tracker.length,
    installedProgrammeFiles: manifest.filter((row) => row.kind === "programme page").length,
    supportIndexes: supportRows.length,
    programmePagesIndexable: pagesIndexable,
    checkedInternalLinks: checkedLinks,
    brokenInternalLinks: brokenLinks,
    programmeRoutesInSitemap: programmeSitemapRoutes.length,
    programmeRoutesInLlms: programmeLlmsRoutes.length,
    programmeRoutesInSearchIndex: tracker.filter((row) => {
      const installedPage = manifest.find((page) =>
        page.kind === "programme page" && page.intended_url === row.proposed_url
      );
      return installedPage && searchIndex.includes(`"href":"${installedPage.file_path}"`);
    }).length,
    httpRouteResponses: tracker.length,
    stagingSourcesPreserved: tracker.every((row) => fs.existsSync(path.join(root, "staging", row.staging_preview_url.replace(/^\/staging\//, ""), "index.html"))),
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
