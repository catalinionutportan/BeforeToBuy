import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import {
  canonicalDepartmentPath,
  subcategoryCategoryPath,
  validateDepartmentRoute,
} from "@/lib/category-routes";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import { getDepartmentLabel, getSubcategoryLabel, localeFromCountry } from "@/lib/category-i18n";
import { getCategoryById } from "@/lib/categories";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { ChevronRight } from "lucide-react";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

const homeUi = HOME_UI[DEFAULT_LOCALE];

interface DepartmentPageProps {
  params: Promise<{ dept: string }>;
}

export async function generateMetadata({ params }: DepartmentPageProps): Promise<Metadata> {
  const { dept } = await params;
  const route = validateDepartmentRoute(dept);
  if (!route) {
    return createCategoryMetadata({
      title: homeUi.categoryNotFoundMetaTitle,
      description: homeUi.categoryNotFoundMetaDescription,
      path: `/categories/${dept}`,
      index: false,
    });
  }

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const label = getDepartmentLabel(route.deptId, locale);
  const catalog = await fetchDefaultCatalog(route.deptId);

  return createCategoryMetadata({
    title: formatUi(homeUi.categoryPriceComparisonMetaTitle, { label }),
    description: formatUi(homeUi.categoryPriceComparisonMetaDescription, {
      label: label.toLowerCase(),
    }),
    path: `/categories/${dept}`,
    index: catalog.products.length > 0,
  });
}

export default async function DepartmentCategoryPage({ params }: DepartmentPageProps) {
  const { dept } = await params;
  const route = validateDepartmentRoute(dept);
  if (!route) notFound();

  const canonicalPath = canonicalDepartmentPath(dept, route.deptId);
  if (canonicalPath) redirect(canonicalPath);

  const category = getCategoryById(route.deptId);
  if (!category) notFound();

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const catalog = await fetchDefaultCatalog(route.deptId);
  const visibleSubs = category.subcategories.filter(
    (sub) => (catalog.meta.categoryCounts[sub.id] ?? 0) > 0
  );
  const departmentLabel = getDepartmentLabel(route.deptId, locale);

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: departmentLabel },
          ]}
        />

        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{departmentLabel}</h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">{category.description}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {formatUi(homeUi.productsComparedInSwitzerland, { count: catalog.products.length })}
          </p>
        </div>

        {visibleSubs.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              {homeUi.subcategories}
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleSubs.map((sub) => (
                <Link
                  key={sub.id}
                  href={subcategoryCategoryPath(route.deptId, sub.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                >
                  {getSubcategoryLabel(sub.id, locale)}
                  <span className="text-[10px] text-slate-400">
                    {catalog.meta.categoryCounts[sub.id] ?? 0}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {catalog.products.length > 0 ? (
          <CategoryProductGrid products={catalog.products} countryCode={DEFAULT_COUNTRY} />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            {homeUi.noOffersAvailableInCategory}
          </div>
        )}
      </div>
    </PageShell>
  );
}
