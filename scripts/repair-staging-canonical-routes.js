const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const development = path.join(root, "development");
const stagingRoot = path.join(root, "staging");
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

function writeCsv(filePath, rows, headers) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const output = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ];
  fs.writeFileSync(filePath, `${output.join("\n")}\n`, "utf8");
}

function updateRelatedCsvRegisters(urlById) {
  const updatedFiles = [];
  for (const entry of fs.readdirSync(development, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".csv")) continue;
    const filePath = path.join(development, entry.name);
    if (path.basename(filePath) === "STAGING-URL-CANONICAL-CHANGES.csv") continue;
    const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
    if (!rows.length || !Object.hasOwn(rows[0], "proposed_url")) continue;
    const idColumn = Object.hasOwn(rows[0], "candidate_id")
      ? "candidate_id"
      : Object.hasOwn(rows[0], "id")
        ? "id"
        : "";
    if (!idColumn) continue;

    let updated = false;
    for (const row of rows) {
      const nextUrl = urlById.get(row[idColumn]);
      if (nextUrl && row.proposed_url && row.proposed_url !== nextUrl) {
        row.proposed_url = nextUrl;
        updated = true;
      }
    }
    if (updated) {
      writeCsv(filePath, rows, Object.keys(rows[0]));
      updatedFiles.push(path.relative(root, filePath).split(path.sep).join("/"));
    }
  }
  return updatedFiles;
}

