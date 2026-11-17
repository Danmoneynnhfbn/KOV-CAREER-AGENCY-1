const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const origin = process.env.KOV_VISUAL_QA_ORIGIN || "http://127.0.0.1:4173";
const baselinePath = path.join(root, "development", "VISUAL-REDESIGN-BODY-BASELINE.json");
const outputDirectory = path.join(root, "development", "visual-qa");
const screenshotsDirectory = path.join(outputDirectory, "screenshots");
const viewportSizes = [
  { name: "desktop", width: 1440, height: 1000, screenshot: true },
  { name: "wide", width: 1920, height: 1080 },
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "tablet", width: 768, height: 1024, screenshot: true },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "mobile", width: 390, height: 844, screenshot: true },
  { name: "mobile-360", width: 360, height: 800 },
];
const representatives = [
  { family: "Homepage", route: "/index.html" },
  { family: "Service", route: "/candidate-services.html" },
  { family: "Executive role", route: "/roles/ceo/index.html" },
  { family: "Industry", route: "/industries/finance-insurance/index.html" },
  { family: "International market", route: "/markets/executive-job-search-dubai.html" },
  { family: "Career resource", route: "/resources/case-studies.html" },
  { family: "FAQ", route: "/faqs.html" },
  { family: "About", route: "/about.html" },
  { family: "Contact", route: "/contact.html" },
  { family: "Career resources hub", route: "/staging/career-resources/index.html" },
  { family: "Research hub", route: "/staging/research/index.html" },
  { family: "Professional directory", route: "/staging/professional-directory/index.html" },
  { family: "Programme page", route: "/career-resources/board-guide-01/index.html" },
];

function existsInRoot(relativePath) {
  const resolved = path.resolve(root, `.${relativePath}`);
  return resolved.startsWith(`${root}${path.sep}`) && fs.existsSync(resolved);
}

function relativePathForRoute(route) {
  const pathname = new URL(route, origin).pathname;
  return pathname.replace(/^\/+/, "") || "index.html";
}

