const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const matches = await page.evaluate(() => [...document.querySelectorAll('[id="faq"]')].map((element) => ({
    tag: element.tagName,
    className: element.className,
    parentTag: element.parentElement?.tagName,
    parentClass: element.parentElement?.className,
  })));
  console.log(JSON.stringify(matches, null, 2));
  await browser.close();
})();
