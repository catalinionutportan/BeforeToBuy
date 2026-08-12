import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Flower2,
  Hammer,
  Home,
  Shirt,
  Smartphone,
} from "lucide-react";
import type { CountryCode } from "@/types";

/**
 * Top-level market hubs shown as sticky tabs.
 * Each hub aggregates existing product-type leaf IDs (or new fashion leaves).
 */
export interface MarketHubTab {
  id: string;
  icon: LucideIcon;
  /** Leaf product.category values that belong to this hub */
  leafIds: readonly string[];
}

export const DEFAULT_MARKET_HUB_ID = "hub-electronics";

/** Romania live catalogue is DIY + home appliances — start on All so nothing is hub-hidden. */
export function defaultMarketHubForCountry(countryCode: CountryCode | string): string {
  if (countryCode === "RO") return "all";
  return DEFAULT_MARKET_HUB_ID;
}

/** Prefer live RO hubs first so Rowenta (home) and Scule365 (DIY) are easy to find. */
export function marketHubOrderForCountry(countryCode: CountryCode | string): readonly string[] {
  // Usage order: electronics → home/appliances → fashion → DIY → garden (books last).
  // RO keeps live home/DIY early so Rowenta + Scule365 stay easy to find.
  if (countryCode === "RO") {
    return ["hub-home", "hub-diy", "hub-electronics", "hub-fashion", "hub-garden", "hub-books"];
  }
  return ["hub-electronics", "hub-home", "hub-fashion", "hub-diy", "hub-garden", "hub-books"];
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
] as const;

export const MARKET_HUB_LEAF_GROUPS: Record<string, readonly string[]> = Object.fromEntries(
  MARKET_HUB_TABS.map((hub) => [hub.id, hub.leafIds])
);

export function isMarketHubId(categoryId: string): boolean {
  return categoryId in MARKET_HUB_LEAF_GROUPS;
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
