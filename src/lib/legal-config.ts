/** Legal document versioning and draft notices — not a substitute for qualified legal review. */
export const LEGAL_DOCUMENT_VERSION = "1.0-draft";
export const LEGAL_LAST_UPDATED = "2026-08-06";

export const LEGAL_DRAFT_NOTICE = {
  en: "Bootstrap draft (not lawyer-certified). We disclose limits honestly at this stage. A Swiss/EU lawyer review is recommended when revenue allows or before high-risk claims/paid placement.",
  de: "Bootstrap-Entwurf (nicht anwaltsgeprüft). Wir legen Grenzen in dieser Phase ehrlich offen. Eine Prüfung durch einen Schweizer/EU-Anwalt ist empfehlenswert, sobald Einnahmen möglich sind oder vor riskanten Aussagen/bezahlter Platzierung.",
  ro: "Draft de început (fără certificare avocat). La această etapă dezvăluim limitele onest. O revizuire de avocat CH/UE e recomandată când apar venituri sau înainte de afirmații riscante / plasare plătită.",
  fr: "Projet de démarrage (non certifié par un avocat). Nous exposons honnêtement les limites à ce stade. Une revue par un avocat CH/UE est recommandée dès que des revenus le permettent ou avant des allégations à risque / placement payant.",
  it: "Bozza di avvio (non certificata da un avvocato). In questa fase dichiariamo i limiti in modo onesto. Una revisione da avvocato CH/UE è consigliata quando ci saranno ricavi o prima di claim rischiosi / placement a pagamento.",
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
  { href: "/status", label: "Platform Status", category: "support" },
] as const;

export const RETENTION_SCHEDULE = [
  { data: "Contact form submissions", retention: "Until inquiry resolved + 12 months", legalBasis: "Legitimate interest / contract initiation" },
  { data: "Server / edge logs (Vercel)", retention: "Per Vercel policy (typically days to weeks)", legalBasis: "Security & stability (overriding interest)" },
  { data: "Consent preferences (localStorage + signed cookie)", retention: "Up to 180 days or until cleared", legalBasis: "Consent / essential preferences" },
  { data: "IP geolocation (session)", retention: "Not persisted as user profile", legalBasis: "Consent (Location)" },
  { data: "Optional analytics (Datadog RUM)", retention: "Per Datadog retention when opted in", legalBasis: "Consent (Analytics)" },
] as const;

/** High-level processing purposes for privacy transparency (bootstrap hygiene). */
export const PROCESSING_PURPOSES = [
  {
    purpose: "Operate the website, security, and essential consent storage",
    basis: "Overriding interest / essential operation (Swiss nDSG); contract initiation where you contact us",
  },
  {
    purpose: "Optional approximate location (IP/GPS) for local distance estimates",
    basis: "Consent (Location category)",
  },
  {
    purpose: "Optional affiliate outbound linking / merchant partner cookies after you leave",
    basis: "Consent (Affiliate category)",
  },
  {
    purpose: "Optional performance monitoring (Datadog RUM)",
    basis: "Consent (Analytics category)",
  },
] as const;

export const DSAR_RESPONSE_DAYS = 30;
