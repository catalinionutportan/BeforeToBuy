import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareWarning, Mail, Clock, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, LEGAL_CONTACT } from "@/lib/company-info";
import { DSAR_RESPONSE_DAYS } from "@/lib/legal-config";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  return createPageMetadata({
    title: homeUi.complaintsMetaTitle,
    description: homeUi.complaintsMetaDescription,
    path: "/complaints",
    locale,
  });
}

export default async function ComplaintsPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <MessageSquareWarning className="w-3.5 h-3.5" aria-hidden="true" />
            {homeUi.complaints}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.complaintsProcedure}</h1>
          <p className="text-slate-300 text-sm">
            {formatUi(homeUi.complaintsIntro, { platformName: COMPANY.platformName, legalName: COMPANY.legalName })}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">{homeUi.complaintsScopeTitle}</h2>
            <p className="text-xs text-slate-600">
              {formatUi(homeUi.complaintsScopeBody, { platformName: COMPANY.platformName })}
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{homeUi.complaintsSubmitTitle}</h2>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 pl-1">
              <li>
                {homeUi.complaintsSubmitStep1Email}{" "}
                <a href={`mailto:${LEGAL_CONTACT.complaints}`} className="text-emerald-700 underline font-semibold">
                  {LEGAL_CONTACT.complaints}
                </a>{" "}
                {homeUi.complaintsSubmitStep1OrUse}{" "}
                <Link href={withLangParam("/contact", locale)} className="text-emerald-700 underline font-semibold">
                  {homeUi.contactForm}
                </Link>
                {homeUi.complaintsSubmitStep1Dot}
              </li>
              <li>{homeUi.complaintsSubmitStep2}</li>
              <li>{homeUi.complaintsSubmitStep3}</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.complaintsResponseTimesTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="font-bold text-slate-900">{homeUi.generalComplaints}</p>
                <p className="text-slate-600 mt-1">{homeUi.generalComplaintsResponseTime}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="font-bold text-slate-900">{homeUi.privacyDSARRequests}</p>
                <p className="text-slate-600 mt-1">{formatUi(homeUi.privacyDSARResponseTime, { dsarDays: DSAR_RESPONSE_DAYS })}</p>
              </div>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.escalationTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.escalationBodyPart1}{" "}
              <a
                href="https://www.edoeb.admin.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-semibold"
              >
                FDPIC (EDÖB)
              </a>{" "}
              {homeUi.escalationBodyPart2}
            </p>
          </section>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs flex items-start gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>{COMPANY.legalName}</strong> · {COMPANY.address.formatted} ·{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 underline">
                {COMPANY.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
