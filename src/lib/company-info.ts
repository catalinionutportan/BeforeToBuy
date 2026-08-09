/** Single source of truth for company and legal entity data on BeforeToBuy.com.
 * Registry fields aligned with SHAB / help.ch Neueintrag publication HR01-1006718835 (29.07.2026).
 */
export const COMPANY = {
  legalName: "PortanX - Catalin Portan",
  tradeName: "PortanX",
  platformName: "BeforeToBuy.com",
  legalForm: {
    en: "Sole proprietorship (Einzelunternehmen)",
    de: "Einzelunternehmen",
    fr: "Entreprise individuelle",
    it: "Ditta individuale",
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
    formattedDe: "Flurstrasse 24, 3014 Bern",
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
  /** Cantonal company ID (CH-ID), separate from SHAB Meldungsnummer. */
  hrNumber: "CH-036.1.108.540-6",
  commercialRegistry: "Handelsregisteramt des Kantons Bern",
  registrationDate: "2026-07-24",
  registryPublication: {
    registerCategory: "Handelsregistereintragungen",
    subcategory: "Neueintrag",
    publicationDate: "2026-07-29",
    publicationDateDisplay: "SHAB 29.07.2026",
    shabMessageNumber: "HR01-1006718835",
    dailyRegisterNumber: "14193",
    dailyRegisterDate: "2026-07-24",
    dailyRegisterDisplay: "Tagesregister-Nr. 14193 vom 24.07.2026",
    publishingOffice:
      "Bundesamt für Justiz (BJ), Eidgenössisches Amt für das Handelsregister",
    publishingOfficeAddress: "Bundesrain 20, 3003 Bern",
    registryOffice: "Handelsregisteramt des Kantons Bern",
    noticeTitle: "Neueintragung PortanX - Catalin Portan, Bern",
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
    fr: "Développement de logiciels, d'applications mobiles, de plateformes web et de services numériques.",
    it: "Sviluppo di software, app mobili, piattaforme web e servizi digitali.",
    ro: "Dezvoltare de software, aplicații mobile, platforme web și servicii digitale.",
  },
  /** Official SHAB Neueintrag body (German), for impressum / diligence pages. */
  shabNoticeDe:
    "PortanX - Catalin Portan, in Bern, CHE-373.501.736, Flurstrasse 24, 3014 Bern, Einzelunternehmen (Neueintragung). Zweck: Entwicklung von Software, mobilen Apps, Webplattformen und digitalen Dienstleistungen. Eingetragene Personen: Portan, Catalin Ionut, rumänischer Staatsangehöriger, in Bern, Inhaber, mit Einzelunterschrift. Tagesregister-Nr. 14193 vom 24.07.2026. Kontaktstelle: Handelsregisteramt des Kantons Bern.",
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
  en: "BeforeToBuy.com currently has live merchant programmes via AWIN in the United Kingdom (Seentat) and via 2Performant in Romania (Rowenta), each with a live product feed and affiliate deep links when Affiliate cookie consent is granted. Other merchants are added only after acceptance and feed wiring. Other markets remain planned. We only compare and redirect; checkout is always on the merchant site. We may earn a referral commission from the merchant or network — we do not add a BeforeToBuy fee to your price.",
  de: "BeforeToBuy.com hat derzeit Live-Händlerprogramme über AWIN im Vereinigten Königreich (Seentat) und über 2Performant in Rumänien (Rowenta), jeweils mit Live-Produktfeed und Affiliate-Deep-Links bei Affiliate-Cookie-Zustimmung. Weitere Händler werden erst nach Freigabe und Feed-Anbindung ergänzt. Andere Märkte sind geplant. Wir vergleichen und leiten nur weiter; der Kaufabschluss erfolgt stets beim Händler. Wir können eine Vermittlungsprovision erhalten — ohne BeforeToBuy-Aufschlag.",
  fr: "BeforeToBuy.com a actuellement des programmes marchands live via AWIN au Royaume-Uni (Seentat) et via 2Performant en Roumanie (Rowenta), chacun avec flux produit live et liens affiliés lorsque le consentement cookies Affilié est accordé. Les autres marchands sont ajoutés uniquement après acceptation et branchement du flux. Les autres marchés restent prévus. Nous comparons et redirigeons seulement ; le paiement a toujours lieu chez le marchand. Nous pouvons recevoir une commission — sans frais BeforeToBuy.",
  it: "BeforeToBuy.com ha attualmente programmi merchant live via AWIN nel Regno Unito (Seentat) e via 2Performant in Romania (Rowenta), ciascuno con feed prodotti live e deep link affiliati con consenso cookie Affiliato. Altri merchant vengono aggiunti solo dopo accettazione e collegamento del feed. Altri mercati restano pianificati. Confrontiamo e reindirizziamo soltanto; il checkout è sempre sul sito del rivenditore. Possiamo ricevere una commissione — senza ricarico BeforeToBuy.",
  ro: "BeforeToBuy.com are momentan programe merchant live via AWIN în Regatul Unit (Seentat) și via 2Performant în România (Rowenta), fiecare cu feed de produse live și deep link-uri afiliate când există consimțământ cookie Afiliat. Alte magazine se adaugă doar după acceptare și conectarea feed-ului. Alte piețe rămân planificate. Doar comparăm și redirecționăm; plata se face mereu pe site-ul magazinului. Putem primi comision de recomandare — fără adaos BeforeToBuy.",
} as const;

/** Networks with at least one live consented outbound program. */
export const AFFILIATE_NETWORKS_ACTIVE = [
  "2Performant Romania (Rowenta)",
  "AWIN UK (Seentat)",
] as const;

export const AFFILIATE_NETWORKS_PLANNED = [
  "AWIN Comparison Engine / Publisher (CH / DE / FR / additional UK)",
  "Amazon Associates (via official portal)",
  "Additional 2Performant RO merchants (when accepted + feed ready)",
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
  { name: "2Performant", purpose: "Affiliate tracking for Rowenta.ro outbound links (with Affiliate consent)", region: "RO/EU" },
  { name: "AWIN", purpose: "Affiliate tracking for Seentat UK and other joined AWIN programmes (with Affiliate consent)", region: "UK/EU" },
  { name: "Rowenta 2Performant product feed", purpose: "Product catalog and prices for Rowenta.ro (affiliate deep links from 2Performant My Feeds)", region: "RO/EU" },
  { name: "Seentat AWIN product feed", purpose: "Product catalog and prices for Seentat UK (affiliate deep links from AWIN)", region: "UK/EU" },
] as const;
