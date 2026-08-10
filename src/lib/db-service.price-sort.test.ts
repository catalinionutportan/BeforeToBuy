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
    vi.clearAllMocks();
    groupBy.mockResolvedValue([]);
    count.mockResolvedValue(6);
  });

  it("orders globally by min offer total even when cheapest id is after the first id page", async () => {
    queryRaw.mockResolvedValue([{ id: "prod-cheapest" }, { id: "prod-a" }]);
    findMany
      .mockResolvedValueOnce([{ brand: "Brand" }])
      .mockResolvedValueOnce([mockProduct("prod-cheapest", 1), mockProduct("prod-a", 50)]);

    const page = await getProductsFromDb("RO", undefined, undefined, 2, 0, "price-asc");

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(page.products[0]?.id).toBe("prod-cheapest");
    expect(page.totalMatched).toBe(6);
    expect(0 + page.products.length < page.totalMatched).toBe(true);
  });

  it("supports deep offsets and hasMore at the catalogue tail", async () => {
    count.mockResolvedValue(10);
    queryRaw.mockResolvedValue([{ id: "prod-i" }, { id: "prod-j" }]);
    findMany
      .mockResolvedValueOnce([{ brand: "Brand" }])
      .mockResolvedValueOnce([mockProduct("prod-i", 90), mockProduct("prod-j", 95)]);

    const page = await getProductsFromDb("RO", undefined, undefined, 2, 7, "price-asc");

    expect(page.products).toHaveLength(2);
    expect(7 + page.products.length < page.totalMatched).toBe(true);

    queryRaw.mockResolvedValue([{ id: "prod-k" }]);
    findMany
      .mockResolvedValueOnce([{ brand: "Brand" }])
      .mockResolvedValueOnce([mockProduct("prod-k", 100)]);

    const last = await getProductsFromDb("RO", undefined, undefined, 2, 9, "price-asc");
    expect(9 + last.products.length < last.totalMatched).toBe(false);
  });
});
