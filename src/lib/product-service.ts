import { Product, UserLocation } from "@/types";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { getLiveFeedProducts } from "@/lib/merchant-feeds";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function markDemoOffers(product: Product): Product {
  return {
    ...product,
    catalogSource: "demo",
    offers: product.offers.map((offer) => ({
      ...offer,
      source: offer.source || "demo",
    })),
  };
}

function mergeLiveOffersIntoProduct(demoProduct: Product, liveProduct: Product): Product {
  const liveOffers = liveProduct.offers.filter((offer) => offer.source === "live");
  const liveStoreNames = new Set(liveOffers.map((offer) => offer.storeName.toLowerCase()));

  const keptDemoOffers = demoProduct.offers
    .filter((offer) => !liveStoreNames.has(offer.storeName.toLowerCase()))
    .map((offer) => ({ ...offer, source: "demo" as const }));

  const mergedOffers = [...liveOffers, ...keptDemoOffers];

  return {
    ...demoProduct,
    catalogSource: liveOffers.length > 0 ? "mixed" : "demo",
    offers: mergedOffers,
    isFlashDeal: demoProduct.isFlashDeal || liveProduct.isFlashDeal,
  };
}

function titleMatchScore(demoTitle: string, liveTitle: string): number {
  const normalizedDemo = normalizeTitle(demoTitle);
  const normalizedLive = normalizeTitle(liveTitle);

  if (normalizedDemo === normalizedLive) {
    return 100;
  }

  const demoTokens = new Set(
    normalizedDemo.split(" ").filter((token) => token.length > 2)
  );
  const liveTokens = normalizedLive.split(" ").filter((token) => token.length > 2);

  if (liveTokens.length === 0) {
    return 0;
  }

  const shared = liveTokens.filter((token) => demoTokens.has(token)).length;
  return Math.round((shared / liveTokens.length) * 100);
}

function findBestLiveMatch(demoProduct: Product, liveProducts: Product[]): Product | undefined {
  let bestMatch: Product | undefined;
  let bestScore = 0;

  for (const liveProduct of liveProducts) {
    if (liveProduct.brand.toLowerCase() !== demoProduct.brand.toLowerCase()) {
      continue;
    }

    const score = titleMatchScore(demoProduct.title, liveProduct.title);
    if (score > bestScore && score >= 55) {
      bestScore = score;
      bestMatch = liveProduct;
    }
  }

  return bestMatch;
}

export function mergeLiveAndDemoProducts(
  demoProducts: Product[],
  liveProducts: Product[]
): Product[] {
  if (liveProducts.length === 0) {
    return demoProducts.map(markDemoOffers);
  }

  const matchedLiveIds = new Set<string>();

  const merged: Product[] = demoProducts.map((demoProduct) => {
    const liveMatch = findBestLiveMatch(demoProduct, liveProducts);
    if (!liveMatch) {
      return markDemoOffers(demoProduct);
    }

    matchedLiveIds.add(liveMatch.id);
    return mergeLiveOffersIntoProduct(demoProduct, liveMatch);
  });

  for (const liveProduct of liveProducts) {
    if (!matchedLiveIds.has(liveProduct.id)) {
      merged.push({
        ...liveProduct,
        catalogSource: "live",
        offers: liveProduct.offers.map((offer) => ({ ...offer, source: "live" as const })),
      });
    }
  }

  return merged;
}

export async function fetchMergedProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string
) {
  const [demoProducts, liveFeed] = await Promise.all([
    fetchProductsForLocation(userLocation, query, category),
    getLiveFeedProducts(userLocation.countryCode, query, category),
  ]);

  const products = mergeLiveAndDemoProducts(demoProducts, liveFeed.products);

  const liveOfferCount = products.reduce(
    (count, product) => count + product.offers.filter((offer) => offer.source === "live").length,
    0
  );

  return {
    products,
    meta: {
      liveOfferCount,
      liveProductCount: liveFeed.products.length,
      feedSources: liveFeed.sources,
      hasProductionFeed: liveFeed.sources.includes("remote"),
      hasSampleFeed: liveFeed.sources.includes("sample"),
    },
  };
}

export type ProductFetchMeta = Awaited<ReturnType<typeof fetchMergedProductsForLocation>>["meta"];
