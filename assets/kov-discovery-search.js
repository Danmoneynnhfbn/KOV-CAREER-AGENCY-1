(() => {
  'use strict';
  if (window.kovDiscoverySearchReady) return;
  window.kovDiscoverySearchReady = true;

  const dialog = document.querySelector('.site-search-dialog');
  const input = dialog?.querySelector('.site-search-input');
  const form = dialog?.querySelector('.site-search-form');
  const pageResults = dialog?.querySelector('.site-search-results');
  const assetBase = new URL('.', document.currentScript?.src || `${location.origin}/assets/`);
  if (!dialog || !input || !form || !pageResults) return;
  dialog.querySelectorAll('.kov-search-ideas').forEach((panel) => panel.remove());

  const normalize = (value) => String(value || '').toLocaleLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const categoryMeta = {
    roles: { label: 'Job titles & occupations', count: '98,380 titles · 1,655 occupations', href: '/roles.html' },
    skills: { label: 'Skills & related terms', count: '560 ESCO skills · 8,884 alternate labels', href: '/professional-directory/index.html' },
    industries: { label: 'NAICS industries', count: '2,125 U.S. classification records', href: '/industries.html' },
    places: { label: 'Countries & cities', count: '197 countries · 50,250 cities', href: '/countries-we-serve.html' },
  };
  const scopes = ['roles', 'skills', 'industries', 'places'];
  const loaded = new Map();
  const indexes = new Map();
  let activeScope = 'roles';
  let renderToken = 0;
  let debounceId = 0;
  let roleAliasPromise;

  const discover = document.createElement('section');
  discover.className = 'kov-discovery-search';
  discover.setAttribute('aria-labelledby', 'kov-discovery-search-title');
  const heading = document.createElement('div');
  heading.className = 'kov-discovery-search-heading';
  const headingCopy = document.createElement('div');
  const overline = document.createElement('p');
  overline.className = 'kov-search-overline';
  overline.textContent = 'KOV PROFESSIONAL LIBRARY';
  const title = document.createElement('h3');
  title.id = 'kov-discovery-search-title';
  title.textContent = 'Search professional records';
  const subtitle = document.createElement('p');
  subtitle.className = 'kov-search-scope-count';
  subtitle.textContent = categoryMeta.roles.count;
  headingCopy.append(overline, title, subtitle);
  const suggestion = document.createElement('button');
  suggestion.type = 'button';
  suggestion.className = 'kov-search-suggestion';
  suggestion.setAttribute('aria-label', 'Search the suggested topic');
  heading.append(headingCopy, suggestion);

  const tabs = document.createElement('div');
  tabs.className = 'kov-search-scopes';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Professional record category');
  const scopeButtons = new Map();
  for (const scope of scopes) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kov-search-scope';
    button.id = `kov-search-scope-${scope}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'kov-discovery-panel');
    button.setAttribute('aria-selected', String(scope === activeScope));
    button.tabIndex = scope === activeScope ? 0 : -1;
    button.textContent = categoryMeta[scope].label;
    button.addEventListener('click', () => selectScope(scope, true));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = scopes.indexOf(scope);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? scopes.length - 1
        : (current + (event.key === 'ArrowRight' ? 1 : -1) + scopes.length) % scopes.length;
      scopeButtons.get(scopes[next]).focus();
      selectScope(scopes[next], true);
    });
    scopeButtons.set(scope, button);
    tabs.append(button);
  }

  const unavailable = document.createElement('p');
  unavailable.className = 'kov-search-unavailable';
  unavailable.textContent = 'Qualification records are not included: the local list has no verified registry source.';
  const live = document.createElement('p');
  live.className = 'kov-discovery-status';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('role', 'status');
  live.textContent = 'Choose a category and enter a title, skill, industry, country, or city.';
  const results = document.createElement('ul');
  results.className = 'kov-discovery-results';
  results.id = 'kov-discovery-results';
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'Professional discovery results');
  const panel = document.createElement('div');
  panel.className = 'kov-discovery-panel';
  panel.id = 'kov-discovery-panel';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', scopeButtons.get(activeScope).id);
  panel.append(results);
  discover.append(heading, tabs, unavailable, live, panel);
  form.insertAdjacentElement('afterend', discover);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', results.id);
  input.setAttribute('aria-describedby', live.id);
  live.id = 'kov-discovery-status';

  function loadScript(filename, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    if (loaded.has(filename)) return loaded.get(filename);
    const task = new Promise((resolve, reject) => {
      let script = [...document.scripts].find((item) => item.src && new URL(item.src).pathname.endsWith(`/assets/${filename}`));
      const existing = Boolean(script);
      if (!script) {
        script = document.createElement('script');
        script.src = new URL(filename, assetBase).href;
        script.async = true;
        script.dataset.kovSearchData = filename;
      }
      const succeed = () => window[globalName]
        ? resolve(window[globalName])
        : reject(new Error(`The ${filename} record index did not initialize.`));
      script.addEventListener('load', succeed, { once: true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${filename}.`)), { once: true });
      if (!existing) document.head.append(script);
    }).catch((error) => {
      loaded.delete(filename);
      throw error;
    });
    loaded.set(filename, task);
    return task;
  }

  function itemRecord(label, kind, terms = [], details = '', href = '') {
    const text = String(label || '').trim();
    if (!text) return null;
    const aliases = Array.isArray(terms) ? terms.filter(Boolean).map(String) : [String(terms || '')].filter(Boolean);
    return { label: text, kind, aliases, searchText: [text, ...aliases].join(' '), details, href };
  }

  async function buildIndex(scope) {
    if (indexes.has(scope)) return indexes.get(scope);
    let records = [];
    if (scope === 'roles') {
      const data = await loadScript('role-taxonomy.js', 'kovRoleTaxonomy');
      records = [
        ...(data.jobTitles || []).map((label) => itemRecord(label, 'Job title', [], 'Local KOV job-title index')),
        ...(data.occupations || []).map((label) => itemRecord(label, 'Occupation', [], 'Local KOV occupation index')),
      ];
    } else if (scope === 'skills') {
      const data = await loadScript('esco-taxonomy.js', 'kovEscoTaxonomy');
      const skills = data.skillDirectory || [];
      const byUri = new Map(skills.map((item) => [item.id, item]));
      const aliases = new Map();
      for (const term of data.professionalSynonymDirectory || []) {
        if (term.conceptType !== 'skill') continue;
        const preferred = byUri.get(term.conceptUri);
        if (!preferred) continue;
        const key = normalize(preferred.name);
        if (!aliases.has(key)) aliases.set(key, new Set());
        aliases.get(key).add(`${term.term} (${term.language})`);
      }
      records = skills.map((item) => {
        const alt = item.alternativeLabels || [];
        const synonyms = [...new Set([...(aliases.get(normalize(item.name)) || []), ...alt])];
        return itemRecord(item.name, 'ESCO skill', synonyms, `${item.description || 'Professional skill'} · European Commission ESCO`);
      });
    } else if (scope === 'industries') {
      const module = await loadScript('industry-directory.js', 'kovIndustryDirectory');
      records = module.map((item) => itemRecord(
        item.name.replace(/T$/, ''), 'NAICS industry', [item.code, item.slug],
        `${item.level} · United States 2022 NAICS · Code ${item.code}`
      ));
    } else if (scope === 'places') {
      await loadScript('world-cities.js', 'kovWorldCities');
      const countries = await loadScript('country-directory.js', 'kovCountryDirectory');
      const countryRecords = countries.map((item) => itemRecord(
        item.country, 'Country', [item.iso2, item.iso3, item.region, ...(item.divisions || [])],
        `${item.region} · ${item.iso2} · ${item.identifierSource || 'Country directory'}`
      ));
      const cityRecords = (window.kovWorldCities || []).map((item) => itemRecord(
        item.city, 'City', [item.city_ascii, item.admin_name, item.country, item.iso2],
        [item.admin_name, item.country].filter(Boolean).join(' · ')
      ));
      records = [...countryRecords, ...cityRecords];
    }
    const prepared = records.filter(Boolean).map((record) => ({ ...record, normalized: normalize(record.searchText) }));
    indexes.set(scope, prepared);
    return prepared;
  }

  function buildRoleAliasIndex() {
    if (indexes.has('role-aliases')) return Promise.resolve(indexes.get('role-aliases'));
    if (roleAliasPromise) return roleAliasPromise;
    roleAliasPromise = loadScript('esco-taxonomy.js', 'kovEscoTaxonomy').then((data) => {
      const grouped = new Map();
      for (const term of data.professionalSynonymDirectory || []) {
        if (term.conceptType !== 'occupation' || !term.preferredLabel || !term.term) continue;
        const key = normalize(term.preferredLabel);
        if (!grouped.has(key)) grouped.set(key, { label: term.preferredLabel, aliases: new Set(), details: 'ESCO occupation alternate label' });
        grouped.get(key).aliases.add(`${term.term} (${term.language})`);
      }
      const records = [...grouped.values()].map((item) => itemRecord(item.label, 'ESCO occupation', [...item.aliases], item.details));
      const prepared = records.filter(Boolean).map((record) => ({ ...record, normalized: normalize(record.searchText) }));
      indexes.set('role-aliases', prepared);
      return prepared;
    }).catch((error) => {
      roleAliasPromise = null;
      throw error;
    });
    return roleAliasPromise;
  }

  function destinationFor(record, scope) {
    const catalog = window.kovSeoPageCatalog || [];
    const needle = normalize(record.label);
    const categoryMatches = {
      roles: (page) => page.category === 'roles' || /(^|\/)roles?\//i.test(page.href),
      skills: (page) => page.category === 'career-resources' || /professional-directory/i.test(page.href),
      industries: (page) => page.category === 'industries' || /(^|\/)industries?\//i.test(page.href),
      places: (page) => page.category === 'markets' || /country|city|market/i.test(`${page.href} ${page.title}`),
    }[scope];
    const exact = catalog.filter((page) => categoryMatches(page)).map((page) => ({
      page,
      title: normalize(page.title.replace(/\s*\|\s*KOV(?: Career Agency)?\s*$/i, '')),
      path: normalize(page.href.split('/').filter(Boolean).at(-1)?.replace(/\.html$/i, '').replace(/index$/, '').replace(/-/g, ' ')),
    })).map((entry) => ({ ...entry, score: entry.title === needle ? 12 : entry.path === needle ? 11
      : entry.title.startsWith(`${needle} `) ? 8 : entry.path.startsWith(`${needle} `) ? 7
      : entry.title.includes(needle) ? 4 : entry.path.includes(needle) ? 3 : 0 }))
      .filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
    if (exact.length) return `/${exact[0].page.href.replace(/^\/+/, '')}`;
    const params = new URLSearchParams({ 'kov-search': record.label, 'kov-type': scope });
    return `${categoryMeta[scope].href}?${params.toString()}#site-search-input`;
  }

  function score(record, query, queryWords) {
    const label = normalize(record.label);
    const terms = record.normalized;
    if (label === query) return 100;
    if (label.startsWith(query)) return 80;
    if (label.includes(query)) return 65;
    if (queryWords.every((word) => label.split(' ').some((part) => part.startsWith(word)))) return 50;
    if (queryWords.every((word) => terms.includes(word))) return 30;
    return 0;
  }

  function topMatches(records, query, limit = 8) {
    const queryWords = query.split(' ').filter(Boolean);
    const best = [];
    for (const record of records) {
      const value = score(record, query, queryWords);
      if (!value) continue;
      let index = best.findIndex((item) => value > item.value);
      if (index < 0) index = best.length;
      best.splice(index, 0, { record, value });
      if (best.length > limit) best.pop();
    }
    return best.map((item) => item.record);
  }

  function makeResult(record, scope, query) {
    const item = document.createElement('li');
    item.className = 'kov-discovery-result';
    item.setAttribute('role', 'presentation');
    const link = document.createElement('a');
    link.className = 'kov-discovery-result-link';
    link.setAttribute('role', 'option');
    link.href = record.href || destinationFor(record, scope);
    const copy = document.createElement('span');
    copy.className = 'kov-discovery-result-copy';
    const name = document.createElement('strong');
    name.className = 'kov-discovery-result-title';
    name.textContent = record.label;
    const meta = document.createElement('span');
    meta.className = 'kov-discovery-result-meta';
    meta.textContent = record.kind;
    const detail = document.createElement('span');
    detail.className = 'kov-discovery-result-detail';
    const alias = record.aliases.find((term) => normalize(term).includes(query));
    detail.textContent = alias && normalize(record.label) !== query
      ? `Related term: ${alias} · ${record.details}` : record.details;
    copy.append(name, meta, detail);
    const arrow = document.createElement('span');
    arrow.className = 'kov-discovery-result-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(copy, arrow);
    item.append(link);
    return item;
  }

  async function renderRecords() {
    const token = ++renderToken;
    const query = normalize(input.value);
    results.replaceChildren();
    if (query.length < 2) {
      live.textContent = `Enter at least two characters to search ${categoryMeta[activeScope].label.toLowerCase()}.`;
      return;
    }
    live.textContent = `Searching ${categoryMeta[activeScope].label.toLowerCase()}…`;
    try {
      const records = await buildIndex(activeScope);
      if (token !== renderToken) return;
      let matches = topMatches(records, query);
      if (!matches.length && activeScope === 'roles') {
        live.textContent = 'Checking recognized occupation alternate terms…';
        const aliases = await buildRoleAliasIndex();
        if (token !== renderToken) return;
        matches = topMatches(aliases, query);
      }
      if (!matches.length) {
        live.textContent = `No ${categoryMeta[activeScope].label.toLowerCase()} match “${input.value.trim()}”. Page results are listed below.`;
        return;
      }
      matches.forEach((record) => results.append(makeResult(record, activeScope, query)));
      live.textContent = `${matches.length} ${categoryMeta[activeScope].label.toLowerCase()} shown. Page matches are listed below.`;
    } catch (error) {
      console.error('KOV professional search data could not be loaded:', error);
      if (token === renderToken) live.textContent = 'This record index could not be loaded. KOV page search remains available below.';
    }
  }

  function selectScope(scope, render) {
    activeScope = scope;
    for (const [key, button] of scopeButtons) {
      const selected = key === scope;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    subtitle.textContent = categoryMeta[scope].count;
    panel.setAttribute('aria-labelledby', scopeButtons.get(scope).id);
    if (render) renderRecords();
  }

  const path = location.pathname.toLowerCase();
  const prompts = /industr/.test(path)
    ? [{ label: 'Finance and Insurance', scope: 'industries' }, { label: 'Chief Executive Officer', scope: 'roles' }, { label: 'Active listening', scope: 'skills' }]
    : /country|city|market|dubai|saudi|uae/.test(path)
      ? [{ label: 'London', scope: 'places' }, { label: 'United Arab Emirates', scope: 'places' }, { label: 'Chief Financial Officer', scope: 'roles' }]
      : /role|occupation|profession/.test(path)
        ? [{ label: 'Chief Executive Officer', scope: 'roles' }, { label: 'Active listening', scope: 'skills' }, { label: 'London', scope: 'places' }]
        : [{ label: 'Chief Executive Officer', scope: 'roles' }, { label: 'Active listening', scope: 'skills' }, { label: 'Finance and Insurance', scope: 'industries' }, { label: 'London', scope: 'places' }];
  let promptIndex = 0;
  const promptText = document.createElement('span');
  promptText.className = 'kov-search-suggestion-copy';
  promptText.textContent = `Try ${prompts[0].label}`;
  suggestion.append(promptText);
  suggestion.addEventListener('click', () => {
    const prompt = prompts[promptIndex];
    selectScope(prompt.scope, false);
    input.value = prompt.label;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && prompts.length > 1) {
    window.setInterval(() => {
      if (document.hidden || input === document.activeElement) return;
      promptIndex = (promptIndex + 1) % prompts.length;
      promptText.classList.add('is-rolling');
      window.setTimeout(() => {
        promptText.textContent = `Try ${prompts[promptIndex].label}`;
        promptText.classList.remove('is-rolling');
      }, 170);
      suggestion.setAttribute('aria-label', `Search for ${prompts[promptIndex].label}`);
    }, 2800);
  }

  const installHomepageSearch = () => {
  if (/^\/(?:index\.html)?$/.test(path) && !document.querySelector('.kov-home-search')) {
    const hero = document.querySelector('main > section:first-child');
    const heroTitle = hero?.querySelector('h1');
    if (hero && heroTitle) {
      const homeForm = document.createElement('form');
      homeForm.className = 'kov-home-search';
      homeForm.setAttribute('role', 'search');
      const homeInput = document.createElement('input');
      homeInput.type = 'search';
      homeInput.name = 'kov-home-query';
      homeInput.setAttribute('aria-label', 'Search job titles, occupations, skills, industries, countries and cities');
      const homePrompts = ['Chief Executive Officer', 'Active listening', 'Finance and Insurance', 'London'];
      const homePlaceholder = function(prompt) { return window.matchMedia('(max-width: 30rem)').matches ? 'Search KOV directory' : 'Search the professional library · ' + prompt; };
      homeInput.placeholder = homePlaceholder(homePrompts[0]);
      const listId = 'kov-home-search-suggestions';
      const datalist = document.createElement('datalist');
      datalist.id = listId;
      homePrompts.forEach((prompt) => {
        const option = document.createElement('option');
        option.value = prompt;
        datalist.append(option);
      });
      homeInput.setAttribute('list', listId);
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.textContent = 'Search';
      homeForm.append(homeInput, datalist, submit);
      const note = document.createElement('p');
      note.className = 'kov-home-search-note';
      note.textContent = 'Explore roles, ESCO skills, NAICS industries and global places.';
      const insertAfter = [...(heroTitle.parentElement?.querySelectorAll('p') || [])].at(-1) || heroTitle;
      insertAfter.insertAdjacentElement('afterend', homeForm);
      homeForm.insertAdjacentElement('afterend', note);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let promptIndex = 0;
        let promptTimer = 0;
        const rotatePrompt = () => {
          window.clearTimeout(promptTimer);
          if (document.hidden || document.activeElement === homeInput) return;
          promptIndex = (promptIndex + 1) % homePrompts.length;
          homeInput.placeholder = homePlaceholder(homePrompts[promptIndex]);
          promptTimer = window.setTimeout(rotatePrompt, 3200);
        };
        homeInput.addEventListener('focus', () => window.clearTimeout(promptTimer));
        homeInput.addEventListener('blur', rotatePrompt);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) window.clearTimeout(promptTimer);
          else rotatePrompt();
        });
        promptTimer = window.setTimeout(rotatePrompt, 3200);
      }
      homeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = homeInput.value.trim();
        const suggestedScope = new Map([
          ['chief executive officer', 'roles'],
          ['active listening', 'skills'],
          ['finance and insurance', 'industries'],
          ['london', 'places'],
        ]).get(normalize(query)) || 'roles';
        selectScope(suggestedScope, false);
        const trigger = [...document.querySelectorAll('.site-search-trigger')]
          .find((button) => button.getClientRects().length) || document.querySelector('.site-search-trigger');
        if (!trigger) return;
        trigger.click();
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }
  };
  if (/^\/(?:index\.html)?$/.test(path)) {
    if (document.readyState === 'complete') installHomepageSearch();
    else window.addEventListener('load', installHomepageSearch, { once: true });
  }

  input.addEventListener('input', () => {
    window.clearTimeout(debounceId);
    results.replaceChildren();
    live.textContent = input.value.trim().length >= 2 ? 'Updating professional records…' : 'Enter at least two characters to search the selected category.';
    debounceId = window.setTimeout(renderRecords, 110);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && results.querySelector('a')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      results.querySelector('a').focus();
    }
  });
  results.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const links = [...results.querySelectorAll('a')];
    const index = links.indexOf(event.target.closest('a'));
    if (index < 0) return;
    event.preventDefault();
    const next = index + (event.key === 'ArrowDown' ? 1 : -1);
    if (links[next]) links[next].focus();
    else if (event.key === 'ArrowUp') input.focus();
  });

  const handoff = new URLSearchParams(location.search).get('kov-search');
  const handoffScope = new URLSearchParams(location.search).get('kov-type');
  if (handoff) {
    input.value = handoff;
    if (scopes.includes(handoffScope)) selectScope(handoffScope, false);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (!dialog.open && typeof dialog.showModal === 'function') dialog.showModal();
    window.setTimeout(() => input.focus(), 0);
  }
})();
