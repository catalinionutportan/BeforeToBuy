import { Product, UserLocation } from "@/types";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { getFeedProducts } from "@/lib/merchant-feeds";
import { buildMappingReport } from "@/lib/mapping-log";
import {
  attachOfferTimestamps,
  mergeFeedAndDemoProducts,
} from "@/lib/product-identity/merge-products";
import {
  getOfferPriceHistory,
  getPriceHistoryBackend,
  getPriceHistoryStats,
  getPriceTrend,
  recordProductPriceHistory,
} from "@/lib/pricing/price-history";
import { sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import {
  COMPARISON_COLLECTION_FILTERS,
  getParentCategoryId,
  productMatchesCategoryFilter,
  resolveCategoryAlias,
  UNMAPPED_CATEGORY_ID,
} from "@/lib/categories";
import { applyCrossBorderVisibility } from "@/lib/offers/cross-border";

async function attachPriceHistory(products: Product[]): Promise<Product[]> {
  return Promise.all(
    products.map(async (product) => ({
      ...product,
      offers: await Promise.all(
        sortOffersByTotalPrice(product.offers).map(async (offer) => {
          if (offer.source === "demo") return offer;
          const priceHistory = await getOfferPriceHistory(product, offer);
          return {
            ...offer,
            priceHistory,
          };
        })
      ),
    }))
  );
}

function countGtinLinkedProducts(products: Product[]): number {
  return products.filter((product) => Boolean(product.gtin)).length;
}

export { mergeFeedAndDemoProducts } from "@/lib/product-identity/merge-products";

export async function fetchMergedProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string
) {
  const [demoProducts, feedResult] = await Promise.all([
    fetchProductsForLocation(userLocation, query),
    getFeedProducts(userLocation.countryCode, query),
  ]);

  const fetchedAt = new Date().toISOString();
  const mergedProducts = mergeFeedAndDemoProducts(demoProducts, feedResult.products);
  const timestampedProducts = attachOfferTimestamps(mergedProducts, fetchedAt);
  await recordProductPriceHistory(timestampedProducts, fetchedAt);

  const visibleProducts = await attachPriceHistory(
    timestampedProducts.filter(
      (product) => resolveCategoryAlias(product.category) !== UNMAPPED_CATEGORY_ID
    )
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
  const categoryMatched = category
    ? visibleProducts.filter((product) => productMatchesCategoryFilter(product, category))
    : visibleProducts;
  // Collection counts use the full offer set; the returned list hides cross-border
  // unless the Cross-border collection is selected (CH default = Swiss offers only).
  const products = applyCrossBorderVisibility(categoryMatched, category);
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
  const feedMerchants = feedResult.merchantProductCounts;
  const priceHistoryStats = await getPriceHistoryStats();
  const gtinLinkedProductCount = countGtinLinkedProducts(products);
  const priceTrendSample = products
    .flatMap((product) =>
      product.offers.map((offer) => getPriceTrend(offer.priceHistory ?? []))
    )
    .filter(Boolean).length;

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
      feedMerchants,
      gtinLinkedProductCount,
      priceHistory: {
        enabled: true,
        backend: getPriceHistoryBackend(),
        trackedOffers: priceHistoryStats.trackedOffers,
        totalPoints: priceHistoryStats.totalPoints,
        productsWithTrend: priceTrendSample,
        lastSnapshotAt: priceHistoryStats.lastSnapshotAt ?? fetchedAt,
        snapshotAt: fetchedAt,
      },
    },
  };
}

export type ProductFetchMeta = Awaited<ReturnType<typeof fetchMergedProductsForLocation>>["meta"];
