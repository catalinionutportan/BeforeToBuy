"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, LifeBuoy, Scale, HelpCircle, Layers, Store, Menu } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { CategoryFlyoutMenu } from "@/components/CategoryFlyoutMenu";
import { useRouter } from "next/navigation";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { requestBrowseCategory } from "@/lib/prefetch-browse-catalog";

import { COUNTRIES, PUBLIC_BROWSE_COUNTRY_CODES } from "@/lib/countries";
import { writeStoredMarketCountry } from "@/lib/market-preference";
import type { CountryCode } from "@/types";

export function SiteNav() {
  const { countryCode, locale: browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  const router = useRouter();
  const homeHref = withLangParam("/", browseLocale);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const navLinks = [
    { href: withLangParam("/about", browseLocale), label: homeUi.about, icon: HelpCircle },
    { href: withLangParam("/categories", browseLocale), label: homeUi.categories, icon: Layers },
    { href: withLangParam("/stores", browseLocale), label: homeUi.stores, icon: Store },
    { href: withLangParam("/help", browseLocale), label: homeUi.helpFAQ, icon: LifeBuoy },
    { href: withLangParam("/contact", browseLocale), label: homeUi.contact, icon: Mail },
    { href: withLangParam("/legal", browseLocale), label: homeUi.legalHub, icon: Scale },
  ] as const;

  function browseCategory(categoryId: string) {
    setIsCategoryMenuOpen(false);
    const onHome = window.location.pathname === "/";
    if (onHome) {
      requestBrowseCategory(categoryId || ALL_CATEGORIES_ID);
      return;
    }
    const path =
      !categoryId || categoryId === ALL_CATEGORIES_ID
        ? "/"
        : `/?category=${encodeURIComponent(categoryId)}`;
    router.push(withLangParam(path, browseLocale));
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <Link href={homeHref} className="relative block h-9 w-9">
                <Image
                  src="/beforetobuy-mark.png"
                  alt=""
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(true)}
                className="inline-flex h-7 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-800"
                aria-haspopup="dialog"
                aria-label={homeUi.menuOpen}
                title={homeUi.menuOpen}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <Link href={homeHref} className="min-w-0">
              <span className="block text-base font-extrabold leading-tight text-slate-900">
                BeforeToBuy
              </span>
            </Link>
          </div>

          <div className="order-3 mx-0 mt-1 w-full flex-1 sm:order-none sm:mx-4 sm:mt-0 sm:max-w-md">
            <SearchAutocomplete
              onSearchSubmit={(q) => {
                router.push(withLangParam(`/?q=${encodeURIComponent(q)}`, browseLocale));
              }}
              countryCode={countryCode}
              locale={browseLocale}
            />
          </div>

          <div className="flex items-center gap-2">
            <nav aria-label={homeUi.language} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <select
              value={countryCode}
              onChange={(e) => {
                const next = e.target.value as CountryCode;
                writeStoredMarketCountry(next);
                window.location.reload();
              }}
              aria-label={homeUi.countryMarket}
              className="max-w-[4.75rem] rounded-md border-0 bg-slate-100 px-1.5 py-1 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {PUBLIC_BROWSE_COUNTRY_CODES.map((code) => {
                const c = COUNTRIES[code];
                return (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </header>

      <CategoryFlyoutMenu
        open={isCategoryMenuOpen}
        onClose={() => setIsCategoryMenuOpen(false)}
        selectedCategory={ALL_CATEGORIES_ID}
        onCategoryChange={browseCategory}
        locale={browseLocale}
      />
    </>
  );
}
