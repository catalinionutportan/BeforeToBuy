import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryOffersGrid } from "@/components/CategoryOffersGrid";
import {
  canonicalDepartmentPath,
  subcategoryCategoryPath,
  validateDepartmentRoute,
} from "@/lib/category-routes";
import { getBrowseCountsForCountry, hasBrowseInventory } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import { getDepartmentLabel, getSubcategoryLabel } from "@/lib/category-i18n";
import { getCategoryById } from "@/lib/categories";
import { COUNTRIES } from "@/lib/countries";
import { getRequestMarketCountry } from "@/lib/request-market";
import { ChevronRight } from "lucide-react";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import { withLangParam } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

interface DepartmentPageProps {
  params: Promise<{ dept: string }>;
  searchParams: LocaleSearchParams;
}

export async function generateMetadata({ params, searchParams }: DepartmentPageProps): Promise<Metadata> {
  const { dept } = await params;
  const route = validateDepartmentRoute(dept);
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  if (!route) {
    return createCategoryMetadata({
      title: homeUi.categoryNotFoundMetaTitle,
      description: homeUi.categoryNotFoundMetaDescription,
      path: `/categories/${dept}`,
      index: false,
      locale,
    });
  }

  const label = getDepartmentLabel(route.deptId, locale);

  return createCategoryMetadata({
    title: formatUi(homeUi.categoryPriceComparisonMetaTitle, { label }),
    description: formatUi(homeUi.categoryPriceComparisonMetaDescription, {
      label: label.toLowerCase(),
    }),
    path: `/categories/${dept}`,
    index: true,
    locale,
  });
}

export default async function DepartmentCategoryPage({ params, searchParams }: DepartmentPageProps) {
  const { dept } = await params;
  const route = validateDepartmentRoute(dept);
  if (!route) notFound();

  const locale = await resolvePageLocale(searchParams);
  const canonicalPath = canonicalDepartmentPath(dept, route.deptId, locale);
  if (canonicalPath) redirect(canonicalPath);

  const category = getCategoryById(route.deptId);
  if (!category) notFound();

  const countryCode = await getRequestMarketCountry();
  const country = COUNTRIES[countryCode];
  const homeUi = HOME_UI[locale];
  const counts = await getBrowseCountsForCountry(countryCode);
  const visibleSubs = hasBrowseInventory(counts)
    ? category.subcategories.filter((sub) => (counts.categoryCounts[sub.id] ?? 0) > 0)
    : category.subcategories;
  const departmentLabel = getDepartmentLabel(route.deptId, locale);
  const matched = counts.categoryCounts[route.deptId] ?? 0;
  const emptyLabel = formatUi(homeUi.noOffersAvailableInCategory, {
    countryName: country.name,
  });

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs
          items={[
            { label: "Home", href: withLangParam("/", locale) },
            { label: homeUi.categories, href: withLangParam("/categories", locale) },
            { label: departmentLabel },
          ]}
        />

        <header className="space-y-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {departmentLabel}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{category.description}</p>
          {matched > 0 ? (
            <p className="text-xs text-slate-500">
              {formatUi(homeUi.productsComparedIn, {
                count: matched,
                countryName: country.name,
              })}
            </p>
          ) : null}
        </header>

        {visibleSubs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              {homeUi.subcategories}
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleSubs.map((sub) => (
                <Link
                  key={sub.id}
                  href={subcategoryCategoryPath(route.deptId, sub.id, locale)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
                >
                  {getSubcategoryLabel(sub.id, locale)}
                  <span className="text-[10px] text-slate-400">
                    {counts.categoryCounts[sub.id] ?? 0}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <Suspense fallback={null}>
          <CategoryOffersGrid
            countryCode={countryCode}
            category={route.deptId}
            emptyLabel={emptyLabel}
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
