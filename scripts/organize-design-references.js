const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cache = path.join(root, "_design-reference");
const references = [
  { name: "neutomni", url: "https://neutomni.com/", snapshot: "(INDEX)", output: "index-saved.html", screenshots: [1440, 768, 390] },
  { name: "legencymedia", url: "https://legencymedia.com/", snapshot: "INDEX 3.COM", output: "index-saved.html", screenshots: [1440, 768, 390] },
  { name: "krackerz", url: "https://krackerz.com/main", snapshot: "main", output: "main-saved.txt", screenshots: [1440, 768, 390] },
  { name: "leeholmes", url: "https://leeholmes.uk/", snapshot: "(INDEX) 2.COM", output: "index-saved.html", screenshots: [1440, 768, 390] },
];
const copied = [];
const assignedFiles = new Map();

function recordCopy(reference, sourceName, outputName) {
  copied.push(`${reference}/${outputName}`);
  const sites = assignedFiles.get(sourceName) || new Set();
  sites.add(reference);
  assignedFiles.set(sourceName, sites);
}

function referencedUrls(source, extension) {
  const urls = [...source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  const dependencyPattern = extension === ".css"
    ? /(?:url\(\s*["']?([^"')]+)|@import\s+["']([^"']+))/gi
    : /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/gi;
  for (const match of source.matchAll(dependencyPattern)) {
    urls.push(match[1] || match[2]);
  }
  return urls;
}

for (const reference of references) {
  const source = path.join(cache, reference.snapshot);
  const destination = path.join(cache, reference.name);
  if (!fs.existsSync(source)) throw new Error(`Missing saved reference: ${reference.snapshot}`);
  fs.copyFileSync(source, path.join(destination, reference.output));
  recordCopy(reference.name, reference.snapshot, reference.output);

  const sourceExtension = reference.output.endsWith(".html")
    ? ".html"
    : path.extname(source).toLowerCase();
  const queue = [{ url: reference.url, text: fs.readFileSync(source, "utf8"), extension: sourceExtension }];
  for (const [filename, extension] of [["rendered-live.html", ".html"], ["styles-live.css", ".css"]]) {
    const capturePath = path.join(destination, filename);
    if (fs.existsSync(capturePath)) {
      queue.push({ url: reference.url, text: fs.readFileSync(capturePath, "utf8"), extension });
    }
  }
  const seenAssets = new Set();
  while (queue.length) {
    const current = queue.shift();
    for (const assetUrl of referencedUrls(current.text, current.extension)) {
      if (/^(?:#|data:|javascript:|mailto:|tel:)/i.test(assetUrl)) continue;
      let resolved;
      let basename;
      try {
        resolved = new URL(assetUrl, current.url);
        basename = decodeURIComponent(resolved.pathname.split("/").pop());
      } catch {
        continue;
      }
      if (!basename || seenAssets.has(basename)) continue;
      seenAssets.add(basename);
      let assetName = basename;
      let assetSource = path.join(cache, assetName);
      if (!fs.existsSync(assetSource) && !path.extname(basename)) {
        for (const extension of [".js", ".mjs", ".ts", ".css", ".json"]) {
          const candidate = `${basename}${extension}`;
          if (!fs.existsSync(path.join(cache, candidate))) continue;
          assetName = candidate;
          assetSource = path.join(cache, candidate);
          break;
        }
      }
      if (!fs.existsSync(assetSource) || !fs.statSync(assetSource).isFile()) continue;
      const assetDestination = path.join(destination, assetName);
      if (assetSource !== assetDestination) fs.copyFileSync(assetSource, assetDestination);
      recordCopy(reference.name, assetName, assetName);

      const extension = path.extname(assetName).toLowerCase();
      if (![".css", ".js", ".mjs", ".ts", ".json"].includes(extension)) continue;
      const text = fs.readFileSync(assetSource, "utf8");
      if (text.length <= 2_000_000) {
        queue.push({ url: resolved.href, text, extension });
      }
    }
  }

  for (const width of reference.screenshots) {
    const screenshot = path.join(cache, `${reference.name}-${width}.png`);
    if (!fs.existsSync(screenshot)) continue;
    fs.copyFileSync(screenshot, path.join(destination, `${width}.png`));
    recordCopy(reference.name, `${reference.name}-${width}.png`, `${width}.png`);
  }
}

const originalNames = fs.readdirSync(cache, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => !/^(?:neutomni|legencymedia|krackerz|leeholmes)-(?:1440|768|390)\.png$/.test(name))
  .filter((name) => name !== "index-live.html")
  .sort();

for (const reference of references) {
  const destination = path.join(cache, reference.name);
  const evidenceFiles = ["rendered-live.html", "styles-live.css", reference.output]
    .map((name) => path.join(destination, name))
    .filter((file) => fs.existsSync(file));
  const evidence = evidenceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  for (const name of originalNames) {
    if (!evidence.includes(name) && !evidence.includes(encodeURIComponent(name))) continue;
    const source = path.join(cache, name);
    const target = path.join(destination, name);
    if (source !== target && fs.existsSync(source)) fs.copyFileSync(source, target);
    recordCopy(reference.name, name, name);
  }
}

const siteFingerprints = [
  { site: "neutomni", test: (name, text) => /neutomni|webflow|greensock|gsap|lenis|split-type|circletype/i.test(`${name} ${text}`) },
  { site: "legencymedia", test: (name, text) => /legencymedia|pp frama|data-astro-cid/i.test(`${name} ${text}`) },
  { site: "krackerz", test: (name, text) => /framer|framerusercontent|highway motel|boldonse|geists?|dm sans/i.test(`${name} ${text}`) || /^(?:chunk-|react\.|jsx-runtime|editorbar|propUtils|isMotionValue)/i.test(name) },
  { site: "leeholmes", test: (name, text) => /leeholmes\.uk|neuemontreal|asmodule|xanh mono/i.test(`${name} ${text}`) || /^(?:layout\.|mobilemenu\.|accordion\.|sectionheading\.|testimonials\.|ctasection\.)/i.test(name) },
];
for (const name of originalNames) {
  if (assignedFiles.has(name)) continue;
  const source = path.join(cache, name);
  const buffer = fs.readFileSync(source);
  const text = buffer.subarray(0, Math.min(buffer.length, 16000)).toString("utf8");
  const fingerprint = siteFingerprints.find((candidate) => candidate.test(name, text));
  if (!fingerprint) continue;
  const target = path.join(cache, fingerprint.site, name);
  fs.copyFileSync(source, target);
  recordCopy(fingerprint.site, name, name);
}

const originalFlatFiles = originalNames
  .map((name) => ({
    file: name,
    bytes: fs.statSync(path.join(cache, name)).size,
    assigned_to: [...(assignedFiles.get(name) || [])].sort(),
  }));
fs.writeFileSync(
  path.join(root, "REFERENCE_FILE_INDEX.json"),
  `${JSON.stringify({ original_flat_file_count: originalFlatFiles.length, files: originalFlatFiles }, null, 2)}\n`,
);

console.log(`Copied ${copied.length} reference snapshot, asset, and screenshot files.`);
console.log(`Indexed ${originalFlatFiles.length} original flat-cache files in REFERENCE_FILE_INDEX.json.`);
for (const relativePath of copied.sort()) console.log(relativePath);
