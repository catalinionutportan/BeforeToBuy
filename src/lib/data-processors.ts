import type { SiteLocale } from "@/lib/i18n/locales";
import {
  PROCESSOR_REGISTRY,
  type GdprRole,
  type ProcessorRecord,
} from "@/lib/processor-registry";

export type PublicProcessorKind = "processor" | "independent_controller" | "cdn_recipient";

export type PublicProcessorItem = {
  id: string;
  name: string;
  legalEntity: string;
  kind: PublicProcessorKind;
  roleLabel: string;
  purpose: string;
  projectRegion?: string;
  transferSummary?: string;
  officialDocUrl?: string;
  optional?: boolean;
};

/** Patterns that must never appear on public privacy processor output. */
export const FORBIDDEN_PUBLIC_LEGAL_PATTERNS = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /verify in account/i,
  /de verificat/i,
  /im konto\/dpa/i,
  /à vérifier/i,
  /da verificare/i,
  /\(\s*\)/,
] as const;

const OPTIONAL_PROCESSOR_IDS = new Set<ProcessorRecord["id"]>(["upstash", "datadog", "resend"]);

const PUBLIC_PROCESSOR_IDS = PROCESSOR_REGISTRY.filter((p) => p.category !== "merchant_feed").map(
  (p) => p.id,
);

const ROLE_LABELS: Record<GdprRole, Record<SiteLocale, string>> = {
  processor: {
    en: "Processor",
    de: "Auftragsverarbeiter",
    fr: "Sous-traitant",
    it: "Sub-responsabile del trattamento",
    ro: "Împuternicit (processor)",
  },
  independent_controller: {
    en: "Independent controller",
    de: "Eigenständiger Verantwortlicher",
    fr: "Responsable indépendant",
    it: "Titolare indipendente",
    ro: "Operator independent",
  },
  recipient: {
    en: "Recipient",
    de: "Empfänger",
    fr: "Destinataire",
    it: "Destinatario",
    ro: "Destinatar",
  },
};

const OPTIONAL_NOTE: Record<SiteLocale, string> = {
  en: "Only when configured in production",
  de: "Nur bei Konfiguration in Production",
  fr: "Uniquement s'il est configuré en production",
  it: "Solo se configurato in production",
  ro: "Doar dacă este configurat în production",
};

const OFFICIAL_DOC_LABEL: Record<SiteLocale, string> = {
  en: "Official documentation",
  de: "Offizielle Dokumentation",
  fr: "Documentation officielle",
  it: "Documentazione ufficiale",
  ro: "Documentație oficială",
};

const CONFIRMED_PROJECT_REGION: Partial<Record<ProcessorRecord["id"], Record<SiteLocale, string>>> = {
  supabase: {
    en: "AWS eu-west-1 (Ireland)",
    de: "AWS eu-west-1 (Irland)",
    fr: "AWS eu-west-1 (Irlande)",
    it: "AWS eu-west-1 (Irlanda)",
    ro: "AWS eu-west-1 (Irlanda)",
  },
};

