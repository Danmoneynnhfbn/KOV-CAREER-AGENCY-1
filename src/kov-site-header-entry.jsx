import React from "react";
import { createRoot } from "react-dom/client";
import { mountKovSiteHeader } from "./components/KovSiteHeader";
import { mountKovHomepageShowcase } from "./components/KovHomepageShowcase";

window.ReactDOM = { createRoot };

function mountCandidateProjectDirectoryFeature() {
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return false;

  const main = document.querySelector("body:not(.backend-page) main");
  if (!main || main.querySelector("[data-kov-candidate-directory-feature]")) return false;

  const alreadyLinked = [...main.querySelectorAll("a[href]")].some((link) => {
    try {
      return new URL(link.getAttribute("href"), window.location.href).pathname === "/resources/candidate-project-directory";
    } catch {
      return false;
    }
  });
  if (alreadyLinked) return false;

  const feature = document.createElement("section");
  feature.className = "kov-home-candidate-directory border-b border-line/60 bg-cream/70";
  feature.setAttribute("data-kov-candidate-directory-feature", "");
  feature.innerHTML = `
    <div class="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div class="grid gap-8 rounded-2xl border border-ink/15 bg-background p-8 lg:grid-cols-12 lg:items-center lg:p-10">
        <div class="lg:col-span-8">
          <p class="text-xs font-bold uppercase tracking-widest text-orange">Candidate Project Directory</p>
          <h2 class="mt-4 text-4xl font-bold text-ink">Explore professional projects across global markets.</h2>
          <p class="mt-4 max-w-3xl leading-8 text-ink-soft">Browse professional roles, industries, skills, service areas and career project examples across 146 countries.</p>
        </div>
        <div class="lg:col-span-4 lg:flex lg:justify-end">
          <a class="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-cream" href="/resources/candidate-project-directory">Explore the Directory <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  `;

  const preferredSection = [...main.querySelectorAll("h1, h2, h3")].find((heading) =>
    /choose your career support/i.test(heading.textContent.trim())
  )?.closest("section");
  const hero = main.querySelector(".kov-home-hero, .kov-reference-home__hero");
  const insertionPoint = preferredSection || hero;
  if (insertionPoint?.parentNode === main) insertionPoint.insertAdjacentElement("afterend", feature);
  else main.insertBefore(feature, main.children[1] || null);
  return true;
}

function start() {
  mountKovSiteHeader();
  mountKovHomepageShowcase();
  mountCandidateProjectDirectoryFeature();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
