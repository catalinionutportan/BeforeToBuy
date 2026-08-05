import type { Metadata } from "next";
import Link from "next/link";
import { Scale, FileText, Shield, HelpCircle, Building2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { LEGAL_PAGES } from "@/lib/legal-config";
import { HOME_UI } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const metadata: Metadata = createPageMetadata({
  title: homeUi.legalMetaTitle,
  description: homeUi.legalMetaDescription,
  path: "/legal",
});

export default function LegalHubPage() {
  const CATEGORY_LABELS: Record<string, string> = {
    company: homeUi.company,
    legal: homeUi.legalAndPrivacy,
    commercial: homeUi.commercialTransparency,
    support: homeUi.supportAndAccessibility,
  };

  const grouped = LEGAL_PAGES.reduce<Record<string, (typeof LEGAL_PAGES)[number][]>>((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {});

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            {homeUi.legalHub}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.legalAndCompanyInfo}</h1>
          <p className="text-slate-300 text-sm">{homeUi.legalHubIntro}</p>
        </div>

        <LegalDraftNotice />

        <CompanyDetailsCard />

        {Object.entries(grouped).map(([category, pages]) => (
          <section key={category} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {category === "company" && <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              {category === "legal" && <Shield className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              {category === "commercial" && <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              {category === "support" && <HelpCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
              {CATEGORY_LABELS[category] || category}
            </h2>

            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors text-sm font-semibold text-slate-800"
                  >
                    <span>{page.label}</span>
                    <span className="text-emerald-700 text-xs">{homeUi.readMore}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
