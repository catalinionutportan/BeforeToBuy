import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { createGunzip } from "node:zlib";
import { CountryCode, Offer, OfferSource, Product } from "@/types";
import {
  getEnabledMerchantFeeds,
  isCacheOnlyFeed,
  resolveFeedRemoteUrl,
  type FeedConfig,
} from "@/lib/merchant-integrations";
import { parseConfiguredFeed } from "@/lib/feed-loader";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "@/lib/categories";
import { buildMappingReport, type MappingLogEntry, type MappingReport } from "@/lib/mapping-log";
import { mergeFeedProductsByIdentity } from "@/lib/product-identity/merge-products";
import { productMatchesSearchQuery } from "@/lib/product-search";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { diversifyProductCap } from "@/lib/feed-product-cap";
import { redisGetJson, redisSetJson } from "@/lib/redis-cache";

type FeedCacheEntry = {
  fetchedAt: number;
  products: Product[];
  mappingLog: MappingLogEntry[];
  source: "remote" | "sample";
};

export type LoadFeedOptions = {
  /**
   * Allow remote CSV/XML download. Request/SSR/API must leave this false for
   * heavy/cacheOnly feeds. Warm cron / CLI sets true.
   */
  allowRemoteFetch?: boolean;
  /** Skip memory + Redis and re-download (warm path). */
  forceRefresh?: boolean;
};

