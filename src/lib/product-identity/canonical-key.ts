import { normalizeGtin } from "@/lib/product-identity/gtin";
import { extractVariantKey } from "@/lib/product-identity/variant-key";

export interface ProductIdentity {
  gtin?: string;
  variantKey: string;
  canonicalKey: string;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildProductIdentity(input: {
  gtin?: string;
  variantKey?: string;
  brand: string;
  title: string;
}): ProductIdentity {
  const gtin = normalizeGtin(input.gtin);
  const variantKey =
    input.variantKey !== undefined
      ? input.variantKey
      : extractVariantKey(input.title);

  if (gtin) {
    return {
      gtin,
      variantKey,
      canonicalKey: `gtin:${gtin}:v:${variantKey}`,
    };
  }

  return {
    variantKey,
    canonicalKey: `brand:${input.brand.toLowerCase()}:title:${normalizeTitle(input.title)}`,
  };
}

export function offerDedupeKey(offer: {
  id: string;
  storeName: string;
  type: string;
  feedMerchantId?: string;
}): string {
  return `${offer.feedMerchantId || offer.storeName}:${offer.type}:${offer.id}`;
}
