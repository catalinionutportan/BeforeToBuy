import type { Metadata } from "next";
import { ShieldCheck, Lock, MapPin, Database, Eye } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";

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
            Konform mit dem Schweizer Datenschutzgesetz (nDSG / revDSG) & EU-DSGVO (GDPR)
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              1. Verantwortliche Stelle / Data Controller
            </h2>
            <p className="text-xs text-slate-600">
              Verantwortlich für die Datenverarbeitung auf der Webseite <strong>BeforeToBuy.com</strong> ist:<br />
              <strong>PortanX - Catalin Portan</strong><br />
              Flurstrasse 24, CH-3014 Bern, Schweiz<br />
              UID: CHE-373.501.736 | E-Mail: <a href="mailto:admin@portanx.com" className="text-emerald-700 underline">admin@portanx.com</a>
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              2. GPS-Standortdaten (Location-Based Shopping)
            </h2>
            <p className="text-xs text-slate-600">
              <strong>Geolokalisation:</strong> Unsere Anwendung bietet Funktionen zur standortbasierten Preisvergleichung und Anzeige von "Click & Collect"-Geschäften in Deiner Nähe.
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>GPS-Daten werden im Browser abgefragt und können zur Standortbestimmung an unseren Server sowie an OpenStreetMap/Nominatim übermittelt werden.</li>
              <li>Bei fehlender GPS-Freigabe kann eine ungefähre Standortbestimmung über IP-Adresse erfolgen (ipapi.co).</li>
              <li>Wir speichern <strong>keine dauerhaften Bewegungsprofile</strong>; Standortdaten dienen der Demo-Funktion für Händler- und Distanzanzeige.</li>
            </ul>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              3. Affiliate-Links & Tracking
            </h2>
            <p className="text-xs text-slate-600">
              BeforeToBuy.com ist ein kostenloser Dienst, der sich über Affiliate-Provisionen finanziert. Wenn Du auf einen Kaufen-Link klickst, wirst Du zum offiziellen Online-Shop (z. B. Digitec Galaxus, Amazon, MediaMarkt, eMAG) weitergeleitet.
            </p>
            <p className="text-xs text-slate-600">
              Dabei werden Tracking-Parameter (Cookies/Session-IDs) der Partner-Netzwerke (AWIN, Amazon Associates, 2Performant, CJ Affiliate) verwendet, um zu bestätigen, dass der Kauf über BeforeToBuy.com vermittelt wurde. Für Dich entstehen dabei <strong>keinerlei Zusatzkosten</strong>.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              4. Server-Log-Files & Hosting
            </h2>
            <p className="text-xs text-slate-600">
              Beim Aufrufen unserer Website werden durch das globale Edge-Netzwerk (Vercel) automatisch Informationen an den Server gesendet und temporär in Logfiles gespeichert (z. B. IP-Adresse, Browsertyp, Betriebssystem, Referrer URL, Zeitstempel). Dies dient der technischen Stabilität und Sicherheit.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              5. Deine Rechte / Your Rights
            </h2>
            <p className="text-xs text-slate-600">
              Gemäss dem Schweizer Datenschutzgesetz (nDSG) sowie der DSGVO haben Nutzer das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung ihrer personenbezogenen Daten. Wende Dich bei Fragen direkt an <a href="mailto:admin@portanx.com" className="text-emerald-700 underline font-semibold">admin@portanx.com</a>.
            </p>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
