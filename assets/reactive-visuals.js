(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rootPrefix = /\/(?:services|markets|roles|industries|resources)\/[^/]*$/.test(window.location.pathname)
    ? '../'
    : '';
  const visualConfigs = [
    {
      selector: 'img[src*="kov-global-talent-map"]',
      kind: 'map',
      mobileSrc: `${rootPrefix}assets/kov-global-talent-map-mobile.svg`,
      points: [
        { key: 'north-america', label: 'North America', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 23, y: 41, mobileX: 20, mobileY: 45 },
        { key: 'south-america', label: 'South America', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 25, y: 67, mobileX: 30, mobileY: 68 },
        { key: 'europe', label: 'Europe', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 50, y: 37, mobileX: 50, mobileY: 44 },
        { key: 'africa', label: 'Africa', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 48, y: 57, mobileX: 52.5, mobileY: 62.5 },
        { key: 'middle-east', label: 'Middle East', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 61, y: 47, mobileX: 60.8, mobileY: 41 },
        { key: 'asia', label: 'Asia-Pacific', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 78, y: 42, mobileX: 80, mobileY: 45 },
        { key: 'oceania', label: 'Oceania', detail: 'Illustrative market region. Search coverage is defined by the engagement.', x: 86, y: 72, mobileX: 80, mobileY: 67.5 },
      ],
    },
    {
      selector: 'img[src*="kov-executive-intelligence-network"]',
      kind: 'network',
      points: [
        { key: 'professionals', label: 'Professionals', detail: 'Representation · Career Representation · Applications · Recruiter outreach · Interview preparation · Negotiation.', x: 19, y: 23, mobileX: 20, mobileY: 19 },
        { key: 'executives', label: 'Executives', detail: 'Senior leaders and executive talent.', x: 50, y: 15, mobileX: 50, mobileY: 17 },
        { key: 'companies', label: 'Companies', detail: 'Global talent sourcing · Passive executive search · Talent research · Mapping · Confidential outreach · Executive pipeline.', x: 81, y: 23, mobileX: 80, mobileY: 19 },
        { key: 'markets', label: 'Markets and research', detail: 'Research-led market context and professional networks.', x: 85, y: 50, mobileX: 80, mobileY: 81 },
        { key: 'hiring-managers', label: 'Hiring managers', detail: 'Relevant decision-makers in the search.', x: 81, y: 77, mobileX: 50, mobileY: 86 },
        { key: 'recruiters', label: 'Recruiters', detail: 'Relevant recruiter outreach and follow-up.', x: 50, y: 85, mobileX: 20, mobileY: 81 },
        { key: 'professional-networks', label: 'Professional networks', detail: 'Relevant connections and warm introductions.', x: 19, y: 77, mobileX: 80, mobileY: 81 },
        { key: 'research', label: 'Research', detail: 'Research informs targeting and outreach.', x: 8, y: 50, mobileX: 80, mobileY: 81 },
      ],
    },
    {
      selector: 'img[src*="kov-research-layer"]',
      kind: 'research',
      points: [
        { key: 'target-companies', label: 'Target companies', detail: 'Organization mapping.', x: 16, y: 43, mobileX: 27, mobileY: 38 },
        { key: 'professional-networks', label: 'Professional networks', detail: 'Relevant connections.', x: 50, y: 43, mobileX: 27, mobileY: 78 },
        { key: 'career-histories', label: 'Career histories', detail: 'Role and progression.', x: 84, y: 43, mobileX: 27, mobileY: 58 },
        { key: 'executive-profiles', label: 'Executive profiles', detail: 'Leadership fit.', x: 16, y: 62, mobileX: 73, mobileY: 38 },
        { key: 'market-intelligence', label: 'Market intelligence', detail: 'Signals to validate.', x: 50, y: 62, mobileX: 73, mobileY: 78 },
        { key: 'industry-signals', label: 'Industry signals', detail: 'Public market context.', x: 84, y: 62, mobileX: 73, mobileY: 58 },
      ],
    },
  ];

  const activateFocus = (canvas, point, selected = false) => {
    canvas.dataset.kovFocus = point.key;
    canvas.querySelectorAll('.kov-visual-hotspot').forEach((button) => {
      const active = button.dataset.hotspot === point.key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active && selected));
    });
  };

  const createHotspot = (canvas, point) => {
    const button = document.createElement('button');
    const tooltip = document.createElement('span');
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    const descriptionId = `kov-visual-${point.key}-${Math.random().toString(36).slice(2, 8)}`;

    button.className = `kov-visual-hotspot kov-hotspot-${point.key}`;
    button.type = 'button';
    button.dataset.hotspot = point.key;
    button.style.setProperty('--hotspot-x', `${point.x}%`);
    button.style.setProperty('--hotspot-y', `${point.y}%`);
    button.style.setProperty('--hotspot-mobile-x', `${point.mobileX ?? point.x}%`);
    button.style.setProperty('--hotspot-mobile-y', `${point.mobileY ?? point.y}%`);
    button.setAttribute('aria-label', `${point.label}: ${point.detail}`);
    button.setAttribute('aria-describedby', descriptionId);
    button.setAttribute('aria-pressed', 'false');
    button.title = point.label;

    tooltip.className = 'kov-visual-tooltip';
    tooltip.id = descriptionId;
    title.textContent = point.label;
    detail.textContent = point.detail;
    tooltip.append(title, detail);
    button.append(tooltip);

    button.addEventListener('pointerenter', () => activateFocus(canvas, point));
    button.addEventListener('pointerleave', () => {
      if (!button.matches(':focus') && !button.getAttribute('aria-pressed').includes('true')) {
        delete canvas.dataset.kovFocus;
        button.classList.remove('is-active');
      }
    });
    button.addEventListener('focus', () => activateFocus(canvas, point));
    button.addEventListener('blur', () => {
      if (!button.getAttribute('aria-pressed').includes('true')) {
        delete canvas.dataset.kovFocus;
        button.classList.remove('is-active');
      }
    });
    button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') !== 'true';
      if (selected) {
        activateFocus(canvas, point, true);
      } else {
        delete canvas.dataset.kovFocus;
        button.classList.remove('is-active');
        button.setAttribute('aria-pressed', 'false');
      }
    });
    canvas.append(button);
  };

  const enhanceVisual = (image, config) => {
    const figure = image.closest('figure');
    if (!figure || figure.dataset.kovReactive === 'true') return;

    let media = image.closest('picture') || image;
    if (config.mobileSrc && media === image) {
      const picture = document.createElement('picture');
      const mobileSource = document.createElement('source');
      mobileSource.media = '(max-width: 680px)';
      mobileSource.srcset = config.mobileSrc;
      image.parentNode.insertBefore(picture, image);
      picture.append(mobileSource, image);
      media = picture;
    }
    const canvas = document.createElement('div');
    canvas.className = `kov-reactive-canvas kov-reactive-${config.kind}`;
    canvas.dataset.kovReactive = 'true';
    canvas.dataset.visualKind = config.kind;
    media.parentNode.insertBefore(canvas, media);
    canvas.append(media);
    figure.dataset.kovReactive = 'true';

    config.points.forEach((point) => createHotspot(canvas, point));

    if (finePointer && !reduceMotion) {
      let frame = 0;
      canvas.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse' || frame) return;
        frame = requestAnimationFrame(() => {
          const rect = canvas.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          canvas.style.setProperty('--image-shift-x', `${(x * 3).toFixed(2)}px`);
          canvas.style.setProperty('--image-shift-y', `${(y * 3).toFixed(2)}px`);
          frame = 0;
        });
      }, { passive: true });
      canvas.addEventListener('pointerleave', () => {
        canvas.style.setProperty('--image-shift-x', '0px');
        canvas.style.setProperty('--image-shift-y', '0px');
      });
    }
  };

  const initPointerSurface = (element) => {
    if (element.dataset.kovPointerReady || !finePointer || reduceMotion) return;
    element.dataset.kovPointerReady = 'true';
    element.classList.add('kov-reactive-surface');
    let frame = 0;

    element.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || frame) return;
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.setProperty('--kov-bg-x', `${(x * 8).toFixed(2)}px`);
        element.style.setProperty('--kov-bg-y', `${(y * 6).toFixed(2)}px`);
        frame = 0;
      });
    }, { passive: true });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--kov-bg-x', '0px');
      element.style.setProperty('--kov-bg-y', '0px');
    });
  };

  const activateSearchRoute = (route) => {
    if (route.dataset.kovProgressStarted) return;
    route.dataset.kovProgressStarted = 'true';
    route.querySelectorAll('li').forEach((stage, index) => {
      if (reduceMotion) {
        stage.classList.add('is-active');
      } else {
        window.setTimeout(() => stage.classList.add('is-active'), index * 130);
      }
    });
  };

  let stageObserver;
  if ('IntersectionObserver' in window && !reduceMotion) {
    stageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const route = entry.target.closest('.kov-search-route');
        if (route) {
          activateSearchRoute(route);
          route.querySelectorAll('li').forEach((stage) => observer.unobserve(stage));
          return;
        }
        entry.target.classList.add('is-active');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0.15 });
  }

  let stageFrame = 0;
  const activateVisibleStages = () => {
    const upperEdge = window.innerHeight * 0.12;
    const lowerEdge = window.innerHeight * 0.88;
    document.querySelectorAll('[data-kov-stage-ready]:not(.is-active)').forEach((stage) => {
      const route = stage.closest('.kov-search-route');
      if (route) {
        const rect = route.getBoundingClientRect();
        if (rect.bottom >= upperEdge && rect.top <= lowerEdge) activateSearchRoute(route);
        return;
      }
      const rect = stage.getBoundingClientRect();
      if (rect.bottom >= upperEdge && rect.top <= lowerEdge) stage.classList.add('is-active');
    });
    stageFrame = 0;
  };

  const scheduleStageCheck = () => {
    if (document.visibilityState === 'hidden') {
      activateVisibleStages();
      return;
    }
    if (!stageFrame) stageFrame = requestAnimationFrame(activateVisibleStages);
  };

  window.addEventListener('scroll', scheduleStageCheck, { passive: true });
  window.addEventListener('resize', scheduleStageCheck, { passive: true });
  window.addEventListener('focus', scheduleStageCheck);
  document.addEventListener('visibilitychange', scheduleStageCheck);

  const seoRevealObserver = 'IntersectionObserver' in window && !reduceMotion
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    : null;
  let seoProgressFrame = 0;
  let seoProgressBar;
    let seoChapterNavigation;
    let seoChapterSections = [];

    const updateSeoChapterNavigation = () => {
      if (!seoChapterNavigation || seoChapterSections.length === 0) return;
      const scrollPosition = window.scrollY + window.innerHeight * 0.38;
      const firstSection = seoChapterSections[0];
      const lastSection = seoChapterSections[seoChapterSections.length - 1];
      const start = firstSection.getBoundingClientRect().top + window.scrollY;
      const end = lastSection.getBoundingClientRect().bottom + window.scrollY;
      const progress = end > start ? (scrollPosition - start) / (end - start) : 0;
      seoChapterNavigation.style.setProperty('--seo-chapter-progress', String(Math.min(1, Math.max(0, progress))));

      let activeIndex = 0;
      seoChapterSections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.38) activeIndex = index;
      });
      const storyStage = seoChapterNavigation.nextElementSibling?.querySelector('.seo-story-stage');
      if (storyStage && storyStage.dataset.activeChapter !== String(activeIndex)) {
        storyStage.dataset.activeChapter = String(activeIndex);
        storyStage.querySelectorAll('.seo-story-frame').forEach((frame, index) => {
          frame.classList.toggle('is-current', index === activeIndex);
        });
        storyStage.querySelector('[data-story-index]').textContent = String(activeIndex + 1).padStart(2, '0');
        const chapter = seoChapterSections[activeIndex];
        storyStage.querySelector('[data-story-eyebrow]').textContent =
          chapter.querySelector('.kov-eyebrow')?.textContent.trim() || '';
        storyStage.querySelector('[data-story-title]').textContent =
          chapter.querySelector('.kov-section-heading h2')?.textContent.trim() || '';
        seoChapterSections.forEach((section, index) => section.classList.toggle('is-story-active', index === activeIndex));
      }
      seoChapterNavigation.querySelectorAll('a').forEach((link, index) => {
        if (index === activeIndex) {
          link.setAttribute('aria-current', 'step');
          link.classList.add('is-current');
        } else {
          link.removeAttribute('aria-current');
          link.classList.remove('is-current');
        }
      });
    };

    const updateSeoProgress = () => {
      if (seoProgressBar) {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        seoProgressBar.style.setProperty('--seo-reading-progress', String(Math.min(1, Math.max(0, progress))));
      }
      updateSeoChapterNavigation();
      seoProgressFrame = 0;
    };

  const scheduleSeoProgress = () => {
    if (seoProgressFrame) return;
    seoProgressFrame = requestAnimationFrame(updateSeoProgress);
  };

  const enableSeoProgress = (page) => {
    if (reduceMotion || page.dataset.seoProgressReady) return;
    page.dataset.seoProgressReady = 'true';
    if (!seoProgressBar) {
      seoProgressBar = document.createElement('div');
      seoProgressBar.className = 'seo-reading-progress';
      seoProgressBar.setAttribute('aria-hidden', 'true');
      document.body.append(seoProgressBar);
      window.addEventListener('scroll', scheduleSeoProgress, { passive: true });
      window.addEventListener('resize', scheduleSeoProgress, { passive: true });
    }
    scheduleSeoProgress();
  };

  const enableSeoChapterNavigation = (page) => {
    if (page.dataset.seoChaptersReady) return;
    const hero = page.querySelector('.seo-hero');
    const sections = [...page.querySelectorAll('main > .kov-section:not(.seo-faq, .seo-related, .kov-final-cta)')];
    if (!hero || sections.length === 0) return;

    page.dataset.seoChaptersReady = 'true';
    seoChapterSections = sections;
    seoChapterNavigation = document.createElement('nav');
    seoChapterNavigation.className = 'seo-chapter-nav';
    seoChapterNavigation.setAttribute('aria-label', 'On this page');
    seoChapterNavigation.innerHTML = '<span class="seo-chapter-track" aria-hidden="true"></span>';

    sections.forEach((section, index) => {
      const heading = section.querySelector('.kov-section-heading h2');
      const eyebrow = section.querySelector('.kov-section-heading .kov-eyebrow');
      if (!heading) return;

      const id = `seo-chapter-${index + 1}`;
      section.id = id;
      const link = document.createElement('a');
      const number = document.createElement('span');
      const label = document.createElement('span');
      link.href = `#${id}`;
      link.setAttribute('aria-label', `${eyebrow?.textContent.trim() || `Section ${index + 1}`}: ${heading.textContent.trim()}`);
      number.className = 'seo-chapter-number';
      number.textContent = String(index + 1).padStart(2, '0');
      label.className = 'seo-chapter-label';
      label.textContent = eyebrow?.textContent.trim() || heading.textContent.trim();
      link.append(number, label);
      seoChapterNavigation.append(link);
    });

    hero.insertAdjacentElement('afterend', seoChapterNavigation);
    window.addEventListener('scroll', scheduleSeoProgress, { passive: true });
    window.addEventListener('resize', scheduleSeoProgress, { passive: true });
    scheduleSeoProgress();
  };

  const enableSeoStory = (page) => {
    if (page.dataset.seoStoryReady) return;
    const main = page.querySelector('main');
    const sections = [...page.querySelectorAll('main > .kov-section:not(.seo-faq, .seo-related, .kov-final-cta)')];
    const navigation = page.querySelector('.seo-chapter-nav');
    if (!main || !navigation || sections.length !== 3) return;

    page.dataset.seoStoryReady = 'true';
    const story = document.createElement('div');
    story.className = 'seo-story-shell';
    const stage = document.createElement('aside');
    stage.className = 'seo-story-stage';
    stage.dataset.activeChapter = '-1';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `
      <div class="seo-story-stage-orbit"></div>
      <div class="seo-story-frames"></div>
      <div class="seo-story-stage-topline"><span>KOV / FIELD NOTES</span><span>GLOBAL TALENT INTELLIGENCE</span></div>
      <div class="seo-story-stage-bottom">
        <div class="seo-story-stage-chapter"><span data-story-index>01</span><span class="seo-story-stage-rule"></span><span data-story-eyebrow></span></div>
        <p data-story-title></p>
        <div class="seo-story-stage-footer"><span>RESEARCH, WITH INTENT.</span><span>SCROLL TO EXPLORE <b>↓</b></span></div>
      </div>`;
    const frames = stage.querySelector('.seo-story-frames');
    const chapters = document.createElement('div');
    chapters.className = 'seo-story-chapters';

    sections.forEach((section, index) => {
      const figure = section.querySelector('.seo-section-visual');
      const image = figure?.querySelector('img');
      if (figure && image) {
        const frame = document.createElement('figure');
        frame.className = 'seo-story-frame';
        frame.dataset.storyFrame = String(index);
        frame.setAttribute('aria-hidden', 'true');
        const imageClone = image.cloneNode();
        imageClone.alt = '';
        imageClone.removeAttribute('loading');
        frame.append(imageClone);
        frames.append(frame);
        figure.dataset.storyInlineVisual = 'true';
      }
      section.classList.add('seo-story-chapter');
      section.dataset.storyChapter = String(index);
      chapters.append(section);
    });

    story.append(stage, chapters);
    navigation.insertAdjacentElement('afterend', story);
    scheduleSeoProgress();
  };

  const enableSeoSpotlight = (section) => {
    if (reduceMotion || !finePointer || section.dataset.seoSpotlightReady) return;
    section.dataset.seoSpotlightReady = 'true';
    const glow = document.createElement('span');
    glow.className = 'seo-cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    section.append(glow);
    let frame = 0;

    section.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || frame) return;
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--seo-pointer-x', `${(event.clientX - rect.left).toFixed(1)}px`);
        section.style.setProperty('--seo-pointer-y', `${(event.clientY - rect.top).toFixed(1)}px`);
        section.classList.add('seo-pointer-active');
        frame = 0;
      });
    }, { passive: true });
    section.addEventListener('pointerleave', () => section.classList.remove('seo-pointer-active'));
  };

  const initializeSeoMotion = (root) => {
    const pages = [];
    if (root instanceof Element && root.matches('.seo-landing-page')) pages.push(root);
    root.querySelectorAll?.('.seo-landing-page').forEach((page) => pages.push(page));

    pages.forEach((page) => {
      if (page.dataset.seoMotionReady) return;
      page.dataset.seoMotionReady = 'true';
      enableSeoProgress(page);
      enableSeoChapterNavigation(page);
      enableSeoStory(page);

      if (seoRevealObserver) {
        page.classList.add('seo-motion-enabled');

        const targets = [
          ...page.querySelectorAll('.seo-hero-copy, .seo-hero-art'),
          ...page.querySelectorAll('.seo-story-chapters > .kov-section:not(.seo-faq, .seo-related, .kov-final-cta)'),
          ...page.querySelectorAll('main > .seo-faq, main > .seo-related, main > .kov-final-cta, .kov-footer-categories'),
        ];
        targets.forEach((target, index) => {
          target.dataset.seoReveal = target.classList.contains('seo-hero-copy')
            ? 'hero-copy'
            : target.classList.contains('seo-hero-art')
              ? 'hero-art'
              : 'section';
          target.style.setProperty('--seo-reveal-delay', `${Math.min(index % 3, 2) * 90}ms`);
          seoRevealObserver.observe(target);
        });
      }

      page.querySelectorAll('.seo-story-chapters > .kov-section:not(.seo-faq, .seo-related, .kov-final-cta), main > .seo-faq, main > .seo-related, main > .kov-final-cta')
        .forEach(enableSeoSpotlight);

      const heroArt = page.querySelector('.seo-hero-art');
      if (heroArt && finePointer) {
        let frame = 0;
        heroArt.addEventListener('pointermove', (event) => {
          if (event.pointerType !== 'mouse' || frame) return;
          frame = requestAnimationFrame(() => {
            const rect = heroArt.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            heroArt.style.setProperty('--seo-tilt-x', `${(-y * 5).toFixed(2)}deg`);
            heroArt.style.setProperty('--seo-tilt-y', `${(x * 5).toFixed(2)}deg`);
            frame = 0;
          });
        }, { passive: true });
        heroArt.addEventListener('pointerleave', () => {
          heroArt.style.setProperty('--seo-tilt-x', '0deg');
          heroArt.style.setProperty('--seo-tilt-y', '0deg');
        });
      }
    });
  };

  const initialize = (root = document) => {
    initializeSeoMotion(root);
    const serviceArtwork = [
      ['A focused team reviewing work at a laptop', 'assets/kov-service-overview.svg', 'KOV search route connecting role definition, research, positioning, and executive conversations'],
      ['High-Volume Job Applications', 'assets/kov-service-applications.svg', 'Illustrative application workflow with role-fit review, positioning, client approval, and submission steps'],
      ['Outreach On Every Application', 'assets/kov-service-outreach.svg', 'Illustrative outreach sequence from research and contact identification to personalized messaging and follow-up'],
      ['Resume & LinkedIn Rewrite', 'assets/kov-service-positioning.svg', 'Illustrative positioning framework aligning verified career experience with target-role messaging'],
      ['Interview Prep & Negotiation', 'assets/kov-service-overview.svg', 'KOV search route connecting role definition, research, positioning, and executive conversations'],
    ];
    serviceArtwork.forEach(([alt, source, description]) => {
      root.querySelectorAll?.(`img[alt="${alt}"]`).forEach((image) => {
        image.src = source;
        image.alt = description;
        image.removeAttribute('srcset');
        image.classList.add('kov-service-art');
        image.closest('.aspect-\\[3\\/4\\], .aspect-\\[4\\/5\\]')?.classList.add('kov-service-art-frame');
      });
    });

    visualConfigs.forEach((config) => {
      root.querySelectorAll?.(config.selector).forEach((image) => enhanceVisual(image, config));
    });

    root.querySelectorAll?.('.kov-hero, .kov-section-dark, main > section:first-child').forEach(initPointerSurface);

    root.querySelectorAll?.('.kov-search-route li, .kov-steps li, .kov-service-grid article, .kov-role-grid li').forEach((stage, index) => {
      if (stage.dataset.kovStageReady) return;
      stage.dataset.kovStageReady = 'true';
      stage.style.setProperty('--kov-stage-index', index % 8);
      if (stageObserver) stageObserver.observe(stage);
      else stage.classList.add('is-active');
    });
    scheduleStageCheck();
  };

  initialize();
  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
