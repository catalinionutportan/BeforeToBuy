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
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import {
  getDepartmentLabel,
  getSubcategoryLabel,
} from "@/lib/category-i18n";
import { getCategoryById, getSubcategoryById } from "@/lib/categories";
import { COUNTRIES } from "@/lib/countries";
import { getRequestMarketCountry } from "@/lib/request-market";
import {
  BROWSE_LIST_OPTIONS,
  CATEGORY_PAGE_PRODUCT_LIMIT,
} from "@/lib/product-list-options";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import { withLangParam } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

const PAGE_LIST = {
  ...BROWSE_LIST_OPTIONS,
  limit: CATEGORY_PAGE_PRODUCT_LIMIT,
} as const;

interface SubcategoryPageProps {
  params: Promise<{ dept: string; sub: string }>;
  searchParams: LocaleSearchParams;
}

export async function generateMetadata({ params, searchParams }: SubcategoryPageProps): Promise<Metadata> {
  const { dept, sub } = await params;
  const route = validateSubcategoryRoute(dept, sub);
  const countryCode = await getRequestMarketCountry();
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
  const catalog = await fetchCatalogForCountry(countryCode, route.subId, PAGE_LIST);

  return createCategoryMetadata({
    title: formatUi(homeUi.categoryPriceComparisonMetaTitle, { label }),
    description: formatUi(homeUi.categoryPriceComparisonMetaDescription, {
      label: label.toLowerCase(),
    }),
    path: subcategoryCategoryPath(route.deptId, route.subId),
    index: (catalog.meta.totalMatched ?? catalog.products.length) > 0,
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
  const catalog = await fetchCatalogForCountry(countryCode, route.subId, PAGE_LIST);
  const departmentLabel = getDepartmentLabel(route.deptId, locale);
  const subcategoryLabel = getSubcategoryLabel(route.subId, locale);

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
          {(catalog.meta.totalMatched ?? catalog.products.length) > 0 ? (
            <p className="text-xs text-slate-500">
              {formatUi(homeUi.productsComparedIn, {
                count: catalog.meta.totalMatched ?? catalog.products.length,
                countryName: country.name,
              })}
            </p>
          ) : null}
        </header>

        {catalog.products.length > 0 ? (
          <CategoryProductGrid products={catalog.products} countryCode={countryCode} />
        ) : (
          <p className="text-sm text-slate-500">
            {formatUi(homeUi.noOffersAvailableInCategory, { countryName: country.name })}
          </p>
        )}
      </div>
    </PageShell>
  );
}
