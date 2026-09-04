import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Car,
  Flower2,
  Hammer,
  Home,
  Shirt,
  Smartphone,
} from "lucide-react";
import {
  ALL_CATEGORIES_ID,
  getSubcategoryById,
  isCollectionFilter,
  resolveCategoryAlias,
} from "@/lib/categories";
import type { CountryCode } from "@/types";

/**
 * Top-level market hubs for browse (search menu + flyout).
 * Each hub aggregates existing product-type leaf IDs.
 */
export interface MarketHubTab {
  id: string;
  icon: LucideIcon;
  /** Leaf product.category values that belong to this hub */
  leafIds: readonly string[];
}

/**
 * Legacy sticky hub that used to be the homepage default.
 * Never restore this from the URL on landing — it is empty on CH and looked like a blank site.
 */
export const DEFAULT_MARKET_HUB_ID = "hub-electronics";

/** Homepage / market switch always starts on All (full catalogue). */
export const LANDING_CATEGORY_ID = "all";

/**
 * First paint / market switch: always show the full catalogue (All).
 * Do not auto-select Electronics or any other hub.
 */
export function defaultMarketHubForCountry(_countryCode: CountryCode | string): string {
  return LANDING_CATEGORY_ID;
}

/** True when a URL category should be ignored so landing stays on All. */
export function shouldIgnoreLandingCategory(categoryId: string | null | undefined): boolean {
  if (!categoryId || categoryId === LANDING_CATEGORY_ID) return true;
  return false;
}

/** Prefer live inventory hubs first per market. */
export function marketHubOrderForCountry(countryCode: CountryCode | string): readonly string[] {
  // RO: live electronics (evoMAG), DIY (Scule365), and Home (Rowenta/Aqualine).
  if (countryCode === "RO") {
    return [
      "hub-electronics",
      "hub-diy",
      "hub-home",
      "hub-auto",
      "hub-fashion",
      "hub-garden",
      "hub-books",
    ];
  }
  // CH: Fashion first (Belando beauty + baby-walz). Auto (Reifen) next.
  if (countryCode === "CH") {
    return [
      "hub-fashion",
      "hub-auto",
      "hub-diy",
      "hub-electronics",
      "hub-home",
      "hub-garden",
      "hub-books",
    ];
  }
  // DE: Auto (Reifen.de) first.
  if (countryCode === "DE") {
    return [
      "hub-auto",
      "hub-electronics",
      "hub-home",
      "hub-fashion",
      "hub-diy",
      "hub-garden",
      "hub-books",
    ];
  }
  return [
    "hub-electronics",
    "hub-home",
    "hub-fashion",
    "hub-auto",
    "hub-diy",
    "hub-garden",
    "hub-books",
  ];
}

