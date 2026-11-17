const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '../..');
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const target = path.resolve(root, pathname === '/' ? './index.html' : `.${pathname}`);
    if (target !== root && !target.startsWith(root + path.sep)) return response.writeHead(403).end();
    fs.stat(target, (error, stat) => {
      if (error || !stat.isFile()) return response.writeHead(404).end();
      response.writeHead(200, { 'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(target).pipe(response);
    });
  });
  await new Promise(resolve => server.listen(8775, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', deviceScaleFactor: 1 });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
    page.on('requestfailed', request => failures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
    const response = await page.goto('http://127.0.0.1:8775/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForFunction(() => document.querySelector('.kov-home-experience .kov-visual-module .kov-discovery-network'), { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(__dirname, `live-homepage-${device}-viewport.png`) });
    await page.evaluate(async () => {
      const pause = () => new Promise(resolve => setTimeout(resolve, 180));
      for (let top = 0; top < document.documentElement.scrollHeight; top += Math.max(500, innerHeight * .8)) {
        window.scrollTo(0, top);
        await pause();
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(__dirname, `live-homepage-${device}.png`), fullPage: true });
    const metrics = await page.evaluate(() => {
      const heading = document.querySelector('main .kov-reference-home__hero h1');
      const visual = document.querySelector('.kov-home-experience .kov-visual-module');
      const form = document.querySelector('.kov-home-search');
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        heading: heading?.innerText,
        headingFont: heading ? getComputedStyle(heading).fontFamily : null,
        headingText: heading?.innerText,
        boskaLoaded: document.fonts.check('400 64px Boska'),
        satoshiLoaded: document.fonts.check('400 16px Satoshi'),
        searchPresent: Boolean(form),
        searchInput: form?.querySelector('input')?.getAttribute('aria-label'),
        discoverySvgPresent: Boolean(visual?.querySelector('.kov-discovery-network')),
        svgNodes: visual?.querySelectorAll('.kov-discovery-network [data-node]').length || 0,
        founderProof: document.querySelector('.kov-home-founder-proof')?.innerText,
        founderProofDisplay: document.querySelector('.kov-home-founder-proof') ? getComputedStyle(document.querySelector('.kov-home-founder-proof')).display : null,
        primaryLink: document.querySelector('.kov-reference-home__primary-button')?.getAttribute('href'),
        footerPresent: Boolean(document.querySelector('.kov-uniform-footer, footer')),
        mainCount: document.querySelectorAll('main').length,
        sectionCount: document.querySelectorAll('main section').length,
        bodySectionCount: document.querySelectorAll('body section').length,
        outsideMainHeadings: [...document.querySelectorAll('body h1,body h2,body h3')].filter(item => !document.querySelector('main')?.contains(item)).map(item => ({ text: item.innerText, parent: item.parentElement?.tagName, className: item.parentElement?.className })),
        finalSections: [...document.querySelectorAll('main section')].slice(-4).map(section => ({
          heading: section.querySelector('h2')?.innerText || section.querySelector('h3')?.innerText || '',
          className: section.className,
          background: getComputedStyle(section).backgroundColor,
        })),
      };
    });
    results.push({ device, status: response.status(), ...metrics, failures });
    await page.close();
  }
  const pageFamilies = [
    ['service', '/services.html'],
    ['role-directory', '/roles/index.html'],
    ['industry', '/industries/wholesale-distribution/index.html'],
    ['geography', '/countries-we-serve.html'],
    ['professional-directory', '/professional-directory/index.html'],
    ['career-resources', '/career-resources/index.html'],
  ];
  for (const [family, route] of pageFamilies) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
    page.on('requestfailed', request => failures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
    const response = await page.goto(`http://127.0.0.1:8775${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      heading: document.querySelector('main h1')?.innerText || document.querySelector('h1')?.innerText,
      headingFont: document.querySelector('main h1') ? getComputedStyle(document.querySelector('main h1')).fontFamily : null,
      boskaLoaded: document.fonts.check('400 48px Boska'),
      globalStylesheet: [...document.styleSheets].some(sheet => sheet.href?.includes('kov-global-redesign.css?v=24')),
    }));
    await page.screenshot({ path: path.join(__dirname, `live-family-${family}.png`) });
    results.push({ family, route, status: response?.status() || null, ...metrics, failures });
    await page.close();
  }
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
