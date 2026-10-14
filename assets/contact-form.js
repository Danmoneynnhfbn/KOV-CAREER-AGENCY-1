(() => {
  const form = document.querySelector('form[action^="mailto:"]');
  if (!(form instanceof HTMLFormElement)) return;

  const status = document.createElement("p");
  status.className = "text-sm text-ink-soft";
  status.setAttribute("aria-live", "polite");
  status.setAttribute("role", "status");
  status.hidden = true;
  form.append(status);

  const field = (name) => String(new FormData(form).get(name) || "").trim();
  const mailtoFallback = () => {
    const body = Array.from(new FormData(form).entries())
      .filter(([, value]) => String(value).trim())
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");
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

    const countryCode = field("PhoneCountryCode");
    const phoneNumber = field("PhoneNumber");
    const payload = {
      first_name: field("FirstName"),
      last_name: field("LastName"),
      email: field("Email"),
      audience: field("Audience"),
      phone: [countryCode, phoneNumber].filter(Boolean).join(" ") || null,
      target_role: field("TargetRole"),
      salary_range: field("SalaryRange") || null,
      linkedin_url: field("LinkedInURL") || null,
      message: field("Message") || null,
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
