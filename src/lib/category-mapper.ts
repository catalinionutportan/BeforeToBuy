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
  isArloAllowedCategory,
  isBabywalzAllowedCategory,
  isBelandoAllowedCategory,
  isAcerAllowedCategory,
  isGigasportAllowedCategory,
  isDjiAllowedCategory,
  isReifencomAllowedCategory,
  isRowentaAllowedCategory,
  MAPPING_CONFIDENCE,
  MIN_MAPPING_CONFIDENCE,
} from "@/lib/merchant-category-rules";

/** Scule365 is a DIY catalogue — every product stays under Bricolaj. */
const SCULE365_PARENT_ID = "diy-tools";
const SCULE365_FALLBACK_LEAF = "diy-hand-tools";

/** Rowenta fallback when title/category is ambiguous. */
const ROWENTA_FALLBACK_LEAF = "cleaning-vacuums";

/** baby-walz fallback when title/category is ambiguous. */
const BABYWALZ_FALLBACK_LEAF = "fashion-kids-baby";

/** Reifen.com fallback when title/category is ambiguous. */
const REIFENCOM_FALLBACK_LEAF = "auto-tires-wheels";

/** Belando fallback when title/category is ambiguous. */
const BELANDO_FALLBACK_LEAF = "fashion-beauty-hair-care";

/** Powered styling tools only — combs, brushes and shampoo stay in beauty. */
const BELANDO_HAIR_APPLIANCE_RE =
  /\b(föhn|foehn|haartrockner|hair\s*dryer|glätteisen|glaetteisen|straightener|lockenstab|curling\s*iron|haarschneider|haarschneidemaschine|trimmer|warmluftbürste|warmluftbuerste)\b/i;
const BELANDO_HAIR_CONSUMABLE_RE =
  /\b(shampoo|conditioner|lotion|creme|cream|serum|maske|haarspray|haaröl|haarol|öl)\b/i;
const BELANDO_HAIR_ACCESSORY_RE =
  /\b(aufsteckkamm|softstyler|kamm\s+für|für\s+die\s+wahl)\b/i;

/** Arlo fallback when title/category is ambiguous. */
const ARLO_FALLBACK_LEAF = "smart-home-security";

/** Acer fallback when title/category is ambiguous. */
const ACER_FALLBACK_LEAF = "notebooks-laptops";
/** Gigasport fallback when title/category is ambiguous. */
const GIGASPORT_FALLBACK_LEAF = "fashion-men-activewear";
const DJI_FALLBACK_LEAF = "drones-quadcopters";

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

/** Force baby-walz into baby / kids / toys leaves only. */
function clampBabywalzToBabyCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isBabywalzAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: BABYWALZ_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== BABYWALZ_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  return result;
}

/** Clothes aisle is the dump — title wins for bikes, nursery, carriers, bags. */
const BABYWALZ_TITLE_RULES: Array<{ re: RegExp; categoryId: string }> = [
  {
    re: /kinderwagen|buggy|sportwagen|kombikinderwagen|hüfttrage|huefttrage|babytrage|tragehilfe/i,
    categoryId: "baby-strollers-travel",
  },
  {
    re: /\b(autositz|babyschale|reboarder|kindersitz(?!garnitur))\b/i,
    categoryId: "baby-car-seats",
  },
  {
    re: /\b(hochstuhl|babybett|wickelkommode|wickelauflage|betthimmel|kindersitzgarnitur|spannbetttuch|stubenwagen|beistellbett)\b/i,
    categoryId: "baby-nursery",
  },
  {
    re: /\b(kinderfahrrad|laufrad|dreirad|scooter|kuscheltier|tonie|nachtlicht|kugelbahn)\b/i,
    categoryId: "toys-electronic",
  },
  { re: /\b(rucksack|schulranzen|wet\s*bag)\b/i, categoryId: "fashion-bags" },
  {
    re: /\b(winterschuhe|hausschuhe|sneaker|stiefel)\b/i,
    categoryId: "fashion-shoes-kids-sneakers",
  },
];

function refineBabywalzCatalogue(
  result: CategoryMappingResult,
  title?: string
): CategoryMappingResult {
  const clamped = clampBabywalzToBabyCatalogue(result);
  const text = title || "";
  for (const rule of BABYWALZ_TITLE_RULES) {
    if (rule.re.test(text)) {
      return { ...clamped, categoryId: rule.categoryId, method: "merchant-pattern" };
    }
  }
  return clamped;
}

/** Force Reifen.com into tyre / auto accessory leaves only. */
function clampReifencomToAutoCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isReifencomAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: REIFENCOM_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== REIFENCOM_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  return result;
}

