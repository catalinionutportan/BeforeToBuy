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

export function productPagePath(productId: string, locale?: string): string {
  if (!locale || locale === "en") return `/p/${encodeURIComponent(productId)}`;
  return `/${locale}/p/${encodeURIComponent(productId)}`;
}

export function productPageUrl(productId: string, locale?: string): string {
  return `${SITE_URL}${productPagePath(productId, locale)}`;
}
