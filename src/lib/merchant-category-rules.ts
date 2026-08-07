import { SHOPPING_CATEGORIES, UNMAPPED_CATEGORY_ID } from "@/lib/categories";

/** Merchants with dedicated category mapping rule sets (C2). */
export const MAPPING_MERCHANT_IDS = [
  "ch-digitec",
  "ch-galaxus",
  "ch-brack",
  "ch-mediamarkt",
  "ch-interdiscount",
  "ch-fust",
  "ro-scule365",
  "ro-rowenta",
] as const;

export type MappingMerchantId = (typeof MAPPING_MERCHANT_IDS)[number];

export const MIN_MAPPING_CONFIDENCE = 0.65;

export interface MerchantPatternRule {
  patterns: RegExp;
  subcategoryId: string;
}

export interface MerchantCategoryRuleSet {
  exact: Record<string, string>;
  patterns: MerchantPatternRule[];
}

/** Confidence scores per resolution stage. */
export const MAPPING_CONFIDENCE = {
  merchantExact: 0.98,
  merchantPattern: 0.92,
  globalPattern: 0.95,
  keywordBase: 0.55,
  keywordStep: 0.05,
  keywordMax: 0.85,
  combinedPattern: 0.7,
} as const;

const VALID_LEAF_CATEGORY_IDS = new Set(
  SHOPPING_CATEGORIES.flatMap((category) => category.subcategories.map((sub) => sub.id))
);

/** Shared exact maps for Swiss retailer feed labels (DE/EN/FR variants). */
const SHARED_SWISS_EXACT: Record<string, string> = {
  smartphones: "mobile-smartphones",
  handy: "mobile-smartphones",
  handys: "mobile-smartphones",
  "mobile phones": "mobile-smartphones",
  telefon: "mobile-smartphones",
  telefone: "mobile-smartphones",
  laptops: "notebooks-laptops",
  notebooks: "notebooks-laptops",
  "notebooks & laptops": "notebooks-laptops",
  "notebooks and laptops": "notebooks-laptops",
  "notebooks & pcs": "notebooks-laptops",
  kopfhörer: "audio-headphones",
  headphones: "audio-headphones",
  "headphones & headsets": "audio-headphones",
  lautsprecher: "audio-speakers",
  speakers: "audio-speakers",
  soundbars: "audio-speakers",
  fernseher: "tv-televisions",
  televisions: "tv-televisions",
  tv: "tv-televisions",
  tablets: "notebooks-tablets-pc",
  "computer accessories": "peripherals-accessories",
  "pc accessories": "peripherals-accessories",
  "computer components": "pc-gpu",
  "gaming consoles": "gaming-consoles",
  spielkonsolen: "gaming-consoles",
  monitors: "notebooks-monitors",
  monitore: "notebooks-monitors",
  "smart home": "home-smart-home",
  "smart watches": "wearables-smartwatch",
  smartwatches: "wearables-smartwatch",
  "action cameras": "photo-action",
  "digital cameras": "photo-mirrorless",
  kameras: "photo-mirrorless",
  drones: "drones-quadcopters",
  drohnen: "drones-quadcopters",
  printers: "office-printers",
  drucker: "office-printers",
  "large appliances": "large-fridges-freezers",
  haushaltgeräte: "large-fridges-freezers",
  "kitchen appliances": "kitchen-coffee-machines",
  küchengeräte: "kitchen-coffee-machines",
  "vacuum cleaners": "cleaning-vacuums",
  staubsauger: "cleaning-vacuums",
};

function exactRules(...entries: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, SHARED_SWISS_EXACT, ...entries);
}

const SHARED_SWISS_PATTERNS: MerchantPatternRule[] = [
  { patterns: /\b(smartphone|iphone|galaxy s|pixel \d|handy)\b/i, subcategoryId: "mobile-smartphones" },
  { patterns: /\b(laptop|notebook|macbook|thinkpad)\b/i, subcategoryId: "notebooks-laptops" },
  { patterns: /\b(kopfhörer|headphone|earphone|headset)\b/i, subcategoryId: "audio-headphones" },
  { patterns: /\b(lautsprecher|speaker|soundbar)\b/i, subcategoryId: "audio-speakers" },
  { patterns: /\b(fernseher|television|\btv\b|oled tv)\b/i, subcategoryId: "tv-televisions" },
  { patterns: /\b(tablet|ipad)\b/i, subcategoryId: "notebooks-tablets-pc" },
  { patterns: /\b(playstation|xbox|nintendo switch)\b/i, subcategoryId: "gaming-consoles" },
  { patterns: /\b(monitor|bildschirm)\b/i, subcategoryId: "notebooks-monitors" },
  { patterns: /\b(maus|mouse|tastatur|keyboard)\b/i, subcategoryId: "peripherals-keyboard-mouse" },
  { patterns: /\b(webcam)\b/i, subcategoryId: "peripherals-webcam" },
  { patterns: /\b(ssd|festplatte|hard drive|storage)\b/i, subcategoryId: "peripherals-storage" },
  { patterns: /\b(graphics card|grafikkarte|gpu)\b/i, subcategoryId: "pc-gpu" },
  { patterns: /\b(waschmaschine|washing machine|tumble dryer|trockner)\b/i, subcategoryId: "large-washers-dryers" },
  { patterns: /\b(kühlschrank|refrigerator|freezer)\b/i, subcategoryId: "large-fridges-freezers" },
  { patterns: /\b(staubsauger|vacuum|robot vacuum)\b/i, subcategoryId: "cleaning-vacuums" },
  { patterns: /\b(kaffeemaschine|coffee machine)\b/i, subcategoryId: "kitchen-coffee-machines" },
];

