import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import {
  CATEGORY_PAGE_LIST,
  fetchCatalogForCountry,
} from "@/lib/category-page-data";
import type { CountryCode } from "@/types";

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
