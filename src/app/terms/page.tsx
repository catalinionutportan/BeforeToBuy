import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Copyright } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions (AGB) | BeforeToBuy.com",
  description: "Terms and conditions for using BeforeToBuy.com price comparison platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Allgemeine Geschäftsbedingungen / Terms & Conditions
          </span>
          <h1 className="text-3xl font-extrabold">Nutzungsbedingungen & AGB</h1>
          <p className="text-slate-300 text-sm">
            Nutzungsbedingungen der Preisvergleichs-Plattform {COMPANY.platformName}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              1. Leistungsbeschreibung / Free Service
            </h2>
            <p className="text-xs text-slate-600">
              <strong>{COMPANY.platformName}</strong> (betrieben von <strong>{COMPANY.legalName}</strong>, UID{" "}
              {COMPANY.uid}) ist ein kostenloser Online-Preisvergleichsdienst in Beta/Demo. Wir verkaufen selbst
              keine Produkte, sondern stellen Preis- und Verfügbarkeitsangaben externer Online-Händler gegenüber.
              Einige Angebote stammen aus Demo-Katalogdaten; Brack.ch (CH) verwendet standardmässig illustrative
              AWIN-Testdaten. Nur ausdrücklich als &quot;Production feed&quot; gekennzeichnete Angebote stammen aus
              einem konfigurierten Produktionsfeed.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              2. Preise & Produkte (Keine Gewähr)
            </h2>
            <p className="text-xs text-slate-600">
              Alle Angaben zu Preisen, Lieferzeiten, Versandkosten und Verfügbarkeiten sind indikativ. Produktionsfeed-,
              Test- und Demo-Daten können von den aktuellen Händlerpreisen abweichen.{" "}
              <strong>Massgeblich ist stets der Preis auf der Zielseite des Händlers zum Zeitpunkt des Kaufabschlusses.</strong>{" "}
              Siehe auch{" "}
              <Link href="/disclaimer" className="text-emerald-700 underline font-semibold">
                Price & Service Disclaimer
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              3. Kaufverträge mit Drittanbietern
            </h2>
            <p className="text-xs text-slate-600">
              Kaufverträge kommen ausschliesslich zwischen dem Nutzer und dem jeweiligen Online-Händler zustande.
              {COMPANY.platformName} ist weder Vertragspartei noch Vertreter der Händler. Versand, Zahlung,
              Rückgabe, Garantie und Gewährleistung werden vom Händler geregelt. Siehe{" "}
              <Link href="/help" className="text-emerald-700 underline font-semibold">
                Help & FAQ
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              4. Nutzerpflichten
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>Nutzung nur für legale, persönliche Preisvergleichszwecke</li>
              <li>Kein automatisiertes Scraping, Überlastung oder Missbrauch der APIs</li>
              <li>Keine Umgehung von Consent- oder Rate-Limit-Mechanismen</li>
              <li>Aktuelle{" "}
                <Link href="/privacy" className="text-emerald-700 underline font-semibold">
                  Privacy Policy
                </Link>{" "}
                und{" "}
                <Link href="/cookies" className="text-emerald-700 underline font-semibold">
                  Cookie Policy
                </Link>{" "}
                beachten
              </li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Copyright className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              5. Geistiges Eigentum
            </h2>
            <p className="text-xs text-slate-600">
              Inhalte, Marken und Software auf {COMPANY.platformName} sind durch Urheberrecht geschützt.
              Produktbilder und -marken gehören den jeweiligen Rechteinhabern. Affiliate-Links führen zu
              Drittanbieter-Inhalten.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              6. Anwendbares Recht & Gerichtsstand
            </h2>
            <p className="text-xs text-slate-600">
              Es gilt ausschliesslich <strong>Schweizerisches Recht</strong>. Ausschliesslicher Gerichtsstand
              ist <strong>Bern, Schweiz</strong>. Zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes
              (insb. EU/EWR) bleiben unberührt, soweit anwendbar.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">7. Änderungen & Kontakt</h2>
            <p className="text-xs text-slate-600">
              Wir können diese Bedingungen bei Bedarf aktualisieren. Beschwerden:{" "}
              <Link href="/complaints" className="text-emerald-700 underline font-semibold">
                Complaints Procedure
              </Link>
              . Kontakt:{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 underline font-semibold">
                {COMPANY.email}
              </a>
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
