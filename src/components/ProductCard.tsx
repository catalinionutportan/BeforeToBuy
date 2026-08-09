"use client";

import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { useMemo } from "react";
import Link from "next/link";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { productPagePathWithReturn } from "@/lib/seo/site-url";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { saveBrowseScrollY } from "@/lib/browse-scroll";

/** How many store prices to show on the browse card before "+N more". */
const VISIBLE_OFFERS = 3;

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
  locale,
  returnTo,
}: ProductCardProps) {
  const resolvedLocale = locale ?? defaultLocaleFromCountry(userLocation.countryCode);
  const ui = HOME_UI[resolvedLocale];
  const currencySymbol =
    (COUNTRIES[userLocation.countryCode] || COUNTRIES.RO).currencySymbol;

  const sortedOffers = useMemo(() => sortOffersByTotalPrice(product.offers), [product.offers]);
  const feedOffers = useMemo(
    () => sortedOffers.filter((offer) => offer.source !== "demo"),
    [sortedOffers]
  );
  const visibleOffers = sortedOffers.slice(0, VISIBLE_OFFERS);
  const hiddenOfferCount = Math.max(0, sortedOffers.length - VISIBLE_OFFERS);

  const verifiedBadgeOffer = useMemo(() => {
    const offer = feedOffers.find((item) => item.badge);
    return offer?.badge ? { badge: offer.badge } : undefined;
  }, [feedOffers]);

  const freshestLabel = useMemo(
    () => formatOfferFreshness(getFreshestOfferTimestamp(product.offers)) ?? "",
    [product.offers]
  );

  const href = productPagePathWithReturn(product.id, returnTo, resolvedLocale);
  const rememberScroll = () => saveBrowseScrollY();

  return (
    <article className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group h-full min-w-0">
      <Link
        href={href}
        scroll={false}
        onClick={rememberScroll}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <ProductCardImage
          product={product}
          locale={resolvedLocale}
          verifiedBadgeOffer={verifiedBadgeOffer}
        />
      </Link>

      <div className="p-2.5 flex-1 flex flex-col justify-between gap-2 min-w-0">
        <Link
          href={href}
          scroll={false}
          onClick={rememberScroll}
          className="block min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
        >
          <ProductCardDetails
            product={product}
            locale={resolvedLocale}
            freshestLabel={freshestLabel}
          />
        </Link>

        {visibleOffers.length > 0 && (
          <Link
            href={href}
            scroll={false}
            onClick={rememberScroll}
            className="mt-auto rounded-lg bg-emerald-50 border border-emerald-200/80 px-2 py-1.5 min-w-0 space-y-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/80">
              {formatUi(ui.comparePrices, { count: product.offers.length })}
            </p>

            <ul className="space-y-0.5">
              {visibleOffers.map((offer, index) => {
                const total = offer.totalPrice ?? computeTotalPrice(offer);
                const isBest = index === 0;
                return (
                  <li
                    key={offer.id}
                    className="flex items-baseline justify-between gap-2 min-w-0"
                  >
                    <span
                      className={`truncate text-[11px] ${
                        isBest ? "font-bold text-emerald-950" : "font-medium text-emerald-900/80"
                      }`}
                    >
                      {offer.storeName}
                    </span>
                    <span
                      className={`shrink-0 tabular-nums text-[11px] ${
                        isBest ? "font-extrabold text-emerald-950" : "font-semibold text-emerald-900/80"
                      }`}
                    >
                      {currencySymbol}
                      {total.toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>

            {hiddenOfferCount > 0 ? (
              <p className="text-[10px] font-semibold text-emerald-800/70">
                +{hiddenOfferCount}
              </p>
            ) : null}
          </Link>
        )}
      </div>
    </article>
  );
}
