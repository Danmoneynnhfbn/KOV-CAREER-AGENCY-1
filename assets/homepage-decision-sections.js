(() => {
  const buildSwitcher = (section, target, label, entries, options = {}) => {
    if (target.querySelector('[data-decision-switcher], [data-content-switcher]')) return;

    const switcher = document.createElement('div');
    const tablist = document.createElement('div');
    const panels = document.createElement('div');
    const id = `decision-switch-${Math.random().toString(36).slice(2, 8)}`;
    switcher.className = 'home-content-switcher';
    switcher.dataset.decisionSwitcher = '';
    tablist.className = 'home-content-tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', label);
    panels.className = 'home-content-panels';

    entries.forEach((entry, index) => {
      const tab = document.createElement('button');
      const panel = document.createElement('div');
      const title = document.createElement('h3');
      const copy = document.createElement('p');
      tab.type = 'button';
      tab.id = `${id}-tab-${entry.key}`;
      tab.dataset.panelTarget = entry.key;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${id}-panel-${entry.key}`);
      tab.setAttribute('aria-selected', String(index === 0));
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.textContent = entry.label;

      panel.id = `${id}-panel-${entry.key}`;
      panel.className = 'home-content-panel';
      panel.dataset.switchPanel = entry.key;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.hidden = index !== 0;
      title.textContent = entry.title;
      copy.textContent = entry.copy;
      panel.append(title, copy);

      if (entry.href) {
        const action = document.createElement('a');
        action.className = 'hero-interlink home-panel-action';
        action.href = entry.href;
        action.textContent = entry.action;
        panel.append(action);
      }
      tablist.append(tab);
      panels.append(panel);
    });

    switcher.append(tablist, panels);
    target.insertBefore(switcher, options.before || null);
    section.dataset.homeReactive = '';
    section.classList.add(options.dark ? 'home-reactive-dark' : 'home-reactive-section');

    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const activate = (tab, focus = false) => {
      switcher.dataset.activePanel = tab.dataset.panelTarget;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        item.classList.toggle('is-active', active);
      });
      panels.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
        panel.hidden = panel.dataset.switchPanel !== tab.dataset.panelTarget;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(tabs[next], true);
      });
    });
    activate(tabs[0]);
  };

  const headings = [...document.querySelectorAll('h2')];
  const humanHeading = headings.find((heading) => heading.textContent.trim() === 'Not every opportunity lives on a job board.');
  const humanSection = humanHeading?.closest('section');
  const humanTarget = humanHeading?.parentElement;
  const humanCopy = humanTarget?.querySelector('p.max-w-3xl');
  if (humanSection && humanTarget && humanCopy && !humanTarget.querySelector('[data-decision-switcher], [data-content-switcher]')) {
    const sentences = humanCopy.textContent.trim().split(/(?<=\.)\s+/).slice(0, 4);
    const labels = ['Recruiter relationships', 'Hiring conversations', 'Warm introductions', 'Passive talent'];
    buildSwitcher(humanSection, humanTarget, 'Opportunity channels', sentences.map((copy, index) => ({
      key: `channel-${index + 1}`,
      label: labels[index],
      title: labels[index],
      copy,
    })));
    humanCopy.hidden = true;
  }

})();
