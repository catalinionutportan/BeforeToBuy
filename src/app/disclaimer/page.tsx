import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Info, Scale } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, STAGE_ZERO_MONETIZATION } from "@/lib/company-info";
import { SITE_PHASE } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Price & Service Disclaimer | BeforeToBuy.com",
  description: "Commercial disclaimer for BeforeToBuy.com — price accuracy, Beta/Demo status, affiliate model, and merchant responsibility.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            Commercial Disclaimer
          </span>
          <h1 className="text-3xl font-extrabold">Price & Service Disclaimer</h1>
          <p className="text-slate-300 text-sm">
            Important limitations of BeforeToBuy.com as a Beta price-comparison helper that redirects to merchants.
            Site phase: <strong>{SITE_PHASE}</strong>.
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              1. Beta / Demo & hybrid catalog
            </h2>
            <p className="text-xs text-slate-600">
              {COMPANY.platformName} is operated in <strong>Beta/Demo</strong> mode by{" "}
              <strong>{COMPANY.legalName}</strong>. Most merchant offers are illustrative demo catalog data.
              Brack.ch (Switzerland) may display AWIN data from either an illustrative sample file or a configured production feed.
              Offers are labeled <strong>Production feed</strong>, <strong>Sample</strong>, or <strong>Demo</strong> accordingly; sample data is never presented as live merchant data.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">2. No binding offer; no guarantee of price, stock, or availability</h2>
            <p className="text-xs text-slate-600">
              Information on this site is <strong>not a binding offer (kein Kaufangebot)</strong> and not a price quote.
              We do not guarantee the accuracy, completeness, or timeliness of prices, delivery times, stock status,
              coupon codes, or Click &amp; Collect availability. Merchant websites are authoritative at the time of purchase.
              For cross-border purchases, VAT, customs duties, and import fees may apply and are confirmed only by the merchant.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">3. Not a party to merchant transactions</h2>
            <p className="text-xs text-slate-600">
              {COMPANY.platformName} is not a seller, broker, marketplace operator, or payment processor. We compare
              publicly shown information and redirect you. Contracts for goods and services are formed
              exclusively between you and the merchant. Shipping, payment, returns, refunds, warranty, and consumer
              rights are handled by the merchant under their terms and applicable law.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">4. Affiliate referral model (limited live RO + planned)</h2>
            <p className="text-xs text-slate-600">{STAGE_ZERO_MONETIZATION.en}</p>
            <p className="text-xs text-slate-600">
              See{" "}
              <Link href="/affiliate-disclosure" className="text-emerald-700 underline font-semibold">
                Affiliate Disclosure
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">5. Ranking of offers</h2>
            <p className="text-xs text-slate-600">
              By default, offers are sorted by an indicative total (list price + shown delivery where available).
              Filters may change the order. We do not use paid commercial placement in this Beta. If paid placement
              is introduced later, it will be labeled.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              6. External links & service availability
            </h2>
            <p className="text-xs text-slate-600">
              Outbound links lead to third-party merchant websites. We are not responsible for their content,
              pricing, privacy practices, or availability. Use of merchant sites is subject to their own terms.
              As a free Beta service, catalogs and features may change, pause, or be incomplete without notice.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
