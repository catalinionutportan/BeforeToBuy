import { CountryCode } from "@/types";

export type FeedProvider = "AWIN";

export interface FeedConfig {
  provider: FeedProvider;
  country: CountryCode;
  merchantId: string;
  merchantName: string;
  envVar: string;
  sampleFile?: string;
}

export const MERCHANT_FEEDS: FeedConfig[] = [
  {
    provider: "AWIN",
    country: "CH",
    merchantId: "ch-brack",
    merchantName: "Brack.ch",
    envVar: "AWIN_FEED_URL_CH",
    sampleFile: "sample-awin-brack-ch.csv",
  },
];

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
    const url = process.env[feed.envVar];
    if (url) {
      urls[feed.merchantId] = url;
    }
  }

  return urls;
}

export function isUsingSampleFeed(merchantId: string): boolean {
  const feed = MERCHANT_FEEDS.find((item) => item.merchantId === merchantId);
  if (!feed) return false;
  return !process.env[feed.envVar] && !!feed.sampleFile;
}

export function getFeedMerchantIds(): string[] {
  return MERCHANT_FEEDS.filter((feed) => {
    return process.env[feed.envVar] || feed.sampleFile;
  }).map((feed) => feed.merchantId);
}

export function getIntegrationSummary() {
  const feedMerchantIds = getFeedMerchantIds();
  const productionMerchantIds = MERCHANT_FEEDS.filter(
    (feed) => process.env[feed.envVar]
  ).map((feed) => feed.merchantId);
  const configuredFeeds = MERCHANT_FEEDS.filter((feed) => process.env[feed.envVar]).map(
    (feed) => feed.envVar
  );
  const sampleFeeds = MERCHANT_FEEDS.filter((feed) => isUsingSampleFeed(feed.merchantId)).map(
    (feed) => feed.merchantId
  );

  return {
    feedMerchantIds,
    productionMerchantIds,
    configuredFeeds,
    sampleFeeds,
    hasProductionFeed: configuredFeeds.length > 0,
    hasFeedData: feedMerchantIds.length > 0,
  };
}
