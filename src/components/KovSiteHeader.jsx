import { useEffect, useRef, useState } from "react";

function absoluteHref(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return url.href;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

function collectNavigation(header) {
  const links = [...header.querySelectorAll("a[href]")]
    .map((anchor) => {
      const href = anchor.getAttribute("href") || "";
      return {
        href: absoluteHref(href),
        label: anchor.innerText.trim().replace(/\s+/g, " "),
        current: anchor.getAttribute("aria-current") === "page",
        isLogo: Boolean(anchor.querySelector("img")),
      };
    })
    .filter((link) => link.href && link.label && !link.href.startsWith("javascript:"));
  const logo = links.find((link) => link.isLogo) || {
    href: "/",
    label: "KOV Career Agency",
  };
  const getLink = (pattern, fallback) =>
    links.find((link) => !link.isLogo && pattern.test(link.label)) || fallback;
  const menuItem = (label, pattern, fallback) => ({
    ...getLink(pattern, { href: fallback }),
    label,
  });
  const group = (label, href, items) => ({ label, href, items });
  const primary = [
    group("Career services", "/candidate-services.html", [
      menuItem("Individual Career Services", /individual career services/i, "/candidate-services.html"),
      menuItem("Private Career Representation", /private career representation/i, "/services.html"),
      menuItem("How It Works", /how it works/i, "/how-it-works.html"),
      menuItem("Pricing", /pricing/i, "/pricing.html"),
      menuItem("FAQs", /^faqs?$/i, "/faqs.html"),
    ]),
    group("Executive Roles", "/roles/", [
      { label: "Browse Executive Roles", href: "/roles/" },
      { label: "Chief Executive Officer (CEO)", href: "/roles/ceo/" },
      { label: "Chief Financial Officer (CFO)", href: "/roles/cfo/" },
      { label: "Chief Information Officer (CIO)", href: "/roles/cio/" },
      { label: "Chief Technology Officer (CTO)", href: "/roles/cto/" },
      { label: "Chief Human Resources Officer (CHRO)", href: "/roles/chro/" },
      { label: "Board Director", href: "/roles/board-director/" },
    ]),
    group("Industries", "/industries/", [
      { label: "Browse Industries", href: "/industries/" },
      { label: "Technology, Media & Telecom", href: "/industries/technology-media-telecom/" },
      { label: "Finance & Insurance", href: "/industries/finance-insurance/" },
      { label: "Energy, Mining & Oil and Gas", href: "/industries/energy-mining-oil-gas/" },
      { label: "Healthcare & Social Care", href: "/industries/healthcare-social-care/" },
      { label: "Legal Services", href: "/industries/legal-services/" },
    ]),
    group("Insights & Resources", "/blog.html", [
      { label: "Blog", href: "/blog.html" },
      { label: "Case Studies", href: "/resources/case-studies.html" },
      { label: "Glossary", href: "/glossary.html" },
      { label: "FAQ Library", href: "/faq/index.html" },
      { label: "All Public Website Sections", href: "/site-directory.html" },
    ]),
    group("Geography and markets", "/countries-we-serve.html", [
      { label: "Countries We Serve", href: "/countries-we-serve.html" },
      { label: "Dubai Market", href: "/markets/executive-job-search-dubai.html" },
      { label: "UAE Market", href: "/markets/executive-job-search-uae.html" },
      { label: "Saudi Arabia Market", href: "/markets/executive-career-support-saudi-arabia.html" },
    ]),
    menuItem("About KOV", /^about(?: kov)?$/i, "/about.html"),
  ];
  const contact = links.find((link) => /contact|get started|start a conversation/i.test(link.label)) ||
    { href: "/contact.html" };
  return { logo, contact, primary };
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="kov-react-nav__search-icon">
    <circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}

function MenuIcon({ open }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="kov-react-nav__menu-icon">
    {open
      ? <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      : <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>;
}

function ChevronIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="kov-react-nav__chevron">
    <path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function KovSiteHeader({ navigation }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        const activePanel = event.target.closest?.(".kov-react-nav__panel");
        if (activePanel) activePanel.parentElement?.querySelector(".kov-react-nav__menu-button")?.focus();
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };
    const closeOnOutsideClick = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, []);
  const closeMenus = () => {
    setMobileOpen(false);
    setOpenMenu(null);
  };

  return <div className="kov-react-nav" ref={navRef}>
    <div className="kov-react-nav__bar">
      <a className="kov-react-nav__brand" href={navigation.logo.href} aria-label="KOV Career Agency home" onClick={closeMenus}>
        <picture className="kov-react-nav__logo">
          <source media="(prefers-color-scheme: dark)" srcSet="/assets/kov-reference/brand-dark.webp" type="image/webp" />
          <img src="/assets/kov-reference/brand-light.webp" alt="KOV Career Agency" width="112" height="49" />
        </picture>
      </a>
      <button
        className="kov-react-nav__mobile-toggle"
        type="button"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="kov-react-nav-links"
        onClick={() => setMobileOpen((value) => !value)}
      >
        <MenuIcon open={mobileOpen} />
      </button>
      <nav id="kov-react-nav-links" className={`kov-react-nav__links${mobileOpen ? " is-open" : ""}`} aria-label="Main navigation">
        {navigation.primary.map((link) => link.items
          ? <div className="kov-react-nav__item" key={link.label}>
            <a
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              onClick={closeMenus}
            >{link.label}</a>
            <button
              className="kov-react-nav__menu-button"
              type="button"
              aria-label={`${openMenu === link.label ? "Close" : "Open"} ${link.label} menu`}
              aria-expanded={openMenu === link.label}
              aria-controls={`kov-react-nav-panel-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              onClick={() => setOpenMenu((current) => current === link.label ? null : link.label)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown") return;
                event.preventDefault();
                setOpenMenu(link.label);
                window.requestAnimationFrame(() => document.getElementById(`kov-react-nav-panel-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)?.querySelector("a")?.focus());
              }}
            ><ChevronIcon /></button>
            <div
              id={`kov-react-nav-panel-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`kov-react-nav__panel${openMenu === link.label ? " is-open" : ""}`}
              aria-label={`${link.label} links`}
            >
              {link.items.map((item) => <a
                className="kov-react-nav__panel-link"
                href={item.href}
                key={`${item.label}-${item.href}`}
                onClick={closeMenus}
              >{item.label}</a>)}
            </div>
          </div>
          : <a
            href={link.href}
            key={`${link.label}-${link.href}`}
            aria-current={link.current ? "page" : undefined}
            onClick={closeMenus}
          >{link.label}</a>)}
        <button
          className="kov-react-nav__search site-search-trigger"
          type="button"
          aria-label="Search the website"
          title="Search the website"
          onClick={closeMenus}
        ><SearchIcon /></button>
        <div className="kov-react-nav__language-slot" data-kov-language-slot aria-label="Website language" />
        <a className="kov-react-nav__cta" href={navigation.contact.href} onClick={closeMenus}>
          Contact Us<span aria-hidden="true">→</span>
        </a>
      </nav>
    </div>
  </div>;
}

export function mountKovSiteHeader() {
  const header = [...document.querySelectorAll("body:not(.backend-page) header")]
    .find((element) => !element.classList.contains("kov-react-nav"));
  if (!header || header.dataset.kovReactHeaderMounted === "true") return false;

  try {
    const navigation = collectNavigation(header);
    const mount = document.createElement("div");
    mount.id = "kov-react-header-root";
    header.insertBefore(mount, header.firstChild);
    const root = window.ReactDOM.createRoot(mount);
    root.render(<KovSiteHeader navigation={navigation} />);
    header.dataset.kovReactHeaderMounted = "true";
    return true;
  } catch (error) {
    console.error("Unable to mount the KOV React navigation:", error);
    return false;
  }
}
