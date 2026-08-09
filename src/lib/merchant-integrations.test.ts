import { describe, it, expect } from 'vitest';
import {
  MERCHANT_FEEDS,
  buildAwinProductdataUrl,
  getEnabledMerchantFeeds,
  getFeedMode,
  getIntegrationSummary,
  getMerchantFeedStatuses,
  isCacheOnlyFeed,
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

  it("builds AWIN productdata URLs from API key + feed id", () => {
    const url = buildAwinProductdataUrl("test-key", "115553");
    expect(url).toContain("/apikey/test-key/");
    expect(url).toContain("/fid/115553/");
    expect(url).toContain("productdata.awin.com");
  });

  it("resolves Seentat production URL from AWIN_API_KEY", () => {
    const seentat = MERCHANT_FEEDS.find((feed) => feed.merchantId === "gb-seentat");
    expect(seentat).toBeDefined();

    const previousKey = process.env.AWIN_API_KEY;
    const previousUrl = process.env.AWIN_FEED_URL_GB_SEENTAT;
    delete process.env.AWIN_FEED_URL_GB_SEENTAT;
    process.env.AWIN_API_KEY = "unit-test-awin-key";

    try {
      expect(resolveFeedRemoteUrl(seentat!)).toContain("/apikey/unit-test-awin-key/");
      expect(resolveFeedRemoteUrl(seentat!)).toContain("/fid/115553/");
    } finally {
      if (previousKey === undefined) delete process.env.AWIN_API_KEY;
      else process.env.AWIN_API_KEY = previousKey;
      if (previousUrl === undefined) delete process.env.AWIN_FEED_URL_GB_SEENTAT;
      else process.env.AWIN_FEED_URL_GB_SEENTAT = previousUrl;
    }
  });

  it("accepts a full productdata URL pasted into AWIN_API_KEY", () => {
    const seentat = MERCHANT_FEEDS.find((feed) => feed.merchantId === "gb-seentat");
    const previousKey = process.env.AWIN_API_KEY;
    const previousUrl = process.env.AWIN_FEED_URL_GB_SEENTAT;
    delete process.env.AWIN_FEED_URL_GB_SEENTAT;
    const fullUrl =
      "https://productdata.awin.com/datafeed/download/apikey/abc123/language/en/fid/115553/format/csv/";
    process.env.AWIN_API_KEY = `  ${fullUrl}  `;

    try {
      expect(resolveFeedRemoteUrl(seentat!)).toBe(fullUrl);
    } finally {
      if (previousKey === undefined) delete process.env.AWIN_API_KEY;
      else process.env.AWIN_API_KEY = previousKey;
      if (previousUrl === undefined) delete process.env.AWIN_FEED_URL_GB_SEENTAT;
      else process.env.AWIN_FEED_URL_GB_SEENTAT = previousUrl;
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
    const previousForce = process.env.FORCE_SAMPLE_FEEDS;
    delete process.env.FORCE_SAMPLE_FEEDS;
    try {
      const enabled = getEnabledMerchantFeeds();
      const summary = getIntegrationSummary();
      expect(summary.merchants.length).toBe(enabled.length);
      expect(summary.hasFeedData).toBe(enabled.length > 0);
      expect(summary.sampleFeeds.length).toBe(enabled.length);
      expect(getMerchantFeedStatuses().every((merchant) => merchant.sampleAvailable)).toBe(true);
      // RO 2Performant catalogues are offline-imported (Supabase), not request-path feeds.
      expect(summary.feedMerchantIds).not.toEqual(
        expect.arrayContaining(["ro-rowenta", "ro-scule365", "ro-evomag"])
      );
      expect(summary.feedMerchantIds).toEqual(expect.arrayContaining(["gb-seentat"]));
      expect(summary.feedMerchantIds.some((id) => id.startsWith("ch-"))).toBe(false);
    } finally {
      if (previousForce === undefined) delete process.env.FORCE_SAMPLE_FEEDS;
      else process.env.FORCE_SAMPLE_FEEDS = previousForce;
    }
  });

  it("RO 2Performant feeds stay registered but disabled (Supabase import path)", () => {
    const previousForce = process.env.FORCE_SAMPLE_FEEDS;
    delete process.env.FORCE_SAMPLE_FEEDS;
    try {
      for (const id of ["ro-rowenta", "ro-scule365"] as const) {
        const feed = MERCHANT_FEEDS.find((item) => item.merchantId === id);
        expect(feed?.enabled).toBe(false);
        expect(isCacheOnlyFeed(feed!)).toBe(true);
      }
      expect(getEnabledMerchantFeeds().some((feed) => feed.country === "RO")).toBe(false);
    } finally {
      if (previousForce === undefined) delete process.env.FORCE_SAMPLE_FEEDS;
      else process.env.FORCE_SAMPLE_FEEDS = previousForce;
    }
  });
});
