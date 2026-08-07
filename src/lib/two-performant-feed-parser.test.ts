import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseTwoPerformantCsvFeedStream } from "@/lib/two-performant-feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { parseConfiguredFeed } from "@/lib/feed-loader";
import { clearFeedCacheForTests, getFeedProducts } from "@/lib/merchant-feeds";

const samplePath = path.join(process.cwd(), "src/data/sample-2performant-rowenta-ro.csv");

describe("2Performant Rowenta CSV feed", () => {
  it("parses sample products with affiliate deep links", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
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
    const csv = fs.readFileSync(samplePath, "utf8");
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
