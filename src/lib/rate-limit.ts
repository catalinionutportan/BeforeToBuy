import { getRedis, isRedisConfigured } from "@/lib/redis";

const RATELIMIT_PREFIX = "ratelimit:";

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/** Best-effort per-instance fallback when Redis is unavailable. */
const memoryCounters = new Map<string, { count: number; resetAt: number }>();

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryCounters.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Persistent rate limiter for serverless API routes using Upstash Redis.
 * Uses INCR + EXPIRE for atomic sliding fixed windows.
 * On Redis errors, falls back to in-memory limits (fail-open for catalog APIs
 * unless RATE_LIMIT_FAIL_CLOSED=1).
 */
export async function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): Promise<RateLimitResult> {
  const redisKey = `${RATELIMIT_PREFIX}${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  if (!isRedisConfigured()) {
    return checkMemoryRateLimit(key, limit, windowMs);
  }

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
    // Upstash outage / quota must not blank /api/products for every visitor.
    // RATE_LIMIT_FAIL_OPEN=1 (e2e) and default production: soft degrade.
    // Opt into hard deny with RATE_LIMIT_FAIL_CLOSED=1.
    if (
      process.env.RATE_LIMIT_FAIL_CLOSED === "1" &&
      process.env.RATE_LIMIT_FAIL_OPEN !== "1"
    ) {
      return { allowed: false, retryAfterSeconds: 60 };
    }
    return checkMemoryRateLimit(key, limit, windowMs);
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

/** Test helper */
export function resetMemoryRateLimitForTests(): void {
  memoryCounters.clear();
}
