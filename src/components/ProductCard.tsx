"use client";

import { Offer, Product, UserLocation } from "@/types";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { useMemo } from "react";
import Link from "next/link";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardPickupOffer } from "./ProductCardPickupOffer";
import { ProductCardOffers } from "./ProductCardOffers";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { productPagePath } from "@/lib/seo/site-url";

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

  const sortedOffers = useMemo(() => sortOffersByTotalPrice(product.offers), [product.offers]);
  const feedOffers = useMemo(
    () => sortedOffers.filter((offer) => offer.source !== "demo"),
    [sortedOffers]
  );
  const lowestFeedTotal = useMemo(
    () => (feedOffers[0] ? feedOffers[0].totalPrice ?? computeTotalPrice(feedOffers[0]) : undefined),
    [feedOffers]
  );
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

  const href = productPagePath(product.id, resolvedLocale);

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        <ProductCardImage product={product} locale={resolvedLocale} verifiedBadgeOffer={verifiedBadgeOffer} />
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
          <ProductCardDetails product={product} locale={resolvedLocale} freshestLabel={freshestLabel} />
        </Link>

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
