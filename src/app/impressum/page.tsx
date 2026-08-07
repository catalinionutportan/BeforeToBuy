import type { Metadata } from "next";
import { Building2, FileCheck2, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "Impressum | BeforeToBuy.com",
  description: "Official legal impressum and company information for BeforeToBuy.com - PortanX - Catalin Portan",
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Rechtliche Hinweise / Legal Notice
          </span>
          <h1 className="text-3xl font-extrabold">Impressum</h1>
          <p className="text-slate-300 text-sm">
            Offizielle Anbieterangaben gemäss Schweizer Recht und Art. 3 Abs. 1 lit. s UWG
          </p>
        </div>

        <LegalDraftNotice />

        <CompanyDetailsCard />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Unternehmenszweck / Business Purpose
            </h2>
            <p className="text-xs text-slate-600">{COMPANY.businessPurpose.de}</p>
            <p className="text-xs text-slate-500">{COMPANY.businessPurpose.en}</p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Handelsregistereintrag / Commercial Register Publication
            </h2>
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2">
              <p><strong className="text-slate-800">Rubrik:</strong> {COMPANY.registryPublication.registerCategory}</p>
              <p><strong className="text-slate-800">Unterrubrik:</strong> {COMPANY.registryPublication.subcategory}</p>
              <p><strong className="text-slate-800">Publikationsdatum:</strong> {COMPANY.registryPublication.publicationDateDisplay}</p>
              <p><strong className="text-slate-800">Meldungsnummer:</strong> {COMPANY.registryPublication.shabMessageNumber}</p>
              <p><strong className="text-slate-800">Tagesregister:</strong> {COMPANY.registryPublication.dailyRegisterDisplay}</p>
              <p><strong className="text-slate-800">Kontaktstelle:</strong> {COMPANY.registryPublication.registryOffice}</p>
              <p className="sm:col-span-2">
                <strong className="text-slate-800">Publizierende Stelle:</strong>{" "}
                {COMPANY.registryPublication.publishingOffice}, {COMPANY.registryPublication.publishingOfficeAddress}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {COMPANY.registryPublication.noticeTitle}
            </p>
            <p className="text-xs leading-relaxed text-slate-600">{COMPANY.shabNoticeDe}</p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Haftungsausschluss / Disclaimer
            </h3>
            <p>
              <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte (insbesondere Produktpreise und
              Verfügbarkeiten) übernehmen wir jedoch keine Gewähr. Produktionsfeed-, Test- und Demo-Preise sind indikativ;
              massgeblich ist der Händler zum Zeitpunkt des Kaufabschlusses.
            </p>
            <p>
              <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Webseiten Dritter
              (Affiliate-Partner), auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
              Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
            </p>
            <p>
              <strong>Urheberrecht:</strong> Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
              Seiten unterliegen dem Schweizerischen Urheberrecht.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
