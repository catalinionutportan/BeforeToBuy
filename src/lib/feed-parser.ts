import { CountryCode, Offer, OfferSource, Product, PromoCoupon } from "@/types";
import { mapToBeforeToBuyCategoryWithMetadata } from "@/lib/category-mapper";
import { createMappingLogEntry, type MappingLogEntry } from "@/lib/mapping-log";
import { resolveGtin } from "@/lib/product-identity/gtin";
import { enrichProductIdentity } from "@/lib/product-identity/merge-products";
import { enrichOfferPricing } from "@/lib/pricing/total-price";
import {
  SAFE_IMAGE_FALLBACK,
  sanitizeCommercialUrl,
  validateFeedUrl,
  logRejectedFeedUrl,
} from "@/lib/feed-url-policy";
import {
  assertJsonByteLimit,
  BodyTooLargeError,
  MAX_JSON_FEED_BYTES,
} from "@/lib/request-body-limits";
import csv from "csv-parser";
import type { Readable } from "node:stream";
import chain from 'stream-chain';
import {streamArray} from 'stream-json/streamers/stream-array.js';

/**
 * Standard interface for raw item inside an AWIN Datafeed (CSV / XML)
 */
export interface RawAwinFeedItem {
  aw_product_id: string;
  product_name: string;
  description: string;
  merchant_name: string;
  search_price: string;
  store_price: string;
  rrp_price?: string; // Recommended Retail Price (Original Price)
  currency: string;
  aw_deep_link: string; // Affiliate link
  merchant_image_url: string;
  aw_image_url?: string;
  /** Merchant aisle (Seentat etc.) — prefer over AWIN taxonomy `category_name`. */
  merchant_category?: string;
  category_name: string;
  brand_name?: string;
  in_stock?: string; // "1" or "0" — often omitted; treat missing as in stock
  delivery_cost?: string;
  promo_code?: string;
  ean?: string;
  gtin?: string;
}

/**
 * Standard interface for raw item inside a Galaxus Merchant CSV/JSON Feed
 */
export interface RawGalaxusFeedItem {
  gtin: string;
  title: string;
  description: string;
  brand: string;
  price_chf: number;
  original_price_chf?: number;
  stock_status: string;
  product_url: string;
  image_url: string;
  merchant_category?: string;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"|"$/g, ""));
}

function readAwinGtin(row: Record<string, string>): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.toLowerCase();
    if (
      (normalizedKey === "ean" ||
        normalizedKey === "gtin" ||
        normalizedKey === "ean13" ||
        normalizedKey === "product_gtin" ||
        normalizedKey === "upc") &&
      value
    ) {
      return resolveGtin(value);
    }
  }
  return undefined;
}

function finalizeFeedProducts(products: Product[]): Product[] {
  return products.map(enrichProductIdentity);
}

