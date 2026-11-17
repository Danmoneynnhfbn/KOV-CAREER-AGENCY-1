(() => {
  if (window.kovGoogleTranslateLoaded) return;
  window.kovGoogleTranslateLoaded = true;

  const existingWidget = document.getElementById("kov-translate-widget");
  const widget = existingWidget || document.createElement("aside");
  widget.id = "kov-translate-widget";
  widget.setAttribute("aria-label", "Website language selection");
  if (!widget.innerHTML.trim()) {
    widget.innerHTML = '<button type="button" class="kov-translate-load" aria-label="Choose website language">Language</button><div id="google_translate_element" hidden></div>';
  }

  const languageSlot = document.querySelector("[data-kov-language-slot]");
  (languageSlot || document.body).appendChild(widget);
  if (!languageSlot) {
    const navObserver = new MutationObserver(() => {
      const slot = document.querySelector("[data-kov-language-slot]");
      if (!slot) return;
      slot.appendChild(widget);
      navObserver.disconnect();
    });
    navObserver.observe(document.body, { childList: true, subtree: true });
  }

  let googleScript;
  const translateButton = widget.querySelector(".kov-translate-load");
  const translateElement = widget.querySelector("#google_translate_element");
  if (!translateButton || !translateElement) {
    console.error("Unable to initialize the Google Translate control.");
    return;
  }

  const loadGoogleTranslate = () => {
    if (googleScript) return;

    translateButton.disabled = true;
    translateButton.textContent = "Loading…";
    translateElement.hidden = false;
    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    googleScript = document.createElement("script");
    googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    googleScript.async = true;
    googleScript.addEventListener("load", () => {
      translateButton.hidden = true;
    }, { once: true });
    googleScript.addEventListener("error", () => {
      googleScript = null;
      translateElement.hidden = true;
      translateButton.disabled = false;
      translateButton.textContent = "Retry language";
      console.error("Failed to load the Google Translate widget.");
    }, { once: true });
    document.head.appendChild(googleScript);
  };
  translateButton.addEventListener("click", loadGoogleTranslate);
})();
