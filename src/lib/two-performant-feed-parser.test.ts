import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import {
  firstImage,
  parseTwoPerformantCsvFeedStream,
} from "@/lib/two-performant-feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { parseConfiguredFeed } from "@/lib/feed-loader";
import { clearFeedCacheForTests, getFeedProducts } from "@/lib/merchant-feeds";

const rowentaSamplePath = path.join(process.cwd(), "src/data/sample-2performant-rowenta-ro.csv");
const scule365SamplePath = path.join(process.cwd(), "src/data/sample-2performant-scule365-ro.csv");

describe("firstImage", () => {
  it("keeps full CDN URL when multiple images are comma-separated", () => {
    const urls =
      "https://c.cdnmp.net/372758804/p/l/4/foo~1564.jpg, https://c.cdnmp.net/372758804/p/l/0/foo~1560.jpg";
    expect(firstImage(urls)).toBe("https://c.cdnmp.net/372758804/p/l/4/foo~1564.jpg");
  });
});

describe("2Performant Rowenta CSV feed", () => {
  it("parses sample products with affiliate deep links", async () => {
    const csv = fs.readFileSync(rowentaSamplePath, "utf8");
    const parsed = await parseTwoPerformantCsvFeedStream(
      Readable.from([csv]),
      "RO",
      "ro-rowenta",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    const offer = parsed.products[0]?.offers[0];
    expect(offer?.storeName).toBe("Rowenta.ro");
    expect(offer?.purchaseUrl).toContain("event.2performant.com");
    expect(offer?.currency).toBe("RON");
    expect(offer?.price).toBeGreaterThan(0);
  });

  it("configured feed loader dispatches TWO_PERFORMANT", async () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "ro-rowenta");
    expect(feed).toBeDefined();
    const csv = fs.readFileSync(rowentaSamplePath, "utf8");
    const parsed = await parseConfiguredFeed(feed!, csv, "RO", "production-live");
    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    expect(parsed.products[0]?.offers[0]?.source).toBe("production-live");
  });

  it("getFeedProducts loads RO Rowenta sample feed", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("RO");
    expect(result.merchantProductCounts["ro-rowenta"]).toBeGreaterThanOrEqual(3);
    expect(result.sources.includes("sample")).toBe(true);
  });
});

describe("2Performant Scule365 CSV feed", () => {
  it("parses narrow My Feeds CSV using unique= as product id", async () => {
    const csv = fs.readFileSync(scule365SamplePath, "utf8");
    const parsed = await parseTwoPerformantCsvFeedStream(
      Readable.from([csv]),
      "RO",
      "ro-scule365",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    const offer = parsed.products[0]?.offers[0];
    expect(offer?.storeName).toBe("Scule365.ro");
    expect(offer?.purchaseUrl).toContain("event.2performant.com");
    expect(offer?.merchantProductId).toMatch(/^[a-zA-Z0-9]+$/);
    expect(offer?.currency).toBe("RON");
    expect(offer?.price).toBeGreaterThan(0);
    expect(parsed.products[0]?.image).toMatch(/^https:\/\/c\.cdnmp\.net\//);
  });

  it("configured feed loader includes Scule365 TWO_PERFORMANT", async () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "ro-scule365");
    expect(feed?.defaultRemoteUrl).toContain("fcdbb3e99.csv");
    const csv = fs.readFileSync(scule365SamplePath, "utf8");
    const parsed = await parseConfiguredFeed(feed!, csv, "RO", "production-live");
    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    expect(parsed.products[0]?.offers[0]?.source).toBe("production-live");
  });

  it("getFeedProducts loads RO Scule365 sample feed", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("RO");
    expect(result.merchantProductCounts["ro-scule365"]).toBeGreaterThanOrEqual(3);
  });
});
