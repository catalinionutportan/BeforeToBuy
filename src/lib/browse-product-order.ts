import type { Product } from "@/types";
import { resolveCategoryAlias } from "@/lib/categories";
import {
  getMarketHubIdForLeaf,
  MARKET_HUB_LEAF_GROUPS,
  marketHubOrderForCountry,
} from "@/lib/market-hubs";
import type { CountryCode } from "@/types";

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

/** Stable browse order: hubs → leaf aisle → core before accessories → title. */
export type SortOption = "default" | "price-asc" | "price-desc";

export type BrowseSortOptions = {
  countryCode?: CountryCode | string;
  /**
   * Search results stay in API order so iPhone + tyres + dresses can all appear
   * when the user deliberately uses the top search bar.
   */
  preserveApiOrder?: boolean;
};

function merchantLeadRank(_product: Product, _countryCode?: string): number {
  return 1;
}

function hubRank(leafId: string, countryCode?: string): number {
  const hubId = getMarketHubIdForLeaf(leafId);
  if (!hubId) return 900;
  const order = marketHubOrderForCountry(countryCode || "GB");
  const idx = order.indexOf(hubId);
  return idx === -1 ? 800 : idx;
}

function leafRank(leafId: string): number {
  const hubId = getMarketHubIdForLeaf(leafId);
  if (!hubId) return 9_000;
  const leaves = MARKET_HUB_LEAF_GROUPS[hubId] ?? [];
  const idx = leaves.indexOf(leafId);
  return idx === -1 ? 8_000 : idx;
}

export function sortProductsForBrowse(
  products: Product[],
  sortOption: SortOption = "default",
  options: BrowseSortOptions = {}
): Product[] {
  return [...products].sort((a, b) => {
    if (sortOption === "price-asc") {
      return (a.basePrice || Infinity) - (b.basePrice || Infinity);
    }
    if (sortOption === "price-desc") {
      return (b.basePrice || 0) - (a.basePrice || 0);
    }

    // Search: keep server order (mixed categories on purpose).
    if (options.preserveApiOrder) {
      return 0;
    }

    const aLead = merchantLeadRank(a, options.countryCode);
    const bLead = merchantLeadRank(b, options.countryCode);
    if (aLead !== bLead) return aLead - bLead;

    const aLeaf = resolveCategoryAlias(a.category);
    const bLeaf = resolveCategoryAlias(b.category);

    const aHub = hubRank(aLeaf, options.countryCode);
    const bHub = hubRank(bLeaf, options.countryCode);
    if (aHub !== bHub) return aHub - bHub;

    const aLeafR = leafRank(aLeaf);
    const bLeafR = leafRank(bLeaf);
    if (aLeafR !== bLeafR) return aLeafR - bLeafR;

    const aAcc = isAccessoryRaw(a.categoryAssignment?.rawCategory) ? 1 : 0;
    const bAcc = isAccessoryRaw(b.categoryAssignment?.rawCategory) ? 1 : 0;
    if (aAcc !== bAcc) return aAcc - bAcc;

    return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
  });
}
