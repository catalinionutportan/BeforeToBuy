import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Zap,
  Building2,
  Search,
  ExternalLink,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "About Us & How It Works | BeforeToBuy.com",
  description:
    "Learn how BeforeToBuy.com helps you compare demo prices, explore categories, and save money before you buy.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell>
      <div className="space-y-10">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
            About BeforeToBuy.com
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Smart Price Comparison & GPS Shopping Before You Buy
          </h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            BeforeToBuy.com is a free, multi-country comparison service in Beta/Demo. Brack.ch (CH) uses illustrative AWIN sample data unless a production feed is configured; other merchants remain illustrative until connected.
          </p>
        </div>

        {/* 4-Step Process Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-600" />
              How BeforeToBuy Works (4 Simple Steps)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Transparent, automated, and built to save you time and money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                Search or Browse Products
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter any product name, brand, or category. During Beta/Demo, most results are illustrative. Brack.ch offers in Switzerland are labeled &quot;Sample&quot; unless a production merchant feed is configured, in which case they are labeled &quot;Production feed&quot;.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                GPS Local Stock & Deals Match
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you enable location, the demo estimates distances to sample physical store branches for illustrative Click & Collect pickup options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                Click &quot;Search Store&quot; to Official Merchant
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We present prices from production feeds, sample data, or the demo catalog with explicit source labels. We only identify a lowest production-feed price when comparable production offers exist. Clicking &quot;Search Store&quot; opens the retailer website.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Complete Purchase on Merchant Site
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You complete checkout directly on the merchant’s official payment portal. You pay standard price (or lower with our vouchers)—100% free with no extra fees.
              </p>
            </div>

          </div>
        </div>

        {/* Business Model & Monetization Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              How We Make Money (Affiliate Model)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete transparency regarding our business model.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p className="text-xs sm:text-sm">
              BeforeToBuy.com is <strong>100% free for consumers</strong>. We do not sell products directly, hold inventory, process credit cards, or add hidden service charges.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                Zero Markup Guarantee
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                When you purchase a product after clicking an offer on BeforeToBuy.com, the retailer or affiliate network (such as AWIN, Amazon Associates, Digitec Galaxus Merchant, CJ Affiliate, 2Performant) pays us a small referral commission. This commission comes directly out of the merchant’s marketing budget and <strong>never increases the price you pay</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Company & Entity Information */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              Company Details & Operator
            </h2>
          </div>

          <CompanyDetailsCard />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              Questions, legal documents, or merchant partnerships?{" "}
              <Link href="/legal" className="text-emerald-700 font-bold hover:underline">
                Legal hub
              </Link>{" "}
              ·{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-emerald-700 font-bold hover:underline">
                {COMPANY.email}
              </a>
            </div>
            <Link
              href="/contact"
              className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
