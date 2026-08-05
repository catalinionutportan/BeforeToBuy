import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import {
  canonicalSubcategoryPath,
  departmentCategoryPath,
  subcategoryCategoryPath,
  validateSubcategoryRoute,
} from "@/lib/category-routes";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import {
  getDepartmentLabel,
  getSubcategoryLabel,
  localeFromCountry,
} from "@/lib/category-i18n";
import { getCategoryById, getSubcategoryById } from "@/lib/categories";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export const dynamic = "force-dynamic";

interface SubcategoryPageProps {
  params: Promise<{ dept: string; sub: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { dept, sub } = await params;
  const route = validateSubcategoryRoute(dept, sub);
  if (!route?.subId) {
    return createCategoryMetadata({
      title: "Category Not Found | BeforeToBuy.com",
      description: "The requested category could not be found.",
      path: `/categories/${dept}/${sub}`,
      index: false,
    });
  }

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const label = getSubcategoryLabel(route.subId, locale);
  const catalog = await fetchDefaultCatalog(route.subId);

  return createCategoryMetadata({
    title: `${label} Price Comparison | BeforeToBuy.com`,
    description: `Compare ${label.toLowerCase()} prices and offers in Switzerland on BeforeToBuy.com.`,
    path: subcategoryCategoryPath(route.deptId, route.subId),
    index: catalog.products.length > 0,
  });
}

export default async function SubcategoryCategoryPage({ params }: SubcategoryPageProps) {
  const { dept, sub } = await params;
  const route = validateSubcategoryRoute(dept, sub);
  if (!route?.subId) notFound();

  const canonicalPath = canonicalSubcategoryPath(dept, sub, route);
  if (canonicalPath) redirect(canonicalPath);

  const department = getCategoryById(route.deptId);
  const subcategory = getSubcategoryById(route.subId);
  if (!department || !subcategory) notFound();

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const catalog = await fetchDefaultCatalog(route.subId);
  const departmentLabel = getDepartmentLabel(route.deptId, locale);
  const subcategoryLabel = getSubcategoryLabel(route.subId, locale);

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: departmentLabel, href: departmentCategoryPath(route.deptId) },
            { label: subcategoryLabel },
          ]}
        />

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {departmentLabel}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{subcategoryLabel}</h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Compare {subcategoryLabel.toLowerCase()} offers from Swiss and cross-border retailers before
            you buy.
          </p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {catalog.products.length} products compared in Switzerland
          </p>
        </div>

        {catalog.products.length > 0 ? (
          <CategoryProductGrid products={catalog.products} countryCode={DEFAULT_COUNTRY} />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            No offers are available in this category for Switzerland yet.
          </div>
        )}
      </div>
    </PageShell>
  );
}
