import { timingSafeEqual } from "node:crypto";

/**
 * Authorize internal/admin API routes with a Bearer token.
 * Uses INTERNAL_API_SECRET, falling back to CRON_SECRET.
 * In production the secret is required; elsewhere missing secret denies access.
 */
export function isInternalApiAuthorized(request: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(secret);
    if (tokenBuf.length !== secretBuf.length) return false;
    return timingSafeEqual(tokenBuf, secretBuf);
  } catch {
    return false;
  }
}
