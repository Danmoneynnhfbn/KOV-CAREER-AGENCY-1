const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '../../..');
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + path.sep)) return response.writeHead(403).end();
    fs.stat(target, (error, stat) => {
      if (error || !stat.isFile()) return response.writeHead(404).end();
      response.writeHead(200, { 'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(target).pipe(response);
    });
  });
  await new Promise(resolve => server.listen(8772, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  for (const concept of ['a', 'b']) {
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', deviceScaleFactor: 1 });
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
      page.on('requestfailed', request => failures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
      const response = await page.goto(`http://127.0.0.1:8772/development/visual-qa/positioning-concepts/concept-${concept}.html`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(__dirname, `concept-${concept}-${device}.png`), fullPage: true });
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        heading: document.querySelector('h1')?.innerText,
        font: document.querySelector('h1') ? getComputedStyle(document.querySelector('h1')).fontFamily : '',
        bodyFont: getComputedStyle(document.body).fontFamily,
        heroImageLoaded: Boolean(document.querySelector('.founder-portrait img')?.naturalWidth || document.querySelector('.hero-proof img')?.naturalWidth),
      }));
      if (device === 'mobile') {
        await page.locator('.menu-toggle').click();
        const menuOpened = await page.locator('.menu-toggle').getAttribute('aria-expanded');
        await page.keyboard.press('Escape');
        metrics.mobileMenuOpened = menuOpened === 'true';
        metrics.mobileMenuEscapeCloses = await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false';
      }
      await page.locator('[data-step="03"]').click();
      metrics.selectedSvgStep = await page.locator('[data-pathway]').first().getAttribute('data-active-step');
      metrics.svgDescriptionChanged = (await page.locator('[data-step-description]').first().innerText()).includes('verified experience');
      results.push({ concept, device, status: response?.status(), ...metrics, failures });
      await page.close();
    }
  }
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
