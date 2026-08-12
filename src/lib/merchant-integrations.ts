import { CountryCode } from "@/types";

export type FeedProvider = "AWIN" | "GALAXUS" | "GOOGLE_MERCHANT" | "TWO_PERFORMANT";
export type FeedMode = "production" | "sample" | "unconfigured";
export type FeedSampleFormat = "csv" | "json" | "xml";

export interface FeedConfig {
  provider: FeedProvider;
  country: CountryCode;
  merchantId: string;
  merchantName: string;
  envVar: string;
  /** Backward-compatible env vars checked when the primary env var is unset. */
  legacyEnvVars?: string[];
  /**
   * Public production feed URL used when env vars are unset.
   * Prefer env override in deploy; sampleFile remains the offline/CI fallback when fetch fails.
   * Never put AWIN API keys in defaultRemoteUrl — use AWIN_API_KEY + awinFeedId instead.
   */
  defaultRemoteUrl?: string;
  /** AWIN datafeed id (fid). Combined with AWIN_API_KEY when env URL is unset. */
  awinFeedId?: string;
  /** AWIN productdata language segment (default `en`). Use `de` for CH DE catalogues. */
  awinLanguage?: string;
  sampleFile?: string;
  sampleFormat?: FeedSampleFormat;
  /**
   * When false, feed is kept for re-enable after merchant approval but not loaded or listed.
   * Defaults to true when omitted.
   */
  enabled?: boolean;
  /**
   * Distinguishes multiple feed URLs for the same merchant (future multi-feed).
   * Used in cache keys so slices do not overwrite each other.
   */
  feedKey?: string;
  /** Fallback BeforeToBuy leaf when the CSV category cell is empty. */
  categoryHint?: string;
  /**
   * Large remote catalogues (e.g. evoMAG ~200MB CSV). Request/SSR/API paths
   * must never download these — only Redis + memory. Warm via feeds:warm / cron.
   */
  heavy?: boolean;
  /** Alias of heavy: request path is Redis/memory only (no remote CSV). */
  cacheOnly?: boolean;
}

/** True when HTTP/SSR must not download this feed's remote file. */
export function isCacheOnlyFeed(feed: FeedConfig): boolean {
  return feed.cacheOnly === true || feed.heavy === true;
}

export function isFeedEnabled(feed: FeedConfig): boolean {
  return feed.enabled !== false;
}

/**
 * Feeds loaded on the request path.
 * Production: only `enabled !== false`.
 * Playwright (`FORCE_SAMPLE_FEEDS=1`): also include disabled RO samples so e2e
 * can assert UI without downloading remote CSVs.
 */
export function getEnabledMerchantFeeds(): FeedConfig[] {
  if (process.env.FORCE_SAMPLE_FEEDS === "1") {
    return MERCHANT_FEEDS.filter(
      (feed) =>
        isFeedEnabled(feed) ||
        (feed.country === "RO" && Boolean(feed.sampleFile) && feed.provider === "TWO_PERFORMANT")
    );
  }
  return MERCHANT_FEEDS.filter(isFeedEnabled);
}

export interface MerchantFeedStatus {
  merchantId: string;
  merchantName: string;
  provider: FeedProvider;
  country: CountryCode;
  envVar: string;
  mode: FeedMode;
  configured: boolean;
  sampleAvailable: boolean;
}

/**
 * Merchant feed registry.
 * CH sample retailers stay listed but disabled until partnership approval.
 * RO 2Performant catalogues (Rowenta / Scule365 / evoMAG) are disabled on the
 * request path — import offline into Supabase via `npm run feeds:import`.
 * GB Seentat remains available via AWIN when configured.
 */
