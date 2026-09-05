// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ execute: vi.fn(), query: vi.fn(), transaction: vi.fn(), redis: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock("@/lib/redis", () => ({ isRedisConfigured: mocks.redis }));
import { prisma } from "@/lib/db";
import { catalogReadDb, withBoundedCatalogRead } from "./catalog-read-transaction";

describe("bounded self-hosted catalogue reads", () => {
  const tx = { $executeRaw: mocks.execute, $queryRaw: mocks.query };
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.redis.mockReturnValue(false);
    mocks.transaction.mockImplementation((operation) => operation(tx));
  });
  it.each(["CH", "DE", "GB", "US"])("scopes %s queries to a read-only transaction and restores the default client", async (country) => {
    expect(catalogReadDb()).toBe(prisma);
    await withBoundedCatalogRead(country, async () => {
      expect(catalogReadDb()).toBe(tx);
      await withBoundedCatalogRead(country, async () => expect(catalogReadDb()).toBe(tx));
    });
    expect(catalogReadDb()).toBe(prisma);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.transaction.mock.calls[0]![1]).toEqual({ maxWait: 500, timeout: 6000 });
    expect(JSON.stringify(mocks.execute.mock.calls)).toContain("SET TRANSACTION READ ONLY");
    expect(JSON.stringify(mocks.query.mock.calls)).toContain("statement_timeout");
    expect(JSON.stringify(mocks.query.mock.calls)).toContain("transaction_timeout");
  });
  it("restores scope after a failed read", async () => {
    await expect(withBoundedCatalogRead("CH", async () => { throw new Error("controlled"); })).rejects.toThrow("controlled");
    expect(catalogReadDb()).toBe(prisma);
  });
  it("leaves RO outside this change", async () => {
    await withBoundedCatalogRead("RO", async () => expect(catalogReadDb()).toBe(prisma));
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("does not pin a transaction around remote Redis operations", async () => {
    mocks.redis.mockReturnValue(true);
    await withBoundedCatalogRead("CH", async () => expect(catalogReadDb()).toBe(prisma));
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
