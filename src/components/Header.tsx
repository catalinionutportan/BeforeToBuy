import Image from "next/image";
import Link from "next/link";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import {
  Menu,
  Navigation,
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
  onOpenCategoryMenu?: () => void;
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
  onOpenCategoryMenu,
}: HeaderProps) {
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const ui = HOME_UI[locale];
  const searchPlaceholder =
    selectedDomain && selectedDomain !== "all"
      ? formatUi(ui.searchPlaceholderDomain, { domain: selectedDomain })
      : formatUi(ui.searchPlaceholder, { country: userLocation.countryName });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="hidden sm:flex bg-slate-900 text-slate-300 text-[11px] py-1 px-3 sm:px-4 justify-between items-center gap-2 min-w-0">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="font-medium truncate">{ui.freePriceComparisonEngine}</span>
          </div>
          <span className="shrink-0">•</span>
          <Link
            href="/stores"
            locale={locale}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2 min-w-0"
          >
            <Store className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {ui.integratedStoreDomains} {formatUi(ui.integratedStoreDomainsCount, { count: currentCountryInfo.merchantDomains.filter((m) => !m.isCrossBorder).length, countryCode: currentCountryInfo.code })}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-slate-400">
            {userLocation.isGps || userLocation.locationKind === "ip"
              ? ui.detected
              : ui.defaultMarket}{" "}
            <strong className="text-white">
              {userLocation.city}, {userLocation.countryName} {currentCountryInfo.flag}
            </strong>
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase whitespace-nowrap">
            {ui.betaDemo}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1.5 pb-2 min-w-0">
        {/* Brand row — title sits higher, controls on the right */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <Link href="/" locale={locale} className="min-w-0 pt-0.5">
            <h1 className="text-[16px] sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 bg-clip-text text-transparent truncate leading-none">
              BeforeToBuy
            </h1>
            <p className="hidden sm:block mt-0.5 text-[10px] text-slate-500 font-medium truncate leading-tight">
              {ui.tagline}
            </p>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            <div className="md:hidden flex items-center gap-1">
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
                className="bg-slate-100 text-xs border-0 rounded-md py-1 px-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 max-w-[4.75rem]"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <LanguageSwitcher
                locale={locale}
                onLocaleChange={onLocaleChange}
                label={ui.language}
                availableLocales={availableLocales}
                compact
              />
              <button
                onClick={onRefreshGps}
                disabled={isLocating}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
                title={ui.detectGps}
                aria-label={isLocating ? `${ui.detectGps}...` : ui.detectGps}
              >
                <Navigation
                  className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : "text-emerald-600"}`}
                />
              </button>
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                aria-label={ui.countryMarket}
                title={ui.countryMarket}
                className="h-8 rounded-md border-0 bg-slate-100 px-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/*
          Bag + menu column on the left; search sits between them to the right:
            [BAG]  [======== search ========]
            [☰ ]
        */}
        <div className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center gap-x-2.5 gap-y-0.5 min-w-0">
          <Link
            href="/"
            locale={locale}
            className="relative col-start-1 row-start-1 block h-11 w-11 sm:h-12 sm:w-12 justify-self-center"
            aria-label="BeforeToBuy"
          >
            <Image
              src="/beforetobuy-mark.png"
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-contain"
              priority
            />
          </Link>

          <div className="col-start-2 row-start-1 row-span-2 flex items-center min-w-0 self-stretch py-0.5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(stripUnsafeQueryChars(e.target.value))}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-[13px] rounded-lg border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full px-1.5 py-0.5"
                >
                  {ui.clear}
                </button>
              )}
            </div>
          </div>

          {onOpenCategoryMenu ? (
            <button
              type="button"
              onClick={onOpenCategoryMenu}
              className="col-start-1 row-start-2 inline-flex h-6 w-11 sm:w-12 items-center justify-center justify-self-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
              aria-haspopup="dialog"
              aria-label={ui.menuOpen}
              title={ui.menuOpen}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <span className="col-start-1 row-start-2 h-6" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
}
