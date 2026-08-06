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

export function productPageUrl(productId: string, locale?: string): string {
  return `${SITE_URL}${productPagePath(productId, locale)}`;
}
