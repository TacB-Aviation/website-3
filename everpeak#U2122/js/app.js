// ============================================================
//  ID LOOKUP — APPLICATION LOGIC
//  Handles rendering cards and the live search feature.
//  You shouldn't need to edit this file directly.
// ============================================================

import EMPLOYEES from "./employees.js";
import CONFIG    from "./config.js";

// ── Apply config values to CSS custom properties ────────────
function applyTheme() {
  const root = document.documentElement;
  const c = CONFIG.colors;
  root.style.setProperty("--color-bg",           c.background);
  root.style.setProperty("--color-primary",       c.primary);
  root.style.setProperty("--color-accent",        c.accent);
  root.style.setProperty("--color-card-bg",       c.cardBg);
  root.style.setProperty("--color-card-border",   c.cardBorder);
  root.style.setProperty("--color-text-primary",  c.textPrimary);
  root.style.setProperty("--color-text-muted",    c.textMuted);
  root.style.setProperty("--color-highlight",     c.highlight);
}

// ── Inject branding text ─────────────────────────────────────
function applyBranding() {
  document.querySelector("#logo-initials").textContent  = CONFIG.logoInitials;
  document.querySelector("#company-name").textContent   = CONFIG.companyName;
  document.querySelector("#tagline").textContent        = CONFIG.tagline;
  document.querySelector("#search-input").placeholder   = CONFIG.searchPlaceholder;
  document.querySelector("#footer-text").textContent    = CONFIG.footerText;
  document.querySelector("#employee-count").textContent = EMPLOYEES.length;
  document.title = CONFIG.companyName;

  // Set grid columns
  const grid = document.querySelector("#employee-grid");
  grid.style.gridTemplateColumns = `repeat(${CONFIG.cardsPerRow}, 1fr)`;
}

// ── Build a single employee card ─────────────────────────────
function buildCard(employee) {
  const initials = employee.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const card = document.createElement("div");
  card.className = "employee-card";
  card.dataset.searchIndex = [
    employee.name,
    employee.eid,
    employee.role,
    employee.email,
  ].join(" ").toLowerCase();

  card.innerHTML = `
    <div class="card-avatar">${initials}</div>
    <div class="card-body">
      <p class="card-name">${employee.name}</p>
      <span class="card-eid">${employee.eid}</span>
      <p class="card-role">${employee.role}</p>
      <a class="card-email" href="mailto:${employee.email}">${employee.email}</a>
    </div>
  `;

  return card;
}

// ── Render all cards into the grid ──────────────────────────
function renderCards(list) {
  const grid    = document.querySelector("#employee-grid");
  const empty   = document.querySelector("#empty-state");
  const counter = document.querySelector("#result-count");

  grid.innerHTML = "";

  if (list.length === 0) {
    empty.hidden = false;
    counter.textContent = "0 results";
    return;
  }

  empty.hidden = true;
  counter.textContent = `${list.length} of ${EMPLOYEES.length} employees`;

  list.forEach(emp => grid.appendChild(buildCard(emp)));
}

// ── Live search filter ───────────────────────────────────────
function initSearch() {
  const input = document.querySelector("#search-input");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();

    const filtered = query
      ? EMPLOYEES.filter(emp =>
          [emp.name, emp.eid, emp.role, emp.email]
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      : EMPLOYEES;

    renderCards(filtered);
  });
}

// ── Boot ─────────────────────────────────────────────────────
function init() {
  applyTheme();
  applyBranding();
  renderCards(EMPLOYEES);
  initSearch();
}

document.addEventListener("DOMContentLoaded", init);
