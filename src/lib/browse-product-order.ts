import type { Product } from "@/types";

/**
 * Accessory / parts aisles that should not lead a shopper-facing category view
 * (e.g. laptop bags before notebooks, scooter parts before scooters).
 */
const ACCESSORY_RAW_CATEGORY =
  /\b(genti|huse|rucsac|ghiozdan|baterii|baterie|acumulatori|piese|accesorii|cooler-stand|cooler|stand|componente|tastaturi laptop|folie|incarcator|protectie)\b/i;

function isAccessoryRaw(raw?: string): boolean {
  if (!raw?.trim()) return false;
  return ACCESSORY_RAW_CATEGORY.test(raw);
}

/** Stable browse order: core catalogue first, then accessories / parts. */
export function sortProductsForBrowse(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aAcc = isAccessoryRaw(a.categoryAssignment?.rawCategory) ? 1 : 0;
    const bAcc = isAccessoryRaw(b.categoryAssignment?.rawCategory) ? 1 : 0;
    if (aAcc !== bAcc) return aAcc - bAcc;
    return 0;
  });
}
