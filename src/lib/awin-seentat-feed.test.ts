import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { clearFeedCacheForTests, getFeedProducts } from "@/lib/merchant-feeds";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-seentat-gb.csv");

describe("AWIN Seentat UK feed", () => {
  it("parses sample rows with affiliate deep links and categories", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(
      Readable.from([csv]),
      "GB",
      "gb-seentat",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName).toBe("Seentat UK");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("GBP");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(first?.category).not.toBe("unmapped");
  });

  it("registers enabled Seentat feed with default remote URL", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "gb-seentat");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.defaultRemoteUrl).toContain("fid/115553");
    expect(feed?.country).toBe("GB");
  });

  it("getFeedProducts loads GB Seentat sample in tests", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("GB");
    expect(result.merchantProductCounts["gb-seentat"]).toBeGreaterThanOrEqual(3);
  });
});
