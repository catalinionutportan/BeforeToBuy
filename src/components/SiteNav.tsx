"use client";

import Link from "next/link";
import { Mail, LifeBuoy, Scale, ShoppingBag, HelpCircle, Layers, Store } from "lucide-react";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { HOME_UI } from "@/lib/i18n/ui";

export function SiteNav() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];

  const navLinks = [
    { href: "/about", label: homeUi.about, icon: HelpCircle },
    { href: "/categories", label: homeUi.categories, icon: Layers },
    { href: "/stores", label: homeUi.stores, icon: Store },
    { href: "/help", label: homeUi.helpFAQ, icon: LifeBuoy },
    { href: "/contact", label: homeUi.contact, icon: Mail },
    { href: "/legal", label: homeUi.legalHub, icon: Scale },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 block leading-tight">
              BeforeToBuy.com
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{homeUi.betaDemo}</span>
          </div>
        </Link>

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
