/** Full Legal & Company index — every auditor-facing link in one place. */

export type LegalIndexItem = {
  href: string;
  label: string;
  description: string;
};

export type LegalIndexSection = {
  id: string;
  title: string;
  items: LegalIndexItem[];
};

export const LEGAL_COMPANY_SECTIONS: LegalIndexSection[] = [
  {
    id: "company",
    title: "Company & registration",
    items: [
      {
        href: "/impressum",
        label: "Impressum / Legal notice",
        description: "Operator identity, address, UID, HR, SHAB publication, and business purpose.",
      },
      {
        href: "/transparency",
        label: "Platform notices & transparency",
        description: "Operator notice, affiliate zero-markup, and price verification.",
      },
      {
        href: "/about",
        label: "About BeforeToBuy",
        description: "Product positioning: a PortanX platform for smart price comparison.",
      },
      {
        href: "/contact",
        label: "Contact / legal contact",
        description: "Reach PortanX - Catalin Portan for legal, privacy, and partnership requests.",
      },
    ],
  },
  {
    id: "legal",
    title: "Legal & privacy",
    items: [
      {
        href: "/terms",
        label: "Terms & Conditions (AGB)",
        description: "Rules for using BeforeToBuy.com as a comparison and redirect helper.",
      },
      {
        href: "/privacy",
        label: "Privacy Policy (GDPR / nDSG)",
        description: "Personal data, processors, retention, DSAR rights under Swiss nDSG and GDPR where applicable.",
      },
      {
        href: "/cookies",
        label: "Cookie Policy",
        description: "Essential, Affiliate, and Analytics cookie categories.",
      },
      {
        href: "/accessibility",
        label: "Accessibility statement",
        description: "WCAG goals, known limitations, and how to report barriers.",
      },
      {
        href: "/complaints",
        label: "Complaints procedure",
        description: "How to raise concerns about the platform (not merchant order issues).",
      },
    ],
  },
  {
    id: "commercial",
    title: "Commercial & affiliate",
    items: [
      {
        href: "/affiliate-disclosure",
        label: "Affiliate disclosure",
        description: "How referral commissions work — free for consumers, no BeforeToBuy markup.",
      },
      {
        href: "/disclaimer",
        label: "Price & service disclaimer",
        description: "Sample/demo limits, sample vs production feeds, merchant checkout authority.",
      },
      {
        href: "/policies/comparison",
        label: "Price comparison policy",
        description: "How we present and rank comparable offers across merchants.",
      },
      {
        href: "/policies/editorial",
        label: "Editorial policy",
        description: "Independence of comparison presentation from merchant checkout.",
      },
      {
        href: "/policies/feeds",
        label: "Feed policy",
        description: "Production-feed, sample, and demo labels — what each means.",
      },
      {
        href: "/policies/merchants",
        label: "Merchant & stores policy",
        description: "How merchants appear in the directory and when feeds go live.",
      },
      {
        href: "/policies/notifications",
        label: "Platform notices policy",
        description: "How we publish operator and service notices for users and partners.",
      },
    ],
  },
  {
    id: "support",
    title: "Support & directory",
    items: [
      {
        href: "/help",
        label: "Help & FAQ",
        description: "Common questions including lowest-price comparison and privacy.",
      },
      {
        href: "/status",
        label: "Platform status",
        description: "Operational status of feeds and known limitations.",
      },
      {
        href: "/stores",
        label: "Merchant directory",
        description: "Stores and markets covered or planned.",
      },
      {
        href: "/categories",
        label: "Categories",
        description: "Browse taxonomy used for comparison navigation.",
      },
    ],
  },
];
