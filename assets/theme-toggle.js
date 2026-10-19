(() => {
  const root = document.documentElement;
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
})();
