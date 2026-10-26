(() => {
  const rootPrefix = /\/(?:services|markets|roles|industries|resources)\/[^/]*$/.test(location.pathname)
    ? '../'
    : '';
  const destinations = [
    ['candidate-services.html', 'Individual Career Services'],
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

  for (const nav of [desktopNav, mobileNav, seoMobileNav]) {
    nav?.querySelectorAll('a[href$="candidate-services.html"]').forEach((link) => {
      link.textContent = 'Individual Career Services';
    });
    nav?.querySelectorAll('a[href$="services.html"]').forEach((link) => {
      if (/^(services|reverse recruiting)$/i.test(link.textContent.trim())) {
        link.textContent = 'Private Career Representation';
      }
    });
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
  if (footerContainer && !footer?.classList.contains('kov-uniform-footer') && !footerContainer.querySelector('[data-audience-footer]')) {
    const section = document.createElement('div');
    section.dataset.audienceFooter = '';
    section.className = 'mt-10 border-t border-line/60 pt-8';

    const columns = document.createElement('div');
    columns.className = 'grid gap-8';
    const groups = [
      {
        title: 'For Professionals',
        links: [
          [`${rootPrefix}candidate-services.html`, 'Individual Career Services'],
          [`${rootPrefix}services.html`, 'Private Career Representation'],
          [`${rootPrefix}how-it-works.html`, 'How It Works'],
          [`${rootPrefix}pricing.html`, 'Pricing'],
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
    whyLink.textContent = 'Why KOV';
    section.append(columns, whyLink);
    const footerNote = footerContainer.lastElementChild;
    const pageCatalog = footerContainer.querySelector(':scope > [data-kov-footer-categories]');
    footerContainer.insertBefore(section, pageCatalog || footerNote);
  }

  function normalizeFooter() {
    if (!footer || footer.classList.contains('kov-uniform-footer') || !footerContainer || footerContainer.querySelector(':scope > [data-kov-footer-directory]')) return;

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
        directory.insertBefore(column, directory.children[2] || null);
      }
    }

    const brandRow = document.createElement('div');
    brandRow.className = 'kov-footer-brand-row';
    if (brand) brandRow.append(brand);

    const privacyLink = [...footer.querySelectorAll('a')].find((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      return href.includes('privacy.html');
    });

    const bottomBar = document.createElement('div');
    bottomBar.className = 'kov-footer-bottom-bar';

    const keepBar = footerContainer.querySelector('.kov-footer-bottom-bar') || bottomBar;
    const finalBar = keepBar === bottomBar ? bottomBar : keepBar;

    if (legal) {
      const legalNode = legal.closest('[class*="mt-10"], [class*="flex-col"], [class*="justify-between"], .kov-legal') || legal;
      legalNode.classList.add('kov-legal');
      legalNode.classList.remove('mt-10', 'flex', 'flex-col', 'gap-2', 'border-t', 'border-line/60', 'pt-6', 'md:flex-row', 'md:items-center', 'md:justify-between');
      legalNode.removeAttribute('style');
      legalNode.remove();
      if (!finalBar.contains(legalNode)) finalBar.append(legalNode);
    }

    if (privacyLink && !finalBar.querySelector('a[href*="privacy.html"]')) {
      privacyLink.classList.add('kov-footer-privacy-link');
      privacyLink.remove();
      finalBar.append(privacyLink);
    }

    const translateWidget = document.getElementById('kov-translate-widget');
    if (translateWidget && !finalBar.contains(translateWidget)) {
      finalBar.append(translateWidget);
    }

    const duplicateBars = [...footerContainer.querySelectorAll('.kov-footer-bottom-bar')].filter((el) => el !== finalBar);
    duplicateBars.forEach((bar) => {
      while (bar.firstChild) finalBar.appendChild(bar.firstChild);
      bar.remove();
    });

    const targetBar = footerContainer.querySelector('.kov-footer-bottom-bar') || bottomBar;
    footerContainer.replaceChildren();
    if (brandRow.childElementCount) footerContainer.append(brandRow);
    footerContainer.append(directory);
    if (targetBar.childElementCount) footerContainer.append(targetBar);
  }

  normalizeFooter();
})();
