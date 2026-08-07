"use client";

import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { useMemo } from "react";
import Link from "next/link";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardPickupOffer } from "./ProductCardPickupOffer";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { productPagePath } from "@/lib/seo/site-url";

interface ProductCardProps {
  product: Product;
  userLocation: UserLocation;
  onSelectOffer?: (product: Product, offer: Offer) => void;
  locale?: SiteLocale;
}

export function ProductCard({
  product,
  userLocation,
  locale,
}: ProductCardProps) {
  const resolvedLocale = locale ?? defaultLocaleFromCountry(userLocation.countryCode);
  const currencySymbol =
    (COUNTRIES[userLocation.countryCode] || COUNTRIES.CH).currencySymbol;

  const sortedOffers = useMemo(() => sortOffersByTotalPrice(product.offers), [product.offers]);
  const feedOffers = useMemo(
    () => sortedOffers.filter((offer) => offer.source !== "demo"),
    [sortedOffers]
  );
  const lowestOffer = sortedOffers[0];
  const lowestTotal = lowestOffer
    ? lowestOffer.totalPrice ?? computeTotalPrice(lowestOffer)
    : undefined;
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
  const lowestPriceLabel =
    lowestTotal != null ? `${currencySymbol}${lowestTotal.toLocaleString()}` : undefined;

  return (
    <article className="bg-white rounded-xl md:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group h-full">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-label={
          lowestPriceLabel
            ? `${product.title} — ${lowestPriceLabel}`
            : product.title
        }
      >
        <ProductCardImage
          product={product}
          locale={resolvedLocale}
          verifiedBadgeOffer={verifiedBadgeOffer}
          lowestPriceLabel={lowestPriceLabel}
          offerCount={product.offers.length}
        />
      </Link>

      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-3 md:gap-4">
        <Link
          href={href}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
        >
          <ProductCardDetails
            product={product}
            locale={resolvedLocale}
            freshestLabel={freshestLabel}
          />
        </Link>

        {pickupOffer && (
          <div className="hidden md:block">
            <ProductCardPickupOffer
              pickupOffer={pickupOffer}
              userLocation={userLocation}
              locale={resolvedLocale}
            />
          </div>
        )}
      </div>
    </article>
  );
}
