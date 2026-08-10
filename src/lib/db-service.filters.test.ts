import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const findMany = vi.fn();
const count = vi.fn();
const groupBy = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
    product: {
      findMany: (...args: unknown[]) => findMany(...args),
      count: (...args: unknown[]) => count(...args),
      groupBy: (...args: unknown[]) => groupBy(...args),
    },
  },
}));

vi.mock("@/lib/db-category-filter", () => ({
  expandCategoryFilterToDbIds: () => undefined,
}));

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
    vi.clearAllMocks();
    groupBy.mockResolvedValue([]);
  });

  it("drops products whose visible offers were filtered out after fetch", async () => {
    count.mockResolvedValue(2);
    findMany
      .mockResolvedValueOnce([
        mockProduct("with-offers", 0),
        { ...mockProduct("empty", 0), offers: [] },
      ])
      .mockResolvedValueOnce([{ brand: "Brand" }]);

    const page = await getProductsFromDb("RO", undefined, undefined, 10, 0);

    expect(page.products).toHaveLength(1);
    expect(page.products[0]?.id).toBe("with-offers");
    expect(page.products.every((product) => product.offers.length > 0)).toBe(true);
  });

  it("uses the same totalMatched semantics for hasMore with freeDeliveryOnly", async () => {
    count.mockResolvedValue(3);
    findMany
      .mockResolvedValueOnce([mockProduct("free", 0)])
      .mockResolvedValueOnce([{ brand: "Brand" }]);

    const page = await getProductsFromDb("RO", undefined, undefined, 1, 0, undefined, {
      freeDeliveryOnly: true,
    });

    expect(page.totalMatched).toBe(3);
    expect(page.products).toHaveLength(1);
    expect(0 + page.products.length < page.totalMatched).toBe(true);

    const countPayload = JSON.stringify(count.mock.calls[0]?.[0] ?? {});
    expect(countPayload).toContain("deliveryCost");
    expect(countPayload).toContain('"lte":0');
    expect(countPayload).toContain('"not":null');
  });

  it("price sort applies explicit free-delivery SQL (null delivery is not free)", async () => {
    count.mockResolvedValue(1);
    queryRaw.mockResolvedValue([{ id: "free" }]);
    findMany
      .mockResolvedValueOnce([{ brand: "Brand" }])
      .mockResolvedValueOnce([mockProduct("free", 0)]);

    await getProductsFromDb("RO", undefined, undefined, 5, 0, "price-asc", {
      freeDeliveryOnly: true,
    });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    const serialized = JSON.stringify(queryRaw.mock.calls[0]?.[0] ?? {});
    expect(serialized).toMatch(/deliveryCost/i);
    expect(serialized).not.toMatch(/COALESCE\(o\\."deliveryCost", 0\) <= 0/);
  });
});
