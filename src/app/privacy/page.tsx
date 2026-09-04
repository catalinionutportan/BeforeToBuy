import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { CompanyEmailLink } from "@/components/CompanyEmailLink";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { PageShell } from "@/components/PageShell";
import {
  buildLocalizedDataProcessors,
  getProcessorUiLabels,
} from "@/lib/data-processors";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { createPageMetadata } from "@/lib/metadata";
import { PRIVACY_COPY } from "@/lib/privacy-copy";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

const PAGE_LABELS: Record<
  SiteLocale,
  {
    selfHosted: string;
    providersTitle: string;
    providersIntro: string;
    region: string;
    transfer: string;
    choicesTitle: string;
    choicesBody: string;
    contactTitle: string;
    contactBody: string;
  }
> = {
  en: {
    selfHosted: "Official self-hosted document — no external policy generator is required.",
    providersTitle: "9. Service providers and recipients",
    providersIntro: "These providers may receive technical or personal data only for the purposes shown below. Optional providers are used only when configured and, where required, after consent.",
    region: "Confirmed region",
    transfer: "International transfer information",
    choicesTitle: "10. Consent choices",
    choicesBody: "You can change or withdraw Affiliate and Analytics consent at any time. Essential preferences remain necessary to remember your choice and operate the requested interface.",
    contactTitle: "11. Privacy contact",
    contactBody: "For access, correction, deletion, restriction, objection, or another privacy request, contact:",
  },
  de: {
    selfHosted: "Offizielles, selbst gehostetes Dokument — kein externer Richtlinien-Generator erforderlich.",
    providersTitle: "9. Dienstleister und Empfänger",
    providersIntro: "Diese Anbieter können technische oder personenbezogene Daten nur für die unten genannten Zwecke erhalten. Optionale Anbieter werden nur bei Konfiguration und, soweit erforderlich, nach Einwilligung eingesetzt.",
    region: "Bestätigte Region",
    transfer: "Informationen zur internationalen Übermittlung",
    choicesTitle: "10. Einwilligungseinstellungen",
    choicesBody: "Sie können Ihre Affiliate- und Analytics-Einwilligung jederzeit ändern oder widerrufen. Essenzielle Einstellungen bleiben erforderlich, um Ihre Auswahl zu speichern und die gewünschte Oberfläche bereitzustellen.",
    contactTitle: "11. Datenschutzkontakt",
    contactBody: "Für Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch oder eine andere Datenschutzanfrage kontaktieren Sie:",
  },
  fr: {
    selfHosted: "Document officiel auto-hébergé — aucun générateur externe de politique n'est requis.",
    providersTitle: "9. Prestataires et destinataires",
    providersIntro: "Ces prestataires peuvent recevoir des données techniques ou personnelles uniquement pour les finalités indiquées ci-dessous. Les prestataires optionnels ne sont utilisés que s'ils sont configurés et, lorsque requis, après consentement.",
    region: "Région confirmée",
    transfer: "Informations sur le transfert international",
    choicesTitle: "10. Choix de consentement",
    choicesBody: "Vous pouvez modifier ou retirer à tout moment votre consentement Affiliation et Analytics. Les préférences essentielles restent nécessaires pour mémoriser votre choix et fournir l'interface demandée.",
    contactTitle: "11. Contact confidentialité",
    contactBody: "Pour toute demande d'accès, rectification, effacement, limitation, opposition ou autre demande relative à la vie privée, contactez :",
  },
  it: {
    selfHosted: "Documento ufficiale self-hosted — non è necessario alcun generatore esterno di informative.",
    providersTitle: "9. Fornitori e destinatari",
    providersIntro: "Questi fornitori possono ricevere dati tecnici o personali solo per le finalità indicate di seguito. I fornitori opzionali vengono utilizzati solo se configurati e, ove richiesto, dopo il consenso.",
    region: "Regione confermata",
    transfer: "Informazioni sui trasferimenti internazionali",
    choicesTitle: "10. Scelte di consenso",
    choicesBody: "Puoi modificare o revocare in qualsiasi momento il consenso Affiliazione e Analytics. Le preferenze essenziali restano necessarie per ricordare la scelta e fornire l'interfaccia richiesta.",
    contactTitle: "11. Contatto privacy",
    contactBody: "Per accesso, rettifica, cancellazione, limitazione, opposizione o altre richieste privacy, contatta:",
  },
  ro: {
    selfHosted: "Document oficial găzduit direct pe BeforeToBuy — nu este necesar un generator extern de politici.",
    providersTitle: "9. Furnizori de servicii și destinatari",
    providersIntro: "Acești furnizori pot primi date tehnice sau personale numai pentru scopurile prezentate mai jos. Furnizorii opționali sunt utilizați doar dacă sunt configurați și, unde este necesar, după consimțământ.",
    region: "Regiune confirmată",
    transfer: "Informații privind transferul internațional",
    choicesTitle: "10. Opțiunile de consimțământ",
    choicesBody: "Puteți modifica sau retrage oricând consimțământul pentru Afiliere și Analytics. Preferințele esențiale rămân necesare pentru memorarea alegerii și funcționarea interfeței solicitate.",
    contactTitle: "11. Contact pentru confidențialitate",
    contactBody: "Pentru acces, rectificare, ștergere, restricționare, opoziție sau orice altă cerere de confidențialitate, contactați:",
  },
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const copy = PRIVACY_COPY[locale];

  return createPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/privacy",
    locale,
  });
}

