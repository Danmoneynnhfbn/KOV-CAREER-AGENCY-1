const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'assets', 'faq-directory.js');
const TARGET = 500;
const EXCLUDED_DIRECTORIES = new Set(['node_modules', '.git', '.venv', '_design-reference', 'design-reference', 'staging', 'faq']);
const PREFERRED_PAGES = [
  'faqs.html',
  'candidate-services.html',
  'services.html',
  'how-it-works.html',
  'pricing.html',
  'about.html',
  'why-kov.html',
  'contact.html',
  'countries-we-serve.html',
];

function decodeHtml(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, value) => {
      const codePoint = value[0].toLowerCase() === 'x'
        ? Number.parseInt(value.slice(1), 16)
        : Number.parseInt(value, 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : '';
    });
}

function toText(value) {
  return decodeHtml(value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

async function findHtmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function pageCategory(relativePath) {
  const segments = relativePath.split(path.sep);
  const file = path.basename(relativePath, '.html');
  if (segments[0] === 'industries') return `Industry: ${segments[1] || file}`;
  if (segments[0] === 'roles') return `Role: ${segments[1] || file}`;
  if (segments[0] === 'markets') return `Market: ${file}`;
  if (segments[0] === 'services') return `Service: ${segments[1] || file}`;
  return file.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isTemplatedQuestion(question) {
  return /^(what should i know about|what should i know when|what is the role of|what is the importance of)\b/i.test(question);
}

async function extractFromFile(file) {
  const html = await fs.readFile(file, 'utf8');
  const relativePath = path.relative(ROOT, file).split(path.sep).join('/');
  const records = [];
  const detailsPattern = /<details\b[^>]*>([\s\S]*?)<\/details\s*>/gi;
  let match;
  while ((match = detailsPattern.exec(html))) {
    const summary = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary\s*>/i);
    if (!summary) continue;
    const question = toText(summary[1]);
    const answer = toText(match[1].slice(summary.index + summary[0].length));
    if (question.length < 15 || answer.length < 80 || isTemplatedQuestion(question)) continue;
    records.push({
      category: pageCategory(relativePath),
      question,
      answer,
      source: `/${relativePath}`,
    });
  }
  return records;
}

async function main() {
  const files = await findHtmlFiles(ROOT);
  const priority = new Map(PREFERRED_PAGES.map((file, index) => [file, index]));
  files.sort((left, right) => {
    const leftRelative = path.relative(ROOT, left).split(path.sep).join('/');
    const rightRelative = path.relative(ROOT, right).split(path.sep).join('/');
    const leftPriority = priority.has(leftRelative) ? priority.get(leftRelative) : PREFERRED_PAGES.length;
    const rightPriority = priority.has(rightRelative) ? priority.get(rightRelative) : PREFERRED_PAGES.length;
    return leftPriority - rightPriority || leftRelative.localeCompare(rightRelative);
  });

  const questions = new Set();
  const records = [];
  for (const file of files) {
    for (const record of await extractFromFile(file)) {
      const normalizedQuestion = record.question.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ');
      if (questions.has(normalizedQuestion)) continue;
      questions.add(normalizedQuestion);
      records.push(record);
      if (records.length === TARGET) break;
    }
    if (records.length === TARGET) break;
  }

  if (records.length !== TARGET) {
    throw new Error(`Expected ${TARGET} complete, unique visible FAQ records; found ${records.length}.`);
  }

  const moduleSource = `(function () {\n  const faqDirectory = ${JSON.stringify(records)};\n  if (typeof window !== 'undefined') window.kovFaqDirectory = faqDirectory;\n  if (typeof module !== 'undefined' && module.exports) module.exports = { faqDirectory };\n})();\n`;
  await fs.writeFile(OUTPUT, moduleSource, 'utf8');
  console.log(`Generated ${records.length} unique FAQs from visible website content across ${new Set(records.map((record) => record.source)).size} pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
