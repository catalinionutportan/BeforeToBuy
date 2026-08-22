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
  hasBrowseInventory,
} from "@/lib/category-page-data";

const fetchMerged = vi.hoisted(() => vi.fn());
const warmMeta = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("@/lib/product-service", () => ({
  fetchMergedProductsForLocation: fetchMerged,
}));
vi.mock("@/lib/db-service", () => ({
  warmBrowseMetaForCountry: (...args: unknown[]) => warmMeta(...args),
}));

describe("category page browse counts", () => {
  beforeEach(() => {
    resetCatalogBrowseCacheForTests();
    fetchMerged.mockReset();
    warmMeta.mockClear();
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

  it("does not scan the catalogue when browse meta is cold", async () => {
    const counts = await getBrowseCountsForCountry("CH");
    expect(counts).toEqual({
      categoryCounts: {},
      leafCounts: {},
      collectionCounts: {},
      totalMatched: 0,
    });
    expect(hasBrowseInventory(counts)).toBe(false);
    expect(fetchMerged).not.toHaveBeenCalled();
    expect(warmMeta).toHaveBeenCalledWith("CH");
  });
});
