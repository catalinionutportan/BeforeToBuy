/** Versioning for the public legal and transparency documents. */
export const LEGAL_DOCUMENT_VERSION = "1.0";
export const LEGAL_LAST_UPDATED = "2026-08-10";

export const LEGAL_DRAFT_NOTICE = {
  en: "Published transparency document. Service scope, data sources, commercial relationships, and current limitations are described as they operate today.",
  de: "Veröffentlichtes Transparenzdokument. Leistungsumfang, Datenquellen, Geschäftsbeziehungen und aktuelle Einschränkungen werden in ihrer heutigen Form beschrieben.",
  ro: "Document de transparență publicat. Domeniul serviciului, sursele datelor, relațiile comerciale și limitările actuale sunt descrise conform funcționării de astăzi.",
  fr: "Document de transparence publié. Le périmètre du service, les sources de données, les relations commerciales et les limites actuelles sont décrits tels qu'ils fonctionnent aujourd'hui.",
  it: "Documento di trasparenza pubblicato. Ambito del servizio, fonti dei dati, rapporti commerciali e limiti attuali sono descritti secondo il funzionamento odierno.",
} as const;

export const LEGAL_PAGES = [
  { href: "/impressum", label: "Impressum / Legal Notice", category: "company" },
  { href: "/transparency", label: "Platform notices & transparency", category: "company" },
  { href: "/contact", label: "Contact / legal contact", category: "company" },
  { href: "/terms", label: "Terms & Conditions (AGB)", category: "legal" },
  { href: "/privacy", label: "Privacy Policy (GDPR / nDSG)", category: "legal" },
  { href: "/cookies", label: "Cookie Policy", category: "legal" },
  { href: "/accessibility", label: "Accessibility Statement", category: "legal" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure", category: "commercial" },
  { href: "/disclaimer", label: "Price & Service Disclaimer", category: "commercial" },
  { href: "/policies/comparison", label: "Price comparison policy", category: "commercial" },
  { href: "/policies/editorial", label: "Editorial policy", category: "commercial" },
  { href: "/policies/feeds", label: "Feed policy", category: "commercial" },
  { href: "/policies/merchants", label: "Merchant & stores policy", category: "commercial" },
  { href: "/policies/notifications", label: "Platform notices policy", category: "commercial" },
  { href: "/complaints", label: "Complaints Procedure", category: "support" },
  { href: "/help", label: "Help & FAQ", category: "support" },
  { href: "/status", label: "Platform Status", category: "support" },
  { href: "/stores", label: "Merchant directory", category: "support" },
] as const;

export const RETENTION_SCHEDULE = [
  { data: "Contact form submissions", retention: "Until inquiry resolved + 12 months", legalBasis: "Legitimate interest / contract initiation" },
  { data: "Server / edge logs (Vercel)", retention: "Per Vercel policy (typically days to weeks)", legalBasis: "Security & stability (overriding interest)" },
  { data: "Consent preferences (localStorage + signed cookie)", retention: "Up to 180 days or until cleared", legalBasis: "Consent / essential preferences" },
  { data: "Optional analytics (Datadog RUM)", retention: "Per Datadog retention when opted in", legalBasis: "Consent (Analytics)" },
] as const;

/** High-level processing purposes for privacy transparency (bootstrap hygiene). */
export const PROCESSING_PURPOSES = [
  {
    purpose: "Operate the website, security, and essential consent storage",
    basis: "Overriding interest / essential operation (Swiss nDSG); contract initiation where you contact us",
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
