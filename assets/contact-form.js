(() => {
  const form = document.querySelector('form[action^="mailto:"]');
  if (!(form instanceof HTMLFormElement)) return;

  const audience = form.querySelector('[name="Audience"]');
  if (audience instanceof HTMLSelectElement) {
    audience.replaceChildren(
      new Option("Professional / another career stage", "Other", true, true),
      new Option("Senior Professional", "Senior Professional")
    );
    const audienceLabel = form.querySelector('label[for="inquiry-audience"]');
    if (audienceLabel) audienceLabel.textContent = 'Career stage (optional):';
  }

  form.querySelector('.contact-phone-fields')?.remove();

  const removeField = (name) => {
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLElement) control.closest('div')?.remove();
  };
  removeField('TargetRole');
  removeField('SalaryRange');
  removeField('LinkedInURL');

  const fields = [
    ["FirstName", "first-name"],
    ["LastName", "last-name"],
    ["Email", "email-address"],
  ];
  for (const [name, id] of fields) {
    const control = form.elements.namedItem(name);
    if (!(control instanceof HTMLInputElement)) continue;
    control.id = id;
    const label = control.parentElement?.querySelector('label');
    if (label) label.htmlFor = id;
  }

  const audienceField = form.querySelector('#inquiry-audience')?.closest('div');
  if (audienceField) {
    const serviceField = document.createElement('div');
    const label = document.createElement('label');
    const select = document.createElement('select');
    serviceField.className = 'mb-6';
    label.htmlFor = "service-interest";
    label.className = "mb-2 block text-sm font-semibold text-ink";
    label.textContent = "What would you like help with? (optional)";
    select.id = "service-interest";
    select.name = "ServiceInterest";
    select.className = "w-full border border-line bg-background px-4 py-3 text-ink";
    select.add(new Option("Choose a service or select “not sure yet”", ""));
    select.add(new Option("Résumé/CV Writing & Optimization", "resume"));
    select.add(new Option("LinkedIn Profile Optimization", "linkedin"));
    select.add(new Option("Career Documents", "documents"));
    select.add(new Option("Career Portfolio Development", "portfolio"));
    select.add(new Option("Personal Career Website", "website"));
    select.add(new Option("Career Positioning & Optimization", "positioning"));
    select.add(new Option("Career Coaching", "coaching"));
    select.add(new Option("Private Career Representation", "representation"));
    select.add(new Option("I am not sure yet", "unsure"));
    serviceField.append(label, select);
    audienceField.after(serviceField);

    const selection = new URLSearchParams(location.search).get("service");
    if (selection && [...select.options].some((option) => option.value === selection)) {
      select.value = selection;
    }
  }

  const message = form.elements.namedItem('Message');
  if (message instanceof HTMLTextAreaElement) {
    message.id = "career-inquiry-message";
    message.placeholder = "Briefly share your goal or question. Please do not attach a CV or include confidential information at this stage.";
    const label = message.parentElement?.querySelector('label');
    if (label) {
      label.htmlFor = message.id;
      label.textContent = "Anything else you would like KOV to know? (optional)";
    }
  }

  const heading = document.querySelector('main h1');
  if (heading) heading.textContent = "Tell KOV what support you need.";
  const servicesLink = [...document.querySelectorAll('main a')].find((link) =>
    link.getAttribute("href") === "candidate-services.html"
  );
  if (servicesLink) servicesLink.textContent = "Explore Individual Career Services";
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Send Career Services Inquiry";
  const formNote = form.querySelector("p.text-center");
  if (formNote) {
    formNote.textContent = "Submitting sends your inquiry to KOV through the existing contact service. If online submission is unavailable, an email fallback is offered. You do not need to attach a CV or share confidential information for an initial inquiry.";
  }

  const status = document.createElement("p");
  status.className = "text-sm text-ink-soft";
  status.setAttribute("aria-live", "polite");
  status.setAttribute("role", "status");
  status.hidden = true;
  form.append(status);

  const field = (name) => String(new FormData(form).get(name) || "").trim();
  const serviceLabels = new Map([
    ["resume", "Résumé/CV Writing & Optimization"],
    ["linkedin", "LinkedIn Profile Optimization"],
    ["documents", "Career Documents"],
    ["portfolio", "Career Portfolio Development"],
    ["website", "Personal Career Website"],
    ["positioning", "Career Positioning & Optimization"],
    ["coaching", "Career Coaching"],
    ["representation", "Private Career Representation"],
    ["unsure", "Not sure yet"],
  ]);
  const inquiryMessage = () => {
    const selected = serviceLabels.get(field("ServiceInterest"));
    return [selected ? `Service of interest: ${selected}` : "", field("Message")]
      .filter(Boolean)
      .join("\n\n") || null;
  };
  const mailtoFallback = () => {
    const body = [
      `First name: ${field("FirstName")}`,
      `Last name: ${field("LastName")}`,
      `Email: ${field("Email")}`,
      `Career stage: ${field("Audience")}`,
      `Service of interest: ${serviceLabels.get(field("ServiceInterest")) || "Not specified"}`,
      field("Message"),
    ].filter(Boolean).join("\n");
    const link = document.createElement("a");
    link.href = `mailto:daniel@kovcareeragency.org?subject=${encodeURIComponent("Contact Inquiry")}&body=${encodeURIComponent(body)}`;
    link.textContent = "Email your inquiry instead.";
    link.className = "underline";
    return link;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.replaceChildren();
    status.hidden = false;
    status.textContent = "Sending your inquiry…";

    const payload = {
      first_name: field("FirstName"),
      last_name: field("LastName"),
      email: field("Email"),
      audience: field("Audience"),
      target_role: field("TargetRole") || "Not specified yet",
      message: inquiryMessage(),
      company_name: field("CompanyName") || null,
      location_market: field("LocationMarket") || null,
      target_seniority: field("TargetSeniority") || null,
      timeline: field("Timeline") || null,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Your inquiry could not be sent.");
      }
      status.textContent = "Thank you. Your inquiry has been received.";
      form.reset();
      document.getElementById("inquiry-audience")?.dispatchEvent(new Event("change"));
    } catch (error) {
      status.textContent = error instanceof Error
        ? `${error.message} `
        : "Your inquiry could not be sent. ";
      status.append(mailtoFallback());
    }
  });
})();
