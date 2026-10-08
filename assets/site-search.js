(() => {
  if (window.kovSiteSearchReady) return;
  window.kovSiteSearchReady = true;

  const pages = [
    { href: 'index.html', title: 'Home', summary: 'Independent global talent sourcing for companies and private reverse recruiting for senior professionals.', terms: 'KOV agency executive search career representation job search hire passive talent research' },
    { href: 'services.html', title: 'Services', summary: 'Reverse recruiting, executive career support, positioning, applications, recruiter outreach, interview preparation, and negotiation.', terms: 'candidate services resume CV LinkedIn job applications recruiters outreach interview salary offer negotiation career support' },
    { href: 'candidate-services.html', title: 'Candidate Services', summary: 'Private career representation and reverse recruiting for senior professionals.', terms: 'job search career jobs resume CV LinkedIn applications recruiter outreach interview preparation offer negotiation executive candidate' },
    { href: 'company-services.html', title: 'Company Services', summary: 'Research-led sourcing for senior and executive talent across global markets.', terms: 'hire hiring company employer executive search passive talent sourcing recruitment leadership shortlist market research' },
    { href: 'global-talent-sourcer.html', title: 'Global Talent Sourcer', summary: 'Independent research and sourcing for passive executive talent in North America, Europe, and Asia.', terms: 'company hiring executive recruiter global talent passive candidate sourcing market mapping OSINT research' },
    { href: 'how-it-works.html', title: 'How It Works', summary: 'Understand the KOV search process, from defining a target through research, outreach, and next steps.', terms: 'process steps workflow career search recruiting sourcing research applications communication' },
    { href: 'pricing.html', title: 'Pricing', summary: 'Review KOV service pricing, engagement options, and fees.', terms: 'cost price pricing fee fees rates package packages budget payment' },
    { href: 'faqs.html', title: 'FAQs', summary: 'Answers about KOV services, process, eligibility, privacy, and pricing.', terms: 'questions answers help frequently asked what how who where support' },
    { href: 'about.html', title: 'About KOV', summary: 'Learn about KOV Career Agency and its founder, Daniel Ade.', terms: 'about founder agency Daniel Ade background values company' },
    { href: 'contact.html', title: 'Contact', summary: 'Start a confidential conversation with KOV Career Agency.', terms: 'contact email talk conversation consultation inquiry book discuss reach' },
    { href: 'blog.html', title: 'Blog', summary: 'Read KOV articles about executive careers, recruiting, talent sourcing, and job search strategy.', terms: 'articles insights advice news guides career hiring recruiting executive search' },
    { href: 'candidate-proof.html', title: 'Private Search Proof', summary: 'See illustrative examples of how KOV structures a private career search.', terms: 'candidate examples proof records workflow applications positioning outreach interview job search' },
    { href: 'company-proof.html', title: 'Executive Talent Intelligence', summary: 'Explore illustrative examples of KOV market research and executive talent sourcing.', terms: 'company examples proof records talent map market research executive sourcing hiring passive' },
    { href: 'why-kov.html', title: 'Why KOV', summary: 'Learn how KOV approaches independent sourcing and private career representation.', terms: 'why choose difference agency independent discreet research trust executive career company' },
  ];

  const relatedTerms = {
    job: ['career', 'candidate', 'reverse recruiting'],
    jobs: ['career', 'candidate', 'reverse recruiting'],
    work: ['career', 'process'],
    hire: ['hiring', 'company', 'executive sourcing'],
    hiring: ['company', 'talent sourcing', 'executive search'],
    employer: ['company', 'hiring'],
    recruit: ['recruiting', 'recruiter', 'talent sourcing'],
    recruiting: ['recruiter', 'candidate', 'talent sourcing'],
    recruiter: ['recruiting', 'outreach'],
    executive: ['senior', 'leadership', 'talent sourcing'],
    talent: ['executive', 'candidate', 'sourcing'],
    resume: ['cv', 'positioning', 'candidate services'],
    cv: ['resume', 'positioning', 'candidate services'],
    interview: ['preparation', 'candidate services'],
    offer: ['negotiation', 'salary', 'candidate services'],
    price: ['pricing', 'cost', 'fees'],
    cost: ['pricing', 'fees'],
    fee: ['pricing', 'cost'],
    fees: ['pricing', 'cost'],
    question: ['faqs', 'answers'],
    questions: ['faqs', 'answers'],
    example: ['proof', 'records'],
    examples: ['proof', 'records'],
    proof: ['candidate proof', 'company proof'],
    source: ['sourcing', 'global talent sourcer'],
    sourcer: ['sourcing', 'global talent sourcer'],
  };

  const stopWords = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'for', 'find', 'get', 'help', 'how', 'i', 'in', 'is', 'me', 'my', 'of', 'on', 'or', 'the', 'to', 'what', 'where', 'who', 'with', 'you', 'your']);
  const normalize = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const words = (value) => normalize(value).split(/\s+/).filter(Boolean);
  const bundledContent = window.kovSiteSearchContent || {};
  const pageContent = new Map();
  for (const page of pages) {
    const raw = bundledContent[page.href];
    if (raw) pageContent.set(page.href, { raw, normalized: normalize(raw) });
  }
  let pageIndexPromise;

  function indexCurrentPage() {
    const currentPath = location.pathname.split('/').pop() || 'index.html';
    const page = pages.find((item) => item.href === currentPath);
    if (!page) return;

    const body = document.body.cloneNode(true);
    body.querySelectorAll('script, style, noscript, template, svg, .site-search-dialog').forEach((element) => element.remove());
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const raw = `${document.title} ${description} ${body.innerText || body.textContent || ''}`.replace(/\s+/g, ' ').trim();
    pageContent.set(page.href, { raw, normalized: normalize(raw) });
  }

  function loadPageIndex() {
    if (!pageIndexPromise) {
      pageIndexPromise = location.protocol === 'file:' ? Promise.resolve() : Promise.all(pages.map(async (page) => {
        try {
          const response = await fetch(page.href, { credentials: 'same-origin' });
          if (!response.ok) return;
          const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
          parsed.querySelectorAll('script, style, noscript, template, svg, .site-search-dialog').forEach((element) => element.remove());
          const bodyText = (parsed.body?.innerText || parsed.body?.textContent || '').replace(/\s+/g, ' ').trim();
          const imageText = [...parsed.querySelectorAll('img[alt]')].map((image) => image.alt).join(' ');
          const description = parsed.querySelector('meta[name="description"]')?.content || '';
          const raw = `${parsed.title} ${description} ${bodyText} ${imageText}`.replace(/\s+/g, ' ').trim();
          pageContent.set(page.href, { raw, normalized: normalize(raw) });
        } catch (error) {
          return;
        }
      }));
    }
    return pageIndexPromise;
  }

  function matchStrength(queryWord, fieldWords) {
    if (fieldWords.includes(queryWord)) return 1;
    if (queryWord.length < 3) return 0;
    if (fieldWords.some((fieldWord) => fieldWord.startsWith(queryWord) || queryWord.startsWith(fieldWord))) return 0.72;
    if (queryWord.length < 4) return 0;
    return fieldWords.some((fieldWord) => oneEditApart(queryWord, fieldWord)) ? 0.48 : 0;
  }

  function oneEditApart(first, second) {
    if (Math.abs(first.length - second.length) > 1) return false;
    let firstIndex = 0;
    let secondIndex = 0;
    let differences = 0;
    while (firstIndex < first.length && secondIndex < second.length) {
      if (first[firstIndex] === second[secondIndex]) {
        firstIndex += 1;
        secondIndex += 1;
        continue;
      }
      differences += 1;
      if (differences > 1) return false;
      if (first.length > second.length) firstIndex += 1;
      else if (second.length > first.length) secondIndex += 1;
      else {
        firstIndex += 1;
        secondIndex += 1;
      }
    }
    if (firstIndex < first.length || secondIndex < second.length) differences += 1;
    return differences <= 1;
  }

  function matchesQuery(page, queryWords) {
    const contentWords = words(pageContent.get(page.href)?.raw || '');
    const searchableWords = [...words(page.title), ...words(page.summary), ...words(page.terms), ...contentWords];
    return queryWords.every((queryWord) => {
      if (searchableWords.some((word) => word === queryWord)) return true;
      if (queryWord.length >= 5 && searchableWords.some((word) => word.startsWith(queryWord))) return true;
      if (queryWord.length >= 5 && searchableWords.some((word) => oneEditApart(queryWord, word))) return true;
      return (relatedTerms[queryWord] || []).some((term) =>
        words(term).some((relatedWord) => searchableWords.includes(relatedWord))
      );
    });
  }

  function rankPage(page, query, queryWords) {
    const titleWords = words(page.title);
    const termWords = words(page.terms);
    const summaryWords = words(page.summary);
    const content = pageContent.get(page.href)?.normalized || '';
    let score = 0;

    if (normalize(page.title).includes(query)) score += 10;
    if (normalize(page.terms).includes(query)) score += 5;
    if (content.includes(query)) score += 20;

    for (const queryWord of queryWords) {
      if (content.includes(queryWord)) score += 12;
      score += matchStrength(queryWord, titleWords) * 9;
      score += matchStrength(queryWord, termWords) * 5;
      score += matchStrength(queryWord, summaryWords) * 2;

      for (const related of relatedTerms[queryWord] || []) {
        const relatedWords = words(related);
        score += Math.max(...relatedWords.map((word) => matchStrength(word, titleWords)), 0) * 3;
        score += Math.max(...relatedWords.map((word) => matchStrength(word, termWords)), 0) * 2;
      }
    }
    return score;
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  const dialog = createElement('dialog', 'site-search-dialog');
  dialog.setAttribute('aria-labelledby', 'site-search-title');
  const dialogHeader = createElement('div', 'site-search-header');
  const headingGroup = createElement('div', 'site-search-heading');
  headingGroup.append(
    createElement('p', 'site-search-kicker', 'KOV / SITE SEARCH'),
    createElement('h2', '', 'Find a page')
  );
  const closeButton = createElement('button', 'site-search-close', '×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close search');
  dialogHeader.append(headingGroup, closeButton);

  const title = headingGroup.querySelector('h2');
  title.id = 'site-search-title';
  const form = createElement('form', 'site-search-form');
  form.setAttribute('role', 'search');
  const label = createElement('label', 'site-search-label', 'Search KOV pages');
  label.htmlFor = 'site-search-input';
  const input = createElement('input', 'site-search-input');
  input.id = 'site-search-input';
  input.type = 'search';
  input.name = 'q';
  input.autocomplete = 'off';
  input.placeholder = 'Try “executive hiring” or “career support”';
  form.append(label, input);
  const status = createElement('p', 'site-search-status');
  status.setAttribute('aria-live', 'polite');
  const resultList = createElement('ul', 'site-search-results');
  dialog.append(dialogHeader, form, status, resultList);
  document.body.append(dialog);

  function getSnippet(page, queryWords) {
    const content = pageContent.get(page.href)?.raw || '';
    const lowerContent = content.toLowerCase();
    const matchPositions = queryWords
      .map((word) => lowerContent.indexOf(word))
      .filter((position) => position >= 0);
    if (!matchPositions.length) return page.summary;

    const matchPosition = Math.min(...matchPositions);
    const start = Math.max(0, matchPosition - 48);
    const end = Math.min(content.length, matchPosition + 112);
    return `${start > 0 ? '...' : ''}${content.slice(start, end)}${end < content.length ? '...' : ''}`;
  }

  function renderResults(query) {
    resultList.replaceChildren();
    const queryWords = words(query).filter((word) => !stopWords.has(word));
    if (queryWords.length === 0) {
      status.textContent = 'Popular destinations';
      for (const href of ['candidate-services.html', 'company-services.html', 'pricing.html']) {
        const page = pages.find((item) => item.href === href);
        resultList.append(makeResult(page));
      }
      return;
    }

    const normalizedQuery = normalize(query);
    const results = pages
      .filter((page) => matchesQuery(page, queryWords))
      .map((page) => ({ page, score: rankPage(page, normalizedQuery, queryWords) }))
      .filter((result) => result.score > 0)
      .sort((first, second) => second.score - first.score);

    if (!results.length) {
      status.textContent = location.protocol === 'file:'
        ? 'Open the site through its web address to search full page content.'
        : 'No close matches. Try another phrase or contact KOV.';
      return;
    }

    status.textContent = `${results.length} ${results.length === 1 ? 'page matches' : 'pages match'}${normalizedQuery ? ` “${query.trim()}”` : ''}`;
    for (const result of results) resultList.append(makeResult(result.page, queryWords));
  }

  function makeResult(page, queryWords = []) {
    const item = createElement('li', 'site-search-result');
    const link = createElement('a', 'site-search-result-link');
    link.href = page.href;
    const copy = createElement('span', 'site-search-result-copy');
    copy.append(createElement('strong', '', page.title), createElement('span', '', getSnippet(page, queryWords)));
    link.append(copy, createElement('span', 'site-search-result-arrow', '→'));
    item.append(link);
    return item;
  }

  function openSearch(trigger) {
    activeTrigger = trigger;
    indexCurrentPage();
    renderResults('');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    window.requestAnimationFrame(() => input.focus());
    status.textContent = 'Indexing page content...';
    loadPageIndex().then(() => {
      if (dialog.open) renderResults(input.value);
    });
  }

  let activeTrigger = null;
  function createTrigger(className) {
    const button = createElement('button', `site-search-trigger ${className}`);
    button.type = 'button';
    button.setAttribute('aria-label', 'Search the website');
    button.title = 'Search the website';
    const icon = createElement('span', 'site-search-icon');
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    button.addEventListener('click', () => openSearch(button));
    return button;
  }

  const header = document.querySelector('.two-sided-page > header, .min-h-screen header, body > header, header');
  if (header) {
    const navigation = header.querySelector('.kov-nav') || [...header.querySelectorAll('nav')].find((nav) =>
      !nav.classList.contains('kov-mobile-nav') && !nav.classList.contains('site-mobile-menu-nav') && !nav.closest('.site-mobile-menu')
    );
    if (navigation) {
      const desktopTrigger = createTrigger('site-search-desktop');
      const navAction = navigation.querySelector('.kov-nav-cta, a[href="contact.html"]');
      navigation.insertBefore(desktopTrigger, navAction || null);
    }

    const menuToggle = header.querySelector('.kov-menu-toggle, [data-mobile-menu-toggle]');
    if (menuToggle) menuToggle.before(createTrigger('site-search-mobile'));
    else if (!navigation) header.append(createTrigger('site-search-mobile'));
  }

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => activeTrigger?.focus());
  input.addEventListener('input', () => renderResults(input.value));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const firstResult = resultList.querySelector('a');
    if (firstResult) window.location.href = firstResult.href;
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      const firstResult = resultList.querySelector('a');
      if (firstResult) {
        event.preventDefault();
        firstResult.focus();
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      const visibleTrigger = [...document.querySelectorAll('.site-search-trigger')].find((button) => button.getClientRects().length);
      if (visibleTrigger) openSearch(visibleTrigger);
    }
  });
})();