/** Global pattern rules applied when merchant-specific rules miss. */
export const GLOBAL_CATEGORY_PATTERN_RULES: MerchantPatternRule[] = [
  { patterns: /\b(dslr|spiegelreflex|eos\s*\d+d|nikon d\d)/i, subcategoryId: "photo-dslr" },
  {
    patterns: /\b(mirrorless|systemkamera|eos r|alpha\s*[67]|nikon z\d|fujifilm x-)/i,
    subcategoryId: "photo-mirrorless",
  },
  { patterns: /\b(instax|polaroid|compact camera|point.?and.?shoot|sofortbild)/i, subcategoryId: "photo-compact" },
  { patterns: /\b(gopro|action cam|osmo action|insta360|action camera)/i, subcategoryId: "photo-action" },
  { patterns: /\b(objektiv|camera lens|zoom lens|prime lens|\b\d+mm f\/)/i, subcategoryId: "photo-lenses" },
  { patterns: /\b(drone battery|propeller|drone case)/i, subcategoryId: "drones-accessories" },
  { patterns: /\b(mavic|mini \d pro|quadcopter|\bfpv drone\b|dji air)/i, subcategoryId: "drones-quadcopters" },
  { patterns: /\b(ink|toner|cartridge|druckerpatrone)/i, subcategoryId: "office-ink-toner" },
  { patterns: /\b(printer|scanner|multifunction|drucker)/i, subcategoryId: "office-printers" },
  {
    patterns: /\b(office furniture|desk|chair|home office|büromöbel|ergonomic)/i,
    subcategoryId: "office-home",
  },
  { patterns: /\b(shredder|laminator|label printer|office tech)/i, subcategoryId: "office-tech" },
  ...SHARED_SWISS_PATTERNS,
];

