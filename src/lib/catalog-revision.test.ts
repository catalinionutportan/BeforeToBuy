// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
const query = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ prisma: { $queryRaw: query } }));
import { getCatalogRevision, withCatalogRevision } from "./catalog-revision";

describe("committed catalogue revision scope", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
  it("pins writes to the starting revision and checks again on the next navigation", async () => {
    vi.stubEnv("VITEST", "false"); vi.stubEnv("FORCE_SAMPLE_FEEDS", "0");
    query.mockResolvedValueOnce([{ revision: "before" }]).mockResolvedValueOnce([{ revision: "after" }]);
    await withCatalogRevision("CH", async () => {
      expect(await getCatalogRevision("CH")).toBe("before");
      await withCatalogRevision("CH", async () => expect(await getCatalogRevision("CH")).toBe("before"));
    });
    await withCatalogRevision("CH", async () => expect(await getCatalogRevision("CH")).toBe("after"));
    expect(query).toHaveBeenCalledTimes(2);
  });
  it("shares concurrent revision lookups but does not cache failures", async () => {
    vi.stubEnv("VITEST", "false"); vi.stubEnv("FORCE_SAMPLE_FEEDS", "0");
    query.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
    const results = await Promise.allSettled([getCatalogRevision("US"), getCatalogRevision("US")]);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(query).toHaveBeenCalledOnce();
    expect(await getCatalogRevision("US")).toBe("initial");
    expect(query.mock.calls[1][0].values).toEqual(["US"]);
  });
});
