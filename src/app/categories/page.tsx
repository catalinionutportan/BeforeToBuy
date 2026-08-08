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
import { ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { createPageMetadata } from "@/lib/metadata";
import { COUNTRIES } from "@/lib/countries";
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import { getRequestMarketCountry } from "@/lib/request-market";
import {
  BROWSE_LIST_OPTIONS,
  CATEGORY_PAGE_PRODUCT_LIMIT,
} from "@/lib/product-list-options";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const countryCode = await getRequestMarketCountry();
  const locale = localeFromCountry(countryCode);
  const homeUi = HOME_UI[locale];
  return createPageMetadata({
    title: homeUi.categoriesMetaTitle,
    description: homeUi.categoriesMetaDescription,
    path: "/categories",
  });
}

export default async function CategoriesPage() {
  const countryCode = await getRequestMarketCountry();
  const country = COUNTRIES[countryCode];
  const locale = localeFromCountry(countryCode);
  const homeUi = HOME_UI[locale];
  const catalog = await fetchCatalogForCountry(countryCode, undefined, {
    ...BROWSE_LIST_OPTIONS,
    limit: CATEGORY_PAGE_PRODUCT_LIMIT,
  });
  const visibleCategories = SHOPPING_CATEGORIES.filter(
    (category) => (catalog.meta.categoryCounts[category.id] ?? 0) > 0
  );
  const visibleCollections = COMPARISON_COLLECTION_FILTERS.filter(
    (collection) => (catalog.meta.collectionCounts?.[collection.id] ?? 0) > 0
  );
  const comparedCount = catalog.meta.totalMatched ?? catalog.products.length;

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: homeUi.allProducts },
          ]}
        />

        <header className="space-y-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {homeUi.compareProductPrices}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            {homeUi.categoriesDescription}
          </p>
          {comparedCount > 0 ? (
            <p className="text-xs text-slate-500">
              {formatUi(homeUi.productsComparedIn, {
                count: comparedCount,
                countryName: country.name,
              })}
            </p>
          ) : null}
        </header>

        {visibleCollections.length > 0 && (
          <section className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-700">
              <Sparkles className="w-3.5 h-3.5" />
              {homeUi.collections}
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
              {homeUi.browseByCategory}
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
          <CategoryProductGrid products={catalog.products} countryCode={countryCode} />
        ) : (
          <p className="text-sm text-slate-500">{homeUi.noOffersAvailable}</p>
        )}
      </div>
    </PageShell>
  );
}
