(() => {
  const library = window.KOVProofLibrary;
  const page = document.querySelector('[data-proof-page]');
  if (!library || !page) return;

  const side = page.dataset.proofPage;
  const records = library[side];
  const categoryFilters = side === 'candidate'
    ? ['All', 'Career Strategy', 'Positioning', 'Research', 'Applications', 'Recruiter Outreach', 'Hiring Manager Outreach', 'Interview', 'Offer Strategy', 'International']
    : ['All', 'Market Mapping', 'Talent Research', 'Passive Talent', 'Leadership', 'Finance', 'Technology', 'Operations', 'Sales', 'International', 'Outreach'];
  const categoryAliases = side === 'company'
    ? { 'Talent Research': ['Talent Research', 'Passive Talent'], 'Leadership': ['Leadership'], 'Market Mapping': ['Market Mapping'] }
    : {};
  const filterHost = document.querySelector('[data-proof-filters]');
  const countryFilter = document.querySelector('[data-country-filter]');
  const cardsHost = document.querySelector('[data-proof-records]');
  const dialog = document.querySelector('[data-proof-dialog]');
  const dialogContent = dialog.querySelector('[data-dialog-content]');
  let activeCategory = 'All';
  let activeCountry = 'All countries';
  let returnFocus = null;

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const categories = [...new Set(records.map((record) => record.category))];
  for (const label of categoryFilters) {
    if (label !== 'All' && !categories.includes(label) && !categoryAliases[label]) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'proof-filter';
    button.textContent = label;
    button.dataset.category = label;
    button.setAttribute('aria-pressed', String(label === 'All'));
    filterHost.append(button);
  }

  const countries = [...new Set(records.map((record) => record.country))].sort();
  for (const country of countries) {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countryFilter.append(option);
  }

  const cardMarkup = (record, index) => `
    <article class="proof-record" style="--record-index:${index % 8}">
      <button class="proof-record-open" type="button" data-record-index="${index}" aria-haspopup="dialog">
        <span class="proof-record-top"><span>${escapeHTML(record.caseId)}${record.identity ? ` · ${escapeHTML(record.identity)}` : ''}</span><span class="proof-open-mark" aria-hidden="true">+</span></span>
        <span class="proof-record-title">${escapeHTML(record.title)}</span>
        <span class="proof-record-meta">${escapeHTML(record.country)} <i aria-hidden="true">·</i> ${escapeHTML(record.seniority)} <i aria-hidden="true">·</i> ${escapeHTML(record.function)}</span>
        <span class="proof-record-summary">${escapeHTML(record.objective)}</span>
        <span class="proof-record-footer"><span>${escapeHTML(record.searchStage)}</span><span class="proof-arrow" aria-hidden="true">↗</span></span>
      </button>
    </article>`;

  const renderRecords = () => {
    const visible = records.filter((record) => {
      const allowed = categoryAliases[activeCategory] || [activeCategory];
      const categoryMatches = activeCategory === 'All' || allowed.includes(record.category);
      return categoryMatches && (activeCountry === 'All countries' || record.country === activeCountry);
    });
    cardsHost.innerHTML = visible.map((record) => cardMarkup(record, records.indexOf(record))).join('');
    const count = document.querySelector('[data-result-count]');
    count.textContent = `${visible.length} illustrative ${visible.length === 1 ? 'record' : 'records'}`;
    cardsHost.setAttribute('aria-busy', 'false');
  };

  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
  const showRecord = (record, trigger) => {
    returnFocus = trigger;
    dialogContent.innerHTML = `
      <p class="proof-dialog-id">${escapeHTML(record.caseId)}</p>
      <h2 id="proof-dialog-title">${escapeHTML(record.title)}</h2>
      <div class="proof-dialog-grid">
        <section><h3>Search objective</h3><p>${escapeHTML(record.objective)}</p></section>
        <section><h3>Market</h3><p>${escapeHTML(record.country)} · ${escapeHTML(record.region)}</p></section>
        <section><h3>Role</h3><p>${escapeHTML(record.role)} · ${escapeHTML(record.industry)}</p></section>
        <section><h3>Research</h3><p>${escapeHTML(record.research)}</p><p>${escapeHTML(record.challenge)}</p></section>
        <section><h3>KOV method</h3><p>${escapeHTML(record.kovAction)}</p></section>
        <section><h3>Why this matters</h3><p>${escapeHTML(record.whyItMatters)}</p></section>
        <section><h3>Search stage</h3><p>${escapeHTML(record.searchStage)}</p></section>
        <section><h3>Deliverables</h3>${list(record.deliverables.split('; '))}</section>
        <section class="proof-dialog-next"><h3>Next step</h3><p>${escapeHTML(record.nextStep)}</p></section>
      </div>`;
    dialog.showModal();
    dialog.querySelector('[data-dialog-close]').focus();
  };

  filterHost.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    filterHost.querySelectorAll('[data-category]').forEach((filter) => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    renderRecords();
  });
  countryFilter.addEventListener('change', () => {
    activeCountry = countryFilter.value;
    renderRecords();
  });
  cardsHost.addEventListener('click', (event) => {
    const button = event.target.closest('[data-record-index]');
    if (button) showRecord(records[Number(button.dataset.recordIndex)], button);
  });
  cardsHost.addEventListener('keydown', (event) => {
    const button = event.target.closest('[data-record-index]');
    if (!button || event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    showRecord(records[Number(button.dataset.recordIndex)], button);
  });
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => returnFocus?.focus());

  const profiles = side === 'candidate' ? library.candidateProfiles : library.companyProfiles;
  document.querySelectorAll('.proof-sample table').forEach((table) => {
    const labels = [...table.querySelectorAll('thead th')].map((header) => header.textContent.trim());
    table.querySelectorAll('tbody tr').forEach((row) => {
      [...row.cells].forEach((cell, index) => {
        cell.dataset.label = labels[index] || '';
      });
    });
  });
  const profileHost = document.querySelector('[data-proof-profiles]');
  profileHost.innerHTML = profiles.map((profile) => {
    const identity = profile.identity || profile.caseId;
    const label = profile.label;
    return `<article class="proof-profile">
      <div class="proof-profile-mark" aria-hidden="true">${escapeHTML(identity.slice(0, 5))}</div>
      <p class="proof-profile-id">${escapeHTML(profile.caseId)}</p>
      <h3>${escapeHTML(profile.seniority)} ${escapeHTML(profile.function)}</h3>
      <p>${escapeHTML(profile.country)} <span aria-hidden="true">·</span> ${escapeHTML(profile.region)}</p>
      <dl><div><dt>Industry</dt><dd>${escapeHTML(profile.industry)}</dd></div><div><dt>Relevant signal</dt><dd>${escapeHTML(profile.relevantSignal)}</dd></div><div><dt>Search status</dt><dd>${escapeHTML(profile.searchStatus)}</dd></div></dl>
    </article>`;
  }).join('');

  renderRecords();
})();
