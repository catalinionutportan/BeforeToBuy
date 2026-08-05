import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, MapPin, Database, Eye, Cookie, Mail, Clock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, DATA_PROCESSORS, LEGAL_CONTACT } from "@/lib/company-info";
import { DSAR_RESPONSE_DAYS, RETENTION_SCHEDULE } from "@/lib/legal-config";
import { HOME_UI } from "@/lib/i18n/ui";
import { useBrowseLocale } from "@/lib/i18n/client";

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.privacyMetaTitle,
  description: HOME_UI.en.privacyMetaDescription,
  path: "/privacy",
});

export default function PrivacyPage() {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {homeUi.privacyPolicyDEEN}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.privacyPolicyDEENTitle}</h1>
          <p className="text-slate-300 text-sm">
            {homeUi.privacyPolicyDEENText}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {homeUi.dataControllerTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.dataControllerIntroPart1}{" "}<strong>{COMPANY.platformName}</strong>{homeUi.dataControllerIntroPart2}
              <br />
              <strong>{COMPANY.legalName}</strong>
              <br />
              {COMPANY.address.formattedDe}
              <br />
              {homeUi.uid}: {COMPANY.uid} | {homeUi.email}:{" "}
              <a href={`mailto:${LEGAL_CONTACT.privacy}`} className="text-emerald-700 underline">
                {LEGAL_CONTACT.privacy}
              </a>
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-600" />
              {homeUi.cookiesAndConsentTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.cookiesAndConsentBodyPart1}{" "}
              <Link href="/cookies" className="text-emerald-700 underline font-semibold">
                {homeUi.cookiePolicy}
              </Link>{" "}
              {homeUi.cookiesAndConsentBodyPart2}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              {homeUi.locationDataTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.locationDataIntro}
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>{homeUi.locationDataPoint1}</li>
              <li>{homeUi.locationDataPoint2}</li>
              <li>{homeUi.locationDataPoint3}</li>
              <li>{homeUi.locationDataPoint4}</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              {homeUi.affiliateLinksProcessorsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.affiliateLinksProcessorsBody1}
            </p>
            <p className="text-xs text-slate-600 font-semibold mt-2">{homeUi.subProcessorsRecipients}</p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              {DATA_PROCESSORS.map((processor) => (
                <li key={processor.name}>
                  <strong>{processor.name}</strong> — {processor.purpose} ({processor.region})
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.retentionTitle}
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              {RETENTION_SCHEDULE.map((item) => (
                <li key={item.data}>
                  <strong>{item.data}:</strong> {item.retention}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.serverLogsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.serverLogsBody}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              {homeUi.yourRightsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.yourRightsBody1}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 mt-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                {homeUi.howToSubmitDSARTitle}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>
                  {homeUi.howToSubmitDSARStep1Part1}{" "}
                  <a href={`mailto:${LEGAL_CONTACT.dsar}`} className="text-emerald-700 underline font-semibold">
                    {LEGAL_CONTACT.dsar}
                  </a>{" "}
                  {homeUi.howToSubmitDSARStep1Part2}{" "}
                  <Link href="/contact" className="text-emerald-700 underline font-semibold">
                    {homeUi.contactForm}
                  </Link>{" "}
                  {homeUi.howToSubmitDSARStep1Part3}
                </li>
                <li>{homeUi.howToSubmitDSARStep2}</li>
                <li>{homeUi.howToSubmitDSARStep3}</li>
                <li>{formatUi(homeUi.howToSubmitDSARStep4, { dsarDays: DSAR_RESPONSE_DAYS })}</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
