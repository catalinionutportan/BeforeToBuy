export type PolicySlug =
  | "comparison"
  | "editorial"
  | "feeds"
  | "merchants"
  | "notifications";

export type PolicyDoc = {
  slug: PolicySlug;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
};

export const POLICY_PAGES: Record<PolicySlug, PolicyDoc> = {
  comparison: {
    slug: "comparison",
    title: "Price comparison policy",
    description:
      "How BeforeToBuy.com presents comparable merchant offers without operating checkout.",
    sections: [
      {
        heading: "Purpose",
        body: "BeforeToBuy.com helps users compare listed prices and offers from partner or demo merchants, then redirects them to the merchant site to buy. We do not sell products or process payments.",
      },
      {
        heading: "What we show",
        body: "We display product information, listed prices, and merchant labels available to our catalog. Totals may exclude VAT, customs, or shipping that only appear at merchant checkout.",
      },
      {
        heading: "Ranking & selection",
        body: "Default ordering prioritizes useful comparison (including lower listed prices where sort/filter allows). We do not guarantee that the lowest listed price is the best total cost after shipping or taxes.",
      },
      {
        heading: "Merchant authority",
        body: "The merchant website is authoritative for final price, stock, delivery, and contract terms. Always confirm before purchase.",
      },
    ],
  },
  editorial: {
    slug: "editorial",
    title: "Editorial policy",
    description: "Independence and labeling standards for BeforeToBuy comparison content.",
    sections: [
      {
        heading: "Independence",
        body: "Comparison presentation is operated by PortanX - Catalin Portan. Affiliate commissions may apply after consented outbound clicks, but we do not add a BeforeToBuy fee to the price you pay at the merchant.",
      },
      {
        heading: "Labeling",
        body: "Offers are labeled Production feed, Sample, or Demo so users and partners can distinguish live data from illustrative catalog rows.",
      },
      {
        heading: "Corrections",
        body: "If you find a misleading label or broken offer link, contact admin@portanx.com with the page URL and merchant name.",
      },
    ],
  },
  feeds: {
    slug: "feeds",
    title: "Feed policy",
    description: "Meaning of production-feed, sample, and demo catalog entries.",
    sections: [
      {
        heading: "Production feed",
        body: "Data from a configured merchant product feed. Closer to live catalog data, but may lag behind the merchant website.",
      },
      {
        heading: "Sample",
        body: "Illustrative test data used for demos and integration checks. Not live merchant pricing for purchase decisions.",
      },
      {
        heading: "Demo",
        body: "Generated catalog examples for UX and partner demonstrations. Always verify on the merchant site.",
      },
      {
        heading: "Live Romania feeds today",
        body: "Rowenta and Scule365 via 2Performant product feeds when Affiliate consent is granted. Other merchants are added after acceptance and feed wiring.",
      },
    ],
  },
  merchants: {
    slug: "merchants",
    title: "Merchant & stores policy",
    description: "How merchants appear in BeforeToBuy and when affiliate programs go live.",
    sections: [
      {
        heading: "Directory",
        body: "The merchant directory may list current and planned stores. Presence in the directory does not always mean a live affiliate or production feed is active.",
      },
      {
        heading: "Going live",
        body: "A merchant becomes a live production-feed entry only after acceptance, technical feed wiring, and appropriate consent categories for outbound links.",
      },
      {
        heading: "Responsibility",
        body: "Orders, shipping, returns, warranties, and payments are solely between the user and the merchant.",
      },
    ],
  },
  notifications: {
    slug: "notifications",
    title: "Platform notices policy",
    description: "How operator and beta notices are published for users and partners.",
    sections: [
      {
        heading: "Where notices live",
        body: "Operator notices, registry summaries, and commercial disclaimers are published on dedicated pages (Transparency, Disclaimer, Impressum) and indexed from Legal & Companie.",
      },
      {
        heading: "Beta honesty",
        body: "During Beta/Demo we disclose sample/demo limits rather than implying full live coverage in every market.",
      },
      {
        heading: "Updates",
        body: "When feed status or affiliate coverage changes, we update the relevant legal/commercial pages and platform status notes.",
      },
    ],
  },
};

export const POLICY_SLUGS = Object.keys(POLICY_PAGES) as PolicySlug[];

export function isPolicySlug(value: string): value is PolicySlug {
  return value in POLICY_PAGES;
}
