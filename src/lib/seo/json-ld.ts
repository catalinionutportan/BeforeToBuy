import type { Offer, Product } from "@/types";
import type { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { COMPANY } from "@/lib/company-info";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { getSiteUrl, productPageUrl } from "@/lib/seo/site-url";

export { toJsonLdScript, productPagePath, productPageUrl, getSiteUrl } from "@/lib/seo/site-url";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.platformName,
    legalName: COMPANY.legalName,
    url: getSiteUrl(),
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      addressLocality: COMPANY.address.city,
      addressCountry: COMPANY.address.countryCode,
    },
    identifier: COMPANY.uid,
  };
}

export function buildWebSiteJsonLd() {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.platformName,
    url: site,
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

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image ? [product.image] : undefined,
    description: product.description,
    sku: product.id,
    ...(product.gtin ? { gtin: product.gtin, mpn: product.gtin } : {}),
    brand: {
      "@type": "Brand",
      name: product.brand,
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
