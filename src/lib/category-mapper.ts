import { SHOPPING_CATEGORIES, UNMAPPED_CATEGORY_ID } from "@/lib/categories";

/**
 * Maps merchant / affiliate feed categories + product text → BeforeToBuy subcategory id.
 *
 * Feeds do NOT auto-place products correctly by themselves:
 * - AWIN CSV has `category_name` (merchant taxonomy, inconsistent across advertisers)
 * - Amazon PA-API has BrowseNodes / SearchIndex (different per locale)
 * - Galaxus feeds may use internal product type codes
 *
 * BeforeToBuy owns ONE taxonomy. This mapper normalizes all incoming data into it.
 */

/** Merchant category path fragments → BeforeToBuy subcategory (checked first) */
const MERCHANT_CATEGORY_RULES: { patterns: RegExp; subcategoryId: string }[] = [
  // Photo + Video (specific before broad)
  { patterns: /\b(dslr|spiegelreflex|eos\s*\d+d|nikon d\d)/i, subcategoryId: "photo-dslr" },
  { patterns: /\b(mirrorless|systemkamera|eos r|alpha\s*[67]|nikon z\d|fujifilm x-)/i, subcategoryId: "photo-mirrorless" },
  { patterns: /\b(instax|polaroid|compact camera|point.?and.?shoot|sofortbild)/i, subcategoryId: "photo-compact" },
  { patterns: /\b(gopro|action cam|osmo action|insta360|action camera)/i, subcategoryId: "photo-action" },
  { patterns: /\b(objektiv|camera lens|zoom lens|prime lens|\b\d+mm f\/)/i, subcategoryId: "photo-lenses" },
  { patterns: /\b(drone battery|propeller|drone case)/i, subcategoryId: "drones-accessories" },
  { patterns: /\b(mavic|mini \d pro|quadcopter|\bfpv drone\b|dji air)/i, subcategoryId: "drones-quadcopters" },
  { patterns: /\b(ink|toner|cartridge|druckerpatrone)/i, subcategoryId: "office-ink-toner" },
  { patterns: /\b(printer|scanner|multifunction|drucker)/i, subcategoryId: "office-printers" },
  { patterns: /\b(office furniture|desk|chair|home office|büromöbel|ergonomic)/i, subcategoryId: "office-home" },
  { patterns: /\b(shredder|laminator|label printer|office tech)/i, subcategoryId: "office-tech" },
  { patterns: /\b(headphone|kopfhörer|earphone|headset)/i, subcategoryId: "audio-headphones" },
  { patterns: /\b(speaker|soundbar|lautsprecher)/i, subcategoryId: "audio-speakers" },
  { patterns: /\b(laptop|notebook|macbook)/i, subcategoryId: "notebooks-laptops" },
  { patterns: /\b(smartphone|iphone|mobile phone|handy)/i, subcategoryId: "mobile-smartphones" },
  { patterns: /\b(playstation|xbox|nintendo)/i, subcategoryId: "gaming-consoles" },
  { patterns: /\b(television|\btv\b|oled|fernseher)/i, subcategoryId: "tv-televisions" },
];

function normalizeText(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Score subcategory by keyword hits in combined product text */
function inferFromKeywords(text: string): { subcategoryId: string; score: number } | null {
  let bestId: string | null = null;
  let bestScore = 0;

  for (const categoryModule of SHOPPING_CATEGORIES) {
    for (const sub of categoryModule.subcategories) {
      let score = 0;
      for (const kw of sub.searchKeywords) {
        if (text.includes(kw.toLowerCase())) score += kw.length > 6 ? 2 : 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestId = sub.id;
      }
    }
  }

  return bestScore > 0 && bestId ? { subcategoryId: bestId, score: bestScore } : null;
}

export interface CategoryMappingInput {
  merchantCategory?: string;
  title?: string;
  description?: string;
  brand?: string;
}

export interface CategoryMappingResult {
  categoryId: string;
  method: "merchant-rule" | "keyword" | "combined-rule" | "unmapped";
  confidence: number;
  rawCategory?: string;
}

/**
 * Resolve a BeforeToBuy subcategory id from feed fields.
 * Order: merchant category rules → keyword inference → fallback.
 */
export function mapToBeforeToBuyCategoryWithMetadata(
  input: CategoryMappingInput
): CategoryMappingResult {
  const { merchantCategory, title, description, brand } = input;
  const combined = normalizeText([merchantCategory, title, description, brand]);

  if (merchantCategory) {
    for (const rule of MERCHANT_CATEGORY_RULES) {
      if (rule.patterns.test(merchantCategory)) {
        return {
          categoryId: rule.subcategoryId,
          method: "merchant-rule",
          confidence: 0.95,
          rawCategory: merchantCategory,
        };
      }
    }
  }

  const fromKeywords = inferFromKeywords(combined);
  if (fromKeywords) {
    return {
      categoryId: fromKeywords.subcategoryId,
      method: "keyword",
      confidence: Math.min(0.85, 0.55 + fromKeywords.score * 0.05),
      rawCategory: merchantCategory,
    };
  }

  if (merchantCategory) {
    for (const rule of MERCHANT_CATEGORY_RULES) {
      if (rule.patterns.test(combined)) {
        return {
          categoryId: rule.subcategoryId,
          method: "combined-rule",
          confidence: 0.7,
          rawCategory: merchantCategory,
        };
      }
    }
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
    const sub = categoryModule.subcategories.find((s) => s.id === subcategoryId);
    if (sub) return sub.label;
    if (categoryModule.id === subcategoryId) return categoryModule.label;
  }
  return subcategoryId;
}
