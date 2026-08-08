import {
  getParentCategoryId,
  SHOPPING_CATEGORIES,
  UNMAPPED_CATEGORY_ID,
  walkSubcategories,
} from "@/lib/categories";
import {
  getGlobalPatternMatch,
  getMerchantDefaultCategory,
  getMerchantExactMatch,
  getMerchantPatternMatch,
  isRowentaAllowedCategory,
  MAPPING_CONFIDENCE,
  MIN_MAPPING_CONFIDENCE,
} from "@/lib/merchant-category-rules";

/** Scule365 is a DIY catalogue — every product stays under Bricolaj. */
const SCULE365_PARENT_ID = "diy-tools";
const SCULE365_FALLBACK_LEAF = "diy-hand-tools";

/** Rowenta fallback when title/category is ambiguous. */
const ROWENTA_FALLBACK_LEAF = "cleaning-vacuums";

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

/**
 * Keyword hit with word boundaries for single tokens.
 * Prevents "men" matching inside "Segmentata" / "cap" inside "Capac".
 */
function keywordMatches(text: string, keyword: string): boolean {
  const kw = keyword.toLowerCase().trim();
  if (!kw) return false;
  if (kw.includes(" ")) return text.includes(kw);
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:[^\\p{L}\\p{N}]|$)`, "iu").test(text);
}

/** Score subcategory by keyword hits in combined product text */
function inferFromKeywords(text: string): { subcategoryId: string; score: number } | null {
  let bestId: string | null = null;
  let bestScore = 0;
  let bestIsLeaf = false;

  for (const categoryModule of SHOPPING_CATEGORIES) {
    for (const sub of walkSubcategories(categoryModule.subcategories)) {
      let score = 0;
      for (const kw of sub.searchKeywords) {
        if (keywordMatches(text, kw)) score += kw.length > 6 ? 2 : 1;
      }
      const isLeaf = !sub.children?.length;
      // Prefer stronger scores; on ties prefer a leaf over a mid-level parent (keep first leaf).
      if (
        score > bestScore ||
        (score === bestScore && score > 0 && isLeaf && !bestIsLeaf)
      ) {
        bestScore = score;
        bestId = sub.id;
        bestIsLeaf = isLeaf;
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

/** Force Scule365 into Bricolaj leaves even if a rule/keyword drifts elsewhere. */
function clampScule365ToDiy(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID) {
    return {
      ...result,
      categoryId: SCULE365_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
    };
  }
  if (getParentCategoryId(result.categoryId) === SCULE365_PARENT_ID) {
    return result;
  }
  return {
    ...result,
    categoryId: SCULE365_FALLBACK_LEAF,
    method: "merchant-default",
    confidence: MAPPING_CONFIDENCE.combinedPattern,
    proposedCategoryId: result.categoryId,
  };
}

/** Force Rowenta into vacuum / hair-care / ironing / climate leaves only. */
function clampRowentaToAppliances(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isRowentaAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: ROWENTA_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== ROWENTA_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
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
  const finalize = (result: CategoryMappingResult): CategoryMappingResult => {
    const scored = applyConfidenceThreshold(result);
    if (merchantId === "ro-scule365") return clampScule365ToDiy(scored);
    if (merchantId === "ro-rowenta") return clampRowentaToAppliances(scored);
    return scored;
  };

  if (merchantCategory) {
    const exactMatch = getMerchantExactMatch(merchantId, merchantCategory);
    if (exactMatch) {
      return finalize({
        categoryId: exactMatch,
        method: "merchant-exact",
        confidence: MAPPING_CONFIDENCE.merchantExact,
        rawCategory: merchantCategory,
      });
    }

    const merchantPatternMatch = getMerchantPatternMatch(merchantId, merchantCategory);
    if (merchantPatternMatch) {
      return finalize({
        categoryId: merchantPatternMatch,
        method: "merchant-pattern",
        confidence: MAPPING_CONFIDENCE.merchantPattern,
        rawCategory: merchantCategory,
      });
    }

    const globalOnCategory = getGlobalPatternMatch(merchantCategory);
    if (globalOnCategory) {
      return finalize({
        categoryId: globalOnCategory,
        method: "merchant-rule",
        confidence: MAPPING_CONFIDENCE.globalPattern,
        rawCategory: merchantCategory,
      });
    }
  }

  // Title + brand only — never descriptions. Marketing copy often says
  // "control from your smartphone" and would misfile routers/cameras as phones.
  const titleBrandText = normalizeText([title, brand]);
  const merchantTextMatch = getMerchantPatternMatch(
    merchantId,
    titleBrandText || productText || combined
  );
  if (merchantTextMatch) {
    return finalize({
      categoryId: merchantTextMatch,
      method: "merchant-pattern",
      confidence: MAPPING_CONFIDENCE.merchantPattern,
      rawCategory: merchantCategory,
    });
  }

  // Specialised catalogues: never leak via noisy global keywords.
  if (merchantId === "ro-scule365") {
    return {
      categoryId: SCULE365_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "ro-rowenta") {
    return {
      categoryId: ROWENTA_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }

  const fromKeywords = inferFromKeywords(combined);
  if (fromKeywords) {
    const keywordMapped = finalize({
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
    const combinedMapped = finalize({
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
    return finalize({
      categoryId: merchantDefault,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    });
  }

  if (fromKeywords) {
    return finalize({
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
