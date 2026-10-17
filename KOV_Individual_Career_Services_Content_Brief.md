# KOV Career Agency: Individual Career Services
## Copilot Implementation Command and Approved Page Copy

**Purpose:** Step 2 of the KOV website transition: integrate Individual Career Services into the existing site and create the full service pages. This brief contains the exact approved copy to implement. It is not permission to redesign the entire website or repeat Step 1.

---

# PART A: COPILOT COMMAND PROMPT

Act as a senior front-end engineer, technical SEO specialist, accessibility reviewer, and careful website migration engineer. Work autonomously in the existing KOV Career Agency repository. Inspect the code, implement the changes, run the available checks, fix defects you introduce, and report what was actually completed. Do not stop after producing a plan.

## Objective

Implement Step 2: integrate the Individual Career Services offering into the existing KOV website and create complete, polished, individually useful pages for each of the seven approved services. Use the approved page copy in Part B of this brief as the source of truth. The primary candidate service hub is the existing `candidate-services.html` unless inspection of the actual repository establishes a better current canonical hub. Private Career Representation remains KOV's separate, primary managed service. It is not an eighth item in the seven-service catalogue.

## Source-of-truth rules

1. The current working repository is authoritative. Inspect the actual directory tree and the current files before editing. The two ZIPs previously supplied are reference snapshots only: one contains 81 HTML files and the other contains 10 CSS files. Do not blindly extract either ZIP over newer repository files, and do not assume that paths inside a ZIP match the current deployed directory structure.
2. Do not ask me to provide the website URL. Work from the repository already open in the workspace and its existing links, assets, CSS, JavaScript, forms, metadata, and project configuration.
3. This is Step 2, not Step 1. Do not repeat the company-side removal task or perform unrelated deletion. Assume the dedicated Global Talent Sourcing/company-recruitment removal is being handled separately. Build this candidate-facing service work so it fits cleanly after that change. If obsolete company-side links remain in candidate navigation, report them and change only the candidate-facing integration needed for this task; do not silently delete unrelated files.
4. Preserve user records, account functionality, private/admin areas, privacy/security controls, blog content, and unrelated pages. Do not delete or overwrite records or data. Do not change backend, authentication, billing, database, account, or form-submission architecture for this content task.
5. Use the current brand system, existing shared header/footer, CSS variables, typography, spacing, button styles, and responsive patterns. Extend existing CSS only when necessary. Do not introduce a new design system, large CSS framework, unnecessary dependencies, stock imagery, fake headshots, or decorative clutter. Reuse approved local assets where appropriate.
6. Never invent testimonials, reviews, client names, case studies, placements, interview counts, percentages, numerical outcome claims, guarantees, certifications, offices, partnerships, or performance statistics. On the candidate service hub and the seven service pages created or modified in this task, remove any existing testimonial/review sections, client quotes, outcome metrics, placement statistics, interview counts, percentages, or numerical guarantees. Do not delete unrelated pages, private records, or user data. Do not promise employment, interviews, search rankings, ATS passage, or platform visibility.
7. The service model is inquiry and quotation only. Do not add fixed prices, online checkout, subscriptions, payment links, instant booking, or an unapproved purchase flow. Use the existing working contact/inquiry destination and existing form behavior. Do not claim that a form stores data if the repository does not actually implement that.
8. Individual services can be suitable for professionals at different career levels, subject to fit. Do not position every service as executive-only just because some legacy URLs contain “executive” or “senior leader.” Preserve relevant existing SEO pages where they serve a distinct purpose.
9. Private Career Representation is a separate managed engagement for suitable clients. It may involve assessment, positioning, target-market and company research, relevant opportunity development, approved outreach, follow-up, interview preparation, and offer strategy, depending on the agreed scope. Do not mix this full managed-search offer into every standalone service or count it as one of the seven services.
10. Use the complete approved page copy below. You may make only small grammatical or accessibility edits that do not change the meaning, service scope, or promises. Do not replace it with generic placeholder copy or summarize it into short cards.
11. This brief is an implementation reference only. Do not publish Part A, the command prompt, the guardrails, or the research references as public website content. Only the approved page copy in Part B is intended for the website, and only the relevant page sections should be placed on each page.

## Seven approved Individual Career Services

1. Resume and CV Writing & Optimization
2. LinkedIn Profile Optimization
3. Career Documents
4. Career Portfolio Development
5. Personal Career Website
6. Career Positioning & Optimization
7. Career Coaching

## Implementation tasks

### A. Inspect and map the existing site
- Identify the current candidate service hub, relevant service pages, header/footer/navigation patterns, shared styles, inquiry form destination, existing redirects, canonical URL conventions, structured-data patterns, and sitemap/URL-generation mechanism if present.
- Relevant legacy files may include `candidate-services.html`, `executive-resume-strategy.html`, `linkedin-optimization-executives.html`, `career-strategy-senior-leaders.html`, and `interview-coaching-executives.html`. Inspect their actual current contents and real paths before deciding whether to reuse, update, link, or preserve them. Do not create duplicate pages if a suitable canonical page already exists. Do not break existing redirects or silently destroy role/market SEO pages.
- Some reference ZIP links use nested `services/`, `roles/`, `markets/`, or `resources/` paths while the ZIP itself lists files at its root. Resolve every path from the actual repository, not from assumptions.

