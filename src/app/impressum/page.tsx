import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Mail, MapPin, ShieldCheck, FileText, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum | BeforeToBuy.com",
  description: "Official legal impressum and company information for BeforeToBuy.com - PortanX - Catalin Portan",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
          >
            ← Back to BeforeToBuy.com
          </Link>
        </div>

        {/* Header */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Rechtliche Hinweise / Legal Notice
          </span>
          <h1 className="text-3xl font-extrabold">Impressum</h1>
          <p className="text-slate-300 text-sm">
            Offizielle Angaben gemäss Schweizerischem Recht (E-Commerce-Gesetz & UWG)
          </p>
        </div>

        {/* Company Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">PortanX - Catalin Portan</h2>
              <p className="text-xs text-slate-500 font-medium">Einzelunternehmen (Sole Proprietorship)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
            {/* Address */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Unternehmensadresse / Address</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                PortanX - Catalin Portan<br />
                Flurstrasse 24<br />
                CH-3014 Bern<br />
                Kanton Bern, Schweiz / Switzerland
              </p>
            </div>

            {/* Commercial Register */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Handelsregister / HR Infos</span>
              </div>
              <div className="text-slate-600 leading-relaxed text-xs space-y-1">
                <p><strong>Status:</strong> Aktiv / Active</p>
                <p><strong>Sitz:</strong> Bern (Kanton Bern)</p>
                <p><strong>UID:</strong> CHE-373.501.736</p>
                <p><strong>HR-Nummer:</strong> CH-036.1.108.540-6</p>
                <p><strong>Eintragung:</strong> 24.07.2026</p>
              </div>
            </div>
          </div>

          {/* Contact & Business Purpose */}
          <div className="space-y-4 border-t border-slate-100 pt-6 text-sm text-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <strong>Website der Firma:</strong>
                <a href="https://portanx.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                  https://portanx.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <strong>Email:</strong>
                <a href="mailto:admin@portanx.com" className="text-emerald-700 font-semibold hover:underline">
                  admin@portanx.com
                </a>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 text-xs space-y-1 text-slate-800">
              <p className="font-bold text-slate-900">Unternehmenszweck / Business Purpose:</p>
              <p className="text-slate-600">
                Entwicklung von Software, mobilen Apps, Webplattformen und digitalen Dienstleistungen.
                Betreiber der Preisvergleichs- und Geolokalisierungs-Plattform <strong>BeforeToBuy.com</strong>.
              </p>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="space-y-3 border-t border-slate-100 pt-6 text-xs text-slate-500 leading-relaxed">
            <h3 className="font-bold text-slate-800 text-sm">Haftungsausschluss / Disclaimer</h3>
            <p>
              <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte (insbesondere Produktpreise und Verfügbarkeiten) übernehmen wir jedoch keine Gewähr.
            </p>
            <p>
              <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Webseiten Dritter (Affiliate-Partner), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
            <p>
              <strong>Urheberrecht:</strong> Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Schweizerischen Urheberrecht.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