export type WarmFeedsResult = {
  ok: boolean;
  warmedAt: string;
  feeds: Array<{
    merchantId: string;
    feedKey?: string;
    productCount: number;
    source: "remote" | "sample" | "skipped" | "error";
    error?: string;
  }>;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 60 * 60;
/** Heavy feeds stay in Redis longer so request path can serve stale after warm. */
const HEAVY_REDIS_TTL_SECONDS = 7 * 24 * 60 * 60;
/** Upstash max request is 10MB — stay under 8MB so SET reliably succeeds. */
const REDIS_SOFT_MAX_BYTES = 8 * 1024 * 1024;
/** Abort normal feed downloads that blow past a safe serverless budget. */
const DEFAULT_MAX_DOWNLOAD_BYTES = 32 * 1024 * 1024;
/** evoMAG CSV is ~200MB — warm path only; still hard-cap runaway responses. */
const HEAVY_MAX_DOWNLOAD_BYTES = 250 * 1024 * 1024;

const feedCache = new Map<string, FeedCacheEntry>();

function memoryCacheKey(feed: FeedConfig): string {
  const slice = feed.feedKey ? `:${feed.feedKey}` : "";
  return `${feed.merchantId}${slice}:${feed.country}`;
}

function redisCacheKey(feed: FeedConfig): string {
  // v19: compact Redis shape (stripped descriptions) after Upstash 10MB SET failures on v18.
  const slice = feed.feedKey ? `:${feed.feedKey}` : "";
  return `feed:v19:${feed.merchantId}${slice}:${feed.country}`;
}

function feedLabel(feed: FeedConfig): string {
  return `${feed.merchantId}${feed.feedKey ? `:${feed.feedKey}` : ""}`;
}

function redisTtlForFeed(feed: FeedConfig): number {
  return isCacheOnlyFeed(feed) ? HEAVY_REDIS_TTL_SECONDS : CACHE_TTL_SECONDS;
}

function maxDownloadBytesForFeed(feed: FeedConfig): number {
  if (isCacheOnlyFeed(feed)) return HEAVY_MAX_DOWNLOAD_BYTES;
  const raw = process.env.FEED_MAX_DOWNLOAD_BYTES?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MAX_DOWNLOAD_BYTES;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_DOWNLOAD_BYTES;
}

/** Soft cap for huge catalogues (evoMAG ~100k) so Vercel serverless can finish. */
function maxProductsForFeed(feed: FeedConfig): number | null {
  if (feed.merchantId !== "ro-evomag") return null;
  const raw = process.env.EVOMAG_MAX_PRODUCTS?.trim();
  // Compact Redis cache keeps ~5k under 8MB; env can override.
  const parsed = raw ? Number.parseInt(raw, 10) : 5_000;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5_000;
}

function estimateJsonBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function compactOfferForRedis(offer: Offer): Offer {
  return {
    id: offer.id,
    storeName: offer.storeName,
    price: offer.price,
    originalPrice: offer.originalPrice,
    discountPercentage: offer.discountPercentage,
    currency: offer.currency,
    inStock: offer.inStock,
    deliveryTime: offer.deliveryTime ? offer.deliveryTime.slice(0, 48) : "",
    deliveryCost: offer.deliveryCost,
    totalPrice: offer.totalPrice,
    purchaseUrl: offer.purchaseUrl,
    affiliateNetwork: offer.affiliateNetwork,
    type: offer.type,
    source: offer.source,
    feedMerchantId: offer.feedMerchantId,
    merchantProductId: offer.merchantProductId,
    badge: offer.badge,
    fetchedAt: offer.fetchedAt,
  };
}

function compactProductForRedis(product: Product): Product {
  return {
    id: product.id,
    title: product.title,
    // Descriptions dominate evoMAG JSON (~14MB at 5k SKUs) and are unused on browse cards.
    description: "",
    gtin: product.gtin,
    variantKey: product.variantKey,
    category: product.category,
    categoryAssignment: product.categoryAssignment
      ? {
          method: product.categoryAssignment.method,
          confidence: product.categoryAssignment.confidence,
        }
      : undefined,
    image: product.image,
    brand: product.brand,
    offers: product.offers.map(compactOfferForRedis),
    targetCountries: product.targetCountries,
    isFlashDeal: product.isFlashDeal,
    basePrice: product.basePrice,
    catalogSource: product.catalogSource,
  };
}

/**
 * Slim feed entry for Upstash Redis (10MB request limit).
 * In-memory cache keeps the fuller parse; Redis only needs browse fields.
 */
export function compactFeedCacheForRedis(entry: FeedCacheEntry): FeedCacheEntry {
  return {
    fetchedAt: entry.fetchedAt,
    source: entry.source,
    mappingLog: [],
    products: entry.products.map(compactProductForRedis),
  };
}

/**
 * Ensure Redis payload stays under soft max by trimming product count if needed.
 * Memory cache is unaffected — callers keep the full `entry` in the Map.
 */
export function fitFeedCacheForRedis(
  entry: FeedCacheEntry,
  softMaxBytes = REDIS_SOFT_MAX_BYTES
): { payload: FeedCacheEntry; bytes: number; trimmed: boolean } {
  let payload = compactFeedCacheForRedis(entry);
  let bytes = estimateJsonBytes(payload);
  let trimmed = false;

  while (bytes > softMaxBytes && payload.products.length > 1) {
    const ratio = Math.min(0.9, (softMaxBytes / bytes) * 0.92);
    const keep = Math.max(1, Math.min(payload.products.length - 1, Math.floor(payload.products.length * ratio)));
    payload = { ...payload, products: payload.products.slice(0, keep) };
    bytes = estimateJsonBytes(payload);
    trimmed = true;
  }

  return { payload, bytes, trimmed };
}

async function readSampleFeed(filename: string): Promise<NodeJS.ReadableStream> {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  return createReadStream(filePath, { encoding: "utf8" });
}

function limitDownloadBytes(
  stream: Readable,
  maxBytes: number,
  label: string
): Readable {
  let bytes = 0;
  return stream.pipe(
    new Transform({
      transform(chunk, _encoding, callback) {
        bytes += chunk.length;
        if (bytes > maxBytes) {
          callback(
            new Error(
              `[merchant-feeds] download aborted for ${label}: exceeded ${maxBytes} bytes (~${Math.round(bytes / (1024 * 1024))}MB)`
            )
          );
          return;
        }
        callback(null, chunk);
      },
    })
  );
}

async function fetchRemoteFeed(
  url: string,
  feed: FeedConfig
): Promise<NodeJS.ReadableStream> {
  const provider = feed.provider;
  const label = feedLabel(feed);
  const accept =
    provider === "GALAXUS"
      ? "application/json, text/plain, */*"
      : provider === "GOOGLE_MERCHANT"
        ? "application/xml, text/xml, */*"
        : "text/csv, text/plain, application/gzip, */*";

  // evoMAG CSV is large — long timeout for 2P warm path; AWIN gzip feeds need moderate time.
  const timeoutMs =
    provider === "TWO_PERFORMANT" ? 180_000 : provider === "AWIN" ? 30_000 : 15_000;
  const retries = provider === "TWO_PERFORMANT" ? 1 : 2;
  const maxBytes = maxDownloadBytesForFeed(feed);

  const response = await fetchWithTimeout(
    url,
    {
      headers: { Accept: accept },
      next: { revalidate: 3600 },
    },
    { timeoutMs, retries }
  );

  if (!response.ok) {
    throw new Error(`Feed fetch failed (${response.status}) for ${url}`);
  }

  if (!response.body) {
    throw new Error(`Feed fetch returned empty body for ${url}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const declared = Number.parseInt(contentLength, 10);
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new Error(
        `[merchant-feeds] refusing download for ${label}: Content-Length ${declared} exceeds max ${maxBytes}`
      );
    }
  }

  // Node fetch returns a Web ReadableStream; csv-parser needs a Node stream.
  const nodeStream = Readable.fromWeb(
    response.body as import("node:stream/web").ReadableStream
  );

  const contentEncoding = (response.headers.get("content-encoding") || "").toLowerCase();
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const urlLooksGzip = /compression\/gzip/i.test(url);
  const decoded =
    contentEncoding.includes("gzip") ||
    contentType.includes("gzip") ||
    contentType.includes("application/x-gzip") ||
    urlLooksGzip
      ? nodeStream.pipe(createGunzip())
      : nodeStream;

  return limitDownloadBytes(decoded, maxBytes, label);
}

function filterFeedProducts(
  products: Product[],
  query?: string,
  category?: string
): Product[] {
  let filtered = products;

  if (category && category !== ALL_CATEGORIES_ID) {
    filtered = filtered.filter((product) => productMatchesCategoryFilter(product, category));
  }

  if (query && query.trim()) {
    filtered = filtered.filter((product) => productMatchesSearchQuery(product, query));
  }

  return filtered;
}

async function persistFeedToRedis(feed: FeedConfig, entry: FeedCacheEntry): Promise<void> {
  const label = feedLabel(feed);
  const { payload, bytes, trimmed } = fitFeedCacheForRedis(entry);

  if (trimmed) {
    console.warn(
      `[merchant-feeds] redis cache trimmed ${label} to ${payload.products.length} products (~${bytes} bytes) to fit Upstash limit`
    );
  }

  const ok = await redisSetJson(redisCacheKey(feed), payload, redisTtlForFeed(feed));
  if (!ok) {
    // Fail-soft: memory cache already holds the full entry for this instance.
    console.warn(
      `[merchant-feeds] redis set failed for ${label} (payload≈${bytes} bytes); serving from in-memory cache until warm Redis works`
    );
  }
}

async function loadFeedForMerchant(
  feed: FeedConfig,
  options: LoadFeedOptions = {}
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[]; source: "remote" | "sample" }> {
  const memKey = memoryCacheKey(feed);
  const label = feedLabel(feed);
  const allowRemoteFetch = options.allowRemoteFetch === true;
  const cacheOnlyRequest = isCacheOnlyFeed(feed) && !allowRemoteFetch;
  const forceRefresh = options.forceRefresh === true && allowRemoteFetch;

  if (!forceRefresh) {
    const cached = feedCache.get(memKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return { products: cached.products, mappingLog: cached.mappingLog, source: cached.source };
    }

    const redisCached = await redisGetJson<FeedCacheEntry>(redisCacheKey(feed));
    if (redisCached) {
      const fresh = Date.now() - redisCached.fetchedAt < CACHE_TTL_MS;
      // Request path for heavy feeds: accept last-good Redis even past memory TTL.
      if (fresh || (cacheOnlyRequest && redisCached.products.length > 0)) {
        if (!fresh && cacheOnlyRequest) {
          console.info(
            `[merchant-feeds] serving stale Redis for cache-only ${label} (${redisCached.products.length} products; ageMs=${Date.now() - redisCached.fetchedAt})`
          );
        }
        feedCache.set(memKey, redisCached);
        return {
          products: redisCached.products,
          mappingLog: redisCached.mappingLog,
          source: redisCached.source,
        };
      }
    }

    // Prefer expired in-memory catalogue over a remote pull for heavy feeds.
    if (cacheOnlyRequest && cached && cached.products.length > 0) {
      console.info(
        `[merchant-feeds] serving stale memory for cache-only ${label} (${cached.products.length} products)`
      );
      return { products: cached.products, mappingLog: cached.mappingLog, source: cached.source };
    }

    // Production remotes for heavy feeds: never download on the request path.
    // When no remote is configured (Vitest / FORCE_SAMPLE_FEEDS), fall through to sample files.
    if (cacheOnlyRequest && resolveFeedRemoteUrl(feed)) {
      console.warn(
        `[merchant-feeds] cache-only miss for ${label}; skipping remote download (run npm run feeds:warm /api/cron/feeds-warm)`
      );
      return { products: [], mappingLog: [], source: "sample" };
    }
  }

  const remoteUrl = resolveFeedRemoteUrl(feed);
  let content: NodeJS.ReadableStream | string;
  let source: "remote" | "sample";

  if (remoteUrl) {
    if (isCacheOnlyFeed(feed) && !allowRemoteFetch) {
      // Defence in depth — should already have returned above.
      console.warn(
        `[merchant-feeds] blocked remote fetch for cache-only ${label} on request path`
      );
      return { products: [], mappingLog: [], source: "sample" };
    }
    try {
      console.info(
        `[merchant-feeds] remote fetch starting for ${label} (allowRemoteFetch=${allowRemoteFetch})`
      );
      content = await fetchRemoteFeed(remoteUrl, feed);
      source = "remote";
    } catch (error) {
      console.error(
        `[merchant-feeds] remote fetch failed for ${label}:`,
        error
      );
      // Never poison Redis/memory with tiny sample data when a production URL is configured.
      return { products: [], mappingLog: [], source: "sample" };
    }
  } else if (feed.sampleFile) {
    content = await readSampleFeed(feed.sampleFile);
    source = "sample";
  } else {
    return { products: [], mappingLog: [], source: "sample" };
  }

  const offerSource: Extract<OfferSource, "production-live" | "sample"> =
    source === "remote" ? "production-live" : "sample";
  const parsed = await parseConfiguredFeed(feed, content, feed.country, offerSource);
  const fetchedAtIso = new Date().toISOString();

  const productCap = maxProductsForFeed(feed);
  const limitedProducts =
    productCap && parsed.products.length > productCap
      ? diversifyProductCap(parsed.products, productCap)
      : parsed.products;
  if (productCap && parsed.products.length > productCap) {
    console.warn(
      `[merchant-feeds] capped ${label} from ${parsed.products.length} to ${productCap} products for serverless limits`
    );
  }

  const products = limitedProducts.map((product) => ({
    ...product,
    // Browse/cache path never needs long HTML descriptions (Redis 10MB limit).
    description: "",
    catalogSource: offerSource,
    offers: product.offers.map((offer) => ({
      ...offer,
      source: offerSource,
      feedMerchantId: feed.merchantId,
      fetchedAt: fetchedAtIso,
    })),
  }));

  const entry: FeedCacheEntry = {
    fetchedAt: Date.now(),
    products,
    // Omit bulky mapping logs from cache payloads (products are enough to serve the site).
    mappingLog: source === "remote" ? [] : parsed.mappingLog,
    source,
  };

  feedCache.set(memKey, entry);
  // Only persist successful remote catalogues — never cache empty/error fallbacks.
  // Warm path awaits Redis; request path fire-and-forgets so latency stays low.
  if (source === "remote" && products.length > 0) {
    if (allowRemoteFetch) {
      await persistFeedToRedis(feed, entry);
    } else {
      void persistFeedToRedis(feed, entry);
    }
  }

  return { products, mappingLog: parsed.mappingLog, source };
}

export function clearFeedCacheForTests() {
  feedCache.clear();
}

/**
 * Offline / cron warm: download feeds (including heavy evoMAG) and write Redis.
 * Never call from user request handlers.
 */
export async function warmMerchantFeeds(options?: {
  merchantIds?: string[];
  /** When set, only warm heavy/cacheOnly feeds (default true for cron cost control). */
  heavyOnly?: boolean;
}): Promise<WarmFeedsResult> {
  const heavyOnly = options?.heavyOnly !== false;
  const merchantFilter = options?.merchantIds
    ? new Set(options.merchantIds)
    : null;

  const feeds = getEnabledMerchantFeeds().filter((feed) => {
    if (merchantFilter && !merchantFilter.has(feed.merchantId)) return false;
    if (heavyOnly && !isCacheOnlyFeed(feed)) return false;
    return true;
  });

  const results: WarmFeedsResult["feeds"] = [];

  for (const feed of feeds) {
    const label = feedLabel(feed);
    try {
      const { products, source } = await loadFeedForMerchant(feed, {
        allowRemoteFetch: true,
        forceRefresh: true,
      });
      results.push({
        merchantId: feed.merchantId,
        feedKey: feed.feedKey,
        productCount: products.length,
        source,
      });
      console.info(
        `[merchant-feeds] warm complete for ${label}: ${products.length} products (${source})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[merchant-feeds] warm failed for ${label}:`, error);
      results.push({
        merchantId: feed.merchantId,
        feedKey: feed.feedKey,
        productCount: 0,
        source: "error",
        error: message,
      });
    }
  }

  return {
    ok: results.every((r) => r.source !== "error"),
    warmedAt: new Date().toISOString(),
    feeds: results,
  };
}

export async function getFeedProducts(
  country: CountryCode,
  query?: string,
  category?: string
): Promise<{
  products: Product[];
  sources: Array<"remote" | "sample">;
  mappingLog: MappingLogEntry[];
  merchantProductCounts: Record<string, number>;
}> {
  const feeds = getEnabledMerchantFeeds().filter((feed) => feed.country === country);
  const allProducts: Product[] = [];
  const allMappingLog: MappingLogEntry[] = [];
  const sources = new Set<"remote" | "sample">();
  const merchantProductCounts: Record<string, number> = {};

  const results = await Promise.all(
    feeds.map(async (feed) => {
      // Request path: never allowRemoteFetch — heavy feeds stay cache-only.
      const { products, mappingLog, source } = await loadFeedForMerchant(feed);
      return { products, mappingLog, source, merchantId: feed.merchantId };
    })
  );

  for (const { products, mappingLog, source, merchantId } of results) {
    merchantProductCounts[merchantId] = (merchantProductCounts[merchantId] ?? 0) + products.length;
    if (products.length > 0) {
      sources.add(source);
      allProducts.push(...products);
      allMappingLog.push(...mappingLog);
    }
  }

  const mergedProducts = mergeFeedProductsByIdentity(allProducts);

  return {
    products: filterFeedProducts(mergedProducts, query, category),
    sources: Array.from(sources),
    mappingLog: allMappingLog,
    merchantProductCounts,
  };
}

export async function getFeedMappingReport(
  country: CountryCode,
  merchantId?: string
): Promise<MappingReport> {
  const { mappingLog } = await getFeedProducts(country);
  const filtered = merchantId
    ? mappingLog.filter((entry) => entry.merchantId === merchantId)
    : mappingLog;
  return buildMappingReport(filtered);
}
