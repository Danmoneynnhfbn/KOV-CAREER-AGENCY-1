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

  const processSection = sectionWithLabel('Choose a process');
  const processHeading = headingIn(processSection, 'Which KOV process');
  const processTarget = processHeading?.parentElement;
  const processLinkRow = processTarget?.querySelector(':scope > p.flex');
  const processSummary = [...(processTarget?.querySelectorAll(':scope > p') || [])].find((paragraph) =>
    paragraph.textContent.includes('candidate practice is built around')
  );
  const workflowHeading = processTarget?.querySelector(':scope > h3');
  if (processSection && processTarget && processLinkRow && processSummary && workflowHeading && !processTarget.querySelector('[data-workflow-switcher]')) {
    const source = normalize(processSummary.innerText);
    const companyPhrase = 'The company practice is built around';
    const splitIndex = source.indexOf(companyPhrase);
    const candidateCopy = splitIndex > -1 ? source.slice(0, splitIndex).replace(/Both are deliberately structured\..*$/, '').trim() : source;
    const companyCopy = splitIndex > -1 ? source.slice(splitIndex).replace(/Both are deliberately structured\..*$/, '').trim() : source;
    const switcher = document.createElement('div');
    const tablist = document.createElement('div');
    const panels = document.createElement('div');
    const switcherId = `workflow-${Math.random().toString(36).slice(2, 8)}`;
    switcher.className = 'workflow-switcher';
    switcher.dataset.workflowSwitcher = '';
    tablist.className = 'workflow-tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Choose a KOV process');
    panels.className = 'workflow-panels';

    const workflows = [
      { key: 'candidate', label: 'Candidate Search', title: 'Private representation', copy: candidateCopy, href: 'candidate-services.html', action: 'Explore Candidate Services' },
      { key: 'company', label: 'Company Search', title: 'Global talent sourcing', copy: companyCopy, href: 'company-services.html', action: 'Explore Company Services' },
    ];

    workflows.forEach((workflow, index) => {
      const tab = document.createElement('button');
      const panel = document.createElement('div');
      const title = document.createElement('h3');
      const copy = document.createElement('p');
      const link = document.createElement('a');
      tab.type = 'button';
      tab.id = `${switcherId}-tab-${workflow.key}`;
      tab.dataset.workflowTarget = workflow.key;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${switcherId}-panel-${workflow.key}`);
      tab.setAttribute('aria-selected', String(index === 0));
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.textContent = workflow.label;
      tablist.append(tab);

      panel.id = `${switcherId}-panel-${workflow.key}`;
      panel.className = 'workflow-panel';
      panel.dataset.workflowPanel = workflow.key;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.hidden = index !== 0;
      title.textContent = workflow.title;
      copy.textContent = workflow.copy;
      link.className = 'workflow-action';
      link.href = workflow.href;
      link.textContent = workflow.action;
      panel.append(title, copy, link);
      panels.append(panel);
    });

    switcher.append(tablist, panels);
    processTarget.insertBefore(switcher, workflowHeading);
    processLinkRow.hidden = true;
    workflowHeading.hidden = true;
    processSummary.hidden = true;
    processSection.classList.add('workflow-choice-section');

    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const activate = (tab, focus = false) => {
      const selected = tab.dataset.workflowTarget;
      switcher.dataset.activeWorkflow = selected;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        item.classList.toggle('is-active', active);
      });
      panels.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
        panel.hidden = panel.dataset.workflowPanel !== selected;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(tabs[targetIndex], true);
      });
    });
    activate(tabs[0]);
  }

  const faqSection = sections.find((section) => section.querySelector('button[aria-expanded]'));
  faqSection?.classList.add('faq-editorial-section');

  const marketSection = sections.find((section) => headingIn(section, 'Research the market. Then approach the person.'));
  marketSection?.classList.add('market-research-section');
})();
