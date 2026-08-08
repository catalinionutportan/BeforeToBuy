import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  resetMemoryRateLimitForTests,
} from "./rate-limit";
import * as redis from "./redis";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetMemoryRateLimitForTests();
    redis.resetRedisClientForTests();
    vi.restoreAllMocks();
    delete process.env.RATE_LIMIT_FAIL_CLOSED;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it("uses memory limiter when Redis is not configured", async () => {
    const first = await checkRateLimit("test:mem", 2, 60_000);
    const second = await checkRateLimit("test:mem", 2, 60_000);
    const third = await checkRateLimit("test:mem", 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("fails open to memory when Redis throws (does not blanket 429)", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    vi.spyOn(redis, "isRedisConfigured").mockReturnValue(true);
    vi.spyOn(redis, "getRedis").mockReturnValue({
      incr: vi.fn().mockRejectedValue(new Error("UpstashError: max requests")),
      expire: vi.fn(),
      ttl: vi.fn(),
    } as unknown as ReturnType<typeof redis.getRedis>);

    const result = await checkRateLimit("test:redis-down", 100, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("can still fail closed when RATE_LIMIT_FAIL_CLOSED=1", async () => {
    process.env.RATE_LIMIT_FAIL_CLOSED = "1";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    vi.spyOn(redis, "isRedisConfigured").mockReturnValue(true);
    vi.spyOn(redis, "getRedis").mockReturnValue({
      incr: vi.fn().mockRejectedValue(new Error("UpstashError")),
      expire: vi.fn(),
      ttl: vi.fn(),
    } as unknown as ReturnType<typeof redis.getRedis>);

    const result = await checkRateLimit("test:closed", 100, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(60);
  });
});
