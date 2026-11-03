(function () {
  "use strict";

  if (window.kovSharedBehaviorsReady) return;
  window.kovSharedBehaviorsReady = true;

  function ensureStylesheet(fileName, version) {
    var assetPath = "/assets/" + fileName + (version ? "?v=" + version : "");
    var assetUrl = new URL(assetPath, window.location.href);
    var existingStylesheet = Array.prototype.find.call(
      document.querySelectorAll('link[rel="stylesheet"][href]'),
      function (link) {
        return new URL(link.href, window.location.href).pathname === assetUrl.pathname;
      }
    );
    if (existingStylesheet) return;

    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = assetUrl.href;
    stylesheet.addEventListener("error", function () {
      console.error("Failed to load the KOV shared stylesheet: " + stylesheet.href);
    }, { once: true });
    document.head.appendChild(stylesheet);
  }

  function rootPrefix() {
    var segments = window.location.pathname.split("/").filter(Boolean);
    var depth = segments.length - (window.location.pathname.endsWith("/") ? 0 : 1);
    return "../".repeat(Math.max(0, depth));
  }

  function linkHref(value) {
    if (!value || value.indexOf("#") === 0 || value.indexOf("http://") === 0 || value.indexOf("https://") === 0 || value.indexOf("//") === 0) {
      return value;
    }
    if (value.indexOf("/") === 0) {
      return value;
    }
    return rootPrefix() + value;
  }

  function bindTabKeyboardNavigation() {
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
  }

  ensureStylesheet("design-components.css", "3");
  ensureStylesheet("site-fixes.css", "28");
  if (!window.kovSiteSearchReady && !Array.prototype.some.call(
    document.querySelectorAll("script[src]"),
    function (script) {
      return new URL(script.src, window.location.href).pathname.endsWith("/assets/site-search.js");
    }
  )) {
    var searchScript = document.createElement("script");
    searchScript.src = linkHref("assets/site-search.js?v=5");
    searchScript.addEventListener("error", function () {
      console.error("Failed to load the KOV site search script: " + searchScript.src);
    }, { once: true });
    document.head.appendChild(searchScript);
  }
  bindTabKeyboardNavigation();
})();