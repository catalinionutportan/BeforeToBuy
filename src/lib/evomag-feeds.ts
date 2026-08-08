/**
 * evoMAG 2Performant feeds — order matches the advertiser’s My Feeds list.
 * Enable one-by-one: set the env URL after “Add to my feeds”, then flip `enabled`.
 *
 * Mix feeds (Best Sellers / Cadou / Promo / Resigilate) stay last — they duplicate
 * category feeds and make mapping harder.
 */

export type EvomagFeedSlice = {
  /** Stable id used in cache keys and env naming */
  key: string;
  /** Label as shown in 2Performant */
  label: string;
  envVar: string;
  /**
   * When the CSV `category` cell is empty, use this BeforeToBuy leaf as a hint.
   * Leave undefined for universal / mixed feeds.
   */
  categoryHint?: string;
  /** Approx size from 2P UI (documentation only) */
  approxProducts?: number;
  /** Production My Feeds CSV URL (overridable via envVar). */
  defaultRemoteUrl?: string;
  /**
   * When false, feed is registered but not loaded until we turn it on.
   * Only the first slice starts enabled (needs sample or production URL).
   */
  enabled: boolean;
};

export const EVOMAG_FEED_SLICES: readonly EvomagFeedSlice[] = [
  {
    key: "full-catalog",
    label: "evoMAG - BeforeToBuy",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_FULL",
    defaultRemoteUrl: "https://api.2performant.com/feed/9519e6c41.csv",
    approxProducts: 104_828,
    enabled: true,
  },
  {
    key: "stock-store",
    label: "Produse in stoc magazin",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_STOCK",
    approxProducts: 8_541,
    enabled: false,
  },
  {
    key: "mobile",
    label: "Solutii mobile (Telefoane, PDA, GPS)",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_MOBILE",
    categoryHint: "mobile-smartphones",
    approxProducts: 16_981,
    enabled: false,
  },
  {
    key: "pc-components",
    label: "Componente PC",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PC_COMPONENTS",
    categoryHint: "peripherals-storage",
    approxProducts: 12_005,
    enabled: false,
  },
  {
    key: "baby",
    label: "Mama si Copilul",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_BABY",
    categoryHint: "baby-monitoring-feeding",
    approxProducts: 9_545,
    enabled: false,
  },
  {
    key: "monitors",
    label: "Monitoare (LCD, LED, Plasma)",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_MONITORS",
    categoryHint: "notebooks-monitors",
    approxProducts: 2_728,
    enabled: false,
  },
  {
    key: "bestsellers",
    label: "Best Sellers",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_BESTSELLERS",
    approxProducts: 2_700,
    enabled: false,
  },
  {
    key: "sport",
    label: "Sport & Fitness",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_SPORT",
    categoryHint: "sport-fitness-equipment",
    approxProducts: 2_187,
    enabled: false,
  },
  {
    key: "gifts",
    label: "PRODUSE CU CADOU",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_GIFTS",
    approxProducts: 1_757,
    enabled: false,
  },
  {
    key: "personal-care",
    label: "Ingrijire personala",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PERSONAL_CARE",
    categoryHint: "care-shaving-hair-removal",
    approxProducts: 1_592,
    enabled: false,
  },
  {
    key: "pc-systems",
    label: "Sisteme PC",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PC_SYSTEMS",
    categoryHint: "notebooks-desktops",
    approxProducts: 1_097,
    enabled: false,
  },
  {
    key: "e-vehicles",
    label: "Vehicule electrice",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_EVEHICLES",
    categoryHint: "mobility-escooters",
    approxProducts: 1_088,
    enabled: false,
  },
  {
    key: "category-index",
    label: "Categorii produse evoMAG",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_CATEGORIES",
    approxProducts: 1_158,
    enabled: false,
  },
  {
    key: "aircon",
    label: "Aere conditionate",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_AIRCON",
    categoryHint: "climate-cooling",
    approxProducts: 186,
    enabled: false,
  },
  {
    key: "tvs",
    label: "Televizoare (LCD, LED, Plasma)",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_TVS",
    categoryHint: "tv-televisions",
    approxProducts: 1_148,
    enabled: false,
  },
  {
    key: "laptops",
    label: "Laptopuri",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_LAPTOPS",
    categoryHint: "notebooks-laptops",
    approxProducts: 900,
    enabled: false,
  },
  {
    key: "photo",
    label: "FOTO",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PHOTO",
    categoryHint: "photo-mirrorless",
    approxProducts: 541,
    enabled: false,
  },
  {
    key: "refurbished",
    label: "Produse resigilate",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_REFURBISHED",
    approxProducts: 706,
    enabled: false,
  },
  {
    key: "gaming",
    label: "GAMING",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_GAMING",
    categoryHint: "gaming-consoles",
    approxProducts: 353,
    enabled: false,
  },
  {
    key: "multimedia",
    label: "MULTIMEDIA",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_MULTIMEDIA",
    categoryHint: "audio-portable",
    approxProducts: 343,
    enabled: false,
  },
  {
    key: "photo-video",
    label: "FOTO + VIDEO",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PHOTO_VIDEO",
    categoryHint: "photo-mirrorless",
    approxProducts: 105,
    enabled: false,
  },
  {
    key: "video",
    label: "VIDEO (Camere, Tablete, Proiectoare)",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_VIDEO",
    categoryHint: "photo-action",
    approxProducts: 352,
    enabled: false,
  },
  {
    key: "promo",
    label: "Produse in PROMOTIE",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG_PROMO",
    approxProducts: 15,
    enabled: false,
  },
] as const;

export const EVOMAG_MERCHANT_ID = "ro-evomag";