const TRANSFER_SUMMARY: Partial<Record<ProcessorRecord["id"], Record<SiteLocale, string>>> = {
  vercel: {
    en: "Processing may occur globally, including the United States. Transfers rely on EU Standard Contractual Clauses (2021/914), UK IDTA, and related addenda (Vercel DPA Schedule 3).",
    de: "Verarbeitung kann weltweit, einschließlich der USA, erfolgen. Übermittlungen stützen sich auf EU-Standardvertragsklauseln (2021/914), UK IDTA und zugehörige Addenda (Vercel DPA Schedule 3).",
    fr: "Le traitement peut avoir lieu dans le monde entier, y compris aux États-Unis. Les transferts reposent sur les clauses contractuelles types de l'UE (2021/914), l'IDTA britannique et les addenda associés (Vercel DPA Schedule 3).",
    it: "L'elaborazione può avvenire a livello globale, inclusi gli Stati Uniti. I trasferimenti si basano sulle Clausole Contrattuali Standard UE (2021/914), UK IDTA e addenda correlati (Vercel DPA Schedule 3).",
    ro: "Prelucrarea poate avea loc la nivel global, inclusiv în Statele Unite. Transferurile se bazează pe Clauzele Contractuale Standard UE (2021/914), UK IDTA și addenda conexe (Vercel DPA Schedule 3).",
  },
  supabase: {
    en: "Processing may also use Supabase and sub-processor facilities worldwide. Transfers rely on Standard Contractual Clauses and UK/Swiss addenda (Supabase DPA §12).",
    de: "Die Verarbeitung kann auch Einrichtungen von Supabase und Unterauftragsverarbeitern weltweit nutzen. Übermittlungen stützen sich auf Standardvertragsklauseln und UK/Schweizer-Addenda (Supabase DPA §12).",
    fr: "Le traitement peut également utiliser les installations de Supabase et de sous-traitants dans le monde entier. Les transferts reposent sur les clauses contractuelles types et les addenda UK/Suisse (Supabase DPA §12).",
    it: "L'elaborazione può utilizzare anche strutture Supabase e sub-responsabili in tutto il mondo. I trasferimenti si basano sulle Clausole Contrattuali Standard e addenda UK/Svizzera (Supabase DPA §12).",
    ro: "Prelucrarea poate utiliza și facilități Supabase și sub-împuterniciți la nivel mondial. Transferurile se bazează pe Clauze Contractuale Standard și addenda UK/Elveția (Supabase DPA §12).",
  },
  upstash: {
    en: "Processing may occur globally; Upstash, Inc. in the United States may receive European data. Transfers rely on Standard Contractual Clauses and the UK Transfer Addendum (Upstash DPA).",
    de: "Verarbeitung kann weltweit erfolgen; Upstash, Inc. in den USA kann europäische Daten erhalten. Übermittlungen stützen sich auf Standardvertragsklauseln und das UK Transfer Addendum (Upstash DPA).",
    fr: "Le traitement peut avoir lieu dans le monde entier ; Upstash, Inc. aux États-Unis peut recevoir des données européennes. Les transferts reposent sur les clauses contractuelles types et l'addendum de transfert UK (Upstash DPA).",
    it: "L'elaborazione può avvenire a livello globale; Upstash, Inc. negli Stati Uniti può ricevere dati europei. I trasferimenti si basano sulle Clausole Contrattuali Standard e l'Addendum UK (Upstash DPA).",
    ro: "Prelucrarea poate avea loc la nivel global; Upstash, Inc. din Statele Unite poate primi date europene. Transferurile se bazează pe Clauze Contractuale Standard și Addendum UK (Upstash DPA).",
  },
  datadog: {
    en: "Processing uses Datadog and sub-processor infrastructure globally. Transfers rely on Standard Contractual Clauses and the UK Transfer Addendum (Datadog DPA §10).",
    de: "Die Verarbeitung nutzt Datadog- und Unterauftragsverarbeiter-Infrastruktur weltweit. Übermittlungen stützen sich auf Standardvertragsklauseln und das UK Transfer Addendum (Datadog DPA §10).",
    fr: "Le traitement utilise l'infrastructure Datadog et de sous-traitants dans le monde entier. Les transferts reposent sur les clauses contractuelles types et l'addendum de transfert UK (Datadog DPA §10).",
    it: "L'elaborazione utilizza Datadog e infrastrutture sub-responsabili a livello globale. I trasferimenti si basano sulle Clausole Contrattuali Standard e l'Addendum UK (Datadog DPA §10).",
    ro: "Prelucrarea folosește Datadog și infrastructura sub-împuterniciților la nivel global. Transferurile se bazează pe Clauze Contractuale Standard și Addendum UK (Datadog DPA §10).",
  },
  resend: {
    en: "Processing may occur in the United States and other sub-processor locations. Transfers rely on EU Standard Contractual Clauses and the UK addendum (Resend DPA §6).",
    de: "Verarbeitung kann in den USA und anderen Unterauftragsverarbeiter-Standorten erfolgen. Übermittlungen stützen sich auf EU-Standardvertragsklauseln und das UK-Addendum (Resend DPA §6).",
    fr: "Le traitement peut avoir lieu aux États-Unis et dans d'autres sites de sous-traitants. Les transferts reposent sur les clauses contractuelles types de l'UE et l'addendum UK (Resend DPA §6).",
    it: "L'elaborazione può avvenire negli Stati Uniti e in altre sedi sub-responsabili. I trasferimenti si basano sulle Clausole Contrattuali Standard UE e l'addendum UK (Resend DPA §6).",
    ro: "Prelucrarea poate avea loc în Statele Unite și alte locații ale sub-împuterniciților. Transferurile se bazează pe Clauzele Contractuale Standard UE și addendum UK (Resend DPA §6).",
  },
};

