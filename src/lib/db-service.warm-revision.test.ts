// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revision: "before",
  groupBy: vi.fn(),
  queryRaw: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  getCachedBrowseMeta: vi.fn(),
  setCachedBrowseMeta: vi.fn(),
  withCatalogRevision: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mocks.queryRaw(...args),
    product: {
      groupBy: (...args: unknown[]) => mocks.groupBy(...args),
      findFirst: (...args: unknown[]) => mocks.findFirst(...args),
      findMany: (...args: unknown[]) => mocks.findMany(...args),
      count: (...args: unknown[]) => mocks.count(...args),
    },
  },
}));

vi.mock("@/lib/catalog-revision", () => ({
  getCatalogRevision: vi.fn(async () => mocks.revision),
  withCatalogRevision: (...args: unknown[]) => mocks.withCatalogRevision(...args),
}));

vi.mock("@/lib/catalog-browse-cache", () => ({
  getCachedBrowseMeta: (...args: unknown[]) => mocks.getCachedBrowseMeta(...args),
  setCachedBrowseMeta: (...args: unknown[]) => mocks.setCachedBrowseMeta(...args),
  getCachedChLeadIds: vi.fn(),
  setCachedChLeadIds: vi.fn(),
}));

import { getProductsFromDb, warmBrowseMetaForCountry } from "@/lib/db-service";

describe("browse metadata warm revision isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.revision = "before";
    mocks.getCachedBrowseMeta.mockResolvedValue(null);
    mocks.setCachedBrowseMeta.mockResolvedValue(undefined);
    mocks.withCatalogRevision.mockImplementation(
      async (_country: string, operation: () => Promise<unknown>) => operation()
    );
    mocks.queryRaw.mockResolvedValue([]);
    mocks.findFirst.mockResolvedValue(null);
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
  });

  it("pins direct catalogue reads before they can read or populate generation caches", async () => {
    mocks.getCachedBrowseMeta.mockResolvedValue({
      categoryCounts: {},
      leafCounts: {},
      categoryCovers: {},
      countryProductCount: 0,
      brandOptions: [],
    });

    await getProductsFromDb("RO", "missing", undefined, 24, 0);

    expect(mocks.withCatalogRevision).toHaveBeenCalledOnce();
    expect(mocks.withCatalogRevision).toHaveBeenCalledWith("RO", expect.any(Function));
  });

  it("does not reuse an in-flight pre-import warm after the revision changes", async () => {
    let releaseFirstWarm!: () => void;
    const firstWarmGate = new Promise<void>((resolve) => {
      releaseFirstWarm = resolve;
    });
    mocks.queryRaw
      .mockImplementationOnce(async () => {
        await firstWarmGate;
        return [];
      })
      .mockImplementationOnce(async () => {
        await firstWarmGate;
        return [];
      })
      .mockImplementationOnce(async () => {
        await firstWarmGate;
        return [];
      })
      .mockResolvedValue([]);

    const beforeImport = warmBrowseMetaForCountry("RO");
    await vi.waitFor(() => expect(mocks.queryRaw).toHaveBeenCalledTimes(3));

    mocks.revision = "after";
    const afterImport = warmBrowseMetaForCountry("RO");
    await vi.waitFor(() => expect(mocks.queryRaw).toHaveBeenCalledTimes(6));

    releaseFirstWarm();
    await Promise.all([beforeImport, afterImport]);
    expect(mocks.withCatalogRevision).toHaveBeenCalledTimes(2);
    expect(mocks.withCatalogRevision).toHaveBeenNthCalledWith(1, "RO", expect.any(Function));
    expect(mocks.setCachedBrowseMeta).toHaveBeenCalledTimes(2);
  });
});
