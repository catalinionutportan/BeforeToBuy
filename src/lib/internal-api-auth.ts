import { timingSafeEqual } from "node:crypto";

function bearerMatchesSecret(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;

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

/**
 * Authorize internal diagnostic/admin APIs with INTERNAL_API_SECRET only.
 * No fallback to CRON_SECRET — keep cron and internal diagnostics separated.
 */
export function isInternalApiAuthorized(request: Request): boolean {
  return bearerMatchesSecret(request, process.env.INTERNAL_API_SECRET);
}

/**
 * Authorize scheduled cron routes with CRON_SECRET only.
 */
export function isCronAuthorized(request: Request): boolean {
  return bearerMatchesSecret(request, process.env.CRON_SECRET);
}
