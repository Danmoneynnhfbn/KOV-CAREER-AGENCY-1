(function () {
  "use strict";

  var menu = document.getElementById("ceo-mobile-menu");
  var openButton = document.querySelector("[data-ceo-menu-open]");
  var closeButton = document.querySelector("[data-ceo-menu-close]");
  if (menu && openButton && closeButton) {
    function setMenu(open) {
      menu.hidden = !open;
      menu.setAttribute("aria-hidden", String(!open));
      openButton.setAttribute("aria-expanded", String(open));
    }
    openButton.addEventListener("click", function () { setMenu(true); });
    closeButton.addEventListener("click", function () { setMenu(false); });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  var filter = document.querySelector("[data-industry-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-industry-card]"));
  var count = document.querySelector("[data-industry-count]");
  if (filter && cards.length) {
    filter.addEventListener("input", function () {
      var query = filter.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var match = card.textContent.toLowerCase().indexOf(query) !== -1;
        card.hidden = !match;
        if (match) visible += 1;
      });
      if (count) count.textContent = visible + " industries shown";
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll("[role=tab][data-region-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[role=tabpanel][data-region-panel]"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
    });
  });

  var progress = document.querySelector("[data-reading-progress]");
  if (progress) {
    var updateProgress = function () {
      var available = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = available > 0 ? window.scrollY / available : 0;
      progress.style.transform = "scaleX(" + Math.max(0, Math.min(1, ratio)) + ")";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }
})();
