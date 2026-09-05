import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const findMany = vi.fn();
const findFirst = vi.fn();
const count = vi.fn();
const groupBy = vi.fn();
const categoryRows = vi.fn();
const brandRows = vi.fn();
const redisConfigured = vi.fn(() => true);

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

vi.mock("@/lib/db-category-filter", () => ({
  expandCategoryFilterToDbIds: () => undefined,
}));

vi.mock("@/lib/redis", () => ({
  isRedisConfigured: () => redisConfigured(),
}));

import { resetCatalogBrowseCacheForTests } from "@/lib/catalog-browse-cache";
import { getProductsFromDb } from "@/lib/db-service";

function mockProduct(id: string, minTotal: number) {
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
    basePrice: minTotal,
    offers: [
      {
        id: `${id}-offer`,
        storeName: "Store",
        price: minTotal,
        originalPrice: null,
        discountPercentage: null,
        currency: "RON",
        inStock: true,
        deliveryTime: null,
        deliveryCost: 0,
        totalPrice: minTotal,
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

describe("getProductsFromDb price sort", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    redisConfigured.mockReturnValue(true);
    resetCatalogBrowseCacheForTests();
    categoryRows.mockResolvedValue([{ category: "electronics", n: 6 }]);
    brandRows.mockResolvedValue([]);
    count.mockResolvedValue(6);
    findFirst.mockResolvedValue(null);
  });

  it("orders globally by min offer total even when cheapest id is after the first id page", async () => {
    queryRaw.mockResolvedValue([{ id: "prod-cheapest" }, { id: "prod-a" }]);
    findMany.mockResolvedValueOnce([mockProduct("prod-cheapest", 1), mockProduct("prod-a", 50)]);

    const page = await getProductsFromDb("RO", undefined, undefined, 2, 0, "price-asc");

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(page.products[0]?.id).toBe("prod-cheapest");
    expect(page.totalMatched).toBe(6);
    expect(0 + page.products.length < page.totalMatched).toBe(true);
  });

  it("supports deep offsets and hasMore at the catalogue tail", async () => {
    count.mockResolvedValue(10);
    categoryRows.mockResolvedValue([{ category: "electronics", n: 10 }]);
    queryRaw.mockResolvedValue([{ id: "prod-i" }, { id: "prod-j" }]);
    findMany.mockResolvedValueOnce([mockProduct("prod-i", 90), mockProduct("prod-j", 95)]);

    const page = await getProductsFromDb("RO", undefined, undefined, 2, 7, "price-asc");

    expect(page.products).toHaveLength(2);
    expect(7 + page.products.length < page.totalMatched).toBe(true);

    queryRaw.mockResolvedValue([{ id: "prod-k" }]);
    findMany.mockResolvedValueOnce([mockProduct("prod-k", 100)]);

    const last = await getProductsFromDb("RO", undefined, undefined, 2, 9, "price-asc");
    expect(9 + last.products.length < last.totalMatched).toBe(false);
  });

  it("orders the CH default page with Acer ids from SQL, not updatedAt", async () => {
    queryRaw.mockResolvedValue([{ id: "prod-ch-acer-1" }, { id: "prod-ch-babywalz-1" }]);
    findMany.mockResolvedValueOnce([
      mockProduct("prod-ch-babywalz-1", 20),
      mockProduct("prod-ch-acer-1", 15),
    ]);

    const page = await getProductsFromDb("CH", undefined, undefined, 2, 0);

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(page.products.map((product) => product.id)).toEqual([
      "prod-ch-acer-1",
      "prod-ch-babywalz-1",
    ]);
  });

  it("fills the CH first page with non-Acer ids after a short Acer slice", async () => {
    queryRaw
      .mockResolvedValueOnce([{ id: "prod-ch-acer-1" }])
      .mockResolvedValueOnce([{ id: "prod-ch-babywalz-1" }]);
    findMany.mockResolvedValueOnce([
      mockProduct("prod-ch-babywalz-1", 20),
      mockProduct("prod-ch-acer-1", 15),
    ]);

    const page = await getProductsFromDb("CH", undefined, undefined, 2, 0);

    expect(queryRaw).toHaveBeenCalledTimes(2);
    expect(page.products.map((product) => product.id)).toEqual([
      "prod-ch-acer-1",
      "prod-ch-babywalz-1",
    ]);
  });

  it("does not scan CH covers or groupBy on a cold first page", async () => {
    queryRaw.mockResolvedValue([{ id: "prod-ch-acer-1" }]);
    findMany.mockResolvedValue([mockProduct("prod-ch-acer-1", 15)]);

    await getProductsFromDb("CH", undefined, undefined, 1, 0);
    await getProductsFromDb("CH", undefined, undefined, 1, 0);

    expect(groupBy).not.toHaveBeenCalled();
    expect(findFirst).not.toHaveBeenCalled();
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("without Redis, CH All still leads with Acer but reports the full catalogue count", async () => {
    redisConfigured.mockReturnValue(false);
    queryRaw.mockResolvedValue([{ id: "prod-ch-acer-1" }]);
    findMany.mockResolvedValue([mockProduct("prod-ch-acer-1", 15)]);
    count.mockResolvedValue(42000);
    categoryRows.mockResolvedValue([{ category: "electronics", n: 42000 }]);

    const page = await getProductsFromDb("CH", undefined, undefined, 1, 0);

    expect(page.products.map((product) => product.id)).toEqual(["prod-ch-acer-1"]);
    expect(page.totalMatched).toBe(42000);
    expect(page.countryProductCount).toBe(42000);
    expect(categoryRows).toHaveBeenCalled();
    expect(count).not.toHaveBeenCalled();
  });
});
