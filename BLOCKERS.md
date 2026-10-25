# Blockers and limitations

- **Pre-existing dirty worktree:** there were 2,031 staged/unstaged changes before redesign work. The requested "commit everything and push" backup step was not performed because the changes were not audited for ownership or secrets. A verified full sibling backup and local branches were created instead. Do not push the branch until the existing changes are reviewed.
- **Redirect-only H1 exceptions:** 14 HTML files are legacy redirect stubs with meta refresh/JavaScript redirects and no visible heading content. Adding H1 copy would violate the frozen-copy rule; they remain unchanged.
- **Blog post template:** no individually rendered blog-post HTML file exists in the 723-file static inventory; blog content is served through the existing blog CMS data/JavaScript rather than a distinct static post template.
- **Reference fidelity:** the source sites include proprietary typefaces, animation, video, and dynamically loaded assets. The recorded measurements and viewport screenshots are not evidence of pixel-perfect comparison. KOV uses no copied reference fonts/assets/code.
- **Automated visual scoring:** Lighthouse was not run as part of the completed checks; any final score must be reported as unavailable rather than inferred from manual browser inspection.
