import Image from "next/image";
import Link from "next/link";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import { Menu, Search } from "lucide-react";

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
  searchQuery,
  onSearchChange,
  selectedDomain = "all",
  locale,
  onLocaleChange,
  availableLocales,
  onOpenCategoryMenu,
}: HeaderProps) {
  const ui = HOME_UI[locale];
  const searchPlaceholder =
    selectedDomain && selectedDomain !== "all"
      ? formatUi(ui.searchPlaceholderDomain, { domain: selectedDomain })
      : formatUi(ui.searchPlaceholder, { country: userLocation.countryName });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Equal left/right inset from the screen edges on every viewport */}
      <div className="w-full px-3 sm:px-4 pt-1.5 pb-2 min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <Link href="/" locale={locale} className="min-w-0 pt-0.5">
            <h1 className="text-[16px] font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 bg-clip-text text-transparent truncate leading-none">
              BeforeToBuy
            </h1>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
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
        </div>

        {/*
          I_I    I_______________________I
          Bag+menu flush-left (inside equal inset); search fills the rest
          with the same right inset as the left screen margin.
        */}
        <div className="mt-1.5 flex items-stretch gap-3 sm:gap-4 min-w-0">
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <Link
              href="/"
              locale={locale}
              className="relative block h-11 w-11"
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
            {onOpenCategoryMenu ? (
              <button
                type="button"
                onClick={onOpenCategoryMenu}
                className="inline-flex h-6 w-11 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
                aria-haspopup="dialog"
                aria-label={ui.menuOpen}
                title={ui.menuOpen}
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <span className="h-6 w-11" aria-hidden="true" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center">
            <div className="relative w-full max-w-none">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(stripUnsafeQueryChars(e.target.value))}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-transparent bg-slate-100 py-2 pl-9 pr-3 text-[13px] font-medium outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/80 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  {ui.clear}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