### B. Implement the hub and service pages
- Update the candidate-facing hub with the approved hub copy in Part B. Clearly distinguish the seven standalone services from the separate Private Career Representation offer.
- Implement one complete, dedicated page for each of the seven approved services. Reuse existing primary service pages where doing so preserves a useful canonical URL; create new pages only for services that do not already have a suitable page. Where a legacy executive-focused page is kept, avoid duplicating the same content across competing URLs. If a redirect is needed, follow the repository's established redirect method and keep the destination relevant.
- Each page must include the supplied hero, clear explanation of who it helps, service scope/deliverables, practical process, boundaries/expectations, FAQs, and an inquiry/quotation CTA. Do not add public pricing.
- Use clear, accessible HTML semantics: one primary H1, logical H2/H3 hierarchy, real anchor links, descriptive link labels, meaningful alt text for informative images, visible focus states, keyboard-accessible navigation, labels for form controls, and adequate text/background contrast.
- Keep pages usable on mobile, including narrow widths. Prevent horizontal overflow, overlapping controls, clipped text, unreadable light-on-light text, and oversized or inconsistent spacing. Reuse existing responsive components and styles.

### C. Integrate the service navigation and internal links
- Add the Individual Career Services hub to the appropriate candidate-facing navigation and service discovery areas. Update the homepage only as needed to introduce the new individual-service focus and link to the hub; preserve its existing design and do not redesign the entire homepage.
- If `services.html` remains active after Step 1, make it a clear entry point to the chosen canonical candidate-services hub or use the repository's established redirect method. Do not leave competing hubs with duplicate copy.
- Link each of the seven cards to its correct page. Add contextual cross-links between related services where useful, without making every page link to every other page.
- Keep Private Career Representation visually and semantically separate as the main managed service, with its own existing page or inquiry path. Explain that it is for clients seeking coordinated search execution rather than one standalone document/profile asset.
- Use the actual inquiry/contact route found in the repository for “Discuss Your Requirements” / “Request a Quotation.” Do not invent URLs, endpoints, or form behavior.

### D. SEO and technical quality
- Give every hub/service page a unique, descriptive `<title>`, a relevant unique meta description, a clear visible H1, correct canonical URL consistent with the repository's conventions, and relevant Open Graph fields if the site already uses them.
- Avoid keyword stuffing, boilerplate duplicate titles, fake locality claims, and unsupported ranking claims. Use keywords naturally and write for people first.
- Keep structured data truthful and consistent with visible page content. Reuse the site's existing JSON-LD conventions where applicable; do not add review/rating schema, fake FAQ claims, or unsupported business details. Structured data must not describe content that is not visible on the page.
- Update the sitemap or sitemap-generation source only if one exists in the repository. Include the correct canonical public URLs and exclude redirects, private/admin pages, or deleted pages according to the project's established rules. Do not invent a sitemap file if the project has no such mechanism.
- Check that all new internal links resolve and that legacy links/redirects continue to work. Do not remove existing pages from search visibility merely to simplify the implementation.

### E. Validation and completion
- Run the project's available tests, HTML/SEO/schema validators, link checks, and build checks. If a check cannot run because the repository lacks a dependency or environment, state that specifically instead of claiming it passed.
- Check the new/updated pages at desktop and mobile breakpoints; verify keyboard navigation, visible focus, text contrast, heading order, link targets, and no console/runtime errors where the project supports such checks.
- Search the implemented service pages and candidate hub for forbidden content: fabricated testimonials, numeric results/guarantees, fixed prices, unapproved booking/payment flows, claims of guaranteed ATS passage/interviews/employment/search ranking, and references that accidentally restore the company-side service.
- Finish by summarizing: files created/updated, which existing pages were reused, the final page-to-URL map, metadata/SEO work, navigation/internal-link work, tests run and exact results, and any unresolved issue. Do not say “complete” for work you did not verify.

## Acceptance criteria

- The candidate hub and all seven service pages contain the approved substantive copy from Part B.
- The seven standalone services are clearly differentiated and the separate Private Career Representation offer is not presented as an eighth catalogue service.
- All CTAs use existing inquiry/contact routes; no public fixed pricing or checkout is introduced.
- No fabricated proof, testimonials, numerical results, or guarantees appear.
- Existing brand styling is preserved; pages are responsive and accessible; no broken links or accidental unrelated changes are introduced.
- Relevant SEO metadata and canonical URLs are accurate and distinct; sitemap changes, if applicable, are validated.
- The completion report distinguishes verified results from checks that could not be run.

---

# PART B: APPROVED FULL PAGE COPY

# Page 0: Individual Career Services hub

**Recommended page:** Reuse the existing candidate service hub where appropriate (currently `candidate-services.html` in the reference snapshot).

**SEO title:** Individual Career Services | KOV

**Meta description:** Explore career services for resumes, LinkedIn profiles, documents, portfolios, personal websites, positioning, and coaching. Scope and fees are discussed by inquiry.

**Eyebrow:** INDIVIDUAL CAREER SERVICES

# Build a clearer, stronger professional presence.

Your experience should be easy to understand, relevant to the opportunities you want, and presented in a way that reflects the work you have actually done.

KOV Career Agency provides focused career services for professionals who want to strengthen how they communicate their experience, present their work, and prepare for their next career step. Choose a specific service or begin with a conversation about what needs attention.

**Primary CTA:** Discuss Your Requirements

**Secondary CTA:** Explore the Services

## KOV's primary managed service

### Private Career Representation

Private Career Representation is KOV's separate managed service for suitable professionals who want support coordinating the work behind a job search, not only improving one document or profile.

Depending on the agreed engagement, the process may include an initial assessment, career positioning, target-role and company research, opportunity development, approved outreach, follow-up, interview preparation, and offer strategy. The scope is discussed directly and agreed before work begins. KOV does not guarantee employment or hiring decisions.

**CTA:** Discuss Private Career Representation

## Career support shaped around the work you need to do

Not every career challenge requires the same solution. Sometimes the priority is a clearer resume. Sometimes it is a more coherent LinkedIn profile, a professional portfolio, a personal website, a defined career direction, or structured coaching before an important decision.

KOV starts with your objective and the information you provide. The scope is agreed before work begins, and professional claims are based on your verified experience rather than invented achievements or generic language.

