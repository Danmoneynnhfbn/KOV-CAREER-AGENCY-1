function MetricIcon({ type }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22zM4 5.5v14A2.5 2.5 0 0 1 6.5 17H20" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="kov-reference-home__metric-icon" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

const featuredLinks = [
  {
    title: "Career Guides",
    description: "Expert advice for every career stage.",
    href: "/career-resources/index.html",
    avif: "/assets/people/leadership-meeting.avif",
    webp: "/assets/people/leadership-meeting.webp",
  },
  {
    title: "International Markets",
    description: "Explore country and market references for career research.",
    href: "/countries-we-serve.html",
    webp: "/assets/kov-reference/international-markets.webp",
  },
  {
    title: "Research Hub",
    description: "In-depth insights & data.",
    href: "/research/index.html",
    avif: "/assets/people/leadership-team.avif",
    webp: "/assets/people/leadership-team.webp",
  },
  {
    title: "Candidate Project Directory",
    description: "Explore professional roles, industries, skills and career project examples across global markets.",
    href: "/resources/candidate-project-directory",
    avif: "/assets/people/executive-professional.avif",
    webp: "/assets/people/executive-professional.webp",
  },
  {
    title: "Professional Directory",
    description: "Review the purpose and privacy principles for a future directory.",
    href: "/professional-directory/index.html",
    avif: "/assets/people/executive-professional.avif",
    webp: "/assets/people/executive-professional.webp",
  },
  {
    title: "Private Career Representation",
    description: "Candidate-side research, positioning and considered outreach.",
    href: "/services.html",
    avif: "/assets/people/executive-woman.avif",
    webp: "/assets/people/executive-woman.webp",
  },
];

const agencyServices = [
  {
    number: "01",
    title: "Private Career Representation",
    description: "Candidate-side strategy, target-company research, decision-maker outreach and considered follow-up.",
    href: "/services.html",
  },
  {
    number: "02",
    title: "Individual Career Services",
    description: "Focused support for your CV, career documents, LinkedIn profile, portfolio, positioning and coaching.",
    href: "/candidate-services.html",
  },
  {
    number: "03",
    title: "Founder-Led Guidance",
    description: "Direct, confidential 1:1 support shaped around your experience, ambition and next career decision.",
    href: "/about.html",
  },
];

const homepageFaqs = [
  {
    question: "What does private career representation involve?",
    answer: "KOV supports professionals with target-company strategy, decision-maker research, professional outreach, follow-up and direct introductions where appropriate.",
  },
  {
    question: "Who does KOV work with?",
    answer: "KOV works with senior and experienced professionals across global markets, including leaders moving between industries, markets and roles.",
  },
  {
    question: "How do I start?",
    answer: "Start with a focused inquiry. KOV will discuss fit, scope and the services most relevant to your situation.",
  },
];

const methodSteps = [
  ["Assess fit", "Discuss goals, priorities, timing and the support you are considering."],
  ["Set direction", "Agree role and market criteria that reflect your experience."],
  ["Position", "Clarify the evidence and story you want decision-makers to understand."],
  ["Research", "Study agreed target organizations, roles and relevant contacts."],
  ["Approve outreach", "Review the approach before any professional contact is made."],
  ["Review next steps", "Discuss progress and agree appropriate actions together."],
];

const careerQuestions = [
  ["The search feels busy, but unfocused.", "Set a clear role and market direction before investing more time in applications."],
  ["Relevant conversations are hard to reach.", "Plan thoughtful, approved outreach around the organizations and people that fit your goals."],
  ["Your experience is not coming through clearly.", "Align your CV, LinkedIn profile and career story with the next move you want to make."],
];

export function KovHomepageShowcase() {
  return <div className="kov-reference-home">
    <section className="kov-reference-home__hero" aria-labelledby="kov-reference-home-title">
      <div className="kov-reference-home__hero-copy">
        <p className="kov-reference-home__eyebrow">KOV / PRIVATE CAREER REPRESENTATION</p>
        <h1 id="kov-reference-home-title">Your next move,<br /><span>on your side.</span></h1>
        <p>KOV represents senior and experienced professionals through a focused, research-led career search. Work may include target-company strategy, decision-maker research, professional positioning, and approved outreach and follow-up. Fit, scope and fees are agreed before work begins.</p>
        <div className="kov-reference-home__hero-actions">
          <a className="kov-reference-home__primary-button" href="/services.html">Explore Private Career Representation <span aria-hidden="true">→</span></a>
          <a className="kov-reference-home__secondary-button" href="/candidate-services.html">Individual Career Services</a>
        </div>
        <div className="kov-home-founder-proof">
          <img src="/assets/people/founder.webp" alt="" width="48" height="48" loading="lazy" aria-hidden="true" />
          <span><strong>Daniel Ade</strong><small>Founder &amp; Principal Agent · Direct, one-to-one work</small></span>
        </div>
      </div>
        <picture className="kov-reference-home__founder">
          <source srcSet="/assets/people/founder.avif" type="image/avif" />
          <source srcSet="/assets/people/founder.webp" type="image/webp" />
          <img src="/founder.jpeg" alt="KOV founder" fetchPriority="high" />
        </picture>
        <p className="kov-reference-home__hero-note"><span>Daniel Ade</span><small>Founder &amp; Principal Agent</small><span aria-hidden="true" /></p>
    </section>

    <section className="kov-reference-home__metrics" aria-label="How KOV works">
      <div className="kov-reference-home__metric"><MetricIcon type="globe" /><p><strong>Candidate-side</strong><span>KOV works for the professional.</span></p></div>
      <div className="kov-reference-home__metric"><MetricIcon type="people" /><p><strong>Founder-led</strong><span>Direct work with Daniel.</span></p></div>
      <div className="kov-reference-home__metric"><MetricIcon type="book" /><p><strong>Research-led</strong><span>Research before outreach.</span></p></div>
      <div className="kov-reference-home__metric"><MetricIcon type="star" /><p><strong>Scope agreed</strong><span>Fit and terms come first.</span></p></div>
    </section>

    <section className="kov-reference-home__service-pathways" aria-labelledby="kov-reference-home-pathways-title">
      <div className="kov-reference-home__service-intro">
        <span>Career support, with a clear scope</span>
        <h2 id="kov-reference-home-pathways-title">Choose the support that fits your next move.</h2>
        <p>Start with the kind of help you need. KOV will discuss fit, scope and terms before any work begins.</p>
      </div>
      <div className="kov-reference-home__service-options">
        <article className="kov-reference-home__service-option kov-reference-home__service-option--primary">
          <span className="kov-reference-home__service-number">01 / REPRESENTATION</span>
          <h3>Private Career Representation</h3>
          <p>Founder-led research, positioning and agreed outreach for experienced professionals exploring a career move.</p>
          <a href="/services.html">Explore representation <span aria-hidden="true">→</span></a>
        </article>
        <article className="kov-reference-home__service-option">
          <span className="kov-reference-home__service-number">02 / INDIVIDUAL SERVICES</span>
          <h3>Focused support for your career materials</h3>
          <p>Discuss CV, LinkedIn, portfolio, positioning or coaching support as a separate service.</p>
          <a href="/candidate-services.html">Explore individual services <span aria-hidden="true">→</span></a>
        </article>
      </div>
    </section>

    <section className="kov-reference-home__discover" aria-labelledby="kov-reference-home-discover-title">
      <div className="kov-reference-home__section-heading">
        <h2 id="kov-reference-home-discover-title">Explore What’s Next</h2>
        <p>Career research, market context and practical resources to help you consider a well-informed next step.</p>
      </div>
      <div className="kov-reference-home__cards">
        {featuredLinks.map((item) => <a className="kov-reference-home__card" href={item.href} key={item.title}>
          <picture>
            {item.avif && <source srcSet={item.avif} type="image/avif" />}
            <img src={item.webp} alt="" loading="lazy" />
          </picture>
          <span className="kov-reference-home__card-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
          <span className="kov-reference-home__card-arrow" aria-hidden="true">→</span>
        </a>)}
      </div>
    </section>

    <section className="kov-reference-home__promos" aria-label="Explore global markets and research">
      <article className="kov-reference-home__map-card">
        <picture aria-hidden="true">
          <source media="(prefers-color-scheme: dark)" srcSet="/assets/kov-reference/global-map-dark.webp" type="image/webp" />
          <img src="/assets/kov-reference/global-map-light.webp" alt="" loading="lazy" />
        </picture>
        <div>
          <h2>Markets, researched with context.</h2>
          <p>Country and city references support research planning. Availability and scope are confirmed for each engagement.</p>
          <a href="/countries-we-serve.html">Explore International <span aria-hidden="true">→</span></a>
        </div>
      </article>
      <article className="kov-reference-home__research-card">
        <picture aria-hidden="true">
          <source media="(prefers-color-scheme: dark)" srcSet="/assets/kov-reference/research-panel-dark.webp" type="image/webp" />
          <img src="/assets/kov-reference/research-panel-light.webp" alt="" loading="lazy" />
        </picture>
        <div className="kov-reference-home__research-copy">
          <span className="kov-reference-home__research-mark" aria-hidden="true">▮▮▮</span>
          <div>
            <h2>KOV Research Hub</h2>
            <p>Access the latest research, market insights<br className="kov-reference-home__desktop-break" /> and industry analysis.</p>
            <a href="/research/index.html">Explore Research <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </article>
    </section>

    <section className="kov-reference-home__advantage" aria-labelledby="kov-reference-home-advantage-title">
      <div className="kov-reference-home__section-heading kov-reference-home__section-heading--left">
        <span>The Agency Advantage</span>
        <h2 id="kov-reference-home-advantage-title">One focused partner for your next move.</h2>
        <p>KOV supports professionals through private career representation and individual career services. Work begins with an assessment, with scope and fit discussed before any engagement.</p>
      </div>
      <div className="kov-reference-home__advantage-grid">
        {agencyServices.map((service) => <article key={service.title}>
          <span>{service.number}</span>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <a href={service.href}>Explore service <span aria-hidden="true">→</span></a>
        </article>)}
      </div>
    </section>

    <section className="kov-reference-home__founder-story" aria-labelledby="kov-reference-home-founder-title">
      <picture>
        <source srcSet="/assets/people/founder.avif" type="image/avif" />
        <source srcSet="/assets/people/founder.webp" type="image/webp" />
        <img src="/founder.jpeg" alt="Daniel Ade, founder and principal agent of KOV Career Agency" loading="lazy" />
      </picture>
      <div>
        <span>Founder-led, candidate-side</span>
        <h2 id="kov-reference-home-founder-title">Private career representation for professionals considering their next step.</h2>
        <p>KOV works for the candidate, never for corporate HR. Work is candidate-side, research-led and shaped around the professional's goals, experience and target market.</p>
        <a href="/about.html">Meet Daniel and KOV <span aria-hidden="true">→</span></a>
      </div>
    </section>

    <section className="kov-reference-home__method" aria-labelledby="kov-reference-home-method-title">
      <div className="kov-reference-home__section-heading kov-reference-home__section-heading--left">
        <span>The KOV Method</span>
        <h2 id="kov-reference-home-method-title">Six steps. One focused process.</h2>
        <p>A structured search brings research, positioning and follow-up into one considered process. Daniel personally runs the engagement — no junior hand-off, no offshore desk.</p>
      </div>
      <ol className="kov-reference-home__method-list">
        {methodSteps.map(([title, description], index) => <li key={title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{title}</h3><p>{description}</p></div>
        </li>)}
      </ol>
    </section>

    <section className="kov-reference-home__search-intelligence" aria-labelledby="kov-reference-home-intelligence-title">
      <div>
        <span>Why KOV</span>
        <h2 id="kov-reference-home-intelligence-title">The work happens behind the scenes.</h2>
        <p>A strong search is rarely just a matter of finding another job post. It requires research, targeting, positioning, human outreach, follow-up, and a process that keeps moving.</p>
      </div>
      <article>
        <h3>Search intelligence</h3>
        <p>Research comes first. KOV studies the target market, relevant roles and companies, decision-makers, positioning and context before considering appropriate outreach.</p>
      </article>
      <article>
        <h3>Approved outreach</h3>
        <p>Before any outreach takes place, the approach and scope are discussed. KOV coordinates agreed contact and follow-up; employers make hiring decisions.</p>
      </article>
    </section>

    <section className="kov-reference-home__career-questions" aria-labelledby="kov-reference-home-questions-title">
      <div className="kov-reference-home__career-questions-heading">
        <span>For the moments that need a plan</span>
        <h2 id="kov-reference-home-questions-title">A more considered way through the search.</h2>
      </div>
      <div className="kov-reference-home__career-question-list">
        {careerQuestions.map(([question, answer], index) => <article key={question}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{question}</h3><p>{answer}</p></div>
        </article>)}
      </div>
    </section>

    <section className="kov-reference-home__fees" aria-labelledby="kov-reference-home-fees-title">
      <div>
        <span>Clear terms, agreed in advance</span>
        <h2 id="kov-reference-home-fees-title">Open fees. No surprises.</h2>
      </div>
      <p>Fees for Private Career Representation and Individual Career Services depend on the scope agreed with you. Terms are confirmed in writing before work begins.</p>
      <a href="/pricing.html">Review engagement options <span aria-hidden="true">→</span></a>
    </section>

    <section className="kov-reference-home__faq" aria-labelledby="kov-reference-home-faq-title">
      <div className="kov-reference-home__section-heading kov-reference-home__section-heading--left">
        <span>Common questions</span>
        <h2 id="kov-reference-home-faq-title">A clear starting point.</h2>
      </div>
      <div className="kov-reference-home__faq-list">
        {homepageFaqs.map((item) => <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>)}
      </div>
    </section>
  </div>;
}

export function mountKovHomepageShowcase() {
  const isHomepage = window.location.pathname === "/" || window.location.pathname === "/index.html";
  if (!isHomepage) return false;

  const main = document.querySelector("body:not(.backend-page) main");
  if (!main || main.querySelector("#kov-reference-home-root")) return false;
  const rootElement = document.createElement("section");
  rootElement.id = "kov-reference-home-root";
  main.insertBefore(rootElement, main.firstChild);
  window.ReactDOM.createRoot(rootElement).render(<KovHomepageShowcase />);

  // The statically rendered homepage remains untouched for SEO and preservation checks.
  // At runtime, replace its legacy layout once with the single unified React homepage.
  while (rootElement.nextSibling) rootElement.nextSibling.remove();
  document.querySelectorAll('body > section.faq-compact-shell').forEach((section) => section.remove());
  window.setTimeout(() => {
    document.querySelectorAll('body > section.faq-compact-shell').forEach((section) => section.remove());
  }, 0);
  return true;
}
