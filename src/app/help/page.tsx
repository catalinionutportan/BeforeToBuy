import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { createPageMetadata } from "@/lib/metadata";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { buildFaqPageJsonLd } from "@/lib/seo/json-ld";
import { flattenFaqItems, getFaqCatalog } from "@/lib/seo/faq-catalog";

const homeUi = HOME_UI[DEFAULT_LOCALE];
const faqSections = getFaqCatalog(DEFAULT_LOCALE);

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.helpMetaTitle,
  description: HOME_UI.en.helpMetaDescription,
  path: "/help",
});

export default function HelpPage() {
  const faqItems = flattenFaqItems(faqSections);
  const faqJsonLd = buildFaqPageJsonLd(faqItems.map((item) => ({ q: item.q, a: item.a })));

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <JsonLd data={faqJsonLd} />
      <div className="space-y-8">
        <div className="space-y-2 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {homeUi.helpCenter}
          </span>
          <h1 className="text-3xl font-extrabold">{homeUi.helpAndFAQ}</h1>
          <p className="text-sm text-slate-300">{homeUi.helpIntro}</p>
          <p className="text-xs text-slate-400">
            {faqItems.length} questions covering lowest-price comparison, feeds, affiliate honesty, and shopping tips —
            structured for search discovery.
          </p>
        </div>

        <div className="space-y-8">
          {faqSections.map((section) => (
            <section key={section.id} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-slate-200 bg-white shadow-xs open:border-emerald-200 open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      <span>{item.q}</span>
                      <ChevronDown
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs text-emerald-950">
          <p className="font-bold">{homeUi.stillNeedHelp}</p>
          <p>
            {homeUi.visitOur}{" "}
            <Link href="/contact" className="font-semibold underline">
              {homeUi.contactPage}
            </Link>
            ,{" "}
            <Link href="/complaints" className="font-semibold underline">
              {homeUi.complaintsProcedure}
            </Link>
            ,{" "}
            <Link href="/transparency" className="font-semibold underline">
              {homeUi.platformNotices}
            </Link>
            , {homeUi.or}{" "}
            <Link href="/legal" className="font-semibold underline">
              {homeUi.legalHub}
            </Link>
            {homeUi.dot}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
