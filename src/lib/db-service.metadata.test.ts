import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), find: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { $queryRaw: mocks.query, product: { findMany: mocks.find } } }));
import { getCategoryCoverImagesFromDb } from "./db-service";
describe("bounded cover metadata result", () => {
  beforeEach(() => vi.clearAllMocks());
  it("selects one deterministic row per category in SQL, not a full JS catalogue", async () => {
    mocks.query.mockResolvedValue([{ category: "photo-action", image: "https://se-cdn.djiits.com/example.png" }]);
    const covers = await getCategoryCoverImagesFromDb("US");
    expect(covers["photo-action"]).toContain("djiits.com");
    expect(mocks.find).not.toHaveBeenCalled();
    expect(mocks.query.mock.calls[0][0].sql).toMatch(/SELECT DISTINCT ON[\s\S]*category/);
    expect(mocks.query.mock.calls[0][0].sql).toContain('ORDER BY "category" ASC, "id" ASC');
    expect(mocks.query.mock.calls[0][0].values).toEqual(["US"]);
  });
});
