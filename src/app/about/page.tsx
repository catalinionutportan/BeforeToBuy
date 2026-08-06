import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Zap,
  Building2,
  Search,
  ExternalLink,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI.en;

export const metadata: Metadata = createPageMetadata({
  title: "About Us & How It Works",
  description: homeUi.metaDescription,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell>
      <div className="space-y-10">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
            {homeUi.aboutBeforeToBuy}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {homeUi.smartPriceComparisonTitle}
          </h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            {homeUi.aboutDescription}
          </p>
        </div>

        {/* What to expect — clear product promise */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              {homeUi.whatToExpectTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{homeUi.whatToExpectIntro}</p>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{homeUi.whatToExpectPoint1}</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{homeUi.whatToExpectPoint2}</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{homeUi.whatToExpectPoint3}</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{homeUi.whatToExpectPoint4}</span>
            </li>
          </ul>
        </div>

        {/* 4-Step Process Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-600" />
              {homeUi.howWorksTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {homeUi.howWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                {homeUi.step1Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {homeUi.step1Description}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {homeUi.step2Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {homeUi.step2Description}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                {homeUi.step3Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {homeUi.step3Description}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {homeUi.step4Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {homeUi.step4Description}
              </p>
            </div>

          </div>
        </div>

        {/* Business Model & Monetization Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              {homeUi.howWeMakeMoneyTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {homeUi.howWeMakeMoneySubtitle}
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p className="text-xs sm:text-sm">
              {homeUi.freeForConsumers}
            </p>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                {homeUi.zeroMarkupGuarantee}
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {homeUi.zeroMarkupDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Company & Entity Information */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              {homeUi.companyDetailsTitle}
            </h2>
          </div>

          <CompanyDetailsCard />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              {homeUi.companyDetailsQuestions}{" "}
              <Link href="/legal" className="text-emerald-700 font-bold hover:underline">
                {homeUi.legalHub}
              </Link>{" "}
              ·{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 font-bold hover:underline">
                {COMPANY.email}
              </a>
            </div>
            <Link
              href="/contact"
              className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>{homeUi.contactUs}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
