import { Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale, DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardPickupOffer } from "./ProductCardPickupOffer";
import { ProductCardOffers } from "./ProductCardOffers";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";


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
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const ui = HOME_UI[locale ?? defaultLocaleFromCountry(userLocation.countryCode)];

  const sortedOffers = sortOffersByTotalPrice(product.offers);
  const feedOffers = sortedOffers.filter((offer) => offer.source !== "demo");
  const lowestFeedTotal = feedOffers[0]
    ? feedOffers[0].totalPrice ?? computeTotalPrice(feedOffers[0])
    : undefined;
  const verifiedBadgeOffer = feedOffers.find((offer) => offer.badge);

  const pickupOffer = product.offers.find(
    (o) => o.source === "production-live" && o.type === "local_pickup" && o.nearbyBranch
  );
  const freshestLabel = formatOfferFreshness(getFreshestOfferTimestamp(product.offers));

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "image": product.image,
            "description": product.description,
            "sku": product.id,
            "mpn": product.gtin, // Assuming GTIN can be used as MPN
            "brand": {
              "@type": "Brand",
              "name": product.brand,
            },
            "offers": {
              "@type": "AggregateOffer",
              "url": `${process.env.NEXT_PUBLIC_SITE_URL}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/p/${product.id}`,
              "priceCurrency": currentCountryInfo.currency,
              "lowPrice": lowestFeedTotal,
              "highPrice": sortedOffers[sortedOffers.length - 1]?.totalPrice ?? lowestFeedTotal,
              "offerCount": product.offers.length,
              "offers": sortedOffers.map((offer) => ({
                "@type": "Offer",
                "url": offer.purchaseUrl,
                "priceCurrency": offer.currency,
                "price": offer.totalPrice ?? computeTotalPrice(offer),
                "itemCondition": "https://schema.org/NewCondition", // Assuming new condition
                "availability": offer.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": offer.storeName,
                },
              })),
            },
            ...(product.rating && product.reviewsCount
              ? {
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": product.rating,
                    "reviewCount": product.reviewsCount,
                  },
                }
              : {}),
          }),
        }}
      />
      <ProductCardImage product={product} locale={locale ?? defaultLocaleFromCountry(userLocation.countryCode)} verifiedBadgeOffer={verifiedBadgeOffer} />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <ProductCardDetails product={product} locale={locale ?? defaultLocaleFromCountry(userLocation.countryCode)} freshestLabel={freshestLabel} />

        <ProductCardPickupOffer
          pickupOffer={pickupOffer}
          userLocation={userLocation}
          locale={locale ?? defaultLocaleFromCountry(userLocation.countryCode)}
        />

        <ProductCardOffers
          product={product}
          userLocation={userLocation}
          onSelectOffer={onSelectOffer}
          locale={locale ?? defaultLocaleFromCountry(userLocation.countryCode)}
          sortedOffers={sortedOffers}
          lowestFeedTotal={lowestFeedTotal}
        />
      </div>
    </article>
  );
}
