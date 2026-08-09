"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import { Menu } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { clearBrowseScrollY, isBrowsePath } from "@/lib/browse-scroll";
import { withLangParam } from "@/lib/seo/site-url";

interface HeaderProps {
  userLocation: UserLocation;
  onCountryChange: (countryCode: CountryCode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDomain?: string;
  onDomainChange?: (domain: string) => void;
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
  const pathname = usePathname();
  const ui = HOME_UI[locale];
  const homeHref = withLangParam("/", locale);
  const searchPlaceholder =
    selectedDomain && selectedDomain !== "all"
      ? formatUi(ui.searchPlaceholderDomain, { domain: selectedDomain })
      : formatUi(ui.searchPlaceholder, { country: userLocation.countryName });

  function goToBrowseTop(event: MouseEvent<HTMLAnchorElement>) {
    // Shopping bag / brand mark = explicit jump to the top of infinite scroll.
    if (isBrowsePath(pathname)) {
      event.preventDefault();
      clearBrowseScrollY();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      {/* Fixed so bag + search stay reachable while scrolling (Safari-safe). */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="w-full min-w-0 px-3 pt-1.5 pb-2 sm:px-8 lg:px-12">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <Link href={homeHref} className="min-w-0 pt-0.5" onClick={goToBrowseTop}>
              <h1 className="truncate text-[clamp(1rem,0.4vw+0.9rem,1.125rem)] font-extrabold leading-none tracking-tight text-slate-900">
                BeforeToBuy
              </h1>
              <p className="mt-0.5 truncate text-[clamp(0.6875rem,0.2vw+0.6rem,0.75rem)] font-medium text-slate-500">
                {ui.compareBeforeYouBuy}
              </p>
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

          <div className="mt-1.5 flex items-stretch gap-3 sm:gap-4 min-w-0">
            <div className="flex shrink-0 flex-col items-center gap-0.5">
              <Link
                href={homeHref}
                className="relative block h-11 w-11 sm:h-12 sm:w-12"
                aria-label="BeforeToBuy — top of page"
                title="Top of page"
                onClick={goToBrowseTop}
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
                  className="inline-flex h-7 w-11 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-800 sm:h-8 sm:w-12"
                  aria-haspopup="dialog"
                  aria-label={ui.menuOpen}
                  title={ui.menuOpen}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : (
                <span className="h-7 w-11 sm:h-8 sm:w-12" aria-hidden="true" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center">
              <SearchAutocomplete 
                initialQuery={searchQuery}
                placeholder={searchPlaceholder}
                onSearchSubmit={(q) => onSearchChange(stripUnsafeQueryChars(q))}
                countryCode={userLocation.countryCode}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer matches fixed header height so content is not covered. */}
      <div className="h-[7.9rem] sm:h-[8.4rem]" aria-hidden="true" />
    </>
  );
}
