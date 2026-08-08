import {
  getParentCategoryId,
  SHOPPING_CATEGORIES,
  UNMAPPED_CATEGORY_ID,
  walkSubcategories,
} from "@/lib/categories";

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
  SHOPPING_CATEGORIES.flatMap((category) =>
    walkSubcategories(category.subcategories).map((sub) => sub.id)
  )
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
  return Object.assign({}, ...entries);
}

/** Swiss catalogues share a common exact-name baseline; RO merchants must not inherit it. */
function swissExactRules(...entries: Record<string, string>[]): Record<string, string> {
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
    // Do not match bare "desk"/"chair"/"ergonomic" — tools often say "maner ergonomic".
    patterns:
      /\b(office furniture|standing desk|home office|büromöbel|office chair|monitor arm)\b/i,
    subcategoryId: "office-home",
  },
  { patterns: /\b(shredder|laminator|label printer|office tech)/i, subcategoryId: "office-tech" },
  ...SHARED_SWISS_PATTERNS,
];

export const MERCHANT_CATEGORY_RULES: Record<MappingMerchantId, MerchantCategoryRuleSet> = {
  "ch-brack": {
    exact: swissExactRules({
      "computer accessories": "peripherals-accessories",
      "pc-zubehör": "peripherals-accessories",
      "tv & audio": "tv-televisions",
      gaming: "gaming-consoles",
    }),
    patterns: SHARED_SWISS_PATTERNS,
  },
  "ch-digitec": {
    exact: swissExactRules({
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
    exact: swissExactRules({
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
    exact: swissExactRules({
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
    exact: swissExactRules({
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
    exact: swissExactRules({
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
      slefuitoare: "diy-sanders",
      "scule electrice": "diy-power-tools",
      "scule de mana": "diy-hand-tools",
      "scule de mână": "diy-hand-tools",
      "echipamente de lucru": "diy-hand-tools",
      // Stay inside Bricolaj (diy-tools) — never Garden / Kitchen / Fashion.
      "pompe de apa": "diy-electrical",
      "pompe de apă": "diy-electrical",
      "pompe de stropit": "diy-electrical",
      drujbe: "diy-power-tools",
      generatoare: "diy-electrical",
      acumulatoare: "diy-batteries-chargers",
      incarcatoare: "diy-batteries-chargers",
      încărcătoare: "diy-batteries-chargers",
    }),
    // My Feeds CSV often omits category — match Romanian title/description text.
    // Order matters: tool types before battery packs (titles often say "cu/fara acumulator").
    patterns: [
      {
        patterns: /\b(slefuit|slefuitoare|masina de slefuit|mașină de slefuit)\b/i,
        subcategoryId: "diy-sanders",
      },
      {
        patterns:
          /\b(trafalet|pensul[aă]|pistol(?:\s+electric)?\s+(?:de\s+|pentru\s+)?vopsit|hvlp|aerograf|zugr[aă]vit)\b/i,
        subcategoryId: "diy-painting-tools",
      },
      {
        patterns:
          /\b(sudur[aă]|aparat\s+de\s+sudur|lipit\s+plastic|pistol\s+(?:pentru\s+)?lipit|pistol\s+lipit|aer\s+cald|hot\s+air)\b/i,
        subcategoryId: "diy-welding-soldering",
      },
      {
        patterns:
          /\b(pompa|pompă|pompe|stropit|gradina|grădin\w*|motocoas\w*|cositoare|tuns\s+iarb\w*|masina\s+tuns\s+iarb\w*|mașină\s+tuns\s+iarb\w*|submersibil|hidrofor|aspirator\s+umed|moara\s+de\s+cereale|batoz\w*)\b/i,
        subcategoryId: "diy-power-tools",
      },
      {
        patterns: /\b(generator|generatoare|invertor|compresor|stabilizator|redresor)\b/i,
        subcategoryId: "diy-electrical",
      },
      {
        patterns:
          /\b(bormasin|bormașin|rotopercutor|drujb|polizor|flex|circular|fierastrau|ferăstrău|unghiular|impact|brushless|ciocan\s+rotopercutor|demolator|picamer|masina de (?:gaurit|găurit|insurubat|înșurubat|frezat)|mașină de (?:găurit|înșurubat|frezat)|oberfreza|amestecator|placa compactoare|compactoare|taiat\s+gresie|aparat\s+de\s+taiat\s+gresie|dispozitiv\s+taiat\s+gresie)\b/i,
        subcategoryId: "diy-power-tools",
      },
      {
        patterns:
          /\b(telemetru|multimetru|nivel[aă]|dreptar|detector|manometru|termometru|roata\s+masura|rulet[aă])\b/i,
        subcategoryId: "diy-measuring",
      },
      {
        patterns:
          /\b(disc|burghie|burghiu|lama|lamă|lant|lanț|tarod|filiera|filer[aă]|bituri|prelungitor\s+bits|mandrina|panza\s+fierastrau|pânză)\b/i,
        subcategoryId: "diy-fasteners-consumables",
      },
      {
        // Prefix match: "Surubelnite" must hit "surubelnit" (JS \b is ASCII-word only).
        patterns:
          /\b(chei[ei]?|surubelnit\w*|șurubelniț\w*|clește|cleste|trus[aă]|patent|sfic|set\s+scule|hand\s+tool|extractor|port\s+tarod|port\s+filiera|menghin[aă]|foarfec\w*|dalt[aă]|dorn|presa\s+tip|presa\s+fixare|capsator|gresor|ventuz[aă]|capre\s+suport)\b/i,
        subcategoryId: "diy-hand-tools",
      },
      {
        patterns:
          /\b(bocanci|casca\s+protectie|cască\s+protecție|manusi\s+de\s+protectie|mănuși\s+de\s+protecție|ochelari\s+de\s+protectie|jacheta\s+confort|vest[aă]\s+reflectoriz|antifon|echipament\s+protectie|pelerin[aă]\s+de\s+ploaie)\b/i,
        subcategoryId: "diy-workwear-safety",
      },
      {
        // Standalone packs/chargers only — ignore "cu/fara acumulator" on tool titles.
        patterns:
          /(?<!cu\s)(?<!fara\s)(?<!fără\s)\b(acumulatori?|baterie|baterii)\b(?:\s+\d+\s*v|\s+\d+\s*ah|\s+li-?ion)?|\b(incarcator|încărcător|incarcatoare|încărcătoare)\b(?:\s+\d+\s*v)?/i,
        subcategoryId: "diy-batteries-chargers",
      },
      {
        patterns:
          /\b(scara|scară|troliu|electropalan|macara|cutie\s+(?:de\s+)?(?:depozitare|postala|poștală|scule)|drisca|drișcă|centura\s+pentru\s+scule|presa\s+rulmenti|antrenor|carota|spit\s+sds|tava\s+trafalet|butelie\s+gaz|aragaz\s+exterior)\b/i,
        subcategoryId: "diy-hand-tools",
      },
    ],
  },
  "ro-rowenta": {
    exact: exactRules({
      "aspiratoare verticale": "cleaning-stick-vacuums",
      "aspiratoare cu abur": "cleaning-wet-vacuums",
      "aspiratoare cu spalare": "cleaning-wet-vacuums",
      "aspiratoare cu spălare": "cleaning-wet-vacuums",
      "aspiratoare fără sac": "cleaning-bagless-vacuums",
      "aspiratoare fara sac": "cleaning-bagless-vacuums",
      "aspiratoare cu sac": "cleaning-bagged-vacuums",
      "aspiratoare de mână": "cleaning-handheld",
      "aspiratoare de mana": "cleaning-handheld",
      "aspiratoare robot": "cleaning-robots",
      aspiratoare: "cleaning-vacuums",
      "mopuri electrice": "cleaning-floor-care",
      // Accessories / promo packs: resolve via title patterns below (not forced into vacuums).
      "fiare de calcat": "laundry-ironing-sewing",
      "fiare de călcat": "laundry-ironing-sewing",
      "uscatoare de par": "care-hair-styling",
      "uscătoare de păr": "care-hair-styling",
      "plăci de păr și perii de îndreptat părul": "care-hair-styling",
      "placi de par si perii de indreptat parul": "care-hair-styling",
      "ondulatoare și aparate de coafat": "care-hair-styling",
      "ondulatoare si aparate de coafat": "care-hair-styling",
      "perii rotative": "care-hair-styling",
      "îngrijirea părului": "care-hair-styling",
      "ingrijirea parului": "care-hair-styling",
      "hair therapist": "care-hair-styling",
      "karl lagerfeld": "care-hair-styling",
      "aparate de tuns": "care-shaving-hair-removal",
      "aparate de tuns barba": "care-shaving-hair-removal",
      "aparate de tuns hibrid forever sharp": "care-shaving-hair-removal",
      "aparate de tuns multifuncționale": "care-shaving-hair-removal",
      "aparate de tuns multifunctionale": "care-shaving-hair-removal",
      "ingrijire ten si corp": "care-shaving-hair-removal",
      "îngrijire ten și corp": "care-shaving-hair-removal",
      epilatoare: "care-shaving-hair-removal",
      aeroterme: "climate-heating",
      "filtrare aer": "climate-air-care",
      "aparate de gatit": "kitchen-cooking-appliances",
      "aparate de gătit": "kitchen-cooking-appliances",
    }),
    patterns: [
      {
        patterns: /\b(robot|x-plorer|explorer)\b/i,
        subcategoryId: "cleaning-robots",
      },
      {
        patterns: /\b(mop|steam cleaner|pardoseal)\b/i,
        subcategoryId: "cleaning-floor-care",
      },
      {
        patterns: /\b(filtru|sac\b|accesoriu|accesorii|perie aspirator|burete filtru)\b/i,
        subcategoryId: "cleaning-accessories",
      },
      {
        patterns: /\b(vertical|stick|cordless vacuum|x-force|rh\d)\b/i,
        subcategoryId: "cleaning-stick-vacuums",
      },
      {
        patterns: /\b(fără sac|fara sac|bagless|silence force|ro\d{4})\b/i,
        subcategoryId: "cleaning-bagless-vacuums",
      },
      {
        patterns: /\b(cu sac|bagged)\b/i,
        subcategoryId: "cleaning-bagged-vacuums",
      },
      {
        patterns: /\b(sp[aă]lare|wash|abur|steam vacuum|wet)\b/i,
        subcategoryId: "cleaning-wet-vacuums",
      },
      {
        patterns: /\b(de m[aâ]n[aă]|handheld|hand vac)\b/i,
        subcategoryId: "cleaning-handheld",
      },
      {
        patterns: /\b(aspirator|vacuum)\b/i,
        subcategoryId: "cleaning-vacuums",
      },
      {
        patterns: /\b(calcat|călcat|steam iron|bügeleisen)\b/i,
        subcategoryId: "laundry-ironing-sewing",
      },
      {
        patterns:
          /\b(uscator|uscător|hair.?dryer|haartrockner|fen|ondulat|placa de par|placă de păr|perie rotativ|coafat|hair therapist)\b/i,
        subcategoryId: "care-hair-styling",
      },
      {
        patterns: /\b(tuns|trimmer|epilat|barba|barbă|ras)\b/i,
        subcategoryId: "care-shaving-hair-removal",
      },
      {
        patterns: /\b(aeroterm|heater|radiator|incalzitor|încălzitor)\b/i,
        subcategoryId: "climate-heating",
      },
      {
        patterns: /\b(purificator|filtrare aer|humidifier|dehumidifier|intense pure)\b/i,
        subcategoryId: "climate-air-care",
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

/**
 * Last-resort leaf when a merchant catalogue is known DIY/tools but feed rows
 * lack category labels and keyword inference failed.
 */
export function getMerchantDefaultCategory(merchantId: string | undefined): string | null {
  if (merchantId === "ro-scule365") return "diy-hand-tools";
  if (merchantId === "ro-rowenta") return "cleaning-vacuums";
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

    if (merchantId === "ro-scule365") {
      const targets = [
        ...Object.values(ruleSet.exact),
        ...ruleSet.patterns.map((rule) => rule.subcategoryId),
      ];
      for (const subcategoryId of targets) {
        if (getParentCategoryId(subcategoryId) !== "diy-tools") {
          errors.push(
            `${merchantId}: "${subcategoryId}" must stay under diy-tools (Bricolaj)`
          );
        }
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