## Explore the Individual Career Services

### Resume and CV Writing & Optimization

Make your experience, skills, responsibilities, and achievements easier for a recruiter or hiring manager to understand. We help organize and refine your resume or CV around your background and target opportunities, with clear language and a practical structure.

**Explore Resume and CV Services**

### LinkedIn Profile Optimization

Present a consistent professional story across your headline, About section, experience, skills, and relevant profile sections. The aim is a profile that accurately reflects your work and supports the direction you want to pursue.

**Explore LinkedIn Profile Optimization**

### Career Documents

Develop the supporting documents that help explain your professional value, from cover letters and professional biographies to role-specific summaries and carefully prepared outreach messages.

**Explore Career Documents**

### Career Portfolio Development

Bring selected projects, case studies, work samples, publications, and achievements into a clear portfolio that helps others understand your contribution and working approach.

**Explore Career Portfolio Development**

### Personal Career Website

Create a professional online home for your biography, experience, selected work, portfolio, and contact details. The website is planned around your goals, audience, content, and agreed technical scope.

**Explore Personal Career Websites**

### Career Positioning & Optimization

Clarify the roles and markets that fit your experience, identify positioning gaps, and build a practical plan for presenting your background more effectively.

**Explore Career Positioning & Optimization**

### Career Coaching

Work through career direction, transitions, interview preparation, communication, negotiation, and next-step decisions with structured guidance tailored to your situation.

**Explore Career Coaching**

## How an individual service begins

### Understand your objective

Tell us what you are trying to improve, what you already have, and how you intend to use the finished work.

### Confirm the right scope

KOV reviews the request and clarifies the relevant deliverables, information needed, practical constraints, and whether the service is a suitable fit.

### Receive a tailored quotation

Fees and scope are discussed directly. Work begins only after the deliverables and terms have been agreed.

### Review and finalize

You review the agreed work, provide feedback, and confirm the final version within the revision process agreed for your engagement.

## A clear and evidence-led approach

Your career materials should reflect your real experience. KOV will not invent job titles, qualifications, certifications, achievements, metrics, or responsibilities to make a profile appear stronger. Where details need clarification, we ask you to confirm them.

The quality and usefulness of the final work depend on the information available, the agreed scope, and your feedback. Career services can improve clarity and presentation, but they cannot guarantee an interview, job offer, promotion, or search result.

## Frequently asked questions

### Can I request just one service?

Yes. You can inquire about one service or explain a broader need. KOV will discuss the appropriate scope and whether the request is a fit.

### Are these services only for executives?

No. Individual Career Services may be suitable for professionals at different career levels, subject to the nature of the request and KOV's assessment of fit. Some existing specialist pages may focus on senior or executive-level work.

### Do you publish fixed prices?

No. Fees are discussed after the requested service and deliverables are understood. A tailored quotation is provided before work begins.

### Do you guarantee interviews or employment?

No. KOV can help improve the quality, clarity, and alignment of career materials or provide agreed guidance, but hiring decisions and market outcomes are outside KOV's control.

### How do I get started?

Use the existing contact or inquiry route to describe your objective, the service you are considering, and any practical deadline. Sensitive information should be shared only when it is needed for the discussion.

## Start with the work you need most

Tell KOV what you want to improve and what a useful result would look like for you. We will discuss suitability, scope, and fees directly before any work begins.

**CTA:** Discuss Your Requirements

---

# Page 1: Resume and CV Writing & Optimization

**Recommended URL:** Reuse the best existing canonical resume-service page if appropriate; the reference snapshot includes `executive-resume-strategy.html`. Do not create a duplicate competing page without checking the live repository's URL structure.

**SEO title:** Resume & CV Writing and Optimization | KOV

**Meta description:** Improve your resume or CV with clearer structure, evidence-based achievements, relevant skills, and positioning aligned with your target roles.

**Eyebrow:** RESUME AND CV SERVICES

# Make your experience clear, relevant, and credible.

A resume or CV should help a reader understand what you have done, the scope of your work, the skills you bring, and why your background may be relevant to the opportunity in front of them.

KOV helps professionals review, rebuild, or refine their career documents so the most important information is easier to find and understand. The work begins with your real experience and the roles or markets you want to pursue. We do not invent achievements, inflate responsibilities, or add keywords that do not reflect your background.

**CTA:** Discuss Your Resume or CV

## What we can work on

- **Structure and readability:** Organize sections, headings, chronology, and information so the document is easy to scan.
- **Professional summary:** Clarify your background, strengths, and direction without relying on vague claims or empty buzzwords.
- **Experience descriptions:** Rewrite responsibilities and achievements using specific, accurate language grounded in the information you provide.
- **Skills and terminology:** Identify relevant terms used in target roles and include them naturally where they accurately describe your experience.
- **Role alignment:** Prioritize the experience and evidence most relevant to the roles you want to pursue.
- **Formatting:** Use a clean, readable layout that works for people and is designed with common document-parsing constraints in mind.
- **Versioning:** Where agreed, prepare a master version and tailored versions for different role families or opportunities.
- **Final files:** Deliver the agreed formats, such as an editable Word document and a PDF.

The exact deliverables depend on the scope agreed for your request.

## Our process

### Understand your background and objective

We review your current resume or CV, work history, target roles, preferred markets, and the main issues you want to address. If you are changing direction, we clarify which experience is transferable and what evidence supports the move.

### Collect and verify the evidence

We identify missing details and ask you to confirm responsibilities, scope, dates, qualifications, tools, and achievements. Any metrics included must come from you or another source you authorize and can substantiate.

### Develop the document structure and narrative

We organize the information around your relevant experience and intended direction. The document should communicate value quickly without hiding important facts or overstating seniority.

### Draft and review

