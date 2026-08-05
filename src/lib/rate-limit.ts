import { kv } from "@vercel/kv";

const RATELIMIT_PREFIX = "ratelimit:";

/**
 * Persistent rate limiter for serverless API routes using Vercel KV (Redis).
 * Leverages Redis INCR and EXPIRE for atomic operations.
 */
export async function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const kvKey = `${RATELIMIT_PREFIX}${key}`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  // Increment the counter and get the new count. INCR is atomic.
  const count = await kv.incr(kvKey);

  // Set expiration only if this is the first increment in the window.
  // This prevents resetting the TTL on subsequent requests within the window.
  if (count === 1) {
    await kv.expire(kvKey, windowSeconds);
  }

  if (count > limit) {
    // Get the remaining TTL to calculate retryAfterSeconds
    const ttl = await kv.ttl(kvKey);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, ttl),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  // IMPORTANT: For production, ensure these headers are only trusted if the request
  // comes from a known, trusted proxy (e.g., Vercel, Cloudflare, or your own Nginx/Gateway).
  // Otherwise, a malicious user could spoof their IP by setting a fake `x-forwarded-for` header.

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}
