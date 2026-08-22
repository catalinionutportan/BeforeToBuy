import { beforeEach, describe, expect, it } from "vitest";
import { COMPARISON_COLLECTION_FILTERS } from "@/lib/categories";
import {
  resetCatalogBrowseCacheForTests,
  setCachedBrowseMeta,
} from "@/lib/catalog-browse-cache";
import {
  collectionCountsFromLeafCounts,
  getBrowseCountsForCountry,
} from "@/lib/category-page-data";

describe("category page browse counts", () => {
  beforeEach(() => {
    resetCatalogBrowseCacheForTests();
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
});
