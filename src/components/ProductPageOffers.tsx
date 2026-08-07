"use client";

import { ExternalLink } from "lucide-react";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import type { Offer } from "@/types";

type ProductPageOffersProps = {
  offers: Offer[];
  currencySymbol: string;
  countryName: string;
  locale?: SiteLocale;
};

export function ProductPageOffers({
  offers,
  currencySymbol,
  countryName,
  locale = "en",
}: ProductPageOffersProps) {
  const ui = HOME_UI[locale];

  const lowestTotal = offers[0]
    ? offers[0].totalPrice ?? computeTotalPrice(offers[0])
    : undefined;
  const highestTotal = offers.length
    ? (() => {
        const last = offers[offers.length - 1];
        return last.totalPrice ?? computeTotalPrice(last);
      })()
    : undefined;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">
          {ui.compareProductPrices} — {countryName}
        </h2>
        <p className="text-xs text-slate-500 font-semibold">
          {formatUi(ui.comparePrices, { count: offers.length })}
        </p>
        {offers.length > 1 && lowestTotal != null && highestTotal != null && (
          <p className="text-xs text-slate-600">
            {formatUi(ui.offerPriceRangeHint, {
              low: `${currencySymbol}${lowestTotal.toLocaleString()}`,
              high: `${currencySymbol}${highestTotal.toLocaleString()}`,
            })}
          </p>
        )}
      </div>

      <ul className="space-y-3">
        {offers.map((offer) => {
          const total = offer.totalPrice ?? computeTotalPrice(offer);
          return (
            <li
              key={offer.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{offer.storeName}</p>
                <p className="text-[11px] text-slate-500">
                  {offer.source === "production-live"
                    ? ui.liveOfferLabel
                    : offer.source === "sample"
                      ? ui.sampleOfferLabel
                      : ui.demoOfferLabel}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="font-black text-slate-900">
                  {currencySymbol}
                  {total.toLocaleString()}
                </p>
                <ConsentAwareAffiliateLink
                  href={offer.purchaseUrl}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                  ariaLabel={
                    offer.source === "production-live"
                      ? `${ui.viewOfferButton} ${offer.storeName}`
                      : `${ui.searchStoreButton} ${offer.storeName}`
                  }
                >
                  <span>
                    {offer.source === "production-live"
                      ? ui.viewOfferButton
                      : ui.searchStoreButton}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </ConsentAwareAffiliateLink>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
