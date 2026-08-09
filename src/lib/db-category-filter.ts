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

  return [resolved];
}
