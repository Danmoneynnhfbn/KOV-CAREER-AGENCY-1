(() => {
  const pageDepth = location.pathname.split('/').filter(Boolean).length - 1;
  const rootPrefix = '../'.repeat(Math.max(0, pageDepth));

  function getFaqSections(main) {
    const sections = new Set(
      [...main.querySelectorAll('[id], .faq-compact-shell')]
        .filter((element) => element.id.toLowerCase() === 'faq' || element.classList.contains('faq-compact-shell'))
    );
    const faqHeading = /^(?:frequently asked questions?|common questions|faqs?)(?:\b|:|—|-)/i;
    [...main.querySelectorAll('h2, h3, h4')].forEach((heading) => {
      if (!faqHeading.test(heading.textContent.trim())) return;
      const section = heading.closest('section, article') || heading.parentElement;
      if (section) sections.add(section);
    });

    return [...sections]
      .filter((section) => ![...sections].some((other) => other !== section && other.contains(section)))
      .sort((left, right) => left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  }

  function normalizeFaqSection(section) {
    section.id = 'faq';
    section.classList.add('faq-compact-shell');

    let inner = section.querySelector(':scope > .mx-auto');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'mx-auto';
      while (section.firstChild) inner.append(section.firstChild);
      section.append(inner);
    }

    let list = inner.querySelector(':scope > .faq-compact-list');
    const topLevelDetails = [...inner.querySelectorAll('details')]
      .filter((details) => !details.parentElement.closest('details'));
    if (!list && topLevelDetails.length) {
      const detailsParent = topLevelDetails[0].parentElement;
      if (detailsParent !== inner) {
        list = detailsParent;
        list.classList.add('faq-compact-list');
      } else {
        list = document.createElement('div');
        list.className = 'faq-compact-list';
        inner.insertBefore(list, topLevelDetails[0]);
        topLevelDetails.forEach((details) => list.append(details));
      }
    }

    if (!list) {
      list = document.createElement('div');
      list.className = 'faq-compact-list';
      inner.append(list);
    } else {
      list.classList.add('faq-compact-list');
    }

    inner.querySelectorAll('details').forEach((details) => details.classList.add('faq-compact-item'));
    return list;
  }

  function createDefaultFaqSection() {
    const section = document.createElement('section');
    section.id = 'faq';
    section.className = 'faq-compact-shell';
    section.innerHTML = `
      <div class="mx-auto">
        <p class="faq-compact-kicker">Frequently Asked Questions</p>
        <h2>Common questions from professionals.</h2>
        <div class="faq-compact-list">
          <details class="faq-compact-item"><summary>Who is KOV for?</summary><p>KOV works with senior and experienced professionals, including executives, specialists, and leaders exploring a career move.</p></details>
          <details class="faq-compact-item"><summary>What does KOV actually do?</summary><p>KOV researches target employers, prepares positioning, supports agreed professional outreach, and helps clients navigate search and interview conversations.</p></details>
          <details class="faq-compact-item"><summary>Is this confidential?</summary><p>Yes. The work is designed to be discreet, with scope and communication boundaries agreed before outreach begins.</p></details>
          <details class="faq-compact-item"><summary>Does KOV guarantee interviews or jobs?</summary><p>No. KOV does not guarantee interviews, offers, employment, or timelines. Employers make hiring decisions.</p></details>
          <details class="faq-compact-item"><summary>How do fees work?</summary><p>Fees depend on the scope agreed before work begins and are confirmed in writing.</p></details>
          <details class="faq-compact-item"><summary>What is the next step?</summary><p>Start with a focused inquiry to discuss fit, scope, and the services relevant to your situation.</p></details>
        </div>
        <p class="faq-compact-more"><a href="${rootPrefix}faq/index.html">More questions in our FAQ Library</a></p>
      </div>`;
    return section;
  }

  function ensureSingleUniformFaq() {
    const main = document.querySelector('main');
    const faqSections = main ? getFaqSections(main) : [];
    if (!faqSections.length) {
      const faq = createDefaultFaqSection();
      if (main) main.append(faq);
      else if (footer) footer.before(faq);
      return;
    }

    const primarySection = faqSections[0];
    const primaryList = normalizeFaqSection(primarySection);
    const questionTitles = new Set(
      [...primaryList.querySelectorAll(':scope > details > summary')]
        .map((summary) => summary.textContent.trim().toLowerCase())
    );

    faqSections.slice(1).forEach((duplicateSection) => {
      const duplicateList = normalizeFaqSection(duplicateSection);
      [...duplicateList.querySelectorAll(':scope > details')].forEach((details) => {
        const title = details.querySelector(':scope > summary')?.textContent.trim().toLowerCase();
        if (title && !questionTitles.has(title)) {
          questionTitles.add(title);
          primaryList.append(details);
        }
      });
      duplicateSection.remove();
    });
  }

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
          <p>Independent global talent sourcing for companies. Private, confidential Career Representation for senior professionals. Never for corporate HR.</p>
        </section>
        <section>
          <h2>For Professionals</h2>
          <ul>
            <li><a href="${rootPrefix}candidate-services.html">Candidate Services</a></li>
            <li><a href="${rootPrefix}services.html">Career Representation</a></li>
            <li><a href="${rootPrefix}how-it-works.html">How It Works</a></li>
            <li><a href="${rootPrefix}pricing.html">Pricing</a></li>
          </ul>
        </section>
        <section>
          <h2>For Companies</h2>
          <ul>
            <li><a href="${rootPrefix}company-services.html">Company Services</a></li>
            <li><a href="${rootPrefix}global-talent-sourcer.html">Global Talent Sourcing</a></li>
            <li><a href="${rootPrefix}countries-we-serve.html">Countries We Serve</a></li>
            <li><a href="${rootPrefix}faqs.html">FAQs</a></li>
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
          <form class="kov-uniform-footer-form" action="https://api.web3forms.com/submit" method="POST" data-kov-footer-form>
            <input type="hidden" name="access_key" value="9c099b99-7549-4719-9643-8ec16c9d3a70">
            <input type="hidden" name="subject" value="Website footer inquiry - KOV Career Agency">
            <input type="hidden" name="from_name" value="KOV Career Agency website footer">
            <input type="checkbox" name="botcheck" class="kov-footer-honeypot" tabindex="-1" autocomplete="off">
            <label>Name<input name="name" type="text" autocomplete="name" required maxlength="120"></label>
            <label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
            <label class="kov-footer-message">Message<textarea name="message" required maxlength="1500" rows="2"></textarea></label>
            <button type="submit">Send inquiry</button>
            <p data-web3forms-status role="status" aria-live="polite"></p>
          </form>
        </section>
      </div>
      <nav class="kov-uniform-footer-explore" aria-label="Explore website pages">
        <h2>Explore website pages</h2>
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

  ensureSingleUniformFaq();

  const footerForm = footer.querySelector('[data-kov-footer-form]');
  footerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = footerForm.querySelector('button[type="submit"]');
    const status = footerForm.querySelector('[data-web3forms-status]');
    if (!submitButton || !status) return;

    submitButton.disabled = true;
    status.textContent = 'Sending your inquiry...';
    try {
      const response = await fetch(footerForm.action, {
        method: 'POST',
        body: new FormData(footerForm),
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Request failed with status ${response.status}`);
      }
      status.textContent = 'Thank you. Your inquiry has been sent.';
      footerForm.reset();
    } catch (error) {
      status.textContent = 'We could not send your inquiry. Please email daniel@kovcareeragency.org.';
      console.error('Failed to send the KOV footer inquiry.', error);
    } finally {
      submitButton.disabled = false;
    }
  });

  const topicGrid = footer.querySelector('.kov-uniform-footer-topic-grid');
  const categoryLabels = [
    ['services', 'Core services'],
    ['roles', 'Seniority and roles'],
    ['industries', 'Industries'],
    ['markets', 'Geography and markets'],
    ['resources', 'Proof and next steps'],
  ];

  function createPageCatalogPlaceholders() {
    topicGrid.replaceChildren();
    for (const [, label] of categoryLabels) {
      const group = document.createElement('details');
      group.className = 'kov-uniform-footer-topic';
      group.append(document.createElement('summary'));
      group.querySelector('summary').textContent = label;
      topicGrid.append(group);
    }
  }

  function renderPageCatalog() {
    const catalog = window.kovSeoPageCatalog;
    if (!topicGrid || !Array.isArray(catalog)) return;

    const openGroups = new Set(
      [...topicGrid.querySelectorAll(':scope > details[open]')]
        .map((group) => group.querySelector('summary')?.textContent)
    );
    topicGrid.replaceChildren();
    let pageCount = 0;
    for (const [category, label] of categoryLabels) {
      const entries = catalog.filter((entry) => entry.category === category);
      pageCount += entries.length;

      const group = document.createElement('details');
      group.className = 'kov-uniform-footer-topic';
      group.open = openGroups.has(label);
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

      if (!entries.length) continue;
      group.append(heading, links);
      topicGrid.append(group);
    }
    const heading = footer.querySelector('.kov-uniform-footer-explore > h2');
    if (heading) heading.textContent = `Explore all ${pageCount} pages`;
    footer.querySelector('.kov-uniform-footer-explore')
      ?.setAttribute('aria-label', `Explore all ${pageCount} pages`);
  }

  let catalogRequested = false;
  function loadPageCatalog() {
    if (Array.isArray(window.kovSeoPageCatalog)) {
      renderPageCatalog();
      return;
    }
    if (catalogRequested) return;
    catalogRequested = true;

    const catalogScript = document.querySelector('script[src*="site-search-index.js"]') ||
      document.createElement('script');
    const isNewScript = !catalogScript.isConnected;
    catalogScript.addEventListener('load', renderPageCatalog, { once: true });
    catalogScript.addEventListener('error', () => {
      catalogRequested = false;
      console.error(`Failed to load footer page catalog: ${catalogScript.src}`);
    }, { once: true });
    if (isNewScript) {
      catalogScript.src = `${rootPrefix}assets/site-search-index.js`;
      catalogScript.async = true;
      document.head.append(catalogScript);
    }
  }

  createPageCatalogPlaceholders();
  topicGrid.addEventListener('toggle', (event) => {
    if (event.target instanceof HTMLDetailsElement && event.target.open) loadPageCatalog();
  }, true);
})();
