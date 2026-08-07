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
  if (countryCode === "RO") {
    return ["hub-home", "hub-diy", "hub-garden", "hub-electronics", "hub-books", "hub-fashion"];
  }
  return MARKET_HUB_TABS.map((hub) => hub.id);
}

export const MARKET_HUB_TABS: readonly MarketHubTab[] = [
  {
    id: "hub-electronics",
    icon: Smartphone,
    leafIds: [
      "mobile-smartphones",
      "mobile-tablets",
      "mobile-accessories",
      "wearables-smartwatch",
      "wearables-accessories",
      "notebooks-laptops",
      "notebooks-desktops",
      "notebooks-monitors",
      "peripherals-keyboard-mouse",
      "peripherals-webcam",
      "peripherals-storage",
      "peripherals-accessories",
      "pc-gpu",
      "pc-cpu",
      "pc-ram-ssd",
      "tv-televisions",
      "audio-headphones",
      "audio-speakers",
      "audio-wireless",
      "gaming-consoles",
      "gaming-pc-handheld",
      "photo-action",
      "photo-mirrorless",
      "network-routers",
      "smart-home-security",
    ],
  },
  {
    id: "hub-home",
    icon: Home,
    leafIds: [
      "cleaning-vacuums",
      "cleaning-robots",
      "cleaning-floor-care",
      "climate-cooling",
      "climate-heating",
      "climate-air-care",
      "laundry-ironing-sewing",
      "kitchen-coffee-machines",
      "kitchen-machines-mixers",
      "kitchen-cooking-appliances",
      "kitchen-microwaves",
      "kitchen-breakfast",
      "kitchen-water-treatment",
      "care-hair-styling",
      "care-shaving-hair-removal",
      "care-oral",
      "health-monitors-scales",
      "office-home",
    ],
  },
  {
    id: "hub-books",
    icon: BookOpen,
    leafIds: ["media-books", "media-audiobooks", "media-films", "media-music"],
  },
  {
    id: "hub-fashion",
    icon: Shirt,
    leafIds: ["fashion-apparel", "fashion-shoes", "fashion-bags", "fashion-accessories"],
  },
  {
    id: "hub-garden",
    icon: Flower2,
    leafIds: ["garden-equipment", "garden-grills"],
  },
  {
    id: "hub-diy",
    icon: Hammer,
    leafIds: [
      "diy-power-tools",
      "diy-hand-tools",
      "diy-electrical",
      "diy-batteries-chargers",
      "diy-measuring",
      "vehicle-accessories",
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
