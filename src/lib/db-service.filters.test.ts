import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const findMany = vi.fn();
const findFirst = vi.fn();
const count = vi.fn();
const groupBy = vi.fn();
const categoryRows = vi.fn();
const brandRows = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => {
      const sql = JSON.stringify(args[0]);
      if (sql.includes("DISTINCT ON")) return Promise.resolve([]);
      if (sql.includes("COUNT(*)::int AS n")) return categoryRows(...args);
      if (sql.includes("SELECT mp.brand")) return brandRows(...args);
      return queryRaw(...args);
    },
    product: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      count: (...args: unknown[]) => count(...args),
      groupBy: (...args: unknown[]) => groupBy(...args),
    },
  },
}));

import { resetCatalogBrowseCacheForTests, setCachedBrowseMeta } from "@/lib/catalog-browse-cache";
import { getProductsFromDb } from "@/lib/db-service";

function mockProduct(id: string, deliveryCost: number | null) {
  return {
    id,
    title: `Product ${id}`,
    description: "",
    gtin: null,
    brand: "Brand",
    category: "electronics",
    image: "https://www.rowenta.ro/media/product.jpg",
    catalogSource: "production-live",
    targetCountries: ["RO"],
    basePrice: 100,
    offers: [
      {
        id: `${id}-offer`,
        storeName: "Store",
        price: 100,
        originalPrice: null,
        discountPercentage: null,
        currency: "RON",
        inStock: true,
        deliveryTime: null,
        deliveryCost,
        totalPrice: deliveryCost == null ? null : 100 + deliveryCost,
        purchaseUrl: "https://www.rowenta.ro/buy",
        affiliateNetwork: "2performant",
        source: "production-live",
        feedMerchantId: "ro-rowenta",
        merchantProductId: id,
        fetchedAt: new Date().toISOString(),
      },
    ],
  };
}

describe("getProductsFromDb offer visibility", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetCatalogBrowseCacheForTests();
    queryRaw.mockResolvedValue([]);
    categoryRows.mockResolvedValue([]);
    brandRows.mockResolvedValue([]);
    groupBy.mockResolvedValue([]);
    findFirst.mockResolvedValue(null);
  });

  it("counts the full related-leaf selection instead of truncating pages to one cached leaf", async () => {
    await setCachedBrowseMeta("CH", {
      countryProductCount: 2, categoryCovers: {}, brandOptions: [],
      categoryCounts: { "fashion-beauty-hair-care": 1 },
      leafCounts: { "fashion-beauty-hair-care": 1, "care-hair-styling": 1 },
    });
    count.mockResolvedValue(2);
    findMany.mockResolvedValue([mockProduct("hair-care", 0)]);
    const page = await getProductsFromDb("CH", undefined, "fashion-beauty-hair-care", 1, 0);
    expect(page.totalMatched).toBe(2);
    expect(count).toHaveBeenCalledOnce();
    expect(page.products.length < page.totalMatched).toBe(true);
  });

  it("drops products whose visible offers were filtered out after fetch", async () => {
    count.mockResolvedValue(2);
    queryRaw.mockResolvedValue([{ id: "with-offers" }, { id: "empty" }]);
    findMany
      .mockResolvedValueOnce([
        mockProduct("with-offers", 0),
        { ...mockProduct("empty", 0), offers: [] },
      ]);

    const page = await getProductsFromDb("RO", undefined, undefined, 10, 0);

    expect(page.products).toHaveLength(1);
    expect(page.products[0]?.id).toBe("with-offers");
    expect(page.products.every((product) => product.offers.length > 0)).toBe(true);
  });

  it("uses the same totalMatched semantics for hasMore with freeDeliveryOnly", async () => {
    count.mockResolvedValue(3);
    queryRaw.mockResolvedValue([{ id: "free" }]);
    findMany.mockResolvedValueOnce([mockProduct("free", 0)]);

    const page = await getProductsFromDb("RO", undefined, undefined, 1, 0, undefined, {
      freeDeliveryOnly: true,
    });

    expect(page.totalMatched).toBe(3);
    expect(page.products).toHaveLength(1);
    expect(0 + page.products.length < page.totalMatched).toBe(true);

    const filteredCountPayload = count.mock.calls
      .map((call) => JSON.stringify(call[0] ?? {}))
      .find((payload) => payload.includes("deliveryCost"));
    expect(filteredCountPayload).toBeTruthy();
    expect(filteredCountPayload).toContain('"lte":0');
    expect(filteredCountPayload).toContain('"not":null');
  });

  it("narrows sparse RO pages with the country GIN index before global ID ordering", async () => {
    count.mockResolvedValue(1);
    queryRaw.mockResolvedValue([{ id: "ro-product" }]);
    findMany.mockResolvedValueOnce([mockProduct("ro-product", 0)]);

    const page = await getProductsFromDb("RO", "rowenta", undefined, 24, 0);

    expect(page.products).toHaveLength(1);
    const query = JSON.stringify(queryRaw.mock.calls[0] ?? []);
    expect(query).toContain("WITH matched_products AS MATERIALIZED");
    expect(query).toContain('\\"targetCountries\\" @> ARRAY[');
    expect(query).toContain("ORDER BY id ASC");
  });

  it("uses offer price for sparse-market min/max when totalPrice is null", async () => {
    count.mockResolvedValue(1);
    queryRaw.mockResolvedValue([{ id: "null-total" }]);
    const product = mockProduct("null-total", 50);
    product.offers[0]!.totalPrice = null;
    findMany.mockResolvedValueOnce([product]);

    const page = await getProductsFromDb("RO", undefined, undefined, 24, 0, undefined, {
      minTotalPrice: 90,
      maxTotalPrice: 120,
    });

    expect(page.totalMatched).toBe(1);
    expect(page.products).toHaveLength(1);
    expect(page.products[0]?.offers[0]?.deliveryCost).toBe(50);
    expect(page.products[0]?.offers[0]?.totalPrice).toBeUndefined();
    const query = JSON.stringify(queryRaw.mock.calls[0] ?? []);
    expect(query).toContain('COALESCE(o.\\"totalPrice\\", o.price)');
    expect(query).not.toContain('o.price + COALESCE(o.\\"deliveryCost\\", 0)');
  });

  it("price sort applies explicit free-delivery SQL (null delivery is not free)", async () => {
    count.mockResolvedValue(1);
    queryRaw.mockResolvedValue([{ id: "free" }]);
    findMany.mockResolvedValueOnce([mockProduct("free", 0)]);

    await getProductsFromDb("RO", undefined, undefined, 5, 0, "price-asc", {
      freeDeliveryOnly: true,
    });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    const serialized = JSON.stringify(queryRaw.mock.calls[0]?.[0] ?? {});
    expect(serialized).toMatch(/deliveryCost/i);
    expect(serialized).not.toMatch(/COALESCE\(o\\."deliveryCost", 0\) <= 0/);
  });
});
