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

  function hasFaqContent(container) {
    const heading = [...container.querySelectorAll('h1, h2, h3, h4')].find((item) =>
      /\b(?:frequently asked questions|faqs?|common questions)\b/i.test(item.textContent || '')
    );
    if (!heading) return false;

    return Boolean(container.querySelector(
      'details, [itemtype*="Question"], [itemprop="mainEntity"], [class*="faq-item"], [class*="faq-list"], [data-faq-item]'
    ));
  }

  function removeDuplicateCompactFaqs() {
    const compactFaqs = [...document.querySelectorAll('section#faq.faq-compact-shell')];
    if (!compactFaqs.length) return;

    let observer;
    const removeDuplicates = () => {
      compactFaqs.forEach((compactFaq) => {
        if (!compactFaq.isConnected) return;
        const main = compactFaq.closest('main') || document.body;
        const existingFaq = [...main.querySelectorAll('section, article, [role="region"], .ceo-content-section, .kov-service-faq')]
          .some((section) => section !== compactFaq && !compactFaq.contains(section) && hasFaqContent(section));
        if (existingFaq) compactFaq.remove();
      });
      if (observer && !compactFaqs.some((section) => section.isConnected)) observer.disconnect();
    };

    removeDuplicates();
    if (compactFaqs.some((section) => section.isConnected)) {
      observer = new MutationObserver(removeDuplicates);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  const footer = document.createElement('footer');
  footer.className = 'kov-uniform-footer border-t border-[#e7e1d8] bg-[#f7f3ee] text-[#101821]';
  footer.innerHTML = `
    <div class="kov-uniform-footer-content mx-auto max-w-[1240px] px-6 py-10 lg:px-8">
      <div class="kov-uniform-footer-columns">
        <section class="kov-uniform-footer-brand">
          <div class="flex items-center gap-2.5">
            <img src="${resolveHref('kov-logo.png')}" alt="KOV" class="h-7 w-7 object-contain" />
            <span class="text-[13px] font-medium uppercase tracking-[0.22em] text-[#101821]">KOV Career Agency</span>
          </div>
          <p class="mt-4 max-w-[20rem] text-[13px] leading-relaxed text-[#4d5966]">
            Private Career Representation and separate Individual Career Services for professionals.
          </p>
        </section>
        <section>
          <h2>For professionals</h2>
          <ul class="mt-4 space-y-2 text-[13px] text-[#4d5966]">
            <li><a href="${resolveHref('candidate-services.html')}" class="hover:text-[#101821]">Individual Career Services</a></li>
            <li><a href="${resolveHref('services.html')}" class="hover:text-[#101821]">Private Career Representation</a></li>
            <li><a href="${resolveHref('how-it-works.html')}" class="hover:text-[#101821]">How It Works</a></li>
            <li><a href="${resolveHref('pricing.html')}" class="hover:text-[#101821]">Pricing</a></li>
          </ul>
        </section>
        <section>
          <h2>Direct inquiry</h2>
          <div class="mt-4 space-y-2 text-[13px] text-[#4d5966]">
            <a href="mailto:daniel@kovcareeragency.org?subject=Inquiry%20%E2%80%94%20Private%20Representation" class="block hover:text-[#101821] underline-offset-2 hover:underline">daniel@kovcareeragency.org</a>
            <a href="${resolveHref('contact.html')}" class="block hover:text-[#101821] underline-offset-2 hover:underline">Contact KOV</a>
            <p>Daniel Ade, Founder</p>
            <a href="${resolveHref('privacy.html')}" class="block hover:text-[#101821] underline-offset-2 hover:underline">Privacy Notice</a>
          </div>
        </section>
        <section class="kov-uniform-footer-inquiry">
          <h2>Send an inquiry</h2>
          <form action="https://api.web3forms.com/submit" method="POST" data-web3forms-form class="kov-uniform-footer-form" aria-label="Quick inquiry form">
            <input type="hidden" name="access_key" value="9c099b99-7549-4719-9643-8ec16c9d3a70">
            <input type="hidden" name="subject" value="Website inquiry - KOV Career Agency">
            <input type="hidden" name="from_name" value="KOV Career Agency website">
            <input type="checkbox" name="botcheck" class="kov-footer-honeypot" tabindex="-1" autocomplete="off">
            <label class="grid gap-1 text-[12px]">
              <span>Your name</span>
              <input name="name" type="text" autocomplete="name" required maxlength="120" class="w-full rounded-md border border-[#d9d3c9] bg-white px-3 py-2 text-[13px] text-[#101821]">
            </label>
            <label class="grid gap-1 text-[12px]">
              <span>Email</span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" class="w-full rounded-md border border-[#d9d3c9] bg-white px-3 py-2 text-[13px] text-[#101821]">
            </label>
            <label class="grid gap-1 text-[12px]">
              <span>Message</span>
              <textarea name="message" required maxlength="3000" rows="3" class="w-full resize-y rounded-md border border-[#d9d3c9] bg-white px-3 py-2 text-[13px] text-[#101821]"></textarea>
            </label>
            <button type="submit" class="justify-self-start rounded-full bg-[#101821] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white hover:bg-[#303c47]">Send inquiry</button>
            <p data-web3forms-status role="status" aria-live="polite" class="text-[12px] text-[#4d5966]"></p>
          </form>
        </section>
      </div>

      <div class="kov-uniform-footer-explore">
        <h2 data-kov-footer-page-count>Explore the page directory</h2>
        <div class="kov-uniform-footer-topic-grid" data-kov-footer-page-categories>
          <div class="kov-uniform-footer-topic">
            <h3>Core services</h3>
            <ul class="mt-3 space-y-2 text-[13px] text-[#4d5966]">
              <li><a href="${resolveHref('candidate-services.html')}">Individual Career Services</a></li>
              <li><a href="${resolveHref('services.html')}">Private Career Representation</a></li>
            </ul>
          </div>
          <div class="kov-uniform-footer-topic">
            <h3>Seniority and roles</h3>
            <ul class="mt-3 space-y-2 text-[13px] text-[#4d5966]">
              <li><a href="${resolveHref('roles/')}">Roles</a></li>
            </ul>
          </div>
          <div class="kov-uniform-footer-topic">
            <h3>Proof and next steps</h3>
            <ul class="mt-3 space-y-2 text-[13px] text-[#4d5966]">
              <li><a href="${resolveHref('faqs.html')}">FAQs</a></li>
              <li><a href="${resolveHref('blog.html')}">Blog</a></li>
              <li><a href="${resolveHref('about.html')}">About</a></li>
            </ul>
          </div>
          <div class="kov-uniform-footer-topic">
            <h3>Geography and markets</h3>
            <ul class="mt-3 space-y-2 text-[13px] text-[#4d5966]">
              <li><a href="${resolveHref('countries-we-serve.html')}">Countries We Serve</a></li>
              <li><a href="${resolveHref('markets/executive-job-search-dubai.html')}">Executive Search in Dubai</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="kov-uniform-footer-bottom">
        <span>© 2026 KOV Career Agency. All rights reserved.</span>
        <span class="hidden md:inline-block">Private career representation and individual career services for professionals.</span>
      </div>
    </div>
  `;

  const existingFooters = [...document.querySelectorAll('footer')];
  existingFooters.forEach((node) => node.remove());
  document.body.appendChild(footer);

  function populateFooterPageCatalog() {
    const catalog = window.kovSeoPageCatalog;
    const categoryGrid = footer.querySelector('[data-kov-footer-page-categories]');
    if (!Array.isArray(catalog) || !catalog.length || !categoryGrid) return;

    const groups = [
      { category: 'services', label: 'Core services' },
      { category: 'roles', label: 'Seniority and roles' },
      { category: 'resources', label: 'Proof and next steps' },
      { category: 'markets', label: 'Geography and markets' },
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
      const topic = document.createElement('div');
      topic.className = 'kov-uniform-footer-topic';
      const details = document.createElement('details');
      details.className = 'kov-footer-category';
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

      details.append(summary, list);
      topic.append(details);
      categoryGrid.append(topic);
    });

    const countHeading = footer.querySelector('[data-kov-footer-page-count]');
    if (countHeading) countHeading.textContent = `Explore all ${listedCount} pages`;
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

  removeDuplicateCompactFaqs();
  loadFooterPageCatalog();

  document.querySelectorAll('[data-web3forms-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[data-web3forms-status]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      status.textContent = '';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Your message could not be sent. Please try again.');
        }
        form.reset();
        status.textContent = 'Thank you. Your message has been sent.';
      } catch (error) {
        console.error('Web3Forms submission failed:', error);
        status.textContent = error instanceof Error
          ? error.message
          : 'Your message could not be sent. Please try again.';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  });
})();