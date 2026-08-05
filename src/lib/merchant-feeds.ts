import fs from "node:fs/promises";
import path from "node:path";
import { CountryCode, OfferSource, Product } from "@/types";
import { parseAwinCsvFeed } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "@/lib/categories";
import { buildMappingReport, type MappingLogEntry, type MappingReport } from "@/lib/mapping-log";

type FeedCacheEntry = {
  fetchedAt: number;
  products: Product[];
  mappingLog: MappingLogEntry[];
  source: "remote" | "sample";
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const feedCache = new Map<string, FeedCacheEntry>();

async function readSampleFeed(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  return fs.readFile(filePath, "utf8");
}

async function fetchRemoteFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: "text/csv, text/plain, */*" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Feed fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
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
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    );
  }

  return filtered;
}

async function loadFeedForMerchant(
  feedEnvVar: string,
  sampleFile: string | undefined,
  country: CountryCode,
  merchantId: string
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[]; source: "remote" | "sample" }> {
  const cacheKey = `${merchantId}:${country}`;
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { products: cached.products, mappingLog: cached.mappingLog, source: cached.source };
  }

  const remoteUrl = process.env[feedEnvVar];
  let csvContent: string;
  let source: "remote" | "sample";

  if (remoteUrl) {
    csvContent = await fetchRemoteFeed(remoteUrl);
    source = "remote";
  } else if (sampleFile) {
    csvContent = await readSampleFeed(sampleFile);
    source = "sample";
  } else {
    return { products: [], mappingLog: [], source: "sample" };
  }

  const offerSource: Extract<OfferSource, "production-live" | "sample"> =
    source === "remote" ? "production-live" : "sample";
  const parsed = parseAwinCsvFeed(csvContent, country, merchantId, offerSource);
  const products = parsed.products.map((product) => ({
    ...product,
    catalogSource: offerSource,
    offers: product.offers.map((offer) => ({
      ...offer,
      source: offerSource,
      feedMerchantId: merchantId,
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

export async function getFeedProducts(
  country: CountryCode,
  query?: string,
  category?: string
): Promise<{
  products: Product[];
  sources: Array<"remote" | "sample">;
  mappingLog: MappingLogEntry[];
}> {
  const feeds = MERCHANT_FEEDS.filter((feed) => feed.country === country);
  const allProducts: Product[] = [];
  const allMappingLog: MappingLogEntry[] = [];
  const sources = new Set<"remote" | "sample">();

  for (const feed of feeds) {
    const { products, mappingLog, source } = await loadFeedForMerchant(
      feed.envVar,
      feed.sampleFile,
      feed.country,
      feed.merchantId
    );
    if (products.length > 0) {
      sources.add(source);
      allProducts.push(...products);
      allMappingLog.push(...mappingLog);
    }
  }

  return {
    products: filterFeedProducts(allProducts, query, category),
    sources: Array.from(sources),
    mappingLog: allMappingLog,
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
