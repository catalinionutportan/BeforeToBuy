import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { clearFeedCacheForTests, getFeedProducts } from "@/lib/merchant-feeds";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-geepas-gb.csv");

describe("AWIN Geepas UK feed", () => {
  it("parses sample rows with affiliate deep links and Shopify images", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(
      Readable.from([csv]),
      "GB",
      "gb-geepas",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(2);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName).toContain("Geepas");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("GBP");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(first?.image).toContain("cdn.shopify.com");
    expect(first?.category).not.toBe("unmapped");
  });

  it("registers enabled Geepas feed with AWIN feed id (no hardcoded API key)", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "gb-geepas");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.awinFeedId).toBe("92363");
    expect(feed?.defaultRemoteUrl).toBeUndefined();
    expect(feed?.country).toBe("GB");
  });

  it("getFeedProducts loads GB Geepas sample in tests", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("GB");
    expect(result.merchantProductCounts["gb-geepas"]).toBeGreaterThanOrEqual(2);
  });
});
