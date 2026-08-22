import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import {
  CATEGORY_PAGE_LIST,
  fetchCatalogForCountry,
} from "@/lib/category-page-data";
import type { CountryCode } from "@/types";

export function CategoryProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-56 min-w-0 animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export async function CategoryOffersGrid({
  countryCode,
  category,
  emptyLabel,
  emptyClassName = "text-sm text-slate-500",
}: {
  countryCode: CountryCode;
  category?: string;
  emptyLabel: string;
  emptyClassName?: string;
}) {
  const catalog = await fetchCatalogForCountry(countryCode, category, CATEGORY_PAGE_LIST);
  if (catalog.products.length === 0) {
    return <p className={emptyClassName}>{emptyLabel}</p>;
  }
  return <CategoryProductGrid products={catalog.products} countryCode={countryCode} />;
}
