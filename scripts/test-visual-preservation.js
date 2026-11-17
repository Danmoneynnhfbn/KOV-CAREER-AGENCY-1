const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  RESPONSIVE_IMAGE_VARIANTS,
  hasResponsivePicture,
  normalizeResponsivePictures,
} = require("./lib/visual-preservation");

const root = path.resolve(__dirname, "..");
const baselinePath = path.join(root, "development", "VISUAL-REDESIGN-BODY-BASELINE.json");

function hash(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hasValidStylesheets(head, filePath) {
  const links = [...head.matchAll(/<link\b(?=[^>]*\brel=["'][^"']*\bstylesheet\b[^"']*["'])[^>]*>/gi)];
  return links.every(([tag]) => {
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith("data:")) return Boolean(href);
    const localPath = href.split(/[?#]/, 1)[0];
    const resolved = localPath.startsWith("/")
      ? path.join(root, localPath.slice(1))
      : path.resolve(root, path.dirname(filePath), localPath);
    return fs.existsSync(resolved);
  });
}

function main() {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const failures = [];
  let noindexPages = 0;

  for (const page of baseline.pages) {
    const filePath = path.join(root, page.file_path);
    if (!fs.existsSync(filePath)) {
      failures.push({ file_path: page.file_path, reason: "missing route file" });
      continue;
    }
    const html = fs.readFileSync(filePath, "utf8");
    const body = html.match(/<body\b[^>]*>([\s\S]*?)(?:<\/body\s*>|$)/i)?.[1];
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? "";
    if (body === undefined) {
      failures.push({ file_path: page.file_path, reason: "body element missing" });
      continue;
    }
    if (hash(normalizeResponsivePictures(body, page.file_path)) !== page.body_sha256) {
      failures.push({ file_path: page.file_path, reason: "body content or markup changed" });
    }
    for (const fallback of RESPONSIVE_IMAGE_VARIANTS.keys()) {
      if (body.includes(fallback.split("/").pop()) && !hasResponsivePicture(body, page.file_path, fallback)) {
        failures.push({ file_path: page.file_path, reason: `responsive AVIF/WebP sources missing for ${fallback}` });
      }
    }
    const seoHead = [
      ...head.matchAll(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi),
      ...head.matchAll(/<meta\b[^>]*>/gi),
      ...head.matchAll(/<link\b(?=[^>]*\brel=["'][^"']*canonical[^"']*["'])[^>]*>/gi),
    ].map((match) => match[0]).join("\n");
    if (hash(seoHead) !== page.seo_head_sha256) {
      failures.push({ file_path: page.file_path, reason: "title, metadata, or canonical changed" });
    }
    if (!hasValidStylesheets(head, page.file_path)) {
      failures.push({ file_path: page.file_path, reason: "stylesheet reference is missing or invalid" });
    }
    if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(head)) {
      noindexPages += 1;
    }
  }

  assert.deepEqual(failures, [], `Visual refresh preservation failures: ${JSON.stringify(failures.slice(0, 10))}`);
  console.log(JSON.stringify({
    routesCompared: baseline.pages.length,
    exactBodyMatches: baseline.pages.length,
    protectedSeoHeadMatches: baseline.pages.length,
    routesWithValidStylesheets: baseline.pages.length - failures.filter((failure) => failure.reason === "stylesheet reference is missing or invalid").length,
    noindexPagesPreserved: noindexPages,
    failures: failures.length,
  }, null, 2));
}

main();
