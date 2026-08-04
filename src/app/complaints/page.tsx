import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareWarning, Mail, Clock, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, LEGAL_CONTACT } from "@/lib/company-info";
import { DSAR_RESPONSE_DAYS } from "@/lib/legal-config";

export const metadata: Metadata = createPageMetadata({
  title: "Complaints Procedure | BeforeToBuy.com",
  description: "How to submit complaints about BeforeToBuy.com — response times and escalation steps.",
  path: "/complaints",
});

export default function ComplaintsPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <MessageSquareWarning className="w-3.5 h-3.5" aria-hidden="true" />
            Complaints
          </span>
          <h1 className="text-3xl font-extrabold">Complaints Procedure</h1>
          <p className="text-slate-300 text-sm">
            How to raise concerns about {COMPANY.platformName} — operated by {COMPANY.legalName}.
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Scope</h2>
            <p className="text-xs text-slate-600">
              This procedure covers complaints about {COMPANY.platformName} itself (website functionality, misleading
              labels, privacy, affiliate disclosure, contact handling). It does <strong>not</strong> cover product
              quality, delivery, returns, or refunds from merchants — contact the merchant directly for order issues.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">How to submit a complaint</h2>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 pl-1">
              <li>
                Email{" "}
                <a href={`mailto:${LEGAL_CONTACT.complaints}`} className="text-emerald-700 underline font-semibold">
                  {LEGAL_CONTACT.complaints}
                </a>{" "}
                or use the{" "}
                <Link href="/contact" className="text-emerald-700 underline font-semibold">
                  contact form
                </Link>
                .
              </li>
              <li>Include your name, email, date of incident, and a clear description of the issue.</li>
              <li>For privacy-related complaints, you may also exercise DSAR rights under our Privacy Policy.</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Response times
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="font-bold text-slate-900">General complaints</p>
                <p className="text-slate-600 mt-1">Acknowledgement within 5 business days; substantive response within 30 days.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="font-bold text-slate-900">Privacy / DSAR requests</p>
                <p className="text-slate-600 mt-1">Response within {DSAR_RESPONSE_DAYS} days per Privacy Policy (GDPR / nDSG).</p>
              </div>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Escalation
            </h2>
            <p className="text-xs text-slate-600">
              If you remain unsatisfied after our response, you may contact the relevant data protection authority
              for privacy matters, or seek advice from consumer protection bodies in your country for commercial disputes.
              Swiss users may contact the{" "}
              <a
                href="https://www.edoeb.admin.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-semibold"
              >
                FDPIC (EDÖB)
              </a>{" "}
              for data protection issues.
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
