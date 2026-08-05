import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPARISON_COLLECTION_FILTERS,
  SHOPPING_CATEGORIES,
} from "@/lib/categories";
import {
  collectionBrowsePath,
  departmentCategoryPath,
} from "@/lib/category-routes";
import {
  getCollectionLabel,
  getDepartmentLabel,
  localeFromCountry,
} from "@/lib/category-i18n";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { createPageMetadata } from "@/lib/metadata";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchDefaultCatalog } from "@/lib/category-page-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Compare Prices | BeforeToBuy.com",
  description:
    "Compare product prices across Swiss retailers. Browse electronics, appliances, audio, gaming and more with side-by-side offers.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const country = COUNTRIES[DEFAULT_COUNTRY];
  const locale = localeFromCountry(country.code);
  const catalog = await fetchDefaultCatalog();
  const visibleCategories = SHOPPING_CATEGORIES.filter(
    (category) => (catalog.meta.categoryCounts[category.id] ?? 0) > 0
  );
  const visibleCollections = COMPARISON_COLLECTION_FILTERS.filter(
    (collection) => (catalog.meta.collectionCounts?.[collection.id] ?? 0) > 0
  );

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "All Products" }]} />

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Price Comparison
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Compare Product Prices</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Side-by-side offers from Swiss retailers. Filter by category below or browse the full
            catalog — every card shows comparative prices, delivery and merchant links.
          </p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {catalog.products.length} products compared in {country.name}
          </p>
        </div>

        {visibleCollections.length > 0 && (
          <section className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-700">
              <Sparkles className="w-3.5 h-3.5" />
              Collections
            </span>
            {visibleCollections.map((collection) => (
              <Link
                key={collection.id}
                href={collectionBrowsePath(collection.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-900 hover:border-orange-300 transition-colors"
              >
                {getCollectionLabel(collection.id, locale)}
                <span className="text-[10px] font-extrabold text-orange-700">
                  {catalog.meta.collectionCounts?.[collection.id] ?? 0}
                </span>
              </Link>
            ))}
          </section>
        )}

        {visibleCategories.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Browse by category
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={departmentCategoryPath(cat.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                >
                  {getDepartmentLabel(cat.id, locale)}
                  <span className="text-[10px] text-slate-400 font-extrabold">
                    {catalog.meta.categoryCounts[cat.id] ?? 0}
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-50" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {catalog.products.length > 0 ? (
          <CategoryProductGrid products={catalog.products} countryCode={DEFAULT_COUNTRY} />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            No offers are available yet. Try the homepage or check back after feeds sync.
          </div>
        )}
      </div>
    </PageShell>
  );
}
