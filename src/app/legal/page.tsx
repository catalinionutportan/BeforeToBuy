import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { LegalCookieSettingsRow } from "@/components/LegalCookieSettingsRow";
import { COMPANY } from "@/lib/company-info";
import { getLegalCompanySections, getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

const LEGAL_READ_MORE_LABELS = {
  en: { privacy: "Privacy Policy", terms: "Terms and Conditions", messageNumber: "Message number", dailyRegister: "Daily register" },
  de: { privacy: "Datenschutzrichtlinie", terms: "AGB", messageNumber: "Meldungsnummer", dailyRegister: "Tagesregister" },
  fr: { privacy: "Politique de confidentialité", terms: "Conditions générales", messageNumber: "Numéro de message", dailyRegister: "Registre journalier" },
  it: { privacy: "Informativa privacy", terms: "Termini e condizioni", messageNumber: "Numero di messaggio", dailyRegister: "Registro giornaliero" },
  ro: { privacy: "Politica de confidențialitate", terms: "Termeni și condiții", messageNumber: "Număr mesaj", dailyRegister: "Registru zilnic" },
} as const;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  return createPageMetadata({
    title: homeUi.legalMetaTitle,
    description: homeUi.legalMetaDescription,
    path: "/legal",
    locale,
  });
}

export default async function LegalHubPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];
  const legalCopy = getLegalCopy(locale);
  const sections = getLegalCompanySections(locale);
  const readMoreLabels = LEGAL_READ_MORE_LABELS[locale];

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <div className="space-y-10">
        <header className="space-y-3 border-b border-slate-200 pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e85d04]">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            {homeUi.legalCompanyLink}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {homeUi.legalAndCompanyInfo}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            {homeUi.legalHubIntro}{" "}
            {formatUi(legalCopy.legalHub.heroBody, { legalName: COMPANY.legalName, uid: COMPANY.uid })}
          </p>
        </header>

        <LegalDraftNotice />

        <section aria-labelledby="firm-data" className="space-y-4">
          <h2 id="firm-data" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Building2 className="h-5 w-5 text-[#e85d04]" aria-hidden="true" />
            {legalCopy.legalHub.firmDataTitle}
          </h2>
          <CompanyDetailsCard />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">{legalCopy.legalHub.registrySummaryTitle}</p>
            <p className="mt-2">{COMPANY.shabNoticeDe}</p>
            <p className="mt-3 text-slate-500">
              {COMPANY.registryPublication.publicationDateDisplay} · {readMoreLabels.messageNumber}{" "}
              {COMPANY.registryPublication.shabMessageNumber} ·{" "}
              {readMoreLabels.dailyRegister} {COMPANY.registryPublication.dailyRegisterDisplay}
            </p>
            <p className="mt-1 text-slate-500">
              {legalCopy.legalHub.registryPublishingOfficeLabel}: {COMPANY.registryPublication.publishingOffice},{" "}
              {COMPANY.registryPublication.publishingOfficeAddress}
            </p>
            <p className="mt-1 text-slate-500">
              {legalCopy.legalHub.registryContactOfficeLabel}: {COMPANY.registryPublication.registryOffice}
            </p>
          </div>
        </section>

        <section aria-labelledby="cookie-settings" className="space-y-3">
          <h2 id="cookie-settings" className="text-lg font-bold text-slate-900">
            {legalCopy.legalHub.cookieSettingsTitle}
          </h2>
          <p className="text-xs text-slate-500">{legalCopy.legalHub.cookieSettingsBody}</p>
          <LegalCookieSettingsRow />
        </section>

        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`legal-sec-${section.id}`} className="space-y-3">
            <h2 id={`legal-sec-${section.id}`} className="text-lg font-bold text-slate-900">
              {section.title}
            </h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={withLangParam(item.href, locale)}
                    className="group flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-orange-50/40 sm:px-5"
                  >
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-semibold text-slate-900 group-hover:text-[#e85d04]">
                        {item.label}
                      </span>
                      <span className="block text-xs leading-relaxed text-slate-500">{item.description}</span>
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#e85d04]"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-center text-[11px] text-slate-400">
          {homeUi.readMore}:{" "}
          <Link href={withLangParam("/impressum", locale)} className="font-semibold text-slate-600 hover:text-[#e85d04]">
            Impressum
          </Link>
          {" · "}
          <Link href={withLangParam("/privacy", locale)} className="font-semibold text-slate-600 hover:text-[#e85d04]">
            {readMoreLabels.privacy}
          </Link>
          {" · "}
          <Link href={withLangParam("/terms", locale)} className="font-semibold text-slate-600 hover:text-[#e85d04]">
            {readMoreLabels.terms}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