export const MARKET_HUB_TABS: readonly MarketHubTab[] = [
  {
    id: "hub-electronics",
    icon: Smartphone,
    leafIds: [
      "mobile-smartphones",
      "mobile-tablets",
      "mobile-accessories",
      "mobile-feature-phones",
      "mobile-fixed-line",
      "mobile-navigation-radio",
      "wearables-smartwatch",
      "wearables-fitness",
      "wearables-accessories",
      "notebooks-laptops",
      "notebooks-desktops",
      "notebooks-monitors",
      "notebooks-tablets-pc",
      "computers-ereaders",
      "computers-docks",
      "peripherals-keyboard-mouse",
      "peripherals-webcam",
      "peripherals-storage",
      "peripherals-accessories",
      "pc-gpu",
      "pc-cpu",
      "pc-ram-ssd",
      "pc-motherboard",
      "pc-cooling",
      "pc-power-supplies",
      "pc-cases",
      "software-os",
      "software-security",
      "software-creative",
      "software-office",
      "software-utilities",
      "digital-gift-cards",
      "tv-televisions",
      "tv-projectors",
      "tv-streaming",
      "tv-mounts",
      "tv-screens",
      "tv-home-cinema-systems",
      "audio-headphones",
      "audio-speakers",
      "audio-wireless",
      "audio-hifi",
      "audio-portable",
      "audio-car",
      "audio-studio",
      "audio-accessories",
      "gaming-consoles",
      "gaming-vr",
      "gaming-pc-handheld",
      "gaming-accessories",
      "gaming-games",
      "gaming-simulation",
      "gaming-furniture",
      "photo-mirrorless",
      "photo-dslr",
      "photo-compact",
      "photo-lenses",
      "photo-action",
      "photo-video-cameras",
      "photo-flashes",
      "photo-studio-lighting",
      "photo-batteries",
      "photo-memory",
      "photo-tripods",
      "photo-gimbals",
      "photo-bags",
      "photo-filters",
      "photo-microphones",
      "photo-remote",
      "photo-mounts",
      "photo-cleaning",
      "photo-cables",
      "photo-binoculars",
      "drones-quadcopters",
      "drones-accessories",
      "drones-rc",
      "drones-gadgets",
      "networking-routers",
      "networking-switches",
      "networking-nas",
      "networking-cables",
      "home-smart-home",
      "smart-home-lighting",
      "smart-home-security",
      "smart-home-climate",
      "office-printers",
      "office-ink-toner",
      "office-home",
      "office-tech",
    ],
  },
  {
    id: "hub-home",
    icon: Home,
    leafIds: [
      "large-fridges-freezers",
      "large-washers-dryers",
      "large-dishwashers",
      "large-ovens-hobs",
      "large-built-in",
      "large-wine-coolers",
      "cleaning-vacuums",
      "cleaning-stick-vacuums",
      "cleaning-bagless-vacuums",
      "cleaning-bagged-vacuums",
      "cleaning-wet-vacuums",
      "cleaning-handheld",
      "cleaning-accessories",
      "cleaning-robots",
      "cleaning-floor-care",
      "climate-cooling",
      "climate-heating",
      "climate-air-care",
      "laundry-ironing-sewing",
      "care-shaving-hair-removal",
      "care-hair-styling",
      "care-oral",
      "kitchen-coffee-machines",
      "kitchen-machines-mixers",
      "kitchen-cooking-appliances",
      "kitchen-microwaves",
      "kitchen-breakfast",
      "kitchen-water-treatment",
      "furniture-kitchen",
      "furniture-bedroom",
      "furniture-beds",
      "furniture-living",
      "furniture-dining",
      "furniture-chairs",
      "furniture-office",
      "furniture-storage",
      "furniture-outdoor",
      "textiles-curtains",
      "textiles-table-linen",
      "textiles-towels",
      "textiles-pillows",
      "textiles-pillowcases",
      "textiles-bedding",
      "textiles-rugs",
    ],
  },
  {
    id: "hub-books",
    icon: BookOpen,
    leafIds: [
      "office-group-stationery",
      "office-stationery-notebooks",
      "office-stationery-folders",
      "office-stationery-paper",
      "office-stationery-writing",
      "office-stationery-desk",
      "office-stationery-school",
      "office-group-books",
      "media-books",
      "media-audiobooks",
      "office-group-media",
      "media-films",
      "media-music",
    ],
  },
  {
    id: "hub-fashion",
    icon: Shirt,
    leafIds: [
      "fashion-beauty-hair-care",
      "fashion-beauty-cosmetics",
      "fashion-beauty-fragrance",
      "fashion-women",
      "fashion-women-dresses",
      "fashion-women-tops",
      "fashion-women-bottoms",
      "fashion-women-outerwear",
      "fashion-women-activewear",
      "fashion-men",
      "fashion-men-shirts",
      "fashion-men-pants",
      "fashion-men-outerwear",
      "fashion-men-activewear",
      "fashion-kids",
      "fashion-kids-girls",
      "fashion-kids-boys",
      "fashion-kids-baby",
      "fashion-apparel",
      "fashion-shoes",
      "fashion-shoes-women",
      "fashion-shoes-sneakers",
      "fashion-shoes-boots",
      "fashion-shoes-sandals",
      "fashion-shoes-formal",
      "fashion-shoes-sport",
      "fashion-shoes-home",
      "fashion-shoes-men",
      "fashion-shoes-men-sneakers",
      "fashion-shoes-men-boots",
      "fashion-shoes-men-sandals",
      "fashion-shoes-men-formal",
      "fashion-shoes-men-sport",
      "fashion-shoes-men-home",
      "fashion-shoes-kids",
      "fashion-shoes-kids-sneakers",
      "fashion-shoes-kids-boots",
      "fashion-shoes-kids-sandals",
      "fashion-shoes-kids-sport",
      "fashion-shoes-kids-school",
      "fashion-socks",
      "fashion-underwear",
      "fashion-bags",
      "fashion-accessories",
      "health-monitors-scales",
      "health-massage-recovery",
      "baby-monitoring-feeding",
      "baby-strollers-travel",
      "baby-car-seats",
      "baby-nursery",
      "toys-rc-models",
      "toys-building-sets",
      "toys-electronic",
      "toys-board-games",
      "hobby-creative",
      "toys-accessories",
    ],
  },
  {
    id: "hub-garden",
    icon: Flower2,
    leafIds: [
      "garden-equipment",
      "garden-lawn-care",
      "garden-irrigation",
      "garden-plants-pots",
      "garden-outdoor-living",
      "garden-storage",
      "garden-grills",
    ],
  },
  {
    id: "hub-diy",
    icon: Hammer,
    leafIds: [
      "diy-power-tools",
      "diy-sanders",
      "diy-painting-tools",
      "diy-welding-soldering",
      "diy-hand-tools",
      "diy-electrical",
      "diy-batteries-chargers",
      "diy-measuring",
      "diy-workwear-safety",
      "diy-fasteners-consumables",
    ],
  },
  {
    id: "hub-auto",
    icon: Car,
    leafIds: [
      "auto-tires-wheels",
      "auto-rims",
      "auto-motorcycle-tires",
      "auto-complete-wheels",
      "auto-batteries",
      "auto-oils-fluids",
      "auto-lighting",
      "auto-filters-brakes",
      "auto-interior-care",
      "auto-tools-chargers",
    ],
  },
] as const;

