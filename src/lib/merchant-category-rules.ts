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
  "ro-evomag",
  "gb-seentat",
  "us-ottocast",
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
      // Climate / ironing stay in the Rowenta appliance aisle; kitchen does not.
      aeroterme: "climate-heating",
      "filtrare aer": "climate-air-care",
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
  "ro-evomag": {
    // Exact names from live My Feeds CSV (`category` column), normalized lowercase.
    exact: exactRules({
      "huse telefoane": "mobile-accessories",
      "folii protectie telefoane": "mobile-accessories",
      "folii protectie tablete": "mobile-accessories",
      "huse tablete": "mobile-accessories",
      "incarcatoare": "mobile-accessories",
      "incarcator laptop": "mobile-accessories",
      "acumulatori externi": "mobile-accessories",
      "suport auto pentru telefon, universal sau popsocket": "mobile-accessories",
      telefoane: "mobile-smartphones",
      "telefoane seniori": "mobile-smartphones",
      tablete: "mobile-tablets",
      "extendere wi-fi": "networking-routers",
      "adaptoare wireless": "networking-routers",
      "camere supraveghere video pentru interior": "smart-home-security",
      "senzori si detectoare": "smart-home-security",
      "network video recorder (nvr)": "smart-home-security",
      "tablete grafice": "peripherals-accessories",
      "sisteme etichetare": "office-printers",
      "licente digitale": "software-os",
      "boxe pc pentru gaming si muzica": "audio-speakers",
      "casti alergare/sport - wireless si cu fir": "audio-headphones",
      "aspiratoare robot": "cleaning-robots",
      "selfie stick": "mobile-accessories",
      "dispozitiv navigatie": "mobile-navigation-radio",
      "imprimante foto": "photo-compact",
      "telefoane voip": "office-tech",
      "stylus pen": "mobile-accessories",
      "statii incarcare electrice": "diy-electrical",
      "monitoare led": "notebooks-monitors",
      "accesorii monitoare": "notebooks-monitors",
      "laptopuri / notebook": "notebooks-laptops",
      "laptopuri refurbished": "notebooks-laptops",
      "laptopuri 2 in 1": "notebooks-laptops",
      // Bags / batteries / stands are accessories — keep them out of the laptop aisle.
      "genti si huse laptop": "peripherals-accessories",
      "rucsacuri si ghiozdane laptop": "peripherals-accessories",
      "huse laptop": "peripherals-accessories",
      "baterii si acumulatori laptop": "peripherals-accessories",
      "tastaturi laptop": "peripherals-keyboard-mouse",
      "cooler-stand laptop": "computers-docks",
      "componente laptop": "peripherals-accessories",
      "calculatoare refurbished": "notebooks-desktops",
      televizoare: "tv-televisions",
      "suporturi tv": "tv-televisions",
      "cabluri de date": "networking-cables",
      cabluri: "networking-cables",
      "cabluri hdmi": "networking-cables",
      "cabluri audio-video": "audio-accessories",
      adaptori: "networking-cables",
      tonere: "office-ink-toner",
      cartuse: "office-ink-toner",
      "alte consumabile": "office-ink-toner",
      multifunctionale: "office-printers",
      "mouse pc / gaming": "peripherals-keyboard-mouse",
      "tastaturi pc": "peripherals-keyboard-mouse",
      "mouse pad": "peripherals-keyboard-mouse",
      periferice: "peripherals-accessories",
      "hub usb": "peripherals-accessories",
      "stick usb": "peripherals-storage",
      "carduri memorie": "peripherals-storage",
      "hard disk extern": "peripherals-storage",
      "solid-state drive (ssd)": "pc-ram-ssd",
      memorii: "pc-ram-ssd",
      "memorii ram laptop": "pc-ram-ssd",
      "placi de baza": "pc-motherboard",
      carcase: "pc-motherboard",
      "surse de alimentare pc": "pc-motherboard",
      "coolere cpu": "pc-cooling",
      "placi video": "pc-gpu",
      "switch-uri": "networking-switches",
      "diverse retea": "networking-cables",
      "routere wireless": "networking-routers",
      ups: "diy-electrical",
      "prelungitoare & prize": "diy-electrical",
      "casti bluetooth, wireless, airpods si audio": "audio-headphones",
      "casti - microfoane": "audio-headphones",
      "boxe portabile cu bluetooth": "audio-speakers",
      "curea smartwatch": "wearables-accessories",
      "huse smartwatch": "wearables-accessories",
      smartwatch: "wearables-smartwatch",
      "trusa chei & unelte": "diy-hand-tools",
      "unelte de gradina": "garden-equipment",
      "unelte de taiat": "diy-hand-tools",
      "masina de gaurit si insurubat": "diy-power-tools",
      "accesorii masina de gaurit": "diy-fasteners-consumables",
      "accesorii scule electrice": "diy-fasteners-consumables",
      "geanta scule": "diy-hand-tools",
      "instrumente de masura": "diy-measuring",
      "camere supraveghere video pentru exterior": "smart-home-security",
      "accesorii supraveghere video": "smart-home-security",
      "accesorii casa inteligenta": "home-smart-home",
      figurine: "toys-accessories",
      masinute: "toys-electronic",
      puzzle: "toys-board-games",
      papusi: "toys-accessories",
      "jucarii de plus": "toys-accessories",
      "jocuri de societate": "toys-board-games",
      "jucarii bebelusi": "toys-electronic",
      "jucarii de rol": "toys-accessories",
      "jocuri educative": "toys-board-games",
      "jocuri de constructii": "toys-building-sets",
      "jocuri video - pc si consola": "gaming-games",
      controllere: "gaming-accessories",
      "alte accesorii console": "gaming-accessories",
      "scaune gaming": "gaming-accessories",
      "trotinete electrice adulti & copii": "mobility-escooters",
      "trotinete si triciclete": "mobility-escooters",
      "accesorii vehicule electrice": "mobility-accessories",
      // Parts must not fill the scooter / bike aisles.
      "piese trotinete electrice": "mobility-accessories",
      "piese biciclete si accesorii": "mobility-accessories",
      "accesorii transport": "mobility-accessories",
      "utile in bucatarie": "kitchen-breakfast",
      "fierbatoare apa": "kitchen-breakfast",
      "blendere si tocatoare": "kitchen-machines-mixers",
      mixere: "kitchen-machines-mixers",
      friteuze: "kitchen-cooking-appliances",
      "aparate si espressoare de cafea automate si manuale": "kitchen-coffee-machines",
      "hote de bucatarie - clasice, incorporabile sau decorative": "large-ovens-hobs",
      "plite incorporabile": "large-ovens-hobs",
      "cuptoare incorporabile": "large-ovens-hobs",
      "masini de spalat rufe": "large-washers-dryers",
      "aparate de aer conditionat": "climate-cooling",
      ventilatoare: "climate-cooling",
      "aspiratoare verticale": "cleaning-stick-vacuums",
      "accesorii si componente aspiratoare": "cleaning-accessories",
      "fiare de calcat": "laundry-ironing-sewing",
      "uscatoare de par": "care-hair-styling",
      "periute de dinti electrice": "care-oral",
      "articole hranire bebelusi": "baby-monitoring-feeding",
      suzete: "baby-monitoring-feeding",
      "scaune auto copii si inaltatoare": "baby-monitoring-feeding",
      carucioare: "baby-monitoring-feeding",
      "lenjerie patut bebe": "baby-monitoring-feeding",
      covoare: "textiles-rugs",
      "iluminat interior": "home-smart-home",
      "alte accesorii": "peripherals-accessories",
      "alte accesorii servere": "peripherals-accessories",
      "acumulatori foto": "photo-compact",
      "ghiozdane&rucsacuri": "office-stationery-school",
      "recipiente pentru calatorie": "baby-monitoring-feeding",
      // Additional live aisle labels frequently left unmapped
      "procesatoare": "pc-cpu",
      procesoare: "pc-cpu",
      "procesoare laptop": "pc-cpu",
      "placi de sunet": "peripherals-accessories",
      "unitati optice": "peripherals-storage",
      "servere rack": "notebooks-desktops",
      // evoMAG Sisteme PC category feed aisle labels
      branduri: "notebooks-desktops", // feed aisle of complete PC/Mini PC systems
      "hdd server": "pc-ram-ssd",
      "memorii server": "pc-ram-ssd",
      "procesoare server": "pc-cpu",
      servere: "notebooks-desktops",
      "surse server": "pc-motherboard",
      "nas (network attached storage)": "networking-nas",
      "sisteme desktop": "notebooks-desktops",
      "mini pc": "notebooks-desktops",
      "all in one": "notebooks-desktops",
      "videoproiectoare": "tv-projectors",
      // evoMAG VIDEO category feed (351 SKUs) aisle labels
      "camere video": "photo-video-cameras",
      "ecrane de proiectie": "tv-screens",
      "sisteme supraveghere video": "smart-home-security",
      "accesorii tv": "tv-mounts",
      "soundbar": "audio-speakers",
      "casti gaming": "audio-headphones",
      "microfoane": "audio-studio",
      "webcam": "peripherals-webcam",
      "camere web": "peripherals-webcam",
      "imprimante laser": "office-printers",
      "imprimante inkjet": "office-printers",
      "scanere": "office-printers",
      "frigider": "large-fridges-freezers",
      frigidere: "large-fridges-freezers",
      "congelatoare": "large-fridges-freezers",
      "masini de spalat vase": "large-dishwashers",
      "uscatoare rufe": "large-washers-dryers",
      "aparate de gatit": "kitchen-cooking-appliances",
      "cuptoare cu microunde": "kitchen-microwaves",
      "espressoare": "kitchen-coffee-machines",
      "roboti de bucatarie": "kitchen-machines-mixers",
      "aparate de ras": "care-shaving-hair-removal",
      "epilatoare": "care-shaving-hair-removal",
      "placi de indreptat parul": "care-hair-styling",
      "ondulatoare": "care-hair-styling",
      "statii meteo": "home-smart-home",
      "becuri smart": "smart-home-lighting",
      "prize smart": "home-smart-home",
      "hard disk intern": "pc-ram-ssd",
      "ssd m.2": "pc-ram-ssd",
      "casti over-ear": "audio-headphones",
      "casti in-ear": "audio-headphones",
      "boxe bluetooth": "audio-speakers",
      "tablete android": "mobile-tablets",
      "tablete ipad": "mobile-tablets",
      "telefoane second hand": "mobile-smartphones",
      "telefoane refurbished": "mobile-smartphones",
    }),
    patterns: [
      // Order matters: accessories / networking before phone model names.
      {
        patterns:
          /\b(husa|folie\s+protectie|book\s*cover|carcasa|capac\s+spate|protectie\s+(spate|toc)|clear\s+cover|leather\s+sleeve|powerbank|incarcator\s+(telefon|usb|wireless)|selfie\s+stick|stylus)\b/i,
        subcategoryId: "mobile-accessories",
      },
      { patterns: /\b(range\s+extender|wifi\s+extender|extender\s+wireless)\b/i, subcategoryId: "networking-routers" },
      { patterns: /\b(router\s+wireless|router\s+wifi|mesh\s+wifi)\b/i, subcategoryId: "networking-routers" },
      {
        patterns:
          /\b(geanta\s+laptop|husa\s+laptop|rucsac\s+laptop|baterie\s+laptop|cooler\s+laptop|stand\s+laptop|acumulatori?\s+laptop)\b/i,
        subcategoryId: "peripherals-accessories",
      },
      { patterns: /\b(laptop|notebook|macbook)\b/i, subcategoryId: "notebooks-laptops" },
      {
        // Handset titles only. No bare "smartphone" (matches "smartphone app" on robots).
        patterns:
          /\b((smart\s*)?telefon\s+mobil|iphone\s*\d{1,2}|samsung\s+galaxy\s+(a|s|z|m|f|xcover|note)\s*\d{1,2})\b/i,
        subcategoryId: "mobile-smartphones",
      },
      { patterns: /\b(monitor\s+led|monitor\s+lcd|ultrawide)\b/i, subcategoryId: "notebooks-monitors" },
      { patterns: /\b(televizor|smart\s*tv|oled\s*tv)\b/i, subcategoryId: "tv-televisions" },
      { patterns: /\b(playstation|xbox\s*series|nintendo\s+switch)\b/i, subcategoryId: "gaming-consoles" },
      {
        patterns:
          /\b(piese\s+trotinet|piese\s+biciclet|pentru\s+trotinet|accesorii\s+(trotinet|biciclet|vehicule\s+electrice))\b/i,
        subcategoryId: "mobility-accessories",
      },
      {
        patterns: /\b(trotinet[aă]\s+electric|hoverboard|biciclet[aă]\s+electric)\b/i,
        subcategoryId: "mobility-escooters",
      },
      { patterns: /\b(aer\s+conditionat|aparat\s+aer\s+condiționat)\b/i, subcategoryId: "climate-cooling" },
    ],
  },

  /**
   * Seentat UK — small AWIN catalogue (~800 SKUs). Prefer merchant_category aisles;
   * also accept AWIN taxonomy category_name strings from the same feed.
   */
  "gb-seentat": {
    exact: exactRules({
      // merchant_category
      camera: "photo-compact",
      lens: "photo-lenses",
      "camera accessories": "photo-bags",
      "action camera": "photo-action",
      mobile: "mobile-smartphones",
      "mobile others": "mobile-accessories",
      tablet: "mobile-tablets",
      smartwatch: "wearables-smartwatch",
      watch: "wearables-smartwatch",
      laptop: "notebooks-laptops",
      computer: "notebooks-desktops",
      headphone: "audio-headphones",
      earbuds: "audio-headphones",
      speaker: "audio-speakers",
      audio: "audio-speakers",
      player: "audio-portable",
      gaming: "gaming-accessories",
      oculus: "gaming-vr",
      steam: "gaming-games",
      accessory: "mobile-accessories",
      apple: "mobile-accessories",
      "personal care": "care-hair-styling",
      dji: "drones-quadcopters",
      insta360: "photo-action",
      // AWIN category_name
      cameras: "photo-compact",
      "optical devices": "photo-lenses",
      "mobile phones": "mobile-smartphones",
      laptops: "notebooks-laptops",
      computers: "notebooks-desktops",
      "electronic gadgets": "wearables-smartwatch",
      "men's watches": "wearables-smartwatch",
      "bodycare appliances": "care-hair-styling",
      console: "gaming-consoles",
      accessories: "mobile-accessories",
      headphones: "audio-headphones",
      "audio equipment": "audio-speakers",
      "mobile phone accessories": "mobile-accessories",
      "portable audio": "audio-portable",
      "mp3 players": "audio-portable",
    }),
    patterns: [
      { patterns: /\b(iphone|galaxy\s+[asmz]\d|pixel\s*\d|smartphone)\b/i, subcategoryId: "mobile-smartphones" },
      { patterns: /\b(ipad|galaxy\s+tab|tablet)\b/i, subcategoryId: "mobile-tablets" },
      { patterns: /\b(macbook|laptop|notebook)\b/i, subcategoryId: "notebooks-laptops" },
      { patterns: /\b(airpods|headphone|earbuds?|headset)\b/i, subcategoryId: "audio-headphones" },
      { patterns: /\b(lens|objektiv|\d+mm)\b/i, subcategoryId: "photo-lenses" },
      { patterns: /\b(camera|pixpro|mirrorless|dslr)\b/i, subcategoryId: "photo-compact" },
      { patterns: /\b(gopro|action\s+cam|insta360)\b/i, subcategoryId: "photo-action" },
      { patterns: /\b(playstation|xbox|nintendo|steam\s+deck)\b/i, subcategoryId: "gaming-consoles" },
    ],
  },

  /**
   * Ottocast US — small AWIN CarPlay / Android Auto catalogue (USD).
   * Feed aisle is typically "Automotive".
   */
  "us-ottocast": {
    exact: exactRules({
      automotive: "audio-car",
      "vehicles, parts and accessories": "audio-car",
      "car electronics": "audio-car",
    }),
    patterns: [
      {
        patterns: /\b(carplay|android\s+auto|aibox|ottocast|dash\s*cam|car\s+tv\s+mate|screenflow)\b/i,
        subcategoryId: "audio-car",
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
 * Rowenta catalogue: vacuums + accessories, hair styling / grooming,
 * plus core ironing & climate lines — never Fashion / DIY / Kitchen.
 */
export const ROWENTA_ALLOWED_CATEGORY_IDS = new Set([
  "cleaning-vacuums",
  "cleaning-stick-vacuums",
  "cleaning-bagless-vacuums",
  "cleaning-bagged-vacuums",
  "cleaning-wet-vacuums",
  "cleaning-handheld",
  "cleaning-accessories",
  "cleaning-robots",
  "cleaning-floor-care",
  "care-hair-styling",
  "care-shaving-hair-removal",
  "laundry-ironing-sewing",
  "climate-heating",
  "climate-air-care",
]);

export function isRowentaAllowedCategory(categoryId: string): boolean {
  return ROWENTA_ALLOWED_CATEGORY_IDS.has(categoryId);
}

/**
 * Last-resort leaf when a merchant catalogue is specialised but feed rows
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

    if (merchantId === "ro-scule365" || merchantId === "ro-rowenta") {
      const targets = [
        ...Object.values(ruleSet.exact),
        ...ruleSet.patterns.map((rule) => rule.subcategoryId),
      ];
      for (const subcategoryId of targets) {
        if (merchantId === "ro-scule365" && getParentCategoryId(subcategoryId) !== "diy-tools") {
          errors.push(
            `${merchantId}: "${subcategoryId}" must stay under diy-tools (Bricolaj)`
          );
        }
        if (merchantId === "ro-rowenta" && !isRowentaAllowedCategory(subcategoryId)) {
          errors.push(
            `${merchantId}: "${subcategoryId}" must stay in Rowenta vacuum/care aisle`
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
