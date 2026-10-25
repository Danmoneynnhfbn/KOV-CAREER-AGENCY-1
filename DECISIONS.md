# Design decisions

- The repository was already on `design-upgrade` with 2,031 staged/unstaged changes. A full sibling copy was made at `../kov-backup-20261024`; local branches `backup-before-redesign` and `redesign-4-styles` were created from the existing commit, and work continued on `redesign-4-styles`.
- Do not stage or commit the pre-existing 2,031-change worktree or push it. Its contents and secrets have not been reviewed, so including it in the requested baseline commit/push would risk publishing unrelated or sensitive work. The verified sibling copy provides the requested recoverable backup; local branch creation does not alter the remote.
- The four flat reference snapshots are copied, not moved, into per-site folders. The Krackerz cache contained an application bundle rather than rendered HTML, so live browser capture was used for its rendered page and stylesheet evidence.
- Use body `data-theme` tokens instead of replacing each page's header/footer. Existing navigation text, links, and semantics are frozen.
- Use existing freely licensed Inter/Fraunces declarations and system fonts. Reference-specific proprietary fonts are not downloaded or used.
- Keep 14 legacy redirect stubs free of added visible text. Adding an H1 would either invent visible copy or interfere with these redirect-only documents; they are reported as structural exceptions.
- Exclude `.private_admin/blogpostcheck.html` from the public migration, while retaining it in the full inventory with status `todo`.
- The 723-page migration is additive and script-driven. No page copy, canonical/SEO field, existing anchor, or image alt text is changed.
