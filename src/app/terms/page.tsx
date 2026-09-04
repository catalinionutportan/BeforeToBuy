import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Copyright } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyEmailLink } from "@/components/CompanyEmailLink";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { COMPANY } from "@/lib/company-info";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

const POLICY_LABELS = {
  en: {
    privacy: "Privacy Policy",
    and: "and",
    updateLead: "We may update these terms when needed. Complaints:",
    contact: "Contact:",
  },
  de: {
    privacy: "Datenschutzrichtlinie",
    and: "und",
    updateLead: "Wir können diese Bedingungen bei Bedarf aktualisieren. Beschwerden:",
    contact: "Kontakt:",
  },
  fr: {
    privacy: "Politique de confidentialité",
    and: "et",
    updateLead: "Nous pouvons mettre à jour ces conditions si nécessaire. Réclamations :",
    contact: "Contact :",
  },
  it: {
    privacy: "Informativa privacy",
    and: "e",
    updateLead: "Possiamo aggiornare questi termini quando necessario. Reclami:",
    contact: "Contatto:",
  },
  ro: {
    privacy: "Politica de confidențialitate",
    and: "și",
    updateLead: "Putem actualiza acești termeni atunci când este necesar. Plângeri:",
    contact: "Contact:",
  },
} as const;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  return createPageMetadata({
    title: homeUi.termsMetaTitle,
    description: homeUi.termsMetaDescription,
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];
  const legalCopy = getLegalCopy(locale);
  const policyLabels = POLICY_LABELS[locale];

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {homeUi.termsAGBDEEN}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.termsAGBTitle}</h1>
          <p className="text-slate-300 text-sm">
            {formatUi(homeUi.termsAGBIntro, { platformName: COMPANY.platformName })}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsServiceDescriptionTitle}
            </h2>
            <p
              className="text-xs text-slate-600"
              dangerouslySetInnerHTML={{
                __html: formatUi(homeUi.termsServiceDescriptionBody, {
                  platformName: COMPANY.platformName,
                  legalName: COMPANY.legalName,
                  uid: COMPANY.uid,
                }),
              }}
            />
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsPricesProductsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.termsPricesProductsBody1}{" "}
              <strong>{homeUi.termsPricesProductsBody2}</strong>{" "}
              {homeUi.termsPricesProductsBody3}{" "}
              <Link href={withLangParam("/disclaimer", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.priceServiceDisclaimer}
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsThirdPartyContractsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.termsThirdPartyContractsBody1}{" "}
              {homeUi.termsThirdPartyContractsBody2}{" "}
              <Link href={withLangParam("/help", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.helpAndFAQ}
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {legalCopy.terms.userDutiesTitle}
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              {legalCopy.terms.userDutiesItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                <Link href={withLangParam("/privacy", locale)} className="text-emerald-700 underline font-semibold">
                  {policyLabels.privacy}
                </Link>{" "}
                {policyLabels.and}{" "}
                <Link href={withLangParam("/cookies", locale)} className="text-emerald-700 underline font-semibold">
                  {homeUi.cookiePolicy}
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {legalCopy.terms.liabilityTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {formatUi(legalCopy.terms.liabilityBody, { platformName: COMPANY.platformName })}
            </p>
            <p className="text-xs text-slate-600">
              {legalCopy.terms.liabilityBody2}{" "}
              <Link href={withLangParam("/disclaimer", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.priceServiceDisclaimer}
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Copyright className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {legalCopy.terms.intellectualPropertyTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {formatUi(legalCopy.terms.intellectualPropertyBody, { platformName: COMPANY.platformName })}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {legalCopy.terms.governingLawTitle}
            </h2>
            <p className="text-xs text-slate-600">{legalCopy.terms.governingLawBody}</p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{legalCopy.terms.changesContactTitle}</h2>
            <p className="text-xs text-slate-600">
              {policyLabels.updateLead}{" "}
              <Link href={withLangParam("/complaints", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.complaintsProcedure}
              </Link>
              . {policyLabels.contact}{" "}
              <CompanyEmailLink className="text-emerald-700 underline font-semibold" />
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
