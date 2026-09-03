import { MARKET_HUB_LEAF_GROUPS, marketHubOrderForCountry } from "@/lib/market-hubs";
import { ALL_CATEGORIES_ID, resolveCategoryAlias } from "@/lib/categories";
import type { CountryCode } from "@/types";

export type ShortcutBoardId =
  | "electronics"
  | "baby"
  | "beauty"
  | "home"
  | "diy"
  | "auto"
  | "fashion"
  | "sport"
  | "dji";

export type ShortcutBoardTitleKey =
  | "hubElectronics"
  | "hubHome"
  | "hubDiy"
  | "hubAuto"
  | "hubFashion"
  | "shortcutBoardBaby"
  | "shortcutBoardBeauty"
  | "shortcutBoardSport"
  | "shortcutBoardDji";

export interface ShortcutBoardDefinition {
  id: ShortcutBoardId;
  hubId: string;
  titleKey: ShortcutBoardTitleKey;
  tileIds: readonly string[];
  /** First occupied tile is rendered larger (presentation card). */
  featured?: boolean;
  /** Top up tiles from other occupied leaves in the same hub. */
  fillFromHub?: boolean;
  /** Pin the store filter so the aisle opens this merchant's catalogue. */
  domain?: string;
  /** "See all" target. Defaults to hubId. */
  seeAllCategoryId?: string;
}

export interface VisibleShortcutTile {
  categoryId: string;
  count: number;
}

export interface VisibleShortcutBoard {
  id: ShortcutBoardId;
  hubId: string;
  titleKey: ShortcutBoardTitleKey;
  featured: boolean;
  tiles: VisibleShortcutTile[];
  domain?: string;
  seeAllCategoryId?: string;
}

const MAX_BOARDS = 6;
const MAX_TILES = 6;

