import type { Offer, Product } from "@/types";
import type { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { COMPANY } from "@/lib/company-info";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { getSiteUrl, productPageUrl } from "@/lib/seo/site-url";

export { toJsonLdScript, productPagePath, productPageUrl, getSiteUrl } from "@/lib/seo/site-url";

const ORGANIZATION_ID = "#organization";
const WEBSITE_ID = "#website";

function organizationId(): string {
  return `${getSiteUrl()}/${ORGANIZATION_ID}`;
}

function websiteId(): string {
  return `${getSiteUrl()}/${WEBSITE_ID}`;
}

export function buildOrganizationJsonLd() {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineBusiness"],
    "@id": organizationId(),
    name: COMPANY.platformName,
    alternateName: [...COMPANY.brandAliases],
    legalName: COMPANY.legalName,
    url: site,
    logo: {
      "@type": "ImageObject",
      url: `${site}/beforetobuy-logo.png`,
    },
    image: `${site}/beforetobuy-logo.png`,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    founder: {
      "@type": "Person",
      name: COMPANY.owner,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      addressLocality: COMPANY.address.city,
      addressCountry: COMPANY.address.countryCode,
    },
    identifier: COMPANY.uid,
    sameAs: [COMPANY.website, COMPANY.platformUrl],
    areaServed: TARGET_AREA,
    description:
      "Swiss price-comparison platform. We list partner-store offers; checkout is always on the merchant site.",
  };
}

const TARGET_AREA = [
  { "@type": "Country", name: "Switzerland" },
  { "@type": "Country", name: "Romania" },
  { "@type": "Country", name: "United Kingdom" },
  { "@type": "Country", name: "United States" },
];

export function buildWebSiteJsonLd() {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(),
    name: COMPANY.brandNameSpaced,
    alternateName: [...COMPANY.brandAliases],
    url: site,
    inLanguage: ["en", "de", "fr", "it", "ro"],
    publisher: { "@id": organizationId() },
    description:
      "Compare prices from partner stores on BeforeToBuy.com. Operated in Bern by PortanX - Catalin Portan.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFaqPageJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildProductJsonLd(
  product: Product,
  options: {
    countryCode: CountryCode;
    locale?: string;
    offers?: Offer[];
  }
) {
  const country = COUNTRIES[options.countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  const offers = options.offers ?? product.offers;
  // Only expose production-feed offers in structured data — never demo/sample as authoritative prices.
  const schemaOffers = offers.filter((o) => o.source === "production-live");
  const totals = schemaOffers.map((o) => o.totalPrice ?? computeTotalPrice(o));
  const lowPrice = totals.length ? Math.min(...totals) : undefined;
  const highPrice = totals.length ? Math.max(...totals) : undefined;
  const url = productPageUrl(product.id, options.locale);
  const comparisonBlurb = `Price comparison for ${product.title} on ${COMPANY.platformName}. Checkout on the merchant site.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image ? [product.image] : undefined,
    description: product.description?.trim() || comparisonBlurb,
    sku: product.id,
    ...(product.gtin ? { gtin: product.gtin, mpn: product.gtin } : {}),
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    publisher: { "@id": organizationId() },
    isPartOf: { "@id": websiteId() },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
      name: `${product.title} | ${COMPANY.platformName}`,
      isPartOf: { "@id": websiteId() },
      publisher: { "@id": organizationId() },
    },
    ...(schemaOffers.length > 0
      ? {
          offers: {
            "@type": "AggregateOffer",
            url,
            priceCurrency: country.currency,
            ...(lowPrice != null ? { lowPrice } : {}),
            ...(highPrice != null ? { highPrice } : {}),
            offerCount: schemaOffers.length,
            offers: schemaOffers.map((offer) => ({
              "@type": "Offer",
              url: offer.purchaseUrl.startsWith("http") ? offer.purchaseUrl : url,
              priceCurrency: offer.currency || country.currency,
              price: offer.totalPrice ?? computeTotalPrice(offer),
              availability: offer.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: offer.storeName,
              },
            })),
          },
        }
      : {}),
    // Demo/sample catalog ratings are illustrative — do not publish AggregateRating.
  };
}
