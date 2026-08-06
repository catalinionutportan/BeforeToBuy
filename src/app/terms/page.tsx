import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Copyright } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI.en;

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.termsMetaTitle,
  description: HOME_UI.en.termsMetaDescription,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {homeUi.termsAGBDEEN}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.termsAGBTitle}</h1>
          <p className="text-slate-300 text-sm">
            {formatUi(homeUi.termsAGBIntro, { platformName: COMPANY.platformName })}
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsServiceDescriptionTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {formatUi(homeUi.termsServiceDescriptionBody, { platformName: COMPANY.platformName, legalName: COMPANY.legalName, uid: COMPANY.uid })}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsPricesProductsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.termsPricesProductsBody1}{" "}
              <strong>{homeUi.termsPricesProductsBody2}</strong>{" "}
              {homeUi.termsPricesProductsBody3}{" "}
              <Link href="/disclaimer" className="text-emerald-700 underline font-semibold">
                {homeUi.priceServiceDisclaimer}
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {homeUi.termsThirdPartyContractsTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {homeUi.termsThirdPartyContractsBody1}{" "}
              {homeUi.termsThirdPartyContractsBody2}{" "}
              <Link href="/help" className="text-emerald-700 underline font-semibold">
                {homeUi.helpAndFAQ}
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
              <AlertTriangle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              5. Haftung & Verfügbarkeit (Free Beta Information Service)
            </h2>
            <p className="text-xs text-slate-600">
              {COMPANY.platformName} is a free Beta information and redirection service. We provide no warranty
              that catalogs, prices, distances, or availability are complete, current, or error-free. To the extent
              permitted by Swiss law, we are not liable for indirect or consequential damages arising from use of
              the service or reliance on displayed information, except in cases of unlawful intent or gross negligence
              where liability cannot be excluded. Merchant content and checkout terms remain the merchant&apos;s responsibility.
              The service may change, pause, or show incomplete data without notice.
            </p>
            <p className="text-xs text-slate-600">
              Ranking: offers are sorted by indicative total by default; filters may change order. Paid placement is
              not used in Beta; if introduced later it will be labeled. Details:{" "}
              <Link href="/disclaimer" className="text-emerald-700 underline font-semibold">
                Price &amp; Service Disclaimer
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Copyright className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              6. Geistiges Eigentum & Drittmarken
            </h2>
            <p className="text-xs text-slate-600">
              Inhalte, Marken und Software auf {COMPANY.platformName} sind durch Urheberrecht geschützt.
              Produktbilder und -marken gehören den jeweiligen Rechteinhabern und werden nur zur Identifikation
              verwendet — ohne Behauptung einer Endorsement- oder Partnerschaftsbeziehung, sofern nicht ausdrücklich
              ausgewiesen. Outbound-Links führen zu Drittanbieter-Inhalten.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              7. Anwendbares Recht & Gerichtsstand
            </h2>
            <p className="text-xs text-slate-600">
              Es gilt ausschliesslich <strong>Schweizerisches Recht</strong>. Ausschliesslicher Gerichtsstand
              ist <strong>Bern, Schweiz</strong>. Zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes
              (insb. EU/EWR) bleiben unberührt, soweit anwendbar.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">8. Änderungen & Kontakt</h2>
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
