(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  const assetBase = new URL('.', document.currentScript?.src || `${location.origin}/assets/`);
  const path = location.pathname.toLowerCase();
  const pageFamily = /^\/(?:index\.html)?$/.test(path) ? 'home'
    : /^\/markets\//.test(path) ? 'markets'
    : /(?:^|\/)(?:industries|industry)(?:\.html|\/|$)/.test(path) ? 'industries'
    : /(?:^|\/)(?:roles|occupations|job-titles|titles)(?:\.html|\/|$)/.test(path) ? 'occupations'
    : /(?:^|\/)(?:countries|countries-we-serve|cities|locations|geography)(?:\.html|\/|$)/.test(path) ? 'geography'
    : /(?:^|\/)(?:professional-directory|audiences|professionals)(?:\.html|\/|$)/.test(path) ? 'audiences'
    : /(?:^|\/)(?:skills|qualifications|capabilities)(?:\.html|\/|$)/.test(path) ? 'capabilities'
    : /(?:^|\/)(?:assessments|assessment|career-assessment|career-assessments)(?:\.html|\/|$)/.test(path) ? 'assessments'
    : /(?:^|\/)(?:audiences|professionals|seniority|executives|leaders)(?:\.html|\/|$)/.test(path) ? 'audiences'
    : /(?:^|\/)(?:resume-cv-writing|executive-resume-strategy|linkedin-optimization-executives|linkedin-profile-optimization|career-documents|career-portfolio-development|personal-career-website|career-positioning-optimization|career-coaching|interview-coaching-executives|executive-negotiation-support)(?:\.html|\/|$)/.test(path) ? 'professional-documents'
    : /(?:^|\/)services\//.test(path) ? 'service-detail'
    : /(?:^|\/)(?:candidate-services|how-it-works|career-strategy|pricing)(?:\.html|\/|$)/.test(path) ? 'individual-services'
    : /(?:^|\/)(?:resources|research|blog|articles|career-resources|research_hub)(?:\.html|\/|$)/.test(path) ? 'resources'
    : /(?:^|\/)services\.html$/.test(path) ? 'representation'
    : 'information';
  document.body.dataset.kovPageFamily = pageFamily;
  document.body.classList.add(`kov-family-${pageFamily}`);

  // Reveal content as it enters view, with a no-observer and reduced-motion fallback.
  if (main && !reducedMotion && 'IntersectionObserver' in window) {
    const candidates = [...main.querySelectorAll('section, main > article, .kov-expansion-card, .pathway-card, .directory-card')];
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('kov-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    candidates.forEach((item, index) => {
      if (index > 0) { item.classList.add('kov-reveal'); observer.observe(item); }
    });
  }

  // Reading progress and a keyboard-accessible return-to-top control.
  const progress = document.createElement('div');
  progress.className = 'kov-reading-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Page reading progress');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  const fill = document.createElement('span');
  progress.append(fill);
  document.body.append(progress);
  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'kov-back-top';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.title = 'Back to top';
  topButton.textContent = '↑';
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  document.body.append(topButton);
  let scheduled = false;
  const updateScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const amount = range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0;
      fill.style.transform = `scaleX(${amount / 100})`;
      progress.setAttribute('aria-valuenow', String(Math.round(amount)));
      topButton.classList.toggle('is-on', window.scrollY > Math.max(500, window.innerHeight * .7));
      scheduled = false;
    });
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function mountVisualModule() {
  const isHome = /^\/(?:index\.html)?$/.test(path);
  const isCountryPage = /countries-we-serve(?:\.html)?$/.test(path);
  const serviceIllustrations = {
    'executive-career-representation.html': ['kov-executive-intelligence-network.svg', 'representation', 'Executive career representation', 'A focused search is built around an agreed brief, target criteria and client-approved outreach.'],
    'reverse-recruiting.html': ['kov-service-overview.svg', 'overview', 'A research-led search, shaped around your direction', 'Explore how target research, positioning and outreach fit together within an agreed engagement.'],
    'executive-resume-strategy.html': ['kov-service-positioning.svg', 'positioning', 'Translate your experience into a clear market position', 'A strong profile starts with the work, scale and outcomes you want decision makers to understand.'],
    'linkedin-optimization-executives.html': ['kov-service-positioning.svg', 'positioning', 'Make your professional story easier to understand', 'Align your profile with the leadership roles and opportunities you want to pursue.'],
    'executive-job-search-support.html': ['kov-global-talent-map.svg', 'map', 'Research the market with a defined scope', 'Potential targets are researched against the agreed brief; the map is illustrative and does not indicate KOV offices.'],
    'executive-negotiation-support.html': ['kov-service-applications.svg', 'applications', 'Prepare each decision point with care', 'Organize the information, priorities and next steps that support a considered career decision.'],
    'interview-coaching-executives.html': ['kov-career-pathway.svg', 'pathway', 'Build a clear, credible interview narrative', 'Practice connecting your experience to the needs of the role and the organization.'],
  };
  const serviceEntry = Object.entries(serviceIllustrations).find(([file]) => path.endsWith(file));
  const isServicePath = /(?:^|\/)(?:services|candidate-services|how-it-works)(?:\.html|\/|$)/.test(path);
  const isDirectoryHub = /^\/(?:roles|industries|professional-directory)(?:\.html|\/index\.html|\/)?$/.test(path);
  if (!main || (!isHome && !isServicePath && !isDirectoryHub && !isCountryPage && !serviceEntry) || main.querySelector('.kov-visual-module')) return;

  const visualType = isCountryPage ? 'map' : serviceEntry ? serviceEntry[1] : isServicePath ? 'pathway' : 'network';
  const section = document.createElement('section');
  section.className = `kov-visual-module kov-${visualType}-module`;
  section.dataset.kovVisual = visualType;
  const copy = document.createElement('div');
  copy.className = 'kov-visual-copy';
  const label = document.createElement('p');
  label.className = 'kov-search-overline';
  label.textContent = serviceEntry ? 'KOV CAREER SERVICES' : isCountryPage ? 'COUNTRY DIRECTORY' : visualType === 'pathway' ? 'PRIVATE CAREER REPRESENTATION' : 'KOV PROFESSIONAL LIBRARY';
  const heading = document.createElement('h2');
  heading.textContent = serviceEntry ? serviceEntry[2] : isCountryPage ? 'Explore the directory by region.' : visualType === 'pathway'
    ? 'A considered process, agreed before work begins.'
    : 'Professional decisions connect across roles, industries and places.';
  const description = document.createElement('p');
  description.textContent = serviceEntry ? serviceEntry[3] : isCountryPage ? 'Choose a region to filter the country records below. The schematic map is an editorial guide, not a representation of offices.' : visualType === 'pathway'
    ? 'Start with fit and direction, then clarify positioning, research suitable targets and coordinate approved outreach.'
    : 'Explore the KOV library by role, industry, city or country, and move directly into the relevant directory.';
  copy.append(label, heading, description);
  const art = document.createElement('div');
  art.className = 'kov-visual-art';
  art.setAttribute('aria-busy', 'true');
  section.append(copy, art);
  const hero = main.querySelector('.kov-reference-home__hero') || main.querySelector(':scope > section:first-child');
  if (hero) hero.after(section);
  else main.prepend(section);

  // Make the discovery network the homepage's live product demonstration, beside
  // the existing search, instead of treating it as an illustration farther down.
  if (isHome && hero) {
    const experience = document.createElement('div');
    experience.className = 'kov-home-experience';
    experience.setAttribute('aria-label', 'KOV professional discovery');
    hero.before(experience);
    experience.append(hero, section);
  }

  const graphicFile = serviceEntry ? serviceEntry[0] : isCountryPage ? 'kov-global-talent-map.svg' : isServicePath ? 'kov-career-pathway.svg' : 'kov-discovery-network.svg';
  fetch(new URL(`${graphicFile}?v=2`, assetBase), { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) throw new Error(`SVG request failed: ${response.status}`);
      return response.text();
    })
    .then(markup => {
      const documentSvg = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const svg = documentSvg.documentElement;
      if (svg.localName !== 'svg' || documentSvg.querySelector('parsererror')) throw new Error('Invalid KOV SVG graphic.');
      svg.classList.add('is-observed');
      art.replaceChildren(document.importNode(svg, true));
      art.setAttribute('aria-busy', 'false');
      const insertedSvg = art.querySelector('svg');
      if (isCountryPage || serviceEntry?.[1] === 'map') {
        insertedSvg.classList.add('kov-talent-map');
        if (isCountryPage) { insertedSvg.setAttribute('role', 'group'); insertedSvg.setAttribute('aria-label', 'Schematic regional country directory filters'); }
        const colors = { '#090e13':'#f5f8f6', '#26313a':'#dce6e4', '#d8d3c7':'#7f9698', '#87939b':'#a9b9b8', '#b9874c':'#d18455', '#d4b079':'#e87942', '#f5f1e8':'#17313b', '#c3cbd0':'#526970' };
        insertedSvg.querySelectorAll('[fill],[stroke]').forEach(el => ['fill','stroke'].forEach(attr => { const color=el.getAttribute(attr); if(colors[color]) el.setAttribute(attr,colors[color]); }));
        const regions = ['North America','South America','Europe','Africa','Middle East','Asia-Pacific','Oceania'];
        const markers = [...insertedSvg.querySelectorAll('circle')].slice(0,7);
        markers.forEach((marker,index) => { marker.dataset.geoRegion=regions[index]; marker.setAttribute('tabindex','0'); marker.setAttribute('role','button'); marker.setAttribute('aria-label',`Show ${regions[index]} countries`); marker.classList.add('kov-map-marker'); });
        if (isCountryPage) {
          const controls=document.createElement('div'); controls.className='kov-map-controls'; controls.setAttribute('role','group'); controls.setAttribute('aria-label','Filter country directory by region');
          const status=document.createElement('p'); status.className='kov-map-status'; status.setAttribute('aria-live','polite'); status.textContent='Showing all countries.';
          const reset=document.createElement('button'); reset.type='button'; reset.className='kov-map-reset'; reset.textContent='Show all countries'; controls.append(reset); art.before(controls); art.after(status);
          const applyRegion=region=>{ let shown=0; document.querySelectorAll('#country-directory .country-directory-card').forEach(card=>{ const value=card.querySelector('.country-directory-meta')?.textContent.trim().toLowerCase()||''; const match=!region || (region==='Asia-Pacific' ? value==='asia'||value==='europe/asia' : region==='Europe' ? value==='europe'||value==='europe/asia' : value===region.toLowerCase()); card.hidden=!match; if(match) shown++; }); status.textContent=region?`${shown} countries shown for ${region}.`:'Showing all countries.'; insertedSvg.dataset.activeRegion=region||''; };
          reset.addEventListener('click',()=>applyRegion(''));
          markers.forEach(marker=>{ const activate=()=>applyRegion(marker.dataset.geoRegion); marker.addEventListener('click',activate); marker.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}}); });
        }
      }
      const prepareScrollDrawing = () => {
        const flowPaths = [...insertedSvg.querySelectorAll('.kov-network-flow [data-flow]')];
        const pathway = insertedSvg.querySelector('.kov-path-progress');
        const measuredPaths = [...flowPaths, ...(pathway ? [pathway] : [])];
        measuredPaths.forEach((pathElement) => {
          try {
            const length = pathElement.getTotalLength();
            pathElement.style.setProperty('--kov-path-length', `${length}`);
            pathElement.style.setProperty('--kov-path-offset', `${length}`);
          } catch { /* Keep the authored SVG intact if a browser cannot measure a path. */ }
        });

        const steps = [...insertedSvg.querySelectorAll('[data-step]')];
        const clamp = (value) => Math.min(1, Math.max(0, value));
        let scheduledFrame = 0;
        let lastProgress = -1;
        const updateDrawing = () => {
          scheduledFrame = 0;
          if (document.hidden) return;
          const bounds = section.getBoundingClientRect();
          const viewport = window.innerHeight || document.documentElement.clientHeight;
          const progress = reducedMotion ? 1 : clamp((viewport * .9 - bounds.top) / (viewport * .7 + bounds.height));
          if (Math.abs(progress - lastProgress) < .003) return;
          lastProgress = progress;
          insertedSvg.style.setProperty('--kov-scroll-progress', progress.toFixed(3));
          insertedSvg.style.setProperty('--kov-center-scale', (1 + progress * .035).toFixed(3));
          if (progress > .015) insertedSvg.classList.add('is-visible');

          flowPaths.forEach((pathElement, index) => {
            const length = Number.parseFloat(pathElement.style.getPropertyValue('--kov-path-length'));
            if (!Number.isFinite(length) || !length) return;
            const branchProgress = clamp((progress - index * .035) / .78);
            pathElement.style.setProperty('--kov-path-offset', `${length * (1 - branchProgress)}`);
            pathElement.style.setProperty('--kov-path-opacity', `${.12 + branchProgress * .78}`);
          });
          if (pathway) {
            const length = Number.parseFloat(pathway.style.getPropertyValue('--kov-path-length'));
            if (Number.isFinite(length) && length) pathway.style.setProperty('--kov-path-offset', `${length * (1 - progress)}`);
          }
          steps.forEach((step, index) => {
            const threshold = (index + 1) / (steps.length + 1);
            step.dataset.scrollState = progress >= threshold + .09 ? 'complete' : progress >= threshold - .13 ? 'active' : 'pending';
          });
        };
        const queueDrawing = () => {
          if (!scheduledFrame) scheduledFrame = window.requestAnimationFrame(updateDrawing);
        };
        if (reducedMotion || !('IntersectionObserver' in window)) {
          updateDrawing();
        } else {
          const observer = new IntersectionObserver((entries, instance) => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            queueDrawing();
            instance.disconnect();
          }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
          observer.observe(section);
          queueDrawing();
        }
        if (!reducedMotion) {
          window.addEventListener('scroll', queueDrawing, { passive: true });
          window.addEventListener('resize', queueDrawing, { passive: true });
        }
      };
      prepareScrollDrawing();
      if (visualType === 'network') {
        const nodes = [...insertedSvg.querySelectorAll('[data-node]')];
        nodes.forEach((node, index) => {
          const setNode = () => { insertedSvg.dataset.focusNode = node.dataset.node; };
          const clearNode = () => { delete insertedSvg.dataset.focusNode; };
          node.addEventListener('pointerenter', setNode);
          node.addEventListener('pointerleave', clearNode);
          node.addEventListener('focus', setNode);
          node.addEventListener('blur', clearNode);
          node.addEventListener('keydown', (event) => {
            if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
            nodes[(index + direction + nodes.length) % nodes.length]?.focus();
          });
        });
      } else {
        const steps = [...insertedSvg.querySelectorAll('[data-step]')];
        steps.forEach((step, index) => {
          const setStep = () => { insertedSvg.dataset.activeStep = step.dataset.step; };
          const clearStep = () => { delete insertedSvg.dataset.activeStep; };
          step.addEventListener('pointerenter', setStep);
          step.addEventListener('pointerleave', clearStep);
          step.addEventListener('focus', setStep);
          step.addEventListener('blur', clearStep);
          step.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
          step.addEventListener('keydown', (event) => {
            if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1
              : (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + steps.length) % steps.length;
            steps[nextIndex]?.focus();
          });
        });
      }
    })
    .catch(error => {
      console.error('KOV visual could not be loaded:', error);
      section.remove();
    });
  }
  if (/^\/(?:index\.html)?$/.test(location.pathname) && document.readyState !== 'complete') {
    window.addEventListener('load', mountVisualModule, { once: true });
  } else {
    mountVisualModule();
  }
})();
