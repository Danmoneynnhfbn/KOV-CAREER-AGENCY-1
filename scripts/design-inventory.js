const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "PAGE_MANIFEST.json");
const excludedDirectories = new Set([
  ".git",
  ".venv",
  "_design-reference",
  "design-reference",
  "node_modules",
]);
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
    } else if (entry.isFile() && /\.html$/i.test(entry.name)) {
      htmlFiles.push(absolutePath);
    }
  }
}

function classify(pagePath) {
  const value = pagePath.toLowerCase();

  if (value === "index.html") return { template: "home", theme: "neutomni" };
  if (value === "faq/index.html") {
    return { template: "FAQ library index", theme: "legencymedia" };
  }
  if (value.startsWith("faq/")) {
    return { template: "FAQ answer", theme: "legencymedia" };
  }
  if (value === "blog.html" || value === "blog/index.html") {
    return { template: "blog index", theme: "legencymedia" };
  }
  if (/^(blog|posts?)\/.+\.html$/.test(value)) {
    return { template: "blog post", theme: "legencymedia" };
  }
  if (/^(privacy|terms|cookies|disclaimer|legal)([-/].*)?\.html$/.test(value)) {
    return { template: "legal", theme: "legencymedia" };
  }
  if (/^(about|founder)([-/].*)?\.html$/.test(value) ||
      value === "resources/kov-founder-profile.html") {
    return { template: "about", theme: "leeholmes" };
  }
  if (/^(contact)([-/].*)?\.html$/.test(value) ||
      /^resources\/(contact|book-confidential-consultation|request-executive-career-representation)\.html$/.test(value)) {
    return { template: "contact", theme: "leeholmes" };
  }
  if (/^pricing(?:\/|\.html|$)/.test(value)) {
    return { template: "pricing", theme: "legencymedia" };
  }
  if (value === "countries-we-serve.html" || /^markets\/.+\.html$/.test(value)) {
    return { template: "country page", theme: "neutomni" };
  }
  if (/^(services|candidate-services|career-coaching|career-documents|career-portfolio-development|career-positioning-optimization|career-strategy-senior-leaders|resume-cv-writing|linkedin|interview-coaching|reverse-recruiting|executive-(resume|negotiation|career-support|job-search))/.test(value)) {
    return { template: "service", theme: "legencymedia" };
  }
  if (/^industries\/.+\.html$/.test(value)) {
    return { template: "other", theme: "neutomni" };
  }
  if (/^roles\/[^/]+\/[^/]+\.html$/.test(value)) {
    return { template: "other", theme: "krackerz" };
  }
  if (/^roles\/.+\.html$/.test(value)) {
    return { template: "other", theme: "leeholmes" };
  }
  return { template: "other", theme: "legencymedia" };
}

walk(root);

const pages = htmlFiles
  .map((absolutePath) => {
    const pagePath = path.relative(root, absolutePath).split(path.sep).join("/");
    const { template, theme } = classify(pagePath);
    return { path: pagePath, template_type: template, theme, status: "todo" };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const counts = pages.reduce((result, page) => {
  result[page.template_type] = (result[page.template_type] || 0) + 1;
  return result;
}, {});

fs.writeFileSync(output, `${JSON.stringify({ pages, template_counts: counts }, null, 2)}\n`);
console.log(`Inventoried ${pages.length} HTML pages.`);
for (const [template, count] of Object.entries(counts).sort()) {
  console.log(`${template}: ${count}`);
}