You review the draft for accuracy, tone, and completeness. Your feedback is used to refine the document within the agreed revision scope.

### Finalize the agreed files

We deliver the final files in the agreed formats and clarify how the document can be adapted for different opportunities, where that is part of the engagement.

## Who this service may help

- Professionals whose current resume or CV no longer reflects their responsibilities or direction.
- Applicants moving into a new role, industry, market, or level of responsibility.
- Experienced professionals whose work is complex and difficult to summarize clearly.
- Candidates who need a more coherent master CV and a practical approach to tailoring it.
- Professionals returning to work or explaining a non-linear career path.

Suitability depends on the request and the information available.

## What good resume work should and should not do

A strong document is specific, readable, accurate, and relevant. It does not need exaggerated language or unsupported claims. We consider common applicant-tracking-system parsing constraints, but no writer can guarantee that a document will pass every ATS, receive a particular ranking, or lead to an interview. Employers use different systems and selection criteria.

KOV does not fabricate qualifications, employment, responsibilities, awards, metrics, or references. You remain responsible for confirming that all information is accurate before using the document.

## Frequently asked questions

### Do you write both resumes and CVs?

Yes. The appropriate format depends on your profession, target market, and the type of opportunity. We discuss this during the initial inquiry.

### Can you tailor a resume to a specific role?

Role-specific tailoring can be included when the target job description and relevant information are available and the scope is agreed.

### Can you guarantee ATS approval or an interview?

No. Formatting and terminology can be reviewed with common parsing considerations in mind, but hiring systems and decisions vary.

### What files will I receive?

The final formats are confirmed in the quotation. They may include an editable Word file and PDF where appropriate.

### How is the fee determined?

Fees are discussed after the document, complexity, target roles, and requested deliverables are understood. A quotation is agreed before work begins.

## Start with your current document

Share what you want to improve, the type of opportunity you are targeting, and whether you need a new document, a rebuild, or targeted revisions. KOV will discuss the suitable scope and quotation with you.

**CTA:** Request a Resume or CV Quotation

---

# Page 2: LinkedIn Profile Optimization

**Recommended URL:** Reuse the existing LinkedIn service page if appropriate; the reference snapshot includes `linkedin-optimization-executives.html`. Inspect redirects and canonical URLs before changing it.

**SEO title:** LinkedIn Profile Optimization | KOV

**Meta description:** Align your LinkedIn headline, About section, experience, skills, and featured content with a clear professional story and career direction.

**Eyebrow:** LINKEDIN PROFILE OPTIMIZATION

# Make your LinkedIn profile tell a clearer professional story.

Your LinkedIn profile is more than a list of positions. It is a public-facing summary of your professional identity, experience, capabilities, and interests. When the sections tell different stories, it can be difficult for a reader to understand what you do and where you want to go.

KOV helps you refine your profile so it accurately reflects your background and career direction. The work focuses on clear writing, relevant terminology, consistent positioning, and useful evidence of your experience. It does not depend on exaggerated claims or promises of a particular search ranking.

**CTA:** Discuss LinkedIn Profile Support

## What we can optimize

- **Headline:** A concise description of your professional focus, expertise, and direction.
- **About section:** A clear summary of your background, strengths, interests, and relevant professional themes.
- **Experience:** Role descriptions that explain scope, responsibilities, contributions, and outcomes using verified information.
- **Skills:** A relevant selection aligned with your actual capabilities and intended roles.
- **Featured content:** Appropriate links, presentations, articles, projects, or work samples that support your professional story.
- **Projects and publications:** Relevant supporting sections where they add useful context.
- **Education and credentials:** Clear presentation of verified education, licenses, courses, and certifications.
- **Profile banner and visual direction:** Recommendations for a suitable background image, banner, or infographic, where included in the scope.
- **Job-search settings and alerts:** Guidance on relevant job-alert settings where useful to the objective and included in the agreed scope.
- **Profile consistency:** Alignment between LinkedIn, your resume/CV, portfolio, and career objectives.
- **Search language:** Natural use of relevant role and skill terminology for LinkedIn and external search, without keyword stuffing or promises of ranking.

Implementation can include written recommendations and ready-to-use profile copy. Direct editing, visual design, or additional content support must be explicitly included in the agreed scope.

## Our process

### Define the profile's purpose

We clarify what you want the profile to support: a career move, a change of direction, stronger professional presentation, consulting work, leadership positioning, or another specific objective.

### Review the existing profile and evidence

We examine the current profile and the information you provide about your experience, strengths, projects, and target roles. Any unclear claims are flagged for confirmation.

### Build the professional narrative

We develop the headline, About section, experience descriptions, skills priorities, and supporting sections so they work together rather than repeating disconnected keywords.

### Prepare the profile content

We provide the agreed copy and recommendations in a form you can review. Any banner, infographic, or other visual deliverable is included only when agreed.

### Review and finalize

You confirm the accuracy of the content and make or approve the changes according to the implementation scope. Platform features and profile layouts can change, so the final setup should be checked in LinkedIn itself.

## Who this service may help

This service may suit professionals whose LinkedIn profile is outdated, difficult to understand, inconsistent with their resume, or not aligned with their current direction. It can also help people changing roles or industries, returning to work, or presenting a combination of technical and leadership experience.

LinkedIn is not required for every career goal. If you do not use the platform or prefer another way to present your experience, KOV can discuss whether another service is a better fit.

## Accuracy, privacy, and realistic expectations

All profile content should reflect your actual background. KOV will not create fake recommendations, endorsements, credentials, job titles, or achievements. We cannot guarantee profile views, recruiter contact, search placement, or job offers. Platform algorithms and user behavior are outside KOV's control.

Do not share your password in an inquiry. Any direct account access or implementation arrangements must be discussed safely and explicitly; the default deliverable can be profile copy and guidance for you to apply.