export const MERCHANT_FEEDS: FeedConfig[] = [
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-brack",
    merchantName: "Brack.ch",
    envVar: "AWIN_FEED_URL_CH_BRACK",
    legacyEnvVars: ["AWIN_FEED_URL_CH"],
    sampleFile: "sample-awin-brack-ch.csv",
    sampleFormat: "csv",
    enabled: false,
  },
  {
    provider: "GALAXUS",
    country: "CH",
    merchantId: "ch-digitec",
    merchantName: "Digitec",
    envVar: "GALAXUS_FEED_URL_CH_DIGITEC",
    sampleFile: "sample-galaxus-digitec-ch.json",
    sampleFormat: "json",
    enabled: false,
  },
  {
    provider: "GALAXUS",
    country: "CH",
    merchantId: "ch-galaxus",
    merchantName: "Galaxus",
    envVar: "GALAXUS_FEED_URL_CH_GALAXUS",
    sampleFile: "sample-galaxus-galaxus-ch.json",
    sampleFormat: "json",
    enabled: false,
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-mediamarkt",
    merchantName: "MediaMarkt CH",
    envVar: "AWIN_FEED_URL_CH_MEDIAMARKT",
    sampleFile: "sample-awin-mediamarkt-ch.csv",
    sampleFormat: "csv",
    enabled: false,
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-interdiscount",
    merchantName: "Interdiscount",
    envVar: "AWIN_FEED_URL_CH_INTERDISCOUNT",
    sampleFile: "sample-awin-interdiscount-ch.csv",
    sampleFormat: "csv",
    enabled: false,
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-fust",
    merchantName: "Fust",
    envVar: "AWIN_FEED_URL_CH_FUST",
    sampleFile: "sample-awin-fust-ch.csv",
    sampleFormat: "csv",
    enabled: false,
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-babywalz",
    merchantName: "baby-walz CH",
    envVar: "AWIN_FEED_URL_CH_BABYWALZ",
    awinFeedId: "23813",
    awinLanguage: "de",
    sampleFile: "sample-awin-babywalz-ch.csv",
    sampleFormat: "csv",
    categoryHint: "fashion-kids-baby",
    // ~20k SKUs — warm/import only; never download on visitor requests.
    heavy: true,
    cacheOnly: true,
  },
  {
    provider: "TWO_PERFORMANT",
    country: "RO",
    merchantId: "ro-rowenta",
    merchantName: "Rowenta.ro",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_ROWENTA",
    sampleFile: "sample-2performant-rowenta-ro.csv",
    sampleFormat: "csv",
    // Offline Supabase import only — never fetch CSV on visitor requests.
    enabled: false,
    heavy: true,
    cacheOnly: true,
  },
  {
    provider: "TWO_PERFORMANT",
    country: "RO",
    merchantId: "ro-scule365",
    merchantName: "Scule365.ro",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_SCULE365",
    sampleFile: "sample-2performant-scule365-ro.csv",
    sampleFormat: "csv",
    enabled: false,
    heavy: true,
    cacheOnly: true,
  },
  {
    provider: "TWO_PERFORMANT",
    country: "RO",
    merchantId: "ro-evomag",
    merchantName: "evoMAG.ro",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG",
    sampleFile: "sample-2performant-evomag-ro.csv",
    sampleFormat: "csv",
    // Offline Supabase import only (category feeds, e.g. VIDEO ~351). Never request-path.
    enabled: false,
    heavy: true,
    cacheOnly: true,
  },
  {
    provider: "AWIN",
    country: "GB",
    merchantId: "gb-seentat",
    merchantName: "Seentat UK",
    envVar: "AWIN_FEED_URL_GB_SEENTAT",
    awinFeedId: "115553",
    sampleFile: "sample-awin-seentat-gb.csv",
    sampleFormat: "csv",
  },
  {
    provider: "AWIN",
    country: "GB",
    merchantId: "gb-geepas",
    merchantName: "Geepas UK",
    envVar: "AWIN_FEED_URL_GB_GEEPAS",
    awinFeedId: "92363",
    sampleFile: "sample-awin-geepas-gb.csv",
    sampleFormat: "csv",
  },
  {
    provider: "AWIN",
    country: "US",
    merchantId: "us-ottocast",
    merchantName: "Ottocast",
    envVar: "AWIN_FEED_URL_US_OTTOCAST",
    awinFeedId: "109551",
    sampleFile: "sample-awin-ottocast-us.csv",
    sampleFormat: "csv",
  },
];

/** Columns requested for AWIN productdata downloads (no secrets). */
const AWIN_PRODUCTDATA_COLUMNS =
  "aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id";

export function buildAwinProductdataUrl(
  apiKey: string,
  feedId: string,
  language = "en"
): string {
  const key = apiKey.trim();
  const fid = feedId.trim();
  const lang = language.trim() || "en";
  if (!key || !fid) {
    throw new Error("AWIN productdata URL requires apiKey and feedId");
  }
  return (
    `https://productdata.awin.com/datafeed/download/apikey/${encodeURIComponent(key)}` +
    `/language/${encodeURIComponent(lang)}/fid/${encodeURIComponent(fid)}` +
    `/rid/0/hasEnhancedFeeds/0/columns/${AWIN_PRODUCTDATA_COLUMNS}` +
    `/format/csv/delimiter/%2C/compression/gzip/`
  );
}

