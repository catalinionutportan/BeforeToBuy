const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(
  /\/$/,
  ""
);

export function getSiteUrl(): string {
  return SITE_URL;
}

export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Canonical product path — locale is not encoded in the URL path. */
export function productPagePath(productId: string, _locale?: string): string {
  return `/p/${encodeURIComponent(productId)}`;
}

/** Product detail URL that can restore browse filters via `from`. */
export function productPagePathWithReturn(
  productId: string,
  returnTo?: string,
  locale?: string
): string {
  const path = productPagePath(productId, locale);
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) return path;
  return `${path}?from=${encodeURIComponent(returnTo)}`;
}

/** Safe in-app return path from `?from=` (rejects absolute / protocol-relative URLs). */
export function safeReturnPath(from: string | null | undefined, fallback = "/"): string {
  if (!from) return fallback;
  let decoded = from;
  try {
    decoded = decodeURIComponent(from);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
  if (decoded.includes("://")) return fallback;
  return decoded;
}

export function productPageUrl(productId: string, locale?: string): string {
  return `${SITE_URL}${productPagePath(productId, locale)}`;
}
