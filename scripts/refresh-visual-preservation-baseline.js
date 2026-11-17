const fs = require("node:fs");
const crypto = require("node:crypto");
const { normalizeResponsivePictures } = require("./lib/visual-preservation");

const baselinePath = "development/VISUAL-REDESIGN-BODY-BASELINE.json";
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const digest = (value) => crypto.createHash("sha256").update(value, "utf8").digest("hex");

for (const page of baseline.pages) {
  const html = fs.readFileSync(page.file_path, "utf8");
  const body = html.match(/<body\b[^>]*>([\s\S]*?)(?:<\/body\s*>|$)/i)?.[1];
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? "";
  const protectedSeo = [
    ...head.matchAll(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi),
    ...head.matchAll(/<meta\b[^>]*>/gi),
    ...head.matchAll(/<link\b(?=[^>]*\brel=["'][^"']*canonical[^"']*["'])[^>]*>/gi),
    ...head.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script\s*>/gi),
  ].map((match) => match[0]).join("\n");
  if (body === undefined) throw new Error(`Missing body in ${page.file_path}`);
  page.body_sha256 = digest(normalizeResponsivePictures(body, page.file_path));
  page.seo_head_sha256 = digest(protectedSeo);
}

baseline.created_at = new Date().toISOString();
baseline.preservation_method = "Approved current-site checkpoint: saved HTML body and protected SEO-head SHA-256 fingerprints; responsive-picture sources are normalized to their unchanged fallback img markup. The historic 2026-11-06 baseline is retained separately. This baseline detects changes after the current approved checkpoint; it does not replace visual review of a new redesign.";
fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
console.log(`Refreshed ${baseline.pages.length} saved-page fingerprints.`);
