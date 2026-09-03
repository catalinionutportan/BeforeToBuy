import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { isCacheOnlyFeed, MERCHANT_FEEDS } from "@/lib/merchant-integrations";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-dji-us.csv");

describe("AWIN DJI US feed", () => {
  it("parses sample rows with affiliate deep links and camera categories", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(Readable.from([csv]), "US", "us-dji", "sample");

    expect(parsed.products.length).toBeGreaterThanOrEqual(4);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName.toLowerCase()).toContain("dji");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("USD");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(parsed.products.map((p) => p.category)).toEqual(
      expect.arrayContaining(["drones-quadcopters", "photo-action", "photo-gimbals", "photo-microphones"])
    );
  });

  it("registers enabled DJI feed with AWIN feed id (no hardcoded API key)", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "us-dji");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.awinFeedId).toBe("116475");
    expect(feed?.awinLanguage).toBe("en");
    expect(feed?.defaultRemoteUrl).toBeUndefined();
    expect(feed?.country).toBe("US");
    expect(feed?.cacheOnly).toBe(true);
    expect(isCacheOnlyFeed(feed!)).toBe(true);
  });
});
