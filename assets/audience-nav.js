(() => {
  const destinations = [
    ['candidate-services.html', 'For Candidates'],
    ['company-services.html', 'For Companies'],
  ];
  const desktopNav = document.querySelector('header nav:not(.site-mobile-menu-nav)');
  const mobileNav = document.querySelector('.site-mobile-menu-nav');

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
      mobileSource.srcset = 'assets/kov-executive-intelligence-network-mobile.svg';
      const image = document.createElement('img');
      image.src = 'assets/kov-executive-intelligence-network.svg';
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
    if (desktopNav && !desktopNav.querySelector(`a[href="${href}"]`)) {
      const link = document.createElement('a');
      link.href = href;
      link.className = 'transition-colors hover:text-ink';
      link.textContent = label;
      const cta = desktopNav.querySelector('a[href="contact.html"]');
      desktopNav.insertBefore(link, cta);
    }

    if (mobileNav && !mobileNav.querySelector(`a[href="${href}"]`)) {
      const link = document.createElement('a');
      link.href = href;
      link.dataset.mobileMenuLink = '';
      link.textContent = label;
      const cta = mobileNav.querySelector('a[href="contact.html"]');
      mobileNav.insertBefore(link, cta);
    }
  }

  const footerContainer = document.querySelector('footer > .mx-auto');
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
          ['candidate-services.html', 'Candidate Services'],
          ['services.html', 'Reverse Recruiting'],
          ['how-it-works.html', 'How It Works'],
          ['pricing.html', 'Pricing'],
        ],
      },
      {
        title: 'For Companies',
        links: [
          ['global-talent-sourcer.html', 'Global Talent Sourcing'],
          ['company-services.html', 'Company Services'],
          ['how-it-works.html', 'How It Works'],
          ['contact.html', 'Contact'],
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
    whyLink.href = 'why-kov.html';
    whyLink.className = 'mt-6 inline-block text-[13px] font-medium text-ink underline underline-offset-4 hover:text-orange';
    whyLink.textContent = 'Why KOV: Two Practices. One Founder.';
    section.append(columns, whyLink);
    const footerNote = footerContainer.lastElementChild;
    footerContainer.insertBefore(section, footerNote);
  }
})();
