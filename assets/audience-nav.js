(() => {
  const rootPrefix = /\/(?:services|markets|roles|industries|resources)\/[^/]*$/.test(location.pathname)
    ? '../'
    : '';
  const destinations = [
    ['candidate-services.html', 'For Candidates'],
    ['company-services.html', 'For Companies'],
  ];
  const desktopNav = document.querySelector('header nav:not(.site-mobile-menu-nav)');
  const mobileNav = document.querySelector('.site-mobile-menu-nav');
  const seoMobileNav = document.querySelector('.seo-mobile-menu nav');

  function directChildContaining(parent, descendant) {
    if (!descendant) return null;
    return [...parent.children].find((child) => child === descendant || child.contains(descendant)) || null;
  }

  function addAccountLink(nav) {
    if (!nav || nav.querySelector('a[data-kov-account-link]')) return;
    const link = document.createElement('a');
    link.href = `${rootPrefix}account.html`;
    link.className = 'kov-account-link transition-colors hover:text-ink';
    link.dataset.kovAccountLink = '';
    link.setAttribute('aria-label', 'Log in or view your account');
    link.title = 'Account';
    link.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path></svg><span class="sr-only">Account</span>';
    const cta = [...nav.querySelectorAll('a')].find((item) =>
      /start|conversation|contact/i.test(item.textContent)
    );
    nav.insertBefore(link, directChildContaining(nav, cta));
  }

  addAccountLink(desktopNav);
  addAccountLink(mobileNav);
  addAccountLink(seoMobileNav);

  const modelHeading = [...document.querySelectorAll('main h2')].find(
    (heading) => heading.textContent.trim() === 'One Agency. Two Sides of Executive Search.'
  );
  const modelSection = modelHeading?.closest('section');
  const existingNetwork = modelSection?.querySelector('.kov-model-figure');
  if (existingNetwork) existingNetwork.dataset.kovNetwork = '';
  if (modelSection && !existingNetwork && !modelSection.querySelector('[data-kov-network]')) {
    const bodyCopy = [...modelSection.querySelectorAll('p')].find((paragraph) =>
      paragraph.textContent.includes('Different client.')
    );
    if (bodyCopy) {
      const figure = document.createElement('figure');
      figure.className = 'kov-art-figure kov-art-frame';
      figure.dataset.kovNetwork = '';
      const picture = document.createElement('picture');
      const mobileSource = document.createElement('source');
      mobileSource.media = '(max-width: 680px)';
      mobileSource.srcset = `${rootPrefix}assets/kov-executive-intelligence-network-mobile.svg`;
      const image = document.createElement('img');
      image.src = `${rootPrefix}assets/kov-executive-intelligence-network.svg`;
      image.alt = 'KOV connects professionals and companies with executives, recruiters, hiring managers, markets, and research';
      image.loading = 'lazy';
      picture.append(mobileSource, image);
      const caption = document.createElement('figcaption');
      caption.className = 'kov-art-caption';
      caption.textContent = 'One search intelligence network. Two distinct practices.';
      figure.append(picture, caption);
      bodyCopy.after(figure);
    }
  }

  for (const [href, label] of destinations) {
    const target = `${rootPrefix}${href}`;
    if (desktopNav && !desktopNav.querySelector(`a[href="${target}"]`)) {
      const link = document.createElement('a');
      link.href = target;
      link.className = 'transition-colors hover:text-ink';
      link.textContent = label;
      const cta = desktopNav.querySelector('a[href="contact.html"]');
      desktopNav.insertBefore(link, directChildContaining(desktopNav, cta));
    }

    if (mobileNav && !mobileNav.querySelector(`a[href="${target}"]`)) {
      const link = document.createElement('a');
      link.href = target;
      link.dataset.mobileMenuLink = '';
      link.textContent = label;
      const cta = mobileNav.querySelector('a[href="contact.html"]');
      mobileNav.insertBefore(link, directChildContaining(mobileNav, cta));
    }
  }

  const footer = document.querySelector('footer');
  const footerContainer = footer?.querySelector(':scope > .mx-auto') || footer;
  if (footerContainer && !footerContainer.querySelector('[data-audience-footer]')) {
    const section = document.createElement('div');
    section.dataset.audienceFooter = '';
    section.className = 'mt-10 border-t border-line/60 pt-8';

    const columns = document.createElement('div');
    columns.className = 'grid gap-8 sm:grid-cols-2';
    const groups = [
      {
        title: 'For Professionals',
        links: [
          [`${rootPrefix}candidate-services.html`, 'Candidate Services'],
          [`${rootPrefix}services.html`, 'Reverse Recruiting'],
          [`${rootPrefix}how-it-works.html`, 'How It Works'],
          [`${rootPrefix}pricing.html`, 'Pricing'],
        ],
      },
      {
        title: 'For Companies',
        links: [
          [`${rootPrefix}global-talent-sourcer.html`, 'Global Talent Sourcing'],
          [`${rootPrefix}company-services.html`, 'Company Services'],
          [`${rootPrefix}how-it-works.html`, 'How It Works'],
          [`${rootPrefix}contact.html`, 'Contact'],
        ],
      },
    ];

    for (const group of groups) {
      const column = document.createElement('div');
      const heading = document.createElement('p');
      heading.className = 'text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground';
      heading.textContent = group.title;
      const list = document.createElement('ul');
      list.className = 'mt-4 space-y-2 text-[13px] text-ink-soft';

      for (const [href, label] of group.links) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = href;
        link.className = 'transition-colors hover:text-ink';
        link.textContent = label;
        item.append(link);
        list.append(item);
      }

      column.append(heading, list);
      columns.append(column);
    }

    const whyLink = document.createElement('a');
    whyLink.href = `${rootPrefix}why-kov.html`;
    whyLink.className = 'mt-6 inline-block text-[13px] font-medium text-ink underline underline-offset-4 hover:text-orange';
    whyLink.textContent = 'Why KOV: Two Practices. One Founder.';
    section.append(columns, whyLink);
    const footerNote = footerContainer.lastElementChild;
    const pageCatalog = footerContainer.querySelector(':scope > [data-kov-footer-categories]');
    footerContainer.insertBefore(section, pageCatalog || footerNote);
  }

  function normalizeFooter() {
    if (!footer || !footerContainer || footerContainer.querySelector(':scope > [data-kov-footer-directory]')) return;

    const sourceGrid = [...footerContainer.children].find((element) =>
      element.matches('.grid') && element.children.length >= 2
    );
    const brand = sourceGrid?.children[0] ||
      [...footerContainer.children].find((element) => element.matches('.kov-brand'));
    let explore = sourceGrid?.children[1] || null;
    let inquiry = sourceGrid?.children[2] || null;
    const audience = footerContainer.querySelector(':scope > [data-audience-footer]');
    const audienceGroups = audience?.querySelector('.grid')?.children;
    const professionals = audienceGroups?.[0] || null;
    const company = audienceGroups?.[1] || null;
    const categoryNav = footerContainer.querySelector(':scope > [data-kov-footer-categories]');
    const legal = [...footerContainer.children].find((element) =>
      element.matches('.kov-legal') || element.textContent.includes('©')
    );

    if (!explore) {
      const footerNav = [...footerContainer.children].find((element) =>
        element.matches('nav[aria-label="Footer navigation"]')
      );
      if (footerNav) {
        explore = footerNav.children[0] || null;
        const about = footerNav.children[1];
        if (about && explore) explore.append(about);
      }
    }

    const countryLink = [...footer.querySelectorAll('a')].find((link) =>
      link.textContent.trim().toLowerCase() === 'countries we serve'
    );
    if (countryLink) {
      const oldItem = countryLink.closest('li');
      countryLink.remove();
      if (oldItem && !oldItem.textContent.trim()) oldItem.remove();
    }

    const directory = document.createElement('div');
    directory.className = 'kov-footer-directory';
    directory.dataset.kovFooterDirectory = '';

    const columns = [
      ['explore', explore],
      ['professionals', professionals],
      ['inquiry', inquiry],
      ['company', company],
      ['pages', categoryNav],
    ];
    for (const [kind, content] of columns) {
      if (!content) continue;
      const column = document.createElement('section');
      column.className = `kov-footer-directory-column kov-footer-directory-${kind}`;
      column.append(content);
      directory.append(column);
    }

    const countries = document.createElement('section');
    countries.className = 'kov-footer-directory-column kov-footer-directory-countries';
    const countriesHeading = document.createElement('p');
    countriesHeading.className = 'kov-footer-directory-heading';
    countriesHeading.textContent = 'Countries We Serve';
    countries.append(countriesHeading);
    if (countryLink) {
      countryLink.textContent = 'View countries';
      countries.append(countryLink);
    } else {
      const link = document.createElement('a');
      link.href = `${rootPrefix}countries-we-serve.html`;
      link.textContent = 'View countries';
      countries.append(link);
    }
    directory.append(countries);

    if (!inquiry) {
      const inquiryColumn = directory.querySelector('.kov-footer-directory-inquiry');
      if (!inquiryColumn) {
        const column = document.createElement('section');
        column.className = 'kov-footer-directory-column kov-footer-directory-inquiry';
        const heading = document.createElement('p');
        heading.className = 'kov-footer-directory-heading';
        heading.textContent = 'Direct Inquiry';
        const link = document.createElement('a');
        link.href = 'mailto:daniel@kovcareeragency.org';
        link.textContent = 'daniel@kovcareeragency.org';
        column.append(heading, link);
        const companyColumn = directory.querySelector('.kov-footer-directory-company');
        directory.insertBefore(column, companyColumn || directory.children[2] || null);
      }
    }

    const companyHeading = directory.querySelector('.kov-footer-directory-company p');
    if (companyHeading) companyHeading.textContent = 'For Company';

    const brandRow = document.createElement('div');
    brandRow.className = 'kov-footer-brand-row';
    if (brand) brandRow.append(brand);

    footerContainer.replaceChildren();
    if (brandRow.childElementCount) footerContainer.append(brandRow);
    footerContainer.append(directory);
    if (legal) footerContainer.append(legal);
  }

  normalizeFooter();
})();
