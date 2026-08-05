import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Eye, Keyboard, Monitor } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, LEGAL_CONTACT } from "@/lib/company-info";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement",
  description: "Accessibility statement for BeforeToBuy.com — conformance goals, known limitations, and feedback contact.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
            {homeUi.accessibility}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.accessibilityStatement}</h1>
          <p className="text-slate-300 text-sm">
            {homeUi.accessibilityCommitment}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.conformanceGoal}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.conformanceGoalDescription}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.measuresImplemented}
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>{homeUi.measure1}</li>
              <li>{homeUi.measure2}</li>
              <li>{homeUi.measure3}</li>
              <li>{homeUi.measure4}</li>
              <li>{homeUi.measure5}</li>
              <li>{homeUi.measure6}</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.knownLimitations}
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>{homeUi.limitation1}</li>
              <li>{homeUi.limitation2}</li>
              <li>{homeUi.limitation3}</li>
              <li>{homeUi.limitation4}</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{homeUi.feedback}</h2>
            <p className="text-xs text-slate-600">
              {formatUi(homeUi.feedbackDescription, { legalContactEmail: LEGAL_CONTACT.complaints })}{" "}
            </p>
            <p className="text-xs text-slate-600">
              {homeUi.seeAlso}{" "}
              <Link href="/help" locale={DEFAULT_LOCALE} className="text-emerald-700 underline font-semibold">
                {homeUi.helpFAQ}
              </Link>{" "}
              {homeUi.and}{" "}
              <Link href="/complaints" locale={DEFAULT_LOCALE} className="text-emerald-700 underline font-semibold">
                {homeUi.complaintsProcedure}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
