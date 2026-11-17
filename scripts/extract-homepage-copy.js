const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
const clean = (text) => text
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#x27;/g, "'")
  .replace(/&[^;]+;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const copy = [...main.matchAll(/<(h1|h2|h3|p)[^>]*>([\s\S]*?)<\/\1>/gi)]
  .map((match) => clean(match[0]))
  .filter(Boolean);

console.log(copy.join("\n"));
