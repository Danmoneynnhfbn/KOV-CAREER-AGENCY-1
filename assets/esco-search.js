(() => {
  const search = document.querySelector('[data-esco-search]');
  const results = document.querySelector('[data-esco-results]');
  const count = document.querySelector('[data-esco-count]');
  if (!search || !results || !count) return;

  const taxonomy = window.kovEscoTaxonomy;
  if (!taxonomy || !Array.isArray(taxonomy.skillDirectory) || !Array.isArray(taxonomy.professionalSynonymDirectory)) {
    throw new Error('The ESCO skill and terminology directory did not load.');
  }

  const skills = taxonomy.skillDirectory;
  const synonyms = taxonomy.professionalSynonymDirectory;
  count.textContent = `${skills.length.toLocaleString()} skills and ${synonyms.length.toLocaleString()} alternative terms`;

  function render(query) {
    const term = query.trim().toLocaleLowerCase();
    results.replaceChildren();
    if (!term) {
      count.textContent = `${skills.length.toLocaleString()} skills and ${synonyms.length.toLocaleString()} alternative terms. Search to view matching records.`;
      return;
    }

    const matchingSkills = skills.filter((skill) =>
      skill.name.toLocaleLowerCase().includes(term) ||
      skill.description.toLocaleLowerCase().includes(term) ||
      skill.alternativeLabels.some((label) => label.toLocaleLowerCase().includes(term))
    );
    const matchingSynonyms = synonyms.filter((item) =>
      item.term.toLocaleLowerCase().includes(term) ||
      item.preferredLabel.toLocaleLowerCase().includes(term)
    );
    const fragments = [];

    for (const skill of matchingSkills.slice(0, 20)) {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = skill.name;
      item.append(title);
      if (skill.description) {
        const description = document.createElement('p');
        description.textContent = skill.description;
        item.append(description);
      }
      const link = document.createElement('a');
      link.href = skill.id;
      link.rel = 'noopener noreferrer';
      link.textContent = 'ESCO record';
      item.append(link);
      fragments.push(item);
    }

    for (const synonym of matchingSynonyms.slice(0, Math.max(0, 30 - fragments.length))) {
      const item = document.createElement('li');
      const termText = document.createElement('strong');
      termText.textContent = synonym.term;
      const context = document.createElement('span');
      context.textContent = ` — ${synonym.preferredLabel} (${synonym.language})`;
      const link = document.createElement('a');
      link.href = synonym.conceptUri;
      link.rel = 'noopener noreferrer';
      link.textContent = 'ESCO record';
      item.append(termText, context, document.createTextNode(' '), link);
      fragments.push(item);
    }

    if (fragments.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No matching ESCO records. Try another term.';
      fragments.push(item);
    }

    results.append(...fragments);
    count.textContent = `${matchingSkills.length.toLocaleString()} skills and ${matchingSynonyms.length.toLocaleString()} alternative terms match; showing up to 30 records.`;
  }

  search.addEventListener('input', () => render(search.value));
})();