export const MARKET_HUB_LEAF_GROUPS: Record<string, readonly string[]> = Object.fromEntries(
  MARKET_HUB_TABS.map((hub) => [hub.id, hub.leafIds])
);

/** Occupied canonical leaves that are not represented by any compact market hub. */
export function occupiedLeavesOutsideMarketHubs(
  categoryCounts: Record<string, number>
): Array<{ id: string; count: number }> {
  const groupedLeaves = new Set(MARKET_HUB_TABS.flatMap((hub) => hub.leafIds));
  const ungrouped = new Map<string, number>();

  for (const [categoryId, count] of Object.entries(categoryCounts)) {
    if (count <= 0) continue;
    const canonicalId = resolveCategoryAlias(categoryId);
    if (!getSubcategoryById(canonicalId) || groupedLeaves.has(canonicalId)) continue;
    ungrouped.set(canonicalId, Math.max(count, ungrouped.get(canonicalId) ?? 0));
  }

  return [...ungrouped].map(([id, count]) => ({ id, count }));
}

export function isMarketHubId(categoryId: string): boolean {
  return categoryId in MARKET_HUB_LEAF_GROUPS;
}

/**
 * Whether this browse selection currently has in-stock offers.
 * Unknown counts return true so we do not bounce before inventory is loaded.
 */
export function selectionHasCatalogOffers(
  categoryId: string | null | undefined,
  categoryCounts: Record<string, number> | undefined
): boolean {
  if (!categoryId || categoryId === ALL_CATEGORIES_ID || categoryId === LANDING_CATEGORY_ID) {
    return true;
  }
  if (isCollectionFilter(categoryId)) return true;
  if (!categoryCounts || Object.keys(categoryCounts).length === 0) return true;
  if (isMarketHubId(categoryId)) {
    const leaves = MARKET_HUB_LEAF_GROUPS[categoryId] ?? [];
    return leaves.some((leafId) => (categoryCounts[leafId] ?? 0) > 0);
  }
  if ((categoryCounts[categoryId] ?? 0) > 0) return true;
  const alias = resolveCategoryAlias(categoryId);
  if (alias && (categoryCounts[alias] ?? 0) > 0) return true;

  // Cross-category inventory aliases across merchants:
  if (categoryId === "auto-rims" && (categoryCounts["auto-complete-wheels"] ?? 0) > 0) return true;
  if (categoryId === "auto-complete-wheels" && (categoryCounts["auto-rims"] ?? 0) > 0) return true;
  if (
    (categoryId === "fashion-beauty-hair-care" || categoryId === "care-hair-styling") &&
    ((categoryCounts["fashion-beauty-hair-care"] ?? 0) > 0 ||
      (categoryCounts["care-hair-styling"] ?? 0) > 0 ||
      (categoryCounts["fashion-beauty-cosmetics"] ?? 0) > 0)
  ) {
    return true;
  }
  if (
    (categoryId === "cleaning-vacuums" || categoryId === "cleaning-stick-vacuums") &&
    ((categoryCounts["cleaning-vacuums"] ?? 0) > 0 ||
      (categoryCounts["cleaning-stick-vacuums"] ?? 0) > 0)
  ) {
    return true;
  }
  if (
    categoryId === "diy-hand-tools" &&
    ((categoryCounts["diy-hand-tools"] ?? 0) > 0 || (categoryCounts["diy-power-tools"] ?? 0) > 0)
  ) {
    return true;
  }
  return false;
}

/**
 * Browse selection to actually fetch/render. Empty aisles fall back to All
 * once the market has products, so first paint never shows a zero-offer card.
 */
export function resolveOccupiedBrowseCategory(
  categoryId: string | null | undefined,
  categoryCounts: Record<string, number> | undefined,
  marketProductCount: number
): string {
  const selected = categoryId || ALL_CATEGORIES_ID;
  if (!selected || selected === ALL_CATEGORIES_ID || selected === LANDING_CATEGORY_ID) {
    return ALL_CATEGORIES_ID;
  }
  if (isCollectionFilter(selected)) return selected;
  if (marketProductCount <= 0) return selected;
  // If categoryCounts is not yet loaded or empty, allow the selected category to load
  if (!categoryCounts || Object.keys(categoryCounts).length === 0) return selected;
  if (selectionHasCatalogOffers(selected, categoryCounts)) return selected;
  return ALL_CATEGORIES_ID;
}

export function getMarketHubById(categoryId: string): MarketHubTab | undefined {
  return MARKET_HUB_TABS.find((hub) => hub.id === categoryId);
}

/** Resolve which sticky hub contains a product leaf category. */
export function getMarketHubIdForLeaf(leafCategoryId: string): string | undefined {
  for (const hub of MARKET_HUB_TABS) {
    if (hub.leafIds.includes(leafCategoryId)) return hub.id;
  }
  return undefined;
}
