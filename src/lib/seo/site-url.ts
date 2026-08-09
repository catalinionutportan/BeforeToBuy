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
  const params = new URLSearchParams();
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    params.set("from", returnTo);
  }
  // Keep modal chrome in the same UI language as the browse card (no EN→RO flash).
  if (locale) params.set("lang", locale);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Preserve the current UI language on internal links via `?lang=`. */
export function withLangParam(path: string, locale?: string): string {
  if (!locale || !path.startsWith("/") || path.startsWith("//")) return path;

  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(search);

  params.set("lang", locale);
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}${hash}`;
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
