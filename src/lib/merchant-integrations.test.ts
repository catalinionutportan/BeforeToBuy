import assert from "node:assert/strict";
import test from "node:test";
import {
  MERCHANT_FEEDS,
  getFeedMode,
  getIntegrationSummary,
  getMerchantFeedStatuses,
  resolveFeedRemoteUrl,
} from "./merchant-integrations";

test("CH merchant feed registry includes six primary retailers", () => {
  const ids = MERCHANT_FEEDS.filter((feed) => feed.country === "CH").map((feed) => feed.merchantId);
  assert.deepEqual(ids.sort(), [
    "ch-brack",
    "ch-digitec",
    "ch-fust",
    "ch-galaxus",
    "ch-interdiscount",
    "ch-mediamarkt",
  ]);
});

test("feed mode defaults to sample when env var is unset", () => {
  for (const feed of MERCHANT_FEEDS) {
    assert.equal(getFeedMode(feed), "sample", feed.merchantId);
  }
});

test("legacy Brack env var resolves as production remote URL", () => {
  const brack = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-brack");
  assert.ok(brack);

  const previousPrimary = process.env[brack!.envVar];
  const previousLegacy = process.env.AWIN_FEED_URL_CH;
  delete process.env[brack!.envVar];
  process.env.AWIN_FEED_URL_CH = "https://example.com/brack.csv";

  try {
    assert.equal(resolveFeedRemoteUrl(brack!), "https://example.com/brack.csv");
    assert.equal(getFeedMode(brack!), "production");
  } finally {
    if (previousPrimary === undefined) delete process.env[brack!.envVar];
    else process.env[brack!.envVar] = previousPrimary;
    if (previousLegacy === undefined) delete process.env.AWIN_FEED_URL_CH;
    else process.env.AWIN_FEED_URL_CH = previousLegacy;
  }
});

test("integration summary exposes per-merchant feed status", () => {
  const summary = getIntegrationSummary();
  assert.equal(summary.merchants.length, MERCHANT_FEEDS.length);
  assert.equal(summary.hasFeedData, true);
  assert.equal(summary.sampleFeeds.length, MERCHANT_FEEDS.length);
  assert.equal(getMerchantFeedStatuses().every((merchant) => merchant.sampleAvailable), true);
});
