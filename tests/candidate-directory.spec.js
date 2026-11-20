const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('http://127.0.0.1:8765/resources/candidate-project-directory.html', {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForFunction(() =>
      window.KOV_CANDIDATE_PROJECTS?.profiles?.length === 1000 &&
      document.querySelectorAll('#profile-grid .kov-project-card').length === 24,
      { timeout: 20000 }
    );

    assert.equal(await page.locator('#total-count').innerText(), '1,000');
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute('href'),
      'https://www.kovcareeragency.org/resources/candidate-project-directory'
    );
    assert.match(
      await page.locator('meta[name="description"]').getAttribute('content'),
      /private career representation/i
    );
    assert.equal(await page.locator('#profile-grid .kov-project-card').count(), 24);
    assert.equal(await page.locator('#profile-grid .kov-project-avatar[role="img"]').count(), 24);

    const atlas = await page.locator('#profile-grid .kov-project-avatar[role="img"]').first().evaluate(async element => {
      const match = getComputedStyle(element).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (!match) return { loaded: false };
      const image = new Image();
      image.src = match[1];
      await image.decode();
      return { loaded: true, width: image.naturalWidth, height: image.naturalHeight };
    });
    assert.deepEqual(atlas, { loaded: true, width: 960, height: 864 });

    await page.locator('#profile-search').fill('Chief Product Officer');
    await page.waitForFunction(() => {
      const summary = document.querySelector('#results-summary')?.textContent || '';
      return summary.includes('profiles') && !summary.includes('No profiles');
    });
    assert.ok(await page.locator('#profile-grid .kov-project-card').count() > 0);
    await page.locator('#clear-filters').click();

    await page.locator('#country-filter').selectOption('Nigeria');
    await page.waitForFunction(() => {
      const cards = [...document.querySelectorAll('#profile-grid .kov-project-card')];
      return cards.length > 0 && cards.every(card =>
        card.querySelector('.kov-project-country')?.textContent.includes('Nigeria')
      );
    });
    const nigeriaCards = await page.locator('#profile-grid .kov-project-card').count();
    assert.ok(nigeriaCards > 0 && nigeriaCards <= 24);
    await page.locator('#clear-filters').click();

    const services = await page.locator('#service-filter option').allTextContents();
    assert.ok(!services.some(value => /reverse recruiting/i.test(value)));

    await page.locator('#page-size').selectOption('12');
    await page.waitForFunction(() => document.querySelectorAll('#profile-grid .kov-project-card').length === 12);
    const firstPageId = await page.locator('#profile-grid .kov-project-card').first().getAttribute('data-profile-id');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForFunction(previous => {
      const current = document.querySelector('#profile-grid .kov-project-card');
      return current && current.getAttribute('data-profile-id') !== previous;
    }, firstPageId);
    const secondPageId = await page.locator('#profile-grid .kov-project-card').first().getAttribute('data-profile-id');
    assert.notEqual(secondPageId, firstPageId);
    assert.equal(await page.locator('#profile-grid .kov-project-flag').count(), 12);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileAvatar = await page.locator('#profile-grid .kov-project-avatar').first().boundingBox();
    assert.ok(mobileAvatar && mobileAvatar.width > 0 && mobileAvatar.width <= 80);
    assert.match(await page.locator('.kov-project-disclosure').innerText(), /illustrative/i);

    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({
      profiles: 1000,
      desktopCards: 24,
      atlasLoaded: true,
      search: 'passed',
      countryFilter: 'passed',
      serviceFilter: 'passed',
      pagination: 'passed',
      mobileViewport: 'passed',
      javascriptErrors: pageErrors.length
    }));
  } finally {
    await browser.close();
  }
})();
