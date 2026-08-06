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

export function PlatformExplanationBanner() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 p-5 sm:p-6 shadow-xs relative overflow-hidden my-4">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Cum Funcționează BeforeToBuy.com?</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300">
                Ghid Rapid
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Platformă gratuită de comparare a prețurilor și căutare a magazinelor din apropiere
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
        >
          <span>{isOpen ? "Ascunde Detalii" : "Vezi cum funcționează"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* 3 Step Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  1
                </span>
                <Search className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">1. Căutare & Comparare Prețuri</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Agregăm în timp real produsele, prețurile și reducerile active de la marile magazine din Elveția și Europa (Digitec, Galaxus, MediaMarkt, Brack, Amazon, etc.).
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  2
                </span>
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">2. Ridicare GPS Click & Collect</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pe baza locației dvs. GPS, detectăm filialele fizice din apropiere de unde puteți ridica produsele în aceeași zi, economisind timp și costuri de livrare.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-black text-xs">
                  3
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">3. Cumpărare Sigură pe Site-ul Oficial</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Apăsând &quot;Vezi Oferta&quot;, sunteți redirecționat direct pe site-ul oficial al comerciantului. Plata și livrarea sunt procesate în siguranță 100% de către magazin.
              </p>
            </div>

          </div>

          {/* Legal Notice & Price Transparency Banner (Swiss PBV & UWG compliant) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-[11px] text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2">
              <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Transparență Prețuri (PBV/UWG):</strong> Prețurile includ TVA (MwSt.) unde este aplicabil. Detaliile finale privind livrarea, disponibilitatea și garanția sunt confirmate la checkout pe site-ul vânzătorului.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Operat de {COMPANY.legalName} ({COMPANY.uid})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
