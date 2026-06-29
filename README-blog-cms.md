# KOV blog CMS

This site now uses a GitHub Pages-compatible blog workflow with repository-backed JSON storage.

## How it works

- The private dashboard remains available at `/blogpostcheck` and is not linked publicly.
- The public blog is available at `/blog`.
- Posts are stored in JSON files under the `posts/` folder in the repository.
- Published posts automatically expire 30 days after their publish date.
- No separate server runtime or database is required; the UI uses the GitHub REST API.

## Setup

1. Open `blog.html` and `blogpostcheck.html`.
2. Set `window.KOV_BLOG_CONFIG.repo` to your repository slug: `Damnoneynnhfhbn/KOV-CAREER-AGENCY-1`.
3. Keep `branch` set to the branch used by GitHub Pages (usually `main`).
4. Ensure `postsPath` is set to `posts`.
5. The `posts/` folder is created automatically by GitHub as soon as the first post JSON file is committed.

## Using the dashboard

- Visit `/blogpostcheck` directly.
- Paste a GitHub personal access token into the dashboard and save it for the current browser session.
- The token stays in browser session storage only and is not stored permanently in the repository.
- Publish new posts or save drafts.
- Posts are committed directly to the repository as JSON files.

## Notes

- The public blog page reads published posts from the repository at runtime.
- For GitHub Pages deployment, the site remains fully static.
- The old `server.py` runtime backend is not required for the GitHub Pages version.
- If `server.py` and `requirements.txt` are present, they are legacy artifacts from the prior local backend approach.
