import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { fetchIubendaPrivacyHtml, iubendaPrivacyPolicyUrl } from "@/lib/iubenda";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import type { SiteLocale } from "@/lib/i18n/locales";

type Props = {
  searchParams: LocaleSearchParams;
};

const IUBENDA_SOURCE_NOTE: Record<SiteLocale, string> = {
  en: "This Privacy Policy is generated and hosted by iubenda for BeforeToBuy.com. The English and translated versions below are the published legal text.",
  de: "Diese Datenschutzerklärung wird von iubenda für BeforeToBuy.com generiert und gehostet. Der unten stehende Text ist die veröffentlichte rechtliche Fassung.",
  fr: "Cette politique de confidentialité est générée et hébergée par iubenda pour BeforeToBuy.com. Le texte ci-dessous est la version juridique publiée.",
  it: "Questa informativa privacy è generata e ospitata da iubenda per BeforeToBuy.com. Il testo seguente è la versione giuridica pubblicata.",
  ro: "Această Politică de confidențialitate este generată și găzduită de iubenda pentru BeforeToBuy.com. Textul de mai jos este versiunea juridică publicată.",
};

const OPEN_ON_IUBENDA: Record<SiteLocale, string> = {
  en: "Open on iubenda",
  de: "Auf iubenda öffnen",
  fr: "Ouvrir sur iubenda",
  it: "Apri su iubenda",
  ro: "Deschide pe iubenda",
};

const LOAD_ERROR: Record<SiteLocale, string> = {
  en: "The Privacy Policy could not be loaded right now. Please use the iubenda link below.",
  de: "Die Datenschutzerklärung konnte gerade nicht geladen werden. Bitte nutzen Sie den iubenda-Link unten.",
  fr: "La politique de confidentialité n'a pas pu être chargée. Veuillez utiliser le lien iubenda ci-dessous.",
  it: "L'informativa privacy non può essere caricata in questo momento. Usa il link iubenda qui sotto.",
  ro: "Politica de confidențialitate nu a putut fi încărcată acum. Folosiți linkul iubenda de mai jos.",
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  return createPageMetadata({
    title: homeUi.privacyMetaTitle,
    description: homeUi.privacyMetaDescription,
    path: "/privacy",
    locale,
  });
}

export default async function PrivacyPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];
  const policyHtml = await fetchIubendaPrivacyHtml(locale);
  const policyUrl = iubendaPrivacyPolicyUrl(locale);

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {homeUi.privacyPolicyDEEN}
          </span>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" aria-hidden="true" />
            {homeUi.privacyPolicyDEENTitle}
          </h1>
          <p className="text-slate-300 text-sm">{IUBENDA_SOURCE_NOTE[locale]}</p>
          <p className="text-xs">
            <a
              href={policyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 underline font-semibold"
            >
              {OPEN_ON_IUBENDA[locale]}
            </a>
            {" · "}
            <Link href={withLangParam("/cookies", locale)} className="text-emerald-300 underline font-semibold">
              {homeUi.cookiePolicy}
            </Link>
            {" · "}
            <Link href={withLangParam("/contact", locale)} className="text-emerald-300 underline font-semibold">
              {homeUi.contactForm}
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs overflow-hidden">
          {policyHtml ? (
            <div
              className="iubenda-privacy-embed text-sm text-slate-700 leading-relaxed [&_a]:text-emerald-700 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_table]:text-xs [&_td]:align-top [&_td]:py-1"
              dangerouslySetInnerHTML={{ __html: policyHtml }}
            />
          ) : (
            <p className="text-sm text-slate-600">
              {LOAD_ERROR[locale]}{" "}
              <a href={policyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">
                {policyUrl}
              </a>
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
