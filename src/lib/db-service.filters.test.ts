import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const findMany = vi.fn();
const findFirst = vi.fn();
const count = vi.fn();
const groupBy = vi.fn();
const categoryRows = vi.fn();
const brandRows = vi.fn();
const countryRows = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => {
      const sql = JSON.stringify(args[0]);
      if (sql.includes("DISTINCT ON")) return Promise.resolve([]);
      if (sql.includes("COUNT(*)::int AS n")) return categoryRows(...args);
      if (sql.includes("SELECT mp.brand")) return brandRows(...args);
      if (sql.includes("countryTotal")) return countryRows(...args);
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
// Query-shape tests use the DB double; transaction lifecycle is tested separately.
vi.mock("@/lib/catalog-read-transaction", async () => ({
  catalogReadDb: () => prisma,
  withBoundedCatalogRead: async (_country: string, operation: () => Promise<unknown>) => operation(),
}));
import { prisma } from "@/lib/db";

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
    countryRows.mockResolvedValue([{ countryTotal: 50 }]);
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

  it.each(["CH", "DE", "GB", "US"])("counts and pages a %s text search in one matched set", async (country) => {
    await setCachedBrowseMeta(country, {
      countryProductCount: 50, categoryCovers: {}, brandOptions: [], categoryCounts: {}, leafCounts: {},
    });
    queryRaw.mockResolvedValue([{ total: 9, ids: ["second", "third"] }]);
    findMany.mockResolvedValue([mockProduct("third", 0), mockProduct("second", 0)]);
    const page = await getProductsFromDb(country, "needle", undefined, 2, 2);
    expect(page.totalMatched).toBe(9);
    expect(page.products.map((product) => product.id)).toEqual(["second", "third"]);
    expect(count).not.toHaveBeenCalled();
    expect(queryRaw).toHaveBeenCalledOnce();
    expect(findMany).toHaveBeenCalledOnce();
    const sql = queryRaw.mock.calls[0]![0];
    expect(sql.sql).toContain("WITH matched_products AS MATERIALIZED");
    expect(sql.sql).toContain("COUNT(*)::int FROM matched_products");
    expect(sql.sql).toContain("ORDER BY id ASC LIMIT");
    expect(sql.values).toContain("%needle%");
  });

  it("retains the true search total beyond the last page without fetching arbitrary products", async () => {
    await setCachedBrowseMeta("CH", {
      countryProductCount: 50, categoryCovers: {}, brandOptions: [], categoryCounts: {}, leafCounts: {},
    });
    queryRaw.mockResolvedValue([{ total: 3, ids: [] }]);
    const page = await getProductsFromDb("CH", "needle", undefined, 48, 96);
    expect(page.totalMatched).toBe(3);
    expect(page.products).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
    expect(count).not.toHaveBeenCalled();
  });

  it("uses an indexed exact country count on a cold search, without the old Prisma full-count path", async () => {
    queryRaw.mockResolvedValue([{ total: 0, ids: [] }]);
    const page = await getProductsFromDb("CH", "missing", undefined, 48, 0);
    expect(page.totalMatched).toBe(0);
    expect(page.countryProductCount).toBe(50);
    expect(count).not.toHaveBeenCalled();
    expect(countryRows).toHaveBeenCalledOnce();
    expect(categoryRows).not.toHaveBeenCalled();
    expect(brandRows).not.toHaveBeenCalled();
    expect(JSON.stringify(countryRows.mock.calls)).toContain("WITH market_products AS MATERIALIZED");
  });

  it("requires the Reifen classification offer itself to be in stock in a CH wheel search", async () => {
    await setCachedBrowseMeta("CH", {
      countryProductCount: 50, categoryCovers: {}, brandOptions: [], categoryCounts: {}, leafCounts: {},
    });
    queryRaw.mockResolvedValue([{ total: 0, ids: [] }]);
    await getProductsFromDb("CH", "wheel", "auto-complete-wheels", 24, 0);
    const sql = queryRaw.mock.calls[0]![0];
    expect(sql.sql).toMatch(/o\."feedMerchantId" = \?\s+AND o\."inStock" = true/);
  });

  it("applies category, brand, store, GTIN and delivery/price filters inside the shared search predicate", async () => {
    await setCachedBrowseMeta("CH", {
      countryProductCount: 50, categoryCovers: {}, brandOptions: [], categoryCounts: {}, leafCounts: {},
    });
    queryRaw.mockResolvedValue([{ total: 0, ids: [] }]);
    const needle = "value' OR 1=1 --";
    await getProductsFromDb("CH", needle, "notebooks-laptops", 24, 0, undefined, {
      brand: "Acer", domain: "acer.com", hasGtinOnly: true, freeDeliveryOnly: true,
      minTotalPrice: 100, maxTotalPrice: 200,
    });
    const sql = queryRaw.mock.calls[0]![0];
    expect(sql.sql).not.toContain(needle);
    expect(sql.values).toContain(`%${needle}%`);
    expect(sql.values).toContain("notebooks-laptops");
    expect(sql.values).toContain("Acer");
    expect(sql.values).toContain("%acer.com%");
    expect(sql.sql).toContain('o."inStock" = true');
    expect(sql.sql).toContain('o."deliveryCost" IS NOT NULL');
    expect(sql.sql).toContain('COALESCE(o."totalPrice", o.price)');
    expect(sql.sql).toContain("p.gtin IS NOT NULL");
    expect(count).not.toHaveBeenCalled();
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
