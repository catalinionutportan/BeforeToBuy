import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

const faqSections = [
  {
    title: homeUi.faqSectionAboutTitle,
    items: [
      { q: homeUi.faqSectionAboutQ1, a: homeUi.faqSectionAboutA1 },
      { q: homeUi.faqSectionAboutQ2, a: homeUi.faqSectionAboutA2 },
      { q: homeUi.faqSectionAboutQ3, a: homeUi.faqSectionAboutA3 },
    ],
  },
  {
    title: homeUi.faqSectionProductionFeedTitle,
    items: [
      { q: homeUi.faqSectionProductionFeedQ1, a: homeUi.faqSectionProductionFeedA1 },
      { q: homeUi.faqSectionProductionFeedQ2, a: homeUi.faqSectionProductionFeedA2 },
      { q: homeUi.faqSectionProductionFeedQ3, a: homeUi.faqSectionProductionFeedA3 },
    ],
  },
  {
    title: homeUi.faqSectionAffiliateLinksTitle,
    items: [
      { q: homeUi.faqSectionAffiliateLinksQ1, a: homeUi.faqSectionAffiliateLinksA1 },
      { q: homeUi.faqSectionAffiliateLinksQ2, a: homeUi.faqSectionAffiliateLinksA2 },
    ],
  },
  {
    title: homeUi.faqSectionShippingTitle,
    items: [
      { q: homeUi.faqSectionShippingQ1, a: homeUi.faqSectionShippingA1 },
      { q: homeUi.faqSectionShippingQ2, a: homeUi.faqSectionShippingA2 },
      { q: homeUi.faqSectionShippingQ3, a: homeUi.faqSectionShippingA3 },
    ],
  },
  {
    title: homeUi.faqSectionPrivacyAccountTitle,
    items: [
      { q: homeUi.faqSectionPrivacyAccountQ1, a: homeUi.faqSectionPrivacyAccountA1 },
      {
        q: homeUi.faqSectionPrivacyAccountQ2,
        a: formatUi(homeUi.faqSectionPrivacyAccountA2, { companyEmail: COMPANY.email }),
      },
      { q: homeUi.faqSectionPrivacyAccountQ3, a: homeUi.faqSectionPrivacyAccountA3 },
    ],
  },
];

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.helpMetaTitle,
  description: HOME_UI.en.helpMetaDescription,
  path: "/help",
});

export default function HelpPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {homeUi.helpCenter}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.helpAndFAQ}</h1>
          <p className="text-slate-300 text-sm">
            {homeUi.helpIntro}
          </p>
        </div>

        <div className="space-y-6">
          {faqSections.map((section) => (
            <section key={section.title} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border border-slate-100 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      <span>{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
          <p className="font-bold">{homeUi.stillNeedHelp}</p>
          <p>
            {homeUi.visitOur}{" "}
            <Link href="/contact" className="underline font-semibold">
              {homeUi.contactPage}
            </Link>
            ,{" "}
            <Link href="/complaints" className="underline font-semibold">
              {homeUi.complaintsProcedure}
            </Link>
            , {homeUi.or}{" "}
            <Link href="/legal" className="underline font-semibold">
              {homeUi.legalHub}
            </Link>
            {homeUi.dot}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
