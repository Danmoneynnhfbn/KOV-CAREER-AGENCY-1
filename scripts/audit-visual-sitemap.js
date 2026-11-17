const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const origin = process.env.KOV_VISUAL_QA_ORIGIN || "http://127.0.0.1:4173";
const outputDirectory = path.join(root, "development", "visual-qa", "sitewide-2026-11-09");
const screenshotsDirectory = path.join(outputDirectory, "screenshots");
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const schemes = ["light", "dark"];
const screenshotRoutes = new Set([
  "/",
  "/candidate-services.html",
  "/roles/ceo/",
  "/industries/finance-insurance/",
  "/markets/executive-job-search-dubai.html",
  "/resources/case-studies.html",
  "/faqs.html",
  "/blog.html",
  "/about.html",
  "/contact.html",
]);
const concurrency = 2;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

function csvEscape(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sitemapRoutes() {
  const xml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => new URL(match[1].trim()).pathname)
    .filter((route, index, routes) => routes.indexOf(route) === index);
}

function pageFamily(route) {
  if (route === "/") return "Homepage";
  if (route === "/contact.html") return "Contact";
  if (route === "/about.html") return "About";
  if (/^\/industries\//.test(route)) return "Industry";
  if (/^\/markets\//.test(route)) return "Geography and markets";
  if (/^\/roles\//.test(route)) return "Roles";
  if (/^\/(?:career-resources|resources|faq)\//.test(route)) return "Resources and FAQs";
  if (/^\/(?:blog|blog-posts?)(?:\/|\.html)/.test(route)) return "Blog";
  if (/^\/(?:staging|account|profiles|toba)(?:\/|\.html|$)/.test(route)) return "Restricted or staging";
  return "Services and site pages";
}

function localFileForRoute(route) {
  let pathname;
  try {
    pathname = decodeURIComponent(route);
  } catch {
    return null;
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidates = [relative];
  if (pathname.endsWith("/")) candidates.push(path.join(relative, "index.html"));
  else if (!path.extname(relative)) {
    candidates.push(`${relative}.html`, path.join(relative, "index.html"));
  }
  for (const candidate of candidates) {
    const absolute = path.resolve(root, candidate);
    if (absolute.startsWith(`${root}${path.sep}`) && fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
      return path.relative(root, absolute).split(path.sep).join("/");
    }
  }
  return null;
}

async function startLocalPreviewServer() {
  const previewUrl = new URL(origin);
  if (previewUrl.hostname !== "127.0.0.1" || previewUrl.port !== "4173") return null;
  const server = http.createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, origin).pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }
    const target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const candidates = [target];
    if (pathname === "/") candidates.unshift(path.join(root, "index.html"));
    if (!path.extname(target)) candidates.push(`${target}.html`, path.join(target, "index.html"));
    const file = candidates.find((candidate) =>
      fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    );
    if (!file) {
      response.writeHead(404).end("Not Found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    const stream = fs.createReadStream(file);
    stream.on("error", (error) => {
      console.error(`Preview server failed to read ${file}: ${error.message}`);
      response.destroy(error);
    });
    stream.pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(Number(previewUrl.port), previewUrl.hostname, resolve);
  });
  console.log(`Local preview server listening on ${origin}`);
  return server;
}

async function saveFullPageScreenshot(page, screenshotPath) {
  const session = await page.context().newCDPSession(page);
  try {
    const metrics = await session.send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize || metrics.contentSize || {};
    const fallbackSize = await page.evaluate(() => ({
      width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0, window.innerWidth),
      height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0, window.innerHeight),
    }));
    const width = Math.ceil(size.width > 0 ? size.width : fallbackSize.width);
    const height = Math.ceil(size.height > 0 ? size.height : fallbackSize.height);
    if (width < 1 || height < 1) {
      throw new Error(`Screenshot dimensions are invalid (${width}x${height})`);
    }
    const screenshot = await session.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
  } finally {
    await session.detach();
  }
}

async function inspectPage(page, route, viewport, scheme, navigate, previousStatus = null) {
  const errors = [];
  const failedLocalRequests = [];
  const onPageError = (error) => errors.push(error.message);
  const onRequestFailed = (request) => {
    try {
      if (new URL(request.url()).origin === origin) {
        failedLocalRequests.push(new URL(request.url()).pathname);
      }
    } catch {
      failedLocalRequests.push(request.url());
    }
  };
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.emulateMedia({ colorScheme: scheme });

  let responseStatus = previousStatus;
  let navigationError = "";
  let measurement = {};
  const started = Date.now();
  try {
    if (navigate) {
      const response = await page.goto(new URL(route, origin).href, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      responseStatus = response?.status() ?? null;
      await page.waitForFunction(
        () => Boolean(document.querySelector('link[data-kov-visual-refresh], link[href*="kov-visual-refresh.css"]')?.sheet),
        null,
        { timeout: 8000 },
      );
      await page.waitForTimeout(80);
      await page.evaluate(async () => {
        const localImages = [...document.images].filter((image) => {
          try {
            return new URL(image.currentSrc || image.src).origin === location.origin;
          } catch {
            return false;
          }
        });
        for (const image of localImages) image.loading = "eager";
        await Promise.all(localImages.map(async (image) => {
          if (image.complete) return;
          await Promise.race([
            new Promise((resolve) => image.addEventListener("load", resolve, { once: true })),
            new Promise((resolve) => image.addEventListener("error", resolve, { once: true })),
            new Promise((resolve) => setTimeout(resolve, 1500)),
          ]);
        }));
      });
    } else {
      await page.waitForTimeout(80);
    }
    measurement = await page.evaluate(() => {
      const colorContext = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const parsedColors = new Map();
      const parseColor = (value) => {
        if (parsedColors.has(value)) return parsedColors.get(value);
        const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        const parsed = match
          ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])]
          : null;
        if (parsed) {
          parsedColors.set(value, parsed);
          return parsed;
        }
        if (!colorContext) return null;
        colorContext.clearRect(0, 0, 1, 1);
        colorContext.fillStyle = value;
        colorContext.fillRect(0, 0, 1, 1);
        const [red, green, blue, alpha] = colorContext.getImageData(0, 0, 1, 1).data;
        const converted = [red, green, blue, alpha / 255];
        parsedColors.set(value, converted);
        return converted;
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
      const textFailures = [];
      const candidates = document.querySelectorAll(
        "main :is(h1,h2,h3,h4,h5,h6,p,li,a,button,summary,blockquote,label), " +
        "footer :is(h1,h2,h3,h4,h5,h6,p,li,a,button,summary,label)"
      );
      for (const element of candidates) {
        const text = element.innerText.trim().replace(/\s+/g, " ");
        const rect = element.getBoundingClientRect();
        if (!text || rect.width < 1 || rect.height < 1 || element.closest('[aria-hidden="true"]')) continue;
        const style = getComputedStyle(element);
        const foreground = parseColor(style.color);
        if (!foreground) continue;
        let background = [255, 255, 255];
        let unknownBackground = false;
        for (let ancestor = element; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
          const ancestorStyle = getComputedStyle(ancestor);
          if (ancestorStyle.backgroundImage !== "none" && ancestorStyle.backgroundImage.includes("gradient")) {
            unknownBackground = true;
            break;
          }
          const color = parseColor(ancestorStyle.backgroundColor);
          if (color && color[3] > 0) {
            background = blend(color, background);
            if (color[3] >= 0.98) break;
          }
        }
        if (unknownBackground) continue;
        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
        const minimum = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
        const ratio = contrast(blend(foreground, background), background);
        if (ratio < minimum) {
          textFailures.push({
            text: text.slice(0, 100),
            tag: element.tagName.toLowerCase(),
            contrast: Number(ratio.toFixed(2)),
            minimum,
          });
        }
      }
      const width = document.documentElement.scrollWidth;
      const viewportWidth = document.documentElement.clientWidth;
      const outside = [...document.querySelectorAll("body *")].filter((element) => {
        if (element.closest('[aria-hidden="true"], [data-overflow-expected="true"]')) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 &&
          (rect.right > viewportWidth + 2 || rect.left < -2) &&
          getComputedStyle(element).position !== "fixed";
      }).slice(0, 8).map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className.slice(0, 100) : "",
        right: Math.round(element.getBoundingClientRect().right),
      }));
      const localImages = [...document.images].filter((image) => {
        try {
          return new URL(image.currentSrc || image.src).origin === location.origin;
        } catch {
          return false;
        }
      });
      const brokenImages = localImages.filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      const hiddenOverflow = [document.documentElement, document.body].some((element) =>
        getComputedStyle(element).overflowY === "hidden"
      );
      return {
        title: document.title,
        sharedStylesheetLoaded: Boolean(document.querySelector(
          'link[data-kov-visual-refresh], link[href*="kov-visual-refresh.css"]'
        )?.sheet),
        documentWidth: width,
        viewportWidth,
        documentHeight: document.documentElement.scrollHeight,
        horizontalOverflow: width > viewportWidth + 1,
        offscreenElements: outside,
        hiddenVerticalOverflow: hiddenOverflow,
        imageCount: localImages.length,
        brokenImages,
        lowContrastText: textFailures,
        fonts: [...new Set([...document.querySelectorAll("main h1, main h2, main p")].slice(0, 30)
          .map((element) => getComputedStyle(element).fontFamily))],
      };
    });
  } catch (error) {
    navigationError = error.message;
  }
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  const result = {
    route,
    viewport: viewport.name,
    colorScheme: scheme,
    status: responseStatus,
    elapsedMs: Date.now() - started,
    navigationError,
    pageErrors: errors,
    failedLocalRequests: [...new Set(failedLocalRequests)],
    ...measurement,
  };
  return result;
}

