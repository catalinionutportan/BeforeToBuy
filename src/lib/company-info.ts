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

/**
 * Monetization notice — reuse on legal/commercial pages.
 * Keep in sync with AFFILIATE_NETWORKS_ACTIVE.
 */
export const STAGE_ZERO_MONETIZATION = {
  en: "BeforeToBuy.com has limited live affiliate redirects in Romania: evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home & MxEnduro via 2Performant (with Affiliate cookie consent). Other markets remain planned. We only compare and redirect; checkout is always on the merchant site. We may earn a referral commission from the merchant or network — we do not add a BeforeToBuy fee to your price. Scule365 uses a live Google Merchant product feed when configured; other RO merchants still show demo prices until their feeds are connected.",
  de: "BeforeToBuy.com hat begrenzte Live-Affiliate-Weiterleitungen in Rumänien: evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home & MxEnduro über 2Performant (mit Affiliate-Cookie-Zustimmung). Andere Märkte sind geplant. Wir vergleichen und leiten nur weiter; der Kaufabschluss erfolgt stets beim Händler. Wir können eine Vermittlungsprovision erhalten — ohne BeforeToBuy-Aufschlag. Scule365 nutzt bei Konfiguration einen Live-Google-Merchant-Feed; andere RO-Händler bleiben Demo, bis Feeds verbunden sind.",
  fr: "BeforeToBuy.com a des redirections d'affiliation limitées en Roumanie : evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home & MxEnduro via 2Performant (avec consentement cookies Affilié). Les autres marchés restent prévus. Nous comparons et redirigeons seulement ; le paiement a toujours lieu chez le marchand. Nous pouvons recevoir une commission — sans frais BeforeToBuy. Scule365 utilise un flux Google Merchant live lorsqu'il est configuré ; les autres marchands RO restent en démo jusqu'à leurs flux.",
  it: "BeforeToBuy.com ha redirect affiliati limitati in Romania: evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home & MxEnduro via 2Performant (con consenso cookie Affiliato). Altri mercati restano pianificati. Confrontiamo e reindirizziamo soltanto; il checkout è sempre sul sito del rivenditore. Possiamo ricevere una commissione — senza ricarico BeforeToBuy. Scule365 usa un feed Google Merchant live quando configurato; gli altri merchant RO restano demo fino ai loro feed.",
  ro: "BeforeToBuy.com are redirecționări afiliate live limitate în România: evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home & MxEnduro via 2Performant (cu consimțământ cookie Afiliat). Alte piețe rămân planificate. Doar comparăm și redirecționăm; plata se face mereu pe site-ul magazinului. Putem primi comision de recomandare — fără adaos BeforeToBuy. Scule365 folosește feed Google Merchant live când e configurat; celelalte magazine RO rămân demo până la feed-urile lor.",
} as const;

/** Networks with at least one live consented outbound program. */
export const AFFILIATE_NETWORKS_ACTIVE = [
  "2Performant Romania (evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus, PAA-Home, MxEnduro)",
] as const;

export const AFFILIATE_NETWORKS_PLANNED = [
  "AWIN Comparison Engine / Publisher (CH / DE / FR / UK)",
  "Amazon Associates (via official portal)",
  "Additional 2Performant RO merchants",
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
  { name: "Upstash Redis", purpose: "Optional rate-limit counters and price-history cache (when configured)", region: "USA/EU" },
  { name: "ipapi.co", purpose: "IP geolocation (with Location consent)", region: "EU" },
  { name: "OpenStreetMap Nominatim", purpose: "Reverse geocoding (with Location consent)", region: "EU" },
  { name: "Datadog", purpose: "Optional browser RUM / performance monitoring (with Analytics consent)", region: "USA/EU" },
  { name: "Resend", purpose: "Contact form email delivery (when configured)", region: "USA" },
  { name: "AWIN / merchant partners", purpose: "Affiliate tracking on merchant domains when production feeds are configured (with Affiliate consent)", region: "Various" },
  { name: "2Performant", purpose: "Affiliate tracking for evoMAG.ro, Rowenta.ro, Scule365.ro, AutoEco.ro, Soundhouse.ro, Autobob.ro, Automobilus.ro, PAA-Home.ro and MxEnduro.ro outbound links (with Affiliate consent)", region: "RO/EU" },
  { name: "Scule365 Google Merchant feed", purpose: "Product catalog and prices for Scule365.ro (outbound clicks still via 2Performant)", region: "RO/EU" },
] as const;