## Frequently asked questions

### Will you log in and edit my LinkedIn profile?

The scope must specify whether the engagement includes written copy, guidance, visual assets, or direct implementation. Do not send your password through the inquiry form.

### Can you help if I am changing industries?

Yes, where the available experience and target direction can be represented accurately. We identify transferable skills and relevant evidence without pretending you have experience you do not have.

### Do you guarantee more profile views or recruiter messages?

No. The service improves clarity and alignment; visibility and responses cannot be guaranteed.

### Does this include resume writing?

Resume/CV work is a separate service and can be quoted together if you want both deliverables.

### How do I request a quotation?

Describe your target direction, current profile status, and the type of help you need. KOV will clarify the scope and fees before work begins.

## Make your profile consistent with your goals

Tell us what you want your profile to communicate and what kind of professional opportunity or audience you want it to support.

**CTA:** Request a LinkedIn Profile Quotation

---

# Page 3: Career Documents

**Recommended URL:** Create a dedicated page if no suitable canonical page exists. Suggested filename: `career-documents.html`.

**SEO title:** Professional Career Documents | KOV

**Meta description:** Prepare cover letters, professional biographies, career summaries, statements of interest, and supporting application documents.

**Eyebrow:** CAREER DOCUMENTS

# The right document should support the story you need to tell.

Different career situations call for different documents. A cover letter should explain relevance to a particular opportunity. A professional biography should introduce your background and focus. A career summary should help a reader understand your experience without having to reconstruct it from a long CV.

KOV helps professionals prepare accurate, purposeful career documents based on their experience, intended audience, and use case. Each document is scoped around the question it needs to answer and the information that can be substantiated.

**CTA:** Discuss a Career Document

## Documents we can help prepare

- **Cover letters:** Tailored letters that connect your experience to the requirements and context of a specific opportunity.
- **Professional biographies:** Short or extended biographies for websites, speaking profiles, professional introductions, or business contexts.
- **Executive or professional summaries:** Concise descriptions of experience, focus, and relevant strengths.
- **Statements of interest:** Documents explaining why a role, program, board opportunity, or professional engagement is relevant to you.
- **Networking and outreach messages:** Thoughtful first-contact or follow-up messages for professional conversations, where included in the scope.
- **Achievement summaries:** Organized summaries of projects, contributions, responsibilities, and verified outcomes.
- **Board, advisory, or consulting biographies:** Positioning documents for professionals pursuing those activities, based on verified experience.
- **Supporting application documents:** Other career-related materials agreed during the inquiry.

Not every document is suitable for every person or opportunity. We will clarify the audience, format, length, and purpose before work begins.

## Our process

### Identify the audience and purpose

We establish who will read the document, what they need to understand, and what decision or next step the document is meant to support.

### Gather the source material

We review your resume/CV, background information, target opportunity, and any existing drafts or requirements. We ask for clarification where facts or claims need to be verified.

### Choose the structure and tone

The document is organized around its purpose, whether that means a concise introduction, a role-specific case for fit, a professional narrative, or a structured record of experience.

### Draft and refine

You review the draft for accuracy and tone. Revisions follow the scope and process agreed in the quotation.

### Deliver the final version

The final document is supplied in the agreed format. If several versions are required for different audiences, those versions must be included in the agreed scope.

## Who this service may help

Career Documents may be useful when applying for a specific role, preparing a professional introduction, exploring consulting or advisory work, presenting a career transition, or creating consistent supporting materials for a website, portfolio, or profile.

## What we need from you

Useful source material includes the intended audience, purpose, deadline, current resume/CV, relevant role or opportunity details, preferred tone, and any formatting requirements. You do not need to send every sensitive document at the first inquiry; share only what is necessary to establish scope.

KOV does not provide legal advice or create misleading references, credentials, endorsements, or claims. Documents should remain accurate and appropriate for the audience that will receive them.

## Frequently asked questions

### Can one document be adapted for different opportunities?

Yes, if the opportunities and required changes are clear. The number and extent of versions are agreed before work begins.

### Do you write cover letters without a specific job description?

A general professional introduction may be possible, but a tailored cover letter is stronger when the role or opportunity details are available.

### Can you create a professional biography for a website or portfolio?

Yes. The biography can be aligned with the intended audience and used alongside other agreed career materials.

### Do you include revisions?

The revision process is defined in the quotation so both sides understand what is included.

### How are fees determined?

Fees depend on the document type, complexity, source material, number of versions, and agreed deliverables. A quotation is provided before work begins.

## Tell us what the document needs to accomplish

Describe the document you need, who will read it, and what you want the reader to understand. KOV will discuss suitability and provide a tailored quotation.

**CTA:** Request a Career Document Quotation

---

# Page 4: Career Portfolio Development

**Recommended URL:** Create a dedicated page if no suitable canonical page exists. Suggested filename: `career-portfolio-development.html`.

**SEO title:** Career Portfolio Development | KOV

**Meta description:** Organize selected projects, case studies, work samples, publications, and achievements into a clear, credible career portfolio.

**Eyebrow:** CAREER PORTFOLIO DEVELOPMENT

# Make your work easier to understand and evaluate.

A resume can summarize your experience, but some professional contributions are easier to understand when supported by selected work samples. A portfolio can help bring projects, case studies, publications, presentations, creative work, technical examples, or leadership initiatives into a coherent story.

KOV helps you decide what to include, how to organize it, and how to explain your contribution. The goal is not to display everything you have done. It is to select relevant evidence and present it clearly for the audience you want to reach.

**CTA:** Discuss Portfolio Development

## What a portfolio can include

