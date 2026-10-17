(() => {
  const objective = document.getElementById('service-fit-objective');
  const submit = document.getElementById('service-fit-submit');
  const result = document.getElementById('service-fit-result');
  if (!(objective instanceof HTMLSelectElement) ||
      !(submit instanceof HTMLButtonElement) ||
      !(result instanceof HTMLParagraphElement)) return;

  const recommendations = {
    resume: {
      title: 'Resume and CV Writing & Optimization',
      href: 'resume-cv-writing.html',
      summary: 'Clarify the structure, evidence, and role relevance of your career document.',
    },
    linkedin: {
      title: 'LinkedIn Profile Optimization',
      href: 'linkedin-profile-optimization.html',
      summary: 'Align your headline, profile sections, and professional direction.',
    },
    document: {
      title: 'Career Documents',
      href: 'career-documents.html',
      summary: 'Prepare supporting documents for a specific career situation.',
    },
    portfolio: {
      title: 'Career Portfolio Development',
      href: 'career-portfolio-development.html',
      summary: 'Present selected work, projects, and evidence in a coherent portfolio.',
    },
    website: {
      title: 'Personal Career Website',
      href: 'personal-career-website.html',
      summary: 'Plan a professional online home for your experience and selected work.',
    },
    positioning: {
      title: 'Career Positioning & Optimization',
      href: 'career-positioning-optimization.html',
      summary: 'Clarify target roles and how your verified experience supports them.',
    },
    coaching: {
      title: 'Career Coaching',
      href: 'career-coaching.html',
      summary: 'Work through a career decision or prepare for a specific event.',
    },
    representation: {
      title: 'Private Career Representation',
      href: 'services.html',
      summary: 'Explore KOV’s separate managed service for suitable professionals.',
    },
    unsure: {
      title: 'Contact KOV to discuss your objective',
      href: 'contact.html?service=unsure',
      summary: 'Describe the situation and discuss a suitable starting point.',
    },
  };
  const tool = objective.closest('.service-fit-tool');
  const route = tool?.querySelector('.kov-service-fit-route');
  const serviceCards = [...document.querySelectorAll('.kov-service-card')];

  const updateSelection = () => {
    const recommendation = recommendations[objective.value];
    if (route) route.dataset.activeService = recommendation ? objective.value : '';

    serviceCards.forEach((card) => {
      const link = card.querySelector('h3 a');
      const active = Boolean(recommendation && link?.getAttribute('href') === recommendation.href);
      card.classList.toggle('is-recommended', active);
      if (active) card.setAttribute('data-recommended', 'true');
      else card.removeAttribute('data-recommended');
    });
  };

  objective.addEventListener('change', updateSelection);

  submit.addEventListener('click', () => {
    result.replaceChildren();
    const recommendation = recommendations[objective.value];
    if (!recommendation) {
      result.textContent = 'Choose the outcome that is closest to what you need, or select “I am not sure yet.”';
      result.hidden = false;
      objective.focus();
      return;
    }

    updateSelection();
    const kicker = document.createElement('span');
    kicker.className = 'kov-service-fit-kicker';
    kicker.textContent = 'A useful starting point';
    const summary = document.createElement('span');
    summary.className = 'kov-service-fit-summary';
    summary.textContent = recommendation.summary;
    const link = document.createElement('a');
    link.href = recommendation.href;
    link.textContent = `Explore ${recommendation.title}`;
    result.append(kicker, summary, link);
    result.hidden = false;
  });

  updateSelection();
})();