function buildAwinOfferFromRow(
  row: RawAwinFeedItem,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Offer | null {
  const isProduction = source === "production-live";
  const price = parseFloat(row.search_price || row.store_price || "0");
  const originalPrice = isProduction && row.rrp_price ? parseFloat(row.rrp_price) : undefined;
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const stockRaw = (row.in_stock ?? "").trim().toLowerCase();
  const inStock =
    stockRaw === "" || stockRaw === "1" || stockRaw === "true" || stockRaw === "yes";

  const purchaseUrl = sanitizeCommercialUrl(row.aw_deep_link || "", feedMerchantId);
  if (!purchaseUrl) return null;

  return enrichOfferPricing({
    id: `awin-${row.aw_product_id}`,
    storeName: row.merchant_name || "AWIN Merchant",
    price,
    originalPrice,
    discountPercentage,
    currency: row.currency || "CHF",
    inStock,
    deliveryTime: "1-2 Work Days",
    deliveryCost: parseFloat(row.delivery_cost || "0"),
    purchaseUrl,
    affiliateNetwork: `AWIN ${targetCountry}`,
    type: "online",
    promoCode: isProduction ? row.promo_code : undefined,
    source,
    feedMerchantId,
    merchantProductId: row.aw_product_id,
    badge: isProduction
      ? discountPercentage && discountPercentage >= 20
        ? `-${discountPercentage}% feed discount`
        : "Production feed"
      : "Sample feed",
  });
}

/** Ingest one AWIN row into `productsMap`/`mappingLog`, shared by the string and stream parsers. */
function ingestAwinRow(
  row: RawAwinFeedItem,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  productsMap: Map<string, Product>,
  mappingLog: MappingLogEntry[]
): void {
  if (!row.aw_product_id || !row.product_name) return;

  const isProduction = source === "production-live";
  const offer = buildAwinOfferFromRow(row, targetCountry, feedMerchantId, source);
  if (!offer) return;
  const gtin = readAwinGtin(row as unknown as Record<string, string>);
  const cCode = targetCountry.toLowerCase();
  const productId = gtin ? `feed-${cCode}-gtin-${gtin}` : `feed-${feedMerchantId}-${row.aw_product_id}`;

  const existing = productsMap.get(productId);
  if (existing) {
    existing.offers.push(offer);
    return;
  }

  const merchantAisle = (row.merchant_category || "").trim();
  const taxonomyAisle = (row.category_name || "").trim();
  // Belando brand folders ("Marken > Goldwell") are not product aisles — use AWIN taxonomy.
  const rawCategory =
    feedMerchantId === "ch-belando" && /^marken\s*>/i.test(merchantAisle)
      ? taxonomyAisle || merchantAisle || undefined
      : merchantAisle || taxonomyAisle || undefined;

  const categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: feedMerchantId,
    merchantCategory: rawCategory,
    title: row.product_name,
    description: row.description,
    brand: row.brand_name,
  });

  mappingLog.push(
    createMappingLogEntry({
      productId,
      merchantId: feedMerchantId,
      title: row.product_name,
      rawCategory,
      mapping: categoryMapping,
    })
  );

  productsMap.set(productId, {
    id: productId,
    title: row.product_name,
    description: row.description || row.product_name,
    gtin,
    category: categoryMapping.categoryId,
    categoryAssignment: {
      method: categoryMapping.method,
      confidence: categoryMapping.confidence,
      rawCategory: categoryMapping.rawCategory,
      proposedCategoryId: categoryMapping.proposedCategoryId,
    },
    brand: row.brand_name || "Generic",
    image: (() => {
      for (const candidate of [row.merchant_image_url, row.aw_image_url]) {
        if (!candidate?.trim()) continue;
        const result = validateFeedUrl(candidate, "image", { feedMerchantId });
        if (result.ok) return result.normalized;
      }
      if (row.merchant_image_url || row.aw_image_url) {
        logRejectedFeedUrl(
          "image",
          row.merchant_image_url || row.aw_image_url,
          "no-allowlisted-candidate",
          feedMerchantId
        );
      }
      return SAFE_IMAGE_FALLBACK;
    })(),
    targetCountries: [targetCountry],
    isFlashDeal: isProduction && offer.discountPercentage ? offer.discountPercentage >= 15 : false,
    catalogSource: source,
    offers: [offer],
  });
}

/**
 * Parser for AWIN CSV / Datafeed lines
 */
export function parseAwinCsvFeed(
  csvContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { products: [], mappingLog: [] };

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    ingestAwinRow(
      row as unknown as RawAwinFeedItem,
      targetCountry,
      feedMerchantId,
      source,
      productsMap,
      mappingLog
    );
  }

  return {
    products: finalizeFeedProducts(Array.from(productsMap.values())),
    mappingLog,
  };
}

/**
 * Streaming parser for AWIN CSV / Datafeed lines
 */
