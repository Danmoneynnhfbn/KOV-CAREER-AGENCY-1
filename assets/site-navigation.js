(() => {
  if (window.kovGlobalNavigationReady) return;
  window.kovGlobalNavigationReady = true;

  const pages = [
    { href: '/', label: 'Home', matches: ['/', '/index.html'] },
    {
      href: '/candidate-services.html',
      label: 'Individual Career Services',
      matches: ['/candidate-services.html', '/candidate-proof.html'],
    },
    {
      href: '/services.html',
      label: 'Private Career Representation',
      matches: ['/services.html', '/career-documents.html'],
    },
    { href: '/how-it-works.html', label: 'How It Works', matches: ['/how-it-works.html'] },
    { href: '/roles/', label: 'Roles', matches: ['/roles/'] },
    { href: '/industries/', label: 'Industries', matches: ['/industries/'] },
    { href: '/faq/index.html', label: 'FAQ Library', matches: ['/faq/index.html'] },
    { href: '/blog.html', label: 'Insights', matches: ['/blog.html'] },
    { href: '/contact.html', label: 'Contact', matches: ['/contact.html'] },
  ];

  function currentPath() {
    return new URL(window.location.href).pathname;
  }

  function createLink(page, mobile) {
    const link = document.createElement('a');
    link.href = page.href;
    link.className = 'kov-global-nav-link';
    link.textContent = page.label;
    if (mobile) link.dataset.mobileMenuLink = '';
    if (page.matches.includes(currentPath())) {
      link.setAttribute('aria-current', 'page');
    }
    return link;
  }

  function normalizeNavigation(navigation, mobile) {
    if (!navigation) return;

    navigation.setAttribute('aria-label', 'Primary navigation');
    const preserved = [...navigation.children].filter((child) =>
      child.matches('.site-search-trigger, .kov-topic-nav, [data-kov-preserve-nav]')
    );
    const contact = [...navigation.querySelectorAll(':scope > a')].find((link) =>
      link.classList.contains('kov-nav-cta') ||
      /contact|start|conversation|get started/i.test(link.textContent)
    );

    [...navigation.children].forEach((child) => {
      if (preserved.includes(child) || child === contact) return;
      if (child.matches('a, button') || child.querySelector('a')) child.remove();
    });

    const fragment = document.createDocumentFragment();
    const visiblePages = mobile ? pages : pages.filter((page) => page.href !== '/contact.html');
    visiblePages.forEach((page) => {
      const link = createLink(page, mobile);
      if (page.href === '/contact.html' && contact) {
        link.href = new URL(contact.getAttribute('href') || '/contact.html', `${window.location.origin}/`).href;
      }
      fragment.append(link);
    });
    if (!mobile) {
      const contactLink = contact || createLink(pages.find((page) => page.href === '/contact.html'), false);
      contactLink.href = new URL(contact?.getAttribute('href') || '/contact.html', `${window.location.origin}/`).href;
      contactLink.textContent = 'Start a conversation';
      contactLink.classList.remove('kov-global-nav-link');
      contactLink.classList.add('kov-global-nav-cta');
      contactLink.removeAttribute('aria-current');
      fragment.append(contactLink);
    }
    preserved.forEach((child) => fragment.append(child));
    navigation.replaceChildren(fragment);
  }

  const headers = [...document.querySelectorAll('header')];
  headers.forEach((header) => {
    const desktop = [...header.querySelectorAll('nav')].find((navigation) =>
      !navigation.closest('.site-mobile-menu, .seo-mobile-menu') &&
      !navigation.classList.contains('site-mobile-menu-nav')
    );
    const mobile = header.querySelector(
      '.site-mobile-menu-nav, .seo-mobile-menu nav, .kov-mobile-nav, [data-mobile-menu-nav]'
    ) || document.querySelector(
      '.site-mobile-menu-nav, .seo-mobile-menu nav, .kov-mobile-nav, [data-mobile-menu-nav]'
    );
    normalizeNavigation(desktop, false);
    if (mobile !== desktop) normalizeNavigation(mobile, true);
  });

  if (!headers.length) {
    const header = document.createElement('header');
    header.className = 'kov-global-nav-header';
    const brand = document.createElement('a');
    brand.className = 'kov-staging-brand';
    brand.href = "/";
    brand.textContent = "KOV Career Agency";
    const navigation = document.createElement('nav');
    navigation.setAttribute('aria-label', 'Primary navigation');
    pages.forEach((page) => navigation.append(createLink(page, false)));
    header.append(brand, navigation);
    document.body.prepend(header);
  }
})();
