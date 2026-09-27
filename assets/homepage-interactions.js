(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const createSwitcher = (section, target, label, entries, link) => {
    const switcher = document.createElement('div');
    const tablist = document.createElement('div');
    const panels = document.createElement('div');
    const switcherId = `home-switch-${Math.random().toString(36).slice(2, 8)}`;
    switcher.className = 'home-content-switcher';
    switcher.dataset.contentSwitcher = '';
    tablist.className = 'home-content-tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', label);
    panels.className = 'home-content-panels';

    entries.forEach((entry, index) => {
      const tab = document.createElement('button');
      const panel = document.createElement('div');
      const heading = document.createElement('h3');
      const copy = document.createElement('p');
      tab.type = 'button';
      tab.id = `${switcherId}-tab-${entry.key}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${switcherId}-panel-${entry.key}`);
      tab.setAttribute('aria-selected', String(index === 0));
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.dataset.panelTarget = entry.key;
      tab.textContent = entry.label;
      tablist.append(tab);

      panel.id = `${switcherId}-panel-${entry.key}`;
      panel.className = 'home-content-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.dataset.switchPanel = entry.key;
      panel.hidden = index !== 0;
      heading.textContent = entry.title || entry.label;
      copy.textContent = entry.copy;
      panel.append(heading, copy);
      if (entry.href && entry.action) {
        const action = document.createElement('a');
        action.className = 'hero-interlink home-panel-action';
        action.href = entry.href;
        action.textContent = entry.action;
        panel.append(action);
      }
      panels.append(panel);
    });

    switcher.append(tablist, panels);
    target.insertBefore(switcher, link || null);
    section.classList.add('home-reactive-section');
    section.dataset.homeReactive = '';
    return switcher;
  };

  const headings = [...document.querySelectorAll('main h2')];
  const headingFor = (text) => headings.find((heading) => heading.textContent.trim() === text);

  const whyHeading = headingFor('The work happens behind the scenes.');
  const whySection = whyHeading?.closest('section');
  const whyColumn = whyHeading?.parentElement?.nextElementSibling;
  if (whySection && whyColumn && !whySection.dataset.homeReactive) {
    const paragraphs = [...whyColumn.querySelectorAll(':scope > p')];
    const link = whyColumn.querySelector(':scope > a');
    if (paragraphs.length >= 3) {
      createSwitcher(whySection, whyColumn, 'Why KOV search stages', [
        { key: 'research', label: 'Research', copy: paragraphs[0].textContent.trim() },
        { key: 'execution', label: 'Execution', copy: paragraphs[1].textContent.trim() },
        { key: 'representation', label: 'Representation', copy: paragraphs[2].textContent.trim() },
      ], link);
      paragraphs.forEach((paragraph) => { paragraph.hidden = true; });
      if (link) link.classList.add('hero-interlink', 'hero-interlink-outline');
    }
  }

  const audienceHeading = headingFor('Different side of the market. Same search discipline.');
  const audienceSection = audienceHeading?.closest('section');
  const audienceTarget = audienceHeading?.parentElement;
  const audienceCopy = audienceTarget?.querySelector(':scope > p');
  const audienceLink = audienceTarget?.querySelector(':scope > a');
  if (audienceSection && audienceTarget && audienceCopy && !audienceSection.dataset.homeReactive) {
    createSwitcher(audienceSection, audienceTarget, 'Choose a side of the search', [
      {
        key: 'candidate',
        label: 'For Candidates',
        title: 'Representation and execution',
        copy: 'The candidate practice is about representation and execution.',
        href: 'candidate-services.html',
        action: 'Explore Candidate Services',
      },
      {
        key: 'company',
        label: 'For Companies',
        title: 'Research and talent sourcing',
        copy: 'The company practice is about research and talent sourcing. The distinction is deliberate.',
        href: 'company-services.html',
        action: 'Explore Company Services',
      },
    ], audienceLink);
    audienceCopy.hidden = true;
    if (audienceLink) audienceLink.classList.add('hero-interlink', 'hero-interlink-outline');
  }

  const intelligenceHeading = headingFor('Research first. Outreach second.');
  const intelligenceSection = intelligenceHeading?.closest('section');
  const intelligenceCopy = intelligenceSection?.querySelector(':scope > p');
  const intelligenceTarget = intelligenceHeading?.parentElement;
  if (intelligenceSection && intelligenceCopy && intelligenceTarget && !intelligenceSection.dataset.homeReactive) {
    const text = intelligenceCopy.textContent.trim();
    const professionalStart = text.indexOf('For a professional,');
    const companyStart = text.indexOf('For a company,');
    const professionalCopy = professionalStart >= 0 && companyStart > professionalStart
      ? text.slice(professionalStart, companyStart).trim()
      : text;
    const companyCopy = companyStart >= 0 ? text.slice(companyStart).trim() : text;
    createSwitcher(intelligenceSection, intelligenceTarget, 'Search research by audience', [
      { key: 'professional', label: 'Professional search', copy: professionalCopy },
      { key: 'company', label: 'Company search', copy: companyCopy },
    ]);
    intelligenceCopy.hidden = true;
  }

  const humanSearchSection = [...document.querySelectorAll('main section')].find((section) =>
    section.querySelector('h2')?.textContent.trim() === 'Not every opportunity lives on a job board.'
  );
  if (humanSearchSection && !humanSearchSection.querySelector('[data-content-switcher]')) {
    const target = humanSearchSection.querySelector('.mx-auto');
    const copy = target?.querySelector('p.max-w-3xl');
    if (target && copy) {
      const sentences = copy.textContent.trim().split(/(?<=\.)\s+/).slice(0, 4);
      const labels = ['Recruiter relationships', 'Hiring conversations', 'Warm introductions', 'Passive talent'];
      const entries = sentences.map((text, index) => ({ key: `opportunity-${index + 1}`, label: labels[index], copy: text }));
      createSwitcher(humanSearchSection, target, 'Opportunity channels', entries);
      copy.hidden = true;
    }
  }

  document.querySelectorAll('[data-review-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('[data-review-slide]')];
    const previous = carousel.querySelector('[data-review-prev]');
    const next = carousel.querySelector('[data-review-next]');
    const toggle = carousel.querySelector('[data-review-toggle]');
    const count = carousel.querySelector('[data-review-count]');
    const progress = carousel.querySelector('[data-review-progress]');
    if (slides.length < 2 || !previous || !next || !count || !progress) return;

    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', 'Client review excerpts');
    const toggleButton = toggle || document.createElement('button');
    if (!toggle) {
      toggleButton.type = 'button';
      toggleButton.dataset.reviewToggle = '';
      carousel.querySelector('.client-review-buttons')?.append(toggleButton);
    }

    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    const slideContainer = carousel.querySelector('.client-review-slides');
    if (slideContainer && !slideContainer.id) slideContainer.id = 'client-review-slides';
    previous.removeAttribute('disabled');
    previous.setAttribute('aria-controls', slideContainer?.id || '');
    next.setAttribute('aria-controls', slideContainer?.id || '');
    let timer = 0;
    let paused = reduceMotion;
    const interval = 8000;

    const render = () => {
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        if (active) slide.removeAttribute('inert');
        else slide.setAttribute('inert', '');
      });
      count.firstChild.textContent = `${String(activeIndex + 1).padStart(2, '0')} `;
      toggleButton.setAttribute('aria-pressed', String(paused));
      toggleButton.setAttribute('aria-label', paused ? 'Play review excerpts' : 'Pause review excerpts');
      toggleButton.textContent = paused ? 'Play' : 'Pause';
      carousel.classList.toggle('is-paused', paused);
      progress.style.setProperty('--review-duration', `${interval}ms`);
      progress.classList.remove('is-running');
      if (!paused) requestAnimationFrame(() => progress.classList.add('is-running'));
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const schedule = () => {
      stop();
      if (paused) return;
      timer = window.setTimeout(() => {
        activeIndex = (activeIndex + 1) % slides.length;
        render();
        schedule();
      }, interval);
    };

    const move = (direction) => {
      activeIndex = (activeIndex + direction + slides.length) % slides.length;
      render();
      schedule();
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    toggleButton.addEventListener('click', () => {
      paused = !paused;
      render();
      schedule();
    });
    carousel.addEventListener('mouseenter', () => {
      stop();
      progress.classList.remove('is-running');
    });
    carousel.addEventListener('mouseleave', schedule);
    carousel.addEventListener('focusin', () => {
      stop();
      progress.classList.remove('is-running');
    });
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) schedule();
    });
    carousel.addEventListener('keydown', (event) => {
      if (event.target.closest('button')) return;
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
    render();
    schedule();
  });

  document.querySelectorAll('[data-content-switcher]').forEach((switcher) => {
    const tabs = [...switcher.querySelectorAll('[role="tab"][data-panel-target]')];
    const panels = [...switcher.querySelectorAll('[role="tabpanel"][data-switch-panel]')];
    if (tabs.length < 2 || panels.length < 2) return;

    const activate = (tab, moveFocus = false) => {
      const target = tab.dataset.panelTarget;
      switcher.dataset.activePanel = target;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        item.classList.toggle('is-active', active);
      });
      panels.forEach((panel) => {
        const active = panel.dataset.switchPanel === target;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(tabs[nextIndex], true);
      });
    });

    const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    activate(initial);
  });
})();