export default async function PrivacyPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const copy = PRIVACY_COPY[locale];
  const labels = PAGE_LABELS[locale];
  const homeUi = HOME_UI[locale];
  const processors = buildLocalizedDataProcessors(locale);
  const processorLabels = getProcessorUiLabels(locale);

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <div className="space-y-8">
        <header className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-md">
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {copy.badge}
          </span>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold">
            <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-400" aria-hidden="true" />
            {copy.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-300">{copy.intro}</p>
          <p className="text-xs font-semibold text-emerald-300">{labels.selfHosted}</p>
          <p className="text-xs text-slate-400">{copy.lastUpdated}</p>
        </header>

        <LegalDraftNotice />

        <article className="space-y-7 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-xs sm:p-8">
          {copy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-2 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm text-slate-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section id="providers" className="scroll-mt-24 space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900">{labels.providersTitle}</h2>
            <p className="text-sm text-slate-600">{labels.providersIntro}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {processors.map((processor) => (
                <li key={processor.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{processor.name}</h3>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {processor.roleLabel}
                    </span>
                    {processor.optional && (
                      <span className="text-[10px] font-semibold text-amber-700">{processorLabels.optionalNote}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{processor.purpose}</p>
                  {processor.projectRegion && (
                    <p className="mt-2 text-xs text-slate-500">
                      <strong>{labels.region}:</strong> {processor.projectRegion}
                    </p>
                  )}
                  {processor.transferSummary && (
                    <p className="mt-2 text-xs text-slate-500">
                      <strong>{labels.transfer}:</strong> {processor.transferSummary}
                    </p>
                  )}
                  {processor.officialDocUrl && (
                    <a href={processor.officialDocUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline">
                      {processorLabels.officialDocLabel}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section id="consent" className="scroll-mt-24 space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900">{labels.choicesTitle}</h2>
            <p className="text-sm text-slate-600">{labels.choicesBody}</p>
            <div className="flex flex-wrap items-center gap-4">
              <ManageCookiePreferencesButton className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:border-emerald-500 hover:text-emerald-700" />
              <Link href={withLangParam("/cookies", locale)} className="text-xs font-semibold text-emerald-700 underline">
                {homeUi.cookiePolicy}
              </Link>
            </div>
          </section>

          <section id="privacy-contact" className="scroll-mt-24 space-y-2 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900">{labels.contactTitle}</h2>
            <p className="text-sm text-slate-600">
              {labels.contactBody}{" "}
              <CompanyEmailLink className="font-semibold text-emerald-700 underline" />
            </p>
            <Link href={withLangParam("/contact", locale)} className="inline-flex text-xs font-semibold text-emerald-700 underline">
              {homeUi.contactForm}
            </Link>
          </section>
        </article>
      </div>
    </PageShell>
  );
}
