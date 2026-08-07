import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { LegalCookieSettingsRow } from "@/components/LegalCookieSettingsRow";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";
import { LEGAL_COMPANY_SECTIONS } from "@/lib/legal-index";
import { HOME_UI } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const metadata: Metadata = createPageMetadata({
  title: "Legal & Companie | BeforeToBuy.com",
  description:
    "Central Legal & Company hub for BeforeToBuy.com — terms, privacy, cookies, affiliate disclosure, impressum, SHAB registry data, and all mandatory public links.",
  path: "/legal",
});

export default function LegalHubPage() {
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
            {homeUi.legalHubIntro} Operated by {COMPANY.legalName} (UID {COMPANY.uid}). Every mandatory
            public document and policy link for audits, partners, and users is listed below.
          </p>
        </header>

        <LegalDraftNotice />

        <section aria-labelledby="firm-data" className="space-y-4">
          <h2 id="firm-data" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Building2 className="h-5 w-5 text-[#e85d04]" aria-hidden="true" />
            Firm data · UID · HR · SHAB
          </h2>
          <CompanyDetailsCard />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">{COMPANY.registryPublication.noticeTitle}</p>
            <p className="mt-2">{COMPANY.shabNoticeDe}</p>
            <p className="mt-3 text-slate-500">
              {COMPANY.registryPublication.publicationDateDisplay} · Meldungsnummer{" "}
              {COMPANY.registryPublication.shabMessageNumber} ·{" "}
              {COMPANY.registryPublication.dailyRegisterDisplay}
            </p>
            <p className="mt-1 text-slate-500">
              Publizierende Stelle: {COMPANY.registryPublication.publishingOffice},{" "}
              {COMPANY.registryPublication.publishingOfficeAddress}
            </p>
            <p className="mt-1 text-slate-500">
              Kontaktstelle: {COMPANY.registryPublication.registryOffice}
            </p>
          </div>
        </section>

        <section aria-labelledby="cookie-settings" className="space-y-3">
          <h2 id="cookie-settings" className="text-lg font-bold text-slate-900">
            Cookie Settings
          </h2>
          <p className="text-xs text-slate-500">
            Open the consent dialog to change Essential, Location, Affiliate, and Analytics preferences.
          </p>
          <LegalCookieSettingsRow />
        </section>

        {LEGAL_COMPANY_SECTIONS.map((section) => (
          <section key={section.id} aria-labelledby={`legal-sec-${section.id}`} className="space-y-3">
            <h2 id={`legal-sec-${section.id}`} className="text-lg font-bold text-slate-900">
              {section.title}
            </h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
          <Link href="/impressum" className="font-semibold text-slate-600 hover:text-[#e85d04]">
            Impressum
          </Link>
          {" · "}
          <Link href="/privacy" className="font-semibold text-slate-600 hover:text-[#e85d04]">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="font-semibold text-slate-600 hover:text-[#e85d04]">
            Terms
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
