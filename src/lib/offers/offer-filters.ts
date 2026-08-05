import type { Offer, Product } from "@/types";
import { computeTotalPrice } from "@/lib/pricing/total-price";

export interface OfferFilterCriteria {
  domain?: string;
  brand?: string;
  inStockOnly?: boolean;
  freeDeliveryOnly?: boolean;
  maxTotalPrice?: number;
  hasGtinOnly?: boolean;
}

export const MAX_TOTAL_PRICE_OPTIONS = [100, 200, 500, 1000, 2000] as const;

export function offerMatchesDomain(offer: Offer, domain: string): boolean {
  if (!domain || domain === "all") return true;
  const token = domain.split(".")[0]?.toLowerCase() ?? "";
  return (
    offer.storeName.toLowerCase().includes(token) ||
    offer.purchaseUrl.toLowerCase().includes(domain.toLowerCase())
  );
}

function offerMatchesCriteria(offer: Offer, criteria: OfferFilterCriteria): boolean {
  if (criteria.domain && criteria.domain !== "all" && !offerMatchesDomain(offer, criteria.domain)) {
    return false;
  }
  if (criteria.inStockOnly && !offer.inStock) return false;
  if (criteria.freeDeliveryOnly && (offer.deliveryCost ?? 0) > 0) return false;
  if (criteria.maxTotalPrice != null) {
    const total = offer.totalPrice ?? computeTotalPrice(offer);
    if (total > criteria.maxTotalPrice) return false;
  }
  return true;
}

export function hasActiveOfferFilters(criteria: OfferFilterCriteria): boolean {
  return Boolean(
    (criteria.domain && criteria.domain !== "all") ||
      criteria.brand ||
      criteria.inStockOnly ||
      criteria.freeDeliveryOnly ||
      criteria.maxTotalPrice != null ||
      criteria.hasGtinOnly
  );
}

/** Keep products that still have at least one matching offer; trim offers to matches. */
export function applyOfferFilters(
  products: Product[],
  criteria: OfferFilterCriteria
): Product[] {
  return products
    .map((product) => {
      if (criteria.brand && product.brand.toLowerCase() !== criteria.brand.toLowerCase()) {
        return null;
      }
      if (criteria.hasGtinOnly && !product.gtin) return null;

      const offers = product.offers.filter((offer) => offerMatchesCriteria(offer, criteria));
      if (offers.length === 0) return null;
      if (offers.length === product.offers.length) return product;
      return { ...product, offers };
    })
    .filter((product): product is Product => product !== null);
}

export function collectBrandOptions(products: Product[]): string[] {
  const brands = new Set<string>();
  for (const product of products) {
    const brand = product.brand?.trim();
    if (brand) brands.add(brand);
  }
  return [...brands].sort((a, b) => a.localeCompare(b));
}

export function parseOfferFiltersFromSearchParams(
  params: URLSearchParams
): OfferFilterCriteria {
  const domain = params.get("domain") || undefined;
  const brand = params.get("brand") || undefined;
  const maxTotalRaw = params.get("maxTotal");
  const maxTotalPrice = maxTotalRaw ? Number(maxTotalRaw) : undefined;

  return {
    domain: domain && domain !== "all" ? domain : undefined,
    brand: brand || undefined,
    inStockOnly: params.get("inStock") === "1",
    freeDeliveryOnly: params.get("freeDelivery") === "1",
    maxTotalPrice:
      maxTotalPrice != null && Number.isFinite(maxTotalPrice) && maxTotalPrice > 0
        ? maxTotalPrice
        : undefined,
    hasGtinOnly: params.get("hasGtin") === "1",
  };
}

export function writeOfferFiltersToSearchParams(
  url: URL,
  criteria: OfferFilterCriteria
): void {
  const { searchParams } = url;

  if (criteria.domain && criteria.domain !== "all") {
    searchParams.set("domain", criteria.domain);
  } else {
    searchParams.delete("domain");
  }

  if (criteria.brand) searchParams.set("brand", criteria.brand);
  else searchParams.delete("brand");

  if (criteria.inStockOnly) searchParams.set("inStock", "1");
  else searchParams.delete("inStock");

  if (criteria.freeDeliveryOnly) searchParams.set("freeDelivery", "1");
  else searchParams.delete("freeDelivery");

  if (criteria.maxTotalPrice != null) {
    searchParams.set("maxTotal", String(criteria.maxTotalPrice));
  } else {
    searchParams.delete("maxTotal");
  }

  if (criteria.hasGtinOnly) searchParams.set("hasGtin", "1");
  else searchParams.delete("hasGtin");
}
