(function () {
  "use strict";

  var navButtons = document.querySelectorAll("[data-site-nav-toggle][aria-controls]");
  navButtons.forEach(function (button) {
    var menu = document.getElementById(button.getAttribute("aria-controls"));
    if (!menu) return;

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      menu.setAttribute("aria-hidden", String(!open));
    });
    menu.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      menu.setAttribute("aria-hidden", "true");
      button.focus();
    });
  });

  document.querySelectorAll("[data-site-accordion] > button[aria-controls]").forEach(function (button) {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    });
  });

  var motionItems = document.querySelectorAll("[data-site-motion]");
  if (!motionItems.length || !("IntersectionObserver" in window)
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var observer = new IntersectionObserver(function (entries, instance) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
  motionItems.forEach(function (item) {
    item.classList.add("site-reveal");
    observer.observe(item);
  });
})();
