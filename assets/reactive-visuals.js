(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const visualConfigs = [
    {
      selector: 'img[src*="kov-global-talent-map"]',
      kind: 'map',
      mobileSrc: 'assets/kov-global-talent-map-mobile.svg',
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
        { key: 'professionals', label: 'Professionals', detail: 'Representation · Reverse recruiting · Applications · Recruiter outreach · Interview preparation · Negotiation.', x: 19, y: 23, mobileX: 20, mobileY: 19 },
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

  const initialize = (root = document) => {
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
