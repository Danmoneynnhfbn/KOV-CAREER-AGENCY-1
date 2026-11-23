(() => {
  'use strict';
  // The archive contains illustrative AI-generated portraits, not real candidate photographs.
  // Reuse the 85 distinct portraits in a round-robin sequence for the 1,000 illustrative profiles.
  const columns = 10;
  const rows = 9;
  const count = 85;
  const src = '/assets/candidate-project-directory-portrait-atlas.jpg?v=1';
  window.KOV_CANDIDATE_PORTRAITS = Array.from({ length: count }, (_, index) => ({
    src,
    x: ((index % columns) / (columns - 1) * 100).toFixed(4) + '%',
    y: ((Math.floor(index / columns)) / (rows - 1) * 100).toFixed(4) + '%'
  }));
})();