- **Portfolio strategy:** Define the intended audience, purpose, and format before collecting material.
- **Project selection:** Choose relevant work that supports your target roles or professional direction.
- **Case-study structure:** Explain the context, objective, your contribution, approach, and substantiated outcome where available.
- **Role and responsibility clarity:** Distinguish your own contribution from the work of a wider team.
- **Work samples:** Organize appropriate documents, designs, presentations, publications, product examples, or other samples.
- **Skills and methods:** Show how you approach problems and apply relevant capabilities.
- **Narrative and navigation:** Arrange the material so readers can understand the overall story and explore individual examples.
- **Format planning:** Prepare the agreed portfolio format, which may be a PDF, presentation, web portfolio, or content package for another platform.

The final format and number of portfolio items depend on the request and agreed scope.

## Our process

### Define the portfolio's purpose

We clarify who is likely to review the portfolio and what they need to learn about your work, whether the audience is a hiring team, client, partner, or professional community.

### Inventory the available evidence

We review the projects, samples, publications, and descriptions you can share. We identify gaps and decide which items best support the intended story.

### Confirm ownership and confidentiality

Before any work sample is published or shared, you must have the right to use it. Confidential employer information, personal data, restricted client material, and proprietary content must not be disclosed without appropriate permission. Where suitable, a case study can be anonymized or summarized without exposing protected details.

### Build the narrative and structure

We organize the selected items, clarify your role, and prepare supporting descriptions that explain the context and contribution without overstating the result.

### Review and deliver

You confirm accuracy, permissions, and presentation. KOV delivers the agreed format and files, with revisions handled according to the agreed scope.

## Who this service may help

A portfolio may be useful for professionals whose work is project-based, creative, technical, research-oriented, consulting-focused, or difficult to demonstrate through a resume alone. It may also support professionals who need to explain cross-functional work, complex initiatives, publications, or selected leadership contributions.

A portfolio is not necessary for every profession or every career move. KOV will discuss whether it is useful for your objective before proposing a scope.

## Evidence, privacy, and realistic expectations

Portfolio content must be accurate and appropriate to share. KOV will not fabricate projects, customer names, client logos, outcomes, metrics, or endorsements. If a result cannot be verified or shared, the portfolio should describe the work responsibly without pretending otherwise.

A portfolio can make relevant evidence easier to review, but it cannot guarantee interviews, clients, employment, or commercial opportunities.

## Frequently asked questions

### What if my work is confidential?

Do not share restricted material. We can discuss whether a permitted, anonymized, or high-level description is appropriate, but you are responsible for confirming that the material may be used.

### Does a portfolio have to be a website?

No. Depending on your needs, it may be a PDF, presentation, web page, or content package for a platform you already use.

### Can you help describe projects if I do not have formal case studies?

Yes. We can work from the information you provide to structure the context, your contribution, and verifiable details.

### Will you design every visual or build a website?

Only if those deliverables are included in the agreed scope. Portfolio content and personal website development are related but separate services.

### How is the fee determined?

Fees depend on the number and complexity of items, the amount of source material, the required format, and the agreed deliverables.

## Turn selected work into a coherent professional story

Tell us what kind of work you want to present, who the audience is, and whether you already have samples or need help structuring them.

**CTA:** Request a Portfolio Quotation

---

# Page 5: Personal Career Website

**Recommended URL:** Create a dedicated page if no suitable canonical page exists. Suggested filename: `personal-career-website.html`.

**SEO title:** Personal Career Website Development | KOV

**Meta description:** Plan a professional personal website for your biography, experience, selected work, portfolio, resume/CV, and contact details.

**Eyebrow:** PERSONAL CAREER WEBSITE

# Create a professional home for your work and experience.

A personal career website gives you a place to bring together your professional biography, experience, selected work, portfolio, publications, resume/CV, and contact information. It can help people understand your background without relying on a single social profile or a document attachment.

KOV helps plan and develop a personal website around your purpose, audience, available content, and technical requirements. The objective is a clear, credible presentation of your work, not a promise of search-engine rankings or a substitute for the substance of your experience.

**CTA:** Discuss a Personal Career Website

## What the website can include

- **Site purpose and structure:** Define the audience, main message, and pages required.
- **Professional biography:** Present your background, focus, and direction in clear language.
- **Experience and expertise:** Organize relevant roles, capabilities, and areas of work.
- **Selected projects or portfolio:** Feature approved case studies, samples, publications, or other evidence.
- **Resume/CV access:** Include a download or link if appropriate and approved by you.
- **Contact route:** Provide the agreed professional contact method without exposing information you do not want public.
- **Responsive layout:** Ensure the content adapts to desktop and mobile screens.
- **Basic on-page SEO:** Use descriptive page titles, headings, meta descriptions, crawlable links, and relevant structured data where appropriate and supported by visible content.
- **Accessibility and usability:** Use readable text, logical headings, keyboard-accessible navigation, appropriate contrast, and meaningful alternative text.

The exact pages, design, hosting, domain, integrations, and maintenance arrangements must be stated in the quotation. Domain registration, hosting, paid tools, ongoing maintenance, and third-party services are not included unless explicitly agreed.

## Our process

### Clarify the website's role

We establish why you need a website, who should use it, what you want them to understand, and whether a simple professional profile or a broader portfolio site is more appropriate.

### Plan the content and pages

We agree on the structure, required sections, content sources, visuals, and contact approach. Only content that you approve and have permission to publish should be included.

### Prepare the content

We organize your biography, experience, selected work, and supporting materials so the site tells a coherent professional story. Claims are based on your verified information.

### Build and review

The site is implemented using the agreed technical approach and existing project conventions where relevant. You review content, navigation, appearance, and contact details before finalization.

### Test and hand over

The agreed checks cover responsive behavior, links, readability, accessibility basics, metadata, and the site's stated scope. Handover, source files, hosting setup, or ongoing maintenance are included only where agreed.

## Who this service may help

