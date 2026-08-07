"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

interface MarketEntryHeroProps {
  locale: SiteLocale;
}

/** Short first-impression block — same layout on phone and desktop. */
export function MarketEntryHero({ locale }: MarketEntryHeroProps) {
  const ui = HOME_UI[locale];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xs">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #34d399 0%, transparent 40%), radial-gradient(circle at 80% 0%, #22d3ee 0%, transparent 35%)",
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            BeforeToBuy
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            {ui.betaDemo}
          </span>
        </div>

        <div className="max-w-3xl space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            {ui.marketHeroHeadline}
          </h2>
          <p className="text-xs text-slate-300 leading-snug">
            {ui.marketHeroTrustRedirectBody}
          </p>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-2 pt-0.5">
          <a
            href="#browse-offers"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-3.5 py-2 transition-colors"
          >
            {ui.marketHeroCtaCompare}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/legal"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-3.5 py-2 transition-colors"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            {ui.marketHeroCtaLegal}
          </Link>
        </div>
      </div>
    </section>
  );
}
