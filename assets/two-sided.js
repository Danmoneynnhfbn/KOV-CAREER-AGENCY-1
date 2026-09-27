(() => {
  const createFigure = (src, alt, caption, mobileSrc) => {
    const figure = document.createElement('figure');
    figure.className = 'kov-art-figure kov-art-frame';
    const picture = document.createElement('picture');
    if (mobileSrc) {
      const mobileSource = document.createElement('source');
      mobileSource.media = '(max-width: 680px)';
      mobileSource.srcset = mobileSrc;
      picture.append(mobileSource);
    }
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = 'lazy';
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'kov-art-caption';
    figcaption.textContent = caption;
    picture.append(image);
    figure.append(picture, figcaption);
    return figure;
  };

  const sections = [...document.querySelectorAll('.two-sided-page main section')];
  const headingIn = (section, text) =>
    [...section.querySelectorAll('h2')].some((heading) => heading.textContent.trim() === text);

  const searchProcess = sections.find((section) =>
    headingIn(section, 'From target role to signed offer.')
  );
  if (searchProcess && !searchProcess.querySelector('.kov-search-route')) {
    const route = document.createElement('ol');
    route.className = 'kov-search-route';
    route.setAttribute('aria-label', 'Candidate search route');
    const stages = [
      ['Target role', 'Define the direction'],
      ['Target companies', 'Map relevant organizations'],
      ['Opportunities', 'Identify suitable roles'],
      ['Recruiters', 'Reach relevant contacts'],
      ['Hiring managers', 'Start informed conversations'],
      ['Interviews', 'Prepare and engage'],
      ['Offer', 'Evaluate terms and next steps'],
    ];
    for (const [title, detail] of stages) {
      const item = document.createElement('li');
      const label = document.createElement('b');
      label.textContent = title;
      const explanation = document.createElement('span');
      explanation.textContent = detail;
      item.append(label, explanation);
      route.append(item);
    }
    searchProcess.append(route);
  }

  const difference = sections.find((section) =>
    headingIn(section, 'This is representation, not just coaching.')
  );
  if (difference && !difference.nextElementSibling?.hasAttribute('data-decision-network')) {
    const networkSection = document.createElement('section');
    networkSection.className = 'kov-section kov-section-tint';
    networkSection.dataset.decisionNetwork = '';
    const heading = document.createElement('div');
    heading.className = 'kov-section-heading';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'kov-eyebrow';
    eyebrow.textContent = 'BEYOND THE APPLICATION QUEUE';
    const title = document.createElement('h2');
    title.textContent = 'KOV identifies the people behind the hiring process.';
    const copy = document.createElement('p');
    copy.className = 'kov-copy';
    copy.textContent = 'A search can extend beyond submitting a resume. Depending on the role, relevant connections may include executives, recruiters, and hiring managers.';
    heading.append(eyebrow, title, copy);
    const figure = createFigure(
      'assets/kov-executive-intelligence-network.svg',
      'KOV search connections with executives, recruiters, hiring managers, companies, and professional networks',
      'A research-led network around the hiring process.',
      'assets/kov-executive-intelligence-network-mobile.svg'
    );
    networkSection.append(heading, figure);
    difference.after(networkSection);
  }

  const researchSection = sections.find((section) =>
    headingIn(section, 'Research before outreach.')
  );
  if (researchSection && !researchSection.nextElementSibling?.hasAttribute('data-research-layer')) {
    const layerSection = document.createElement('section');
    layerSection.className = 'kov-section kov-section-tint';
    layerSection.dataset.researchLayer = '';
    const heading = document.createElement('div');
    heading.className = 'kov-section-heading';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'kov-eyebrow';
    eyebrow.textContent = 'KOV RESEARCH LAYER';
    const title = document.createElement('h2');
    title.textContent = 'A view of the market before outreach.';
    heading.append(eyebrow, title);
    const figure = createFigure(
      'assets/kov-research-layer.svg',
      'Illustrative research interface showing target companies, executive profiles, career histories, industry signals, professional networks, and market intelligence',
      'Illustrative interface. No client data or performance figures.',
      'assets/kov-research-layer-mobile.svg'
    );
    layerSection.append(heading, figure);
    researchSection.after(layerSection);
  }

  const toggle = document.querySelector('.kov-menu-toggle');
  const menu = document.getElementById('kov-mobile-nav');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    menu.hidden = isExpanded;
  });
})();