const PROCESSOR_PURPOSES: Record<ProcessorRecord["id"], Record<SiteLocale, string>> = {
  vercel: {
    en: "Hosting, CDN, and server logs",
    de: "Hosting, CDN und Server-Logs",
    fr: "Hébergement, CDN et journaux serveur",
    it: "Hosting, CDN e log server",
    ro: "Hosting, CDN și log-uri server",
  },
  supabase: {
    en: "Product catalogue database (Prisma)",
    de: "Produktkatalog-Datenbank (Prisma)",
    fr: "Base de données du catalogue produit (Prisma)",
    it: "Database del catalogo prodotti (Prisma)",
    ro: "Baza de date a catalogului de produse (Prisma)",
  },
  upstash: {
    en: "Rate-limit counters and price-history cache",
    de: "Rate-Limit-Zähler und Preisverlaufs-Cache",
    fr: "Compteurs de limitation de débit et cache d'historique de prix",
    it: "Contatori rate-limit e cache storico prezzi",
    ro: "Contoare rate-limit și cache istoric prețuri",
  },
  datadog: {
    en: "Browser RUM and performance monitoring with Analytics consent",
    de: "Browser-RUM und Performance-Monitoring mit Analytics-Einwilligung",
    fr: "RUM navigateur et supervision des performances avec consentement Analytics",
    it: "Browser RUM e monitoraggio prestazionale con consenso Analytics",
    ro: "Browser RUM și monitorizare de performanță cu consimțământ Analytics",
  },
  resend: {
    en: "Contact-form email delivery",
    de: "E-Mail-Zustellung für Kontaktformulare",
    fr: "Envoi des e-mails du formulaire de contact",
    it: "Consegna email del modulo di contatto",
    ro: "Livrarea emailurilor din formularul de contact",
  },
  "2performant": {
    en: "Affiliate tracking for Rowenta.ro and Scule365.ro outbound links with Affiliate consent",
    de: "Affiliate-Tracking für Rowenta.ro- und Scule365.ro-Links mit Affiliate-Einwilligung",
    fr: "Suivi d'affiliation pour les liens Rowenta.ro et Scule365.ro avec consentement Affiliation",
    it: "Tracking affiliato per link Rowenta.ro e Scule365.ro con consenso Affiliazione",
    ro: "Tracking afiliat pentru linkurile Rowenta.ro și Scule365.ro cu consimțământ Afiliat",
  },
  awin: {
    en: "Affiliate tracking for Seentat UK, Geepas UK, Arlo UK, Ottocast US, Acer CH, and other joined AWIN programmes with Affiliate consent",
    de: "Affiliate-Tracking für Seentat UK, Geepas UK, Arlo UK, Ottocast US, Acer CH und weitere AWIN-Programme mit Affiliate-Einwilligung",
    fr: "Suivi d'affiliation pour Seentat UK, Geepas UK, Arlo UK, Ottocast US, Acer CH et autres programmes AWIN rejoints avec consentement Affiliation",
    it: "Tracking affiliato per Seentat UK, Geepas UK, Arlo UK, Ottocast US, Acer CH e altri programmi AWIN aderenti con consenso Affiliazione",
    ro: "Tracking afiliat pentru Seentat UK, Geepas UK, Arlo UK, Ottocast US, Acer CH și alte programe AWIN acceptate cu consimțământ Afiliat",
  },
  "feed-rowenta-2p": {
    en: "Server-side catalogue import for Rowenta.ro",
    de: "Serverseitiger Katalogimport für Rowenta.ro",
    fr: "Import catalogue côté serveur pour Rowenta.ro",
    it: "Import catalogo lato server per Rowenta.ro",
    ro: "Import catalog server-side pentru Rowenta.ro",
  },
  "feed-scule365-2p": {
    en: "Server-side catalogue import for Scule365.ro",
    de: "Serverseitiger Katalogimport für Scule365.ro",
    fr: "Import catalogue côté serveur pour Scule365.ro",
    it: "Import catalogo lato server per Scule365.ro",
    ro: "Import catalog server-side pentru Scule365.ro",
  },
  "feed-seentat-awin": {
    en: "Server-side catalogue import for Seentat UK",
    de: "Serverseitiger Katalogimport für Seentat UK",
    fr: "Import catalogue côté serveur pour Seentat UK",
    it: "Import catalogo lato server per Seentat UK",
    ro: "Import catalog server-side pentru Seentat UK",
  },
  "feed-geepas-awin": {
    en: "Server-side catalogue import for Geepas UK",
    de: "Serverseitiger Katalogimport für Geepas UK",
    fr: "Import catalogue côté serveur pour Geepas UK",
    it: "Import catalogo lato server per Geepas UK",
    ro: "Import catalog server-side pentru Geepas UK",
  },
  "feed-arlo-awin": {
    en: "Server-side catalogue import for Arlo Security UK",
    de: "Serverseitiger Katalogimport für Arlo Security UK",
    fr: "Import catalogue côté serveur pour Arlo Security UK",
    it: "Import catalogo lato server per Arlo Security UK",
    ro: "Import catalog server-side pentru Arlo Security UK",
  },
  "feed-ottocast-awin": {
    en: "Server-side catalogue import for Ottocast US",
    de: "Serverseitiger Katalogimport für Ottocast US",
    fr: "Import catalogue côté serveur pour Ottocast US",
    it: "Import catalogo lato server per Ottocast US",
    ro: "Import catalog server-side pentru Ottocast US",
  },
  "feed-babywalz-awin": {
    en: "Server-side catalogue import for baby-walz CH",
    de: "Serverseitiger Katalogimport für baby-walz CH",
    fr: "Import catalogue côté serveur pour baby-walz CH",
    it: "Import catalogo lato server per baby-walz CH",
    ro: "Import catalog server-side pentru baby-walz CH",
  },
  "feed-reifencom-awin": {
    en: "Server-side catalogue import for Reifen.com CH",
    de: "Serverseitiger Katalogimport für Reifen.com CH",
    fr: "Import catalogue côté serveur pour Reifen.com CH",
    it: "Import catalogo lato server per Reifen.com CH",
    ro: "Import catalog server-side pentru Reifen.com CH",
  },
  "feed-belando-awin": {
    en: "Server-side catalogue import for Belando CH",
    de: "Serverseitiger Katalogimport für Belando CH",
    fr: "Import catalogue côté serveur pour Belando CH",
    it: "Import catalogo lato server per Belando CH",
    ro: "Import catalog server-side pentru Belando CH",
  },
  "feed-acer-awin": {
    en: "Server-side catalogue import for Acer CH",
    de: "Serverseitiger Katalogimport für Acer CH",
    fr: "Import catalogue côté serveur pour Acer CH",
    it: "Import catalogo lato server per Acer CH",
    ro: "Import catalog server-side pentru Acer CH",
  },
  "feed-evomag-2p": {
    en: "Soft-paused server-side catalogue import for evoMAG",
    de: "Soft-pausierter serverseitiger Katalogimport für evoMAG",
    fr: "Import catalogue côté serveur en soft-pause pour evoMAG",
    it: "Import catalogo lato server in soft-pause per evoMAG",
    ro: "Import catalog server-side soft-paused pentru evoMAG",
  },
  "merchant-cdn-images": {
    en: "Essential product image delivery; the visitor browser may send IP, user-agent, and technical metadata to approved hosts",
    de: "Wesentliche Produktbildauslieferung; der Browser des Besuchers kann IP, User-Agent und technische Metadaten an freigegebene Hosts senden",
    fr: "Livraison essentielle d'images produit ; le navigateur du visiteur peut envoyer IP, user-agent et métadonnées techniques aux hôtes approuvés",
    it: "Consegna essenziale di immagini prodotto; il browser del visitatore può inviare IP, user-agent e metadati tecnici agli host approvati",
    ro: "Livrarea esențială a imaginilor de produs; browserul vizitatorului poate trimite IP, user-agent și metadate tehnice către host-uri aprobate",
  },
};

