(() => {
  let refreshPromise;
  const isProtectedEndpoint = (url) => {
    const endpoint = new URL(url, location.href);
    if (endpoint.origin !== location.origin) return false;
    const path = endpoint.pathname;
    return path === '/api/v1/auth/me'
      || path === '/api/v1/auth/password'
      || path === '/api/v1/profiles'
      || path.startsWith('/api/v1/candidate/')
      || path.startsWith('/api/v1/admin/')
      || path.startsWith('/api/v1/billing/')
      || path.startsWith('/api/v1/employer/invoices');
  };
  const refreshSession = () => {
    if (!refreshPromise) {
      refreshPromise = fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
  };
  window.kovApiRequest = async (url, options = {}, allowRefresh = true) => {
    let response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
    });
    if (response.status === 401 && allowRefresh && isProtectedEndpoint(url)) {
      const refreshed = await refreshSession();
      if (refreshed.ok) {
        response = await window.kovApiRequest(url, options, false);
      }
    }
    return response;
  };
  window.kovApiJsonRequest = async (url, options = {}) => {
    const response = await window.kovApiRequest(url, options);
    const contentType = response.headers.get('content-type') || '';
    if (!/^application\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
      throw new Error(
        `The backend API returned a non-JSON response (HTTP ${response.status}). ` +
        'The API may not be deployed or routed on this site. Please try again later or contact support.',
      );
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('The backend API returned invalid JSON. Please try again later or contact support.');
    }
    return { response, data };
  };
})();
