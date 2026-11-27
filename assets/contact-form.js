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
    select.add(new Option("Fees and engagement scope", "pricing"));
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
    formNote.textContent = "Submitting opens your email app with your inquiry addressed directly to daniel@kovcareeragency.org. You do not need to attach a CV or share confidential information for an initial inquiry.";
  }

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
    ["pricing", "Fees and engagement scope"],
  ]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const body = [
      `First name: ${field("FirstName")}`,
      `Last name: ${field("LastName")}`,
      `Email: ${field("Email")}`,
      `Career stage: ${field("Audience")}`,
      `Service of interest: ${serviceLabels.get(field("ServiceInterest")) || "Not specified"}`,
      field("Message"),
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:daniel@kovcareeragency.org?subject=${encodeURIComponent("Contact Inquiry")}&body=${encodeURIComponent(body)}`;
  });
})();
