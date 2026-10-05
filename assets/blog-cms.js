(function () {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const CONFIG = window.KOV_BLOG_CONFIG || {
    repo: 'YOUR_GITHUB_USERNAME/YOUR_REPO',
    branch: 'main',
    postsPath: 'posts',
  };
  const API_BASE = 'https://api.github.com';

  function requireConfig() {
    if (!CONFIG.repo || CONFIG.repo.includes('YOUR_GITHUB_USERNAME')) {
      throw new Error('Missing GitHub repository configuration. Update window.KOV_BLOG_CONFIG in the page.');
    }
    return CONFIG;
  }

  function getGitHubToken() {
    return sessionStorage.getItem('KOV_BLOG_GITHUB_TOKEN') || '';
  }

  function setGitHubToken(token) {
    if (token) {
      sessionStorage.setItem('KOV_BLOG_GITHUB_TOKEN', token.trim());
    } else {
      sessionStorage.removeItem('KOV_BLOG_GITHUB_TOKEN');
    }
  }

  function githubHeaders(useAuth = false) {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (useAuth) {
      const token = getGitHubToken();
      if (!token) {
        throw new Error('GitHub token is required for repository writes.');
      }
      headers.Authorization = `token ${token}`;
    }
    return headers;
  }

  async function requestGitHub(url, options = {}) {
    const response = await fetch(url, options);
    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      // ignore parse errors
    }
    if (!response.ok) {
      const message = payload && (payload.message || payload.error) ? payload.message || payload.error : `GitHub request failed: ${response.status}`;
      throw new Error(message);
    }
    return payload;
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'post';
  }

  function encodeContent(value) {
    return btoa(unescape(encodeURIComponent(value)));
  }

  function decodeContent(value) {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(value), (c) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (error) {
      return atob(value);
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function normalizePost(post, fallbackDate) {
    const createdAt = post.createdAt ? new Date(post.createdAt) : fallbackDate;
    const publishedAt = post.publishedAt ? new Date(post.publishedAt) : fallbackDate;
    const expiresAt = post.expiresAt ? new Date(post.expiresAt) : new Date(publishedAt.getTime() + 30 * DAY_MS);

    return {
      ...post,
      id: post.id || post.filePath || createId(),
      title: post.title || 'Untitled post',
      image: post.image || '',
      video: post.video || '',
      subtitles: post.subtitles || '',
      subtitleLanguage: post.subtitleLanguage || 'en',
      subtitleLabel: post.subtitleLabel || 'English',
      content: post.content || '',
      status: post.status || 'published',
      createdAt: createdAt.toISOString(),
      publishedAt: publishedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      updatedAt: post.updatedAt || new Date().toISOString(),
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getVisiblePosts(posts) {
    const now = Date.now();
    return posts
      .map((post) => normalizePost(post, new Date()))
      .filter((post) => post.status === 'published' && now <= new Date(post.expiresAt).getTime())
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  const previewObjectUrls = new WeakMap();

  function mediaPreviewUrl(file, fallback) {
    if (!file) return fallback;
    if (!previewObjectUrls.has(file)) previewObjectUrls.set(file, URL.createObjectURL(file));
    return previewObjectUrls.get(file);
  }

  async function fetchRepoContents(path) {
    const { repo, branch } = requireConfig();
    const url = `${API_BASE}/repos/${repo}/contents/${path}?ref=${branch}`;
    return requestGitHub(url, { headers: githubHeaders(false) });
  }

  async function fetchRepoFile(path) {
    const { repo, branch } = requireConfig();
    const url = `${API_BASE}/repos/${repo}/contents/${path}?ref=${branch}`;
    return requestGitHub(url, { headers: githubHeaders(false) });
  }

  async function putRepoFile(path, contentBase64, message, sha) {
    const { repo, branch } = requireConfig();
    const url = `${API_BASE}/repos/${repo}/contents/${path}`;
    const body = { message, content: contentBase64, branch };
    if (sha) body.sha = sha;
    return requestGitHub(url, {
      method: 'PUT',
      headers: githubHeaders(true),
      body: JSON.stringify(body),
    });
  }

  async function uploadMediaFile(file) {
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`${file.name} is larger than the 25 MB upload limit.`);
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^\.+/, '') || 'media';
    const path = `assets/blog-media/${Date.now()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    const { repo, branch } = requireConfig();
    await putRepoFile(path, btoa(binary), `Upload blog media: ${safeName}`);
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    return `https://raw.githubusercontent.com/${repo}/${branch}/${encodedPath}`;
  }

  async function deleteRepoFile(path, sha, message) {
    const { repo, branch } = requireConfig();
    const url = `${API_BASE}/repos/${repo}/contents/${path}`;
    return requestGitHub(url, {
      method: 'DELETE',
      headers: githubHeaders(true),
      body: JSON.stringify({ message, sha, branch }),
    });
  }

  async function readPosts() {
    const { postsPath } = requireConfig();
    let contents;
    try {
      contents = await fetchRepoContents(postsPath);
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes('not found')) {
        return [];
      }
      throw error;
    }

    if (!Array.isArray(contents)) {
      return [];
    }

    const files = contents.filter((item) => item.type === 'file' && item.name.toLowerCase().endsWith('.json'));
    const posts = await Promise.all(
      files.map(async (item) => {
        try {
          const file = await fetchRepoFile(item.path);
          const text = decodeContent(file.content || '');
          const data = JSON.parse(text);
          return {
            ...data,
            filePath: item.path,
            sha: file.sha,
          };
        } catch (error) {
          console.error('Failed to load post', item.path, error);
          return null;
        }
      }),
    );

    return posts.filter(Boolean);
  }

  async function savePost(post) {
    const { postsPath } = requireConfig();
    const existing = post.filePath || null;
    const newPost = normalizePost(post, new Date());
    // GitHub will create the posts folder automatically when the first post file is committed.
    const filename = existing
      ? existing
      : `${postsPath}/${slugify(newPost.title)}-${Date.now()}.json`;
    const message = existing
      ? `Update blog post: ${newPost.title}`
      : `Publish blog post: ${newPost.title}`;
    const content = encodeContent(JSON.stringify(newPost, null, 2));
    const response = await putRepoFile(filename, content, message, newPost.sha);
    return {
      ...newPost,
      filePath: response.content.path,
      sha: response.content.sha,
    };
  }

  async function deletePost(postId) {
    const post = postsById[postId];
    if (!post || !post.filePath || !post.sha) {
      throw new Error('Unable to delete post: missing file metadata.');
    }
    await deleteRepoFile(post.filePath, post.sha, `Delete blog post: ${post.title}`);
    return true;
  }

  function renderPostPreview(target, post) {
    if (!target) return;
    const safePost = normalizePost(post || {}, new Date());

    target.innerHTML = `
      <article class="preview-card">
        ${safePost.image ? `<img src="${safePost.image}" alt="${escapeHtml(safePost.title)}" class="preview-image" />` : ''}
        ${safePost.video ? `<div class="blog-video-wrap"><video class="blog-video" controls playsinline preload="metadata" src="${escapeHtml(safePost.video)}">${safePost.subtitles ? `<track kind="subtitles" src="${escapeHtml(safePost.subtitles)}" srclang="${escapeHtml(safePost.subtitleLanguage)}" label="${escapeHtml(safePost.subtitleLabel)}" default />` : ''}</video><button type="button" class="blog-video-mute" data-video-mute aria-pressed="false">Mute</button></div>` : ''}
        <div class="preview-body">
          <p class="meta">${formatDate(safePost.publishedAt)}</p>
          <h3>${escapeHtml(safePost.title || 'Untitled post')}</h3>
          <div class="preview-content">${safePost.content || '<p>Start writing your article…</p>'}</div>
        </div>
      </article>
    `;
    bindVideoMuteButtons(target);
  }

  function bindVideoMuteButtons(target) {
    target.querySelectorAll('[data-video-mute]').forEach((button) => {
      button.addEventListener('click', () => {
        const video = button.parentElement.querySelector('video');
        if (!video) return;
        video.muted = !video.muted;
        button.textContent = video.muted ? 'Unmute' : 'Mute';
        button.setAttribute('aria-pressed', String(video.muted));
      });
    });
  }

  async function renderPublicBlog() {
    const root = document.getElementById('blog-public-root');
    if (!root) return;

    let posts;
    try {
      posts = getVisiblePosts(await readPosts());
    } catch (error) {
      root.innerHTML = `<div class="empty-state"><h2>Unable to load blog posts</h2><p>${escapeHtml(error.message)}</p></div>`;
      return;
    }

    if (!posts.length) {
      root.innerHTML = '<div class="empty-state"><h2>No posts yet</h2></div>';
      return;
    }

    root.innerHTML = posts
      .map((post) => `
        <article class="blog-post">
          ${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.title)}" class="blog-image" />` : ''}
          ${post.video ? `<div class="blog-video-wrap"><video class="blog-video" controls playsinline preload="metadata" src="${escapeHtml(post.video)}">${post.subtitles ? `<track kind="subtitles" src="${escapeHtml(post.subtitles)}" srclang="${escapeHtml(post.subtitleLanguage)}" label="${escapeHtml(post.subtitleLabel)}" default />` : ''}</video><button type="button" class="blog-video-mute" data-video-mute aria-pressed="false">Mute</button></div>` : ''}
          <div class="blog-copy">
            <p class="meta">Published ${formatDate(post.publishedAt)}</p>
            <h2>${escapeHtml(post.title)}</h2>
            <div class="rich-content">${post.content}</div>
          </div>
        </article>
      `)
      .join('');
    bindVideoMuteButtons(root);
  }

  let postsById = {};

  async function initDashboard() {
    const root = document.getElementById('blog-admin-root');
    if (!root) return;

    const form = document.getElementById('post-form');
    const titleInput = document.getElementById('post-title');
    const imageInput = document.getElementById('post-image');
    const imageFileInput = document.getElementById('post-image-file');
    const videoInput = document.getElementById('post-video');
    const videoFileInput = document.getElementById('post-video-file');
    const subtitlesInput = document.getElementById('post-subtitles');
    const subtitlesFileInput = document.getElementById('post-subtitles-file');
    const subtitleLanguageInput = document.getElementById('post-subtitle-language');
    const subtitleLabelInput = document.getElementById('post-subtitle-label');
    const editor = document.getElementById('post-editor');
    const previewPane = document.getElementById('preview-pane');
    const postList = document.getElementById('post-list');
    const currentPostId = document.getElementById('post-id');
    const deleteButton = document.getElementById('delete-post');
    const clearButton = document.getElementById('clear-form');
    const statusNote = document.getElementById('status-note');
    const tokenField = document.getElementById('github-token');
    const saveTokenButton = document.getElementById('save-github-token');
    const clearTokenButton = document.getElementById('clear-github-token');
    const tokenStatus = document.getElementById('token-status');

    let posts = [];
    let selectedPost = null;

    function updateTokenStatus() {
      const token = getGitHubToken();
      tokenStatus.textContent = token ? 'GitHub token loaded for this session.' : 'No GitHub token is stored. Save one before publishing.';
    }

    async function loadPosts() {
      try {
        posts = await readPosts();
        postsById = posts.reduce((map, post) => {
          map[post.id] = post;
          return map;
        }, {});
        renderPostList();
      } catch (error) {
        postList.innerHTML = `<p class="muted">Unable to load posts: ${escapeHtml(error.message)}</p>`;
      }
    }

    async function cleanExpiredPosts() {
      const token = getGitHubToken();
      if (!token) return;
      const now = Date.now();
      const expired = posts.filter((post) => post.status === 'published' && new Date(post.expiresAt).getTime() < now && post.filePath && post.sha);
      for (const expiredPost of expired) {
        try {
          await deleteRepoFile(expiredPost.filePath, expiredPost.sha, `Remove expired blog post: ${expiredPost.title}`);
        } catch (error) {
          console.warn('Could not remove expired post:', expiredPost.filePath, error.message);
        }
      }
      if (expired.length) {
        await loadPosts();
      }
    }

    function renderPostList() {
      const list = posts
        .slice()
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((post) => {
          const normalized = normalizePost(post, new Date());
          return `
            <button type="button" class="post-item ${selectedPost && selectedPost.id === normalized.id ? 'selected' : ''}" data-id="${normalized.id}">
              <strong>${escapeHtml(normalized.title)}</strong>
              <span>${normalized.status === 'published' ? 'Published' : 'Draft'} • ${formatDate(normalized.updatedAt)}</span>
            </button>
          `;
        })
        .join('');

      postList.innerHTML = list || '<p class="muted">No posts saved yet.</p>';
      postList.querySelectorAll('.post-item').forEach((button) => {
        button.addEventListener('click', () => loadPost(button.getAttribute('data-id')));
      });
    }

    function updatePreview() {
      renderPostPreview(previewPane, {
        id: currentPostId.value,
        title: titleInput.value,
        image: imageInput.value,
        video: mediaPreviewUrl(videoFileInput.files[0], videoInput.value),
        subtitles: mediaPreviewUrl(subtitlesFileInput.files[0], subtitlesInput.value),
        subtitleLanguage: subtitleLanguageInput.value,
        subtitleLabel: subtitleLabelInput.value,
        content: editor.innerHTML,
        status: 'published',
        publishedAt: new Date().toISOString(),
      });
    }

    function resetForm() {
      form.reset();
      currentPostId.value = '';
      editor.innerHTML = '';
      imageInput.value = '';
      videoInput.value = '';
      videoFileInput.value = '';
      subtitlesInput.value = '';
      subtitlesFileInput.value = '';
      subtitleLanguageInput.value = 'en';
      subtitleLabelInput.value = 'English';
      selectedPost = null;
      deleteButton.disabled = true;
      statusNote.textContent = 'Create a new post from the editor.';
      updatePreview();
    }

    function loadPost(postId) {
      const match = postsById[postId];
      if (!match) return;
      selectedPost = normalizePost(match, new Date());
      titleInput.value = selectedPost.title;
      imageInput.value = selectedPost.image || '';
      videoInput.value = selectedPost.video || '';
      videoFileInput.value = '';
      subtitlesInput.value = selectedPost.subtitles || '';
      subtitlesFileInput.value = '';
      subtitleLanguageInput.value = selectedPost.subtitleLanguage || 'en';
      subtitleLabelInput.value = selectedPost.subtitleLabel || 'English';
      editor.innerHTML = selectedPost.content || '';
      currentPostId.value = selectedPost.id;
      deleteButton.disabled = false;
      statusNote.textContent = `Editing ${selectedPost.title}`;
      updatePreview();
    }

    document.querySelectorAll('[data-command]').forEach((button) => {
      button.addEventListener('click', () => {
        const command = button.getAttribute('data-command');
        const value = button.getAttribute('data-value') || null;
        document.execCommand(command, false, value);
        editor.focus();
        updatePreview();
      });
    });

    titleInput.addEventListener('input', updatePreview);
    imageInput.addEventListener('input', updatePreview);
    videoInput.addEventListener('input', updatePreview);
    subtitlesInput.addEventListener('input', updatePreview);
    subtitleLanguageInput.addEventListener('input', updatePreview);
    subtitleLabelInput.addEventListener('input', updatePreview);
    videoFileInput.addEventListener('change', updatePreview);
    subtitlesFileInput.addEventListener('change', updatePreview);
    editor.addEventListener('input', updatePreview);

    imageFileInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        imageInput.value = reader.result;
        updatePreview();
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const action = event.submitter && event.submitter.value ? event.submitter.value : 'publish';
      const postId = currentPostId.value || createId();
      const existing = postsById[postId];
      const now = new Date();
      let videoUrl = videoInput.value.trim();
      let subtitlesUrl = subtitlesInput.value.trim();
      try {
        if (videoFileInput.files[0]) {
          statusNote.textContent = 'Uploading video to the blog repository…';
          videoUrl = await uploadMediaFile(videoFileInput.files[0]);
        }
        if (subtitlesFileInput.files[0]) {
          const subtitlesFile = subtitlesFileInput.files[0];
          if (!subtitlesFile.name.toLowerCase().endsWith('.vtt')) {
            throw new Error('Subtitles must be a WebVTT (.vtt) file.');
          }
          statusNote.textContent = 'Uploading subtitle file…';
          subtitlesUrl = await uploadMediaFile(subtitlesFile);
        }
      } catch (error) {
        statusNote.textContent = error.message || 'Unable to upload media.';
        return;
      }
      const nextPost = normalizePost(
        {
          id: postId,
          title: titleInput.value.trim() || 'Untitled post',
          image: imageInput.value.trim(),
          video: videoUrl,
          subtitles: subtitlesUrl,
          subtitleLanguage: subtitleLanguageInput.value.trim() || 'en',
          subtitleLabel: subtitleLabelInput.value.trim() || 'English',
          content: editor.innerHTML.trim(),
          status: action === 'draft' ? 'draft' : 'published',
          createdAt: existing ? existing.createdAt : now.toISOString(),
          publishedAt: existing && existing.publishedAt ? existing.publishedAt : now.toISOString(),
          expiresAt: existing && existing.expiresAt ? existing.expiresAt : new Date(now.getTime() + 30 * DAY_MS).toISOString(),
          updatedAt: now.toISOString(),
          filePath: existing ? existing.filePath : null,
          sha: existing ? existing.sha : null,
        },
        now,
      );

      try {
        const saved = await savePost(nextPost);
        postsById[saved.id] = saved;
        selectedPost = saved;
        statusNote.textContent = saved.status === 'published' ? 'Published to the public blog.' : 'Saved as a draft.';
        await loadPosts();
        loadPost(saved.id);
      } catch (error) {
        statusNote.textContent = error.message || 'Unable to save post.';
      }
    });

    deleteButton.addEventListener('click', async () => {
      if (!selectedPost) return;
      try {
        await deleteRepoFile(selectedPost.filePath, selectedPost.sha, `Delete blog post: ${selectedPost.title}`);
        delete postsById[selectedPost.id];
        await loadPosts();
        resetForm();
        statusNote.textContent = 'Post deleted successfully.';
      } catch (error) {
        statusNote.textContent = error.message || 'Unable to delete post.';
      }
    });

    saveTokenButton.addEventListener('click', () => {
      const token = tokenField.value.trim();
      setGitHubToken(token);
      tokenField.value = '';
      updateTokenStatus();
    });

    clearTokenButton.addEventListener('click', () => {
      setGitHubToken('');
      updateTokenStatus();
    });

    clearButton.addEventListener('click', (event) => {
      event.preventDefault();
      resetForm();
    });

    updateTokenStatus();
    await loadPosts();
    await cleanExpiredPosts();
    resetForm();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blog-admin-root')) {
      initDashboard();
    }
    if (document.getElementById('blog-public-root')) {
      renderPublicBlog();
    }
  });

  window.KOVBlogCMS = {
    readPosts,
    savePost,
    normalizePost,
    formatDate,
    getVisiblePosts,
    renderPublicBlog,
    renderPostPreview,
  };
})();
