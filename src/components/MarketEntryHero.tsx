"use client";

import Link from "next/link";
import { ArrowRight, Building2, Scale, Search, ShieldCheck } from "lucide-react";
import { COMPANY } from "@/lib/company-info";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

interface MarketEntryHeroProps {
  locale: SiteLocale;
}

/**
 * First-impression block. Mobile stays short (brand + headline + CTA);
 * trust copy lives below the catalog on small screens via HomePageClient order.
 */
export function MarketEntryHero({ locale }: MarketEntryHeroProps) {
  const ui = HOME_UI[locale];

  return (
    <section className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xs">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #34d399 0%, transparent 40%), radial-gradient(circle at 80% 0%, #22d3ee 0%, transparent 35%)",
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-6 md:p-8 space-y-3 md:space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            BeforeToBuy.com
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            {ui.betaDemo}
          </span>
        </div>

        <div className="max-w-3xl space-y-2 md:space-y-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {ui.marketHeroHeadline}
          </h2>
          <p className="hidden md:block text-sm sm:text-base text-slate-300 leading-relaxed">
            {ui.marketHeroSubline}
          </p>
          <p className="hidden md:block text-xs sm:text-sm text-emerald-100/90 leading-relaxed border-l-2 border-emerald-400/50 pl-3">
            {ui.marketHeroDiff}
          </p>
          <p className="md:hidden text-xs text-slate-300 leading-snug line-clamp-2">
            {ui.marketHeroTrustRedirectBody}
          </p>
        </div>

        <ul className="hidden md:grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <li className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold uppercase tracking-wide mb-1">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {ui.marketHeroTrustSwiss}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {COMPANY.legalName} · {COMPANY.uid}
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold uppercase tracking-wide mb-1">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {ui.marketHeroTrustBeta}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{ui.marketHeroTrustBetaBody}</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold uppercase tracking-wide mb-1">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              {ui.marketHeroTrustRedirect}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{ui.marketHeroTrustRedirectBody}</p>
          </li>
        </ul>

        <div className="flex flex-row flex-wrap items-center gap-2 md:gap-3 pt-0.5">
          <a
            href="#browse-offers"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-3.5 py-2 md:px-4 md:py-2.5 transition-colors"
          >
            {ui.marketHeroCtaCompare}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/legal"
            className="hidden sm:inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 transition-colors"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            {ui.marketHeroCtaLegal}
          </Link>
          <p className="hidden md:block text-[11px] text-slate-400 sm:ml-auto max-w-md">
            {ui.marketHeroPartnerNote}
          </p>
        </div>
      </div>
    </section>
  );
}
