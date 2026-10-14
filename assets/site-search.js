(() => {
  if (window.kovSiteSearchReady) return;
  window.kovSiteSearchReady = true;

  const pages = [
    { href: 'index.html', title: 'Home', summary: 'Independent global talent sourcing for companies and private Career Representation for senior professionals.', terms: 'KOV agency executive search career representation job search hire passive talent research' },
    { href: 'services.html', title: 'Services', summary: 'Career Representation, executive career support, positioning, applications, recruiter outreach, interview preparation, and negotiation.', terms: 'candidate services resume CV LinkedIn job applications recruiters outreach interview salary offer negotiation career support' },
    { href: 'candidate-services.html', title: 'Candidate Services', summary: 'Private Career Representation for senior professionals.', terms: 'job search career jobs resume CV LinkedIn applications recruiter outreach interview preparation offer negotiation executive candidate' },
    { href: 'company-services.html', title: 'Company Services', summary: 'Research-led sourcing for senior and executive talent across global markets.', terms: 'hire hiring company employer executive search passive talent sourcing recruitment leadership shortlist market research' },
    { href: 'global-talent-sourcer.html', title: 'Global Talent Sourcer', summary: 'Independent research and sourcing for passive executive talent in North America, Europe, and Asia.', terms: 'company hiring executive recruiter global talent passive candidate sourcing market mapping OSINT research' },
    { href: 'how-it-works.html', title: 'How It Works', summary: 'Understand the KOV search process, from defining a target through research, outreach, and next steps.', terms: 'process steps workflow career search recruiting sourcing research applications communication' },
    { href: 'pricing.html', title: 'Engagement Fees', summary: 'Discuss KOV engagement scope and fees directly by message before work begins.', terms: 'cost price pricing fee fees rates package packages budget payment individual scope' },
    { href: 'faqs.html', title: 'FAQs', summary: 'Answers about KOV services, process, eligibility, privacy, and pricing.', terms: 'questions answers help frequently asked what how who where support' },
    { href: 'about.html', title: 'About KOV', summary: 'Learn about KOV Career Agency and its founder, Daniel Ade.', terms: 'about founder agency Daniel Ade background values company' },
    { href: 'contact.html', title: 'Contact', summary: 'Start a confidential conversation with KOV Career Agency.', terms: 'contact email talk conversation consultation inquiry book discuss reach' },
    { href: 'blog.html', title: 'Blog', summary: 'Read KOV articles about executive careers, recruiting, talent sourcing, and job search strategy.', terms: 'articles insights advice news guides career hiring recruiting executive search' },
    { href: 'candidate-proof.html', title: 'Private Search Proof', summary: 'See illustrative examples of how KOV structures a private career search.', terms: 'candidate examples proof records workflow applications positioning outreach interview job search' },
    { href: 'company-proof.html', title: 'Executive Talent Intelligence', summary: 'Explore illustrative examples of KOV market research and executive talent sourcing.', terms: 'company examples proof records talent map market research executive sourcing hiring passive' },
    { href: 'why-kov.html', title: 'Why KOV', summary: 'Learn how KOV approaches independent sourcing and private career representation.', terms: 'why choose difference agency independent discreet research trust executive career company' },
    { href: 'reverse-recruiting.html', title: 'Career Representation', summary: 'Private candidate-side search support for senior professionals, with target definition, research and approved outreach.', terms: 'candidate executive job search reverse recruiting career representation applications recruiter outreach' },
    { href: 'executive-search-support.html', title: 'Executive Search Support', summary: 'Research-led support for employers defining a leadership search, mapping relevant talent and agreeing outreach.', terms: 'employer executive search leadership hiring research talent sourcing outreach' },
    { href: 'career-strategy-senior-leaders.html', title: 'Career Strategy for Senior Leaders', summary: 'Clarify the next career move, target roles and markets, positioning and practical search plan.', terms: 'career strategy executive leadership transition senior professional' },
    { href: 'executive-resume-strategy.html', title: 'Executive Resume Strategy', summary: 'Position leadership scope, verified achievements and fit for target roles in a clear executive resume.', terms: 'resume CV executive positioning achievements senior leader' },
    { href: 'interview-coaching-executives.html', title: 'Interview Coaching for Executives', summary: 'Prepare leadership examples, role research, questions and clear answers for executive interviews.', terms: 'interview executive coaching preparation leadership' },
    { href: 'executive-negotiation-support.html', title: 'Executive Offer and Negotiation Support', summary: 'Assess role scope, compensation components, timing and negotiation priorities for an executive offer.', terms: 'offer negotiation executive compensation salary senior leader' },
    { href: 'linkedin-optimization-executives.html', title: 'LinkedIn Optimization for Executives', summary: 'Align an executive LinkedIn profile with verified experience, leadership story and target roles.', terms: 'LinkedIn profile executive positioning recruiter' },
    { href: 'executive-job-search-dubai.html', title: 'Executive Job Search in Dubai', summary: 'Remote executive career representation for senior professionals targeting roles in Dubai.', terms: 'Dubai UAE executive job search career representation' },
    { href: 'executive-job-search-uae.html', title: 'Executive Job Search in the UAE', summary: 'Plan a focused remote executive job search across agreed UAE locations and target employers.', terms: 'UAE United Arab Emirates executive job search career support' },
    { href: 'executive-career-support-saudi-arabia.html', title: 'Executive Career Support in Saudi Arabia', summary: 'Define role, relocation and market requirements for an executive search targeting Saudi Arabia.', terms: 'Saudi Arabia KSA executive career search' },
    { href: 'leadership-hiring-gcc.html', title: 'Leadership Hiring in the GCC', summary: 'Research-led support for organizations planning leadership searches across agreed GCC markets.', terms: 'GCC Gulf executive sourcing leadership hiring' },
    { href: 'executive-search-europe.html', title: 'Executive Search in Europe', summary: 'Map European leadership talent based on role requirements, target countries and relevant experience.', terms: 'Europe executive search talent sourcing employers' },
    { href: 'executive-search-north-america.html', title: 'Executive Search in North America', summary: 'Define a North American leadership search around the role, market boundary and talent criteria.', terms: 'North America executive search US Canada talent sourcing' },
    { href: 'reverse-recruiting-cfos.html', title: 'Career Representation for CFOs', summary: 'Private career representation and a targeted search plan for CFOs pursuing a next leadership role.', terms: 'CFO finance executive job search reverse recruiting candidate' },
    { href: 'reverse-recruiting-ctos.html', title: 'Career Representation for CTOs', summary: 'Position technology leadership experience and coordinate a private executive search for CTOs.', terms: 'CTO technology executive career job search reverse recruiting' },
    { href: 'reverse-recruiting-cmos.html', title: 'Career Representation for CMOs', summary: 'Clarify marketing leadership positioning and search direction for CMOs and senior marketing leaders.', terms: 'CMO marketing executive career job search reverse recruiting' },
    { href: 'executive-search-chros.html', title: 'Executive Search for CHROs', summary: 'Research and sourcing support for organizations seeking a senior people leader or CHRO.', terms: 'CHRO human resources people leadership employer executive search' },
    { href: 'executive-search-saas-leaders.html', title: 'Executive Search for SaaS Leaders', summary: 'Research-led sourcing for SaaS leadership roles, aligned with the company stage and mandate.', terms: 'SaaS software technology executive search talent sourcing' },
    { href: 'healthcare-executive-search.html', title: 'Healthcare Executive Search', summary: 'Research-led sourcing support for healthcare leadership roles and agreed market requirements.', terms: 'healthcare health executive search talent sourcing' },
    { href: 'executive-hiring-fintech.html', title: 'Executive Hiring in Fintech', summary: 'Source fintech leaders based on business model, regulatory context and leadership mandate.', terms: 'fintech finance technology executive hiring talent sourcing' },
  ];
  const movedLandingPages = new Set([
    'reverse-recruiting.html',
    'executive-search-support.html',
    'career-strategy-senior-leaders.html',
    'executive-resume-strategy.html',
    'interview-coaching-executives.html',
    'executive-negotiation-support.html',
    'linkedin-optimization-executives.html',
    'executive-job-search-dubai.html',
    'executive-job-search-uae.html',
    'executive-career-support-saudi-arabia.html',
    'leadership-hiring-gcc.html',
    'executive-search-europe.html',
    'executive-search-north-america.html',
    'reverse-recruiting-cfos.html',
    'reverse-recruiting-ctos.html',
    'reverse-recruiting-cmos.html',
    'executive-search-chros.html',
    'executive-search-saas-leaders.html',
    'healthcare-executive-search.html',
    'executive-hiring-fintech.html',
  ]);
  pages.splice(
    0,
    pages.length,
    ...pages.filter((page) => !movedLandingPages.has(page.href)),
    ...(window.kovSeoPageCatalog || [])
  );
  const categoryLabels = new Map([
    ['services', 'Core services'],
    ['markets', 'Geography and markets'],
    ['roles', 'Seniority and roles'],
    ['industries', 'Industries'],
    ['resources', 'Proof and next steps'],
  ]);
  const pageCategories = new Set(categoryLabels.keys());
  function localPageHref(href) {
    const inCluster = /\/(?:services|markets|roles|industries|resources)\/[^/]*$/.test(location.pathname);
    return `${inCluster ? '../' : ''}${href}`;
  }

  function makePageNavigation(isMobile) {
    const menu = createElement('details', isMobile ? 'kov-topic-nav kov-topic-nav-mobile' : 'kov-topic-nav');
    const summary = createElement('summary', '', isMobile ? 'Browse all 60 pages' : 'Explore pages');
    summary.setAttribute('aria-label', 'Browse all 60 pages by topic');
    const panel = createElement('div', 'kov-topic-nav-panel');

    for (const [category, label] of categoryLabels) {
      const entries = (window.kovSeoPageCatalog || []).filter((page) => page.category === category);
      if (!entries.length) continue;
      const group = isMobile
        ? createElement('details', 'kov-topic-nav-group')
        : createElement('section', 'kov-topic-nav-group');
      const heading = createElement(isMobile ? 'summary' : 'h3', '', label);
      if (isMobile) heading.setAttribute('aria-label', `${label} pages`);
      const links = createElement('ul', '');
      for (const entry of entries) {
        const item = createElement('li', '');
        const link = createElement(
          'a',
          '',
          entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, '')
        );
        link.href = localPageHref(entry.href);
        item.append(link);
        links.append(item);
      }
      group.append(heading, links);
      panel.append(group);
    }

    menu.append(summary, panel);
    return menu;
  }

  function normalizeLegacyFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const container = footer.querySelector(':scope > .mx-auto') || footer;
    if (container.querySelector('.kov-footer-bottom-bar')) return;

    const legal = [...container.querySelectorAll('p, .kov-legal, div')].find((element) => /©|All rights reserved|rights reserved/i.test(element.textContent || ''));
    const privacyLink = [...container.querySelectorAll('a')].find((link) => /privacy\.html/i.test(link.getAttribute('href') || ''));
    const widget = document.getElementById('kov-translate-widget');

    if (!legal && !privacyLink) return;

    const bottomBar = document.createElement('div');
    bottomBar.className = 'kov-footer-bottom-bar';

    if (legal) {
      const legalNode = legal.closest('[class*="mt-10"], [class*="flex-col"], [class*="justify-between"], .kov-legal') || legal;
      legalNode.classList.add('kov-legal');
      legalNode.classList.remove('mt-10', 'flex', 'flex-col', 'gap-2', 'border-t', 'border-line/60', 'pt-6', 'md:flex-row', 'md:items-center', 'md:justify-between');
      legalNode.removeAttribute('style');
      legalNode.remove();
      bottomBar.append(legalNode);
    }

    if (privacyLink) {
      privacyLink.classList.add('kov-footer-privacy-link');
      privacyLink.remove();
      bottomBar.append(privacyLink);
    }

    if (widget && !bottomBar.contains(widget)) {
      bottomBar.append(widget);
    }

    const existingBar = container.querySelector('.kov-footer-bottom-bar');
    if (existingBar && existingBar !== bottomBar) {
      while (existingBar.firstChild) bottomBar.appendChild(existingBar.firstChild);
      existingBar.remove();
    }

    const footerNote = [...container.children].reverse().find((child) => child.matches('p, .kov-legal') || /©|rights reserved/i.test(child.textContent || ''));
    if (footerNote) {
      container.insertBefore(bottomBar, footerNote);
      return;
    }

    container.append(bottomBar);
  }

  function addFooterCategories() {
    const catalog = window.kovSeoPageCatalog || [];
    const footer = document.querySelector('footer');
    if (!footer || !catalog.length) return;

    const container = footer.querySelector(':scope > .mx-auto') || footer;
    const audienceFooter = container.querySelector('[data-audience-footer]');
    const existingNavigation = footer.querySelector('[data-kov-footer-categories]');
    if (existingNavigation) {
      if (audienceFooter?.parentElement) {
        audienceFooter.insertAdjacentElement('afterend', existingNavigation);
      }
      return;
    }

    const navigation = createElement('nav', 'kov-footer-categories');
    navigation.dataset.kovFooterCategories = '';
    navigation.setAttribute('aria-label', 'Browse all 60 pages');
    const heading = createElement('h2', '', 'Explore all 60 pages');
    const grid = createElement('div', 'kov-footer-category-grid kov-footer-category-grid-horizontal');

    for (const [category, label] of categoryLabels) {
      const entries = catalog.filter((page) => page.category === category);
      if (!entries.length) continue;
      const group = createElement('details', 'kov-footer-category');
      group.append(createElement('summary', '', label));
      const list = createElement('ul', '');
      for (const entry of entries) {
        const item = createElement('li', '');
        const link = createElement('a', '', entry.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, ''));
        link.href = localPageHref(entry.href);
        item.append(link);
        list.append(item);
      }
      group.append(list);
      grid.append(group);
    }

    const privacyLink = [...container.querySelectorAll('a')].find((link) => {
      const href = link.getAttribute('href') || '';
      return /privacy\.html/i.test(href);
    });

    navigation.append(heading, grid);
    if (privacyLink && !navigation.querySelector('a[href*="privacy.html"]')) {
      const privacy = document.createElement('a');
      privacy.href = privacyLink.getAttribute('href') || '/privacy.html';
      privacy.textContent = privacyLink.textContent.trim() || 'Privacy Notice';
      privacy.className = 'kov-footer-privacy-link';
      navigation.append(privacy);
      privacyLink.remove();
    }

    if (audienceFooter?.parentElement) {
      audienceFooter.insertAdjacentElement('afterend', navigation);
      return;
    }
    const footerNote = [...container.children].reverse().find((child) => {
      return child.matches('p, .kov-legal') || child.textContent.includes('©');
    });

    if (footerNote) {
      container.insertBefore(navigation, footerNote);
      return;
    }

    container.append(navigation);
  }

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
    const pathParts = location.pathname.split('/').filter(Boolean);
    const parent = pathParts.at(-2);
    const leaf = pathParts.at(-1) || 'index.html';
    const currentPath = pageCategories.has(parent) ? `${parent}/${leaf}` : leaf;
    const page = pages.find((item) => item.href === currentPath);
    if (!page) return;

    const body = document.body.cloneNode(true);
    body.querySelectorAll('script, style, noscript, template, svg, .site-search-dialog, .kov-topic-nav').forEach((element) => element.remove());
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const raw = `${document.title} ${description} ${body.innerText || body.textContent || ''}`.replace(/\s+/g, ' ').trim();
    pageContent.set(page.href, { raw, normalized: normalize(raw) });
  }

  function loadPageIndex() {
    if (!pageIndexPromise) {
      pageIndexPromise = location.protocol === 'file:' ? Promise.resolve() : Promise.all(pages.map(async (page) => {
        try {
          const response = await fetch(localPageHref(page.href), { credentials: 'same-origin' });
          if (!response.ok) return;
          const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
          parsed.querySelectorAll('script, style, noscript, template, svg, .site-search-dialog, .kov-topic-nav').forEach((element) => element.remove());
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
    link.href = localPageHref(page.href);
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
      if (window.kovSeoPageCatalog?.length && !navigation.querySelector('.kov-topic-nav')) {
        const desktopNavigation = makePageNavigation(false);
        const topicAction = navigation.querySelector('.kov-nav-cta, a[href="contact.html"]');
        navigation.insertBefore(desktopNavigation, topicAction || null);
      }
      const desktopTrigger = createTrigger('site-search-desktop');
      const navAction = navigation.querySelector('.kov-nav-cta, a[href="contact.html"]');
      navigation.insertBefore(desktopTrigger, navAction || null);
    }

    const mobileNavigation = header.querySelector(
      '.seo-mobile-menu nav, .site-mobile-menu-nav, .kov-mobile-nav, [data-mobile-menu-nav]'
    ) || document.querySelector(
      '.seo-mobile-menu nav, .site-mobile-menu-nav, .kov-mobile-nav, [data-mobile-menu-nav]'
    );
    if (mobileNavigation && window.kovSeoPageCatalog?.length && !mobileNavigation.querySelector('.kov-topic-nav')) {
      const mobileMenu = makePageNavigation(true);
      const mobileAction = mobileNavigation.querySelector('a[href="contact.html"], .kov-nav-cta');
      mobileNavigation.insertBefore(mobileMenu, mobileAction || null);
    }

    const menuToggle = header.querySelector('.kov-menu-toggle, [data-mobile-menu-toggle]');
    if (menuToggle) menuToggle.before(createTrigger('site-search-mobile'));
    else if (!navigation) header.append(createTrigger('site-search-mobile'));
  }

  normalizeLegacyFooter();
  addFooterCategories();

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
