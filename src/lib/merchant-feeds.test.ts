import { describe, it, expect } from "vitest";
import { createReadStream } from "node:fs";
import path from "node:path";
import { parseGalaxusJsonFeed } from "./feed-parser";
import { parseConfiguredFeed } from "./feed-loader";
import { MERCHANT_FEEDS } from "./merchant-integrations";
import { clearFeedCacheForTests, getFeedProducts } from "./merchant-feeds";

function sampleStream(filename: string) {
  return createReadStream(path.join(process.cwd(), "src", "data", filename), {
    encoding: "utf8",
  });
}

describe("Merchant Feed Processing", () => {
  it("Galaxus JSON sample parses products with pickup offers", () => {
    const sample = `[{
      "gtin":"123",
      "title":"Sample Digitec Phone",
      "description":"Test",
      "brand":"Apple",
      "price_chf":999,
      "stock_status":"in_stock",
      "product_url":"https://www.digitec.ch/en/sample",
      "image_url":"https://example.com/image.jpg",
      "merchant_category":"Mobile & Smartphones",
      "branch_availability":[{"store_name":"Digitec Zurich","city":"Zurich","lat":47.37,"lng":8.54}]
    }]`;

    const parsed = parseGalaxusJsonFeed(sample, "CH", "ch-digitec", "sample");
    expect(parsed.products.length).toBe(1);
    expect(parsed.products[0]?.category).toBe("mobile-smartphones");
    expect(parsed.products[0]?.offers.length).toBe(2);
    expect(parsed.products[0]?.offers.some((offer) => offer.type === "local_pickup")).toBe(true);
  });

  it("configured feed parser dispatches by provider", async () => {
    const digitec = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-digitec");
    expect(digitec).toBeDefined();
    const brack = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-brack");
    expect(brack).toBeDefined();

    const digitecParsed = await parseConfiguredFeed(
      digitec!,
      sampleStream(digitec!.sampleFile!),
      "CH",
      "sample"
    );
    expect(digitecParsed.products.length).toBe(2);

    const brackParsed = await parseConfiguredFeed(
      brack!,
      sampleStream(brack!.sampleFile!),
      "CH",
      "sample"
    );
    expect(brackParsed.products.length).toBe(6);
  });

  it("getFeedProducts loads all CH sample merchant feeds", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("CH");

    // Real sample feeds share 3 valid EANs/GTINs across merchants
    // (MacBook, Sony WH-1000XM5, Galaxy S24 Ultra) → 16 rows merge to 13 products.
    expect(result.products.length).toBe(13);
    expect(result.sources.includes("sample")).toBe(true);
    expect(result.merchantProductCounts["ch-brack"]).toBe(6);
    expect(result.merchantProductCounts["ch-digitec"]).toBe(2);
    expect(result.merchantProductCounts["ch-galaxus"]).toBe(2);
    expect(result.merchantProductCounts["ch-fust"]).toBe(2);
    expect(result.merchantProductCounts["ch-interdiscount"]).toBe(2);
    expect(result.merchantProductCounts["ch-mediamarkt"]).toBe(2);
  });
});
