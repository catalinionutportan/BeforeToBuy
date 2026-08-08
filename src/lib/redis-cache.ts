import { getRedis, isRedisConfigured } from "@/lib/redis";

const DEFAULT_TTL_SECONDS = 60 * 60;
/** Upstash REST max request body — refuse oversized SETs before the round-trip. */
const UPSTASH_MAX_REQUEST_BYTES = 10 * 1024 * 1024;

function estimateJsonBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

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

  let payloadBytes = 0;
  try {
    payloadBytes = estimateJsonBytes(value);
  } catch (error) {
    console.error(`[redis-cache] set skipped: cannot serialize key=${key}`, error);
    return false;
  }

  if (payloadBytes > UPSTASH_MAX_REQUEST_BYTES) {
    console.error(
      `[redis-cache] set skipped: payload ${payloadBytes} bytes exceeds Upstash limit ${UPSTASH_MAX_REQUEST_BYTES} (key=${key})`
    );
    return false;
  }

  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error(
      `[redis-cache] set failed: key=${key} payload≈${payloadBytes} bytes`,
      error
    );
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
