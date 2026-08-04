import type { Metadata } from "next";
import {
  ShieldCheck,
  Building2,
  Globe,
  CheckCircle2,
  ExternalLink,
  Info,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { AFFILIATE_NETWORKS, COMPANY } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "Affiliate Disclosure & Transparency Statement | BeforeToBuy.com",
  description:
    "Official Affiliate Disclosure statement for BeforeToBuy.com operated by PortanX - Catalin Portan.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <PageShell>
      <div className="space-y-8">

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full">
              Transparency & Legal Compliance
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Affiliate Disclosure Statement</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            BeforeToBuy.com believes in full disclosure and transparency regarding how our price comparison platform is funded and operated.
          </p>
        </div>

        <LegalDraftNotice />

        {/* Main Disclosure Body */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1: Overview */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              1. 100% Free Service & Commission Model
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              <strong>{COMPANY.platformName}</strong> is operated by <strong>{COMPANY.legalName}</strong> (UID: {COMPANY.uid}), based in Bern, Switzerland.
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              Our website is <strong>completely free for consumers</strong>. We do not sell products directly, collect payment details, or charge user subscription fees. Instead, we act as an independent price aggregator and shopping search directory.
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              When you click on an outbound product offer link or &quot;Search Store&quot; button on {COMPANY.platformName}, you are redirected to the official merchant&apos;s website. Live affiliate deep links (e.g. Brack.ch via AWIN) are used where configured; other merchants may use search redirects until feeds are connected. If you complete a qualifying purchase on the merchant&apos;s site, we may receive a referral commission from the merchant or affiliate network.
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Crucial Note: These referral commissions come at <strong>ZERO additional cost</strong> to you. The price you pay on the merchant's site is identical whether you visit directly or through BeforeToBuy.com.
              </span>
            </div>
          </div>

          {/* Section 2: Multilingual Disclosure Statements */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              2. Multilingual Official Disclosure Texts
            </h2>

            {/* English */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="text-base">🇬🇧</span> English Disclosure Statement
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "BeforeToBuy.com is a free price comparison and local GPS shopping service operated by PortanX - Catalin Portan (UID CHE-373.501.736), Bern, Switzerland. We participate in affiliate marketing networks including AWIN, Amazon Associates, Digitec Galaxus Partner Program, CJ Affiliate, and 2Performant. When you click links on our site to purchase products from merchant partners, we may earn a small referral commission at no additional cost to you."
              </p>
            </div>

            {/* German */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="text-base">🇨🇭 / 🇩🇪</span> Deutsche Offenlegungserklärung (Elveția & Germania)
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "BeforeToBuy.com ist ein kostenloser Preisvergleichs- und GPS-Einkaufsdienst, betrieben von PortanX - Catalin Portan (UID CHE-373.501.736), Bern, Schweiz. Wir nehmen an Partnerprogrammen (Affiliate-Netzwerken) wie AWIN, Amazon-Partnerprogramm, Digitec Galaxus Partnerprogramm, CJ Affiliate und 2Performant teil. Wenn Sie auf Links auf unserer Website klicken und beim Händler einkaufen, erhalten wir möglicherweise eine kleine Vermittlungsprovision — ohne jegliche Mehrkosten für Sie."
              </p>
            </div>

            {/* Romanian */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="text-base">🇷🇴</span> Declarație de Afiliere în Limba Română
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "BeforeToBuy.com este un comparator gratuit de prețuri operat de PortanX - Catalin Portan (UID CHE-373.501.736), Berna, Elveția. Participăm în rețele de afiliere precum AWIN, Amazon Associates, Digitec Galaxus Merchant, CJ Affiliate și 2Performant. În cazul în care efectuați o achiziție după ce ați apăsat pe un link de pe site-ul nostru, putem primi un comision de recomandare din partea magazinului, fără niciun cost suplimentar pentru dumneavoastră."
              </p>
            </div>
          </div>

          {/* Section 3: Affiliate Networks List */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-600" />
              3. Participating Affiliate Networks & Merchant Programs
            </h2>
            <p className="text-xs text-slate-600">
              {COMPANY.platformName} participates in or is preparing integrations with affiliate networks. Brack.ch (CH) uses AWIN live feed links where configured:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {AFFILIATE_NETWORKS.map((network) => (
                <div key={network} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{network}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Responsible Entity */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              4. Responsible Company Information
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Company:</strong> {COMPANY.legalName}</p>
              <p><strong>Address:</strong> {COMPANY.address.formatted}</p>
              <p><strong>UID:</strong> {COMPANY.uid} | <strong>HR-Nr:</strong> {COMPANY.hrNumber}</p>
              <p><strong>Email:</strong> <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 font-bold underline">{COMPANY.email}</a></p>
              <p><strong>Company Website:</strong> <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">{COMPANY.website}</a></p>
            </div>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
