import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPARISON_COLLECTION_FILTERS,
  SHOPPING_CATEGORIES,
} from "@/lib/categories";
import {
  getCollectionLabel,
  getDepartmentLabel,
  getSubcategoryLabel,
  localeFromCountry,
} from "@/lib/category-i18n";
import { ArrowRight, Layers, ChevronRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import {
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
} from "@/lib/category-routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Shopping Categories | BeforeToBuy.com",
  description:
    "Browse comparison-first categories for computers, phones, appliances, audio, gaming, photo, smart home and more.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const country = COUNTRIES[DEFAULT_COUNTRY];
  const locale = localeFromCountry(country.code);
  const catalog = await fetchMergedProductsForLocation({
    latitude: country.defaultCoordinates.lat,
    longitude: country.defaultCoordinates.lng,
    countryCode: country.code,
    countryName: country.name,
    city: country.defaultCoordinates.city,
    isGps: false,
  });
  const visibleCategories = SHOPPING_CATEGORIES.filter(
    (category) => (catalog.meta.categoryCounts[category.id] ?? 0) > 0
  );
  const visibleCollections = COMPARISON_COLLECTION_FILTERS.filter(
    (collection) => (catalog.meta.collectionCounts?.[collection.id] ?? 0) > 0
  );

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Category Directory
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Compare by Category</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            BeforeToBuy uses a retailer-neutral product taxonomy. Promotions, condition, pickup and cross-border availability remain comparison collections rather than product categories.
          </p>
        </div>

        {visibleCollections.length > 0 && (
          <section className="bg-orange-50 border border-orange-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <h2 className="font-extrabold text-orange-900">Comparison collections</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={collectionBrowsePath(collection.id)}
                  className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-orange-900 hover:border-orange-300 transition-colors"
                >
                  <span>{getCollectionLabel(collection.id, locale)}</span>
                  <span className="text-[11px] font-extrabold text-orange-700">
                    {catalog.meta.collectionCounts?.[collection.id] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            const departmentCount = catalog.meta.categoryCounts[cat.id] ?? 0;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-lg">
                        {getDepartmentLabel(cat.id, locale)}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {departmentCount} products
                      </p>
                    </div>
                  </div>
                  <Link
                    href={departmentCategoryPath(cat.id)}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
                  >
                    Compare <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>

                <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                  {cat.subcategories
                    .filter((sub) => (catalog.meta.categoryCounts[sub.id] ?? 0) > 0)
                    .map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={subcategoryCategoryPath(cat.id, sub.id)}
                          className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700 py-1.5 px-2 rounded-lg hover:bg-emerald-50 transition-colors group"
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
                            {getSubcategoryLabel(sub.id, locale)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {catalog.meta.categoryCounts[sub.id] ?? 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
