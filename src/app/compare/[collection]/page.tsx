import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryOffersGrid } from "@/components/CategoryOffersGrid";
import {
  collectionBrowsePath,
  validateCollectionRoute,
} from "@/lib/category-routes";
import { getBrowseCountsForCountry } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import { getCollectionLabel } from "@/lib/category-i18n";
import { COMPARISON_COLLECTION_FILTERS } from "@/lib/categories";
import { COUNTRIES } from "@/lib/countries";
import { getRequestMarketCountry } from "@/lib/request-market";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";
import { withLangParam } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
  searchParams: LocaleSearchParams;
}

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  const collectionId = validateCollectionRoute(collection);
  const locale = await resolvePageLocale(searchParams);
  const homeUi = HOME_UI[locale];

  if (!collectionId) {
    return createCategoryMetadata({
      title: homeUi.collectionNotFoundMetaTitle,
      description: homeUi.collectionNotFoundMetaDescription,
      path: `/compare/${collection}`,
      index: false,
      locale,
    });
  }

  const label = getCollectionLabel(collectionId, locale);

  return createCategoryMetadata({
    title: `${label} | BeforeToBuy.com`,
    description: formatUi(homeUi.categoryPriceComparisonMetaDescription, {
      label: label.toLowerCase(),
    }),
    path: collectionBrowsePath(collectionId),
    index: true,
    locale,
  });
}

export default async function ComparisonCollectionPage({ params, searchParams }: CollectionPageProps) {
  const { collection } = await params;
  const collectionId = validateCollectionRoute(collection);
  if (!collectionId) notFound();

  const locale = await resolvePageLocale(searchParams);
  if (collection !== collectionId) redirect(collectionBrowsePath(collectionId, locale));

  const config = COMPARISON_COLLECTION_FILTERS.find((item) => item.id === collectionId);
  if (!config) notFound();

  const countryCode = await getRequestMarketCountry();
  const country = COUNTRIES[countryCode];
  const homeUi = HOME_UI[locale];
  const counts = await getBrowseCountsForCountry(countryCode);
  const matched = counts.collectionCounts[collectionId] ?? 0;
  const label = getCollectionLabel(collectionId, locale);
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
            { label: label },
          ]}
        />

        <div className="bg-orange-50 border border-orange-200 text-orange-950 p-8 sm:p-10 rounded-3xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
            {homeUi.collections}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{label}</h1>
          <p className="text-sm max-w-3xl leading-relaxed text-orange-900/90">{config.description}</p>
          {matched > 0 ? (
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
              {formatUi(homeUi.productsComparedIn, {
                count: matched,
                countryName: country.name,
              })}
            </p>
          ) : null}
        </div>

        <Suspense fallback={null}>
          <CategoryOffersGrid
            countryCode={countryCode}
            category={collectionId}
            emptyLabel={emptyLabel}
            emptyClassName="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600"
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
