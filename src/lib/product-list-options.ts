import type { OfferFilterCriteria } from "@/lib/offers/offer-filters";

/** Browse/list API defaults — full catalog responses are too large for mobile clients. */
export const BROWSE_API_VERSION = "20260904-recovery-1";
export const DEFAULT_PRODUCT_LIST_LIMIT = 24;
export const MAX_PRODUCT_LIST_LIMIT = 480;
/** SEO category / compare pages — keep HTML payloads small; meta.totalMatched stays full. */
export const CATEGORY_PAGE_PRODUCT_LIMIT = 96;
export const BROWSE_LIST_OPTIONS = {
  compact: true,
  includePriceHistory: false,
} as const;

export type ProductSortOption = "price-asc" | "price-desc" | "newest";

export type ProductListOptions = {
  /** Max products in the response body. Omit for uncapped (sitemap counts / product lookup). */
  limit?: number;
  offset?: number;
  /** Attach Redis price-history series (heavy). Default false. */
  includePriceHistory?: boolean;
  /** Strip long descriptions from products/offers. Default true for capped lists. */
  compact?: boolean;
  sort?: ProductSortOption;
  /** Product/offer criteria applied before sorting and pagination. */
  filters?: OfferFilterCriteria;
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
