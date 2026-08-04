import type { Metadata } from "next";
import Link from "next/link";
import { SHOPPING_CATEGORIES } from "@/lib/categories";
import { ArrowRight, Layers, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shopping Categories | BeforeToBuy.com",
  description:
    "Browse all BeforeToBuy.com shopping categories: Audio, Gaming + VR, Smartphones, Notebooks, TV + Home Cinema, and more — structured like Digitec/Galaxus.",
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to BeforeToBuy.com
          </Link>
        </div>

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Category Directory
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Shopping Categories & Subcategories</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Full category tree aligned with major Swiss/EU retailers (Digitec, Galaxus, Amazon, MediaMarkt).
            Each module includes dedicated subcategories for precise price comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHOPPING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 ${
                  cat.isPromo ? "border-orange-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        cat.isPromo ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-lg">{cat.label}</h2>
                      {cat.labelDe && (
                        <p className="text-[11px] text-slate-400 font-semibold">{cat.labelDe}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/?category=${cat.id}`}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
                  >
                    Compare <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>

                <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/?category=${sub.id}`}
                        className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700 py-1.5 px-2 rounded-lg hover:bg-emerald-50 transition-colors group"
                      >
                        <span className="flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
                          {sub.label}
                        </span>
                        {sub.labelDe && (
                          <span className="text-[10px] text-slate-400 font-medium">{sub.labelDe}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
