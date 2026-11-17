const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
(async () => {
  const root = process.cwd();
  const contentTypes = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2' };
  const server = http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname); } catch { response.writeHead(400).end(); return; }
    let target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    try { if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html'); } catch {}
    fs.stat(target, (error, stat) => {
      if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'Content-Type': contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') response.end(); else fs.createReadStream(target).pipe(response);
    });
  });
  await new Promise(resolve => server.listen(8771, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const cases = [
    ['homepage-desktop', '/', 1440, 1000],
    ['services', '/candidate-services.html', 1440, 1000],
    ['industry', '/industries.html', 1440, 1000],
    ['occupations', '/roles.html', 1440, 1000],
    ['geography', '/countries-we-serve.html', 1440, 1000],
    ['professional-directory', '/professional-directory/index.html', 1440, 1000],
    ['resources-directory', '/career-resources/index.html', 1440, 1000],
    ['homepage-mobile', '/', 390, 844],
  ];
  const failures = [];
  for (const [name, path, width, height] of cases) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 500, deviceScaleFactor: 1 });
    page.on('pageerror', e => failures.push(`${name}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') failures.push(`${name}: ${m.text()}`); });
    page.on('requestfailed', r => failures.push(`${name}: ${r.url()} ${r.failure()?.errorText}`));
    const response = await page.goto(`http://127.0.0.1:8771${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1700);
    const family = await page.locator('body').evaluate(e => [...e.classList].find(c => c.startsWith('kov-family-')) || 'none');
    const h1 = (await page.locator('main h1').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 90);
    const design = await page.evaluate(() => ({
      h1Font: document.querySelector('main h1') ? getComputedStyle(document.querySelector('main h1')).fontFamily : '',
      breadcrumb: document.querySelector('nav[aria-label="Breadcrumb"]') ? getComputedStyle(document.querySelector('nav[aria-label="Breadcrumb"]')).fontSize : '',
      homePlaceholder: document.querySelector('.kov-home-search input')?.placeholder || '',
      fontFaces: [...document.fonts].map(font => ({ family: font.family, status: font.status })).filter(font => /suisse|inter/i.test(font.family)),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    }));
    const module = await page.locator('.kov-visual-module').first().evaluate(e => ({ exists: true, x: Math.round(e.getBoundingClientRect().x), y: Math.round(e.getBoundingClientRect().y), width: Math.round(e.getBoundingClientRect().width), svg: e.querySelector('svg')?.className.baseVal || '' })).catch(() => ({ exists: false }));
    const footer = await page.locator('.kov-uniform-footer').count();
    const searchTriggers = await page.locator('.kov-react-nav__search, .site-search-desktop').count();
    const visualSvg = page.locator('.kov-visual-module svg').first();
    if (await visualSvg.count()) { await visualSvg.scrollIntoViewIfNeeded(); await page.waitForTimeout(100); }
    const motion = await visualSvg.evaluate(e => {
      const path = e.querySelector('[data-flow],.kov-path-progress');
      return { visible: e.classList.contains('is-visible'), progress: e.style.getPropertyValue('--kov-scroll-progress'), pathOffset: path?.style.getPropertyValue('--kov-path-offset') || '' };
    }).catch(() => ({ visible: false, progress: '', pathOffset: '' }));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(70);
    await page.screenshot({ path: `development/visual-qa/visual-redesign/${name}.png`, fullPage: false });
    if (name === 'homepage-desktop') {
      await page.addStyleTag({ content: '.kov-reveal{opacity:1!important;transform:none!important}' });
      await page.screenshot({ path: 'development/visual-qa/visual-redesign/homepage-full.png', fullPage: true });
    }
    console.log('SCREENSHOT', name, 'status', response.status(), 'family', family, 'h1', h1, 'design', JSON.stringify(design), 'footer', footer, 'searchControls', searchTriggers, 'module', JSON.stringify(module), 'svgMotion', JSON.stringify(motion));
    if (name === 'homepage-desktop') {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'main h1' });
      const platformFonts = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      console.log('RENDERED_FONTS', JSON.stringify(platformFonts.fonts.map(font => ({ familyName: font.familyName, postScriptName: font.postScriptName, glyphCount: font.glyphCount }))));
      const network = page.locator('.kov-discovery-network');
      await network.locator('[data-node="roles"]').focus();
      await page.keyboard.press('ArrowRight');
      const keyboardNode = await page.evaluate(() => document.activeElement?.getAttribute('data-node') || '');
      const focusedRouteAnimation = await network.locator('[data-flow="industries"]').evaluate(e => getComputedStyle(e).animationName);
      console.log('SVG_KEYBOARD', JSON.stringify({ keyboardNode, focusedRouteAnimation }));
    }
    if (name === 'services') {
      const pathway = page.locator('.kov-career-pathway');
      await pathway.locator('[data-step="01"]').focus();
      await page.keyboard.press('ArrowRight');
      const activeStep = await pathway.evaluate(e => e.dataset.activeStep || '');
      console.log('SVG_PATHWAY_KEYBOARD', JSON.stringify({ activeStep }));
    }
    await page.close();
  }
  console.log('BROWSER_FAILURES', JSON.stringify(failures));
  await browser.close();
  await new Promise(resolve => server.close(resolve));
})();
