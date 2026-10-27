(() => {
  if (window.kovFooterShellApplied) return;
  window.kovFooterShellApplied = true;

  const rootPrefix = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const depth = segments.length - (window.location.pathname.endsWith('/') ? 0 : 1);
    return '../'.repeat(Math.max(0, depth));
  };

  const resolveHref = (value) => {
    if (!value || value.startsWith('#') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
      return value;
    }
    return value.startsWith('/') ? value : rootPrefix() + value;
  };

  function removeCompactFaqsOutsideHomePage() {
    const pathname = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    if (pathname === '/' || pathname === '/index.html') return;

    const compactFaqs = [...document.querySelectorAll('section#faq.faq-compact-shell')];
    compactFaqs.forEach((compactFaq) => compactFaq.remove());
  }

  const footer = document.createElement('footer');
  footer.className = 'kov-uniform-footer';
  footer.innerHTML = `
    <div class="kov-uniform-footer-content">
      <div class="kov-uniform-footer-columns">
        <section class="kov-uniform-footer-brand">
          <div class="flex items-center gap-2.5">
            <img src="${resolveHref('kov-logo.png')}" alt="KOV" class="h-7 w-7 object-contain" />
            <span class="text-[12px] font-medium uppercase tracking-[0.18em] text-ink">KOV Career Agency</span>
          </div>
          <p>
            Private Career Representation and separate Individual Career Services for professionals.
          </p>
        </section>
        <section>
          <h2>For Professionals</h2>
          <ul>
            <li><a href="${resolveHref('candidate-services.html')}">Individual Career Services</a></li>
            <li><a href="${resolveHref('services.html')}">Private Career Representation</a></li>
            <li><a href="${resolveHref('how-it-works.html')}">How It Works</a></li>
            <li><a href="${resolveHref('pricing.html')}">Pricing</a></li>
          </ul>
        </section>
        <section>
          <h2>Direct Inquiry</h2>
          <ul>
            <li><a href="mailto:daniel@kovcareeragency.org?subject=Inquiry%20%E2%80%94%20Private%20Representation">daniel@kovcareeragency.org</a></li>
            <li><a href="${resolveHref('contact.html')}">Contact KOV</a></li>
            <li><a href="${resolveHref('about.html')}">Daniel Ade, Founder</a></li>
            <li><a href="${resolveHref('privacy.html')}">Privacy Notice</a></li>
          </ul>
        </section>
      </div>

      <nav class="kov-uniform-footer-explore" aria-label="Explore the page directory">
        <h2 data-kov-footer-page-count>Explore the page directory</h2>
        <div class="kov-uniform-footer-topic-grid" data-kov-footer-page-categories>
          <details class="kov-uniform-footer-topic"><summary>Core services</summary><ul><li><a href="${resolveHref('candidate-services.html')}">Individual Career Services</a></li><li><a href="${resolveHref('services.html')}">Private Career Representation</a></li></ul></details>
          <details class="kov-uniform-footer-topic"><summary>Seniority and roles</summary><ul><li><a href="${resolveHref('roles/')}">Roles</a></li></ul></details>
          <details class="kov-uniform-footer-topic"><summary>Geography and markets</summary><ul><li><a href="${resolveHref('countries-we-serve.html')}">Countries We Serve</a></li></ul></details>
          <details class="kov-uniform-footer-topic"><summary>Proof and next steps</summary><ul><li><a href="${resolveHref('faqs.html')}">FAQs</a></li><li><a href="${resolveHref('blog.html')}">Blog</a></li><li><a href="${resolveHref('about.html')}">About</a></li></ul></details>
        </div>
      </nav>

      <div class="kov-uniform-footer-bottom" data-kov-footer-legal-row>
        <span>© 2026 KOV Career Agency. All rights reserved.</span>
      </div>
    </div>
  `;

  const existingFooters = [...document.querySelectorAll('footer')];
  const existingTranslateWidget = document.getElementById('kov-translate-widget');
  existingFooters.forEach((node) => node.remove());
  document.body.appendChild(footer);
  if (existingTranslateWidget) {
    footer.querySelector('[data-kov-footer-legal-row]').append(existingTranslateWidget);
  }
  document.querySelectorAll('.ceo-sticky-cta').forEach((button) => button.remove());

  const placeTranslateWidget = () => {
    const widget = document.getElementById('kov-translate-widget');
    const legalRow = footer.querySelector('[data-kov-footer-legal-row]');
    if (!widget || !legalRow) return false;
    if (!legalRow.contains(widget)) legalRow.append(widget);
    return true;
  };

  if (!placeTranslateWidget()) {
    const observer = new MutationObserver(() => {
      if (placeTranslateWidget()) {
        observer.disconnect();
        window.clearTimeout(observerTimeout);
      }
    });
    const observerTimeout = window.setTimeout(() => observer.disconnect(), 15000);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (!document.querySelector('script[src*="assets/google-translate.js"]')) {
    const translateScript = document.createElement('script');
    translateScript.src = resolveHref('assets/google-translate.js');
    translateScript.async = true;
    document.head.append(translateScript);
  }

  function populateFooterPageCatalog() {
    const catalog = window.kovSeoPageCatalog;
    const categoryGrid = footer.querySelector('[data-kov-footer-page-categories]');
    if (!Array.isArray(catalog) || !catalog.length || !categoryGrid) return;

    const groups = [
      { category: 'services', label: 'Core services' },
      { category: 'roles', label: 'Seniority and roles' },
      { category: 'markets', label: 'Geography and markets' },
      { category: 'resources', label: 'Proof and next steps' },
    ];
    const directoryLinks = {
      services: [
        ['candidate-services.html', 'Individual Career Services'],
        ['services.html', 'Private Career Representation'],
        ['how-it-works.html', 'How It Works'],
        ['pricing.html', 'Pricing'],
      ],
      roles: [['roles/', 'All leadership roles']],
      resources: [
        ['faqs.html', 'FAQs'],
        ['blog.html', 'Blog'],
        ['about.html', 'About KOV'],
        ['contact.html', 'Contact'],
      ],
      markets: [['countries-we-serve.html', 'Countries We Serve']],
    };
    const industries = catalog.filter((page) => page.category === 'industries');
    const listedHrefs = new Set();
    let listedCount = 0;
    categoryGrid.replaceChildren();

    groups.forEach(({ category, label }) => {
      const topic = document.createElement('details');
      topic.className = 'kov-uniform-footer-topic';
      const summary = document.createElement('summary');
      summary.textContent = label;
      const list = document.createElement('ul');

      const appendEntry = (entries, targetList) => {
        entries.forEach((entry) => {
          if (!entry.href || listedHrefs.has(entry.href)) return;
          listedHrefs.add(entry.href);
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = resolveHref(entry.href);
          link.textContent = (entry.title || entry.label || entry.href)
            .replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, '');
          item.append(link);
          targetList.append(item);
          listedCount += 1;
        });
      };

      appendEntry(
        directoryLinks[category].map(([href, title]) => ({ href, title })),
        list
      );
      appendEntry(catalog.filter((page) => page.category === category), list);

      if (category === 'roles' && industries.length) {
        const industryItem = document.createElement('li');
        const industryDetails = document.createElement('details');
        industryDetails.className = 'kov-footer-category kov-footer-category-subgroup';
        const industrySummary = document.createElement('summary');
        industrySummary.textContent = 'Industry directories';
        const industryList = document.createElement('ul');
        industryDetails.append(industrySummary, industryList);
        industryItem.append(industryDetails);
        list.append(industryItem);
        appendEntry(industries, industryList);
      }

      topic.append(summary, list);
      categoryGrid.append(topic);
    });

    const countHeading = footer.querySelector('[data-kov-footer-page-count]');
    if (countHeading) {
      countHeading.textContent = `Explore all ${listedCount} pages`;
      footer.querySelector('.kov-uniform-footer-explore')
        ?.setAttribute('aria-label', `Explore all ${listedCount} pages`);
    }
    footer.setAttribute('aria-label', `KOV Career Agency footer with ${listedCount} page links`);
  }

  function loadFooterPageCatalog() {
    if (Array.isArray(window.kovSeoPageCatalog) && window.kovSeoPageCatalog.length) {
      populateFooterPageCatalog();
      return;
    }

    const catalogScript = document.createElement('script');
    catalogScript.src = resolveHref('assets/site-search-index.js');
    catalogScript.async = true;
    catalogScript.addEventListener('load', populateFooterPageCatalog, { once: true });
    catalogScript.addEventListener('error', () => {
      console.error(`Failed to load the KOV footer page catalog: ${catalogScript.src}`);
    }, { once: true });
    document.head.append(catalogScript);
  }

  removeCompactFaqsOutsideHomePage();
  loadFooterPageCatalog();
})();