async function runAudit(browser, routes) {
  const findings = [];
  let nextRouteIndex = 0;
  let completedRoutes = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    const page = await browser.newPage();
    await page.route("**/*", (route) => {
      const requestUrl = route.request().url();
      let local = false;
      try {
        local = new URL(requestUrl).origin === origin;
      } catch {
        local = false;
      }
      if (!local || route.request().resourceType() === "font") return route.abort();
      return route.continue();
    });
    while (nextRouteIndex < routes.length) {
      const route = routes[nextRouteIndex++];
      let needsNavigation = true;
      let routeStatus = null;
      for (const viewport of viewports) {
        const light = await inspectPage(page, route, viewport, "light", needsNavigation, routeStatus);
        if (needsNavigation) routeStatus = light.status;
        needsNavigation = false;
        if (screenshotRoutes.has(route)) {
          const name = route === "/"
            ? "homepage"
            : route.replace(/^\/|\/$/g, "").replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-");
          const screenshotPath = path.join(screenshotsDirectory, `${name}-${viewport.name}.png`);
          try {
            await saveFullPageScreenshot(page, screenshotPath);
            light.screenshot = path.relative(root, screenshotPath).split(path.sep).join("/");
          } catch (error) {
            light.screenshotError = error.message;
            console.error(`Screenshot failed for ${route} (${viewport.name}/light): ${error.message}`);
          }
        }
        findings.push(light);

        const dark = await inspectPage(page, route, viewport, "dark", false, light.status);
        if (screenshotRoutes.has(route) && viewport.name === "mobile") {
          const name = route === "/"
            ? "homepage"
            : route.replace(/^\/|\/$/g, "").replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-");
          const screenshotPath = path.join(screenshotsDirectory, `${name}-${viewport.name}-dark.png`);
          try {
            await saveFullPageScreenshot(page, screenshotPath);
            dark.screenshot = path.relative(root, screenshotPath).split(path.sep).join("/");
          } catch (error) {
            dark.screenshotError = error.message;
            console.error(`Screenshot failed for ${route} (${viewport.name}/dark): ${error.message}`);
          }
        }
        findings.push(dark);
      }
      completedRoutes += 1;
      if (completedRoutes % 25 === 0 || completedRoutes === routes.length) {
        console.log(`Audited ${completedRoutes}/${routes.length} sitemap routes`);
      }
    }
    await page.close();
  });
  await Promise.all(workers);
  return findings;
}

