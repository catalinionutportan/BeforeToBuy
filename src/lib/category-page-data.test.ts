import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPARISON_COLLECTION_FILTERS } from "@/lib/categories";
import {
  getCachedFirstBrowsePage,
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
const warmMeta = vi.hoisted(() => vi.fn(async (_country?: string) => undefined));
const revisions = vi.hoisted(() => ({ current: "before", scoped: undefined as string | undefined }));
vi.mock("@/lib/catalog-revision", () => ({
  getCatalogRevision: vi.fn(async () => revisions.scoped ?? revisions.current),
  withCatalogRevision: vi.fn(async (_country: string, operation: () => Promise<unknown>) => {
    const previous = revisions.scoped;
    revisions.scoped = revisions.current;
    try {
      return await operation();
    } finally {
      revisions.scoped = previous;
    }
  }),
}));
vi.mock("@/lib/product-service", () => ({
  fetchMergedProductsForLocation: fetchMerged,
}));
vi.mock("@/lib/db-service", () => ({
  warmBrowseMetaForCountry: (country: string) => warmMeta(country),
}));

describe("category page browse counts", () => {
  beforeEach(() => {
    resetCatalogBrowseCacheForTests();
    fetchMerged.mockReset();
    warmMeta.mockClear();
    revisions.current = "before";
    revisions.scoped = undefined;
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

  it("does not write a pre-import category result under the post-import revision", async () => {
    let releaseFetch!: () => void;
    const fetchGate = new Promise<void>((resolve) => {
      releaseFetch = resolve;
    });
    fetchMerged.mockImplementationOnce(async () => {
      await fetchGate;
      return {
        products: [{ id: "before-import" }],
        meta: { totalMatched: 1, catalogRevision: "before" },
      };
    });

    const request = fetchCatalogForCountry("CH", "auto-tires", CATEGORY_PAGE_LIST);
    await vi.waitFor(() => expect(fetchMerged).toHaveBeenCalledOnce());
    revisions.current = "after";
    releaseFetch();
    await request;

    expect(
      await getCachedFirstBrowsePage("CH", CATEGORY_PAGE_LIST.limit, "auto-tires")
    ).toBeNull();
    revisions.current = "before";
    await expect(
      getCachedFirstBrowsePage("CH", CATEGORY_PAGE_LIST.limit, "auto-tires")
    ).resolves.toMatchObject({ products: [{ id: "before-import" }] });
  });
});