export const MERCHANT_CATEGORY_RULES: Record<MappingMerchantId, MerchantCategoryRuleSet> = {
  "ch-brack": {
    exact: exactRules({
      "computer accessories": "peripherals-accessories",
      "pc-zubehör": "peripherals-accessories",
      "tv & audio": "tv-televisions",
      gaming: "gaming-consoles",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ch-digitec": {
    exact: exactRules({
      "mobile & smartphones": "mobile-smartphones",
      "notebooks & tablets": "notebooks-laptops",
      "pc & gaming": "gaming-consoles",
      "tv & home cinema": "tv-televisions",
      "photo & video": "photo-mirrorless",
      netzwerk: "networking-routers",
      netzwerke: "networking-routers",
      "smart home & living": "home-smart-home",
      "wearables & smartwatch": "wearables-smartwatch",
      "drone & rc": "drones-quadcopters",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ch-galaxus": {
    exact: exactRules({
      "mobile telephony": "mobile-smartphones",
      "it & electronics": "notebooks-laptops",
      "household & living": "cleaning-vacuums",
      "garden & diy": "diy-power-tools",
      "sport & outdoor": "sport-fitness-equipment",
      "baby & child": "baby-monitoring-feeding",
      "beauty & health": "care-shaving-hair-removal",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ch-interdiscount": {
    exact: exactRules({
      "tv & audio": "tv-televisions",
      "it & office": "notebooks-laptops",
      "photo & video": "photo-mirrorless",
      "gaming & entertainment": "gaming-consoles",
      "household appliances": "large-fridges-freezers",
      "kitchen & household": "kitchen-coffee-machines",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ch-fust": {
    exact: exactRules({
      "large household appliances": "large-fridges-freezers",
      "kitchen appliances": "kitchen-coffee-machines",
      "tv & audio": "tv-televisions",
      "computing & tablets": "notebooks-laptops",
      "photo & video": "photo-mirrorless",
      haushalt: "large-fridges-freezers",
    }),
    patterns: [
      ...SHARED_SWISS_PATTERNS,
      { patterns: /\b(geschirrspüler|dishwasher|herd|oven|backofen)\b/i, subcategoryId: "large-dishwashers" },
      { patterns: /\b(waschmaschine|trockner|washing|dryer)\b/i, subcategoryId: "large-washers-dryers" },
    ],
  },
  "ch-mediamarkt": {
    exact: exactRules({
      "smartphones & tablets": "mobile-smartphones",
      "tv & audio": "tv-televisions",
      "computers & office": "notebooks-laptops",
      "photo & camcorders": "photo-mirrorless",
      "gaming & vr": "gaming-consoles",
      "large appliances": "large-fridges-freezers",
      "small appliances": "kitchen-coffee-machines",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ro-scule365": {
    exact: exactRules({
      slefuitoare: "diy-power-tools",
      "scule electrice": "diy-power-tools",
      "scule de mana": "diy-hand-tools",
      "scule de mână": "diy-hand-tools",
      "echipamente de lucru": "diy-hand-tools",
      "pompe de apa": "garden-equipment",
      "pompe de apă": "garden-equipment",
      "pompe de stropit": "garden-equipment",
      drujbe: "diy-power-tools",
      generatoare: "diy-electrical",
      acumulatoare: "diy-batteries-chargers",
      incarcatoare: "diy-batteries-chargers",
      încărcătoare: "diy-batteries-chargers",
    }),
    patterns: [
      {
        patterns:
          /\b(slefuit|bormasin|bormașin|rotopercutor|drujb|polizor|flex|circular|electrice|power tool)\b/i,
        subcategoryId: "diy-power-tools",
      },
      {
        patterns: /\b(cheie|surubelnit|șurubelniț|ciocan|clește|cleste|set scule|hand tool)\b/i,
        subcategoryId: "diy-hand-tools",
      },
      {
        patterns: /\b(pompa|pompă|stropit|gradina|grădin|motocoas|cositoare)\b/i,
        subcategoryId: "garden-equipment",
      },
      {
        patterns: /\b(acumulator|baterie|incarcator|încărcător|akku)\b/i,
        subcategoryId: "diy-batteries-chargers",
      },
    ],
  },
  "ro-rowenta": {
    exact: exactRules({
      "aspiratoare verticale": "cleaning-vacuums",
      "aspiratoare cu abur": "cleaning-vacuums",
      aspiratoare: "cleaning-vacuums",
      "fiare de calcat": "laundry-ironing-sewing",
      "fiare de călcat": "laundry-ironing-sewing",
      "uscatoare de par": "care-hair-styling",
      "uscătoare de păr": "care-hair-styling",
      "aparate de gatit": "kitchen-cooking-appliances",
      "aparate de gătit": "kitchen-cooking-appliances",
    }),
    patterns: [
      {
        patterns: /\b(aspirator|vacuum|abur|steam)\b/i,
        subcategoryId: "cleaning-vacuums",
      },
      {
        patterns: /\b(calcat|călcat|steam iron|bügeleisen)\b/i,
        subcategoryId: "laundry-ironing-sewing",
      },
      {
        patterns: /\b(uscator|uscător|hair.?dryer|haartrockner|fen)\b/i,
        subcategoryId: "care-hair-styling",
      },
    ],
  },
};

export function normalizeMerchantCategory(raw?: string): string {
  return (raw ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function isMappingMerchantId(merchantId?: string): merchantId is MappingMerchantId {
  return Boolean(merchantId && MAPPING_MERCHANT_IDS.includes(merchantId as MappingMerchantId));
}

export function getMerchantExactMatch(
  merchantId: string | undefined,
  merchantCategory: string
): string | null {
  if (!isMappingMerchantId(merchantId)) return null;
  const key = normalizeMerchantCategory(merchantCategory);
  return MERCHANT_CATEGORY_RULES[merchantId].exact[key] ?? null;
}

export function getMerchantPatternMatch(
  merchantId: string | undefined,
  text: string
): string | null {
  if (!isMappingMerchantId(merchantId)) return null;
  for (const rule of MERCHANT_CATEGORY_RULES[merchantId].patterns) {
    if (rule.patterns.test(text)) return rule.subcategoryId;
  }
  return null;
}

export function getGlobalPatternMatch(text: string): string | null {
  for (const rule of GLOBAL_CATEGORY_PATTERN_RULES) {
    if (rule.patterns.test(text)) return rule.subcategoryId;
  }
  return null;
}

/** Validate rule sets at startup / in tests (B8). */
export function validateMerchantCategoryRules(): string[] {
  const errors: string[] = [];

  for (const merchantId of MAPPING_MERCHANT_IDS) {
    const ruleSet = MERCHANT_CATEGORY_RULES[merchantId];

    for (const [rawCategory, subcategoryId] of Object.entries(ruleSet.exact)) {
      if (subcategoryId === UNMAPPED_CATEGORY_ID) {
        errors.push(`${merchantId}: exact map "${rawCategory}" must not target unmapped`);
      }
      if (!VALID_LEAF_CATEGORY_IDS.has(subcategoryId)) {
        errors.push(
          `${merchantId}: exact map "${rawCategory}" → non-leaf or unknown category "${subcategoryId}"`
        );
      }
    }

    for (const rule of ruleSet.patterns) {
      if (!VALID_LEAF_CATEGORY_IDS.has(rule.subcategoryId)) {
        errors.push(
          `${merchantId}: pattern → non-leaf or unknown category "${rule.subcategoryId}"`
        );
      }
    }
  }

  for (const rule of GLOBAL_CATEGORY_PATTERN_RULES) {
    if (!VALID_LEAF_CATEGORY_IDS.has(rule.subcategoryId)) {
      errors.push(`global: pattern → non-leaf or unknown category "${rule.subcategoryId}"`);
    }
  }

  return errors;
}
