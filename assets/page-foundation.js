(() => {
  const element = (tagName, className, text) => {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const safeHref = (href) => {
    const url = new URL(href, window.location.href);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new TypeError(`Unsupported page-component link protocol: ${url.protocol}`);
    }
    return url.href;
  };

  function renderBreadcrumbs(container, items) {
    const navigation = element("nav", "kov-page-breadcrumbs");
    navigation.setAttribute("aria-label", "Breadcrumb");
    const list = element("ol", "kov-page-breadcrumb-list");

    items.forEach((item, index) => {
      const listItem = element("li");
      if (item.href && index < items.length - 1) {
        const link = element("a", "", item.label);
        link.href = safeHref(item.href);
        listItem.append(link);
      } else {
        const current = element("span", "", item.label);
        if (index === items.length - 1) current.setAttribute("aria-current", "page");
        listItem.append(current);
      }
      list.append(listItem);
    });

    navigation.append(list);
    container.replaceChildren(navigation);
  }

  function renderCardGrid(container, cards) {
    const grid = element("div", "kov-expansion-grid");
    cards.forEach((card) => {
      const article = element("article", "kov-expansion-card");
      if (card.status) article.append(element("span", "kov-expansion-status", card.status));
      article.append(
        element(card.headingLevel || "h2", "", card.title),
        element("p", "", card.description)
      );
      if (card.href && card.linkLabel) {
        const link = element("a", "", card.linkLabel);
        link.href = safeHref(card.href);
        article.append(link);
      }
      grid.append(article);
    });
    container.replaceChildren(grid);
  }

  function renderDataTable(container, table) {
    const wrapper = element("div", "kov-expansion-table-wrapper");
    const node = element("table", "kov-expansion-table");
    if (table.caption) node.append(element("caption", "", table.caption));
    const head = element("thead");
    const headerRow = element("tr");
    table.headers.forEach((header) => headerRow.append(element("th", "", header)));
    head.append(headerRow);
    const body = element("tbody");
    table.rows.forEach((row) => {
      const rowNode = element("tr");
      row.forEach((cell, index) => {
        const cellNode = element(index === 0 ? "th" : "td", "", cell);
        if (index === 0) cellNode.scope = "row";
        rowNode.append(cellNode);
      });
      body.append(rowNode);
    });
    node.append(head, body);
    wrapper.append(node);
    container.replaceChildren(wrapper);
  }

  function renderCallout(container, callout) {
    const section = element("aside", "kov-expansion-note");
    section.setAttribute("aria-label", callout.title);
    section.append(element("strong", "", callout.title), element("p", "", callout.body));
    container.replaceChildren(section);
  }

  window.KOVPageFoundation = Object.freeze({
    renderBreadcrumbs,
    renderCardGrid,
    renderDataTable,
    renderCallout,
  });
})();
