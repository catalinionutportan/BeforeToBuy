import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Info, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { COMPANY, STAGE_ZERO_MONETIZATION } from "@/lib/company-info";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";
import { SITE_PHASE } from "@/lib/site-config";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  searchParams: LocaleSearchParams;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolvePageLocale(searchParams);
  const copy = getLegalCopy(locale).disclaimer;

  return createPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/disclaimer",
    locale,
  });
}

export default async function DisclaimerPage({ searchParams }: Props) {
  const locale = await resolvePageLocale(searchParams);
  const copy = getLegalCopy(locale).disclaimer;
  const homeUi = HOME_UI[locale];

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            {copy.badge}
          </span>
          <h1 className="text-3xl font-extrabold">{copy.title}</h1>
          <p className="text-slate-300 text-sm">{formatUi(copy.intro, { phase: SITE_PHASE })}</p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {copy.section1Title}
            </h2>
            <p className="text-xs text-slate-600">
              {formatUi(copy.section1Body, { platformName: COMPANY.platformName })}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{copy.section2Title}</h2>
            <p className="text-xs text-slate-600">{copy.section2Body}</p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{copy.section3Title}</h2>
            <p className="text-xs text-slate-600">
              {formatUi(copy.section3Body, { platformName: COMPANY.platformName })}
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{copy.section4Title}</h2>
            <p className="text-xs text-slate-600">{STAGE_ZERO_MONETIZATION[locale]}</p>
            <p className="text-xs text-slate-600">
              {copy.section4Body}{" "}
              <Link href={withLangParam("/affiliate-disclosure", locale)} className="text-emerald-700 underline font-semibold">
                {homeUi.affiliateDisclosureStatement}
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">{copy.section5Title}</h2>
            <p className="text-xs text-slate-600">{copy.section5Body}</p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              {copy.section6Title}
            </h2>
            <p className="text-xs text-slate-600">{copy.section6Body}</p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
