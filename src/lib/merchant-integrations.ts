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
   */
  defaultRemoteUrl?: string;
  sampleFile?: string;
  sampleFormat?: FeedSampleFormat;
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

/** Primary CH merchant feed registry (C4). Production URLs activate via env vars. */
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
  },
  {
    provider: "GALAXUS",
    country: "CH",
    merchantId: "ch-digitec",
    merchantName: "Digitec",
    envVar: "GALAXUS_FEED_URL_CH_DIGITEC",
    sampleFile: "sample-galaxus-digitec-ch.json",
    sampleFormat: "json",
  },
  {
    provider: "GALAXUS",
    country: "CH",
    merchantId: "ch-galaxus",
    merchantName: "Galaxus",
    envVar: "GALAXUS_FEED_URL_CH_GALAXUS",
    sampleFile: "sample-galaxus-galaxus-ch.json",
    sampleFormat: "json",
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-mediamarkt",
    merchantName: "MediaMarkt CH",
    envVar: "AWIN_FEED_URL_CH_MEDIAMARKT",
    sampleFile: "sample-awin-mediamarkt-ch.csv",
    sampleFormat: "csv",
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-interdiscount",
    merchantName: "Interdiscount",
    envVar: "AWIN_FEED_URL_CH_INTERDISCOUNT",
    sampleFile: "sample-awin-interdiscount-ch.csv",
    sampleFormat: "csv",
  },
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-fust",
    merchantName: "Fust",
    envVar: "AWIN_FEED_URL_CH_FUST",
    sampleFile: "sample-awin-fust-ch.csv",
    sampleFormat: "csv",
  },
  {
    provider: "TWO_PERFORMANT",
    country: "RO",
    merchantId: "ro-rowenta",
    merchantName: "Rowenta.ro",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_ROWENTA",
    defaultRemoteUrl: "https://api.2performant.com/feed/c55b99d30.csv",
    sampleFile: "sample-2performant-rowenta-ro.csv",
    sampleFormat: "csv",
  },
  {
    provider: "TWO_PERFORMANT",
    country: "RO",
    merchantId: "ro-scule365",
    merchantName: "Scule365.ro",
    envVar: "TWO_PERFORMANT_FEED_URL_RO_SCULE365",
    defaultRemoteUrl: "https://api.2performant.com/feed/fcdbb3e99.csv",
    sampleFile: "sample-2performant-scule365-ro.csv",
    sampleFormat: "csv",
  },
];

export function getFeedConfig(merchantId: string): FeedConfig | undefined {
  return MERCHANT_FEEDS.find((feed) => feed.merchantId === merchantId);
}

export function resolveFeedRemoteUrl(feed: FeedConfig): string | undefined {
  const primary = process.env[feed.envVar]?.trim();
  if (primary) return primary;

  for (const legacyEnvVar of feed.legacyEnvVars ?? []) {
    const legacy = process.env[legacyEnvVar]?.trim();
    if (legacy) return legacy;
  }

  // Vitest / offline CI should keep using sample files (no network).
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
  return MERCHANT_FEEDS.map((feed) => {
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

  for (const feed of MERCHANT_FEEDS) {
    const url = resolveFeedRemoteUrl(feed);
    if (url) {
      urls[feed.merchantId] = url;
    }
  }

  return urls;
}

export function isUsingSampleFeed(merchantId: string): boolean {
  const feed = getFeedConfig(merchantId);
  if (!feed) return false;
  return getFeedMode(feed) === "sample";
}

export function getFeedMerchantIds(): string[] {
  return MERCHANT_FEEDS.filter((feed) => getFeedMode(feed) !== "unconfigured").map(
    (feed) => feed.merchantId
  );
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
