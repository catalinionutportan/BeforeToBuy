import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { PRIVACY_POLICY_LAST_UPDATED, PRIVACY_POLICY_SECTIONS } from "@/content/privacy-policy";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import type { SiteLocale } from "@/lib/i18n/locales";

type Props = {
  searchParams: LocaleSearchParams;
};

const ENGLISH_PREVAILS: Record<SiteLocale, string> = {
  en: "This page publishes the English Privacy Policy (source of truth). If a translation conflicts, English prevails.",
  de: "Diese Seite veröffentlicht die englische Datenschutzerklärung (maßgebliche Fassung). Bei Widersprüchen gilt die englische Version.",
  fr: "Cette page publie la politique de confidentialité en anglais (version de référence). En cas de conflit, l’anglais prévaut.",
  it: "Questa pagina pubblica l’informativa privacy in inglese (versione di riferimento). In caso di conflitto prevale l’inglese.",
  ro: "Această pagină publică Politica de confidențialitate în engleză (versiunea de referință). În caz de conflict, prevalează engleza.",
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

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {homeUi.privacyPolicyDEEN}
          </span>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" aria-hidden="true" />
            Privacy Policy — BeforeToBuy.com
          </h1>
          <p className="text-slate-300 text-sm">Last updated: {PRIVACY_POLICY_LAST_UPDATED}</p>
          <p className="text-slate-400 text-xs leading-relaxed">{ENGLISH_PREVAILS[locale]}</p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3 border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.id}-p-${index}`} className="text-xs text-slate-600 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                  {section.bullets.map((item, index) => (
                    <li key={`${section.id}-b-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="border-t border-slate-100 pt-6 text-xs text-slate-600 space-y-2">
            <p>
              Related pages:{" "}
              <Link href={withLangParam("/cookies", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.cookiePolicy}
              </Link>
              {" · "}
              <Link href={withLangParam("/contact", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.contactForm}
              </Link>
              {" · "}
              <Link href={withLangParam("/impressum", locale)} className="text-emerald-700 underline font-semibold">
                Impressum
              </Link>
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
