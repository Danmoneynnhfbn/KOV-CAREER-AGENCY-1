(() => {
  const root = document.documentElement;
  const storageKey = 'kov-theme-preference';
  const scriptUrl = document.currentScript?.src;

  if (!scriptUrl) {
    console.error('Unable to resolve the KOV theme assets from the current script.');
    return;
  }

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('design-tokens.css', scriptUrl).href;
  stylesheet.dataset.kovDesignTokens = '';
  stylesheet.addEventListener('error', () => {
    console.error(`Failed to load KOV design tokens: ${stylesheet.href}`);
  });
  document.head.append(stylesheet);

  if (document.body?.classList.contains('backend-page')) return;

  let preference = null;
  try {
    const storedPreference = window.localStorage.getItem(storageKey);
    if (storedPreference === 'light' || storedPreference === 'dark') {
      preference = storedPreference;
      root.dataset.kovTheme = preference;
    }
  } catch (error) {
    console.error('Could not read the saved KOV color theme preference.', error);
  }

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kov-theme-toggle';
  button.dataset.kovThemeToggle = '';
  button.setAttribute('aria-label', 'Toggle dark color theme');
  button.setAttribute('aria-pressed', 'false');

  function updateButton() {
    const isDark = (preference || (systemTheme.matches ? 'dark' : 'light')) === 'dark';
    button.textContent = isDark ? 'Light mode' : 'Dark mode';
    button.title = `Switch to ${isDark ? 'light' : 'dark'} colors`;
    button.setAttribute('aria-pressed', String(isDark));
  }

  button.addEventListener('click', () => {
    preference = (preference || (systemTheme.matches ? 'dark' : 'light')) === 'dark'
      ? 'light'
      : 'dark';
    root.dataset.kovTheme = preference;
    updateButton();

    try {
      window.localStorage.setItem(storageKey, preference);
    } catch (error) {
      console.error('Could not save the KOV color theme preference.', error);
    }
  });

  systemTheme.addEventListener('change', () => {
    if (!preference) updateButton();
  });

  updateButton();
  document.body.append(button);
})();
