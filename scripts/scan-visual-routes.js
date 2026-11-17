const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const origin = process.env.KOV_VISUAL_QA_ORIGIN || "http://127.0.0.1:4173";
const baselinePath = path.join(root, "development", "VISUAL-REDESIGN-BODY-BASELINE.json");
const reportPath = path.join(root, "development", "visual-qa", "visual-qa-report.json");
const viewport = {
  width: Number(process.env.KOV_VISUAL_QA_WIDTH || 1440),
  height: Number(process.env.KOV_VISUAL_QA_HEIGHT || 900),
};
const viewportSuffix = viewport.width === 390 ? "-mobile" : "-desktop";
const csvPath = path.join(root, "development", "visual-qa", `route-coverage${viewportSuffix}.csv`);
const summaryPath = path.join(root, "development", "visual-qa", `route-scan-summary${viewportSuffix}.json`);
const concurrency = 2;

function csvEscape(value) {
  const text = typeof value === "string" ? value : value == null ? "" : JSON.stringify(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function main() {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const presentationByPath = new Map(
    report.route_coverage.map((route) => [route.file_path, route])
  );
  const pending = baseline.pages.map((page, index) => ({ page, index }));
  const routeCoverage = Array(baseline.pages.length);
  const browser = await chromium.launch({ headless: true });

  try {
    const workers = Array.from({ length: concurrency }, async () => {
      const page = await browser.newPage({ viewport });
      await page.route(/fonts\.(?:googleapis|gstatic)\.com/, (route) => route.abort());
      let next;
      while ((next = pending.shift())) {
        const { page: baselinePage, index } = next;
        const presentation = presentationByPath.get(baselinePage.file_path);
        if (presentation?.presentation_scope === "excluded backend page") {
          routeCoverage[index] = {
            file_path: baselinePage.file_path,
            route: baselinePage.route,
            presentation_scope: presentation.presentation_scope,
            http_status: "",
            title: "",
            shared_stylesheet_loaded: "not applicable",
            horizontal_overflow: "not tested",
            body_overflow_y: "",
            html_overflow_y: "",
            document_width: "",
            document_height: "",
            page_error: "",
            low_contrast_text: [],
          };
          continue;
        }

        const errors = [];
        const onPageError = (error) => errors.push(error.message);
        page.on("pageerror", onPageError);
        let response;
        let measurement = {};
        let navigationError = "";
        try {
          response = await page.goto(new URL(baselinePage.route, origin).href, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          await page.waitForFunction(
            () => Boolean(document.querySelector('link[data-kov-visual-refresh], link[href*="kov-visual-refresh.css"]')?.sheet),
            null,
            { timeout: 15000 }
          );
          measurement = await page.evaluate(() => {
            const bodyStyle = getComputedStyle(document.body);
            const htmlStyle = getComputedStyle(document.documentElement);
            const stylesheet = document.querySelector(
              'link[data-kov-visual-refresh], link[href*="kov-visual-refresh.css"]'
            );
            return {
              title: document.title,
              stylesheetLoaded: Boolean(stylesheet?.sheet),
              documentWidth: document.documentElement.scrollWidth,
              documentHeight: document.documentElement.scrollHeight,
              bodyOverflowY: bodyStyle.overflowY,
              htmlOverflowY: htmlStyle.overflowY,
              lowContrastText: (() => {
                const parseColor = (value) => {
                  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                  return match
                    ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])]
                    : null;
                };
                const blend = (foreground, background) => foreground.map(
                  (channel, index) => channel * foreground[3] + background[index] * (1 - foreground[3])
                ).slice(0, 3);
                const luminance = (color) => {
                  const [red, green, blue] = color.map((channel) => {
                    const value = channel / 255;
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                  });
                  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                };
                const contrast = (first, second) => {
                  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
                  return (values[0] + 0.05) / (values[1] + 0.05);
                };
                const candidates = [
                  ...document.querySelectorAll(
                    "main :is(h1, h2, h3, h4, p, li, a, button, summary, blockquote, label), " +
                    "footer :is(h1, h2, h3, h4, p, li, a, button, summary, label)"
                  ),
                ];
                const failures = [];
                for (const element of candidates) {
                  const text = element.innerText.trim().replace(/\s+/g, " ");
                  const rect = element.getBoundingClientRect();
                  if (!text || rect.width < 1 || rect.height < 1 || element.closest('[aria-hidden="true"]')) continue;
                  const foreground = parseColor(getComputedStyle(element).color);
                  if (!foreground || foreground[3] < 0.9) continue;

                  const backgrounds = [];
                  let backgroundImage = false;
                  for (let ancestor = element; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
                    const style = getComputedStyle(ancestor);
                    if (style.backgroundImage !== "none") {
                      backgroundImage = true;
                      break;
                    }
                    const color = parseColor(style.backgroundColor);
                    if (color && color[3] > 0) {
                      backgrounds.push(color);
                      if (color[3] >= 0.98) break;
                    }
                    if (Number(style.opacity) < 0.5) {
                      backgroundImage = true;
                      break;
                    }
                  }
                  if (backgroundImage) continue;

                  let background = [255, 255, 255];
                  for (let index = backgrounds.length - 1; index >= 0; index -= 1) {
                    background = blend(backgrounds[index], background);
                  }
                  const foregroundRgb = blend(foreground, background);
                  const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
                  const fontWeight = Number.parseInt(getComputedStyle(element).fontWeight, 10) || 400;
                  const minimum = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
                  const ratio = contrast(foregroundRgb, background);
                  if (ratio < minimum) {
                    failures.push({
                      text: text.slice(0, 90),
                      tag: element.tagName.toLowerCase(),
                      foreground: getComputedStyle(element).color,
                      background: `rgb(${background.map(Math.round).join(", ")})`,
                      contrast: Number(ratio.toFixed(2)),
                      minimum,
                    });
                    if (failures.length >= 5) break;
                  }
                }
                return failures;
              })(),
            };
          });
        } catch (error) {
          navigationError = error.message;
        } finally {
          page.off("pageerror", onPageError);
        }

        routeCoverage[index] = {
          file_path: baselinePage.file_path,
          route: baselinePage.route,
          presentation_scope: "shared visual layer",
          http_status: response?.status() ?? "",
          title: measurement.title ?? "",
          shared_stylesheet_loaded: measurement.stylesheetLoaded ? "yes" : "no",
          horizontal_overflow:
            typeof measurement.documentWidth === "number"
              ? measurement.documentWidth > viewport.width
                ? "yes"
                : "no"
              : "not tested",
          body_overflow_y: measurement.bodyOverflowY ?? "",
          html_overflow_y: measurement.htmlOverflowY ?? "",
          document_width: measurement.documentWidth ?? "",
          document_height: measurement.documentHeight ?? "",
          page_error: [...errors, navigationError].filter(Boolean).join(" | "),
          low_contrast_text: measurement.lowContrastText ?? [],
        };
      }
      await page.close();
    });

    await Promise.all(workers);
  } finally {
    await browser.close();
  }

  const fields = [
    "file_path",
    "route",
    "presentation_scope",
    "http_status",
    "title",
    "shared_stylesheet_loaded",
    "horizontal_overflow",
    "body_overflow_y",
    "html_overflow_y",
    "document_width",
    "document_height",
    "page_error",
    "low_contrast_text",
  ];
  const csv = [
    fields.join(","),
    ...routeCoverage.map((row) => fields.map((field) => csvEscape(row[field])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(csvPath, `${csv}\r\n`, "utf8");

  const eligible = routeCoverage.filter((row) => row.presentation_scope === "shared visual layer");
  const summary = {
    generated_at: new Date().toISOString(),
    origin,
    viewport,
    baseline_routes: routeCoverage.length,
    eligible_routes: eligible.length,
    intentionally_excluded_backend_routes: routeCoverage.length - eligible.length,
    routes_http_200: eligible.filter((row) => row.http_status === 200).length,
    routes_with_stylesheet_loaded: eligible.filter((row) => row.shared_stylesheet_loaded === "yes").length,
    horizontal_overflow_routes: eligible.filter((row) => row.horizontal_overflow === "yes").map((row) => row.route),
    vertical_clipping_routes: eligible.filter(
      (row) => row.body_overflow_y === "hidden" || row.html_overflow_y === "hidden"
    ).map((row) => row.route),
    routes_with_page_errors: eligible
      .filter((row) => row.page_error)
      .map((row) => ({ route: row.route, error: row.page_error })),
    routes_with_low_contrast_text: eligible
      .filter((row) => row.low_contrast_text.length)
      .map((row) => ({ route: row.route, elements: row.low_contrast_text })),
    routes_not_loaded: eligible
      .filter((row) => row.http_status !== 200 || row.shared_stylesheet_loaded !== "yes")
      .map((row) => ({ route: row.route, status: row.http_status, stylesheet: row.shared_stylesheet_loaded })),
    route_coverage_csv: path.relative(root, csvPath),
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  report.route_visual_scan = summary;
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    baseline_routes: summary.baseline_routes,
    eligible_routes: summary.eligible_routes,
    intentionally_excluded_backend_routes: summary.intentionally_excluded_backend_routes,
    routes_http_200: summary.routes_http_200,
    routes_with_stylesheet_loaded: summary.routes_with_stylesheet_loaded,
    horizontal_overflow_routes: summary.horizontal_overflow_routes.length,
    vertical_clipping_routes: summary.vertical_clipping_routes.length,
    routes_with_page_errors: summary.routes_with_page_errors.length,
    routes_with_low_contrast_text: summary.routes_with_low_contrast_text.length,
    route_coverage_csv: summary.route_coverage_csv,
  }, null, 2));
  if (
    summary.routes_http_200 !== summary.eligible_routes ||
    summary.routes_with_stylesheet_loaded !== summary.eligible_routes ||
    summary.horizontal_overflow_routes.length ||
    summary.vertical_clipping_routes.length ||
    summary.routes_with_page_errors.length
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
