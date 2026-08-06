"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { COMPANY } from "@/lib/company-info";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

interface PlatformExplanationBannerProps {
  locale: SiteLocale;
}

export function PlatformExplanationBanner({ locale }: PlatformExplanationBannerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const ui = HOME_UI[locale];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
              <span>{ui.howPlatformWorksTitle}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300">
                {ui.howPlatformWorksBadge}
              </span>
            </h2>
            <p className="text-xs text-slate-500 break-words">{ui.howPlatformWorksSubtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <span>{isOpen ? ui.howPlatformWorksHide : ui.howPlatformWorksShow}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  1
                </span>
                <Search className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">{ui.howPlatformStep1Title}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{ui.howPlatformStep1Body}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  2
                </span>
                <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">{ui.howPlatformStep2Title}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{ui.howPlatformStep2Body}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  3
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">{ui.howPlatformStep3Title}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{ui.howPlatformStep3Body}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-[11px] text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="break-words">{ui.howPlatformPriceNotice}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>
                {COMPANY.legalName} ({COMPANY.uid})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
