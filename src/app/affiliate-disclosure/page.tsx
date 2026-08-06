import type { Metadata } from "next";
import {
  ShieldCheck,
  Building2,
  Globe,
  ExternalLink,
  Info,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { AFFILIATE_NETWORKS, COMPANY, STAGE_ZERO_MONETIZATION } from "@/lib/company-info";
import { SITE_PHASE } from "@/lib/site-config";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const metadata: Metadata = createPageMetadata({
  title: "Affiliate Disclosure & Transparency Statement",
  description: "Official Affiliate Disclosure statement for BeforeToBuy.com operated by PortanX - Catalin Portan.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <PageShell>
      <div className="space-y-8">

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full">
              {homeUi.transparencyLegalCompliance}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{homeUi.affiliateDisclosureStatement}</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            {homeUi.affiliateDisclosureIntro}
          </p>
        </div>

        <LegalDraftNotice />

        {/* Main Disclosure Body */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1: Overview */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {homeUi.freeServiceCommissionModel}
            </h2>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 leading-relaxed">
              <p className="font-bold mb-1">Stage-zero notice (phase: {SITE_PHASE})</p>
              <p>{STAGE_ZERO_MONETIZATION.en}</p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {formatUi(homeUi.companyOperationDetails, { companyPlatformName: COMPANY.platformName, companyLegalName: COMPANY.legalName, companyUid: COMPANY.uid })}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              {homeUi.freeForConsumersBody}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              {formatUi(homeUi.commissionDetails, { companyPlatformName: COMPANY.platformName })}
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {homeUi.crucialNote}
              </span>
            </div>
          </div>

          {/* Section 2: Multilingual Disclosure Statements */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              {homeUi.multilingualDisclosureTexts}
            </h2>

            {/* English */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                {homeUi.englishDisclosureTitle}
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                {homeUi.englishDisclosureText}
              </p>
            </div>

            {/* German */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                {homeUi.germanDisclosureTitle}
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                {homeUi.germanDisclosureText}
              </p>
            </div>

            {/* Romanian */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                {homeUi.romanianDisclosureTitle}
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                {homeUi.romanianDisclosureText}
              </p>
            </div>
          </div>

          {/* Section 3: Affiliate Networks List */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-600" />
              {homeUi.participatingAffiliateNetworks}
            </h2>
            <p className="text-xs text-slate-600">
              {formatUi(homeUi.affiliateNetworksIntro, { companyPlatformName: COMPANY.platformName })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {AFFILIATE_NETWORKS.map((network) => (
                <div key={network} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-400 text-[9px] font-bold text-amber-700" aria-hidden="true">
                    P
                  </span>
                  <span>{network}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Responsible Entity */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              {homeUi.responsibleCompanyInformation}
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>{homeUi.company}</strong> {COMPANY.legalName}</p>
              <p><strong>{homeUi.address}</strong> {COMPANY.address.formatted}</p>
              <p><strong>{homeUi.uid}</strong> {COMPANY.uid} | <strong>{homeUi.hrNr}</strong> {COMPANY.hrNumber}</p>
              <p><strong>{homeUi.email}</strong> <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 font-bold underline">{COMPANY.email}</a></p>
              <p><strong>{homeUi.companyWebsite}</strong> <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">{COMPANY.website}</a></p>
            </div>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
