import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPARISON_COLLECTION_FILTERS } from "@/lib/categories";
import {
  resetCatalogBrowseCacheForTests,
  setCachedBrowseMeta,
  setCachedFirstBrowsePage,
} from "@/lib/catalog-browse-cache";
import {
  CATEGORY_PAGE_LIST,
  collectionCountsFromLeafCounts,
  fetchCatalogForCountry,
  getBrowseCountsForCountry,
} from "@/lib/category-page-data";

const fetchMerged = vi.hoisted(() => vi.fn());
vi.mock("@/lib/product-service", () => ({
  fetchMergedProductsForLocation: fetchMerged,
}));

describe("category page browse counts", () => {
  beforeEach(() => {
    resetCatalogBrowseCacheForTests();
    fetchMerged.mockReset();
  });

  it("exposes one collection count key per comparison filter", () => {
    const counts = collectionCountsFromLeafCounts({ "notebooks-laptops": 4 });
    expect(Object.keys(counts).sort()).toEqual(
      COMPARISON_COLLECTION_FILTERS.map((item) => item.id).sort()
    );
  });

  it("reads cached browse meta without hitting the catalog", async () => {
    await setCachedBrowseMeta("CH", {
      categoryCounts: { electronics: 8, "notebooks-laptops": 5 },
      leafCounts: { "notebooks-laptops": 5 },
      categoryCovers: {},
      countryProductCount: 8,
      brandOptions: ["Acer"],
    });

    const counts = await getBrowseCountsForCountry("CH");
    expect(counts.totalMatched).toBe(8);
    expect(counts.categoryCounts.electronics).toBe(8);
    expect(counts.collectionCounts).toEqual(
      collectionCountsFromLeafCounts({ "notebooks-laptops": 5 })
    );
  });

  it("serves a cached aisle page without hitting the catalog", async () => {
    await setCachedFirstBrowsePage(
      "CH",
      CATEGORY_PAGE_LIST.limit,
      { products: [{ id: "tire-1" }], meta: { totalMatched: 12 } },
      "auto-tires"
    );
    const catalog = await fetchCatalogForCountry("CH", "auto-tires", CATEGORY_PAGE_LIST);
    expect(catalog.products).toEqual([{ id: "tire-1" }]);
    expect(fetchMerged).not.toHaveBeenCalled();
  });
});
