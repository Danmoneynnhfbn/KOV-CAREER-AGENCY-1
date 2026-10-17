(() => {
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

  const intelligenceHeading = headingFor('Research first. Outreach second.');
  const intelligenceSection = intelligenceHeading?.closest('section');
  const intelligenceCopy = intelligenceSection?.querySelector(':scope > p');
  const intelligenceTarget = intelligenceHeading?.parentElement;
  if (intelligenceSection && intelligenceCopy && intelligenceTarget && !intelligenceSection.dataset.homeReactive) {
    intelligenceSection.classList.add('home-reactive-section');
    intelligenceSection.dataset.homeReactive = '';
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
