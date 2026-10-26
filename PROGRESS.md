# Redesign progress

Updated: 2026-10-24

## Preparation and current state

- Stack: static HTML pages with shared CSS and JavaScript; no project build step is required for the new design assets.
- Inventory: 723 `.html` files, grouped in `PAGE_MANIFEST.json`; the repository already had reference-led shared assets linked to all 723 pages before this run.
- Backup: full sibling copy at `../kov-backup-20261024`; verified count: 723 HTML files.
- Branch: `redesign-4-styles`. The requested local `backup-before-redesign` branch also exists.
- Reference cache: 136 files originally in one flat `_design-reference/` directory. Per-reference folders now contain copied source snapshots/assets, live rendered HTML/CSS captures, and screenshots at 1440/768/390.
- Design system: new `css/design-system.css`, four theme files, and `js/site.js`; 722 public pages have theme attributes and shared asset links. `.private_admin/blogpostcheck.html` remains inventoried but unmodified.
- Visible-text/frozen-data verification against the sibling backup: 723 pages compared; 0 visible-text differences and 0 differences in titles, descriptions, canonicals, JSON-LD, anchor elements, or image alt text.
- Heading check: 709 pages have exactly one H1; 14 legacy redirect stubs have no H1; no page has multiple H1s. Redirect stubs remain unchanged.

## Validation in progress

- [x] Confirm static HTML stack and 723-page count.
- [x] Back up the entire working tree and create local requested branches.
- [x] Identify and organize reference snapshots.
- [x] Capture responsive reference screenshots and computed heading/font measurements.
- [x] Generate a dry-run page manifest and migration report before applying.
- [x] Apply shared theme wiring and verify frozen content/metadata.
- [ ] Finish all-page local link/image/HTML checks.
- [ ] Capture KOV golden-sample screenshots at all three widths.
- [ ] Run Lighthouse or document tool unavailability.
- [ ] Review final git status and commit only changes that can be safely isolated from the pre-existing dirty worktree.
- [ ] Write final report with remaining limitations.

## Not committed or pushed

The worktree had 2,031 staged/unstaged changes before this redesign. Those changes were preserved and not included in a commit or pushed. See `DECISIONS.md` and `BLOCKERS.md`.
