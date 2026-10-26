(function () {
  "use strict";

  if (window.kovHeaderShellApplied) return;
  window.kovHeaderShellApplied = true;

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

  function removeFaqAndBlogFromNavigation() {
    var navAnchors = document.querySelectorAll("header nav a, .site-mobile-menu-nav a, .ceo-mobile-menu a, .ceo-desktop-nav a");
    navAnchors.forEach(function (link) {
      var text = (link.textContent || "").trim();
      var href = (link.getAttribute("href") || "").trim();
      var isFaq = /(^|\s)FAQs?(\s|$)/i.test(text) || /(faqs?\.html|faq\/.*\.html|faq\/index\.html)$/i.test(href);
      var isBlog = /(^|\s)Blog(\s|$)/i.test(text) || /(blog\.html)$/i.test(href);
      if (isFaq || isBlog) {
        link.remove();
      }
    });
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

  function applyStandardSiteShell() {
    removeFaqAndBlogFromNavigation();

    var currentHeader = document.querySelector("header");
    var header = document.createElement("header");
    header.className = "kov-site-header sticky top-0 z-50 border-b border-line/60 bg-background/85 backdrop-blur-xl";
    header.innerHTML = [
      '<div class="kov-site-header-inner mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">',
      '<a class="kov-site-brand flex items-center gap-2.5" href="' + linkHref("index.html") + '" aria-label="KOV Career Agency home">',
      '<img class="kov-site-brand-logo h-7 w-7 object-contain" src="' + linkHref("kov-logo.png") + '" alt="KOV"/>',
      '<span class="kov-site-brand-name text-[13px] font-medium uppercase tracking-[0.18em] text-ink">KOV <span class="text-muted-foreground">Career Agency</span></span>',
      '</a>',
      '<nav class="kov-site-desktop-nav hidden items-center gap-8 text-[13px] text-ink-soft lg:flex" aria-label="Main navigation">',
      '<a href="' + linkHref("index.html") + '" class="transition-colors hover:text-ink">Home</a>',
      '<a href="' + linkHref("candidate-services.html") + '" class="transition-colors hover:text-ink">Individual Career Services</a>',
      '<a href="' + linkHref("roles/") + '" class="transition-colors hover:text-ink">Roles</a>',
      '<a href="' + linkHref("industries/") + '" class="transition-colors hover:text-ink">Industries</a>',
      '<a href="' + linkHref("how-it-works.html") + '" class="transition-colors hover:text-ink">How It Works</a>',
      '<a href="' + linkHref("pricing.html") + '" class="transition-colors hover:text-ink">Pricing</a>',
      '<a href="' + linkHref("about.html") + '" class="transition-colors hover:text-ink">About</a>',
      '<a href="' + linkHref("contact.html") + '" class="transition-colors hover:text-ink">Get Started</a>',
      '</nav>',
      '<button type="button" class="kov-site-menu-toggle inline-flex items-center justify-center rounded-full border border-line/60 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink lg:hidden" aria-label="Open menu" aria-expanded="false" aria-controls="site-mobile-menu" data-mobile-menu-toggle><span aria-hidden="true">☰</span></button>',
      '</div>',
      '<div class="kov-site-mobile-menu site-mobile-menu" id="site-mobile-menu" aria-hidden="true">',
      '<div class="kov-site-mobile-menu-panel site-mobile-menu-panel">',
      '<div class="kov-site-mobile-menu-header site-mobile-menu-header">',
      '<a class="kov-site-mobile-brand" href="' + linkHref("index.html") + '" data-mobile-menu-link aria-label="KOV Career Agency home">',
      '<img class="kov-site-brand-logo" src="' + linkHref("kov-logo.png") + '" alt="KOV"/>',
      '<span>KOV Career Agency</span>',
      '</a>',
      '<button type="button" class="kov-site-menu-close menu-close" aria-label="Close menu" data-mobile-menu-close>×</button>',
      '</div>',
      '<nav class="kov-site-mobile-menu-nav site-mobile-menu-nav" aria-label="Mobile navigation">',
      '<a href="' + linkHref("index.html") + '" data-mobile-menu-link>Home</a>',
      '<a href="' + linkHref("candidate-services.html") + '" data-mobile-menu-link>Individual Career Services</a>',
      '<a href="' + linkHref("roles/") + '" data-mobile-menu-link>Roles</a>',
      '<a href="' + linkHref("industries/") + '" data-mobile-menu-link>Industries</a>',
      '<a href="' + linkHref("how-it-works.html") + '" data-mobile-menu-link>How It Works</a>',
      '<a href="' + linkHref("pricing.html") + '" data-mobile-menu-link>Pricing</a>',
      '<a href="' + linkHref("about.html") + '" data-mobile-menu-link>About</a>',
      '<a href="' + linkHref("contact.html") + '" data-mobile-menu-link>Get Started</a>',
      '</nav>',
      '</div>',
      '</div>',
      '</header>'
    ].join("");

    document.querySelectorAll(".site-mobile-menu, .ceo-mobile-menu").forEach(function (menu) {
      menu.remove();
    });

    document.querySelectorAll("header").forEach(function (node) {
      if (node !== currentHeader) {
        node.remove();
      }
    });

    if (currentHeader) {
      currentHeader.replaceWith(header);
    } else {
      document.body.insertBefore(header, document.body.firstChild || null);
    }

    var mobileMenu = document.getElementById("site-mobile-menu");
    var mobileToggle = document.querySelector("[data-mobile-menu-toggle]");
    var mobileClose = document.querySelector("[data-mobile-menu-close]");
    if (mobileMenu && mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        var isOpen = mobileMenu.getAttribute("aria-hidden") === "true";
        mobileMenu.setAttribute("aria-hidden", String(!isOpen));
        mobileMenu.classList.toggle("is-open", isOpen);
        mobileToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }
    if (mobileMenu && mobileClose) {
      mobileClose.addEventListener("click", function () {
        mobileMenu.setAttribute("aria-hidden", "true");
        mobileMenu.classList.remove("is-open");
        if (mobileToggle) {
          mobileToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    if (mobileMenu) {
      mobileMenu.addEventListener("click", function (event) {
        if (event.target && event.target.closest("a")) {
          mobileMenu.setAttribute("aria-hidden", "true");
          mobileMenu.classList.remove("is-open");
          if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    }
  }

  applyStandardSiteShell();
  bindTabKeyboardNavigation();
})();