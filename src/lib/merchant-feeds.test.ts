import { describe, it, expect, vi } from 'vitest';
import { parseGalaxusJsonFeed } from './feed-parser';
import * as feedLoader from './feed-loader'; // Import all from feed-loader
import { MERCHANT_FEEDS } from './merchant-integrations';
import { clearFeedCacheForTests, getFeedProducts } from './merchant-feeds';
import { Product, MappingLogEntry } from '@/types';
import { Readable } from 'stream'; // Import Readable stream


  const generateJsonFeed = (baseGtin: number, merchantId: string, title: string, merchantCategory: string, count: number) => {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push({
        "gtin": String(baseGtin + parseInt(merchantId.replace('ch-','').split('-')[0], 36) + i),
        "title": `${merchantId} ${title} ${i + 1} - Unique`,
        "description": "Test",
        "brand": "Apple",
        "price_chf": 1,
        "stock_status": "in_stock",
        "product_url": "https://example.com",
        "image_url":"https://example.com/i.jpg",
        "merchant_category": merchantCategory,
        "branch_availability": [],
      });
    }
    return JSON.stringify(products);
  };

  const generateCsvFeed = (baseId: number, merchantId: string, title: string, merchantCategory: string, count: number) => {
    let csv = `aw_product_id,product_name,description,merchant_name,search_price,store_price,currency,aw_deep_link,merchant_image_url,category_name,brand_name,in_stock,delivery_cost\n`;
    for (let i = 0; i < count; i++) {
      csv += `${baseId + parseInt(merchantId.replace('ch-','').split('-')[0], 36) + i},"${merchantId} ${title} ${i + 1} - Unique","Test","TestMerchant",1,1,CHF,https://example.com,https://example.com/i.jpg,${merchantCategory},Apple,1,0\n`;
    }
    return csv;
  };

  return {
    ...actual,
    fetchFeedContent: vi.fn(async (feed) => {
      let generatedProductCount = 0;
      let feedContent = '';
      if (feed.merchantId === 'ch-digitec') {
        generatedProductCount = 2;
        feedContent = generateJsonFeed(1000, feed.merchantId, "Sample Digitec Phone", "Mobile & Smartphones", generatedProductCount);
      } else if (feed.merchantId === 'ch-brack') {
        generatedProductCount = 6;
        feedContent = generateCsvFeed(2000, feed.merchantId, "Phone", "Smartphones", generatedProductCount);
      } else if (feed.merchantId === 'ch-galaxus') {
        generatedProductCount = 2;
        feedContent = generateJsonFeed(3000, feed.merchantId, "Sample Galaxus Laptop", "Laptops", generatedProductCount);
      } else if (feed.merchantId === 'ch-fust') {
        generatedProductCount = 2;
        feedContent = generateCsvFeed(4000, feed.merchantId, "TV", "Televisions", generatedProductCount);
      } else if (feed.merchantId === 'ch-interdiscount') {
        generatedProductCount = 2;
        feedContent = generateCsvFeed(5000, feed.merchantId, "Tablet", "Tablets", generatedProductCount);
      } else if (feed.merchantId === 'ch-mediamarkt') {
        generatedProductCount = 2;
        feedContent = generateJsonFeed(6000, feed.merchantId, "Sample Mediamarkt Camera", "Cameras", generatedProductCount);
      }
      return Readable.from(Buffer.from(feedContent)); // Return a Readable stream from Buffer
    }),
  };
});

describe('Merchant Feed Processing', () => {
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

    const digitecParsed = await feedLoader.parseConfiguredFeed(
      digitec!,
      Readable.from([`[{"gtin":"1","title":"Phone","description":"","brand":"Apple","price_chf":1,"stock_status":"in_stock","product_url":"https://example.com","image_url":"https://example.com/i.jpg","merchant_category":"Smartphones"}]`]),
      "CH",
      "sample"
    );
    expect(digitecParsed.products.length).toBe(2);

    const brackParsed = await feedLoader.parseConfiguredFeed(
      brack!,
      Readable.from([`aw_product_id,product_name,description,merchant_name,search_price,store_price,currency,aw_deep_link,merchant_image_url,category_name,brand_name,in_stock,delivery_cost\n1,"Phone","Test","Brack",10,10,CHF,https://example.com,https://example.com/i.jpg,Smartphones,Apple,1,0`]),
      "CH",
      "sample"
    );
    expect(brackParsed.products.length).toBe(6);
  });

  it("getFeedProducts loads all CH sample merchant feeds", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("CH");

    // The product merging logic (mergeFeedProductsByIdentity) identifies 3 products as duplicates
    // due to canonical identity matching, resulting in 13 unique products from the 16 generated.
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