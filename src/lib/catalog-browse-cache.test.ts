import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/redis-cache", () => ({
  redisGetJson: vi.fn(async () => null),
  redisSetJson: vi.fn(async () => true),
}));

import {
  getCachedBrowseMeta,
  resetCatalogBrowseCacheForTests,
  setCachedBrowseMeta,
} from "./catalog-browse-cache";

describe("catalog browse cache", () => {
  beforeEach(() => {
    resetCatalogBrowseCacheForTests();
  });

  it("returns meta from process memory after a set", async () => {
    await setCachedBrowseMeta("CH", {
      categoryCounts: { electronics: 3 },
      leafCounts: { "notebooks-laptops": 3 },
      categoryCovers: { "notebooks-laptops": "https://img.example/acer.jpg" },
      countryProductCount: 3,
      brandOptions: ["Acer"],
    });

    const cached = await getCachedBrowseMeta("ch");
    expect(cached?.countryProductCount).toBe(3);
    expect(cached?.brandOptions).toEqual(["Acer"]);
  });

  it("misses after reset", async () => {
    await setCachedBrowseMeta("RO", {
      categoryCounts: {},
      leafCounts: {},
      categoryCovers: {},
      countryProductCount: 1,
      brandOptions: [],
    });
    resetCatalogBrowseCacheForTests();
    await expect(getCachedBrowseMeta("RO")).resolves.toBeNull();
  });
});
