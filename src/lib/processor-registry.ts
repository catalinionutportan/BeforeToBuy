export type ProcessorCategory =
  | "infrastructure"
  | "optional_infrastructure"
  | "affiliate_network"
  | "merchant_feed"
  | "merchant_cdn";

export type GdprRole = "processor" | "independent_controller" | "recipient";

export type VerifiedField<T> = {
  value: T;
  confirmed: boolean;
  sourceUrl: string;
  verifiedAt: string;
  /** Internal note for compliance docs; not shown on public pages. */
  verificationNote?: string;
};

export type ProcessorRecord = {
  id: string;
  category: ProcessorCategory;
  displayName: string;
  legalEntity: VerifiedField<string>;
  role: VerifiedField<GdprRole>;
  projectRegion: VerifiedField<string | null>;
  transferCountries: VerifiedField<string>;
  transferMechanism: VerifiedField<string>;
  retention: VerifiedField<string>;
  officialDocUrl: string;
  verifiedAt: string;
};

/** ISO date for this production-readiness review pass. */
export const PROCESSOR_REGISTRY_REVIEW_DATE = "2026-08-10";

const unconfirmedRegion = (verificationNote: string): VerifiedField<null> => ({
  value: null,
  confirmed: false,
  sourceUrl: "",
  verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  verificationNote,
});

const unconfirmedText = (verificationNote: string): VerifiedField<string> => ({
  value: "",
  confirmed: false,
  sourceUrl: "",
  verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  verificationNote,
});

