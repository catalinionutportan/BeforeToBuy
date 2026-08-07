import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { CountryCode, OfferSource, Product } from "@/types";
import {
  MERCHANT_FEEDS,
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
  return `${feed.merchantId}:${feed.country}`;
}

function redisCacheKey(feed: FeedConfig): string {
  // Bump when mapping/parser changes so Redis does not serve stale category ids.
  return `feed:v3:${feed.merchantId}:${feed.country}`;
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

  const response = await fetchWithTimeout(
    url,
    {
      headers: { Accept: accept },
      next: { revalidate: 3600 },
    },
    { timeoutMs: 15_000, retries: 2 }
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
      console.error(`[merchant-feeds] remote fetch failed for ${feed.merchantId}:`, error);
      if (feed.sampleFile) {
        content = await readSampleFeed(feed.sampleFile);
        source = "sample";
      } else {
        return { products: [], mappingLog: [], source: "sample" };
      }
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
  const products = parsed.products.map((product) => ({
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
    mappingLog: parsed.mappingLog,
    source,
  };

  feedCache.set(memKey, entry);
  void redisSetJson(redisCacheKey(feed), entry, CACHE_TTL_SECONDS);

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
  const feeds = MERCHANT_FEEDS.filter((feed) => feed.country === country);
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
    merchantProductCounts[merchantId] = products.length;
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
