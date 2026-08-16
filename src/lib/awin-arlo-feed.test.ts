import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { clearFeedCacheForTests, getFeedProducts } from "@/lib/merchant-feeds";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-arlo-gb.csv");

describe("AWIN Arlo Security UK feed", () => {
  it("parses sample rows with affiliate deep links and security categories", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(
      Readable.from([csv]),
      "GB",
      "gb-arlo",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName).toBe("Arlo Security UK");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("GBP");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(first?.category).toBe("smart-home-security");
  });

  it("registers enabled Arlo feed with AWIN feed id (no hardcoded API key)", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "gb-arlo");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.awinFeedId).toBe("112803");
    expect(feed?.defaultRemoteUrl).toBeUndefined();
    expect(feed?.country).toBe("GB");
    expect(feed?.heavy).not.toBe(true);
  });

  it("getFeedProducts loads GB Arlo sample in tests", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("GB");
    expect(result.merchantProductCounts["gb-arlo"]).toBeGreaterThanOrEqual(3);
  });
});
