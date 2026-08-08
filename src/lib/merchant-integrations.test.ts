import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MERCHANT_FEEDS,
  getEnabledMerchantFeeds,
  getFeedMode,
  getIntegrationSummary,
  getMerchantFeedStatuses,
  resolveFeedRemoteUrl,
} from './merchant-integrations';

describe('Merchant Integrations', () => {
  it("CH merchant feeds stay registered but disabled until approval", () => {
    const chFeeds = MERCHANT_FEEDS.filter((feed) => feed.country === "CH");
    expect(chFeeds.map((feed) => feed.merchantId).sort()).toEqual([
      "ch-brack",
      "ch-digitec",
      "ch-fust",
      "ch-galaxus",
      "ch-interdiscount",
      "ch-mediamarkt",
    ]);
    expect(chFeeds.every((feed) => feed.enabled === false)).toBe(true);
    expect(getEnabledMerchantFeeds().every((feed) => feed.country !== "CH")).toBe(true);
  });

  it("enabled feed mode defaults to sample when env var is unset", () => {
    for (const feed of getEnabledMerchantFeeds()) {
      expect(getFeedMode(feed)).toBe("sample");
    }
  });

  it("legacy Brack env var resolves as production remote URL", () => {
    const brack = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-brack");
    expect(brack).toBeDefined();

    const previousPrimary = process.env[brack!.envVar];
    const previousLegacy = process.env.AWIN_FEED_URL_CH;
    delete process.env[brack!.envVar];
    process.env.AWIN_FEED_URL_CH = "https://example.com/brack.csv";

    try {
      expect(resolveFeedRemoteUrl(brack!)).toBe("https://example.com/brack.csv");
      expect(getFeedMode(brack!)).toBe("production");
    } finally {
      if (previousPrimary === undefined) delete process.env[brack!.envVar];
      else process.env[brack!.envVar] = previousPrimary;
      if (previousLegacy === undefined) delete process.env.AWIN_FEED_URL_CH;
      else process.env.AWIN_FEED_URL_CH = previousLegacy;
    }
  });

  it("integration summary exposes only enabled merchant feed status", () => {
    const enabled = getEnabledMerchantFeeds();
    const summary = getIntegrationSummary();
    expect(summary.merchants.length).toBe(enabled.length);
    expect(summary.hasFeedData).toBe(true);
    expect(summary.sampleFeeds.length).toBe(enabled.length);
    expect(getMerchantFeedStatuses().every((merchant) => merchant.sampleAvailable)).toBe(true);
    expect(summary.feedMerchantIds).toEqual(
      expect.arrayContaining(["ro-rowenta", "ro-scule365"])
    );
    expect(summary.feedMerchantIds.some((id) => id.startsWith("ch-"))).toBe(false);
  });
});