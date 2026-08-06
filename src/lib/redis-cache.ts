import { getRedis, isRedisConfigured } from "@/lib/redis";

const DEFAULT_TTL_SECONDS = 60 * 60;

/**
 * JSON get/set helpers for Upstash Redis with graceful degrade when Redis is off.
 */
export async function redisGetJson<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) return null;
  try {
    return (await getRedis().get<T>(key)) ?? null;
  } catch (error) {
    console.error("[redis-cache] get failed:", error);
    return null;
  }
}

export async function redisSetJson(
  key: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error("[redis-cache] set failed:", error);
    return false;
  }
}

export async function redisDel(key: string): Promise<void> {
  if (!isRedisConfigured()) return;
  try {
    await getRedis().del(key);
  } catch (error) {
    console.error("[redis-cache] del failed:", error);
  }
}
