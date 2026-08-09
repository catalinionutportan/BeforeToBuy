"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, LifeBuoy, Scale, HelpCircle, Layers, Store } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useRouter } from "next/navigation";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";

export function SiteNav() {
  const { countryCode, locale: browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  const router = useRouter();
  const homeHref = withLangParam("/", browseLocale);

  const navLinks = [
    { href: withLangParam("/about", browseLocale), label: homeUi.about, icon: HelpCircle },
    { href: withLangParam("/categories", browseLocale), label: homeUi.categories, icon: Layers },
    { href: withLangParam("/stores", browseLocale), label: homeUi.stores, icon: Store },
    { href: withLangParam("/help", browseLocale), label: homeUi.helpFAQ, icon: LifeBuoy },
    { href: withLangParam("/contact", browseLocale), label: homeUi.contact, icon: Mail },
    { href: withLangParam("/legal", browseLocale), label: homeUi.legalHub, icon: Scale },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href={homeHref} className="flex items-center gap-2.5 shrink-0">
          <span className="relative block h-9 w-9">
            <Image
              src="/beforetobuy-mark.png"
              alt=""
              width={72}
              height={72}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="text-base font-extrabold text-slate-900 block leading-tight">
            BeforeToBuy
          </span>
        </Link>

        <div className="flex-1 w-full sm:max-w-md mx-4 order-3 sm:order-none mt-3 sm:mt-0">
          <SearchAutocomplete 
            onSearchSubmit={(q) => {
              router.push(withLangParam(`/?q=${encodeURIComponent(q)}`, browseLocale));
            }}
            countryCode={countryCode}
            locale={browseLocale}
          />
        </div>

        <nav aria-label={homeUi.language} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
