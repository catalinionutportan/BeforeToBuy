import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, Database, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

const PRIVACY_LINK_LABELS = {
  en: { label: "Privacy Policy", suffix: "for data subject rights (DSAR)." },
  de: { label: "Datenschutzrichtlinie", suffix: "für Betroffenenrechte (DSAR)." },
  fr: { label: "Politique de confidentialité", suffix: "pour les droits des personnes concernées (DSAR)." },
  it: { label: "Informativa privacy", suffix: "per i diritti dell'interessato (DSAR)." },
  ro: { label: "Politica de confidențialitate", suffix: "pentru drepturile persoanei vizate (DSAR)." },
} as const;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);

  return createPageMetadata({
    title: legalCopy.cookies.metaTitle,
    description: legalCopy.cookies.metaDescription,
    path: "/cookies",
    locale,
  });
}

export default async function CookiesPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);
  const cookieCopy = legalCopy.cookies;
  const privacyLabels = PRIVACY_LINK_LABELS[locale];

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {cookieCopy.badge}
          </span>
          <h1 className="text-3xl font-extrabold">{cookieCopy.title}</h1>
          <p className="text-slate-300 text-sm">{cookieCopy.intro}</p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-600" />
              {cookieCopy.whatWeUseTitle}
            </h2>
            <p className="text-xs text-slate-600">{cookieCopy.whatWeUseBody}</p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              {cookieCopy.categoriesTitle}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left p-3 font-bold">{cookieCopy.tableCategory}</th>
                    <th className="text-left p-3 font-bold">{cookieCopy.tablePurpose}</th>
                    <th className="text-left p-3 font-bold">{cookieCopy.tableStorage}</th>
                    <th className="text-left p-3 font-bold">{cookieCopy.tableRequired}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold">{cookieCopy.essentialCategory}</td>
                    <td className="p-3">{cookieCopy.essentialPurpose}</td>
                    <td className="p-3">{cookieCopy.essentialStorage}</td>
                    <td className="p-3">{cookieCopy.essentialRequired}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{cookieCopy.affiliateCategory}</td>
                    <td className="p-3">{cookieCopy.affiliatePurpose}</td>
                    <td className="p-3">{cookieCopy.affiliateStorage}</td>
                    <td className="p-3">{cookieCopy.affiliateRequired}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">{cookieCopy.analyticsCategory}</td>
                    <td className="p-3">{cookieCopy.analyticsPurpose}</td>
                    <td className="p-3">{cookieCopy.analyticsStorage}</td>
                    <td className="p-3">{cookieCopy.analyticsRequired}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {cookieCopy.processorsTitle}
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              {cookieCopy.processorItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{cookieCopy.manageChoicesTitle}</h2>
            <p className="text-xs text-slate-600">{cookieCopy.manageChoicesBody}</p>
            <p className="text-xs text-slate-600">
              {cookieCopy.manageChoicesBody2}{" "}
              <Link href={withLangParam("/privacy", locale)} className="text-emerald-700 underline font-semibold">
                {privacyLabels.label}
              </Link>{" "}
              {privacyLabels.suffix}
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
