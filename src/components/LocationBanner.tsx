"use client";

import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { Store, Navigation, Radio, ArrowRightLeft } from "lucide-react";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";

interface LocationBannerProps {
  userLocation: UserLocation;
  onCountryChange: (countryCode: CountryCode) => void;
  onRefreshGps: () => void;
  isLocating: boolean;
  productionOfferCount?: number;
  sampleOfferCount?: number;
  locale: SiteLocale;
}

export function LocationBanner({
  userLocation,
  onCountryChange,
  onRefreshGps,
  isLocating,
  productionOfferCount = 0,
  sampleOfferCount = 0,
  locale,
}: LocationBannerProps) {
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const ui = HOME_UI[locale];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-4 relative z-10 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 min-w-0">
          {/* Left column: Location Status */}
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                {userLocation.isGps ? ui.gpsLocationEnabled : ui.approximateLocation}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-start gap-2 min-w-0">
              <span className="break-words min-w-0">
                {formatUi(ui.shoppingIn, { city: userLocation.city, countryName: userLocation.countryName })}
              </span>
              <span className="text-3xl shrink-0">{currentCountryInfo.flag}</span>
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl break-words">
              {productionOfferCount > 0 || sampleOfferCount > 0 ? (
                <>
                  {formatUi(ui.hybridCatalogFor, { countryName: userLocation.countryName, currency: currentCountryInfo.currency })}.{" "}
                  {productionOfferCount > 0 && (
                    <><strong className="text-emerald-300">{formatUi(ui.productionFeedOffers, { productionOfferCount })}</strong>.{" "}</>
                  )}
                  {sampleOfferCount > 0 && (
                    <><strong className="text-amber-300">{formatUi(ui.sampleOffersIllustrative, { sampleOfferCount })}</strong>.{" "}</>
                  )}
                  {ui.otherMerchantsRemainDemoCatalog}
                </>
              ) : (
                <>
                  {formatUi(ui.showingDemoCatalogOffers, { countryName: userLocation.countryName, currency: currentCountryInfo.currency })}. {ui.pricesIllustrativeUntilLive}
                </>
              )}
            </p>
          </div>

          {/* Right column: Quick Switcher / Country Selector */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:-mt-1 w-full lg:w-auto min-w-0 max-w-full">
            <div className="text-xs text-slate-300 font-medium min-w-0">
              <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{" "}
                <span className="break-words">{ui.changeCountryRegion}</span>
              </div>
              <span className="break-words">{ui.switchToViewPricingInAnotherCountry}</span>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 min-w-0 w-full sm:w-auto">
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                className="bg-slate-900 text-white font-semibold text-xs border border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer w-full sm:w-auto sm:flex-1 min-w-0 max-w-full"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>

              <button
                onClick={onRefreshGps}
                disabled={isLocating}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 w-full sm:w-auto whitespace-normal sm:whitespace-nowrap"
              >
                <Navigation className={`w-3.5 h-3.5 shrink-0 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? ui.gpsScanning : ui.reScanGps}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-width store row */}
        <div className="space-y-1.5 text-xs min-w-0 max-w-full">
          <div className="text-slate-400 flex items-center gap-1 font-medium">
            <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="break-words min-w-0">
              {formatUi(ui.storesIndexedIn, { countryName: currentCountryInfo.name })}:
            </span>
          </div>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto custom-scrollbar pb-1 min-w-0 max-w-full touch-pan-x">
            {currentCountryInfo.supportedStores.map((store) => (
              <span
                key={store}
                className="shrink-0 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              >
                {store}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
