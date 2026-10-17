(() => {
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const sections = [...document.querySelectorAll('main section')];
  const sectionWithLabel = (label) => sections.find((section) =>
    [...section.querySelectorAll('p')].some((paragraph) => normalize(paragraph.innerText) === label)
  );
  const headingIn = (section, includes) => [...(section?.querySelectorAll('h2, h3') || [])].find((heading) =>
    normalize(heading.innerText).includes(includes)
  );

  const aboutStory = sectionWithLabel('My story');
  const storyCopy = aboutStory?.querySelector('.max-w-3xl.space-y-6');
  if (storyCopy && !storyCopy.classList.contains('about-story-copy')) {
    aboutStory.classList.add('about-story-section');
    storyCopy.classList.add('about-story-copy');
    [...storyCopy.querySelectorAll(':scope > p')].forEach((paragraph, index) => {
      paragraph.classList.add('about-story-beat');
      paragraph.dataset.storyStep = String(index + 1).padStart(2, '0');
    });
  }

  const boutique = sections.find((section) => headingIn(section, 'Boutique') && section.querySelector('ul'));
  if (boutique) {
    boutique.classList.add('boutique-principles-section');
    boutique.querySelector('ul')?.classList.add('boutique-principles');
  }

  const expertise = sectionWithLabel('Areas of expertise');
  if (expertise) {
    expertise.classList.add('about-expertise-section');
    const grid = expertise.querySelector('.grid');
    grid?.classList.add('about-expertise-grid');
  }

  const faqSection = sections.find((section) => section.querySelector('button[aria-expanded]'));
  faqSection?.classList.add('faq-editorial-section');

  const marketSection = sections.find((section) => headingIn(section, 'Research the market. Then approach the person.'));
  marketSection?.classList.add('market-research-section');
})();