async function main() {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  fs.mkdirSync(screenshotsDirectory, { recursive: true });

  const routeCoverage = baseline.pages.map((page) => {
    const filePath = path.join(root, page.file_path);
    const source = fs.readFileSync(filePath, "utf8");
    const head = source.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? "";
    const bodyTag = source.match(/<body\b[^>]*>/i)?.[0] ?? "";
    const bodyClass = bodyTag.match(/\bclass=["']([^"']*)["']/i)?.[1] ?? "";
    const hasSharedStylesheet =
      /<link\b(?=[^>]*\bdata-kov-visual-refresh\b)(?=[^>]*\bhref=["']\/assets\/kov-visual-refresh\.css["'])[^>]*>/i.test(
        head
      ) || /<link\b[^>]*\bhref=["'][^"']*assets\/kov-visual-refresh\.css["'][^>]*>/i.test(head);
    return {
      file_path: page.file_path,
      route: page.route,
      shared_stylesheet: hasSharedStylesheet ? "yes" : "no",
      presentation_scope: /\bbackend-page\b/.test(bodyClass) ? "excluded backend page" : "shared visual layer",
    };
  });
  const missingStylesheets = routeCoverage.filter((page) => page.shared_stylesheet !== "yes");
  assert.deepEqual(
    missingStylesheets,
    [],
    `Routes missing the shared visual layer: ${JSON.stringify(missingStylesheets.slice(0, 20))}`
  );

  for (const page of representatives) {
    assert.ok(existsInRoot(page.route), `Representative route does not exist: ${page.route}`);
  }

  const browser = await chromium.launch({ headless: true });
  const measurements = [];
  const pageErrors = [];
  try {
    const page = await browser.newPage();
    await page.route(/fonts\.(?:googleapis|gstatic)\.com/, (route) => route.abort());
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const representative of representatives) {
      for (const viewport of viewportSizes) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const response = await page.goto(new URL(representative.route, origin).href, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await page.waitForTimeout(300);
        const measurement = await page.evaluate(() => {
          const main = document.querySelector("main");
          const heading = main?.querySelector("h1, h2");
          const styleLink = document.querySelector('link[data-kov-visual-refresh], link[href*="kov-visual-refresh.css"]');
          const bodyStyle = getComputedStyle(document.body);
          const headingStyle = heading ? getComputedStyle(heading) : null;
          const footer = document.querySelector("footer");
          const footerStyle = footer ? getComputedStyle(footer) : null;
          const primaryAction = main?.querySelector(
            '.kov-button, .ceo-button-primary, .hero-interlink:not(.hero-interlink-outline), a[class*="bg-orange"]'
          );
          const actionStyle = primaryAction ? getComputedStyle(primaryAction) : null;
          const formSubmit = main?.querySelector(
            'form button:not([type]), form button[type="submit"], form input[type="submit"]'
          );
          const formSubmitStyle = formSubmit ? getComputedStyle(formSubmit) : null;
          const footerSubmit = document.querySelector(
            'footer form button:not([type]), footer form button[type="submit"], footer input[type="submit"]'
          );
          const footerSubmitStyle = footerSubmit ? getComputedStyle(footerSubmit) : null;
          const darkSurfaceCount = [...document.querySelectorAll("body *")].filter((element) => {
            if (element.closest(
              'footer, [class~="bg-ink"], [class~="bg-navy"], [class*="kov-section-dark"], [class*="kov-motion-band"], .ceo-stat'
            )) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const color = style.backgroundColor.match(
              /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/
            );
            const darkImageColor = [...style.backgroundImage.matchAll(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g
            )].some((match) =>
              (match[4] === undefined || Number(match[4]) > 0.85) &&
              Math.max(Number(match[1]), Number(match[2]), Number(match[3])) < 96
            );
            return rect.width * rect.height > 20000 && (
              darkImageColor ||
              (color && (color[4] === undefined || Number(color[4]) > 0.9) &&
                Math.max(Number(color[1]), Number(color[2]), Number(color[3])) < 96)
            );
          }).length;
          return {
            title: document.title,
            heading: heading?.innerText.trim() ?? "",
            stylesheetLoaded: Boolean(styleLink?.sheet),
            bodyBackground: bodyStyle.backgroundColor,
            headingColor: headingStyle?.color ?? "",
            primaryActionBackground: actionStyle?.backgroundColor ?? "",
            primaryActionBackgroundImage: actionStyle?.backgroundImage ?? "",
            formSubmitBackground: formSubmitStyle?.backgroundColor ?? "",
            formSubmitBackgroundImage: formSubmitStyle?.backgroundImage ?? "",
            footerSubmitBackground: footerSubmitStyle?.backgroundColor ?? "",
            footerBackground: footerStyle?.backgroundColor ?? "",
            darkSurfaceCount,
            documentWidth: document.documentElement.scrollWidth,
            documentHeight: document.documentElement.scrollHeight,
            mainHeight: main?.scrollHeight ?? 0,
            bodyOverflowY: bodyStyle.overflowY,
            htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
          };
        });
        const row = {
          family: representative.family,
          route: representative.route,
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          http_status: response?.status() ?? 0,
          ...measurement,
          horizontal_overflow: measurement.documentWidth > viewport.width,
          page_errors: [...pageErrors],
          screenshot: "",
        };
        pageErrors.length = 0;

        assert.equal(row.http_status, 200, `${representative.route} did not return HTTP 200`);
        assert.equal(row.stylesheetLoaded, true, `${representative.route} did not load the visual stylesheet`);
        assert.ok(row.heading, `${representative.route} has no visible page heading`);
        assert.equal(row.bodyBackground, "rgb(255, 255, 255)", `${representative.route} body is not white`);
        const headingRgb = row.headingColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        assert.ok(
          headingRgb &&
            Number(headingRgb[1]) <= 16 &&
            Number(headingRgb[2]) <= 65 &&
            Number(headingRgb[3]) >= 90,
          `${representative.route} heading is not navy`
        );
        if (row.footerBackground) {
          assert.equal(row.footerBackground, "rgb(6, 29, 67)", `${representative.route} footer is not navy`);
        }
        if (viewport.screenshot) {
          await page.evaluate(() => {
            document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
              image.loading = "eager";
            });
          });
          await page.waitForTimeout(800);
          const screenshotName = `${representative.family
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${viewport.name}.jpg`;
          const screenshotPath = path.join(screenshotsDirectory, screenshotName);
          await page.screenshot({ path: screenshotPath, type: "jpeg", quality: 82, fullPage: true });
          row.screenshot = path.relative(root, screenshotPath);
          row.screenshot_unloaded_images = await page.evaluate(
            () => [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length
          );
        }
        measurements.push(row);
      }
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(new URL("/index.html", origin).href, { waitUntil: "domcontentloaded" });
    await page.locator(".site-search-trigger").first().click();
    await page.locator("#site-search-input").fill("how it works");
    const howItWorksResult = page.locator('.site-search-result-link[href*="how-it-works.html"]').first();
    await howItWorksResult.waitFor({ state: "visible", timeout: 5000 });
    const searchResultHref = await howItWorksResult.getAttribute("href");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(new URL("/index.html", origin).href, { waitUntil: "domcontentloaded" });
    const darkModeCheck = await page.evaluate(() => {
      const hero = document.querySelector("main > section:first-child");
      const heading = hero?.querySelector("h1");
      const footer = document.querySelector("footer");
      return {
        body_background: getComputedStyle(document.body).backgroundColor,
        header_background: getComputedStyle(document.querySelector("header")).backgroundColor,
        hero_background: hero ? getComputedStyle(hero).backgroundColor : "",
        heading_color: heading ? getComputedStyle(heading).color : "",
        footer_background: footer ? getComputedStyle(footer).backgroundColor : "",
      };
    });
    assert.equal(darkModeCheck.body_background, "rgb(6, 29, 67)", "Dark-mode page background is not navy");
    assert.equal(darkModeCheck.header_background, "rgb(4, 21, 47)", "Dark-mode header is not navy");
    assert.equal(darkModeCheck.hero_background, "rgb(6, 29, 67)", "Dark-mode hero is not navy");
    assert.equal(darkModeCheck.heading_color, "rgb(244, 248, 255)", "Dark-mode hero heading lacks contrast");
    assert.equal(darkModeCheck.footer_background, "rgb(4, 21, 47)", "Dark-mode footer is not navy");

    const visualFailures = measurements.filter((row) => row.horizontal_overflow);
    const contactFormSubmit = measurements.find(
      (row) => row.route === "/contact.html" && row.viewport === "desktop"
    );
    assert.equal(
      contactFormSubmit?.formSubmitBackground,
      "rgb(255, 114, 0)",
      "Contact form submit button does not use the orange accent"
    );
    assert.equal(
      contactFormSubmit?.formSubmitBackgroundImage,
      "none",
      "Contact form submit button has an image covering the orange accent"
    );
    const contactFooterSubmit = measurements.find(
      (row) => row.route === "/contact.html" && row.viewport === "desktop"
    );
    assert.equal(
      contactFooterSubmit?.footerSubmitBackground,
      "rgb(255, 114, 0)",
      "Contact page footer submit button does not use the orange accent"
    );
    assert.equal(
      measurements.reduce((total, row) => total + row.darkSurfaceCount, 0),
      0,
      `A page family still has a dark background surface contrary to the architecture reference: ${JSON.stringify(
        measurements.filter((row) => row.darkSurfaceCount).map(({ route, viewport, darkSurfaceCount }) => ({
          route,
          viewport,
          darkSurfaceCount,
        }))
      )}`
    );
    const report = {
      generated_at: new Date().toISOString(),
      origin,
      baseline_routes: baseline.pages.length,
      routes_with_shared_stylesheet: routeCoverage.length - missingStylesheets.length,
      eligible_visual_routes: routeCoverage.filter(
        (page) => page.presentation_scope === "shared visual layer"
      ).length,
      intentionally_excluded_backend_routes: routeCoverage
        .filter((page) => page.presentation_scope === "excluded backend page")
        .map((page) => page.route),
      route_coverage: routeCoverage,
      representative_routes: representatives,
      viewport_checks: measurements,
      search_check: {
        query: "how it works",
        result_href: searchResultHref,
        passed: Boolean(searchResultHref?.includes("how-it-works.html")),
      },
      dark_mode_check: darkModeCheck,
      summary: {
        representative_routes: representatives.length,
        eligible_visual_routes: routeCoverage.filter(
          (page) => page.presentation_scope === "shared visual layer"
        ).length,
        intentionally_excluded_backend_routes: routeCoverage.filter(
          (page) => page.presentation_scope === "excluded backend page"
        ).length,
        viewport_checks: measurements.length,
        screenshots: measurements.filter((row) => row.screenshot).length,
        overflow_failures: visualFailures.length,
        javascript_errors: measurements.reduce((total, row) => total + row.page_errors.length, 0),
        natural_page_height_verified: measurements.every(
          (row) => row.bodyOverflowY !== "hidden" && row.htmlOverflowY !== "hidden"
        ),
      },
    };
    fs.writeFileSync(
      path.join(outputDirectory, "visual-qa-report.json"),
      `${JSON.stringify(report, null, 2)}\n`,
      "utf8"
    );

    assert.equal(report.search_check.passed, true, "Search did not return how-it-works.html");
    assert.equal(visualFailures.length, 0, `Horizontal overflow found: ${JSON.stringify(visualFailures)}`);
    const javascriptErrors = measurements.filter((row) => row.page_errors.length > 0);
    assert.equal(
      report.summary.javascript_errors,
      0,
      `Browser JavaScript errors: ${JSON.stringify(javascriptErrors.map((row) => ({
        route: row.route,
        errors: row.page_errors,
      })))}`
    );
    assert.equal(report.summary.natural_page_height_verified, true, "A document hides vertical page overflow");
    console.log(JSON.stringify(report.summary, null, 2));
    console.log(`Report: ${path.relative(root, path.join(outputDirectory, "visual-qa-report.json"))}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
