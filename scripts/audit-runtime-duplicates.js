const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const origin = "http://127.0.0.1:4173";
const baseline = JSON.parse(fs.readFileSync(path.join(root, "development/VISUAL-REDESIGN-BODY-BASELINE.json"), "utf8"));
const pages = baseline.pages;
const concurrency = 8;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const issues = [];
  let nextIndex = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    const browserPage = await browser.newPage();
    try {
      while (nextIndex < pages.length) {
        const page = pages[nextIndex++];
        let response;
        try {
          response = await browserPage.goto(new URL(page.route, origin).href, { waitUntil: "domcontentloaded", timeout: 30000 });
          await browserPage.waitForTimeout(150);
          const counts = await browserPage.evaluate(() => ({
            headers: document.querySelectorAll("header").length,
            mains: document.querySelectorAll("main").length,
            footers: document.querySelectorAll("footer").length,
            kovHeaders: document.querySelectorAll("[data-kov-react-header-mounted='true']").length,
            kovHomeRoots: document.querySelectorAll("#kov-reference-home-root").length,
            legacyHomeDisclosures: document.querySelectorAll(".kov-reference-home__more").length,
            duplicateIds: [...new Set([...document.querySelectorAll("[id]")]
              .map((element) => element.id)
              .filter((id, index, ids) => ids.indexOf(id) !== index))],
          }));
          if (response?.status() !== 200 ||
              counts.headers > 1 || counts.mains > 1 || counts.footers > 1 ||
              counts.kovHeaders > 1 || counts.kovHomeRoots > 1 ||
              counts.legacyHomeDisclosures > 0 || counts.duplicateIds.length) {
            issues.push({ route: page.route, status: response?.status(), ...counts });
          }
        } catch (error) {
          issues.push({ route: page.route, status: response?.status() ?? "error", error: error.message });
        }
      }
    } finally {
      await browserPage.close();
    }
  });
  await Promise.all(workers);
  await browser.close();
  console.log(JSON.stringify({
    routesChecked: pages.length,
    routesWithRuntimeDuplicatesOrErrors: issues.length,
    issues: issues.slice(0, 100),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
