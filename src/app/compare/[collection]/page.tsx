import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CategoryBreadcrumbs } from "@/components/CategoryBreadcrumbs";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import {
  collectionBrowsePath,
  validateCollectionRoute,
} from "@/lib/category-routes";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import { createCategoryMetadata } from "@/lib/metadata";
import { getCollectionLabel, localeFromCountry } from "@/lib/category-i18n";
import { COMPARISON_COLLECTION_FILTERS } from "@/lib/categories";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { HOME_UI } from "@/lib/i18n/ui";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  const collectionId = validateCollectionRoute(collection);
  if (!collectionId) {
    return createCategoryMetadata({
      title: HOME_UI.en.collectionNotFoundMetaTitle,
      description: HOME_UI.en.collectionNotFoundMetaDescription,
      path: `/compare/${collection}`,
      index: false,
    });
  }

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const label = getCollectionLabel(collectionId, locale);
  const catalog = await fetchDefaultCatalog(collectionId);

  return createCategoryMetadata({
    title: `${label} | BeforeToBuy.com`,
    description: `Browse ${label.toLowerCase()} comparison offers in Switzerland on BeforeToBuy.com.`,
    path: collectionBrowsePath(collectionId),
    index: catalog.products.length > 0,
  });
}

export default async function ComparisonCollectionPage({ params }: CollectionPageProps) {
  const { collection } = await params;
  const collectionId = validateCollectionRoute(collection);
  if (!collectionId) notFound();

  if (collection !== collectionId) {
    redirect(collectionBrowsePath(collectionId));
  }

  const config = COMPARISON_COLLECTION_FILTERS.find((item) => item.id === collectionId);
  if (!config) notFound();

  const locale = localeFromCountry(DEFAULT_COUNTRY);
  const catalog = await fetchDefaultCatalog(collectionId);
  const label = getCollectionLabel(collectionId, locale);

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8">
        <CategoryBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: label },
          ]}
        />

        <div className="bg-orange-50 border border-orange-200 text-orange-950 p-8 sm:p-10 rounded-3xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
            Comparison collection
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{label}</h1>
          <p className="text-sm max-w-3xl leading-relaxed text-orange-900/90">{config.description}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
            {catalog.products.length} matching products in Switzerland
          </p>
        </div>

        {catalog.products.length > 0 ? (
          <CategoryProductGrid products={catalog.products} countryCode={DEFAULT_COUNTRY} />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            No offers match this comparison collection in Switzerland yet.
          </div>
        )}
      </div>
    </PageShell>
  );
}
