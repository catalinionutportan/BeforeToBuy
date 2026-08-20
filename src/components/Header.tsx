"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { Menu } from "lucide-react";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { CategoryFlyoutMenu } from "@/components/CategoryFlyoutMenu";
import type { BrowseCategoryOption } from "@/components/BrowseCategoryOption";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
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
  categoryOptions?: BrowseCategoryOption[];
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
  /** Leaf/department counts for the iOS-style category flyout under the bag. */
  categoryCounts?: Record<string, number>;
  /** Reset browse to All products (bag / wordmark on `/`). */
  onGoHome?: () => void;
}

/**
 * Browse chrome: bag mark + permanent ☰ menu (future iOS app affordance) + search.
 * The hamburger must always render — it is not optional UI.
 */
export function Header({
  userLocation,
  onCountryChange,
  searchQuery,
  onSearchChange,
  selectedDomain = "all",
  locale,
  onLocaleChange,
  availableLocales,
  categoryOptions,
  selectedCategoryId = ALL_CATEGORIES_ID,
  onCategorySelect,
  categoryCounts,
  onGoHome,
}: HeaderProps) {
  const pathname = usePathname();
  const ui = HOME_UI[locale];
  const homeHref = withLangParam("/", locale);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const searchPlaceholder =
    selectedDomain && selectedDomain !== "all"
      ? formatUi(ui.searchPlaceholderDomain, { domain: selectedDomain })
      : formatUi(ui.searchPlaceholder, { country: userLocation.countryName });

  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    if (!isBrowsePath(pathname)) return;
    event.preventDefault();
    clearBrowseScrollY();
    if (onGoHome) {
      onGoHome();
    } else {
      onCategorySelect?.(ALL_CATEGORIES_ID);
      onSearchChange("");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function openCategoryMenu() {
    setIsCategoryMenuOpen(true);
  }

  function handleCategoryChange(categoryId: string) {
    onCategorySelect?.(categoryId);
    setIsCategoryMenuOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="w-full min-w-0 px-3 pt-1.5 pb-2 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <Link href={homeHref} className="min-w-0 pt-0.5" onClick={goHome}>
              <h1 className="truncate text-[clamp(1rem,0.4vw+0.9rem,1.125rem)] font-extrabold leading-none tracking-tight text-slate-900">
                BeforeToBuy
              </h1>
              <p className="mt-0.5 truncate text-[clamp(0.6875rem,0.2vw+0.6rem,0.75rem)] font-medium text-slate-500">
                {ui.compareBeforeYouBuy}
              </p>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
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
                className="max-w-[4.75rem] rounded-md border-0 bg-slate-100 px-1.5 py-1 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-1.5 flex min-w-0 items-stretch gap-3 sm:gap-4">
            <div className="flex shrink-0 flex-col items-center gap-0.5">
              <Link
                href={homeHref}
                className="relative block h-11 w-11 sm:h-12 sm:w-12"
                aria-label={ui.logoHomeAria}
                title={ui.logoHomeAria}
                onClick={goHome}
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
              <button
                type="button"
                onClick={openCategoryMenu}
                className="inline-flex h-7 w-11 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-800 sm:h-8 sm:w-12"
                aria-haspopup="dialog"
                aria-expanded={isCategoryMenuOpen}
                aria-label={ui.menuOpen}
                title={ui.menuOpen}
              >
                <Menu className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center">
              <SearchAutocomplete
                initialQuery={searchQuery}
                placeholder={searchPlaceholder}
                onSearchSubmit={(q) => onSearchChange(stripUnsafeQueryChars(q))}
                countryCode={userLocation.countryCode}
                locale={locale}
                categoryOptions={categoryOptions}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={onCategorySelect}
              />
            </div>
          </div>
        </div>
      </header>
      <div className="h-[7.9rem] sm:h-[8.4rem]" aria-hidden="true" />

      <CategoryFlyoutMenu
        open={isCategoryMenuOpen}
        onClose={() => setIsCategoryMenuOpen(false)}
        selectedCategory={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        categoryCounts={categoryCounts}
        locale={locale}
      />
    </>
  );
}
