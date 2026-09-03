import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { isCacheOnlyFeed, MERCHANT_FEEDS } from "@/lib/merchant-integrations";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-gigasport-ch.csv");

describe("AWIN Gigasport CH feed", () => {
  it("parses sample rows with affiliate deep links and sport categories", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(
      Readable.from([csv]),
      "CH",
      "ch-gigasport",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(4);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName.toLowerCase()).toContain("gigasport");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("CHF");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(parsed.products.map((p) => p.category)).toEqual(
      expect.arrayContaining([
        "fashion-women-activewear",
        "fashion-shoes-men-sport",
        "mobility-accessories",
        "fashion-shoes-kids-sport",
      ])
    );
  });

  it("registers enabled Gigasport feed with AWIN feed id (no hardcoded API key)", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "ch-gigasport");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.awinFeedId).toBe("51705");
    expect(feed?.awinLanguage).toBe("de");
    expect(feed?.defaultRemoteUrl).toBeUndefined();
    expect(feed?.country).toBe("CH");
    expect(feed?.heavy).toBe(true);
    expect(isCacheOnlyFeed(feed!)).toBe(true);
  });
});
