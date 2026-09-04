import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryOffersGrid } from "@/components/CategoryOffersGrid";
import {
  canonicalSubcategoryPath,
  departmentCategoryPath,
  subcategoryCategoryPath,
  validateSubcategoryRoute,
} from "@/lib/category-routes";
import { getBrowseCountsForCountry } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import {
  getDepartmentLabel,
  getSubcategoryLabel,
} from "@/lib/category-i18n";
import { getCategoryById, getSubcategoryById } from "@/lib/categories";
import { COUNTRIES } from "@/lib/countries";
import { getRequestMarketCountry } from "@/lib/request-market";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import { withLangParam } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

interface SubcategoryPageProps {
  params: Promise<{ dept: string; sub: string }>;
  searchParams: LocaleSearchParams;
}

export async function generateMetadata({ params, searchParams }: SubcategoryPageProps): Promise<Metadata> {
  const { dept, sub } = await params;
  const route = validateSubcategoryRoute(dept, sub);
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  if (!route?.subId) {
    return createCategoryMetadata({
      title: homeUi.categoryNotFoundMetaTitle,
      description: homeUi.categoryNotFoundMetaDescription,
      path: `/categories/${dept}/${sub}`,
      index: false,
      locale,
    });
  }

  const label = getSubcategoryLabel(route.subId, locale);

  return createCategoryMetadata({
    title: formatUi(homeUi.categoryPriceComparisonMetaTitle, { label }),
    description: formatUi(homeUi.categoryPriceComparisonMetaDescription, {
      label: label.toLowerCase(),
    }),
    path: subcategoryCategoryPath(route.deptId, route.subId),
    index: true,
    locale,
  });
}

export default async function SubcategoryCategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { dept, sub } = await params;
  const route = validateSubcategoryRoute(dept, sub);
  if (!route?.subId) notFound();

  const locale = await resolvePageLocale(searchParams);
  const canonicalPath = canonicalSubcategoryPath(dept, sub, route, locale);
  if (canonicalPath) redirect(canonicalPath);

  const department = getCategoryById(route.deptId);
  const subcategory = getSubcategoryById(route.subId);
  if (!department || !subcategory) notFound();

  const countryCode = await getRequestMarketCountry();
  const country = COUNTRIES[countryCode];
  const homeUi = HOME_UI[locale];
  const counts = await getBrowseCountsForCountry(countryCode);
  const departmentLabel = getDepartmentLabel(route.deptId, locale);
  const subcategoryLabel = getSubcategoryLabel(route.subId, locale);
  const matched = counts.categoryCounts[route.subId] ?? 0;
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
            { label: departmentLabel, href: departmentCategoryPath(route.deptId, locale) },
            { label: subcategoryLabel },
          ]}
        />

        <header className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {departmentLabel}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {subcategoryLabel}
          </h1>
          {matched > 0 ? (
            <p className="text-xs text-slate-500">
              {formatUi(homeUi.productsComparedIn, {
                count: matched,
                countryName: country.name,
              })}
            </p>
          ) : null}
        </header>

        <Suspense fallback={null}>
          <CategoryOffersGrid
            countryCode={countryCode}
            category={route.subId}
            emptyLabel={emptyLabel}
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
