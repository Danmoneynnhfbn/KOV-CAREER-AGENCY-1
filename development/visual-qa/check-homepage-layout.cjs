const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const target = path.resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
  if (!target.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.stat(target, (error, stat) => {
    if (error || !stat.isFile()) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(target).pipe(res);
  });
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(8776, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const results = [];
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const response = await page.goto('http://127.0.0.1:8776/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForSelector('.kov-reference-home__fees', { timeout: 30000 });
      await page.waitForFunction(() => document.querySelector('.kov-home-experience .kov-visual-module .kov-discovery-network'), { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
      await page.screenshot({ path: path.join(__dirname, `homepage-corrected-${device}.png`), timeout: 60000, animations: 'disabled' });
      for (const [name, selector] of [['service-routes', '.kov-reference-home__service-pathways'], ['career-questions', '.kov-reference-home__career-questions'], ['fees', '.kov-reference-home__fees']]) {
        await page.locator(selector).screenshot({ path: path.join(__dirname, `homepage-corrected-${device}-${name}.png`), timeout: 60000, animations: 'disabled' });
      }
      const metrics = await page.evaluate(() => {
        const selectors = ['.kov-home-experience', '.kov-reference-home__service-pathways', '.kov-reference-home__discover', '.kov-reference-home__promos', '.kov-reference-home__advantage', '.kov-reference-home__founder-story', '.kov-reference-home__method', '.kov-reference-home__search-intelligence', '.kov-reference-home__career-questions', '.kov-reference-home__fees', '.kov-reference-home__faq'];
        const sections = selectors.map(selector => {
          const el = document.querySelector(selector);
          if (!el) return { selector, present: false };
          const r = el.getBoundingClientRect();
          return { selector, present: true, left: Math.round(r.left), width: Math.round(r.width), centerDelta: Math.round(r.left + r.width / 2 - innerWidth / 2) };
        });
        return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, sections, fontBoska: document.fonts.check('400 64px Boska'), fontSatoshi: document.fonts.check('400 16px Satoshi'), svgNodes: document.querySelectorAll('.kov-discovery-network [data-node]').length };
      });
      results.push({ device, status: response.status(), errors, ...metrics });
      await page.close();
    }
    for (const [family, route] of [
      ['service', '/services.html'],
      ['directory', '/roles/index.html'],
      ['industry', '/industries/wholesale-distribution/index.html'],
      ['geography', '/countries-we-serve.html'],
      ['professional-directory', '/professional-directory/index.html'],
      ['resources', '/career-resources/index.html'],
    ]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      const response = await page.goto(`http://127.0.0.1:8776${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(500);
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        bodyClasses: document.body.className,
        hasGlobalCss: [...document.styleSheets].some(sheet => sheet.href?.includes('kov-global-redesign.css')),
        main: (() => { const el = document.querySelector('main'); if (!el) return null; const r = el.getBoundingClientRect(); return { left: Math.round(r.left), width: Math.round(r.width) }; })(),
        blocks: [...document.querySelectorAll('main > section:first-of-type,main > article:first-of-type,main > .article-shell:first-of-type,main > .resource-shell:first-of-type,.ceo-hero,main .kov-hero,main > * > .max-w-7xl:first-child')].slice(0, 5).map(el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return { tag: el.tagName, class: String(el.className).slice(0, 90), left: Math.round(r.left), width: Math.round(r.width), marginLeft: s.marginLeft, display: s.display }; }),
      }));
      await page.screenshot({ path: path.join(__dirname, `family-align-${family}.png`), timeout: 60000, animations: 'disabled' });
      results.push({ family, status: response.status(), failures, ...metrics });
      await page.close();
    }
    console.log(JSON.stringify(results, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
