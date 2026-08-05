import { Product, UserLocation } from "@/types";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { getFeedProducts } from "@/lib/merchant-feeds";
import { buildMappingReport } from "@/lib/mapping-log";
import {
  COMPARISON_COLLECTION_FILTERS,
  getParentCategoryId,
  productMatchesCategoryFilter,
  resolveCategoryAlias,
  UNMAPPED_CATEGORY_ID,
} from "@/lib/categories";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function markDemoOffers(product: Product): Product {
  return {
    ...product,
    rating: undefined,
    reviewsCount: undefined,
    isFlashDeal: false,
    catalogSource: "demo",
    offers: product.offers.map((offer) => ({
      ...offer,
      source: "demo",
      originalPrice: undefined,
      discountPercentage: undefined,
      promoCode: undefined,
      badge: undefined,
    })),
  };
}

function mergeFeedOffersIntoProduct(demoProduct: Product, feedProduct: Product): Product {
  const feedOffers = feedProduct.offers.filter((offer) => offer.source !== "demo");
  const feedStoreNames = new Set(feedOffers.map((offer) => offer.storeName.toLowerCase()));

  const keptDemoOffers = demoProduct.offers
    .filter((offer) => !feedStoreNames.has(offer.storeName.toLowerCase()))
    .map((offer) => ({
      ...offer,
      source: "demo" as const,
      originalPrice: undefined,
      discountPercentage: undefined,
      promoCode: undefined,
      badge: undefined,
    }));

  const mergedOffers = [...feedOffers, ...keptDemoOffers];

  return {
    ...demoProduct,
    rating: undefined,
    reviewsCount: undefined,
    catalogSource: feedOffers.length > 0 ? "mixed" : "demo",
    offers: mergedOffers,
    isFlashDeal:
      feedProduct.offers.some((offer) => offer.source === "production-live") &&
      Boolean(feedProduct.isFlashDeal),
  };
}

function titleMatchScore(demoTitle: string, feedTitle: string): number {
  const normalizedDemo = normalizeTitle(demoTitle);
  const normalizedFeed = normalizeTitle(feedTitle);

  if (normalizedDemo === normalizedFeed) {
    return 100;
  }

  const demoTokens = new Set(
    normalizedDemo.split(" ").filter((token) => token.length > 2)
  );
  const feedTokens = normalizedFeed.split(" ").filter((token) => token.length > 2);

  if (feedTokens.length === 0) {
    return 0;
  }

  const shared = feedTokens.filter((token) => demoTokens.has(token)).length;
  return Math.round((shared / feedTokens.length) * 100);
}

function findBestFeedMatch(demoProduct: Product, feedProducts: Product[]): Product | undefined {
  let bestMatch: Product | undefined;
  let bestScore = 0;

  for (const feedProduct of feedProducts) {
    if (feedProduct.brand.toLowerCase() !== demoProduct.brand.toLowerCase()) {
      continue;
    }

    const score = titleMatchScore(demoProduct.title, feedProduct.title);
    if (score > bestScore && score >= 55) {
      bestScore = score;
      bestMatch = feedProduct;
    }
  }

  return bestMatch;
}

export function mergeFeedAndDemoProducts(
  demoProducts: Product[],
  feedProducts: Product[]
): Product[] {
  if (feedProducts.length === 0) {
    return demoProducts.map(markDemoOffers);
  }

  const matchedFeedIds = new Set<string>();

  const merged: Product[] = demoProducts.map((demoProduct) => {
    const feedMatch = findBestFeedMatch(demoProduct, feedProducts);
    if (!feedMatch) {
      return markDemoOffers(demoProduct);
    }

    matchedFeedIds.add(feedMatch.id);
    return mergeFeedOffersIntoProduct(demoProduct, feedMatch);
  });

  for (const feedProduct of feedProducts) {
    if (!matchedFeedIds.has(feedProduct.id)) {
      merged.push({
        ...feedProduct,
        catalogSource: feedProduct.catalogSource,
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
  const [demoProducts, feedResult] = await Promise.all([
    fetchProductsForLocation(userLocation, query),
    getFeedProducts(userLocation.countryCode, query),
  ]);

  const mergedProducts = mergeFeedAndDemoProducts(demoProducts, feedResult.products);
  const visibleProducts = mergedProducts.filter(
    (product) => resolveCategoryAlias(product.category) !== UNMAPPED_CATEGORY_ID
  );
  const categoryCounts = visibleProducts.reduce<Record<string, number>>((counts, product) => {
    const categoryId = resolveCategoryAlias(product.category);
    counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    const parentId = getParentCategoryId(categoryId);
    if (parentId) counts[parentId] = (counts[parentId] ?? 0) + 1;
    return counts;
  }, {});
  const collectionCounts = COMPARISON_COLLECTION_FILTERS.reduce<Record<string, number>>(
    (counts, collection) => {
      counts[collection.id] = visibleProducts.filter((product) =>
        productMatchesCategoryFilter(product, collection.id)
      ).length;
      return counts;
    },
    {}
  );
  const products = category
    ? visibleProducts.filter((product) => productMatchesCategoryFilter(product, category))
    : visibleProducts;
  const unmappedProductCount = feedResult.products.filter(
    (product) => product.category === UNMAPPED_CATEGORY_ID
  ).length;

  const productionOfferCount = products.reduce(
    (count, product) =>
      count + product.offers.filter((offer) => offer.source === "production-live").length,
    0
  );
  const sampleOfferCount = products.reduce(
    (count, product) => count + product.offers.filter((offer) => offer.source === "sample").length,
    0
  );
  const productionProductCount = feedResult.products.filter((product) =>
    product.offers.some((offer) => offer.source === "production-live")
  ).length;
  const mappingReport = buildMappingReport(feedResult.mappingLog);

  return {
    products,
    meta: {
      productionOfferCount,
      sampleOfferCount,
      productionProductCount,
      feedProductCount: feedResult.products.length,
      unmappedProductCount,
      categoryCounts,
      collectionCounts,
      feedSources: feedResult.sources,
      hasProductionFeed: feedResult.sources.includes("remote"),
      hasSampleFeed: feedResult.sources.includes("sample"),
      mappingSummary: mappingReport.summary,
    },
  };
}

export type ProductFetchMeta = Awaited<ReturnType<typeof fetchMergedProductsForLocation>>["meta"];
