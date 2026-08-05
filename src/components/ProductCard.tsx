import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale, DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { useMemo } from "react";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardPickupOffer } from "./ProductCardPickupOffer";
import { ProductCardOffers } from "./ProductCardOffers";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(/\/$/, "");

function toJsonLdScript(data: unknown): string {
  // Prevent </script> breakout inside JSON-LD payloads.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

interface ProductCardProps {
  product: Product;
  userLocation: UserLocation;
  onSelectOffer: (product: Product, offer: Offer) => void;
  locale?: SiteLocale;
}

export function ProductCard({
  product,
  userLocation,
  onSelectOffer,
  locale,
}: ProductCardProps) {
  const resolvedLocale = locale ?? defaultLocaleFromCountry(userLocation.countryCode);
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;

  const sortedOffers = useMemo(() => sortOffersByTotalPrice(product.offers), [product.offers]);
  const feedOffers = useMemo(() => sortedOffers.filter((offer) => offer.source !== "demo"), [sortedOffers]);
  const schemaOffers = useMemo(
    () => (feedOffers.length > 0 ? feedOffers : sortedOffers),
    [feedOffers, sortedOffers]
  );
  const lowestFeedTotal = useMemo(
    () => (feedOffers[0] ? feedOffers[0].totalPrice ?? computeTotalPrice(feedOffers[0]) : undefined),
    [feedOffers]
  );
  const lowestSchemaTotal = useMemo(
    () => (schemaOffers[0] ? schemaOffers[0].totalPrice ?? computeTotalPrice(schemaOffers[0]) : undefined),
    [schemaOffers]
  );
  const highestSchemaTotal = useMemo(() => {
    const last = schemaOffers[schemaOffers.length - 1];
    return last ? last.totalPrice ?? computeTotalPrice(last) : lowestSchemaTotal;
  }, [schemaOffers, lowestSchemaTotal]);
  const verifiedBadgeOffer = useMemo(() => {
    const offer = feedOffers.find((item) => item.badge);
    return offer?.badge ? { badge: offer.badge } : undefined;
  }, [feedOffers]);

  const pickupOffer = useMemo(
    () =>
      product.offers.find(
        (o) => o.source === "production-live" && o.type === "local_pickup" && o.nearbyBranch
      ),
    [product.offers]
  );
  const freshestLabel = useMemo(
    () => formatOfferFreshness(getFreshestOfferTimestamp(product.offers)) ?? "",
    [product.offers]
  );

  const productPath =
    resolvedLocale === DEFAULT_LOCALE ? `/p/${product.id}` : `/${resolvedLocale}/p/${product.id}`;
  const productUrl = `${SITE_URL}${productPath}`;

  const jsonLd = useMemo(
    () =>
      toJsonLdScript({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        image: product.image,
        description: product.description,
        sku: product.id,
        ...(product.gtin ? { gtin: product.gtin, mpn: product.gtin } : {}),
        brand: {
          "@type": "Brand",
          name: product.brand,
        },
        offers: {
          "@type": "AggregateOffer",
          url: productUrl,
          priceCurrency: currentCountryInfo.currency,
          ...(lowestSchemaTotal != null ? { lowPrice: lowestSchemaTotal } : {}),
          ...(highestSchemaTotal != null ? { highPrice: highestSchemaTotal } : {}),
          offerCount: schemaOffers.length,
          offers: schemaOffers.map((offer) => ({
            "@type": "Offer",
            url: offer.purchaseUrl,
            priceCurrency: offer.currency,
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
        ...(product.rating && product.reviewsCount
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewsCount,
              },
            }
          : {}),
      }),
    [
      product,
      productUrl,
      currentCountryInfo.currency,
      lowestSchemaTotal,
      highestSchemaTotal,
      schemaOffers,
    ]
  );

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ProductCardImage product={product} locale={resolvedLocale} verifiedBadgeOffer={verifiedBadgeOffer} />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <ProductCardDetails product={product} locale={resolvedLocale} freshestLabel={freshestLabel} />

        <ProductCardPickupOffer
          pickupOffer={pickupOffer}
          userLocation={userLocation}
          locale={resolvedLocale}
        />

        <ProductCardOffers
          product={product}
          userLocation={userLocation}
          onSelectOffer={onSelectOffer}
          locale={resolvedLocale}
          sortedOffers={sortedOffers}
          lowestFeedTotal={lowestFeedTotal}
        />
      </div>
    </article>
  );
}
