import { describe, it, expect, vi, afterEach } from "vitest";
import { createReadStream } from "node:fs";
import path from "node:path";
import { parseGalaxusJsonFeed } from "./feed-parser";
import { parseConfiguredFeed } from "./feed-loader";
import { isCacheOnlyFeed, MERCHANT_FEEDS } from "./merchant-integrations";
import {
  clearFeedCacheForTests,
  compactFeedCacheForRedis,
  fitFeedCacheForRedis,
  getFeedProducts,
} from "./merchant-feeds";
import type { Product } from "@/types";

function sampleStream(filename: string) {
  return createReadStream(path.join(process.cwd(), "src", "data", filename), {
    encoding: "utf8",
  });
}

describe("Merchant Feed Processing", () => {
  afterEach(() => {
    clearFeedCacheForTests();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("Galaxus JSON sample parses online offers", () => {
    const sample = `[{
      "gtin":"123",
      "title":"Sample Digitec Phone",
      "description":"Test",
      "brand":"Apple",
      "price_chf":999,
      "stock_status":"in_stock",
      "product_url":"https://www.digitec.ch/en/sample",
      "image_url":"https://example.com/image.jpg",
      "merchant_category":"Mobile & Smartphones"
    }]`;

    const parsed = parseGalaxusJsonFeed(sample, "CH", "ch-digitec", "sample");
    expect(parsed.products.length).toBe(1);
    expect(parsed.products[0]?.category).toBe("mobile-smartphones");
    expect(parsed.products[0]?.offers.length).toBe(1);
    expect(parsed.products[0]?.offers.every((offer) => offer.type === "online")).toBe(true);
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

  it("getFeedProducts loads live CH sample catalogues (baby-walz + Reifen.com)", async () => {
    clearFeedCacheForTests();
    const result = await getFeedProducts("CH");

    expect(result.products.length).toBeGreaterThanOrEqual(6);
    expect(result.merchantProductCounts["ch-babywalz"]).toBeGreaterThanOrEqual(3);
    expect(result.merchantProductCounts["ch-reifencom"]).toBeGreaterThanOrEqual(3);
    expect(result.merchantProductCounts["ch-brack"]).toBeUndefined();
  });

  it("keeps evoMAG and Scule365 registered but heavy/cache-only (offline import)", () => {
    const evomag = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ro-evomag");
    expect(evomag).toBeDefined();
    expect(evomag!.enabled).toBe(false);
    expect(isCacheOnlyFeed(evomag!)).toBe(true);

    const scule365 = MERCHANT_FEEDS.find((feed) => feed.merchantId === "ro-scule365");
    expect(scule365).toBeDefined();
    expect(isCacheOnlyFeed(scule365!)).toBe(true);
    expect(scule365!.heavy).toBe(true);
  });

  it("request path never fetches remote evoMAG CSV on cache miss", async () => {
    clearFeedCacheForTests();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response("Product Name\n", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const previousVitest = process.env.VITEST;
    const previousForce = process.env.FORCE_SAMPLE_FEEDS;
    const previousUrl = process.env.TWO_PERFORMANT_FEED_URL_RO_EVOMAG;

    // Simulate production request path: remote URL configured, no Vitest sample shortcut.
    delete process.env.VITEST;
    delete process.env.FORCE_SAMPLE_FEEDS;
    process.env.TWO_PERFORMANT_FEED_URL_RO_EVOMAG = "https://example.com/evomag-huge.csv";

    try {
      const result = await getFeedProducts("RO");
      const fetchedUrls = fetchMock.mock.calls.map((call) => String(call[0] ?? ""));
      expect(fetchedUrls.some((url) => url.includes("evomag-huge") || url.includes("9519e6c41"))).toBe(
        false
      );
      expect(result.merchantProductCounts["ro-evomag"] ?? 0).toBe(0);
    } finally {
      if (previousVitest === undefined) delete process.env.VITEST;
      else process.env.VITEST = previousVitest;
      if (previousForce === undefined) delete process.env.FORCE_SAMPLE_FEEDS;
      else process.env.FORCE_SAMPLE_FEEDS = previousForce;
      if (previousUrl === undefined) delete process.env.TWO_PERFORMANT_FEED_URL_RO_EVOMAG;
      else process.env.TWO_PERFORMANT_FEED_URL_RO_EVOMAG = previousUrl;
    }
  });

  it("compacts Redis feed cache by truncating descriptions and bulky fields", () => {
    const bulky: Product = {
      id: "feed-ro-evomag-1",
      title: "Sample SSD",
      description: "x".repeat(4_000),
      brand: "Samsung",
      image: "https://static2.evomag.ro/img?file=x.jpg&sign=abc",
      category: "peripherals-storage",
      canonicalKey: "brand:samsung:title:" + "y".repeat(200),
      categoryAssignment: {
        method: "merchant-exact",
        confidence: 0.98,
        rawCategory: "Hard Disk-uri / SSD-uri " + "z".repeat(80),
      },
      targetCountries: ["RO"],
      catalogSource: "production-live",
      offers: [
        {
          id: "o1",
          storeName: "evoMAG.ro",
          price: 199,
          currency: "RON",
          inStock: true,
          deliveryTime: "2-5 zile lucrătoare cu detalii foarte lungi despre curier",
          deliveryCost: 15,
          purchaseUrl: "https://example.com/p/1",
          affiliateNetwork: "2Performant Romania",
          type: "online",
          source: "production-live",
          feedMerchantId: "ro-evomag",
          merchantProductId: "1",
          badge: "Production feed",
        },
      ],
    };

    const entry = {
      fetchedAt: Date.now(),
      source: "remote" as const,
      mappingLog: [
        {
          merchantId: "ro-evomag",
          productId: "1",
          title: "Sample",
          rawCategory: "SSD",
          method: "merchant-exact" as const,
          confidence: 0.9,
          categoryId: "peripherals-storage",
          mappedAt: "2026-08-08T00:00:00.000Z",
        },
      ],
      products: [bulky],
    };

    const compact = compactFeedCacheForRedis(entry);
    expect(compact.mappingLog).toEqual([]);
    expect(compact.products[0]?.description.length).toBeGreaterThan(0);
    expect(compact.products[0]?.description.length).toBeLessThanOrEqual(480);
    expect(compact.products[0]?.description.endsWith("…")).toBe(true);
    expect(compact.products[0]?.canonicalKey).toBeUndefined();
    expect(compact.products[0]?.categoryAssignment?.rawCategory).toBeUndefined();
    expect(compact.products[0]?.offers[0]?.purchaseUrl).toBe("https://example.com/p/1");
    expect(Object.prototype.hasOwnProperty.call(compact.products[0]?.offers[0] ?? {}, "storeLogo")).toBe(
      false
    );

    const before = Buffer.byteLength(JSON.stringify(entry), "utf8");
    const after = Buffer.byteLength(JSON.stringify(compact), "utf8");
    expect(after).toBeLessThan(before * 0.35);
  });

  it("fits oversized Redis payloads under the soft Upstash budget", () => {
    const products: Product[] = Array.from({ length: 200 }, (_, i) => ({
      id: `p-${i}`,
      title: `Product ${i} ${"title ".repeat(20)}`,
      description: "desc ".repeat(400),
      brand: "Brand",
      image: `https://static2.evomag.ro/img?file=${i}.jpg&sign=abc`,
      category: "mobile-smartphones",
      targetCountries: ["RO"] as const,
      catalogSource: "production-live" as const,
      offers: [
        {
          id: `o-${i}`,
          storeName: "evoMAG.ro",
          price: 100 + i,
          currency: "RON",
          inStock: true,
          deliveryTime: "2-5 zile",
          deliveryCost: 0,
          purchaseUrl: `https://example.com/${i}`,
          affiliateNetwork: "2Performant Romania",
          type: "online" as const,
          source: "production-live" as const,
        },
      ],
    }));

    const entry = {
      fetchedAt: Date.now(),
      source: "remote" as const,
      mappingLog: [],
      products,
    };

    const softMax = 80_000;
    const { payload, bytes, trimmed } = fitFeedCacheForRedis(entry, softMax);
    expect(trimmed).toBe(true);
    expect(bytes).toBeLessThanOrEqual(softMax);
    expect(payload.products.length).toBeGreaterThan(0);
    expect(payload.products.length).toBeLessThan(products.length);
    expect(payload.products.every((p) => p.description.length <= 480)).toBe(true);
  });
});
