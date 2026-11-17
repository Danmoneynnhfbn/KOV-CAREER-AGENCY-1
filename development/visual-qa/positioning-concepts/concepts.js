(() => {
  const descriptions = {
    '01': 'We discuss your objectives, priorities and circumstances, then decide whether the service is a fit before any work begins.',
    '02': 'We define relevant roles, organizations and markets, then research decision-makers and appropriate contact routes.',
    '03': 'We clarify a professional narrative from your verified experience and align it with your agreed direction.',
    '04': 'We prepare professional outreach and follow up within the scope and approval approach agreed with you.',
    '05': 'We review responses together and agree appropriate next steps. Employers make all hiring decisions.'
  };
  document.querySelectorAll('[data-pathway]').forEach(pathway => {
    const buttons = [...pathway.querySelectorAll('[data-step]')];
    const nodes = [...pathway.querySelectorAll('[data-svg-step]')];
    const description = pathway.querySelector('[data-step-description]');
    const progress = pathway.querySelector('[data-progress]');
    let revealed = false;
    const select = id => {
      pathway.dataset.activeStep = id;
      buttons.forEach(button => {
        const active = button.dataset.step === id;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      nodes.forEach(node => node.classList.toggle('is-active', node.dataset.svgStep === id));
      if (description) description.textContent = descriptions[id];
      if (progress) {
        const index = Math.max(0, buttons.findIndex(button => button.dataset.step === id));
        const total = Math.max(buttons.length - 1, 1);
        const length = Number(progress.getTotalLength?.() || 0);
        progress.style.strokeDasharray = `${revealed ? length * (index / total) : 0} ${length}`;
        progress.style.strokeDashoffset = '0';
      }
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button.dataset.step));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next].focus();
        select(buttons[next].dataset.step);
      });
    });
    select(pathway.dataset.activeStep || '01');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealed = true;
          pathway.classList.add('is-visible');
          select(pathway.dataset.activeStep || '01');
          observer.unobserve(pathway);
        }
      }), { threshold: .16 });
      observer.observe(pathway);
    } else {
      revealed = true;
      pathway.classList.add('is-visible');
      select(pathway.dataset.activeStep || '01');
    }
  });

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#primary-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.querySelector('.visually-hidden').textContent = open ? 'Close navigation' : 'Open navigation';
      menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', event => {
      if (event.target.closest('a') && matchMedia('(max-width: 900px)').matches) {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.querySelector('.visually-hidden').textContent = 'Open navigation';
        menu.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.querySelector('.visually-hidden').textContent = 'Open navigation';
        menu.classList.remove('is-open');
        menuButton.focus();
      }
    });
  }
})();
