import React from "react";
import { createRoot } from "react-dom/client";
import { mountKovSiteHeader } from "./components/KovSiteHeader";
import { mountKovHomepageShowcase } from "./components/KovHomepageShowcase";

window.ReactDOM = { createRoot };

function start() {
  mountKovSiteHeader();
  mountKovHomepageShowcase();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
