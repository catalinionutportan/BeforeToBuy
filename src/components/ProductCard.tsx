"use client";

import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { useMemo } from "react";
import Link from "next/link";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { ProductCardPickupOffer } from "./ProductCardPickupOffer";
import { ProductCardOffers } from "./ProductCardOffers";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { productPagePathWithReturn } from "@/lib/seo/site-url";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

interface ProductCardProps {
  product: Product;
  userLocation: UserLocation;
  onSelectOffer: (product: Product, offer: Offer) => void;
  locale?: SiteLocale;
  /** Browse URL to restore after leaving the product page (e.g. `/?category=hub-diy`). */
  returnTo?: string;
}

export function ProductCard({
  product,
  userLocation,
  onSelectOffer,
  locale,
  returnTo,
}: ProductCardProps) {
  const resolvedLocale = locale ?? defaultLocaleFromCountry(userLocation.countryCode);
  const ui = HOME_UI[resolvedLocale];
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

  const href = productPagePathWithReturn(product.id, returnTo, resolvedLocale);

  return (
    <article className="bg-white rounded-xl md:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group h-full">
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        <ProductCardImage product={product} locale={resolvedLocale} verifiedBadgeOffer={verifiedBadgeOffer} />
      </Link>

      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-3 md:gap-4">
        <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
          <ProductCardDetails product={product} locale={resolvedLocale} freshestLabel={freshestLabel} />
        </Link>

        {/* Mobile: price-first summary — full offer list stays on md+ / product page */}
        {lowestTotal != null && (
          <Link
            href={href}
            className="md:hidden mt-auto rounded-lg bg-emerald-50 border border-emerald-200/80 px-2 py-1.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/80">
              {formatUi(ui.comparePrices, { count: product.offers.length })}
            </p>
            <p className="text-sm font-extrabold text-emerald-900 tabular-nums leading-tight">
              {currencySymbol}
              {lowestTotal.toLocaleString()}
            </p>
            {lowestOffer?.storeName && (
              <p className="text-[10px] text-emerald-800/70 truncate">{lowestOffer.storeName}</p>
            )}
          </Link>
        )}

        <div className="hidden md:block space-y-4">
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
      </div>
    </article>
  );
}
