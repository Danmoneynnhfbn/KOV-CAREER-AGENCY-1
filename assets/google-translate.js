(() => {
  const style = document.createElement("style");
  style.textContent = `
    #kov-translate-widget {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 1000;
      padding: 6px 8px;
      border: 1px solid #d8d2c7;
      background: #fffdf9;
      color: #171717;
      box-shadow: 0 4px 18px rgba(0, 0, 0, .14);
      font: 500 10px/1.25 Inter, sans-serif;
    }
    #kov-translate-widget label {
      display: block;
      margin-bottom: 2px;
      font-weight: 600;
    }
    #google_translate_element,
    #google_translate_element .goog-te-gadget {
      font: inherit;
    }
    #google_translate_element .goog-te-gadget-simple {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px;
      border: 1px solid #b8b1a6;
      background: #fff;
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
      font: inherit;
      line-height: 1.4;
      text-decoration: none;
    }
    @media (max-width: 480px) {
      #kov-translate-widget { right: 10px; bottom: 10px; }
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement("aside");
  widget.id = "kov-translate-widget";
  widget.setAttribute("aria-label", "Website language selection");
  widget.innerHTML = '<label>Translate</label><div id="google_translate_element"></div>';
  document.body.appendChild(widget);

  window.googleTranslateElementInit = () => {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "ar,de,es,fr,hi,it,ja,ko,nl,pl,pt,ru,sw,zh-CN",
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