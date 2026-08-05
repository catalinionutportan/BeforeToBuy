import type { Product } from "@/types";

export const CROSS_BORDER_COLLECTION_ID = "compare-cross-border";

export function includesCrossBorderOffers(category?: string): boolean {
  return category === CROSS_BORDER_COLLECTION_ID;
}

/** Keep Swiss/domestic offers only; drop products that have none left. */
export function withDomesticOffersOnly(product: Product): Product | null {
  const offers = product.offers.filter((offer) => offer.type !== "cross_border");
  if (offers.length === 0) return null;
  if (offers.length === product.offers.length) return product;
  return { ...product, offers };
}

/**
 * Default browse: hide foreign-delivery offers.
 * Cross-border collection: keep full offer sets so CH vs abroad can be compared.
 */
export function applyCrossBorderVisibility(
  products: Product[],
  category?: string
): Product[] {
  if (includesCrossBorderOffers(category)) return products;
  return products
    .map(withDomesticOffersOnly)
    .filter((product): product is Product => product !== null);
}