export async function parseAwinCsvFeedStream(
  csvStream: NodeJS.ReadableStream,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];

  return new Promise((resolve, reject) => {
    csvStream
      .pipe(csv())
      .on('data', (row: RawAwinFeedItem) => {
        ingestAwinRow(row, targetCountry, feedMerchantId, source, productsMap, mappingLog);
      })
      .on('end', () => {
        resolve({
          products: finalizeFeedProducts(Array.from(productsMap.values())),
          mappingLog,
        });
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
}

function galaxusStoreName(feedMerchantId: string): string {
  if (feedMerchantId === "ch-galaxus") return "Galaxus.ch";
  return "Digitec.ch";
}

function galaxusAffiliateNetwork(feedMerchantId: string): string {
  // Merchant product-data feed label — not an active affiliate/publisher relationship.
  return feedMerchantId === "ch-galaxus"
    ? "Galaxus merchant product feed (not affiliate)"
    : "Digitec merchant product feed (not affiliate)";
}

function buildGalaxusOffersFromRow(
  row: RawGalaxusFeedItem,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  storeName: string
): Offer[] {
  const isProduction = source === "production-live";
  const price = Number(row.price_chf) || 0;
  const originalPrice =
    isProduction && row.original_price_chf && row.original_price_chf > price
      ? row.original_price_chf
      : undefined;
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const purchaseUrl = sanitizeCommercialUrl(row.product_url || "", feedMerchantId);
  if (!purchaseUrl) return [];

  const onlineOffer: Offer = enrichOfferPricing({
    id: `galaxus-${row.gtin}-online`,
    storeName,
    price,
    originalPrice,
    discountPercentage,
    currency: "CHF",
    inStock: row.stock_status !== "out_of_stock" && row.stock_status !== "0",
    deliveryTime: "1-3 Work Days",
    deliveryCost: 0,
    purchaseUrl,
    affiliateNetwork: galaxusAffiliateNetwork(feedMerchantId),
    type: "online",
    source,
    feedMerchantId,
    merchantProductId: row.gtin,
    badge: isProduction ? "Production feed" : "Sample feed",
  });

  return [onlineOffer];
}

/** Ingest one Galaxus row into `productsMap`/`mappingLog`, shared by the string and stream parsers. */
function ingestGalaxusRow(
  row: RawGalaxusFeedItem,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  storeName: string,
  productsMap: Map<string, Product>,
  mappingLog: MappingLogEntry[]
): void {
  if (!row.gtin || !row.title) return;

  const offers = buildGalaxusOffersFromRow(row, feedMerchantId, source, storeName);
  if (offers.length === 0) return;
  const isProduction = source === "production-live";
  const discountPercentage = offers[0]?.discountPercentage;

  const cCode = targetCountry.toLowerCase();
  const productId = `feed-${cCode}-gtin-${row.gtin}`;
  const categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: feedMerchantId,
    merchantCategory: row.merchant_category,
    title: row.title,
    description: row.description,
    brand: row.brand,
  });

  mappingLog.push(
    createMappingLogEntry({
      productId,
      merchantId: feedMerchantId,
      title: row.title,
      rawCategory: row.merchant_category,
      mapping: categoryMapping,
    })
  );

  productsMap.set(productId, {
    id: productId,
    title: row.title,
    description: row.description || row.title,
    gtin: resolveGtin(row.gtin),
    category: categoryMapping.categoryId,
    categoryAssignment: {
      method: categoryMapping.method,
      confidence: categoryMapping.confidence,
      rawCategory: categoryMapping.rawCategory,
      proposedCategoryId: categoryMapping.proposedCategoryId,
    },
    brand: row.brand || "Generic",
    image: (() => {
      const result = validateFeedUrl(row.image_url, "image", { feedMerchantId });
      if (result.ok) return result.normalized;
      if (row.image_url) {
        logRejectedFeedUrl("image", row.image_url, result.reason, feedMerchantId);
      }
      return SAFE_IMAGE_FALLBACK;
    })(),
    targetCountries: [targetCountry],
    isFlashDeal: isProduction && discountPercentage ? discountPercentage >= 15 : false,
    catalogSource: source,
    offers,
  });
}

/**
 * Parser for Galaxus Merchant JSON feeds (Digitec / Galaxus).
 */
export function parseGalaxusJsonFeed(
  jsonContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  let rows: RawGalaxusFeedItem[] = [];
  try {
    assertJsonByteLimit(jsonContent, MAX_JSON_FEED_BYTES);
    const parsed = JSON.parse(jsonContent) as RawGalaxusFeedItem[] | { products: RawGalaxusFeedItem[] };
    rows = Array.isArray(parsed) ? parsed : parsed.products ?? [];
  } catch (error) {
    if (error instanceof BodyTooLargeError) throw error;
    return { products: [], mappingLog: [] };
  }

  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];
  const storeName = galaxusStoreName(feedMerchantId);

  for (const row of rows) {
    ingestGalaxusRow(row, targetCountry, feedMerchantId, source, storeName, productsMap, mappingLog);
  }

  return {
    products: finalizeFeedProducts(Array.from(productsMap.values())),
    mappingLog,
  };
}

/**
 * Streaming parser for Galaxus Merchant JSON feeds (Digitec / Galaxus).
 */
export async function parseGalaxusJsonFeedStream(
  jsonStream: NodeJS.ReadableStream,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];
  const storeName = galaxusStoreName(feedMerchantId);

  let totalBytes = 0;
  jsonStream.on("data", (chunk: string | Buffer) => {
    const byteLength =
      typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.length;
    totalBytes += byteLength;
    if (totalBytes > MAX_JSON_FEED_BYTES) {
      (jsonStream as Readable).destroy(new BodyTooLargeError(MAX_JSON_FEED_BYTES));
    }
  });

  const pipeline = chain([
    jsonStream,
    streamArray.withParser(),
  ] as Parameters<typeof chain>[0]);

  return new Promise((resolve, reject) => {
    pipeline.on('data', ({ value: row }: { value: RawGalaxusFeedItem }) => {
      ingestGalaxusRow(row, targetCountry, feedMerchantId, source, storeName, productsMap, mappingLog);
    });

    pipeline.on('end', () => {
      resolve({
        products: finalizeFeedProducts(Array.from(productsMap.values())),
        mappingLog,
      });
    });

    pipeline.on('error', (error: Error) => {
      reject(error);
    });
  });
}

/**
 * Sample Coupons Feed fetcher for AWIN & CJ Coupon API Stream
 *
 * TODO(coupons): wire this up to `fetchAwinPromotions` in `@/lib/api-connectors`
 * once an authenticated AWIN publisher ID/token pair is available. That
 * connector is a deliberate stub (returns `[]`) until then — do not hardcode
 * coupon codes here in the meantime, as they cannot be kept accurate/live.
 */
export function getActiveCouponsForCountry(_country: CountryCode): PromoCoupon[] {
  void _country;
  return [];
}
