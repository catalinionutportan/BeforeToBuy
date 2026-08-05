import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";
import { HOME_UI } from "@/lib/i18n/ui";
import { useBrowseLocale } from "@/lib/i18n/client";

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.helpMetaTitle,
  description: HOME_UI.en.helpMetaDescription,
  path: "/help",
});

const FAQ_SECTIONS = [
  {
    title: "About BeforeToBuy.com",
    items: [
      {
        q: "What is BeforeToBuy.com?",
        a: "A free comparison platform in Beta/Demo, operated by PortanX - Catalin Portan (Switzerland). We distinguish production-feed offers from illustrative sample and demo data before redirecting you to the merchant website.",
      },
      {
        q: "Do you sell products directly?",
        a: "No. We do not operate a checkout, hold inventory, or process payments. Purchases are completed only on merchant websites (Digitec, Amazon, Brack, eMAG, etc.).",
      },
      {
        q: "Is the service free?",
        a: "Yes, 100% free for consumers. We may earn affiliate commissions from merchants when you complete a qualifying purchase after clicking an outbound link — at no extra cost to you.",
      },
    ],
  },
  {
    title: "Production feed vs Sample vs Demo prices",
    items: [
      {
        q: 'What do "Production feed", "Sample", and "Demo" mean on offers?',
        a: "Production-feed offers come from a configured merchant datafeed. Sample offers come from an illustrative test file and are not live merchant data. Demo offers are generated catalog examples. Always confirm the final price on the merchant site.",
      },
      {
        q: "Why do prices differ from the merchant website?",
        a: "Demo and sample prices are illustrative. Production-feed prices may lag behind merchant updates. Merchant websites are authoritative at checkout.",
      },
      {
        q: "Are Click & Collect distances accurate?",
        a: "Distances use sample branch coordinates for demo purposes unless connected to a merchant store-locator API. They are estimates, not guaranteed stock or pickup availability.",
      },
    ],
  },
  {
    title: "Affiliate links & cookies",
    items: [
      {
        q: "Why are store links blocked sometimes?",
        a: "Outbound affiliate links require your consent in the cookie banner (Affiliate category). You can change preferences anytime via Cookie Settings in the footer.",
      },
      {
        q: "Does clicking a link change the price I pay?",
        a: "No. Referral commissions come from the merchant marketing budget and should not increase your price. See our Affiliate Disclosure for details.",
      },
    ],
  },
  {
    title: "Shipping, returns, warranty & payments",
    items: [
      {
        q: "Who handles shipping and delivery?",
        a: "The merchant you buy from — not BeforeToBuy.com. Delivery times shown on our site are indicative. Check the merchant checkout for shipping options and costs.",
      },
      {
        q: "How do returns, refunds, and warranty work?",
        a: "All post-purchase rights (returns, refunds, warranty, consumer guarantees) are governed by the merchant you purchased from and applicable local law. Contact the merchant directly.",
      },
      {
        q: "Does BeforeToBuy.com process my payment?",
        a: "No. Payment cards and checkout flows are handled entirely by the merchant or their payment provider.",
      },
    ],
  },
  {
    title: "Privacy & account",
    items: [
      {
        q: "Do I need an account?",
        a: "No account is required to browse and compare prices on BeforeToBuy.com.",
      },
      {
        q: "How do I request my personal data (DSAR)?",
        a: `Email ${COMPANY.email} or use the contact form with topic "Data Privacy & Legal Request (DSAR)". We respond within 30 days.`,
      },
      {
        q: "Where can I read about cookies and location?",
        a: "See our Privacy Policy and Cookie Policy, or use Cookie Settings in the footer.",
      },
    ],
  },
];

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
