import {
  ALL_CATEGORIES_ID,
  getCategoryById,
  getSubcategoryById,
  resolveCategoryAlias,
  walkSubcategories,
} from "@/lib/categories";
import { MARKET_HUB_LEAF_GROUPS } from "@/lib/market-hubs";

/**
 * Expand a browse category/hub filter into concrete Product.category values
 * stored in Supabase (leaf IDs). Null = no category constraint.
 */
export function expandCategoryFilterToDbIds(
  category?: string | null
): string[] | null {
  if (!category || category === "all" || category === ALL_CATEGORIES_ID) {
    return null;
  }

  const hubLeaves = MARKET_HUB_LEAF_GROUPS[category];
  if (hubLeaves?.length) {
    return [...hubLeaves];
  }

  const resolved = resolveCategoryAlias(category);

  const parent = getCategoryById(resolved);
  if (parent) {
    const leaves = walkSubcategories(parent.subcategories).map((sub) => sub.id);
    return Array.from(new Set([parent.id, ...leaves]));
  }

  const mid = getSubcategoryById(resolved);
  if (mid?.children?.length) {
    const leaves = walkSubcategories(mid.children).map((child) => child.id);
    return Array.from(new Set([mid.id, ...leaves]));
  }

  const RELATED_LEAF_EXPANSIONS: Record<string, string[]> = {
    "fashion-beauty-hair-care": ["fashion-beauty-hair-care", "care-hair-styling", "fashion-beauty-cosmetics"],
    "care-hair-styling": ["care-hair-styling", "fashion-beauty-hair-care"],
    "auto-rims": ["auto-rims", "auto-complete-wheels"],
    "auto-complete-wheels": ["auto-complete-wheels", "auto-rims"],
    "cleaning-vacuums": [
      "cleaning-vacuums",
      "cleaning-stick-vacuums",
      "cleaning-bagless-vacuums",
      "cleaning-bagged-vacuums",
      "cleaning-wet-vacuums",
      "cleaning-robots",
      "cleaning-handheld",
    ],
    "cleaning-stick-vacuums": ["cleaning-stick-vacuums", "cleaning-vacuums"],
    "diy-hand-tools": ["diy-hand-tools", "diy-fasteners-consumables", "diy-measuring"],
  };

  if (RELATED_LEAF_EXPANSIONS[resolved]) {
    return RELATED_LEAF_EXPANSIONS[resolved];
  }

  return [resolved];
}
