(function () {
  "use strict";

  var header = document.querySelector(".ceo-site-header");
  if (!header) return;

  var updateHeader = function () {
    var scrolled = window.scrollY > 8;
    header.toggleAttribute("data-scrolled", scrolled);
    document.body.toggleAttribute("data-scrolled", scrolled);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  document.querySelectorAll("[role=tablist]").forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role=tab]"));
    tablist.addEventListener("keydown", function (event) {
      var index = tabs.indexOf(event.target);
      if (index < 0 || !tabs.length) return;

      var nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  document.querySelectorAll("[data-back-to-top]").forEach(function (link) {
    link.addEventListener("click", function () {
      var target = document.getElementById("top");
      if (target) target.focus({ preventScroll: true });
    });
  });
})();
