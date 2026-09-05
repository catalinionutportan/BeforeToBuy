// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), page: vi.fn(), meta: vi.fn(), save: vi.fn(), redis: vi.fn() }));
vi.mock("next/server", async (original) => ({ ...await original<typeof import("next/server")>(), after: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: async () => ({ allowed: true }), getClientIp: () => "test" }));
vi.mock("@/lib/product-service", () => ({ fetchMergedProductsForLocation: mocks.fetch }));
vi.mock("@/lib/catalog-browse-cache", () => ({ getCachedFirstBrowsePage: mocks.page, getCachedBrowseMeta: mocks.meta, setCachedFirstBrowsePage: mocks.save }));
vi.mock("@/lib/redis", () => ({ isRedisConfigured: mocks.redis }));
vi.mock("@/lib/catalog-read-transaction", () => ({
  withBoundedCatalogRead: async (_country: string, operation: () => Promise<unknown>) => operation(),
}));
vi.mock("@/lib/db-service", () => ({ countInStockProductsForCountry: async () => 100, getCategoryCountsFromDb: async () => ({ categoryCounts: {}, leafCounts: {} }), getCategoryCoverImagesFromDb: async () => ({}), warmBrowseMetaForCountry: async () => undefined }));
import { GET } from "./route";
import { after } from "next/server";

const allPage = { products: [{ id: "unrelated-first-page-product" }], meta: { totalMatched: 100, offset: 0, categoryCounts: { "notebooks-laptops": 100 } } };
describe("catalogue response matches the requested browse state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redis.mockReturnValue(false);
    mocks.page.mockImplementation(async (_country, _limit, category) => !category || category === "_all" ? allPage : null);
    mocks.meta.mockResolvedValue(null);
    mocks.fetch.mockRejectedValue(new Error("controlled database failure"));
  });
  it.each([
    "category=photo-gimbals",
    "offset=48",
    "q=nonexistent-product",
    "brand=DJI",
    "sort=price-desc",
    "priceHistory=1",
    "category=photo-gimbals&offset=48",
  ])("does not replace a failed %s request with unfiltered page one", async (query) => {
    const response = await GET(new Request(`https://test.example/api/products?country=US&${query}`));
    expect(response.status).toBe(503);
    expect((await response.json()).products).toBeUndefined();
  });
  it("keeps a successful empty category response empty", async () => {
    mocks.fetch.mockResolvedValue({ products: [], meta: { totalMatched: 0 } });
    const response = await GET(new Request("https://test.example/api/products?country=US&category=photo-gimbals"));
    expect(response.status).toBe(200);
    expect((await response.json()).products).toEqual([]);
  });
  it("keeps the cached unfiltered first page fast", async () => {
    const response = await GET(new Request("https://test.example/api/products?country=US"));
    expect(response.status).toBe(200);
    expect((await response.json()).products).toEqual(allPage.products);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each(["q=acer", "offset=48", "category=photo-gimbals", "brand=DJI"])("does not start global metadata warm for %s", async (query) => {
    mocks.redis.mockReturnValue(true);
    mocks.page.mockResolvedValue(null);
    mocks.fetch.mockResolvedValue({ products: [], meta: { totalMatched: 0 } });
    const response = await GET(new Request(`https://test.example/api/products?country=CH&${query}`));
    expect(response.status).toBe(200);
    expect(after).not.toHaveBeenCalled();
  });
  it("still schedules metadata after an unfiltered first browse response", async () => {
    mocks.redis.mockReturnValue(true);
    mocks.page.mockResolvedValue(null);
    mocks.fetch.mockResolvedValue(allPage);
    const response = await GET(new Request("https://test.example/api/products?country=CH"));
    expect(response.status).toBe(200);
    expect(after).toHaveBeenCalledOnce();
  });
});
