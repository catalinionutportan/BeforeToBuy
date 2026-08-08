/** Browse/list API defaults — full catalog responses are too large for mobile clients. */
export const DEFAULT_PRODUCT_LIST_LIMIT = 96;
export const MAX_PRODUCT_LIST_LIMIT = 480;
export const HOME_SSR_PRODUCT_LIMIT = 48;

export type ProductListOptions = {
  /** Max products in the response body. Omit for uncapped (sitemap counts / product lookup). */
  limit?: number;
  offset?: number;
  /** Attach Redis price-history series (heavy). Default false. */
  includePriceHistory?: boolean;
  /** Strip long descriptions from products/offers. Default true for capped lists. */
  compact?: boolean;
};

export function clampProductListLimit(raw: number | undefined, fallback: number): number {
  if (raw == null || !Number.isFinite(raw)) return fallback;
  const n = Math.floor(raw);
  if (n < 1) return 1;
  return Math.min(n, MAX_PRODUCT_LIST_LIMIT);
}

export function parseProductListOffset(raw: number | undefined): number {
  if (raw == null || !Number.isFinite(raw) || raw < 0) return 0;
  return Math.floor(raw);
}
