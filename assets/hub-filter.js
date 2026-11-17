(() => {
  const form = document.querySelector("#resource-filters");
  const query = document.querySelector("#resource-query");
  const category = document.querySelector("#resource-category");
  const results = document.querySelector("#resource-results");
  const empty = document.querySelector("#resource-empty");
  const cards = [...document.querySelectorAll("[data-resource-card]")];

  if (!form || !query || !category || !results || !empty || cards.length === 0) {
    throw new Error("The resource directory filter requires its form, status, empty state, and cards.");
  }

  function updateResults() {
    const phrase = query.value.trim().toLowerCase();
    const selectedCategory = category.value;
    let visibleCount = 0;

    for (const card of cards) {
      const categories = card.dataset.category.split(/\s+/);
      const matchesPhrase = !phrase || card.textContent.toLowerCase().includes(phrase);
      const matchesCategory = !selectedCategory || categories.includes(selectedCategory);
      const visible = matchesPhrase && matchesCategory;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    }

    results.textContent = `${visibleCount} ${visibleCount === 1 ? "resource" : "resources"} shown.`;
    empty.hidden = visibleCount > 0;
  }

  form.addEventListener("submit", (event) => event.preventDefault());
  query.addEventListener("input", updateResults);
  category.addEventListener("change", updateResults);
  updateResults();
})();
