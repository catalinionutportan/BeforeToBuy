import assert from "node:assert/strict";
import test from "node:test";
import { parseGalaxusJsonFeed } from "./feed-parser";
import { parseConfiguredFeed } from "./feed-loader";
import { MERCHANT_FEEDS } from "./merchant-integrations";
import { clearFeedCacheForTests, getFeedProducts } from "./merchant-feeds";

test("Galaxus JSON sample parses products with pickup offers", () => {
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
  assert.equal(parsed.products.length, 1);
  assert.equal(parsed.products[0]?.category, "mobile-smartphones");
  assert.equal(parsed.products[0]?.offers.length, 2);
  assert.ok(parsed.products[0]?.offers.some((offer) => offer.type === "local_pickup"));
});

test("configured feed parser dispatches by provider", () => {
  const digitec = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-digitec");
  assert.ok(digitec);
  const brack = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ch-brack");
  assert.ok(brack);

  const digitecParsed = parseConfiguredFeed(
    digitec!,
    `[{"gtin":"1","title":"Phone","description":"","brand":"Apple","price_chf":1,"stock_status":"in_stock","product_url":"https://example.com","image_url":"https://example.com/i.jpg","merchant_category":"Smartphones"}]`,
    "CH",
    "sample"
  );
  assert.equal(digitecParsed.products.length, 1);

  const brackParsed = parseConfiguredFeed(
    brack!,
    `aw_product_id,product_name,description,merchant_name,search_price,store_price,currency,aw_deep_link,merchant_image_url,category_name,brand_name,in_stock,delivery_cost\n1,"Phone","Test","Brack",10,10,CHF,https://example.com,https://example.com/i.jpg,Smartphones,Apple,1,0`,
    "CH",
    "sample"
  );
  assert.equal(brackParsed.products.length, 1);
});

test("getFeedProducts loads all CH sample merchant feeds", async () => {
  clearFeedCacheForTests();
  const result = await getFeedProducts("CH");
  assert.ok(result.products.length >= 12);
  assert.equal(result.sources.includes("sample"), true);
  assert.equal(result.merchantProductCounts["ch-brack"], 6);
  assert.equal(result.merchantProductCounts["ch-digitec"], 2);
  assert.equal(result.merchantProductCounts["ch-galaxus"], 2);
  assert.equal(result.merchantProductCounts["ch-mediamarkt"], 2);
});