/** Force Belando into hair / beauty / styling-tool leaves only. */
function clampBelandoToBeautyCatalogue(
  result: CategoryMappingResult,
  title?: string
): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isBelandoAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: BELANDO_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== BELANDO_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  // AWIN often labels shampoo / brushes as "Haircare Appliances".
  // "Föhn Lotion" is a consumable, not a dryer.
  const titleText = title || "";
  const looksLikeAccessory = BELANDO_HAIR_ACCESSORY_RE.test(titleText);
  const looksLikeConsumable = BELANDO_HAIR_CONSUMABLE_RE.test(titleText);
  const looksLikeAppliance = BELANDO_HAIR_APPLIANCE_RE.test(titleText);
  if (looksLikeAccessory) {
    return {
      ...result,
      categoryId: BELANDO_FALLBACK_LEAF,
      method: "merchant-default",
      proposedCategoryId: result.categoryId,
    };
  }
  if (
    result.categoryId === "care-hair-styling" &&
    (looksLikeConsumable || !looksLikeAppliance)
  ) {
    return {
      ...result,
      categoryId: BELANDO_FALLBACK_LEAF,
      method: "merchant-default",
      proposedCategoryId: result.categoryId,
    };
  }
  return result;
}

/**
 * Seentat aisles (Apple / Camera / Gaming / Personal Care / DJI) are too coarse.
 * Title wins for the product types we keep seeing dumped in the wrong leaf.
 */
const SEENTAT_TITLE_RULES: Array<{ re: RegExp; categoryId: string }> = [
  {
    re: /\b(hoverair|self-flying|antigravity)\b/i,
    categoryId: "drones-quadcopters",
  },
  {
    re: /\b(dji\s+(air|avata|mavic|mini|flip|neo|inspire|phantom|fpv)|\bdrone\b|quadcopter|avata\s*\d|mavic\s*\d)\b/i,
    categoryId: "drones-quadcopters",
  },
  {
    re: /\b(osmo\s+action|osmo\s+360|gopro|insta360|action\s+camera|ace\s+pro|osmo\s+pocket)\b/i,
    categoryId: "photo-action",
  },
  {
    re: /\b(osmo\s+mobile|gimbal|ronin|\brs\s*[45]\b|mount\s+adapter|teleconverter|extender|speedlight|speedlite|battery\s+power\s+pack|light\s+meter|cfexpress|memory\s+card|external\s+flash|hvl-)\b/i,
    categoryId: "photo-bags",
  },
  {
    re: /\b(rode\s+wireless|microphone\s+system)\b/i,
    categoryId: "photo-bags",
  },
  { re: /\b(dslr|d850|d7500|5d\s+mark|reflex\s+camera)\b/i, categoryId: "photo-dslr" },
  {
    re: /\b(mirrorless|eos\s+r\d|eos\s+r\b|alpha\s*a?\d|om-1|om-5|pen\s+e-p|zv-e\d*|cinema\s+(camera|line)|body\s+only)\b/i,
    categoryId: "photo-mirrorless",
  },
  { re: /\b(camera)\b/i, categoryId: "photo-compact" },
  { re: /\b(lens|objektiv)\b/i, categoryId: "photo-lenses" },
  { re: /\b(ipad|oneplus\s+pad|xiaomi\s+pad|redmi\s+pad|galaxy\s+tab|tablet)\b/i, categoryId: "mobile-tablets" },
  { re: /\b(keyboard)\b/i, categoryId: "mobile-accessories" },
  { re: /\b(airpods|headphones?|headset|quietcomfort|earbuds?|\bbuds\b)\b/i, categoryId: "audio-headphones" },
  {
    re: /\b(iphone|galaxy\s+[asmz]\d|pixel\s*\d|redmi(?!\s+(pad|buds))|smartphone|sim\s+free|nothing\s+phone|oneplus|huawei\s+(pura|mate|nova)|honor|oppo|vivo|\bpoco\b)\b/i,
    categoryId: "mobile-smartphones",
  },
  { re: /\b(portable\s+audio\s+player|walkman|nw-)\b/i, categoryId: "audio-portable" },
  { re: /\b(watch|smartwatch|g-shock)\b/i, categoryId: "wearables-smartwatch" },
  { re: /\b(photography\s+kit)\b/i, categoryId: "mobile-accessories" },
  { re: /\bmacbook\b/i, categoryId: "notebooks-laptops" },
  { re: /\bmac\s+mini\b/i, categoryId: "notebooks-desktops" },
  { re: /\bapple\s+tv\b/i, categoryId: "tv-televisions" },
  { re: /\b(apple\s+pencil|airtag)\b/i, categoryId: "mobile-accessories" },
  {
    re: /\b(dyson\s+(airwrap|airstrait|supersonic)|hair\s+dryer|straightener)\b/i,
    categoryId: "care-hair-styling",
  },
  { re: /\b(shaver|epilator|hair\s+remover)\b/i, categoryId: "care-shaving-hair-removal" },
  { re: /\b(sonicare|toothbrush)\b/i, categoryId: "care-oral" },
  { re: /\bforeo\b/i, categoryId: "fashion-beauty-cosmetics" },
  { re: /\b(joy-con|dualsense|dock\s+set)\b/i, categoryId: "gaming-accessories" },
  {
    re: /\b(switch\s+2(\s+console)?|switch\s+oled|rog\s+xbox\s+ally|msi\s+claw|steam\s+deck)\b/i,
    categoryId: "gaming-consoles",
  },
  { re: /\b(quest\s*\d|oculus)\b/i, categoryId: "gaming-vr" },
];