function fileForPublicUrl(url) {
  const pathname = new URL(url, origin).pathname;
  const relative = pathname.replace(/^\/+/, "");
  const direct = path.resolve(root, relative);
  if (direct !== root && !direct.startsWith(`${root}${path.sep}`)) return null;
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (!path.extname(direct) && fs.existsSync(path.join(direct, "index.html"))) {
    return path.join(direct, "index.html");
  }
  if (!path.extname(direct) && fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

function stagingFileForRoute(route) {
  const relative = route.replace(/^\/staging\//, "").replace(/\/$/, "");
  const file = path.resolve(stagingRoot, relative, "index.html");
  if (!file.startsWith(`${stagingRoot}${path.sep}`)) throw new Error(`Invalid staging route: ${route}`);
  return file;
}

function setCanonical(html, canonicalUrl) {
  const linkTag = `<link rel="canonical" href="${canonicalUrl}">`;
  if (/<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i, linkTag);
  } else {
    html = html.replace(/<\/head>/i, `  ${linkTag}\n</head>`);
  }

  const ogUrlTag = `<meta property="og:url" content="${canonicalUrl}">`;
  if (/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i.test(html)) {
    html = html.replace(/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i, ogUrlTag);
  } else {
    html = html.replace(/<\/head>/i, `  ${ogUrlTag}\n</head>`);
  }

  return html.replace(
    /(<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (block, open, json, close) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (error) {
        throw new Error(`Invalid JSON-LD while updating canonical: ${error.message}`);
      }
      let currentPageUrl = "";
      const findCurrentPageUrl = (value) => {
        if (Array.isArray(value)) {
          value.forEach(findCurrentPageUrl);
          return;
        }
        if (!value || typeof value !== "object") return;
        const type = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
        if (type.includes("WebPage") && typeof value.url === "string") currentPageUrl = value.url;
        Object.values(value).forEach(findCurrentPageUrl);
      };
      findCurrentPageUrl(data);

      const replaceCurrentPageUrls = (value) => {
        if (Array.isArray(value)) {
          value.forEach(replaceCurrentPageUrls);
          return;
        }
        if (!value || typeof value !== "object") return;
        const type = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
        const pageEntity = type.includes("WebPage");
        const breadcrumbEntity = type.includes("BreadcrumbList");
        if (pageEntity) {
          if (typeof value["@id"] === "string") value["@id"] = `${canonicalUrl}#webpage`;
          if (typeof value.url === "string") value.url = canonicalUrl;
          if (typeof value.breadcrumb === "string") {
            value.breadcrumb = `${canonicalUrl}#breadcrumb`;
          } else if (pageEntity && value.breadcrumb && typeof value.breadcrumb === "object") {
            value.breadcrumb["@id"] = `${canonicalUrl}#breadcrumb`;
          }
        }
        if (breadcrumbEntity) {
          if (typeof value["@id"] === "string") value["@id"] = `${canonicalUrl}#breadcrumb`;
          if (Array.isArray(value.itemListElement)) {
            const lastItem = value.itemListElement[value.itemListElement.length - 1];
            if (lastItem?.item === currentPageUrl) lastItem.item = canonicalUrl;
            }
        }
        Object.values(value).forEach(replaceCurrentPageUrls);
      };
      replaceCurrentPageUrls(data);
      return `${open}${JSON.stringify(data, null, 2)}${close}`;
    }
  );
}

function main() {
  const candidatePath = path.join(development, "CANDIDATE-REGISTER.csv");
  const trackerPath = path.join(development, "PAGE-TRACKER.csv");
  const candidates = parseCsv(fs.readFileSync(candidatePath, "utf8"));
  const tracker = parseCsv(fs.readFileSync(trackerPath, "utf8"));
  const trackerById = new Map(tracker.map((row) => [row.id, row]));
  const occupied = new Set();
  for (const row of candidates) {
    if (row.proposed_url) occupied.add(new URL(row.proposed_url, origin).pathname.toLowerCase());
  }

  const changes = [];
  const newProposedById = new Map();
  for (const candidate of candidates) {
    const currentUrl = candidate.proposed_url;
    if (!currentUrl) throw new Error(`Missing proposed URL for ${candidate.candidate_id}`);
    const publicFile = fileForPublicUrl(`${origin}${currentUrl}`);
    if (!publicFile) {
      newProposedById.set(candidate.candidate_id, currentUrl);
      continue;
    }

    const slug = candidate.candidate_id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const proposed = `/career-resources/occupation-guides/${slug}/`;
    const lower = proposed.toLowerCase();
    if (occupied.has(lower) || fileForPublicUrl(`${origin}${proposed}`)) {
      throw new Error(`Collision-safe route is already occupied: ${proposed} (${candidate.candidate_id})`);
    }
    occupied.delete(new URL(currentUrl, origin).pathname.toLowerCase());
    occupied.add(lower);
    newProposedById.set(candidate.candidate_id, proposed);
    changes.push({
      candidate_id: candidate.candidate_id,
      old_proposed_url: currentUrl,
      new_proposed_url: proposed,
      reason: `Existing local public route retained at ${currentUrl}; staged candidate moved to a unique career-resource URL.`,
      existing_public_file: path.relative(root, publicFile).split(path.sep).join("/"),
    });
  }

  for (const candidate of candidates) {
    const trackerRow = trackerById.get(candidate.candidate_id);
    if (!trackerRow) throw new Error(`Missing tracker row for ${candidate.candidate_id}`);
    const nextUrl = newProposedById.get(candidate.candidate_id);
    candidate.proposed_url = nextUrl;
    trackerRow.proposed_url = nextUrl;

    const filePath = stagingFileForRoute(trackerRow.staging_preview_url);
    if (!fs.existsSync(filePath)) throw new Error(`Missing staged file ${filePath}`);
    const canonicalUrl = `${origin}${nextUrl}`;
    const oldCanonical = fs.readFileSync(filePath, "utf8").match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)?.[1];
    const html = setCanonical(fs.readFileSync(filePath, "utf8"), canonicalUrl);
    fs.writeFileSync(filePath, html, "utf8");
    if (oldCanonical !== canonicalUrl) {
      const existing = changes.find((row) => row.candidate_id === candidate.candidate_id);
      if (existing) {
        existing.old_canonical_url = oldCanonical ?? "";
        existing.new_canonical_url = canonicalUrl;
      } else {
        changes.push({
          candidate_id: candidate.candidate_id,
          old_proposed_url: nextUrl,
          new_proposed_url: nextUrl,
          old_canonical_url: oldCanonical ?? "",
          new_canonical_url: canonicalUrl,
          reason: "Canonical and matching page-specific structured metadata aligned to the candidate register.",
          existing_public_file: "",
        });
      }
    }
  }

  const updatedRegisterFiles = updateRelatedCsvRegisters(newProposedById);
  writeCsv(candidatePath, candidates, Object.keys(candidates[0]));
  writeCsv(trackerPath, tracker, Object.keys(tracker[0]));
  const reportPath = path.join(development, "STAGING-URL-CANONICAL-CHANGES.csv");
  if (changes.length || !fs.existsSync(reportPath)) {
    writeCsv(reportPath, changes, [
      "candidate_id",
      "old_proposed_url",
      "new_proposed_url",
      "old_canonical_url",
      "new_canonical_url",
      "reason",
      "existing_public_file",
    ]);
  }
  console.log(JSON.stringify({
    programmeCandidatesUpdated: candidates.length,
    canonicalEntriesAligned: candidates.length,
    publicCollisionsMoved: changes.filter((change) => change.existing_public_file).length,
    metadataChanges: changes.length,
    relatedRegistersUpdated: updatedRegisterFiles,
    reconciliation: reportPath,
  }, null, 2));
}

main();
