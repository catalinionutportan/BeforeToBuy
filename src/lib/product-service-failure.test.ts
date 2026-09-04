import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ db: vi.fn(), feeds: vi.fn() }));
vi.mock("@/lib/db-service", () => ({ getProductsFromDb: mocks.db }));
vi.mock("@/lib/merchant-feeds", () => ({ getFeedProducts: mocks.feeds }));
import { fetchMergedProductsForLocation } from "./product-service";

describe("production catalogue authority", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("FORCE_SAMPLE_FEEDS", "0"); });
  afterEach(() => vi.unstubAllEnvs());
  it("propagates database failure without launching remote feed work", async () => {
    mocks.db.mockRejectedValue(new Error("controlled database failure"));
    await expect(fetchMergedProductsForLocation({ countryCode: "CH", countryName: "Switzerland" })).rejects.toThrow("controlled database failure");
    expect(mocks.feeds).not.toHaveBeenCalled();
  });
  it("keeps an empty database result empty instead of rebuilding from feeds", async () => {
    mocks.db.mockResolvedValue({ products: [], countryProductCount: 0, totalMatched: 0, leafCounts: {}, categoryCounts: {}, categoryCovers: {}, brandOptions: [] });
    const result = await fetchMergedProductsForLocation({ countryCode: "US", countryName: "United States" });
    expect(result.products).toEqual([]);
    expect(result.meta.totalMatched).toBe(0);
    expect(mocks.feeds).not.toHaveBeenCalled();
  });
});
