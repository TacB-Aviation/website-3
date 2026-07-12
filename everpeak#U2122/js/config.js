// ============================================================
//  ID LOOKUP — SITE CONFIGURATION
//  Tweak these settings to customize the look and feel.
// ============================================================

const CONFIG = {

  // ── BRANDING ────────────────────────────────────────────
  companyName:    "ID Lookup",
  tagline:        "Employee Directory",
  logoInitials:   "ID",               // Shown in the top-left badge

  // ── COLORS ──────────────────────────────────────────────
  // These match your brand palette; change hex values here.
  colors: {
    background:   "#ffffff",          // Page background (white)
    primary:      "#262b2b",          // Dark teal-black (nav, headings)
    accent:       "#444444",          // Mid-grey (cards, borders, badges)
    cardBg:       "#f7f7f7",          // Light grey card background
    cardBorder:   "#e0e0e0",          // Subtle card border
    textPrimary:  "#262b2b",          // Main body text
    textMuted:    "#6b7070",          // Secondary / label text
    highlight:    "#2e3636",          // Hover states & active row
  },

  // ── SEARCH ──────────────────────────────────────────────
  searchPlaceholder: "Search by name, EID, or role…",

  // ── CARDS ───────────────────────────────────────────────
  cardsPerRow:    3,    // How many columns on large screens (1, 2, or 3)

  // ── FOOTER ──────────────────────────────────────────────
  footerText: "© 2025 ID Lookup. All rights reserved.",

};

// ============================================================
//  DO NOT EDIT BELOW THIS LINE
// ============================================================
export default CONFIG;
