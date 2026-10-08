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
    },
    company: {
      title: 'Questions about executive talent sourcing',
      categories: {
        Search: [
          ['What is passive talent sourcing?', 'It is research-led identification and outreach to relevant professionals who may not be actively applying. Passive talent is a different pool, not automatically a better one.'],
          ['What types of executives can KOV source?', 'Role level and function are defined by the brief and agreed scope, including senior leadership roles.'],
          ['Which geographies does KOV cover?', 'Coverage is agreed for each search and may include multiple international markets.'],
          ['Can KOV support international searches?', 'Yes, when geography, research depth, and outreach requirements are included in the engagement scope.']
        ],
        Research: [
          ['How does KOV identify passive executives?', 'KOV maps relevant organizations and leadership contexts, then researches professional backgrounds against the agreed success profile.'],
          ['How are candidates prioritized?', 'Profiles are compared against role-related criteria agreed with the client, with rationale recorded for review.'],
          ['What information is researched?', 'Research may include relevant professional history, organizational context, role scope, and appropriate public market signals.']
        ],
        Outreach: [
          ['How does KOV approach passive candidates?', 'Outreach is personalized to the professional context and follows the message, approval, and disclosure boundaries agreed for the search.'],
          ['How is confidentiality handled?', 'Contact boundaries and information-sharing preferences are agreed before outreach. KOV does not make unsupported legal or security guarantees.']
        ],
        Deliverables: [
          ['What does a company receive?', 'Depending on scope, outputs may include a search brief, market and company maps, talent research, prioritization rationale, progress updates, and structured reporting.'],
          ['How is search progress communicated?', 'Reporting format and cadence are agreed before work begins and reflect the search scope and activity.'],
          ['Can KOV support one executive search?', 'A focused single-role search may be scoped where the brief and requirements fit KOV’s service.']
        ],
        Engagement: [
          ['How are fees determined?', 'Fees are discussed according to role level, research scope, geography, timeline, and required outputs before work starts.'],
          ['How long does a search take?', 'Timing varies with role requirements, markets, research scope, and client decisions. A timeline is discussed after the brief is understood.'],
          ['Can KOV work alongside an existing search firm?', 'Research support may be possible when responsibilities, information boundaries, and handoffs are agreed.']
        ],
        Outcomes: [
          ['Does KOV guarantee a hire?', 'No. Hiring decisions, candidate decisions, and timelines are outside KOV’s control.'],
          ['What happens if the search does not produce the required result?', 'KOV reviews progress against the agreed scope and discusses appropriate next steps. A specific hiring outcome is not guaranteed.']
        ]
      }
    }
  };

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  document.querySelectorAll('[data-service-faq]').forEach((section) => {
    const side = section.dataset.serviceFaq;
    const content = faqContent[side];
    if (!content) return;
    const categories = Object.keys(content.categories);
    section.innerHTML = `
      <div class="kov-service-faq-heading"><p class="kov-eyebrow">${side === 'candidate' ? 'FOR PROFESSIONALS' : 'FOR COMPANIES'}</p><h2>Frequently Asked Questions</h2><p>${escapeHTML(content.title)}</p></div>
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
