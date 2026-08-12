import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parseAwinCsvFeedStream } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";

const samplePath = path.join(process.cwd(), "src/data/sample-awin-reifencom-ch.csv");

describe("AWIN Reifen.com CH feed", () => {
  it("parses sample rows with affiliate deep links and CHF prices", async () => {
    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = await parseAwinCsvFeedStream(
      Readable.from([csv]),
      "CH",
      "ch-reifencom",
      "sample"
    );

    expect(parsed.products.length).toBeGreaterThanOrEqual(3);
    const first = parsed.products[0];
    expect(first?.offers[0]?.storeName.toLowerCase()).toContain("reifen");
    expect(first?.offers[0]?.purchaseUrl).toContain("awin1.com");
    expect(first?.offers[0]?.currency).toBe("CHF");
    expect(first?.offers[0]?.inStock).toBe(true);
    expect(first?.category).toBe("auto-tires-wheels");
  });

  it("registers enabled Reifen.com feed with AWIN feed id (no hardcoded API key)", () => {
    const feed = MERCHANT_FEEDS.find((item) => item.merchantId === "ch-reifencom");
    expect(feed?.enabled).not.toBe(false);
    expect(feed?.awinFeedId).toBe("24181");
    expect(feed?.awinLanguage).toBe("de");
    expect(feed?.defaultRemoteUrl).toBeUndefined();
    expect(feed?.country).toBe("CH");
    expect(feed?.heavy).toBe(true);
  });
});