function refineSeentatElectronics(
  result: CategoryMappingResult,
  title?: string
): CategoryMappingResult {
  const text = title || "";
  const isOsmoHandheld = /\b(osmo\s+action|osmo\s+360|osmo\s+pocket|osmo\s+mobile|gimbal|ronin)\b/i.test(
    text
  );
  for (const rule of SEENTAT_TITLE_RULES) {
    if (rule.categoryId === "drones-quadcopters" && isOsmoHandheld) continue;
    if (rule.re.test(text)) {
      return { ...result, categoryId: rule.categoryId, method: "merchant-pattern" };
    }
  }
  return result;
}

/**
 * Geepas aisle is almost always "Kitchen Units", which keyword-matches
 * furniture-kitchen. Title wins; leftover furniture / monitor / game dumps
 * fall back to cooking appliances.
 */
const GEEPAS_TITLE_RULES: Array<{ re: RegExp; categoryId: string }> = [
  { re: /\b(gift\s+card)\b/i, categoryId: "digital-gift-cards" },
  { re: /\b(steam\s+iron|\biron\b|ironing|clothes\s+steamer)\b/i, categoryId: "laundry-ironing-sewing" },
  {
    re: /\b(heater|convector|halogen\s+heater|ceramic\s+ptc|tower\s+heater|radiator|gas\s+heater)\b/i,
    categoryId: "climate-heating",
  },
  { re: /\b(heated.{0,24}blankets?|heated.{0,24}throws?|electric.{0,24}blankets?)\b/i, categoryId: "textiles-bedding" },
  { re: /\b(vacuum|hepa|spot\s*clean|steam\s+mop)\b/i, categoryId: "cleaning-vacuums" },
  {
    re: /\b(hair\s+clipper|beard\s+trimmer|trimmer|shaver)\b/i,
    categoryId: "care-shaving-hair-removal",
  },
  {
    re: /\b(hair\s+dryer|straightener|hair\s+curler|styler)\b/i,
    categoryId: "care-hair-styling",
  },
  { re: /\b(coffee|espresso|filter\s+coffee)\b/i, categoryId: "kitchen-coffee-machines" },
  {
    re: /\b(blender|mixer|food\s+processor|salad\s+maker|grater|chopper|mincer|grinder|juicer|juice|squeezer)\b/i,
    categoryId: "kitchen-machines-mixers",
  },
  {
    re: /\b(air\s*fryer|deep\s+fat\s+fryer|fryer|multicooker|rice\s+cooker|pressure\s+cooker|grill|barbeque|barbecue|\bbbq\b|crepe|popcorn|candy\s+floss|sausage\s+roll|food\s+warmer)\b/i,
    categoryId: "kitchen-cooking-appliances",
  },
  { re: /\b(microwave)\b/i, categoryId: "kitchen-microwaves" },
  {
    re: /\b(toaster|kettle|waffle|sandwich\s+maker|egg\s+cooker|egg\s+boiler|breakfast|tea\s+urn|water\s+boiler|catering\s+urn|thermos|carafe|airpot|flask)\b/i,
    categoryId: "kitchen-breakfast",
  },
  { re: /\b(tap|shattaf|bidet)\b/i, categoryId: "kitchen-water-treatment" },
  { re: /\b(\bfan\b|cooler)\b/i, categoryId: "climate-cooling" },
  { re: /\b(massager|massage\s+gun)\b/i, categoryId: "health-massage-recovery" },
  { re: /\b(bluetooth\s+speaker|karaoke)\b/i, categoryId: "audio-speakers" },
  { re: /\b(extension\s+leads?)\b/i, categoryId: "diy-electrical" },
  { re: /\b(folding\s+chair|camping\s+bed|folding\s+table)\b/i, categoryId: "furniture-outdoor" },
  {
    re: /\b(saucepan|skillet|wok|dinnerware|utensil|canister|storage\s+set|paper\s+towel|kitchen\s+bin|chopping)\b/i,
    categoryId: "kitchen-cooking-appliances",
  },
];

const GEEPAS_AISLE_LEAKS = new Set([
  "furniture-kitchen",
  "notebooks-monitors",
  "gaming-games",
  "home-smart-home",
  "peripherals-storage",
]);

