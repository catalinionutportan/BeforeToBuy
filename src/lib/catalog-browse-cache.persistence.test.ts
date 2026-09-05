// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
vi.mock("@/lib/redis-cache", () => ({ redisGetJson: vi.fn(async () => null), redisSetJson: vi.fn(async () => true) }));
vi.mock("@/lib/catalog-revision", () => ({ getCatalogRevision: vi.fn(async () => "fixture") }));
import { getCachedFirstBrowsePage, resetCatalogBrowseCacheForTests, setCachedFirstBrowsePage } from "./catalog-browse-cache";
import { getCatalogRevision } from "./catalog-revision";
describe("persistent cache expiry and restart safety", () => {
  let directory: string;
  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "btb-cache-expiry-"));
    vi.stubEnv("BROWSE_CACHE_DIRECTORY", directory);
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("FORCE_SAMPLE_FEEDS", "0");
    vi.useFakeTimers(); vi.setSystemTime(1000000);
    resetCatalogBrowseCacheForTests();
    vi.mocked(getCatalogRevision).mockResolvedValue("fixture");
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); resetCatalogBrowseCacheForTests(); rmSync(directory, { recursive: true, force: true }); });
  it("a restart near expiry does not extend old catalogue data by another two hours", async () => {
    const page = { products: [{ id: "before-import" }], meta: {} };
    await setCachedFirstBrowsePage("CH", 48, page);
    vi.setSystemTime(1000000 + 7199000);
    resetCatalogBrowseCacheForTests();
    expect(await getCachedFirstBrowsePage("CH", 48)).toEqual(page);
    vi.setSystemTime(1000000 + 7200001);
    expect(await getCachedFirstBrowsePage("CH", 48)).toBeNull();
    await setCachedFirstBrowsePage("CH", 48, { products: [{ id: "after-import" }], meta: {} });
    expect((await getCachedFirstBrowsePage("CH", 48))?.products).toEqual([{ id: "after-import" }]);
  });
  it("publishes a complete file and leaves no partial temporary file", async () => {
    await setCachedFirstBrowsePage("US", 48, { products: [{ id: "one" }], meta: {} });
    const files = readdirSync(directory);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/\.json$/);
    const entry = JSON.parse(readFileSync(path.join(directory, files[0]!), "utf8"));
    expect(entry.value.products[0].id).toBe("one");
    expect(entry.expiresAt).toBe(1000000 + 7200000);
  });
  it("cannot reuse an earlier import's page from memory or disk", async () => {
    await setCachedFirstBrowsePage("CH", 48, { products: [{ id: "old-import" }], meta: {} });
    vi.mocked(getCatalogRevision).mockResolvedValue("next-import");
    expect(await getCachedFirstBrowsePage("CH", 48)).toBeNull();
    resetCatalogBrowseCacheForTests();
    expect(await getCachedFirstBrowsePage("CH", 48)).toBeNull();
    await setCachedFirstBrowsePage("CH", 48, { products: [{ id: "new-import" }], meta: {} });
    expect((await getCachedFirstBrowsePage("CH", 48))?.products).toEqual([{ id: "new-import" }]);
  });
});
