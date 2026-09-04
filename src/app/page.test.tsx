import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { Product } from "@/types";

const mocks = vi.hoisted(() => ({
  getCachedFirstBrowsePage: vi.fn(),
  setCachedFirstBrowsePage: vi.fn(),
  fetchMergedProductsForLocation: vi.fn(),
  getRequestMarketCountry: vi.fn(),
}));

vi.mock("@/components/home/HomePageClient", () => ({ default: () => null }));
vi.mock("@/lib/catalog-browse-cache", () => ({
  getCachedFirstBrowsePage: mocks.getCachedFirstBrowsePage,
  setCachedFirstBrowsePage: mocks.setCachedFirstBrowsePage,
}));
vi.mock("@/lib/product-service", () => ({
  fetchMergedProductsForLocation: mocks.fetchMergedProductsForLocation,
}));
vi.mock("@/lib/request-market", () => ({
  getRequestMarketCountry: mocks.getRequestMarketCountry,
}));

import Home from "@/app/page";

const meta = {
  totalMatched: 1,
  categoryCounts: { "gaming-vr": 1, "notebooks-laptops": 10 },
  categoryCovers: {},
  brandOptions: [],
  limit: 48,
  offset: 0,
  hasMore: false,
} as unknown as ProductFetchMeta;

function product(id: string, category: string): Product {
  return {
    id,
    title: id,
    description: "",
    brand: "Test",
    category,
    image: "https://example.test/image.jpg",
    targetCountries: ["CH"],
    basePrice: 100,
    offers: [],
  } as Product;
}

function renderedProps(element: ReactElement) {
  return element.props as {
    initialProducts: Product[];
    initialMeta: ProductFetchMeta | null;
    initialFetchFailed: boolean;
    initialPage: number;
  };
}

describe("homepage SSR catalogue selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRequestMarketCountry.mockImplementation(async (country?: string) => country || "CH");
    mocks.getCachedFirstBrowsePage.mockResolvedValue(null);
    mocks.setCachedFirstBrowsePage.mockResolvedValue(undefined);
  });

  it("never falls from an exact category cache key to the All cache", async () => {
    const allPage = { products: [product("laptop", "notebooks-laptops")], meta };
    const freshPage = { products: [product("quest", "gaming-vr")], meta };
    mocks.getCachedFirstBrowsePage.mockImplementation(
      async (_country: string, _limit: number, category?: string) =>
        category === undefined ? allPage : null
    );
    mocks.fetchMergedProductsForLocation.mockResolvedValue(freshPage);

    const element = (await Home({
      searchParams: Promise.resolve({ country: "GB", category: "gaming-vr" }),
    })) as ReactElement;

    expect(mocks.getCachedFirstBrowsePage.mock.calls).toEqual([
      ["GB", 48, "gaming-vr"],
      ["GB", 96, "gaming-vr"],
    ]);
    expect(mocks.fetchMergedProductsForLocation).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "GB" }),
      undefined,
      "gaming-vr",
      "en",
      expect.objectContaining({ limit: 48, offset: 0 })
    );
    expect(mocks.setCachedFirstBrowsePage).toHaveBeenCalledWith(
      "GB",
      48,
      freshPage,
      "gaming-vr"
    );
    expect(renderedProps(element).initialProducts.map((item) => item.id)).toEqual(["quest"]);
    expect(renderedProps(element).initialMeta).toBeNull();
  });

  it("rejects a previously poisoned exact-category cache entry", async () => {
    const poisoned = { products: [product("laptop", "notebooks-laptops")], meta };
    const freshPage = { products: [product("quest", "gaming-vr")], meta };
    mocks.getCachedFirstBrowsePage
      .mockResolvedValueOnce(poisoned)
      .mockResolvedValueOnce(null);
    mocks.fetchMergedProductsForLocation.mockResolvedValue(freshPage);

    const element = (await Home({
      searchParams: Promise.resolve({ country: "GB", category: "gaming-vr" }),
    })) as ReactElement;

    expect(mocks.fetchMergedProductsForLocation).toHaveBeenCalledTimes(1);
    expect(renderedProps(element).initialProducts.map((item) => item.id)).toEqual(["quest"]);
  });

  it("compacts and republishes only an exact matching legacy category page", async () => {
    const legacyPage = {
      products: Array.from({ length: 60 }, (_, index) =>
        product(`quest-${index}`, "gaming-vr")
      ),
      meta: { ...meta, totalMatched: 60, limit: 96 },
    };
    mocks.getCachedFirstBrowsePage
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(legacyPage);

    const element = (await Home({
      searchParams: Promise.resolve({ country: "GB", category: "gaming-vr" }),
    })) as ReactElement;

    expect(mocks.fetchMergedProductsForLocation).not.toHaveBeenCalled();
    expect(mocks.setCachedFirstBrowsePage).toHaveBeenCalledWith(
      "GB",
      48,
      expect.objectContaining({ products: legacyPage.products.slice(0, 48) }),
      "gaming-vr"
    );
    expect(renderedProps(element).initialProducts).toHaveLength(48);
  });

  it("passes search, category, store, brand, prices, flags, sort, locale and page to SSR", async () => {
    const freshPage = { products: [product("carplay", "audio-car")], meta };
    mocks.fetchMergedProductsForLocation.mockResolvedValue(freshPage);

    const element = (await Home({
      searchParams: Promise.resolve({
        country: "US",
        category: "audio-car",
        q: " carplay% ",
        domain: "ottocast.com",
        brand: "Ottocast",
        inStock: "1",
        freeDelivery: "1",
        minTotal: "100",
        maxTotal: "500",
        hasGtin: "1",
        sort: "price-desc",
        page: "2",
        lang: "de",
      }),
    })) as ReactElement;

    expect(mocks.getCachedFirstBrowsePage).not.toHaveBeenCalled();
    expect(mocks.setCachedFirstBrowsePage).not.toHaveBeenCalled();
    expect(mocks.fetchMergedProductsForLocation).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: "US" }),
      "carplay",
      "audio-car",
      "de",
      expect.objectContaining({
        limit: 48,
        offset: 48,
        sort: "price-desc",
        filters: {
          domain: "ottocast.com",
          brand: "Ottocast",
          inStockOnly: true,
          freeDeliveryOnly: true,
          minTotalPrice: 100,
          maxTotalPrice: 500,
          hasGtinOnly: true,
        },
      })
    );
    expect(renderedProps(element).initialPage).toBe(2);
    expect(renderedProps(element).initialProducts.map((item) => item.id)).toEqual(["carplay"]);
    expect(renderedProps(element).initialMeta).toBeNull();
  });

  it("allows only the unfiltered All first page to seed the client All cache", async () => {
    const allPage = { products: [product("laptop", "notebooks-laptops")], meta };
    mocks.getCachedFirstBrowsePage.mockResolvedValueOnce(allPage);

    const element = (await Home({
      searchParams: Promise.resolve({ country: "CH" }),
    })) as ReactElement;

    expect(mocks.fetchMergedProductsForLocation).not.toHaveBeenCalled();
    expect(renderedProps(element).initialMeta).toBe(meta);
  });
});