function pageStatus(rows) {
  if (rows.some((row) => row.navigationError || row.status !== 200 || !row.sharedStylesheetLoaded)) {
    return "Defect identified";
  }
  if (rows.some((row) =>
    row.horizontalOverflow ||
    row.offscreenElements?.length ||
    row.hiddenVerticalOverflow ||
    row.brokenImages?.length ||
    row.lowContrastText?.length ||
    row.pageErrors?.length ||
    row.failedLocalRequests?.length
  )) {
    return "Defect identified";
  }
  return "Inspected — no issue";
}

function writeTracker(routes, findings) {
  const grouped = new Map(routes.map((route) => [route, []]));
  for (const finding of findings) grouped.get(finding.route).push(finding);
  const tracker = [...grouped.entries()].map(([route, rows]) => {
    const issues = rows.flatMap((row) => [
      ...(row.navigationError ? [`navigation: ${row.navigationError}`] : []),
      ...(row.screenshotError ? [`screenshot capture failed at ${row.viewport}/${row.colorScheme}: ${row.screenshotError}`] : []),
      ...(row.status !== 200 ? [`HTTP ${row.status}`] : []),
      ...(!row.sharedStylesheetLoaded ? ["shared visual stylesheet not loaded"] : []),
      ...(row.horizontalOverflow ? [`horizontal overflow at ${row.viewport}/${row.colorScheme}`] : []),
      ...(row.brokenImages || []).map((image) => `broken image: ${image}`),
      ...(row.lowContrastText || []).map((issue) =>
        `low contrast ${issue.contrast}: ${issue.text} (${row.viewport}/${row.colorScheme})`
      ),
      ...(row.pageErrors || []).map((error) => `browser error: ${error}`),
      ...(row.failedLocalRequests || []).map((request) => `failed local request: ${request}`),
      ...(row.hiddenVerticalOverflow ? [`vertical clipping at ${row.viewport}/${row.colorScheme}`] : []),
      ...(row.offscreenElements || []).map((element) =>
        `off-screen element at ${row.viewport}/${row.colorScheme}: ${element.tag}.${element.className}`
      ),
    ]);
    return {
      route,
      local_file: localFileForRoute(route),
      family: pageFamily(route),
      status: pageStatus(rows),
      viewport_checks: rows.length,
      issues: [...new Set(issues)],
      screenshots: rows.map((row) => row.screenshot).filter(Boolean),
    };
  });
  const fields = ["route", "local_file", "family", "status", "viewport_checks", "issues", "screenshots"];
  const csv = [
    fields.join(","),
    ...tracker.map((row) => fields.map((field) => csvEscape(row[field])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(path.join(outputDirectory, "page-tracker.csv"), `${csv}\r\n`);
  return tracker;
}

function makeReport(routes, tracker, findings) {
  const familyStats = new Map();
  for (const row of tracker) {
    const current = familyStats.get(row.family) || { pages: 0, defects: 0 };
    current.pages += 1;
    if (row.status === "Defect identified") current.defects += 1;
    familyStats.set(row.family, current);
  }
  const summary = {
    auditedAt: new Date().toISOString(),
    sitemapRouteCount: routes.length,
    routesCheckedAtAllViewportsAndThemes: tracker.length,
    viewportAndThemeChecks: findings.length,
    dimensions: viewports,
    colorSchemes: schemes,
    screenshotCount: findings.filter((row) => row.screenshot).length,
    screenshotFailures: findings.filter((row) => row.screenshotError).length,
    defectsIdentified: tracker.filter((row) => row.status === "Defect identified").length,
    routesWithNoAutomatedDefect: tracker.filter((row) => row.status === "Inspected — no issue").length,
    families: Object.fromEntries(familyStats),
    checkLimitations: [
      "Automated contrast measurement skips text over gradient or image backgrounds and cannot replace human visual review.",
      "The production inbox address was not contacted; email delivery depends on the Resend credentials configured in the deployment.",
      "A tracker row marked no automated defect has measurable browser checks only; it is not a declaration of human visual sign-off.",
    ],
  };
  fs.writeFileSync(path.join(outputDirectory, "route-findings.json"), `${JSON.stringify({ summary, findings }, null, 2)}\n`);
  const rows = [...familyStats.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([family, data]) => `| ${family} | ${data.pages} | ${data.defects} |`).join("\n");
  const markdown = [
    "# Site-wide visual audit — 2026-11-09",
    "",
    `**Scope:** all ${routes.length} distinct URL paths listed in the published sitemap, tested at desktop (1440px), tablet (768px) and mobile (390px), in light and dark color schemes. The automated test covered ${findings.length} rendered route/view/theme combinations.`,
    "",
    "## Results",
    "",
    `- Routes with at least one measurable visual or loading defect: ${summary.defectsIdentified}.`,
    `- Routes with no detected automated defect: ${summary.routesWithNoAutomatedDefect}.`,
    `- New before/after screenshots: ${summary.screenshotCount} after screenshots, compared with existing representative screenshots in \`../screenshots/\`.`,
    `- Screenshot capture failures: ${summary.screenshotFailures}.`,
    "- The page-level statuses are recorded in `page-tracker.csv`; raw route and viewport evidence is in `route-findings.json`.",
    "",
    "| Page family | Sitemap routes | Routes with a detected defect |",
    "|---|---:|---:|",
    rows,
    "",
    "## Before-and-after screenshot set",
    "",
    "Existing light-theme screenshots are from the prior visual QA captured on 2026-11-08. New screenshots were captured during this audit at desktop, tablet and mobile sizes, plus dark-theme mobile, for each family below.",
    "",
    "| Page family | Before screenshots | New screenshots |",
    "|---|---|---|",
    "| Homepage | `../screenshots/homepage-desktop.jpg`, `../screenshots/homepage-tablet.jpg`, `../screenshots/homepage-mobile.jpg` | `./screenshots/homepage-desktop.png`, `./screenshots/homepage-tablet.png`, `./screenshots/homepage-mobile.png` |",
    "| Service | `../screenshots/service-desktop.jpg`, `../screenshots/service-tablet.jpg`, `../screenshots/service-mobile.jpg` | `./screenshots/candidate-services-desktop.png`, `./screenshots/candidate-services-tablet.png`, `./screenshots/candidate-services-mobile.png` |",
    "| Executive role | `../screenshots/executive-role-desktop.jpg`, `../screenshots/executive-role-tablet.jpg`, `../screenshots/executive-role-mobile.jpg` | `./screenshots/roles-ceo-desktop.png`, `./screenshots/roles-ceo-tablet.png`, `./screenshots/roles-ceo-mobile.png` |",
    "| Industry | `../screenshots/industry-desktop.jpg`, `../screenshots/industry-tablet.jpg`, `../screenshots/industry-mobile.jpg` | `./screenshots/industries-finance-insurance-desktop.png`, `./screenshots/industries-finance-insurance-tablet.png`, `./screenshots/industries-finance-insurance-mobile.png` |",
    "| International market | `../screenshots/international-market-desktop.jpg`, `../screenshots/international-market-tablet.jpg`, `../screenshots/international-market-mobile.jpg` | `./screenshots/markets-executive-job-search-dubai-desktop.png`, `./screenshots/markets-executive-job-search-dubai-tablet.png`, `./screenshots/markets-executive-job-search-dubai-mobile.png` |",
    "| Career resource | `../screenshots/career-resource-desktop.jpg`, `../screenshots/career-resource-tablet.jpg`, `../screenshots/career-resource-mobile.jpg` | `./screenshots/resources-case-studies-desktop.png`, `./screenshots/resources-case-studies-tablet.png`, `./screenshots/resources-case-studies-mobile.png` |",
    "| FAQ | `../screenshots/faq-desktop.jpg`, `../screenshots/faq-tablet.jpg`, `../screenshots/faq-mobile.jpg` | `./screenshots/faqs-desktop.png`, `./screenshots/faqs-tablet.png`, `./screenshots/faqs-mobile.png` |",
    "| Blog | `./screenshots-before/blog-desktop.png`, `./screenshots-before/blog-tablet.png`, `./screenshots-before/blog-mobile.png` | `./screenshots/blog-desktop.png`, `./screenshots/blog-tablet.png`, `./screenshots/blog-mobile.png` |",
    "| About | `../screenshots/about-desktop.jpg`, `../screenshots/about-tablet.jpg`, `../screenshots/about-mobile.jpg` | `./screenshots/about-desktop.png`, `./screenshots/about-tablet.png`, `./screenshots/about-mobile.png` |",
    "| Contact | `../screenshots/contact-desktop.jpg`, `../screenshots/contact-tablet.jpg`, `../screenshots/contact-mobile.jpg` | `./screenshots/contact-desktop.png`, `./screenshots/contact-tablet.png`, `./screenshots/contact-mobile.png` |",
    "",
    "## Scope and limits",
    "",
    "- Each sitemap URL was navigated in a local browser build; external requests and fonts were blocked to keep the audit reproducible.",
    "- The scan checks HTTP status, the shared stylesheet, page errors, horizontal overflow, clipped document overflow, failed local images/requests and text contrast on solid backgrounds.",
    "- Contrast checks intentionally skip gradient/image backdrops; screenshots require human visual review before final completion.",
    "- Existing noindex and staged pages excluded from the sitemap were not treated as published sitemap routes.",
    "- Contact notifications are sent through Resend by the API, but the development workspace has no Supabase or Resend credentials. Live delivery remains unverified until the deployment has those credentials and a verified sender.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outputDirectory, "audit-report.md"), markdown);
  return summary;
}

async function main() {
  fs.mkdirSync(screenshotsDirectory, { recursive: true });
  const routes = sitemapRoutes();
  const missingFiles = routes.filter((route) => !localFileForRoute(route));
  console.log(JSON.stringify({
    routesInSitemap: routes.length,
    routesWithoutLocalHtml: missingFiles.length,
    firstMissingLocalRoutes: missingFiles.slice(0, 15),
    origin,
    viewports: viewports.map(({ name, width }) => ({ name, width })),
    colorSchemes: schemes,
  }));
  const previewServer = await startLocalPreviewServer();
  let browser;
  let findings;
  try {
    browser = await chromium.launch({ headless: true });
    findings = await runAudit(browser, routes);
  } finally {
    if (browser) await browser.close();
    if (previewServer) {
      await new Promise((resolve, reject) => previewServer.close((error) =>
        error ? reject(error) : resolve()
      ));
    }
  }
  const tracker = writeTracker(routes, findings);
  const summary = makeReport(routes, tracker, findings);
  console.log(JSON.stringify(summary, null, 2));
  const critical = findings.filter((row) =>
    row.navigationError ||
    row.status !== 200 ||
    row.horizontalOverflow ||
    row.brokenImages?.length ||
    row.pageErrors?.length
  );
  console.log(JSON.stringify({
    criticalRouteViewportFindings: critical.length,
    exampleFindings: critical.slice(0, 15).map((row) => ({
      route: row.route,
      viewport: row.viewport,
      colorScheme: row.colorScheme,
      status: row.status,
      horizontalOverflow: row.horizontalOverflow,
      brokenImages: row.brokenImages?.length || 0,
      navigationError: row.navigationError,
      pageErrors: row.pageErrors,
    })),
    outputDirectory: path.relative(root, outputDirectory),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
