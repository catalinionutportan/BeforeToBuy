import { getRedis, isRedisConfigured } from "@/lib/redis";

const RATELIMIT_PREFIX = "ratelimit:";

/**
 * Persistent rate limiter for serverless API routes using Upstash Redis.
 * Uses INCR + EXPIRE for atomic sliding fixed windows.
 */
export async function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const redisKey = `${RATELIMIT_PREFIX}${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  try {
    const redis = getRedis();
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    if (count > limit) {
      const ttl = await redis.ttl(redisKey);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, ttl),
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.error("Rate limit Redis error:", error);
    // Fail closed only when Redis is configured (expected to work). Without Redis
    // (local `next start`, CI e2e), fail open so APIs remain usable.
    const failOpen =
      process.env.RATE_LIMIT_FAIL_OPEN === "1" || !isRedisConfigured();
    if (!failOpen) {
      return { allowed: false, retryAfterSeconds: 60 };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Resolve client IP for rate limiting.
 * Prefer platform-set headers that clients cannot spoof.
 */
export function getClientIp(request: Request): string {
  // Vercel sets this from the true connecting IP (not client-spoofable).
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  if (process.env.VERCEL) {
    // Prefer platform headers; also accept x-forwarded-for on Vercel (first hop).
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return "unknown";
  }

  // Only trust generic forwarded headers behind an explicit trusted proxy.
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
  }

  return request.headers.get("x-real-ip") || "unknown";
}