const PROCESSOR_DISPLAY_NAMES: Partial<
  Record<ProcessorRecord["id"], Partial<Record<SiteLocale, string>>>
> = {
  "merchant-cdn-images": {
    de: "Freigegebene Händler-/CDN-Bildhosts",
    fr: "Hôtes d'images marchands/CDN approuvés",
    it: "Host immagini merchant/CDN approvati",
    ro: "Host-uri de imagini comerciant/CDN aprobate",
  },
};

function resolveKind(processor: ProcessorRecord): PublicProcessorKind {
  if (processor.category === "affiliate_network") return "independent_controller";
  if (processor.category === "merchant_cdn") return "cdn_recipient";
  return "processor";
}

function resolveDisplayName(processor: ProcessorRecord, locale: SiteLocale): string {
  return PROCESSOR_DISPLAY_NAMES[processor.id]?.[locale] ?? processor.displayName;
}

function hasConfirmedTransferSummary(processor: ProcessorRecord): boolean {
  return processor.transferCountries.confirmed && processor.transferMechanism.confirmed;
}

function buildPublicItem(processor: ProcessorRecord, locale: SiteLocale): PublicProcessorItem {
  const role = processor.role.confirmed ? processor.role.value : "processor";
  const item: PublicProcessorItem = {
    id: processor.id,
    name: resolveDisplayName(processor, locale),
    legalEntity: processor.legalEntity.confirmed ? processor.legalEntity.value : processor.displayName,
    kind: resolveKind(processor),
    roleLabel: ROLE_LABELS[role][locale],
    purpose: PROCESSOR_PURPOSES[processor.id][locale],
    optional: OPTIONAL_PROCESSOR_IDS.has(processor.id),
  };

  if (processor.projectRegion.confirmed && CONFIRMED_PROJECT_REGION[processor.id]?.[locale]) {
    item.projectRegion = CONFIRMED_PROJECT_REGION[processor.id]![locale];
  }

  if (hasConfirmedTransferSummary(processor) && TRANSFER_SUMMARY[processor.id]?.[locale]) {
    item.transferSummary = TRANSFER_SUMMARY[processor.id]![locale];
  }

  if (processor.officialDocUrl) {
    item.officialDocUrl = processor.officialDocUrl;
  }

  return item;
}

export function buildLocalizedDataProcessors(locale: SiteLocale): PublicProcessorItem[] {
  return PROCESSOR_REGISTRY.filter((p) => p.category !== "merchant_feed").map((p) =>
    buildPublicItem(p, locale),
  );
}

export function buildMerchantFeedIntegrations(locale: SiteLocale): PublicProcessorItem[] {
  return PROCESSOR_REGISTRY.filter((p) => p.category === "merchant_feed").map((p) =>
    buildPublicItem(p, locale),
  );
}

export function getPublicPrivacyProcessorIds(): ProcessorRecord["id"][] {
  return PUBLIC_PROCESSOR_IDS;
}

export function containsForbiddenPublicLegalText(text: string): boolean {
  return FORBIDDEN_PUBLIC_LEGAL_PATTERNS.some((pattern) => pattern.test(text));
}

export function getProcessorUiLabels(locale: SiteLocale) {
  return {
    optionalNote: OPTIONAL_NOTE[locale],
    officialDocLabel: OFFICIAL_DOC_LABEL[locale],
  };
}

/** @deprecated Use PublicProcessorItem — kept for type re-exports during migration. */
export type ProcessorItem = PublicProcessorItem;
