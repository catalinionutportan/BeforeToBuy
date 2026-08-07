import { SHOPPING_CATEGORIES, UNMAPPED_CATEGORY_ID, walkSubcategories } from "@/lib/categories";
import {
  getGlobalPatternMatch,
  getMerchantDefaultCategory,
  getMerchantExactMatch,
  getMerchantPatternMatch,
  MAPPING_CONFIDENCE,
  MIN_MAPPING_CONFIDENCE,
} from "@/lib/merchant-category-rules";

/**
 * Maps merchant / affiliate feed categories + product text → BeforeToBuy subcategory id.
 *
 * C2 resolution order:
 * 1. Merchant exact category name
 * 2. Merchant-specific pattern rules on merchant category
 * 3. Global pattern rules on merchant category
 * 4. Merchant-specific pattern rules on title/description (feeds without category)
 * 5. Keyword inference from combined product text
 * 6. Global pattern rules on combined text
 * 7. Merchant default leaf (known specialised catalogues)
 * 8. unmapped (or below-threshold if confidence < MIN_MAPPING_CONFIDENCE)
 */

function normalizeText(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Score subcategory by keyword hits in combined product text */
function inferFromKeywords(text: string): { subcategoryId: string; score: number } | null {
  let bestId: string | null = null;
  let bestScore = 0;

  for (const categoryModule of SHOPPING_CATEGORIES) {
    for (const sub of walkSubcategories(categoryModule.subcategories)) {
      let score = 0;
      for (const kw of sub.searchKeywords) {
        if (text.includes(kw.toLowerCase())) score += kw.length > 6 ? 2 : 1;
      }
      // Prefer leaf types over mid-level parents when scores tie.
      if (score > bestScore || (score === bestScore && score > 0 && !sub.children?.length)) {
        bestScore = score;
        bestId = sub.id;
      }
    }
  }

  return bestScore > 0 && bestId ? { subcategoryId: bestId, score: bestScore } : null;
}

function applyConfidenceThreshold(result: CategoryMappingResult): CategoryMappingResult {
  if (
    result.categoryId !== UNMAPPED_CATEGORY_ID &&
    result.confidence < MIN_MAPPING_CONFIDENCE
  ) {
    return {
      categoryId: UNMAPPED_CATEGORY_ID,
      method: "below-threshold",
      confidence: result.confidence,
      rawCategory: result.rawCategory,
      proposedCategoryId: result.categoryId,
    };
  }
  return result;
}

export interface CategoryMappingInput {
  merchantId?: string;
  merchantCategory?: string;
  title?: string;
  description?: string;
  brand?: string;
}

export interface CategoryMappingResult {
  categoryId: string;
  method:
    | "merchant-exact"
    | "merchant-pattern"
    | "merchant-rule"
    | "merchant-default"
    | "keyword"
    | "combined-rule"
    | "below-threshold"
    | "unmapped"
    | "manual";
  confidence: number;
  rawCategory?: string;
  /** Populated when below-threshold suppresses a low-confidence match. */
  proposedCategoryId?: string;
}

/**
 * Resolve a BeforeToBuy subcategory id from feed fields.
 */
export function mapToBeforeToBuyCategoryWithMetadata(
  input: CategoryMappingInput
): CategoryMappingResult {
  const { merchantId, merchantCategory, title, description, brand } = input;
  const productText = normalizeText([title, description, brand]);
  const combined = normalizeText([merchantCategory, title, description, brand]);

  if (merchantCategory) {
    const exactMatch = getMerchantExactMatch(merchantId, merchantCategory);
    if (exactMatch) {
      return applyConfidenceThreshold({
        categoryId: exactMatch,
        method: "merchant-exact",
        confidence: MAPPING_CONFIDENCE.merchantExact,
        rawCategory: merchantCategory,
      });
    }

    const merchantPatternMatch = getMerchantPatternMatch(merchantId, merchantCategory);
    if (merchantPatternMatch) {
      return applyConfidenceThreshold({
        categoryId: merchantPatternMatch,
        method: "merchant-pattern",
        confidence: MAPPING_CONFIDENCE.merchantPattern,
        rawCategory: merchantCategory,
      });
    }

    const globalOnCategory = getGlobalPatternMatch(merchantCategory);
    if (globalOnCategory) {
      return applyConfidenceThreshold({
        categoryId: globalOnCategory,
        method: "merchant-rule",
        confidence: MAPPING_CONFIDENCE.globalPattern,
        rawCategory: merchantCategory,
      });
    }
  }

  // Prefer merchant title/description patterns before generic keywords (avoids
  // false positives like "ergonomic" → office when the feed has no category).
  const merchantTextMatch = getMerchantPatternMatch(merchantId, productText || combined);
  if (merchantTextMatch) {
    return applyConfidenceThreshold({
      categoryId: merchantTextMatch,
      method: "merchant-pattern",
      confidence: MAPPING_CONFIDENCE.merchantPattern,
      rawCategory: merchantCategory,
    });
  }

  const fromKeywords = inferFromKeywords(combined);
  if (fromKeywords) {
    const keywordMapped = applyConfidenceThreshold({
      categoryId: fromKeywords.subcategoryId,
      method: "keyword",
      confidence: Math.min(
        MAPPING_CONFIDENCE.keywordMax,
        MAPPING_CONFIDENCE.keywordBase + fromKeywords.score * MAPPING_CONFIDENCE.keywordStep
      ),
      rawCategory: merchantCategory,
    });
    if (keywordMapped.categoryId !== UNMAPPED_CATEGORY_ID) {
      return keywordMapped;
    }
  }

  const globalOnCombined = getGlobalPatternMatch(combined);
  if (globalOnCombined) {
    const combinedMapped = applyConfidenceThreshold({
      categoryId: globalOnCombined,
      method: "combined-rule",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    });
    if (combinedMapped.categoryId !== UNMAPPED_CATEGORY_ID) {
      return combinedMapped;
    }
  }

  const merchantDefault = getMerchantDefaultCategory(merchantId);
  if (merchantDefault) {
    return {
      categoryId: merchantDefault,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }

  if (fromKeywords) {
    return applyConfidenceThreshold({
      categoryId: fromKeywords.subcategoryId,
      method: "keyword",
      confidence: Math.min(
        MAPPING_CONFIDENCE.keywordMax,
        MAPPING_CONFIDENCE.keywordBase + fromKeywords.score * MAPPING_CONFIDENCE.keywordStep
      ),
      rawCategory: merchantCategory,
    });
  }

  return {
    categoryId: UNMAPPED_CATEGORY_ID,
    method: "unmapped",
    confidence: 0,
    rawCategory: merchantCategory,
  };
}

export function mapToBeforeToBuyCategory(input: CategoryMappingInput): string {
  return mapToBeforeToBuyCategoryWithMetadata(input).categoryId;
}

/** Human-readable label for a mapped category id */
export function getMappedCategoryLabel(subcategoryId: string): string {
  if (subcategoryId === UNMAPPED_CATEGORY_ID) return "Unmapped";
  for (const categoryModule of SHOPPING_CATEGORIES) {
    const sub = walkSubcategories(categoryModule.subcategories).find((s) => s.id === subcategoryId);
    if (sub) return sub.label;
    if (categoryModule.id === subcategoryId) return categoryModule.label;
  }
  return subcategoryId;
}

export { MIN_MAPPING_CONFIDENCE } from "@/lib/merchant-category-rules";
