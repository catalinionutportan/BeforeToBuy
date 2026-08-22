import { cache } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COMPARISON_COLLECTION_FILTERS, productMatchesCategoryFilter } from "@/lib/categories";
import {
  getCachedBrowseMeta,
  getCachedFirstBrowsePage,
  setCachedFirstBrowsePage,
} from "@/lib/catalog-browse-cache";
import { COUNTRIES } from "@/lib/countries";
import { getCategoryCountsFromDb } from "@/lib/db-service";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";
import {
  BROWSE_LIST_OPTIONS,
  CATEGORY_PAGE_PRODUCT_LIMIT,
  type ProductListOptions,
  type ProductSortOption,
} from "@/lib/product-list-options";
import { fetchMergedProductsForLocation } from "@/lib/product-service";

export const CATEGORY_PAGE_LIST = {
  ...BROWSE_LIST_OPTIONS,
  limit: CATEGORY_PAGE_PRODUCT_LIMIT,
} as const;

export type BrowseCounts = {
  categoryCounts: Record<string, number>;
  leafCounts: Record<string, number>;
  collectionCounts: Record<string, number>;
  totalMatched: number;
};

export function getBrowseLocationForCountry(countryCode: CountryCode): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[getPrimaryLiveBrowseCountry()];
  return {
    countryCode: country.code,
    countryName: country.name,
  };
}

export function getDefaultBrowseLocation(): UserLocation {
  return getBrowseLocationForCountry(getPrimaryLiveBrowseCountry());
}

export function collectionCountsFromLeafCounts(
  leafCounts: Record<string, number>
): Record<string, number> {
  return COMPARISON_COLLECTION_FILTERS.reduce<Record<string, number>>((counts, collection) => {
    counts[collection.id] = Object.entries(leafCounts).reduce(
      (sum, [id, n]) =>
        productMatchesCategoryFilter(
          { title: "", description: "", brand: "", category: id },
          collection.id
        )
          ? sum + n
          : sum,
      0
    );
    return counts;
  }, {});
}

const cachedCatalogFetch = cache(
  async (
    countryCode: CountryCode,
    category: string | undefined,
    limit: number | undefined,
    offset: number,
    sort: ProductSortOption | undefined,
    includePriceHistory: boolean,
    compact: boolean,
    filtersKey: string
  ) => {
    return fetchMergedProductsForLocation(
      getBrowseLocationForCountry(countryCode),
      undefined,
      category,
      undefined,
      {
        limit,
        offset,
        sort,
        includePriceHistory,
        compact,
        filters: filtersKey ? (JSON.parse(filtersKey) as ProductListOptions["filters"]) : undefined,
      }
    );
  }
);

export async function fetchCatalogForCountry(
  countryCode: CountryCode,
  category?: string,
  listOptions?: ProductListOptions
) {
  const compact = listOptions?.compact ?? listOptions?.limit != null;
  const offset = listOptions?.offset ?? 0;
  const limit = listOptions?.limit;
  const cacheableFirstPage =
    offset === 0 &&
    !listOptions?.sort &&
    listOptions?.includePriceHistory !== true &&
    !listOptions?.filters &&
    limit != null;

  if (cacheableFirstPage) {
    const cachedPage = await getCachedFirstBrowsePage(countryCode, limit, category);
    if (cachedPage?.products?.length) {
      return cachedPage as Awaited<ReturnType<typeof cachedCatalogFetch>>;
    }
  }

  const result = await cachedCatalogFetch(
    countryCode,
    category,
    listOptions?.limit,
    offset,
    listOptions?.sort,
    listOptions?.includePriceHistory === true,
    compact,
    listOptions?.filters ? JSON.stringify(listOptions.filters) : ""
  );
  if (cacheableFirstPage && result.products.length > 0) {
    void setCachedFirstBrowsePage(
      countryCode,
      limit,
      { products: result.products, meta: result.meta },
      category
    );
  }
  return result;
}

/**
 * Counts/chips for category pages — Redis/memory first, groupBy if cold.
 * Does not load the 96-product grid.
 */
export async function getBrowseCountsForCountry(
  countryCode: CountryCode
): Promise<BrowseCounts> {
  const cached = await getCachedBrowseMeta(countryCode);
  if (cached) {
    return {
      categoryCounts: cached.categoryCounts,
      leafCounts: cached.leafCounts,
      collectionCounts: collectionCountsFromLeafCounts(cached.leafCounts),
      totalMatched: cached.countryProductCount,
    };
  }

  if (process.env.FORCE_SAMPLE_FEEDS !== "1") {
    try {
      const maps = await getCategoryCountsFromDb(countryCode);
      return {
        categoryCounts: maps.categoryCounts,
        leafCounts: maps.leafCounts,
        collectionCounts: collectionCountsFromLeafCounts(maps.leafCounts),
        totalMatched: Object.values(maps.leafCounts).reduce((sum, n) => sum + n, 0),
      };
    } catch {
      // Sample-feed / missing-DB fallback below.
    }
  }

  const catalog = await fetchCatalogForCountry(countryCode, undefined, {
    ...BROWSE_LIST_OPTIONS,
    limit: 1,
  });
  return {
    categoryCounts: catalog.meta.categoryCounts,
    leafCounts: {},
    collectionCounts: catalog.meta.collectionCounts ?? {},
    totalMatched: catalog.meta.totalMatched ?? catalog.products.length,
  };
}

/** Sitemap / fallbacks — use primary live market (RO), not empty CH default. */
export async function fetchDefaultCatalog(
  category?: string,
  listOptions?: ProductListOptions
) {
  return fetchCatalogForCountry(getPrimaryLiveBrowseCountry(), category, listOptions);
}
