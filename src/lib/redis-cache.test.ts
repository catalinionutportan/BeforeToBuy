import { beforeEach, describe, expect, it, vi } from "vitest";

const setMock = vi.fn();
const getMock = vi.fn();
const delMock = vi.fn();
const isConfiguredMock = vi.fn(() => true);

vi.mock("@/lib/redis", () => ({
  isRedisConfigured: () => isConfiguredMock(),
  getRedis: () => ({
    set: setMock,
    get: getMock,
    del: delMock,
  }),
}));

describe("redisSetJson", () => {
  beforeEach(() => {
    vi.resetModules();
    setMock.mockReset();
    getMock.mockReset();
    delMock.mockReset();
    isConfiguredMock.mockReturnValue(true);
  });

  it("skips SET when payload exceeds Upstash 10MB limit", async () => {
    const { redisSetJson } = await import("@/lib/redis-cache");
    const huge = { blob: "x".repeat(11 * 1024 * 1024) };
    const ok = await redisSetJson("feed:test", huge, 60);
    expect(ok).toBe(false);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("returns false on Upstash errors without throwing", async () => {
    setMock.mockRejectedValueOnce(new Error("ERR max request size exceeded"));
    const { redisSetJson } = await import("@/lib/redis-cache");
    const ok = await redisSetJson("feed:test", { products: [] }, 60);
    expect(ok).toBe(false);
    expect(setMock).toHaveBeenCalledOnce();
  });

  it("returns true on successful SET", async () => {
    setMock.mockResolvedValueOnce("OK");
    const { redisSetJson } = await import("@/lib/redis-cache");
    const ok = await redisSetJson("feed:test", { products: [{ id: "1" }] }, 60);
    expect(ok).toBe(true);
  });
});
