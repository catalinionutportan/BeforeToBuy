"use client";

import Link from "next/link";
import type { CountryCode, Product } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { CloseCompareControls } from "@/components/CloseCompareControls";
import { CompareProductColumn } from "@/components/CompareProductColumn";

type Props = {
  product1: Product;
  product2: Product;
  countryCode: CountryCode;
};

/** Client compare UI — strings follow the language selector (browseLocale). */
export function CompareProductsView({ product1, product2, countryCode }: Props) {
  const { locale } = useBrowseLocale(countryCode);
  const ui = HOME_UI[locale];
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];

  const bestOffer1 = sortOffersByTotalPrice(product1.offers)[0];
  const bestOffer2 = sortOffersByTotalPrice(product2.offers)[0];
  const total1 = bestOffer1 ? (bestOffer1.totalPrice ?? computeTotalPrice(bestOffer1)) : 0;
  const total2 = bestOffer2 ? (bestOffer2.totalPrice ?? computeTotalPrice(bestOffer2)) : 0;

  const columnLabels = {
    cheapestLabel: ui.compareCheapest,
    bestOfferLabel: ui.compareBestOffer,
    buyNowLabel: ui.compareBuyNow,
    specsLabel: ui.compareSpecs,
    expandImageLabel: ui.compareExpandImage,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-4">
          <CloseCompareControls
            title={ui.compareProductsTitle}
            closeLabel={ui.compareProductsClose}
            backLabel={ui.compareProductsBack}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 sm:mt-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 items-stretch">
          <CompareProductColumn
            product={product1}
            currencySymbol={country.currencySymbol}
            total={total1}
            storeLine={
              bestOffer1?.storeName
                ? formatUi(ui.compareAtStore, { store: bestOffer1.storeName })
                : undefined
            }
            purchaseUrl={bestOffer1?.purchaseUrl}
            isCheapest={total1 > 0 && total1 < total2}
            {...columnLabels}
          />
          <CompareProductColumn
            product={product2}
            currencySymbol={country.currencySymbol}
            total={total2}
            storeLine={
              bestOffer2?.storeName
                ? formatUi(ui.compareAtStore, { store: bestOffer2.storeName })
                : undefined
            }
            purchaseUrl={bestOffer2?.purchaseUrl}
            isCheapest={total2 > 0 && total2 < total1}
            {...columnLabels}
          />
        </div>

        <p className="mt-6 mb-2 text-xs text-slate-500 leading-relaxed text-center max-w-2xl mx-auto">
          {ui.priceDisclaimer}
        </p>
      </div>
    </div>
  );
}

export function CompareEmptyState() {
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{ui.compareNoProductsSelected}</h1>
      <Link
        href="/"
        scroll={false}
        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
      >
        {ui.compareBackToShop}
      </Link>
    </div>
  );
}