export function getFeedConfig(merchantId: string): FeedConfig | undefined {
  return MERCHANT_FEEDS.find((feed) => feed.merchantId === merchantId && isFeedEnabled(feed));
}

export function getFeedsForMerchant(merchantId: string): FeedConfig[] {
  return MERCHANT_FEEDS.filter((feed) => feed.merchantId === merchantId && isFeedEnabled(feed));
}

export function resolveFeedRemoteUrl(feed: FeedConfig): string | undefined {
  // Playwright e2e: use checked-in sample feeds only (skip huge remote evoMAG pulls).
  if (process.env.FORCE_SAMPLE_FEEDS === "1") {
    return undefined;
  }

  const primary = process.env[feed.envVar]?.trim();
  if (primary) return primary;

  for (const legacyEnvVar of feed.legacyEnvVars ?? []) {
    const legacy = process.env[legacyEnvVar]?.trim();
    if (legacy) return legacy;
  }

  if (feed.provider === "AWIN" && feed.awinFeedId) {
    const apiKeyRaw = process.env.AWIN_API_KEY?.trim();
    if (apiKeyRaw) {
      // Tolerate pasting the full productdata URL into AWIN_API_KEY by mistake.
      if (/^https?:\/\//i.test(apiKeyRaw)) {
        return apiKeyRaw;
      }
      const extracted = apiKeyRaw.match(/\/apikey\/([^/]+)\//i)?.[1];
      return buildAwinProductdataUrl(
        extracted || apiKeyRaw,
        feed.awinFeedId,
        feed.awinLanguage ?? "en"
      );
    }
  }

  // Vitest / offline CI should keep using sample files (no hardcoded remotes).
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return undefined;
  }

  return feed.defaultRemoteUrl?.trim() || undefined;
}

export function getFeedMode(feed: FeedConfig): FeedMode {
  if (resolveFeedRemoteUrl(feed)) return "production";
  if (feed.sampleFile) return "sample";
  return "unconfigured";
}

export function getMerchantFeedStatuses(): MerchantFeedStatus[] {
  return getEnabledMerchantFeeds().map((feed) => {
    const mode = getFeedMode(feed);
    return {
      merchantId: feed.merchantId,
      merchantName: feed.merchantName,
      provider: feed.provider,
      country: feed.country,
      envVar: feed.envVar,
      mode,
      configured: mode === "production",
      sampleAvailable: Boolean(feed.sampleFile),
    };
  });
}

export function getAmazonConfig() {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;

  if (!accessKey || !secretKey || !partnerTag) {
    return null;
  }

  return { accessKey, secretKey, partnerTag };
}

export function getConfiguredFeedUrls(): Record<string, string> {
  const urls: Record<string, string> = {};

  for (const feed of getEnabledMerchantFeeds()) {
    const url = resolveFeedRemoteUrl(feed);
    if (url) {
      const key = feed.feedKey ? `${feed.merchantId}:${feed.feedKey}` : feed.merchantId;
      urls[key] = url;
    }
  }

  return urls;
}

export function isUsingSampleFeed(merchantId: string): boolean {
  const feed = getFeedConfig(merchantId);
  if (!feed || !isFeedEnabled(feed)) return false;
  return getFeedMode(feed) === "sample";
}

export function getFeedMerchantIds(): string[] {
  return getEnabledMerchantFeeds()
    .filter((feed) => getFeedMode(feed) !== "unconfigured")
    .map((feed) => feed.merchantId);
}

export function getIntegrationSummary() {
  const merchants = getMerchantFeedStatuses();
  const feedMerchantIds = merchants
    .filter((merchant) => merchant.mode !== "unconfigured")
    .map((merchant) => merchant.merchantId);
  const productionMerchantIds = merchants
    .filter((merchant) => merchant.mode === "production")
    .map((merchant) => merchant.merchantId);
  const sampleFeeds = merchants
    .filter((merchant) => merchant.mode === "sample")
    .map((merchant) => merchant.merchantId);

  return {
    feedMerchantIds,
    productionMerchantIds,
    configuredFeeds: merchants
      .filter((merchant) => merchant.configured)
      .map((merchant) => merchant.envVar),
    sampleFeeds,
    merchants,
    hasProductionFeed: productionMerchantIds.length > 0,
    hasFeedData: feedMerchantIds.length > 0,
  };
}
