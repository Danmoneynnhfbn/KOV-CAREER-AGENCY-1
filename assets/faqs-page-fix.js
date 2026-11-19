(function () {
  "use strict";

  const answers = {
    "Who is KOV the right fit for?": "KOV works with experienced professionals, specialists and executives who want structured support with a career move or a specific career service. Fit depends on your goals, background, target market and the scope of support required. The first discussion is used to assess whether KOV is the right fit; representation is not automatic.",
    "Is this coaching or done-for-you?": "Private Career Representation is a managed, candidate-side service. Depending on the written scope, it can include career strategy, target-company research, professional positioning, agreed applications, recruiter or hiring-manager outreach and follow-up. You remain involved in key decisions and approve external activity as agreed. Individual Career Services, such as resume or LinkedIn work, are separate services. KOV does not simply provide advice and leave you to manage an agreed representation search alone.",
    "Do you work for the company or for me?": "KOV's Private Career Representation is designed to support the professional, not to act as the hiring company's recruitment department. The engagement is between KOV and the professional. Employers make their own hiring decisions, and KOV does not promise that an employer will respond or make an offer.",
    "How many clients do you take at once?": "KOV manages its active workload to preserve direct involvement and a considered service. Availability can change, so capacity and a realistic start date are discussed during the initial conversation before an engagement is accepted.",
    "How fast can we start?": "There is no automatic start date. Work begins after KOV has assessed fit, confirmed the requested scope and fee in writing, and completed the necessary onboarding. The actual start date depends on availability and the information or approvals needed from you.",
    "How long does a search typically take?": "A search can take several months, but timing varies with the seniority and specialism of the role, target market, location, employer process and market conditions. KOV does not guarantee an interview, offer or fixed placement timeline. Any working milestones are discussed as part of the agreed plan.",
    "How involved do I need to be?": "Your involvement is important. You provide accurate career information, clarify your priorities, review positioning and target direction, and give the approvals needed for applications or outreach. You also lead your own interviews and make the final career decisions. Check-ins and response expectations are agreed at the start.",
    "Will I see every job before you apply?": "KOV works within the target roles, employers and approval process agreed with you. Where an application or external message is to be made on your behalf, the role and relevant materials are shared for approval in line with the engagement. KOV does not apply indiscriminately to every advertised vacancy.",
    "How much does it cost?": "Fees depend on whether you are seeking Private Career Representation or a separate Individual Career Service, and on the work included. KOV discusses the scope and confirms the fee and terms in writing before work begins. There is no general employer subscription or placement-fee price being quoted as a candidate service.",
    "How are individual career-service fees structured?": "Individual Career Services are separate from Private Career Representation. The fee is based on the specific service, deliverables and complexity involved. KOV provides a tailored quotation and confirms the agreed scope, fee and revision terms in writing before starting.",
    "Are there long-term contracts?": "The engagement period, payment arrangements, review points and any pause or termination provisions are set out in the written agreement for that service. Please review those terms before accepting; KOV will explain them during the scope discussion.",
    "What's not included?": "Third-party charges, such as paid job-board access, premium platform subscriptions, specialist assessments, travel or other external services, are not automatically included. Any proposed additional cost is discussed with you first and should be approved before it is incurred.",
    "Is my search confidential?": "KOV treats discretion as an important part of the service. Information is handled according to the agreed engagement and applicable privacy notice. Your current employer is not to be contacted about your search without your express authorization. Tell KOV about any particular disclosure limits before work begins.",
    "What if my current company asks?": "KOV will not confirm or discuss your engagement with your current employer without your authorization, subject to applicable legal obligations. You decide what you disclose about your career plans. Any reference, contact or announcement involving your current workplace must be discussed and approved first.",
    "Do you guarantee a job?": "No. KOV does not guarantee interviews, introductions, offers, employment or a particular timeline. KOV can agree and carry out defined research, positioning, application, outreach and preparation activities, but employers control their responses and hiring decisions.",
    "What happens after I sign an offer?": "Once you accept an offer, KOV can help you review agreed next steps and close out the search. Any support with offer terms, transition planning or follow-up after acceptance depends on the scope in your written engagement; it is not an automatic or guaranteed extra service."
  };

  function initialiseFaqPage() {
    const section = document.querySelector("main > section:nth-of-type(2)");
    if (!section || section.dataset.kovFaqFixed === "true") return;

    const buttons = section.querySelectorAll("button[aria-expanded]");
    let enhanced = 0;

    buttons.forEach((button, index) => {
      const question = button.querySelector("span")?.textContent.trim();
      const answerText = answers[question];
      if (!answerText) return;

      const row = button.parentElement;
      if (!row || row.querySelector(".kov-faq-answer")) return;

      const answer = document.createElement("p");
      const answerId = "kov-faq-answer-" + (index + 1);
      answer.id = answerId;
      answer.className = "kov-faq-answer mt-5 max-w-3xl pr-12 text-[15px] leading-[1.8] text-ink-soft";
      answer.textContent = answerText;
      answer.hidden = true;

      button.setAttribute("aria-controls", answerId);
      button.setAttribute("aria-expanded", "false");

      const icon = button.querySelector('[aria-hidden="true"]');
      button.addEventListener("click", function () {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        answer.hidden = isOpen;
        if (icon) {
          icon.textContent = isOpen ? "+" : "−";
          icon.classList.toggle("bg-orange", !isOpen);
          icon.classList.toggle("text-primary-foreground", !isOpen);
          icon.classList.toggle("border-orange", !isOpen);
        }
      });

      row.appendChild(answer);
      enhanced += 1;
    });

    section.dataset.kovFaqFixed = "true";
    section.dataset.kovFaqEnhanced = String(enhanced);

    const contactLink = Array.from(document.querySelectorAll('main a[href="contact.html"]'))
      .find((link) => link.textContent.includes("Start the conversation"));
    if (contactLink) contactLink.textContent = "Start the conversation";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseFaqPage, { once: true });
  } else {
    initialiseFaqPage();
  }
})();