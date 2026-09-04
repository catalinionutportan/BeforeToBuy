import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), catalog: vi.fn(), map: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { product: { findUnique: mocks.lookup } } }));
vi.mock("@/lib/category-page-data", () => ({ fetchCatalogForCountry: mocks.catalog }));
vi.mock("@/lib/db-service", () => ({ mapPrismaProduct: mocks.map }));
import { getProductById } from "./product-lookup";

describe("production product lookup safety", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("FORCE_SAMPLE_FEEDS", "0"); });
  afterEach(() => vi.unstubAllEnvs());
  it("returns missing products without scanning any country feed", async () => {
    mocks.lookup.mockResolvedValue(null);
    expect(await getProductById("feed-ch-missing")).toBeNull();
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
    expect(mocks.catalog).not.toHaveBeenCalled();
  });
  it("does not turn an outage into a feed scan or false not-found", async () => {
    mocks.lookup.mockRejectedValue(new Error("database unavailable"));
    await expect(getProductById("missing")).rejects.toThrow("database unavailable");
    expect(mocks.catalog).not.toHaveBeenCalled();
  });
  it("returns an existing product through the indexed lookup", async () => {
    mocks.lookup.mockResolvedValue({ id: "existing" });
    mocks.map.mockReturnValue({ id: "existing" });
    expect(await getProductById("existing")).toEqual({ id: "existing" });
    expect(mocks.catalog).not.toHaveBeenCalled();
  });
  it("rejects malformed encodings without querying", async () => {
    expect(await getProductById("%invalid")).toBeNull();
    expect(mocks.lookup).not.toHaveBeenCalled();
  });
});
