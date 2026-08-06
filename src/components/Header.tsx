import Link from "next/link";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import {
  Navigation,
  ShoppingBag,
  Globe,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";


interface HeaderProps {
  userLocation: UserLocation;
  onCountryChange: (countryCode: CountryCode) => void;
  onRefreshGps: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDomain?: string;
  onDomainChange?: (domain: string) => void;
  isLocating: boolean;
  locale: SiteLocale;
  onLocaleChange: (locale: SiteLocale) => void;
  availableLocales: readonly SiteLocale[];
}

export function Header({
  userLocation,
  onCountryChange,
  onRefreshGps,
  searchQuery,
  onSearchChange,
  selectedDomain = "all",
  onDomainChange,
  isLocating,
  locale,
  onLocaleChange,
  availableLocales,
}: HeaderProps) {
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const ui = HOME_UI[locale];
  const searchPlaceholder =
    selectedDomain && selectedDomain !== "all"
      ? formatUi(ui.searchPlaceholderDomain, { domain: selectedDomain })
      : formatUi(ui.searchPlaceholder, { country: userLocation.countryName });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-4 flex justify-between items-center gap-2 min-w-0">
        <div className="hidden sm:flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium truncate">{ui.freePriceComparisonEngine}</span>
          </div>
          <span className="shrink-0">•</span>
          <Link
            href="/stores"
            locale={locale}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2 min-w-0"
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {ui.integratedStoreDomains} {formatUi(ui.integratedStoreDomainsCount, { count: currentCountryInfo.merchantDomains.filter((m) => !m.isCrossBorder).length, countryCode: currentCountryInfo.code })}
            </span>
          </Link>
        </div>

        <div className="sm:hidden flex items-center gap-1.5 min-w-0 overflow-hidden">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">{ui.freePriceComparisonEngine}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden md:inline text-slate-400">
            {userLocation.isGps || userLocation.locationKind === "ip"
              ? ui.detected
              : ui.defaultMarket}{" "}
            <strong className="text-white">
              {userLocation.city}, {userLocation.countryName} {currentCountryInfo.flag}
            </strong>
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase whitespace-nowrap">
            {ui.betaDemo}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0 w-full md:w-auto">
            <Link href="/" locale={locale} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 bg-clip-text text-transparent truncate">
                  BeforeToBuy.com
                </h1>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {ui.tagline}
                </p>
              </div>
            </Link>

            <div className="md:hidden flex items-center gap-1.5 shrink-0 max-w-[48%]">
              <LanguageSwitcher
                locale={locale}
                onLocaleChange={onLocaleChange}
                label={ui.language}
                availableLocales={availableLocales}
                compact
              />
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                aria-label={ui.countryMarket}
                className="bg-slate-100 text-xs border-0 rounded-lg py-1.5 px-2 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 max-w-[5.75rem]"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 max-w-2xl flex items-center gap-2 min-w-0 w-full">
            {onDomainChange && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-2 rounded-xl border border-slate-200 shrink-0">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedDomain}
                  onChange={(e) => onDomainChange(stripUnsafeQueryChars(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 border-0 outline-none cursor-pointer max-w-[130px] truncate"
                >
                  <option value="all">{ui.allDomains}</option>
                  {currentCountryInfo.merchantDomains
                    .filter((m) => !m.isCrossBorder)
                    .map((m) => (
                      <option key={m.id} value={m.domain}>
                        {m.domain}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(stripUnsafeQueryChars(e.target.value))}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full px-1.5 py-0.5"
                >
                  {ui.clear}
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher
              locale={locale}
              onLocaleChange={onLocaleChange}
              label={ui.language}
              availableLocales={availableLocales}
            />

            <button
              onClick={onRefreshGps}
              disabled={isLocating}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
              title={ui.detectGps}
            >
              <Navigation
                className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : "text-emerald-600"}`}
              />
              <span>{isLocating ? `${ui.detectGps}...` : ui.detectGps}</span>
            </button>

            <div
              className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200"
              title={ui.countryMarket}
            >
              <Globe className="w-4 h-4 text-slate-500 ml-1" />
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
                {ui.countryMarket}
              </span>
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                aria-label={ui.countryMarket}
                className="bg-transparent text-xs font-semibold text-slate-800 border-0 outline-none pr-1 cursor-pointer max-w-[10rem]"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
