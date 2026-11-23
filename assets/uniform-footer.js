(() => {
  if (window.kovFooterShellApplied) return;
  window.kovFooterShellApplied = true;

  const rootPrefix = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const depth = segments.length - (window.location.pathname.endsWith('/') ? 0 : 1);
    return '../'.repeat(Math.max(0, depth));
  };

  function addCandidateProjectDirectoryToHomepage() {
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (!isHomepage) return;

    const directoryHref = '/resources/candidate-project-directory';
    const directoryLabel = 'Candidate Project Directory';
    const hasDirectoryLink = (container) => [...(container?.querySelectorAll('a[href]') || [])]
      .some((link) => link.getAttribute('href') === directoryHref);

    const desktopExplore = document.querySelector('.kov-home-explore-menu');
    if (desktopExplore && !hasDirectoryLink(desktopExplore)) {
      const link = document.createElement('a');
      link.href = directoryHref;
      link.textContent = directoryLabel;
      desktopExplore.prepend(link);
    }

    const mobileNavigation = document.querySelector('.site-mobile-menu-nav');
    if (mobileNavigation && !hasDirectoryLink(mobileNavigation)) {
      const link = document.createElement('a');
      link.href = directoryHref;
      link.textContent = directoryLabel;
      link.setAttribute('data-mobile-menu-link', '');
      const representationLink = mobileNavigation.querySelector('a[href="services.html"]');
      mobileNavigation.insertBefore(link, representationLink || null);
    }

    const main = document.querySelector('main');
    if (!main || main.querySelector('[data-kov-candidate-directory-feature]')) return;
    const nextSectionHeading = [...main.querySelectorAll('h2')].find((heading) =>
      heading.textContent.replace(/\s+/g, ' ').trim().toLowerCase() ===
      'one focused approach, built around your career.'
    );
    const insertionPoint = nextSectionHeading?.closest('section');
    const feature = document.createElement('section');
    feature.className = 'border-b border-line/60 bg-cream/70';
    feature.setAttribute('data-kov-candidate-directory-feature', '');
    feature.innerHTML = `
      <div class="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div class="grid gap-8 rounded-2xl border border-ink/15 bg-background p-8 lg:grid-cols-12 lg:items-center lg:p-10">
          <div class="lg:col-span-8">
            <p class="text-xs font-bold uppercase tracking-widest text-orange">Candidate Project Directory</p>
            <h2 class="mt-4 text-4xl font-bold text-ink">Explore professional projects across global markets.</h2>
            <p class="mt-4 max-w-3xl leading-8 text-ink-soft">Browse professional roles, industries, skills, service areas and career project examples across 146 countries.</p>
          </div>
          <div class="lg:col-span-4 lg:flex lg:justify-end">
            <a class="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-cream" href="${directoryHref}">Explore the Directory <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    `;
    if (insertionPoint?.parentNode === main) main.insertBefore(feature, insertionPoint);
    else main.append(feature);
  }

  const resolveHref = (value) => {
    if (!value || value.startsWith('#') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
      return value;
    }
    return value.startsWith('/') ? value : rootPrefix() + value;
  };

  function getFaqSections(main) {
    const sections = new Set(
      [...main.querySelectorAll('[id], .faq-compact-shell')]
        .filter((element) => element.id.toLowerCase() === 'faq' || element.classList.contains('faq-compact-shell'))
    );
    const faqHeading = /^(?:frequently asked questions?|common questions|faqs?)(?:\b|:|—|-)/i;
    [...main.querySelectorAll('h1, h2, h3, h4')].forEach((heading) => {
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

    inner.querySelectorAll('details').forEach((details) => {
      details.classList.add('faq-compact-item');
    });
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
          <details class="faq-compact-item">
            <summary>Who is KOV for?</summary>
            <p>KOV works with senior and experienced professionals, including executives, specialists, and leaders exploring a career move.</p>
          </details>
          <details class="faq-compact-item">
            <summary>What does KOV actually do?</summary>
            <p>KOV researches target employers, prepares positioning, supports agreed professional outreach, and helps clients navigate search and interview conversations.</p>
          </details>
          <details class="faq-compact-item">
            <summary>Is this confidential?</summary>
            <p>Yes. The work is designed to be discreet, with scope and communication boundaries agreed before outreach begins.</p>
          </details>
          <details class="faq-compact-item">
            <summary>Does KOV guarantee interviews or jobs?</summary>
            <p>No. KOV does not guarantee interviews, offers, employment, or timelines. Employers make hiring decisions.</p>
          </details>
          <details class="faq-compact-item">
            <summary>How do fees work?</summary>
            <p>Fees depend on the scope agreed before work begins and are confirmed in writing.</p>
          </details>
          <details class="faq-compact-item">
            <summary>What is the next step?</summary>
            <p>Start with a focused inquiry to discuss fit, scope, and the services relevant to your situation.</p>
          </details>
        </div>
        <p class="faq-compact-more"><a href="${resolveHref('faq/index.html')}">More questions in our FAQ Library</a></p>
      </div>
    `;
    return section;
  }

  function ensureSingleUniformFaq(footerElement) {
    const main = document.querySelector('main');
    const isHomepage = window.location.pathname === '/' ||
      window.location.pathname === '/index.html';
    if (isHomepage) {
      document.querySelectorAll('body > section.faq-compact-shell').forEach((section) => section.remove());
      return;
    }
    const homepageRoot = document.querySelector('#kov-reference-home-root');
    const homepageFaq = homepageRoot?.querySelector('.kov-reference-home__faq');
    if (homepageRoot && homepageFaq) {
      homepageFaq.id = 'faq';
      normalizeFaqSection(homepageFaq);
      [...document.querySelectorAll('body > section.faq-compact-shell')].forEach((section) => {
        if (section !== homepageFaq) section.remove();
      });
      return;
    }
    const faqSections = main ? getFaqSections(main) : [];
    if (!faqSections.length) {
      const faq = createDefaultFaqSection();
      if (main) main.append(faq);
      else footerElement.before(faq);
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
            Independent career representation and practical career services for experienced professionals navigating their next move.
          </p>
          <a class="kov-footer-contact-cta" href="${resolveHref('contact.html')}">Start a confidential conversation <span aria-hidden="true">→</span></a>
        </section>
        <section>
          <h2>Explore KOV</h2>
          <ul>
            <li><a href="${resolveHref('index.html')}">Home</a></li>
            <li><a href="${resolveHref('about.html')}">About KOV</a></li>
            <li><a href="${resolveHref('how-it-works.html')}">How It Works</a></li>
            <li><a href="${resolveHref('industries.html')}">Industries</a></li>
            <li><a href="${resolveHref('countries-we-serve.html')}">Markets and Geography</a></li>
          </ul>
        </section>
        <section>
          <h2>For Professionals</h2>
          <ul>
            <li><a href="${resolveHref('candidate-services.html')}">Individual Career Services</a></li>
            <li><a href="${resolveHref('services.html')}">Private Career Representation</a></li>
            <li><a href="${resolveHref('how-it-works.html')}">How It Works</a></li>
            <li><a href="${resolveHref('pricing.html')}">Pricing</a></li>
            <li><a href="${resolveHref('roles.html')}">Roles and Leadership Directory</a></li>
            <li><a href="${resolveHref('career-resources/professional_profile_directory-01/index.html')}">Professional Profile Directory</a></li>
            <li><a href="${resolveHref('resources/candidate-project-directory')}">Candidate Project Directory</a></li>
            <li><a href="${resolveHref('career-resources/research_hub-01/index.html')}">Research Library</a></li>
            <li><a href="${resolveHref('career-resources/index.html')}">Career Resources</a></li>
          </ul>
        </section>
        <section>
          <h2>Direct Inquiry</h2>
          <ul>
            <li><a href="mailto:daniel@kovcareeragency.org?subject=Inquiry%20%E2%80%94%20Private%20Representation">daniel@kovcareeragency.org</a></li>
            <li><a href="${resolveHref('contact.html')}">Contact KOV</a></li>
            <li><a href="${resolveHref('about.html')}">Daniel Ade, Founder</a></li>
            <li><a href="${resolveHref('privacy.html')}">Privacy Notice</a></li>
            <li><a href="${resolveHref('faqs.html')}">FAQs</a></li>
            <li><a href="${resolveHref('blog.html')}">Insights and Updates</a></li>
            <li><a class="kov-footer-social-link" href="https://share.google/oXBoRb6jQ7X19OgyP" target="_blank" rel="noopener noreferrer"><svg class="kov-footer-social-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.7-.4-4H24v7.6h11c-.5 2.5-2 4.6-4.3 6v5h7c4.1-3.8 6.5-9.3 6.5-14.6z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-7-5c-1.9 1.3-4 2-6.5 2-5 0-9.2-3.4-10.7-8H6v5.1C9.4 39.6 16.1 44 24 44z"/><path fill="#FBBC05" d="M13.3 28.1a12 12 0 0 1 0-8.2v-5.1H6a20 20 0 0 0 0 18.4z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4 16.1 4 9.4 8.4 6 14.8l7.3 5.1C14.8 15.4 19 12 24 12z"/></svg><span>Google Business Profile</span></a></li>
            <li><a class="kov-footer-social-link" href="https://x.com/kovcareeragency" target="_blank" rel="noopener noreferrer" aria-label="KOV Career Agency on X"><svg class="kov-footer-social-icon kov-footer-social-icon-x" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.9 1.2h3.7l-8 9.2L24 22.9h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.5h2L6.5 3.2H4.3z"/></svg><span>X</span></a></li>
          </ul>
        </section>
        <section class="kov-uniform-footer-inquiry">
          <h2>Quick Inquiry</h2>
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
  addCandidateProjectDirectoryToHomepage();
  if (existingTranslateWidget) {
    document.querySelector('[data-kov-language-slot]')?.append(existingTranslateWidget);
  }
  document.querySelectorAll('.ceo-sticky-cta').forEach((button) => button.remove());
  ensureSingleUniformFaq(footer);

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

  if (!document.querySelector('script[src*="assets/google-translate.js"]')) {
    const translateScript = document.createElement('script');
    translateScript.src = resolveHref('assets/google-translate.js');
    translateScript.async = true;
    document.head.append(translateScript);
  }

  let footerCatalogRendered = false;
  function populateFooterPageCatalog() {
    const catalog = window.kovSeoPageCatalog;
    const categoryGrid = footer.querySelector('[data-kov-footer-page-categories]');
    if (footerCatalogRendered || !Array.isArray(catalog) || !catalog.length || !categoryGrid) return;

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
        ['resources/candidate-project-directory.html', 'Candidate Project Directory'],
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
    const openTopics = new Set(
      [...categoryGrid.querySelectorAll(':scope > details[open]')]
        .map((topic) => topic.querySelector('summary')?.textContent)
    );
    categoryGrid.replaceChildren();

    groups.forEach(({ category, label }) => {
      const topic = document.createElement('details');
      topic.className = 'kov-uniform-footer-topic';
      topic.open = openTopics.has(label);
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
    footerCatalogRendered = true;
  }

  let footerCatalogRequested = false;
  function loadFooterPageCatalog() {
    if (Array.isArray(window.kovSeoPageCatalog) && window.kovSeoPageCatalog.length) {
      populateFooterPageCatalog();
      return;
    }

    if (footerCatalogRequested) return;
    footerCatalogRequested = true;

    const catalogScript = document.querySelector('script[src*="assets/site-search-index.js"]') ||
      document.createElement('script');
    const isNewScript = !catalogScript.isConnected;
    catalogScript.addEventListener('load', populateFooterPageCatalog, { once: true });
    catalogScript.addEventListener('error', () => {
      footerCatalogRequested = false;
      console.error(`Failed to load the KOV footer page catalog: ${catalogScript.src}`);
    }, { once: true });
    if (isNewScript) {
      catalogScript.src = resolveHref('assets/site-search-index.js');
      catalogScript.async = true;
      document.head.append(catalogScript);
    }
  }

  footer.querySelector('[data-kov-footer-page-categories]')
    ?.addEventListener('toggle', (event) => {
      if (event.target instanceof HTMLDetailsElement && event.target.open) {
        loadFooterPageCatalog();
      }
    }, true);

})();
