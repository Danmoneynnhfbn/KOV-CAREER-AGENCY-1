(() => {
  const motionScript = document.currentScript;
  if (!(motionScript instanceof HTMLScriptElement)) return;

  const stylesheetUrl = new URL('kov-motion.css?v=4', motionScript.src);
  if (!document.querySelector(`link[href="${stylesheetUrl.href}"]`)) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = stylesheetUrl.href;
    document.head.append(stylesheet);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('kov-motion-ready');

  const serviceLabels = [
    'Résumé & CV Strategy',
    'LinkedIn Profile Optimization',
    'Career Documents',
    'Career Portfolios',
    'Personal Career Websites',
    'Career Positioning',
    'Career Coaching',
    'Private Career Representation',
  ];
  const editorialLabels = [
    'Evidence before adjectives',
    'Clear professional positioning',
    'Work grounded in real experience',
    'Relevant details, made visible',
    'A considered next step',
  ];

  const createMotionTrack = (labels, className, reverse = false) => {
    const track = document.createElement('div');
    track.className = `kov-motion-track${reverse ? ' kov-motion-track-reverse' : ''}`;
    track.setAttribute('aria-hidden', 'true');

    const runner = document.createElement('div');
    runner.className = `kov-motion-runner ${className}`;
    const set = document.createElement('ul');
    set.className = 'kov-motion-set';

    labels.forEach((label) => {
      const item = document.createElement('li');
      item.textContent = label;
      set.append(item);
    });

    const duplicateSet = set.cloneNode(true);
    duplicateSet.setAttribute('aria-hidden', 'true');
    runner.append(set, duplicateSet);
    track.append(runner);
    return track;
  };

  const createAccessibleList = () => {
    const list = document.createElement('ul');
    list.className = 'kov-motion-sr-list';
    serviceLabels.forEach((label) => {
      const item = document.createElement('li');
      item.textContent = label;
      list.append(item);
    });
    return list;
  };

  const createMotionBand = () => {
    const band = document.createElement('section');
    band.className = 'kov-motion-band kov-motion-band-injected';
    band.setAttribute('aria-label', 'KOV career services and working principles');
    band.innerHTML = '<p class="kov-motion-overline">CAREER SUPPORT, WITH INTENTION</p>';
    band.append(
      createAccessibleList(),
      createMotionTrack(serviceLabels, 'kov-motion-runner-services'),
      createMotionTrack(editorialLabels, 'kov-motion-runner-principles', true),
    );
    return band;
  };

  const main = document.querySelector('main');
  const firstSection = main?.querySelector(':scope > section:first-child');
  const isHomePage = /(?:^|\/)(?:index\.html)?$/.test(window.location.pathname);

  if (main && firstSection && isHomePage) {
    const existingBand = firstSection.nextElementSibling;
    const existingTrack = existingBand?.querySelector('.kov-marquee');

    if (existingBand instanceof HTMLElement && existingTrack instanceof HTMLElement) {
      existingTrack.remove();
      existingBand.classList.add('kov-motion-band', 'kov-motion-band-home');
      existingBand.setAttribute('role', 'region');
      existingBand.setAttribute('aria-label', 'KOV career services and working principles');
      existingBand.replaceChildren(
        Object.assign(document.createElement('p'), {
          className: 'kov-motion-overline',
          textContent: 'CAREER SUPPORT, WITH INTENTION',
        }),
        createAccessibleList(),
        createMotionTrack(serviceLabels, 'kov-motion-runner-services'),
        createMotionTrack(editorialLabels, 'kov-motion-runner-principles', true),
      );
    } else {
      firstSection.after(createMotionBand());
    }

    document.body.classList.add('kov-home-motion');
  }

  const serviceFit = document.querySelector('.service-fit-tool');
  if (serviceFit && !serviceFit.querySelector('.kov-service-fit-route')) {
    const route = document.createElement('div');
    route.className = 'kov-service-fit-route';
    route.setAttribute('aria-hidden', 'true');
    [
      ['resume', 'Résumé / CV'],
      ['linkedin', 'LinkedIn'],
      ['document', 'Documents'],
      ['portfolio', 'Portfolio'],
      ['website', 'Website'],
      ['positioning', 'Positioning'],
      ['coaching', 'Coaching'],
      ['representation', 'Representation'],
    ].forEach(([key, label], index) => {
      const step = document.createElement('span');
      step.dataset.serviceStep = key;
      step.innerHTML = `<i>${String(index + 1).padStart(2, '0')}</i>${label}`;
      route.append(step);
    });
    serviceFit.querySelector('#service-fit-objective')?.after(route);

    const updateRoute = () => {
      route.dataset.activeService = serviceFit.querySelector('#service-fit-objective')?.value || '';
    };
    serviceFit.querySelector('#service-fit-objective')?.addEventListener('change', updateRoute);
    updateRoute();
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-motion-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    document.querySelectorAll('.service-visual, .kov-motion-sequence').forEach((element) => {
      observer.observe(element);
    });
  } else {
    document.querySelectorAll('.service-visual, .kov-motion-sequence').forEach((element) => {
      element.classList.add('is-motion-visible');
    });
  }
})();