const CH_BOARDS: readonly ShortcutBoardDefinition[] = [
  {
    id: "electronics",
    hubId: "hub-electronics",
    titleKey: "hubElectronics",
    tileIds: [
      "notebooks-laptops",
      "notebooks-desktops",
      "notebooks-monitors",
      "tv-projectors",
      "notebooks-tablets-pc",
      "office-home",
    ],
    fillFromHub: true,
  },
  {
    // Reifen.com is CH-only for now — do not add this board to RO/GB/US.
    id: "auto",
    hubId: "hub-auto",
    titleKey: "hubAuto",
    tileIds: [
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
    fillFromHub: true,
  },
  {
    id: "baby",
    hubId: "hub-fashion",
    titleKey: "shortcutBoardBaby",
    tileIds: [
      "baby-strollers-travel",
      "baby-car-seats",
      "baby-nursery",
      "baby-monitoring-feeding",
      "fashion-kids-baby",
    ],
    featured: true,
    fillFromHub: false,
  },
  {
    id: "beauty",
    hubId: "hub-fashion",
    titleKey: "shortcutBoardBeauty",
    tileIds: [
      "fashion-beauty-hair-care",
      "fashion-beauty-cosmetics",
      "fashion-beauty-fragrance",
      "care-hair-styling",
    ],
    fillFromHub: false,
  },
  {
    // Gigasport CH — three sport tiles; See all opens the store filter.
    id: "sport",
    hubId: "hub-fashion",
    titleKey: "shortcutBoardSport",
    tileIds: [
      "fashion-women-activewear",
      "fashion-shoes-sport",
      "mobility-accessories",
    ],
    featured: true,
    fillFromHub: false,
    domain: "gigasport.ch",
    seeAllCategoryId: ALL_CATEGORIES_ID,
  },
];

const RO_BOARDS: readonly ShortcutBoardDefinition[] = [
  {
    id: "electronics",
    hubId: "hub-electronics",
    titleKey: "hubElectronics",
    tileIds: [
      "notebooks-laptops",
      "notebooks-monitors",
      "notebooks-desktops",
      "tv-projectors",
      "peripherals-accessories",
      "pc-ram-ssd",
      "photo-video-cameras",
    ],
    featured: true,
    fillFromHub: true,
  },
  {
    id: "diy",
    hubId: "hub-diy",
    titleKey: "hubDiy",
    tileIds: [
      "diy-power-tools",
      "diy-hand-tools",
      "diy-welding-soldering",
      "diy-fasteners-consumables",
      "diy-batteries-chargers",
      "diy-measuring",
    ],
    fillFromHub: true,
  },
  {
    id: "home",
    hubId: "hub-home",
    titleKey: "hubHome",
    tileIds: [
      "cleaning-stick-vacuums",
      "cleaning-vacuums",
      "care-hair-styling",
      "care-shaving-hair-removal",
      "cleaning-robots",
      "cleaning-accessories",
    ],
    fillFromHub: true,
  },
];

const HUB_TITLE_KEY: Record<string, ShortcutBoardTitleKey> = {
  "hub-electronics": "hubElectronics",
  "hub-home": "hubHome",
  "hub-diy": "hubDiy",
  "hub-auto": "hubAuto",
  "hub-fashion": "hubFashion",
};

const HUB_BOARD_ID: Record<string, ShortcutBoardId> = {
  "hub-electronics": "electronics",
  "hub-home": "home",
  "hub-diy": "diy",
  "hub-auto": "auto",
  "hub-fashion": "fashion",
};

function leafCount(categoryCounts: Record<string, number>, leafId: string): number {
  return categoryCounts[leafId] ?? 0;
}

function occupiedTiles(
  tileIds: readonly string[],
  categoryCounts: Record<string, number>
): VisibleShortcutTile[] {
  const seen = new Set<string>();
  const tiles: VisibleShortcutTile[] = [];
  for (const categoryId of tileIds) {
    if (seen.has(categoryId)) continue;
    const count = leafCount(categoryCounts, categoryId);
    if (count <= 0) continue;
    seen.add(categoryId);
    tiles.push({ categoryId, count });
    if (tiles.length >= MAX_TILES) break;
  }
  return tiles;
}

function fillFromHubLeaves(
  hubId: string,
  categoryCounts: Record<string, number>,
  already: VisibleShortcutTile[]
): VisibleShortcutTile[] {
  const tiles = [...already];
  const seen = new Set(tiles.map((tile) => tile.categoryId));
  for (const leafId of MARKET_HUB_LEAF_GROUPS[hubId] ?? []) {
    if (tiles.length >= MAX_TILES) break;
    if (seen.has(leafId)) continue;
    const count = leafCount(categoryCounts, leafId);
    if (count <= 0) continue;
    seen.add(leafId);
    tiles.push({ categoryId: leafId, count });
  }
  return tiles;
}

function resolveBoard(
  definition: ShortcutBoardDefinition,
  categoryCounts: Record<string, number>,
  categoryCovers?: Record<string, string>
): VisibleShortcutBoard | null {
  let tiles = occupiedTiles(definition.tileIds, categoryCounts);
  if (definition.fillFromHub !== false) {
    tiles = fillFromHubLeaves(definition.hubId, categoryCounts, tiles);
  }
  if (categoryCovers && Object.keys(categoryCovers).length > 0) {
    const withCover = tiles.filter((tile) => Boolean(categoryCovers[tile.categoryId]));
    if (withCover.length > 0) {
      tiles = withCover;
    }
  }
  if (tiles.length === 0) return null;
  return {
    id: definition.id,
    hubId: definition.hubId,
    titleKey: definition.titleKey,
    featured: Boolean(definition.featured),
    tiles,
    domain: definition.domain,
    seeAllCategoryId: definition.seeAllCategoryId,
  };
}

function genericBoardsForCountry(countryCode: CountryCode): ShortcutBoardDefinition[] {
  return marketHubOrderForCountry(countryCode)
    .filter((hubId) => HUB_TITLE_KEY[hubId])
    .map((hubId) => ({
      id: HUB_BOARD_ID[hubId] ?? "electronics",
      hubId,
      titleKey: HUB_TITLE_KEY[hubId]!,
      tileIds: MARKET_HUB_LEAF_GROUPS[hubId] ?? [],
      fillFromHub: true,
    }));
}

const US_BOARDS: readonly ShortcutBoardDefinition[] = [
  {
    // DJI US & CA — three camera tiles; See all opens the store filter.
    id: "dji",
    hubId: "hub-electronics",
    titleKey: "shortcutBoardDji",
    tileIds: ["drones-quadcopters", "photo-action", "photo-gimbals"],
    featured: true,
    fillFromHub: false,
    domain: "store.dji.com",
    seeAllCategoryId: ALL_CATEGORIES_ID,
  },
  ...genericBoardsForCountry("US"),
];

const DE_BOARDS: readonly ShortcutBoardDefinition[] = [
  {
    id: "auto",
    hubId: "hub-auto",
    titleKey: "hubAuto",
    tileIds: [
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
    featured: true,
    fillFromHub: true,
  },
];

export function shortcutBoardDefinitionsForCountry(
  countryCode: CountryCode
): readonly ShortcutBoardDefinition[] {
  if (countryCode === "CH") return CH_BOARDS;
  if (countryCode === "RO") return RO_BOARDS;
  if (countryCode === "DE") return DE_BOARDS;
  if (countryCode === "US") return US_BOARDS;
  return genericBoardsForCountry(countryCode);
}

/**
 * Short CH aisles share a column so Auto does not leave a hole under
 * Electronics. Beauty sits on top; Auto fills the space below.
 */
const STACK_GROUP: Partial<Record<ShortcutBoardId, string>> = {
  beauty: "ch-beauty-auto",
  auto: "ch-beauty-auto",
};

const STACK_ORDER: Record<string, readonly ShortcutBoardId[]> = {
  "ch-beauty-auto": ["beauty", "auto"],
};

/** Pack stacked aisles into grid columns without changing board order for counts. */
export function groupShortcutBoardColumns(
  boards: VisibleShortcutBoard[]
): VisibleShortcutBoard[][] {
  const byId = new Map(boards.map((board) => [board.id, board]));
  const emitted = new Set<ShortcutBoardId>();
  const columns: VisibleShortcutBoard[][] = [];

  for (const board of boards) {
    if (emitted.has(board.id)) continue;
    const group = STACK_GROUP[board.id];
    if (!group) {
      emitted.add(board.id);
      columns.push([board]);
      continue;
    }
    const stacked = (STACK_ORDER[group] ?? [board.id])
      .map((id) => byId.get(id))
      .filter((item): item is VisibleShortcutBoard => Boolean(item));
    for (const item of stacked) emitted.add(item.id);
    if (stacked.length > 0) columns.push(stacked);
  }
  return columns;
}

/**
 * Department shortcut boards with inventory. Empty aisles are dropped so the
 * homepage never advertises a tile that opens the zero-offer card.
 */
export function resolveShortcutBoards(
  countryCode: CountryCode,
  categoryCounts: Record<string, number> | undefined,
  categoryCovers?: Record<string, string>
): VisibleShortcutBoard[] {
  if (!categoryCounts) return [];
  const boards: VisibleShortcutBoard[] = [];
  for (const definition of shortcutBoardDefinitionsForCountry(countryCode)) {
    const board = resolveBoard(definition, categoryCounts, categoryCovers);
    if (!board) continue;
    boards.push(board);
    if (boards.length >= MAX_BOARDS) break;
  }
  return boards;
}

/** First usable image per leaf. Later rows for the same aisle are ignored. */
export function buildCategoryCoverMap(
  rows: Array<{ category: string; image?: string | null }>
): Record<string, string> {
  const covers: Record<string, string> = {};
  for (const row of rows) {
    const image = row.image?.trim();
    if (!image) continue;
    const leafId = resolveCategoryAlias(row.category);
    if (!covers[leafId]) covers[leafId] = image;
  }
  return covers;
}
