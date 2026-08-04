/** Legal document versioning and draft notices — not a substitute for qualified legal review. */
export const LEGAL_DOCUMENT_VERSION = "1.0-draft";
export const LEGAL_LAST_UPDATED = "2026-08-04";

export const LEGAL_DRAFT_NOTICE = {
  en: "Initial draft prepared without qualified legal certification. Before commercial reliance, have these documents reviewed by a Swiss/EU lawyer for your target markets.",
  de: "Erstentwurf ohne qualifizierte Rechtsberatung. Vor geschäftlicher Nutzung sollten diese Dokumente für Ihre Zielmärkte von einem Schweizer/EU-Anwalt geprüft werden.",
  ro: "Draft inițial, fără certificare juridică calificată. Înainte de utilizare comercială, documentele ar trebui revizuite de un avocat elvețian/UE pentru piețele vizate.",
} as const;

export const LEGAL_PAGES = [
  { href: "/impressum", label: "Impressum / Legal Notice", category: "company" },
  { href: "/terms", label: "Terms & Conditions (AGB)", category: "legal" },
  { href: "/privacy", label: "Privacy Policy (Datenschutz)", category: "legal" },
  { href: "/cookies", label: "Cookie Policy", category: "legal" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure", category: "commercial" },
  { href: "/disclaimer", label: "Price & Service Disclaimer", category: "commercial" },
  { href: "/complaints", label: "Complaints Procedure", category: "support" },
  { href: "/accessibility", label: "Accessibility Statement", category: "support" },
  { href: "/help", label: "Help & FAQ", category: "support" },
] as const;

export const RETENTION_SCHEDULE = [
  { data: "Contact form submissions", retention: "Until inquiry resolved + 12 months", legalBasis: "Legitimate interest / contract initiation" },
  { data: "Server / edge logs (Vercel)", retention: "Per Vercel policy (typically days to weeks)", legalBasis: "Security & stability" },
  { data: "Consent preferences (localStorage)", retention: "Until user clears browser storage", legalBasis: "Consent / essential preferences" },
  { data: "IP geolocation (session)", retention: "Not persisted as user profile", legalBasis: "Consent (Location)" },
] as const;

export const DSAR_RESPONSE_DAYS = 30;