function refineGeepasHome(
  result: CategoryMappingResult,
  title?: string
): CategoryMappingResult {
  const text = title || "";
  for (const rule of GEEPAS_TITLE_RULES) {
    if (rule.re.test(text)) {
      return { ...result, categoryId: rule.categoryId, method: "merchant-pattern" };
    }
  }
  if (GEEPAS_AISLE_LEAKS.has(result.categoryId)) {
    return {
      ...result,
      categoryId: "kitchen-cooking-appliances",
      method: "merchant-default",
    };
  }
  return result;
}

/** Force Arlo into smart-home security only. */
function clampArloToSecurityCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isArloAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: ARLO_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== ARLO_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  return result;
}

/** Force Acer into computer / projector electronics leaves. */
function clampAcerToElectronicsCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isAcerAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: ACER_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== ACER_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  return result;
}

/** Force Gigasport into sport apparel / shoes / bike leaves. */
function clampGigasportToSportCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isGigasportAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: GIGASPORT_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== GIGASPORT_FALLBACK_LEAF
          ? result.categoryId
          : result.proposedCategoryId,
    };
  }
  return result;
}

function clampDjiToCameraCatalogue(result: CategoryMappingResult): CategoryMappingResult {
  if (result.categoryId === UNMAPPED_CATEGORY_ID || !isDjiAllowedCategory(result.categoryId)) {
    return {
      ...result,
      categoryId: DJI_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      proposedCategoryId:
        result.categoryId !== UNMAPPED_CATEGORY_ID && result.categoryId !== DJI_FALLBACK_LEAF
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
    if (merchantId === "ch-babywalz") return refineBabywalzCatalogue(scored, title);
    if (merchantId === "ch-reifencom" || merchantId === "de-reifen") {
      return clampReifencomToAutoCatalogue(scored);
    }
    if (merchantId === "ch-belando") return clampBelandoToBeautyCatalogue(scored, title);
    if (merchantId === "ch-acer") return clampAcerToElectronicsCatalogue(scored);
    if (merchantId === "ch-gigasport") return clampGigasportToSportCatalogue(scored);
    if (merchantId === "us-dji") return clampDjiToCameraCatalogue(scored);
    if (merchantId === "gb-arlo") return clampArloToSecurityCatalogue(scored);
    if (merchantId === "gb-seentat") return refineSeentatElectronics(scored, title);
    if (merchantId === "gb-geepas") return refineGeepasHome(scored, title);
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
  if (merchantId === "ch-babywalz") {
    return finalize({
      categoryId: BABYWALZ_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    });
  }
  if (merchantId === "ch-reifencom" || merchantId === "de-reifen") {
    return {
      categoryId: REIFENCOM_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "ch-belando") {
    return {
      categoryId: BELANDO_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "ch-acer") {
    return {
      categoryId: ACER_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "ch-gigasport") {
    return {
      categoryId: GIGASPORT_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "us-dji") {
    return {
      categoryId: DJI_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }
  if (merchantId === "gb-arlo") {
    return {
      categoryId: ARLO_FALLBACK_LEAF,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: merchantCategory,
    };
  }

  // evoMAG ships aisle names. Prefer category-only keywords/patterns — never title
  // brand inference here ("xiaomi" / "wifi" marketing copy invents phones).
  if (merchantId === "ro-evomag" && merchantCategory?.trim()) {
    const categoryOnly = normalizeText([merchantCategory]);
    const fromCategoryKeywords = inferFromKeywords(categoryOnly);
    if (fromCategoryKeywords) {
      const keywordMapped = finalize({
        categoryId: fromCategoryKeywords.subcategoryId,
        method: "keyword",
        confidence: Math.min(
          MAPPING_CONFIDENCE.keywordMax,
          MAPPING_CONFIDENCE.keywordBase +
            fromCategoryKeywords.score * MAPPING_CONFIDENCE.keywordStep
        ),
        rawCategory: merchantCategory,
      });
      if (keywordMapped.categoryId !== UNMAPPED_CATEGORY_ID) {
        return keywordMapped;
      }
    }
    const globalOnCategoryOnly = getGlobalPatternMatch(categoryOnly);
    if (globalOnCategoryOnly) {
      return finalize({
        categoryId: globalOnCategoryOnly,
        method: "combined-rule",
        confidence: MAPPING_CONFIDENCE.combinedPattern,
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

  // Keywords also ignore descriptions (marketing copy false positives).
  const fromKeywords = inferFromKeywords(
    normalizeText([merchantCategory, title, brand]) || combined
  );
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

  return finalize({
    categoryId: UNMAPPED_CATEGORY_ID,
    method: "unmapped",
    confidence: 0,
    rawCategory: merchantCategory,
  });
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
