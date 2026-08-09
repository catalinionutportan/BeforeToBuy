import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  BadgePercent,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Building2,
  Lock,
  Scale,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { COMPANY } from "@/lib/company-info";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { formatUi } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const copy = getLegalCopy(locale).transparency;

  return createPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/transparency",
    locale,
  });
}

export default async function TransparencyPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const copy = getLegalCopy(locale).transparency;

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.badge}
          </span>
          <h1 className="text-3xl font-extrabold">{copy.title}</h1>
          <p className="text-sm text-slate-300">{copy.intro}</p>
        </div>

        <LegalDraftNotice />

        <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-emerald-500/15 p-2 text-emerald-700">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                {copy.operatorNoticeTitle}
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {formatUi(copy.operatorNoticeBody, {
                  legalName: COMPANY.legalName,
                  uid: COMPANY.uid,
                })}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              {copy.companyCardTitle}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {formatUi(copy.companyCardBody, {
                legalName: COMPANY.legalName,
                legalForm: COMPANY.legalForm[locale],
                registryOffice: COMPANY.commercialRegistry,
                dailyRegisterNumber: COMPANY.registryPublication.dailyRegisterNumber,
                messageNumber: COMPANY.registryPublication.shabMessageNumber,
              })}
            </p>
            <Link href={withLangParam("/impressum", locale)} className="inline-flex text-xs font-semibold text-emerald-700 underline">
              {copy.companyCardLink} →
            </Link>
          </article>

          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <BadgePercent className="h-4 w-4 shrink-0" aria-hidden="true" />
              {copy.affiliateCardTitle}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{copy.affiliateCardBody}</p>
            <Link href={withLangParam("/affiliate-disclosure", locale)} className="inline-flex text-xs font-semibold text-amber-800 underline">
              {copy.affiliateCardLink} →
            </Link>
          </article>

          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-sky-700">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {copy.priceCardTitle}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{copy.priceCardBody}</p>
            <Link href={withLangParam("/disclaimer", locale)} className="inline-flex text-xs font-semibold text-sky-800 underline">
              {copy.priceCardLink} →
            </Link>
          </article>
        </div>

        <CompanyDetailsCard />

        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Related pages">
          <Link
            href={withLangParam("/legal", locale)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Scale className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {copy.legalHubLabel}
          </Link>
          <Link
            href={withLangParam("/impressum", locale)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Building2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {copy.impressumLabel}
          </Link>
          <Link
            href={withLangParam("/privacy", locale)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Lock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {copy.privacyLabel}
          </Link>
          <Link
            href={withLangParam("/stores", locale)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            {copy.merchantDirectoryLabel}
          </Link>
        </nav>
      </div>
    </PageShell>
  );
}