A personal career website may suit professionals who need a central place for work samples, publications, consulting or advisory activity, creative output, technical projects, speaking activity, or a broader professional profile. It may also be useful when your work is difficult to explain through a resume alone.

Not every professional needs a separate website. KOV will discuss the simplest option that fits your goals and practical requirements.

## Ownership, privacy, and expectations

You should retain control of your personal content and understand any domain, hosting, or third-party accounts used for the site. Access, ownership, ongoing costs, maintenance, and handover should be agreed before development starts.

KOV does not guarantee Google rankings, traffic, leads, interviews, or employment. Search engines decide how and when pages appear. Basic on-page SEO helps communicate the content accurately but is not a ranking guarantee.

## Frequently asked questions

### Will the website be mobile-friendly?

Responsive behavior is part of the agreed build scope and should be checked at common screen sizes before handover.

### Is domain registration or hosting included?

Only if it is explicitly included in the quotation. Any recurring third-party costs must be identified before you agree to proceed.

### Can the website include my resume and portfolio?

Yes, if you approve the content and the required assets are available. Sensitive or confidential information should not be published.

### Will the website rank on Google?

No ranking can be guaranteed. The scope can include clear metadata, crawlable navigation, and other appropriate on-page practices, but indexing and ranking depend on search engines and many external factors.

### Can I request only the content and not the build?

Tell us what you need. Content planning, writing, and technical implementation can be discussed as separate deliverables if suitable.

## Discuss the website you actually need

Share the purpose of the website, the audience you want to reach, the material you already have, and whether you need content, design, implementation, or a combination.

**CTA:** Request a Website Quotation

---

# Page 6: Career Positioning & Optimization

**Recommended URL:** Create a general career-positioning page if no suitable canonical page exists. Suggested filename: `career-positioning-optimization.html`. Preserve any distinct senior-leader strategy page that serves a separate purpose.

**SEO title:** Career Positioning & Optimization | KOV

**Meta description:** Clarify target roles, transferable strengths, professional positioning, and practical next steps with a structured career review.

**Eyebrow:** CAREER POSITIONING & OPTIMIZATION

# Make your next career move more deliberate.

Sometimes the problem is not a single document. Your experience may be broad, your next move may be unclear, or your resume, profile, and target roles may be telling different stories. Career positioning helps connect your background to a realistic direction and identify what needs to change before you move forward.

KOV helps you review your current position, clarify target roles or markets, identify relevant strengths and gaps, and develop a practical plan for presenting your experience. The work is based on your circumstances and evidence, not generic career advice or promises about what employers will do.

**CTA:** Discuss Career Positioning

## What the service can cover

- **Career direction:** Clarify the move you are considering and the factors shaping your decision.
- **Target-role definition:** Identify role families, responsibility levels, and work environments that may fit your experience and objectives.
- **Market and role research:** Review relevant role descriptions, employer expectations, terminology, and market context where information is available.
- **Transferable strengths:** Identify experience and skills that may be relevant to a new role or industry.
- **Positioning gaps:** Highlight missing evidence, unclear claims, or areas where your materials do not support the intended direction.
- **Professional narrative:** Define a clear explanation of your background, value, and next step.
- **Materials alignment:** Identify changes needed across your resume/CV, LinkedIn profile, career documents, or portfolio.
- **Action plan:** Prioritize the next practical steps, information to gather, and materials to update.

The final scope may be a focused review or a broader positioning engagement. It is agreed after the initial inquiry.

## Our process

### Understand the situation

We discuss your current role or circumstances, career history, interests, constraints, and the decision you are trying to make.

### Review the available evidence

We examine your experience, existing materials, and target-role information. We distinguish verified strengths from assumptions that need more evidence.

### Map realistic directions

We identify potential role families or career paths for further consideration and explain the fit, transferable skills, and gaps that need attention. This is a structured assessment, not a promise that a particular move is available.

### Define your positioning

We develop the core narrative and identify how your experience should be communicated to the audiences relevant to your objective.

### Agree the next steps

You receive the agreed recommendations or action plan. If you need writing, coaching, portfolio work, or managed search execution, those deliverables can be discussed separately.

## Who this service may help

- Professionals considering a role, industry, or market change.
- People whose experience spans several functions and needs a clearer narrative.
- Professionals returning to work or reassessing their direction.
- Candidates who are unsure which roles best match their evidence and goals.
- Experienced professionals preparing for greater responsibility or a different professional path.

Career positioning may be useful at different career levels, subject to fit.

## What this service is and is not

Career Positioning & Optimization helps you clarify direction and improve the way your experience is presented. It is not the same as ongoing coaching, which focuses on guided discussion and practice, or Private Career Representation, which may include coordinated search execution and outreach under a separate agreement.

KOV cannot guarantee that a particular role, industry, market, or transition will be available. Recommendations depend on the information supplied and the market evidence that can be reviewed.

## Frequently asked questions

### Is this the same as career coaching?

They overlap but serve different purposes. Positioning focuses on reviewing fit, direction, and professional presentation. Coaching provides guided support as you think through decisions, prepare, and act. The suitable scope can be discussed.

### Does this include a resume rewrite?

Not automatically. The review may identify resume changes, but document writing is included only if it is part of the agreed scope.

### Can you research target roles or industries?

Yes, where relevant information is available and research is included in the agreed deliverables.

### Is this suitable if I do not know what I want next?

It may be. The first discussion clarifies the decision you are facing and whether a positioning engagement is the right starting point.

### How do I receive a quotation?

Describe your current situation, the decision or move you are considering, and the kind of help you want. KOV will clarify scope and fees before work begins.

## Start by clarifying the decision in front of you

Tell us what is changing in your career, which options you are considering, and where you need clearer direction.

**CTA:** Request a Career Positioning Quotation

