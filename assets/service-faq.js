(() => {
  const faqContent = {
    candidate: {
      title: 'Questions about private career representation',
      categories: {
        Search: [
          ['What is reverse recruiting?', 'KOV works on the professional’s side of an agreed search, helping structure and execute research, positioning, applications, and outreach.'],
          ['Who is KOV’s candidate-side service designed for?', 'It is designed for senior professionals seeking a deliberate, managed search. Fit and scope are discussed before an engagement begins.'],
          ['Do I choose the companies and roles?', 'Search priorities are agreed together. Approval points for target companies, roles, and external actions are defined by the engagement.'],
          ['How are target companies identified?', 'Research uses agreed role, geography, industry, and organization criteria. The rationale can be reviewed as the target map develops.'],
          ['Can KOV support an international search?', 'Yes, where the target geography and research requirements fit the agreed engagement scope.']
        ],
        Execution: [
          ['Does KOV apply for roles?', 'Application preparation or execution depends on the agreed engagement and approval process.'],
          ['Does KOV contact recruiters?', 'Personalized recruiter outreach may be included where relevant and agreed.'],
          ['Does KOV contact hiring managers?', 'Direct outreach may be considered where appropriate to the role, context, and agreed scope.'],
          ['How is follow-up managed?', 'Agreed activity, responses, follow-up timing, and next steps are organized in the search process.'],
          ['How do I see search activity?', 'KOV communicates activity and next steps using the reporting approach agreed for the engagement.']
        ],
        Positioning: [
          ['Does KOV rewrite my CV?', 'Resume positioning may be included. Content is based on information you verify; scope is agreed before work starts.'],
          ['Does KOV optimize LinkedIn?', 'LinkedIn positioning may be included and is aligned with your target market using approved, factual information.'],
          ['How is my professional positioning developed?', 'KOV works with you to connect your verified experience to the requirements and language of the agreed target roles.']
        ],
        Interviews: [
          ['Does KOV prepare me for interviews?', 'Preparation can include role and company research, likely discussion themes, positioning, practice, and feedback.'],
          ['What happens when an employer responds?', 'KOV coordinates the next agreed step with you. Employer processes and decisions remain outside KOV’s control.']
        ],
        Confidentiality: [
          ['Will my current employer know?', 'Contact preferences and approval boundaries are agreed in advance. KOV cannot control what third parties may learn or disclose.'],
          ['How is the search handled while I am employed?', 'The search can be planned around agreed communication preferences, timing, and approval checkpoints.']
        ],
        Outcomes: [
          ['Does KOV guarantee interviews?', 'No. Interview decisions are made by employers and cannot be guaranteed.'],
          ['Does KOV guarantee a job?', 'No. KOV manages agreed search work but cannot control hiring decisions or guarantee employment.'],
          ['Does KOV guarantee a salary increase?', 'No. Compensation and offer terms are determined by the employer and candidate; KOV can support evaluation and negotiation strategy where agreed.']
        ]
      }
    }
  };

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  document.querySelectorAll('[data-service-faq]').forEach((section) => {
    const content = faqContent.candidate;
    const categories = Object.keys(content.categories);
    section.innerHTML = `
      <div class="kov-service-faq-heading"><p class="kov-eyebrow">FOR PROFESSIONALS</p><h2>Frequently Asked Questions</h2><p>${escapeHTML(content.title)}</p></div>
      <div class="kov-faq-layout"><nav class="kov-faq-categories" aria-label="FAQ categories">${categories.map((category, index) => `<button type="button" class="kov-faq-category" data-faq-category="${escapeHTML(category)}" aria-pressed="${index === 0}">${escapeHTML(category)}</button>`).join('')}</nav><div class="kov-faq-questions" data-faq-questions aria-live="polite"></div></div>`;

    const questions = section.querySelector('[data-faq-questions]');
    const renderCategory = (category) => {
      questions.innerHTML = content.categories[category].map(([question, answer]) => `<details class="kov-faq-item"><summary>${escapeHTML(question)}</summary><p>${escapeHTML(answer)}</p></details>`).join('');
    };
    section.querySelector('.kov-faq-categories').addEventListener('click', (event) => {
      const button = event.target.closest('[data-faq-category]');
      if (!button) return;
      section.querySelectorAll('[data-faq-category]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderCategory(button.dataset.faqCategory);
    });
    renderCategory(categories[0]);
  });
})();
