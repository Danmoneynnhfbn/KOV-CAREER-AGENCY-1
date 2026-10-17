(() => {
  const pageDepth = location.pathname.split('/').filter(Boolean).length - 1;
  const rootPrefix = '../'.repeat(Math.max(0, pageDepth));
  const footers = [...document.querySelectorAll('footer')];
  let footer = footers[0];
  let translateWidget = document.getElementById('kov-translate-widget');

  if (!footer) {
    footer = document.createElement('footer');
    const main = document.querySelector('main');
    if (main) main.after(footer);
    else document.body.append(footer);
  }

  footers.slice(1).forEach((duplicate) => duplicate.remove());
  footer.className = 'kov-uniform-footer';
  footer.innerHTML = `
    <div class="kov-uniform-footer-content mx-auto max-w-7xl px-6 lg:px-10">
      <div class="kov-uniform-footer-columns">
        <section class="kov-uniform-footer-brand">
          <div class="flex items-center gap-2.5">
            <img src="${rootPrefix}kov-logo.png" alt="KOV" class="h-6 w-6 object-contain"/>
            <span class="text-[12px] font-medium uppercase tracking-[0.18em] text-ink">KOV Career Agency</span>
          </div>
          <p>Private Career Representation and separate Individual Career Services for professionals.</p>
        </section>
        <section>
          <h2>For Professionals</h2>
          <ul>
            <li><a href="${rootPrefix}candidate-services.html">Individual Career Services</a></li>
            <li><a href="${rootPrefix}services.html">Private Career Representation</a></li>
            <li><a href="${rootPrefix}how-it-works.html">How It Works</a></li>
            <li><a href="${rootPrefix}pricing.html">Pricing</a></li>
          </ul>
        </section>
        <section>
          <h2>Direct Inquiry</h2>
          <ul>
            <li><a href="mailto:daniel@kovcareeragency.org?subject=Inquiry%20%E2%80%94%20Private%20Representation">daniel@kovcareeragency.org</a></li>
            <li><a href="${rootPrefix}contact.html">Contact KOV</a></li>
            <li><a href="${rootPrefix}about.html">Daniel Ade, Founder</a></li>
            <li><a href="${rootPrefix}privacy.html">Privacy Notice</a></li>
          </ul>
        </section>
      </div>
      <nav class="kov-uniform-footer-explore" aria-label="Explore all 35 pages">
        <h2>Explore all 35 pages</h2>
        <div class="kov-uniform-footer-topic-grid"></div>
      </nav>
      <div class="kov-uniform-footer-bottom" data-kov-footer-legal-row>
        <span>© 2026 KOV Career Agency. All rights reserved.</span>
      </div>
    </div>`;

  if (!translateWidget) {
    translateWidget = document.createElement('aside');
    translateWidget.id = 'kov-translate-widget';
    translateWidget.setAttribute('aria-label', 'Website language selection');
    translateWidget.innerHTML = '<label>Translate</label><div id="google_translate_element"></div>';
  }
  translateWidget.classList.add('kov-floating-translate');
  document.body.append(translateWidget);

  const topicGrid = footer.querySelector('.kov-uniform-footer-topic-grid');
  const categoryLabels = [
    ['services', 'Core services'],
    ['roles', 'Seniority and roles'],
    ['markets', 'Geography and markets'],
    ['resources', 'Proof and next steps'],
  ];

  function renderPageCatalog() {
    const catalog = window.kovSeoPageCatalog;
    if (!topicGrid || !Array.isArray(catalog)) return;

    for (const [category, label] of categoryLabels) {
      const entries = catalog.filter((entry) => entry.category === category);
      if (!entries.length) continue;

      const group = document.createElement('details');
      group.className = 'kov-uniform-footer-topic';
      const heading = document.createElement('summary');
      heading.textContent = label;
      const links = document.createElement('ul');

      for (const entry of entries) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `${rootPrefix}${entry.href}`;
        link.textContent = entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, '');
        item.append(link);
        links.append(item);
      }

      group.append(heading, links);
      topicGrid.append(group);
    }
  }

  if (Array.isArray(window.kovSeoPageCatalog)) {
    renderPageCatalog();
  } else {
    const catalogScript = document.createElement('script');
    catalogScript.src = `${rootPrefix}assets/site-search-index.js`;
    catalogScript.onload = renderPageCatalog;
    catalogScript.onerror = () => {
      console.error(`Failed to load footer page catalog: ${catalogScript.src}`);
    };
    document.head.append(catalogScript);
  }
})();
