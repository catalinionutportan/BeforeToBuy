import type { Metadata } from "next";
import { FileText, CheckCircle, AlertTriangle, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions (AGB) | BeforeToBuy.com",
  description: "Terms and conditions for using BeforeToBuy.com price comparison platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Allgemeine Geschäftsbedingungen / Terms & Conditions
          </span>
          <h1 className="text-3xl font-extrabold">Nutzungsbedingungen & AGB</h1>
          <p className="text-slate-300 text-sm">
            Nutzungsbedingungen der Preisvergleichs-Plattform BeforeToBuy.com
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              1. Leistungsbeschreibung / Free Service
            </h2>
            <p className="text-xs text-slate-600">
              <strong>BeforeToBuy.com</strong> (betrieben von <strong>PortanX - Catalin Portan</strong>) ist ein kostenloser Online-Preisvergleichsdienst. Wir verkaufen selbst keine Produkte, sondern vergleichen Preise, Rabatte, Gutscheine und Click & Collect-Verfügbarkeiten externer Online-Händler und Partner-Netzwerke.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
              2. Preise & Produkte (Keine Gewähr)
            </h2>
            <p className="text-xs text-slate-600">
              Alle Angaben zu Preisen, Lieferzeiten, Versandkosten, Gutscheincodes und Verfügbarkeiten stammen derzeit aus einem Demo-Katalog. Live-Händler-Feeds und Schnittstellen (APIs) werden schrittweise angebunden.
            </p>
            <p className="text-xs text-slate-600">
              Da sich Preise und Lagerbestände beim Händler sehr schnell ändern können, übernimmt BeforeToBuy.com keine Gewähr für die ständige Richtigkeit der angezeigten Daten. <strong>Massgeblich ist stets der Preis und die Bedingung auf der Zielseite des jeweiligen Händlers im Zeitpunkt des Kaufabschlusses.</strong>
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              3. Kaufverträge mit Drittanbietern
            </h2>
            <p className="text-xs text-slate-600">
              Kaufverträge kommen ausschliesslich zwischen dem Nutzer und dem jeweiligen Online-Händler (z. B. Digitec Galaxus, Amazon, MediaMarkt, eMAG) zustande. BeforeToBuy.com ist weder Vertragspartei noch Vertreter der Händler. Reklamationen, Widerrufe oder Garantieansprüche sind direkt an den jeweiligen Händler zu richten.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              4. Anwendbares Recht & Gerichtsstand
            </h2>
            <p className="text-xs text-slate-600">
              Für diese Nutzungsbedingungen sowie die Nutzung der Plattform gilt ausschliesslich <strong>Schweizerisches Recht</strong>. Ausschliesslicher Gerichtsstand für alle Streitigkeiten ist <strong>Bern, Schweiz</strong>.
            </p>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
