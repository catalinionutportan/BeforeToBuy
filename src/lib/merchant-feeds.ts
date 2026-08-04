import fs from "node:fs/promises";
import path from "node:path";
import { CountryCode, Product } from "@/types";
import { parseAwinCsvFeed } from "@/lib/feed-parser";
import { MERCHANT_FEEDS } from "@/lib/merchant-integrations";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "@/lib/categories";

type FeedCacheEntry = {
  fetchedAt: number;
  products: Product[];
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
): Promise<{ products: Product[]; source: "remote" | "sample" }> {
  const cacheKey = `${merchantId}:${country}`;
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { products: cached.products, source: cached.source };
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
    return { products: [], source: "sample" };
  }

  const products = parseAwinCsvFeed(csvContent, country, merchantId).map((product) => ({
    ...product,
    catalogSource: "live" as const,
    offers: product.offers.map((offer) => ({
      ...offer,
      source: "live" as const,
      feedMerchantId: merchantId,
    })),
  }));

  feedCache.set(cacheKey, {
    fetchedAt: Date.now(),
    products,
    source,
  });

  return { products, source };
}

export async function getLiveFeedProducts(
  country: CountryCode,
  query?: string,
  category?: string
): Promise<{ products: Product[]; sources: Array<"remote" | "sample"> }> {
  const feeds = MERCHANT_FEEDS.filter((feed) => feed.country === country);
  const allProducts: Product[] = [];
  const sources = new Set<"remote" | "sample">();

  for (const feed of feeds) {
    const { products, source } = await loadFeedForMerchant(
      feed.envVar,
      feed.sampleFile,
      feed.country,
      feed.merchantId
    );
    if (products.length > 0) {
      sources.add(source);
      allProducts.push(...products);
    }
  }

  return {
    products: filterFeedProducts(allProducts, query, category),
    sources: Array.from(sources),
  };
}
