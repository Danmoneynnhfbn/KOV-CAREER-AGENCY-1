# KOV blog CMS

This site now uses a GitHub Pages-compatible blog workflow with repository-backed JSON storage.

## How it works

- The unlisted editor dashboard is available at `/blogpostcheck` and is not linked publicly. It is not protected by a login, so treat the URL as discoverable.
- The public blog is available at `/blog`.
- Posts are stored in JSON files under the `posts/` folder in the repository.
- Published posts automatically expire 30 days after their publish date.
- No separate server runtime or database is required; the UI uses the GitHub REST API.

## Setup

1. Open `blog.html` and `blogpostcheck.html`.
2. Set `window.KOV_BLOG_CONFIG.repo` to the repository slug: `Danmoneynnhfbn/KOV-CAREER-AGENCY-1`.
3. Set `branch` to the branch containing the blog page and `posts/` directory. In the current repository this is `master`; `main` does not contain them.
4. Ensure `postsPath` is set to `posts`.
5. The `posts/` folder is created automatically by GitHub as soon as the first post JSON file is committed.

## Using the dashboard

- Visit `/blogpostcheck` directly.
- Paste a GitHub personal access token into the dashboard and save it for the current browser session.
- The token stays in browser session storage only and is not stored permanently in the repository.
- Publish new posts or save drafts.
- Posts are committed directly to the repository as JSON files.
- Add a video by providing a hosted video URL or uploading an MP4, WebM, or Ogg file up to 25 MB. Uploaded media is committed under `assets/blog-media/`.
- Add optional subtitles with a hosted WebVTT (`.vtt`) URL or upload a `.vtt` file. Set the language code and label for the caption track.
- Public video posts include browser playback controls and a separate mute/unmute button. Viewers can enable the subtitle track in the player's controls.

## Notes

- The public blog page reads published posts from the repository at runtime.
- For GitHub Pages deployment, the site remains fully static.
- The old `server.py` runtime backend is not required for the GitHub Pages version.
- If `server.py` and `requirements.txt` are present, they are legacy artifacts from the prior local backend approach.
