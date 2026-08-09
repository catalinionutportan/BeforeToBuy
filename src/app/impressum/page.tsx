import type { Metadata } from "next";
import { Building2, FileCheck2, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { COMPANY } from "@/lib/company-info";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);

  return createPageMetadata({
    title: legalCopy.impressum.metaTitle,
    description: legalCopy.impressum.metaDescription,
    path: "/impressum",
    locale,
  });
}

export default async function ImpressumPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);
  const copy = legalCopy.impressum;

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {copy.badge}
          </span>
          <h1 className="text-3xl font-extrabold">Impressum</h1>
          <p className="text-slate-300 text-sm">{copy.intro}</p>
        </div>

        <LegalDraftNotice />

        <CompanyDetailsCard />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {copy.businessPurposeTitle}
            </h2>
            <p className="text-xs text-slate-600">{COMPANY.businessPurpose[locale]}</p>
            {locale !== "en" ? <p className="text-xs text-slate-500">{COMPANY.businessPurpose.en}</p> : null}
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {copy.registerPublicationTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2">
              <p><strong className="text-slate-800">{copy.registerCategoryLabel}:</strong> {COMPANY.registryPublication.registerCategory}</p>
              <p><strong className="text-slate-800">{copy.subcategoryLabel}:</strong> {COMPANY.registryPublication.subcategory}</p>
              <p><strong className="text-slate-800">{copy.publicationDateLabel}:</strong> {COMPANY.registryPublication.publicationDateDisplay}</p>
              <p><strong className="text-slate-800">{copy.messageNumberLabel}:</strong> {COMPANY.registryPublication.shabMessageNumber}</p>
              <p><strong className="text-slate-800">{copy.dailyRegisterLabel}:</strong> {COMPANY.registryPublication.dailyRegisterDisplay}</p>
              <p><strong className="text-slate-800">{copy.contactOfficeLabel}:</strong> {COMPANY.registryPublication.registryOffice}</p>
              <p className="sm:col-span-2">
                <strong className="text-slate-800">{copy.publishingOfficeLabel}:</strong>{" "}
                {COMPANY.registryPublication.publishingOffice}, {COMPANY.registryPublication.publishingOfficeAddress}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-800">{COMPANY.registryPublication.noticeTitle}</p>
            <p className="text-xs leading-relaxed text-slate-600">{COMPANY.shabNoticeDe}</p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              {copy.disclaimerTitle}
            </h3>
            <p>
              <strong>{copy.contentLiabilityTitle}:</strong> {copy.contentLiabilityBody}
            </p>
            <p>
              <strong>{copy.linkLiabilityTitle}:</strong> {copy.linkLiabilityBody}
            </p>
            <p>
              <strong>{copy.copyrightTitle}:</strong> {copy.copyrightBody}
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
