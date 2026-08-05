import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MERCHANT_FEEDS,
  getFeedMode,
  getIntegrationSummary,
  getMerchantFeedStatuses,
  resolveFeedRemoteUrl,
} from './merchant-integrations';

describe('Merchant Integrations', () => {
  it("CH merchant feed registry includes six primary retailers", () => {
    const ids = MERCHANT_FEEDS.filter((feed) => feed.country === "CH").map((feed) => feed.merchantId);
    expect(ids.sort()).toEqual([
      "ch-brack",
      "ch-digitec",
      "ch-fust",
      "ch-galaxus",
      "ch-interdiscount",
      "ch-mediamarkt",
    ]);
  });

  it("feed mode defaults to sample when env var is unset", () => {
    for (const feed of MERCHANT_FEEDS) {
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

  it("integration summary exposes per-merchant feed status", () => {
    const summary = getIntegrationSummary();
    expect(summary.merchants.length).toBe(MERCHANT_FEEDS.length);
    expect(summary.hasFeedData).toBe(true);
    expect(summary.sampleFeeds.length).toBe(MERCHANT_FEEDS.length);
    expect(getMerchantFeedStatuses().every((merchant) => merchant.sampleAvailable)).toBe(true);
  });
});