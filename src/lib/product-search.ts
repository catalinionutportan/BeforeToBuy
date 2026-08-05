import { normalizeGtin } from "@/lib/product-identity/gtin";

/** Title/brand/description substring match, plus GTIN/EAN digit lookup. */
export function productMatchesSearchQuery(
  product: { title: string; brand: string; description: string; gtin?: string },
  query?: string
): boolean {
  const q = query?.trim().toLowerCase() ?? "";
  if (!q) return true;

  if (
    product.title.toLowerCase().includes(q) ||
    product.brand.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q)
  ) {
    return true;
  }

  const digits = q.replace(/\D/g, "");
  if (digits.length < 8 || !product.gtin) return false;

  const queryGtin = normalizeGtin(digits);
  if (queryGtin && (product.gtin === queryGtin || product.gtin.includes(digits))) {
    return true;
  }

  return product.gtin.includes(digits);
}
