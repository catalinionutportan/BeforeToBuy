"use client";

import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardDetails } from "./ProductCardDetails";
import { CompareButton } from "./CompareButton";

import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { productPagePathWithReturn } from "@/lib/seo/site-url";
import { HOME_UI } from "@/lib/i18n/ui";
import { saveBrowseScrollAnchor, saveBrowseScrollY } from "@/lib/browse-scroll";
import { saveProductPreview, warmProductPreviewImage } from "@/lib/product-preview";

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
  const [freshnessNow] = useState(() => Date.now());
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
    () =>
      formatOfferFreshness(
        getFreshestOfferTimestamp(product.offers),
        freshnessNow,
        resolvedLocale
      ) ?? "",
    [freshnessNow, product.offers, resolvedLocale]
  );

  const href = productPagePathWithReturn(product.id, returnTo, resolvedLocale);
  const bestOffer = sortedOffers[0];
  const bestTotal = bestOffer
    ? (bestOffer.totalPrice ?? computeTotalPrice(bestOffer))
    : undefined;
  const openProduct = (event: MouseEvent<HTMLAnchorElement>) => {
    // Force-save even near the catalog end (non-force ignores end-of-page junk).
    saveBrowseScrollY(window.scrollY, { force: true });
    const card = event.currentTarget.closest<HTMLElement>("[data-product-id]");
    const visibleCards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-product-id]")
    );
    saveBrowseScrollAnchor(product.id, {
      visibleIndex: card ? visibleCards.indexOf(card) : undefined,
      viewportTop: card?.getBoundingClientRect().top,
    });
    const isLive = bestOffer?.source === "production-live";
    const sourceLabel = bestOffer
      ? isLive
        ? ui.liveOfferLabel
        : bestOffer.source === "sample"
          ? ui.sampleOfferLabel
          : ui.demoOfferLabel
      : undefined;
    const ctaLabel = bestOffer
      ? isLive
        ? ui.viewOfferButton
        : ui.searchStoreButton
      : undefined;
    // Paint the presentation card on this click — already in browse locale (no EN flash).
    saveProductPreview({
      id: product.id,
      title: product.title,
      brand: product.brand,
      description: product.description?.slice(0, 280) || undefined,
      image: product.image,
      price: bestTotal,
      currencySymbol,
      storeName: bestOffer?.storeName,
      compareHeading: ui.productOfferHeading,
      compareTip: ui.compareViaBalanceTip,
      sourceLabel,
      ctaLabel,
      offers: bestOffer
        ? [
            {
              id: bestOffer.id,
              storeName: bestOffer.storeName,
              priceLabel:
                bestTotal != null
                  ? `${currencySymbol}${bestTotal.toLocaleString()}`
                  : "—",
              sourceLabel: sourceLabel || "",
              purchaseUrl: bestOffer.purchaseUrl,
              isLive: Boolean(isLive),
              ctaLabel: ctaLabel || "",
            },
          ]
        : undefined,
    });
  };

  return (
    <article
      data-product-id={product.id}
      className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group h-full min-w-0"
      onPointerEnter={() => warmProductPreviewImage(product.image)}
      onFocus={() => warmProductPreviewImage(product.image)}
    >
      <div className="relative">
        <CompareButton product={product} />
        <Link
          href={href}
          scroll={false}
          prefetch={false}
          onClick={openProduct}
          onPointerDown={() => warmProductPreviewImage(product.image)}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ProductCardImage
            product={product}
            locale={resolvedLocale}
            verifiedBadgeOffer={verifiedBadgeOffer}
          />
        </Link>
      </div>

      <div className="p-2.5 flex-1 flex flex-col justify-between gap-2 min-w-0">
        <Link
          href={href}
          scroll={false}
          prefetch={false}
          onClick={openProduct}
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
            prefetch={false}
            onClick={openProduct}
            className="mt-auto rounded-lg bg-emerald-50 border border-emerald-200/80 px-2 py-1.5 min-w-0 space-y-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/80">
              {visibleOffers.length > 1 ? ui.comparePrices : ui.productOfferHeading}
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

            <span className="flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-extrabold text-white transition-colors group-hover:bg-emerald-800">
              {ui.viewOfferButton}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
