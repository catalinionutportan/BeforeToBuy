import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  BadgePercent,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Building2,
  Lock,
  Scale,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "Platform notices & transparency | BeforeToBuy.com",
  description:
    "Operator notice, company registration, GPS privacy, affiliate zero-markup, and price verification for BeforeToBuy.com (PortanX - Catalin Portan).",
  path: "/transparency",
});

export default function TransparencyPage() {
  return (
    <PageShell maxWidthClass="max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Transparency
          </span>
          <h1 className="text-3xl font-extrabold">Platform notices</h1>
          <p className="text-sm text-slate-300">
            Operator details and commercial notices for users and partner diligence. Legal documents open on their own pages from the footer Legal hub.
          </p>
        </div>

        <LegalDraftNotice />

        <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-emerald-500/15 p-2 text-emerald-700">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                Operator &amp; platform notice
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                <strong>BeforeToBuy.com</strong> is a Swiss-based location-aware price comparison and Click &amp; Collect
                aggregator (no checkout on this site). Operated by <strong>{COMPANY.legalName}</strong> (Commercial
                Register Canton of Bern, UID:{" "}
                <code className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-emerald-900">{COMPANY.uid}</code>
                ). Catalog may include beta/demo sample offers — confirm final terms on the merchant site.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Company entity &amp; registration
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Operated by <strong>{COMPANY.legalName}</strong> ({COMPANY.legalForm.en}). Registered in{" "}
              {COMPANY.commercialRegistry} under Daily Register No.{" "}
              {COMPANY.registryPublication.dailyRegisterNumber} (Publication SHAB:{" "}
              {COMPANY.registryPublication.shabMessageNumber}).
            </p>
            <Link href="/impressum" className="inline-flex text-xs font-semibold text-emerald-700 underline">
              Full impressum →
            </Link>
          </article>

          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-teal-700">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              GPS privacy &amp; data protection
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Precise GPS and approximate IP location run only with your Location consent. GPS coordinates stay in the
              browser session for distance estimates; IP/reverse-geocode requests may reach processors listed in our
              Privacy Policy. We do not claim full nDSG/GDPR certification — see draft policies and Cookie Settings.
            </p>
            <Link href="/privacy" className="inline-flex text-xs font-semibold text-teal-700 underline">
              Privacy policy →
            </Link>
          </article>

          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <BadgePercent className="h-4 w-4 shrink-0" aria-hidden="true" />
              Affiliate commission &amp; zero-markup
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Free for consumers. Live Romania affiliate today: Rowenta and Scule365 (2Performant product feeds), with
              Affiliate consent. Other RO merchants are added only after acceptance and feed wiring. A merchant or
              network may pay us a referral commission from their marketing budget — we do not add a BeforeToBuy fee.
              Final checkout price is always set by the merchant.
            </p>
            <Link href="/affiliate-disclosure" className="inline-flex text-xs font-semibold text-amber-800 underline">
              Affiliate disclosure →
            </Link>
          </article>

          <article className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-sky-700">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Price &amp; availability verification
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              During beta, many prices are sample/demo and may not reflect live merchant feeds. Always confirm final
              price, VAT, shipping, availability, and delivery terms on the official merchant checkout page.
            </p>
            <Link href="/disclaimer" className="inline-flex text-xs font-semibold text-sky-800 underline">
              Price disclaimer →
            </Link>
          </article>
        </div>

        <CompanyDetailsCard />

        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Related pages">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Scale className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Legal hub
          </Link>
          <Link
            href="/impressum"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Building2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Impressum
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            <Lock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Privacy
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:border-emerald-300"
          >
            Merchant directory
          </Link>
        </nav>
      </div>
    </PageShell>
  );
}
