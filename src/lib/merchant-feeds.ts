import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { CountryCode, OfferSource, Product } from "@/types";
import {
  getEnabledMerchantFeeds,
  resolveFeedRemoteUrl,
  type FeedConfig,
} from "@/lib/merchant-integrations";
import { parseConfiguredFeed } from "@/lib/feed-loader";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "@/lib/categories";
import { buildMappingReport, type MappingLogEntry, type MappingReport } from "@/lib/mapping-log";
import { mergeFeedProductsByIdentity } from "@/lib/product-identity/merge-products";
import { productMatchesSearchQuery } from "@/lib/product-search";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { redisGetJson, redisSetJson } from "@/lib/redis-cache";

type FeedCacheEntry = {
  fetchedAt: number;
  products: Product[];
  mappingLog: MappingLogEntry[];
  source: "remote" | "sample";
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 60 * 60;
const feedCache = new Map<string, FeedCacheEntry>();

function memoryCacheKey(feed: FeedConfig): string {
  const slice = feed.feedKey ? `:${feed.feedKey}` : "";
  return `${feed.merchantId}${slice}:${feed.country}`;
}

function redisCacheKey(feed: FeedConfig): string {
  // Bump when mapping/parser changes so Redis does not serve stale category ids.
  const slice = feed.feedKey ? `:${feed.feedKey}` : "";
  return `feed:v10:${feed.merchantId}${slice}:${feed.country}`;
}

/** Soft cap for huge catalogues (evoMAG ~100k) so Vercel serverless can finish. */
function maxProductsForFeed(feed: FeedConfig): number | null {
  if (feed.merchantId !== "ro-evomag") return null;
  const raw = process.env.EVOMAG_MAX_PRODUCTS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 4_000;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4_000;
}

/**
 * Keep aisle diversity under the soft cap — CSV head is networking-heavy, so a
 * naive slice(0, N) starves phones / appliances later in the file.
 */
function diversifyProductCap(products: Product[], cap: number): Product[] {
  if (products.length <= cap) return products;

  const buckets = new Map<string, Product[]>();
  for (const product of products) {
    const key =
      product.categoryAssignment?.rawCategory?.trim().toLowerCase() ||
      product.category ||
      "unknown";
    const list = buckets.get(key);
    if (list) list.push(product);
    else buckets.set(key, [product]);
  }

  const queues = [...buckets.values()];
  const selected: Product[] = [];
  let progress = true;
  while (selected.length < cap && progress) {
    progress = false;
    for (const queue of queues) {
      if (selected.length >= cap) break;
      const next = queue.shift();
      if (!next) continue;
      selected.push(next);
      progress = true;
    }
  }
  return selected;
}

async function readSampleFeed(filename: string): Promise<NodeJS.ReadableStream> {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  return createReadStream(filePath, { encoding: "utf8" });
}

async function fetchRemoteFeed(
  url: string,
  provider: FeedConfig["provider"]
): Promise<NodeJS.ReadableStream> {
  const accept =
    provider === "GALAXUS"
      ? "application/json, text/plain, */*"
      : provider === "GOOGLE_MERCHANT"
        ? "application/xml, text/xml, */*"
        : "text/csv, text/plain, */*";

  // evoMAG CSV is large — long timeout, few retries (retries multiply wall time).
  const timeoutMs = provider === "TWO_PERFORMANT" ? 120_000 : 15_000;
  const retries = provider === "TWO_PERFORMANT" ? 1 : 2;

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

  // Node fetch returns a Web ReadableStream; csv-parser needs a Node stream.
  return Readable.fromWeb(response.body as import("node:stream/web").ReadableStream);
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

async function loadFeedForMerchant(
  feed: FeedConfig
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[]; source: "remote" | "sample" }> {
  const memKey = memoryCacheKey(feed);
  const cached = feedCache.get(memKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { products: cached.products, mappingLog: cached.mappingLog, source: cached.source };
  }

  const redisCached = await redisGetJson<FeedCacheEntry>(redisCacheKey(feed));
  if (redisCached && Date.now() - redisCached.fetchedAt < CACHE_TTL_MS) {
    feedCache.set(memKey, redisCached);
    return {
      products: redisCached.products,
      mappingLog: redisCached.mappingLog,
      source: redisCached.source,
    };
  }

  const remoteUrl = resolveFeedRemoteUrl(feed);
  let content: NodeJS.ReadableStream | string;
  let source: "remote" | "sample";

  if (remoteUrl) {
    try {
      content = await fetchRemoteFeed(remoteUrl, feed.provider);
      source = "remote";
    } catch (error) {
      console.error(
        `[merchant-feeds] remote fetch failed for ${feed.merchantId}${feed.feedKey ? `:${feed.feedKey}` : ""}:`,
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
      `[merchant-feeds] capped ${feed.merchantId}${feed.feedKey ? `:${feed.feedKey}` : ""} from ${parsed.products.length} to ${productCap} products for serverless limits`
    );
  }

  const products = limitedProducts.map((product) => ({
    ...product,
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
    // Omit bulky mapping logs from Redis payload (products are enough to serve the site).
    mappingLog: source === "remote" ? [] : parsed.mappingLog,
    source,
  };

  feedCache.set(memKey, entry);
  // Only persist successful remote catalogues — never cache empty/error fallbacks.
  if (source === "remote" && products.length > 0) {
    void redisSetJson(redisCacheKey(feed), entry, CACHE_TTL_SECONDS);
  }

  return { products, mappingLog: parsed.mappingLog, source };
}

export function clearFeedCacheForTests() {
  feedCache.clear();
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