export const PROCESSOR_REGISTRY: ProcessorRecord[] = [
  {
    id: "vercel",
    category: "infrastructure",
    displayName: "Vercel Inc.",
    legalEntity: {
      value: "Vercel Inc. (Delaware corporation)",
      confirmed: true,
      sourceUrl: "https://vercel.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "processor",
      confirmed: true,
      sourceUrl: "https://vercel.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "DPA Section 6 — Processor for Pro and Enterprise plans.",
    },
    projectRegion: unconfirmedRegion(
      "Confirm deployment/processing region in Vercel project Settings → General and DPA Schedule 1.",
    ),
    transferCountries: {
      value: "Global infrastructure; US and other countries per Vercel sub-processors",
      confirmed: true,
      sourceUrl: "https://vercel.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Schedule 3 — International Provisions (SCCs, UK IDTA).",
    },
    transferMechanism: {
      value: "EU Standard Contractual Clauses (2021/914), UK IDTA, and jurisdiction-specific addenda per DPA Schedule 3",
      confirmed: true,
      sourceUrl: "https://vercel.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Per Agreement term; deletion/return per DPA Section 11 after termination unless law requires retention",
      confirmed: true,
      sourceUrl: "https://vercel.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://vercel.com/legal/dpa",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "supabase",
    category: "infrastructure",
    displayName: "Supabase",
    legalEntity: {
      value: "Supabase Pte. Ltd. (Singapore)",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "processor",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "DPA Section 2 — processor/service provider.",
    },
    projectRegion: {
      value: "AWS eu-west-1 (Ireland)",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote:
        "Confirmed from local DATABASE_URL Supabase pooler hostname suffix aws-1-eu-west-1.pooler.supabase.com (August 2026).",
    },
    transferCountries: {
      value: "Facilities of Supabase and authorized sub-processors worldwide; primary project region eu-west-1",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "DPA clause 6.1 — may process anywhere sub-processors maintain facilities.",
    },
    transferMechanism: {
      value: "Standard Contractual Clauses (EU 2021/914) and UK/Swiss addenda per DPA clause 12",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "For Agreement term; deletion/return per DPA and Customer instructions after termination",
      confirmed: true,
      sourceUrl: "https://supabase.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://supabase.com/legal/dpa",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "upstash",
    category: "optional_infrastructure",
    displayName: "Upstash Redis",
    legalEntity: {
      value: "Upstash, Inc. (Delaware corporation)",
      confirmed: true,
      sourceUrl: "https://upstash.com/static/trust/dpa.pdf",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "processor",
      confirmed: true,
      sourceUrl: "https://upstash.com/static/trust/dpa.pdf",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion(
      "Confirm Redis database region in Upstash console when/if enabled in production.",
    ),
    transferCountries: {
      value: "Global processing; US recipient (Upstash, Inc.) for European data per DPA Section 3",
      confirmed: true,
      sourceUrl: "https://upstash.com/static/trust/dpa.pdf",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    transferMechanism: {
      value: "Standard Contractual Clauses and UK Transfer Addendum per DPA Annex 2",
      confirmed: true,
      sourceUrl: "https://upstash.com/static/trust/dpa.pdf",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Per Agreement; deletion/return per DPA unless law requires retention",
      confirmed: true,
      sourceUrl: "https://upstash.com/static/trust/dpa.pdf",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://upstash.com/static/trust/dpa.pdf",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "datadog",
    category: "optional_infrastructure",
    displayName: "Datadog",
    legalEntity: {
      value: "Datadog, Inc. (Delaware corporation)",
      confirmed: true,
      sourceUrl: "https://www.datadoghq.com/legal/data-processing-addendum/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "processor",
      confirmed: true,
      sourceUrl: "https://www.datadoghq.com/legal/data-processing-addendum/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "DPA Section 1 — Processor for Customer Personal Data.",
    },
    projectRegion: unconfirmedRegion(
      "Confirm Datadog site (e.g. datadoghq.com vs datadoghq.eu) and org region in account settings.",
    ),
    transferCountries: {
      value: "Per Datadog sub-processors and service infrastructure (global)",
      confirmed: true,
      sourceUrl: "https://www.datadoghq.com/legal/subprocessors/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    transferMechanism: {
      value: "Standard Contractual Clauses, UK Transfer Addendum, and Swiss modifications per DPA Section 10",
      confirmed: true,
      sourceUrl: "https://www.datadoghq.com/legal/data-processing-addendum/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Per Agreement and DPA; deletion per Customer instructions and applicable law",
      confirmed: true,
      sourceUrl: "https://www.datadoghq.com/legal/data-processing-addendum/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://www.datadoghq.com/legal/data-processing-addendum/",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "resend",
    category: "optional_infrastructure",
    displayName: "Resend",
    legalEntity: {
      value: "Plus Five Five, Inc. (Resend)",
      confirmed: true,
      sourceUrl: "https://resend.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "processor",
      confirmed: true,
      sourceUrl: "https://resend.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "DPA Section 2 — Company is processor unless expressly controller.",
    },
    projectRegion: unconfirmedRegion("Confirm Resend account/data region in Resend dashboard when configured."),
    transferCountries: {
      value: "US and other countries per Resend sub-processors",
      confirmed: true,
      sourceUrl: "https://resend.com/legal/subprocessors",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    transferMechanism: {
      value: "EU Standard Contractual Clauses and UK SCC addendum per DPA Section 6",
      confirmed: true,
      sourceUrl: "https://resend.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Return or delete Customer Personal Data after Services unless law requires retention (DPA Section 2.4)",
      confirmed: true,
      sourceUrl: "https://resend.com/legal/dpa",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://resend.com/legal/dpa",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "2performant",
    category: "affiliate_network",
    displayName: "2Performant",
    legalEntity: {
      value: "2Performant Network S.A. (Romania)",
      confirmed: true,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "independent_controller",
      confirmed: true,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Privacy Policy — 2Performant is a data controller under GDPR for affiliate tracking.",
    },
    projectRegion: unconfirmedRegion("Confirm processing locations in 2Performant publisher/advertiser contract or DPA."),
    transferCountries: {
      value: "EU/EEA and other countries per 2Performant privacy policy and affiliate terms",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "General policy only; specific transfer countries require contract review.",
    },
    transferMechanism: {
      value: "Not verified for BeforeToBuy account — review publisher agreement / any DPA",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Per 2Performant privacy policy and affiliate terms (not account-specific)",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://2performant.com/privacy-policy/",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "awin",
    category: "affiliate_network",
    displayName: "AWIN",
    legalEntity: {
      value: "AWIN AG (Germany)",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "independent_controller",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Privacy Policy — Awin is data controller where it decides purpose/means of processing.",
    },
    projectRegion: unconfirmedRegion(
      "AWIN AG registered in Germany (privacy policy DPO address); confirm publisher account processing locations separately.",
    ),
    transferCountries: {
      value: "EU/EEA and third countries per Awin privacy policy and publisher terms",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Confirm specific third-country transfers in publisher agreement.",
    },
    transferMechanism: {
      value: "Not verified for BeforeToBuy publisher account — review Awin publisher contract",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    retention: {
      value: "Per Awin privacy policy and tracking cookie documentation",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-rowenta-2p",
    category: "merchant_feed",
    displayName: "Rowenta 2Performant product feed",
    legalEntity: {
      value: "Rowenta (merchant) via 2Performant feed infrastructure",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Merchant legal entity not verified for feed endpoint.",
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Product feed import — merchant/catalog data recipient, not BeforeToBuy processor.",
    },
    projectRegion: unconfirmedRegion("Confirm feed hosting region in 2Performant merchant/feed settings."),
    transferCountries: unconfirmedText("Confirm feed download origin and any third-country hosting."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Catalogue data retained per BeforeToBuy retention schedule; feed source retention unverified."),
    officialDocUrl: "https://2performant.com/privacy-policy/",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-scule365-2p",
    category: "merchant_feed",
    displayName: "Scule365 2Performant product feed",
    legalEntity: {
      value: "Scule365 (merchant) via 2Performant feed infrastructure",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm feed hosting region in 2Performant merchant/feed settings."),
    transferCountries: unconfirmedText("Confirm feed download origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://2performant.com/privacy-policy/",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-seentat-awin",
    category: "merchant_feed",
    displayName: "Seentat AWIN product feed",
    legalEntity: {
      value: "Seentat (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-geepas-awin",
    category: "merchant_feed",
    displayName: "Geepas AWIN product feed",
    legalEntity: {
      value: "Geepas (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-arlo-awin",
    category: "merchant_feed",
    displayName: "Arlo Security UK AWIN product feed",
    legalEntity: {
      value: "Arlo (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-ottocast-awin",
    category: "merchant_feed",
    displayName: "Ottocast AWIN product feed",
    legalEntity: {
      value: "Ottocast (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-dji-awin",
    category: "merchant_feed",
    displayName: "DJI US AWIN product feed",
    legalEntity: {
      value: "DJI (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-babywalz-awin",
    category: "merchant_feed",
    displayName: "baby-walz CH AWIN product feed",
    legalEntity: {
      value: "baby-walz (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-reifencom-awin",
    category: "merchant_feed",
    displayName: "Reifen.com CH AWIN product feed",
    legalEntity: {
      value: "Reifen.com (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-belando-awin",
    category: "merchant_feed",
    displayName: "Belando CH AWIN product feed",
    legalEntity: {
      value: "Belando (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-acer-awin",
    category: "merchant_feed",
    displayName: "Acer CH AWIN product feed",
    legalEntity: {
      value: "Acer (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-gigasport-awin",
    category: "merchant_feed",
    displayName: "Gigasport CH AWIN product feed",
    legalEntity: {
      value: "Gigasport (merchant) via AWIN product feed",
      confirmed: false,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://www.awin.com/gb/legal/privacy-policy",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Confirm AWIN feed/datafeed region in publisher account."),
    transferCountries: unconfirmedText("Confirm feed hosting and merchant data origin."),
    transferMechanism: unconfirmedText("Feed transfer mechanism not documented for this integration."),
    retention: unconfirmedText("Feed source retention unverified."),
    officialDocUrl: "https://www.awin.com/gb/legal/privacy-policy",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "feed-evomag-2p",
    category: "merchant_feed",
    displayName: "evoMAG 2Performant product feed",
    legalEntity: {
      value: "evoMAG (merchant) via 2Performant feed infrastructure",
      confirmed: false,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "https://2performant.com/privacy-policy/",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
    },
    projectRegion: unconfirmedRegion("Soft-paused source — confirm region if re-enabled."),
    transferCountries: unconfirmedText("Soft-paused source."),
    transferMechanism: unconfirmedText("Soft-paused source."),
    retention: unconfirmedText("Soft-paused source."),
    officialDocUrl: "https://2performant.com/privacy-policy/",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
  {
    id: "merchant-cdn-images",
    category: "merchant_cdn",
    displayName: "Approved merchant/CDN image hosts",
    legalEntity: {
      value: "Various merchants and CDNs on the feed-url-policy allowlist",
      confirmed: false,
      sourceUrl: "",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Per-host legal entities vary; maintain allowlist in feed-url-policy.",
    },
    role: {
      value: "recipient",
      confirmed: true,
      sourceUrl: "",
      verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
      verificationNote: "Essential image delivery to end-user browsers — independent recipients, not BeforeToBuy processors.",
    },
    projectRegion: unconfirmedRegion("Per-host CDN/merchant regions — sync with feed-url-policy allowlist review."),
    transferCountries: unconfirmedText("Per approved image host."),
    transferMechanism: unconfirmedText("Per approved image host."),
    retention: unconfirmedText("Browser/CDN caching only; no BeforeToBuy storage of image request metadata beyond logs."),
    officialDocUrl: "",
    verifiedAt: PROCESSOR_REGISTRY_REVIEW_DATE,
  },
];

export function getProcessorById(id: string): ProcessorRecord | undefined {
  return PROCESSOR_REGISTRY.find((p) => p.id === id);
}

export function getMerchantFeedProcessorRecords(): ProcessorRecord[] {
  return PROCESSOR_REGISTRY.filter((p) => p.category === "merchant_feed");
}

export function getPublicPrivacyProcessorRecords(): ProcessorRecord[] {
  return PROCESSOR_REGISTRY.filter((p) => p.category !== "merchant_feed");
}
