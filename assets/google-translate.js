(() => {
  const style = document.createElement("style");
  style.textContent = `
    #kov-translate-widget {
      position: fixed;
      right: max(12px, env(safe-area-inset-right));
      bottom: max(12px, env(safe-area-inset-bottom));
      z-index: 1000;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 3px 6px;
      border: 1px solid #d8d2c7;
      border-radius: 6px;
      background: #fffdf9;
      color: #171717;
      box-shadow: 0 3px 10px rgba(16, 24, 33, .12);
      font: 500 9px/1.2 Inter, sans-serif;
      margin: 0;
    }
    #kov-translate-widget label {
      display: none;
    }
    #google_translate_element,
    #google_translate_element .goog-te-gadget {
      font: inherit;
    }
    #google_translate_element .goog-te-gadget-simple {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px;
      border: 1px solid #b8b1a6;
      border-radius: 3px;
      background: #fff;
      font-size: 10px !important;
      line-height: 1.2 !important;
      white-space: nowrap;
    }
    #google_translate_element .goog-te-gadget img {
      display: inline-block !important;
      width: auto;
      max-width: none;
      vertical-align: middle;
    }
    #google_translate_element .goog-te-gadget-simple a {
      display: inline-flex;
      align-items: center;
      color: #171717;
      min-height: 0 !important;
      padding: 0 !important;
      font-family: Inter, sans-serif !important;
      font-size: 10px !important;
      font-weight: 500 !important;
      line-height: 1.2 !important;
      text-decoration: none;
    }

    #google_translate_element .goog-te-gadget-simple a span {
      font-size: inherit !important;
      line-height: inherit !important;
    }
    @media (max-width: 600px) {
      #kov-translate-widget {
        right: max(10px, env(safe-area-inset-right));
        bottom: max(10px, env(safe-area-inset-bottom));
        gap: 3px;
        padding: 2px 4px;
      }

      #google_translate_element .goog-te-gadget-simple {
        gap: 2px;
        padding: 1px 3px;
      }
    }
  `;
  document.head.appendChild(style);

  const existingWidget = document.getElementById("kov-translate-widget");
  const widget = existingWidget || document.createElement("aside");
  widget.id = "kov-translate-widget";
  widget.setAttribute("aria-label", "Website language selection");
  if (!widget.innerHTML.trim()) {
    widget.innerHTML = '<label>Translate</label><div id="google_translate_element"></div>';
  }

  const footer = document.querySelector("footer");
  const footerContainer = footer?.querySelector(":scope > .mx-auto") || footer;
  const footerBars = footerContainer ? [...footerContainer.querySelectorAll(".kov-footer-bottom-bar")] : [];
  let footerBar = footerContainer?.querySelector("[data-kov-footer-legal-row]") ||
    footerBars[0] ||
    footerContainer?.querySelector(".kov-footer-bottom-bar") ||
    null;
  if (footerContainer && !footerBar) {
    footerBar = document.createElement("div");
    footerBar.className = "kov-footer-bottom-bar";
    footerContainer.appendChild(footerBar);
  }

  if (footer && footerContainer && footerBar) {
    const legal = footerContainer.querySelector(".kov-legal") ||
      Array.from(footerContainer.querySelectorAll("p, span")).find((element) => element.textContent.includes("©"));
    const privacyLink = Array.from(footerContainer.querySelectorAll('a[href*="privacy.html"]'))
      .find((link) => link.textContent.trim() === "Privacy Notice");

    if (legal && !footerBar.contains(legal)) footerBar.prepend(legal);
    if (privacyLink && !footerBar.contains(privacyLink)) {
      privacyLink.className = "kov-footer-privacy-link";
      footerBar.appendChild(privacyLink);
    }
    if (!footerBar.contains(widget)) footerBar.appendChild(widget);

    footerBars.filter((bar) => bar !== footerBar).forEach((bar) => {
      while (bar.firstChild) footerBar.appendChild(bar.firstChild);
      bar.remove();
    });
  } else {
    document.body.appendChild(widget);
  }

  window.googleTranslateElementInit = () => {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "am,ar,bn,de,es,fa,fr,gu,ha,hi,id,it,ja,jv,ko,ms,mr,ne,nl,pa,pl,pt,ru,sw,ta,te,th,tl,tr,ur,vi,yo,zh-CN,zh-TW",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element",
    );
  };

  const googleScript = document.createElement("script");
  googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  googleScript.async = true;
  document.head.appendChild(googleScript);
})();