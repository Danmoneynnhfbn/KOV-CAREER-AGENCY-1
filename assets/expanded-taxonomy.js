(function (root) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = require('../scripts/lib/verified-expanded-taxonomy').buildTaxonomies();
    return;
  }
  if (root && typeof root.fetch === 'function') {
    root.fetch('/data/taxonomy/verified-expanded-taxonomy.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Verified taxonomy request failed: ${response.status}`);
        return response.json();
      })
      .then((taxonomies) => { root.kovExpandedTaxonomy = taxonomies; })
      .catch((error) => { root.kovExpandedTaxonomyLoadError = String(error); });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
