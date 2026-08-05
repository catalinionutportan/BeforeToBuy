import fs from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
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

type FeedCacheEntry = {
  fetchedAt: number;
  products: Product[];
  mappingLog: MappingLogEntry[];
  source: "remote" | "sample";
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const feedCache = new Map<string, FeedCacheEntry>();

async function readSampleFeed(filename: string): Promise<NodeJS.ReadableStream> {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  // stream-json/stream-chain expect string or Uint8Array chunks (utf8), not raw Buffer objects
  // in some Node/stream-chain combinations.
  return createReadStream(filePath, { encoding: "utf8" });
}

async function fetchRemoteFeed(url: string, provider: FeedConfig["provider"]): Promise<NodeJS.ReadableStream> {
  const accept =
    provider === "GALAXUS"
      ? "application/json, text/plain, */*"
      : "text/csv, text/plain, */*";

  const response = await fetch(url, {
    headers: { Accept: accept },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Feed fetch failed (${response.status}) for ${url}`);
  }

  return response.body;
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
  const cacheKey = `${feed.merchantId}:${feed.country}`;
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { products: cached.products, mappingLog: cached.mappingLog, source: cached.source };
  }

  const remoteUrl = resolveFeedRemoteUrl(feed);
  let content: NodeJS.ReadableStream | string;
  let source: "remote" | "sample";

  if (remoteUrl) {
    content = await fetchRemoteFeed(remoteUrl, feed.provider);
    source = "remote";
    if (content === null) {
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

  feedCache.set(cacheKey, {
    fetchedAt: Date.now(),
    products,
    mappingLog: parsed.mappingLog,
    source,
  });

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

  const feedPromises = feeds.map(async (feed) => {
    const { products, mappingLog, source } = await loadFeedForMerchant(feed);
    return { products, mappingLog, source, merchantId: feed.merchantId };
  });

  const results = await Promise.all(feedPromises);

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
