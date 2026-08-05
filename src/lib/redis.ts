import { Redis } from "@upstash/redis";

/**
 * Upstash Redis (Vercel Marketplace / former Vercel KV).
 * Accepts either UPSTASH_REDIS_REST_* or legacy KV_REST_API_* env names.
 */
export function isRedisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

/** @deprecated Prefer isRedisConfigured() */
export const isKvConfigured = isRedisConfigured;

let redisClient: Redis | undefined;

export function getRedis(): Redis {
  if (!isRedisConfigured()) {
    throw new Error("Redis is not configured (missing UPSTASH_REDIS_REST_* or KV_REST_API_*)");
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)!,
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)!,
    });
  }

  return redisClient;
}

/** Test helper — clear cached client between tests. */
export function resetRedisClientForTests(): void {
  redisClient = undefined;
}
