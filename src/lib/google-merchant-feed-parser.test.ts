import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseGoogleMerchantXmlFeed } from "@/lib/google-merchant-feed-parser";
import { wrapScule365AffiliateUrl } from "@/lib/affiliate-links";
import { parseConfiguredFeed } from "@/lib/feed-loader";
import type { FeedConfig } from "@/lib/merchant-integrations";

const samplePath = path.join(process.cwd(), "src/data/sample-google-merchant-scule365-ro.xml");

/** Dormant Scule365 feed config — not in MERCHANT_FEEDS until re-wired publicly. */
const scule365Feed: FeedConfig = {
  provider: "GOOGLE_MERCHANT",
  country: "RO",
  merchantId: "ro-scule365",
  merchantName: "Scule365.ro",
  envVar: "GOOGLE_MERCHANT_FEED_URL_RO_SCULE365",
  sampleFile: "sample-google-merchant-scule365-ro.xml",
  sampleFormat: "xml",
};

describe("Google Merchant Scule365 feed (parser kept for re-enable)", () => {
  it("string parser maps sample products into DIY categories", () => {
    const xml = readFileSync(samplePath, "utf8");
    const parsed = parseGoogleMerchantXmlFeed(xml, "RO", "ro-scule365", "sample");
    expect(parsed.products.length).toBe(3);
    expect(parsed.products[0]?.offers[0]?.currency).toBe("RON");
    expect(parsed.products[0]?.offers[0]?.price).toBe(224.99);
    expect(parsed.products[0]?.offers[0]?.originalPrice).toBeUndefined();
    expect(parsed.products[0]?.offers[0]?.purchaseUrl).toContain("event.2performant.com");
    expect(parsed.products[0]?.offers[0]?.purchaseUrl).toContain(
      encodeURIComponent("https://www.scule365.ro/cumpara/")
    );
    expect(parsed.products.every((p) => p.category !== "unmapped")).toBe(true);
    expect(parsed.products[0]?.gtin).toBe("05949094056492");
  });

  it("production source keeps list price as originalPrice", () => {
    const xml = readFileSync(samplePath, "utf8");
    const parsed = parseGoogleMerchantXmlFeed(xml, "RO", "ro-scule365", "production-live");
    expect(parsed.products[0]?.offers[0]?.price).toBe(224.99);
    expect(parsed.products[0]?.offers[0]?.originalPrice).toBe(273.52);
  });

  it("wrapScule365AffiliateUrl encodes product deep links", () => {
    const url = wrapScule365AffiliateUrl("https://www.scule365.ro/cumpara/test-1");
    expect(url).toBe(
      "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=8e59c17b0&redirect_to=https%3A%2F%2Fwww.scule365.ro%2Fcumpara%2Ftest-1"
    );
  });

  it("configured feed loader still dispatches GOOGLE_MERCHANT", async () => {
    const xml = readFileSync(samplePath, "utf8");
    const parsed = await parseConfiguredFeed(scule365Feed, xml, "RO", "sample");
    expect(parsed.products.length).toBe(3);
  });
});
