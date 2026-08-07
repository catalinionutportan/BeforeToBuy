"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  BadgePercent,
  AlertTriangle,
  Sparkles,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Scale,
  Building2,
  Lock,
  Cookie,
  FileText,
  CircleHelp,
  LifeBuoy,
  Activity,
  Store,
  Layers,
  Phone,
  Mail,
  Zap,
} from "lucide-react";
import { COMPANY } from "@/lib/company-info";

export function FooterQuickIndex() {
  const [activeTab, setActiveTab] = useState<"notices" | "legal" | "stores" | "company">("notices");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="my-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 text-slate-300 shadow-xl backdrop-blur-sm">
      {/* Footer Index Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Company &amp; legal index</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                Transparency
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Operator details, platform notices, and draft legal documents for users and partner diligence
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
        >
          <span>{isExpanded ? "Hide Quick Index" : "Show Quick Index"}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* Quick Tabs Bar */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab("notices")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "notices"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Platform notices</span>
            </button>

            <button
              onClick={() => setActiveTab("legal")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "legal"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Legal documents</span>
            </button>

            <button
              onClick={() => setActiveTab("stores")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "stores"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Merchant directory</span>
            </button>

            <button
              onClick={() => setActiveTab("company")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "company"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Company registry</span>
            </button>
          </div>

          {/* TAB 1: Warning & Notice Cards */}
          {activeTab === "notices" && (
            <div className="space-y-4">
              {/* Originality Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Operator & platform notice</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>BeforeToBuy.com</strong> is a Swiss-based location-aware price comparison and Click &amp; Collect aggregator (no checkout on this site). Operated by <strong>PortanX - Catalin Portan</strong> (Commercial Register Canton of Bern, UID: <code className="text-emerald-300 font-mono">CHE-373.501.736</code>). Catalog may include beta/demo sample offers — confirm final terms on the merchant site.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Card 1 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Company Entity & Registration</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Operated by <strong>PortanX - Catalin Portan</strong> (Sole Proprietorship / Einzelunternehmen). Registered in Handelsregister des Kantons Bern under Daily Register No. 14193 (Publication SHAB: HR01-1006718835).
                  </p>
                </div>

                {/* Card 2 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>GPS Privacy & Data Protection</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Precise GPS and approximate IP location run only with your Location consent. GPS coordinates stay in the browser session for distance estimates; IP/reverse-geocode requests may reach processors listed in our Privacy Policy. We do not claim full nDSG/GDPR certification — see our draft policies and Cookie Settings.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <BadgePercent className="h-4 w-4 shrink-0" />
                    <span>Affiliate Commission & Zero-Markup</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Free for consumers. Live affiliate redirects today: eMAG (Profitshare) and evoMAG, Rowenta, Scule365, AutoEco, Soundhouse, Autobob, Automobilus & PAA-Home (2Performant) in Romania, with Affiliate consent. Other networks remain planned. A merchant or network may pay us a referral commission from their marketing budget — we do not add a BeforeToBuy fee. Final checkout price is always set by the merchant. Listed prices stay demo until product feeds are connected.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Price & Availability Verification</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    During beta, many prices are sample/demo and may not reflect live merchant feeds. Always confirm final price, VAT, shipping, availability, and delivery terms on the official merchant checkout page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Legal Index Links */}
          {activeTab === "legal" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium">
                Click any legal document below to view detailed compliance terms:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                <Link
                  href="/impressum"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Impressum / Notice</span>
                </Link>

                <Link
                  href="/terms"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Terms (AGB)</span>
                </Link>

                <Link
                  href="/privacy"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Privacy Policy</span>
                </Link>

                <Link
                  href="/cookies"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <Cookie className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Cookie Policy</span>
                </Link>

                <Link
                  href="/affiliate-disclosure"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <CircleHelp className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Affiliate Disclosure</span>
                </Link>

                <Link
                  href="/disclaimer"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">Price Disclaimer</span>
                </Link>

                <Link
                  href="/complaints"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <Scale className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Complaints</span>
                </Link>

                <Link
                  href="/accessibility"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <LifeBuoy className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Accessibility</span>
                </Link>

                <Link
                  href="/help"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <CircleHelp className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Help & FAQ</span>
                </Link>

                <Link
                  href="/status"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 transition-all"
                >
                  <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Platform Status</span>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: Supported Stores */}
          {activeTab === "stores" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium">
                Example merchants we aim to cover (beta may use sample/search links, not live affiliate feeds):
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "Digitec.ch (CH)",
                  "Galaxus.ch (CH)",
                  "MediaMarkt (CH)",
                  "Brack.ch (CH)",
                  "Microspot (CH)",
                  "Manor (CH)",
                  "Amazon (DE / FR / US)",
                  "eMAG (RO) — Profitshare live",
                  "evoMAG (RO) — 2Performant live",
                  "Rowenta (RO) — 2Performant live",
                  "Scule365 (RO) — 2Performant + product feed",
                  "AutoEco (RO) — 2Performant live",
                  "Soundhouse (RO) — 2Performant live",
                  "Autobob (RO) — 2Performant live",
                  "Automobilus (RO) — 2Performant live",
                  "PAA-Home (RO) — 2Performant live",
                  "Dedeman (RO) — DIY directory",
                ].map((store) => (
                  <span
                    key={store}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 font-medium text-slate-300"
                  >
                    <Store className="h-3.5 w-3.5 text-emerald-400" />
                    {store}
                  </span>
                ))}
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                >
                  <span>View All Stores Directory →</span>
                </Link>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400 font-medium mb-2">Browse by Product Department:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Link
                    href="/categories/electronics"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-emerald-400"
                  >
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Electronics & Tech
                  </Link>
                  <Link
                    href="/categories/fashion"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-emerald-400"
                  >
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Fashion & Apparel
                  </Link>
                  <Link
                    href="/categories/home"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-emerald-400"
                  >
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Home & Living
                  </Link>
                  <Link
                    href="/categories/auto"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-emerald-400"
                  >
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Automotive & Tires
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Company Registry Data */}
          {activeTab === "company" && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Legal Entity Name</span>
                  <span className="font-bold text-white text-sm">{COMPANY.legalName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Swiss UID (Unternehmens-Identifikationsnummer)</span>
                  <span className="font-mono text-emerald-400 font-bold">{COMPANY.uid}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Commercial Register</span>
                  <span className="text-slate-300 font-medium">{COMPANY.commercialRegistry}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">HR Number</span>
                  <span className="font-mono text-slate-300">{COMPANY.hrNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Official Address</span>
                  <span className="text-slate-300">{COMPANY.address.formatted}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Owner & Inhaber</span>
                  <span className="text-slate-300">{COMPANY.owner}</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-3 text-slate-400">
                <div className="flex items-center gap-4">
                  <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-1 hover:text-emerald-400">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{COMPANY.email}</span>
                  </a>
                  <a href={COMPANY.phoneHref} className="inline-flex items-center gap-1 hover:text-emerald-400">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{COMPANY.phone}</span>
                  </a>
                </div>

                <a
                  href={COMPANY.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 font-bold hover:underline"
                >
                  <span>Official Corporate Site ({COMPANY.website})</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
