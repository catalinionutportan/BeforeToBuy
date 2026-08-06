/** Single source of truth for company and legal entity data on BeforeToBuy.com */
export const COMPANY = {
  legalName: "PortanX - Catalin Portan",
  tradeName: "PortanX",
  platformName: "BeforeToBuy.com",
  legalForm: {
    en: "Sole proprietorship (Einzelunternehmen)",
    de: "Einzelunternehmen",
    ro: "Întreprindere individuală",
  },
  owner: "Catalin Ionut Portan",
  address: {
    street: "Flurstrasse 24",
    postalCode: "3014",
    city: "Bern",
    canton: "Bern",
    country: "Switzerland",
    countryCode: "CH",
    formatted: "Flurstrasse 24, CH-3014 Bern, Switzerland",
    formattedDe: "Flurstrasse 24, CH-3014 Bern, Schweiz",
  },
  uid: "CHE-373.501.736",
  /** UID is the Swiss enterprise ID — not a VAT number. Update when VAT-registered. */
  vatStatus: {
    en: "Not VAT-registered (UID is not a MWST/VAT number)",
    de: "Nicht MWST-pflichtig (UID ist keine MWST-Nummer)",
    fr: "Non assujetti à la TVA (l'UID n'est pas un numéro TVA/MWST)",
    it: "Non soggetto a IVA (l'UID non è un numero IVA/MWST)",
    ro: "Neînregistrat în scopuri de TVA (UID nu este număr MWST/TVA)",
  },
  hrNumber: "CH-036.1.108.540-6",
  commercialRegistry: "Handelsregister des Kantons Bern",
  registrationDate: "2026-07-24",
  registryPublication: {
    registerCategory: "Handelsregistereintragungen",
    subcategory: "Neueintrag",
    publicationDate: "2026-07-29",
    shabMessageNumber: "HR01-1006718835",
    dailyRegisterNumber: "14193",
    dailyRegisterDate: "2026-07-24",
    publishingOffice:
      "Bundesamt für Justiz (BJ), Eidgenössisches Amt für das Handelsregister",
    registryOffice: "Handelsregisteramt des Kantons Bern",
  },
  registeredPerson: {
    name: "Portan, Catalin Ionut",
    nationality: "Romanian",
    nationalityDe: "rumänischer Staatsangehöriger",
    residence: "Bern",
    role: "Inhaber",
    signingAuthority: "Einzelunterschrift",
  },
  email: "admin@portanx.com",
  phone: "+41 78 310 33 17",
  phoneHref: "tel:+41783103317",
  website: "https://portanx.com",
  platformUrl: "https://www.beforetobuy.com",
  businessPurpose: {
    en: "Development of software, mobile apps, web platforms and digital services.",
    de: "Entwicklung von Software, mobilen Apps, Webplattformen und digitalen Dienstleistungen.",
  },
} as const;

export const LEGAL_CONTACT = {
  privacy: COMPANY.email,
  legal: COMPANY.email,
  complaints: COMPANY.email,
  dsar: COMPANY.email,
} as const;

export const TARGET_MARKETS = [
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
] as const;

/** Networks we may apply to via official publisher portals (not all live yet). */
export const AFFILIATE_NETWORKS_ACTIVE = [] as const;

export const AFFILIATE_NETWORKS_PLANNED = [
  "AWIN Comparison Engine / Publisher (CH / DE / FR / UK)",
  "Amazon Associates (via official portal)",
  "2Performant / Profitshare (RO)",
  "Tradedoubler (where Galaxus AT/DE affiliate is offered)",
  "CJ Affiliate (if approved)",
  "Effinity (FR, if approved)",
] as const;

/** @deprecated Prefer ACTIVE + PLANNED split; kept for existing pages. */
export const AFFILIATE_NETWORKS = [
  ...AFFILIATE_NETWORKS_ACTIVE,
  ...AFFILIATE_NETWORKS_PLANNED.map((name) => `${name} (planned)`),
] as const;

export const DATA_PROCESSORS = [
  { name: "Vercel Inc.", purpose: "Hosting, CDN, server logs", region: "USA/EU" },
  { name: "ipapi.co", purpose: "IP geolocation (with Location consent)", region: "EU" },
  { name: "OpenStreetMap Nominatim", purpose: "Reverse geocoding (with Location consent)", region: "EU" },
  { name: "Datadog", purpose: "Optional browser RUM / performance monitoring (with Analytics consent)", region: "USA/EU" },
  { name: "Resend", purpose: "Contact form email delivery (when configured)", region: "USA" },
  { name: "AWIN / merchant partners", purpose: "Affiliate tracking on merchant domains (with Affiliate consent)", region: "Various" },
] as const;
