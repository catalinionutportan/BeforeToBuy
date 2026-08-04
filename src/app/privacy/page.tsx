import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, MapPin, Database, Eye, Cookie, Mail, Clock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, DATA_PROCESSORS, LEGAL_CONTACT } from "@/lib/company-info";
import { DSAR_RESPONSE_DAYS, RETENTION_SCHEDULE } from "@/lib/legal-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy (Datenschutz) | BeforeToBuy.com",
  description: "Privacy Policy and Data Protection declaration for BeforeToBuy.com under Swiss nDSG and EU GDPR.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Datenschutzerklärung / Privacy Policy
          </span>
          <h1 className="text-3xl font-extrabold">Datenschutz & Privacy Policy</h1>
          <p className="text-slate-300 text-sm">
            Konform mit dem Schweizer Datenschutzgesetz (nDSG / revDSG) & EU-DSGVO (GDPR) — initial draft, not legal certification
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              1. Verantwortliche Stelle / Data Controller
            </h2>
            <p className="text-xs text-slate-600">
              Verantwortlich für die Datenverarbeitung auf der Webseite <strong>{COMPANY.platformName}</strong> ist:
              <br />
              <strong>{COMPANY.legalName}</strong>
              <br />
              {COMPANY.address.formattedDe}
              <br />
              UID: {COMPANY.uid} | E-Mail:{" "}
              <a href={`mailto:${LEGAL_CONTACT.privacy}`} className="text-emerald-700 underline">
                {LEGAL_CONTACT.privacy}
              </a>
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-600" />
              2. Cookies & Consent
            </h2>
            <p className="text-xs text-slate-600">
              We use essential local storage for the preference interface and a signed, HttpOnly consent cookie so the server can enforce optional location access. Location and affiliate features run only after you select those categories in the consent panel. See our{" "}
              <Link href="/cookies" className="text-emerald-700 underline font-semibold">
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              3. Location Data (consent-based)
            </h2>
            <p className="text-xs text-slate-600">
              Location features are <strong>not activated automatically</strong>. With your consent:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>Approximate location may be derived from your IP address (ipapi.co via our server).</li>
              <li>If you click &quot;Use GPS&quot;, browser GPS coordinates may be sent to our server and Nominatim for reverse geocoding.</li>
              <li>We do not store permanent movement profiles; location is used for demo country/city display only.</li>
              <li>Without consent, you can still browse using manual country selection (default: Switzerland).</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              4. Affiliate Links & Processors
            </h2>
            <p className="text-xs text-slate-600">
              Outbound merchant links are disabled until you accept affiliate consent. Partner stores may set their own cookies when you visit them.
            </p>
            <p className="text-xs text-slate-600 font-semibold mt-2">Sub-processors / recipients:</p>
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
              5. Retention
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
              6. Server Logs & Contact Data
            </h2>
            <p className="text-xs text-slate-600">
              Vercel edge logs may temporarily record IP address, browser type, referrer, and timestamps for security and stability. Contact form data (name, email, message) is processed to respond to your inquiry and deleted when no longer needed.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              7. Your Rights & DSAR Procedure
            </h2>
            <p className="text-xs text-slate-600">
              Under Swiss nDSG and EU GDPR you may request access, rectification, deletion, restriction, portability, or object to processing of your personal data.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 mt-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                How to submit a Data Subject Access Request (DSAR)
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>
                  Email{" "}
                  <a href={`mailto:${LEGAL_CONTACT.dsar}`} className="text-emerald-700 underline font-semibold">
                    {LEGAL_CONTACT.dsar}
                  </a>{" "}
                  or use the{" "}
                  <Link href="/contact" className="text-emerald-700 underline font-semibold">
                    contact form
                  </Link>{" "}
                  with topic &quot;Data Privacy & Legal Request (DSAR)&quot;.
                </li>
                <li>Include your name, contact email, and the right you wish to exercise.</li>
                <li>We may ask for reasonable identity verification before fulfilling the request.</li>
                <li>We respond within <strong>{DSAR_RESPONSE_DAYS} days</strong> (GDPR Art. 12; nDSG comparable timeframe).</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