---

# Page 7: Career Coaching

**Recommended URL:** Create a dedicated general page if no suitable canonical page exists. Suggested filename: `career-coaching.html`. Preserve and correctly route any existing interview-coaching URL or redirect after checking the repository.

**SEO title:** Career Coaching & Interview Preparation | KOV

**Meta description:** Get structured career coaching for professional direction, transitions, interviews, communication, negotiation, and next-step planning.

**Eyebrow:** CAREER COACHING

# Think through your next move with a clearer plan.

Career decisions can involve uncertainty, competing priorities, unfamiliar interviews, difficult conversations, or a change in professional identity. Coaching provides a structured space to examine the situation, prepare for specific moments, and turn broad concerns into practical next steps.

KOV offers career-focused coaching based on the objective you bring to the engagement. The work may involve career direction, transition planning, interview preparation, professional communication, negotiation preparation, or a practical action plan. The scope is agreed in advance so the sessions focus on what is most useful to you.

**CTA:** Discuss Career Coaching

## Coaching topics may include

- **Career direction:** Clarify priorities, options, constraints, and the decision you need to make.
- **Career transitions:** Prepare to explain a move between roles, industries, functions, or levels of responsibility.
- **Interview preparation:** Develop clear examples, practice responses, and prepare questions relevant to the role and interview format.
- **Professional storytelling:** Explain your experience, contribution, and motivations in a concise and credible way.
- **Communication:** Prepare for professional conversations, presentations, or difficult discussions.
- **Negotiation preparation:** Clarify priorities, questions, trade-offs, and a considered approach to an offer discussion.
- **Career planning:** Turn a broad goal into practical actions, decisions, and areas to investigate.
- **Accountability and reflection:** Review progress against the actions agreed for the coaching engagement.

Coaching topics are selected according to your objective and the scope agreed. Not every engagement includes every topic.

## Our process

### Define the objective

We identify the situation you want to work on, what you hope to clarify or prepare for, and any relevant deadline.

### Establish the context

We review the information needed to understand your experience, concerns, options, or upcoming professional event.

### Work through the issue

Sessions use structured questions, practical exercises, examples, or role-specific preparation as appropriate. The focus is on helping you reason through the situation and communicate your own experience accurately.

### Agree practical actions

You leave with the agreed next steps, practice tasks, questions to resolve, or preparation materials relevant to the scope.

### Review and adjust

Where multiple sessions are agreed, the work can be adjusted as your situation develops and priorities become clearer.

## Who this service may help

Career coaching may suit professionals facing a career decision, preparing for interviews, planning a transition, developing a professional narrative, or preparing for an important workplace or offer conversation. It can be useful at different career levels, depending on the topic and fit.

## Practical expectations

Coaching is collaborative. KOV can provide structure, questions, feedback, and preparation, but you remain responsible for your decisions and actions. Coaching does not guarantee employment, promotion, interview success, or a particular negotiation outcome. It is not psychotherapy, legal advice, or financial advice.

## Frequently asked questions

### Can coaching focus on one specific interview?

Yes. The request can focus on a particular role or interview format if you provide relevant details and the scope is agreed in advance.

### Is coaching delivered online?

The delivery format is discussed during the inquiry and confirmed in the agreed scope.

### Does coaching include written materials?

Preparation notes, scripts, exercises, or other materials are included only when agreed as deliverables.

### Is coaching the same as Private Career Representation?

No. Coaching supports your thinking and preparation. Private Career Representation is a separate managed service that may include coordinated search activity and outreach for suitable clients.

### How are fees determined?

Fees depend on the topic, preparation required, number of sessions, and agreed deliverables. A quotation is provided before work begins.

## Discuss the situation you want to work through

Share the decision, transition, interview, or professional conversation you are preparing for. KOV will discuss whether coaching is suitable and confirm the scope and quotation before work begins.

**CTA:** Request a Coaching Quotation

---

# PART C: FINAL CONTENT AND IMPLEMENTATION GUARDRAILS

- **Seven standalone services only:** Resume/CV, LinkedIn, documents, portfolio, personal website, career positioning/optimization, and coaching.
- **Separate primary managed service:** Private Career Representation remains separate and is not counted as an eighth standalone service.
- **Inquiry/quotation only:** No fixed public pricing, checkout, subscription, or unapproved booking system.
- **No testimonials or outcome claims on the hub/service pages:** Remove testimonial sections and numerical outcome claims from these pages; do not invent proof or delete unrelated records.
- **Accurate claims only:** No invented credentials, achievements, metrics, service features, platform capabilities, or local-office claims.
- **Preserve existing records and unrelated pages:** Do not damage account/admin functionality, privacy/security controls, blog content, or unrelated site architecture.
- **Use the repository's actual routes and design system:** Inspect the real workspace before changing paths or CSS. The ZIPs are reference snapshots, not permission to overwrite newer code.
- **SEO must be specific and honest:** Unique titles and descriptions, clear visible headings, correct canonical URLs, crawlable links, and truthful structured data. No keyword stuffing or ranking guarantees.
- **Report honestly:** List exact files changed and tests run. Distinguish successful checks from checks that could not be performed.

## Research references used for implementation principles

- Google Search Central, title links: https://developers.google.com/search/docs/appearance/title-link
- Google Search Central, snippets and meta descriptions: https://developers.google.com/search/docs/appearance/snippet
- Google Search Central, crawlable links: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google Search Central, canonical URLs and duplicate pages: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central, structured-data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- LinkedIn Help, creating a good LinkedIn profile: https://www.linkedin.com/help/linkedin/answer/a554351/how-do-i-create-a-good-linkedin-profile
- W3C WAI, WCAG 2.2 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

These sources inform general implementation standards. They do not authorize unsupported claims about KOV or guarantee search or career outcomes.
