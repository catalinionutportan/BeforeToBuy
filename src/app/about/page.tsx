import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Search,
  ExternalLink,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  Globe,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & How It Works | BeforeToBuy.com",
  description:
    "Learn how BeforeToBuy.com helps you compare prices, check local Click & Collect stock in Switzerland & Europe, and save money before you buy.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to BeforeToBuy.com
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Operated by PortanX - Catalin Portan
          </span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
            About BeforeToBuy.com
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Smart Price Comparison & GPS Shopping Before You Buy
          </h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            BeforeToBuy.com is a free, multi-country price comparison engine designed to give consumers full visibility over online deals, coupon vouchers, and real-time local Click & Collect availability before completing a purchase.
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
                Enter any product name, brand, or category. Our engine searches across verified merchant feeds in Switzerland, Germany, France, Romania, UK, and USA.
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
                If you enable location, our system calculates distances to nearby physical stores (like Digitec, MediaMarkt, Fnac, Altex) offering instant Click & Collect pickup today.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                Click "Buy" to Official Merchant
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We present the lowest verified price. Clicking "Buy" redirects you safely to the official retailer's website (e.g., Digitec Galaxus, Amazon, Brack, eMAG).
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
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              Company Details & Operator
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block text-sm">Operating Entity:</span>
              <p className="leading-relaxed text-slate-600">
                <strong>PortanX - Catalin Portan</strong><br />
                Sole Proprietorship (Einzelunternehmen)<br />
                Flurstrasse 24, CH-3014 Bern<br />
                Switzerland
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block text-sm">Registry & Registration:</span>
              <p className="leading-relaxed text-slate-600">
                <strong>UID:</strong> CHE-373.501.736<br />
                <strong>HR-Nummer:</strong> CH-036.1.108.540-6<br />
                <strong>Commercial Registry:</strong> Bern, Switzerland<br />
                <strong>Official Website:</strong>{" "}
                <a href="https://portanx.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">
                  portanx.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Questions or merchant partnership inquiries? Reach us at{" "}
              <a href="mailto:admin@portanx.com" className="text-emerald-700 font-bold hover:underline">
                admin@portanx.com
              </a>
            </div>
            <Link
              href="/contact"
              className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
