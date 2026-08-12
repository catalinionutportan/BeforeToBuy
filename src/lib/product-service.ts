import { Product, UserLocation } from "@/types";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { buildMappingReport } from "@/lib/mapping-log";
import { getProductsFromDb } from "@/lib/db-service";
import { getFeedProducts } from "@/lib/merchant-feeds";
import {
  attachOfferTimestamps,
  mergeFeedAndDemoProducts,
} from "@/lib/product-identity/merge-products";
import {
  getPriceHistoryBackend,
  getPriceHistoryStats,
  getPriceTrend,
  getOffersPriceHistoryBatch,
} from "@/lib/pricing/price-history";
import { buildPriceHistoryKey } from "@/lib/pricing/price-history-keys";
import {
  COMPARISON_COLLECTION_FILTERS,
  getParentCategoryId,
  productMatchesCategoryFilter,
  resolveCategoryAlias,
  UNMAPPED_CATEGORY_ID,
} from "@/lib/categories";
import { applyCrossBorderVisibility } from "@/lib/offers/cross-border";
import { applyOfferFilters, collectBrandOptions } from "@/lib/offers/offer-filters";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";
import type { ProductListOptions } from "@/lib/product-list-options";

async function attachPriceHistory(products: Product[]): Promise<Product[]> {
  const batchedPriceHistories = await getOffersPriceHistoryBatch(products);

  return products.map((product) => ({
    ...product,
    offers: product.offers.map((offer) => {
      if (offer.source === "demo") return offer;
      const priceHistory = batchedPriceHistories.get(buildPriceHistoryKey(product, offer));
      return {
        ...offer,
        priceHistory: priceHistory ?? [],
      };
    }),
  }));
}

function countGtinLinkedProducts(products: Product[]): number {
  return products.filter((product) => Boolean(product.gtin)).length;
}

function compactProductsForList(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    // Keep a short blurb for compare/import; strip only very long HTML.
    description: (product.description || "").replace(/\s+/g, " ").trim().slice(0, 480),
    offers: product.offers.map((offer) => ({
      ...offer,
      // Keep browse cards light; detail pages load richer data separately.
      priceHistory: undefined,
    })),
  }));
}

export { mergeFeedAndDemoProducts } from "@/lib/product-identity/merge-products";

/**
 * Prefer Supabase catalogue when it has rows for the market.
 * Fall back to enabled merchant-feeds (currently GB etc.) — RO CSV remotes are disabled.
 */
export async function fetchMergedProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string,
  locale: SiteLocale = DEFAULT_LOCALE,
  listOptions: ProductListOptions = {}
) {
  const offset = Math.max(0, Math.floor(listOptions.offset ?? 0));
  const limit =
    listOptions.limit == null || !Number.isFinite(listOptions.limit)
      ? undefined
      : Math.max(0, Math.floor(listOptions.limit));
  const includePriceHistory = listOptions.includePriceHistory === true;
  const compact = listOptions.compact ?? limit != null;

  if (process.env.FORCE_SAMPLE_FEEDS !== "1") {
    try {
      const dbResult = await getProductsFromDb(
      userLocation.countryCode,
      query,
      category,
      limit,
      offset,
      listOptions.sort,
      listOptions.filters
    );
      // If Supabase has catalogue rows for this market, stay on DB even when the
      // active hub/filter matches zero products (do not fall back to empty feeds).
      if (dbResult.countryProductCount > 0) {
      const fetchedAt = new Date().toISOString();
      const timestampedProducts = attachOfferTimestamps(dbResult.products, fetchedAt);

      const visibleProducts = timestampedProducts.filter(
        (product) => resolveCategoryAlias(product.category) !== UNMAPPED_CATEGORY_ID
      );

      const categoryCounts = dbResult.categoryCounts;
      const collectionCounts = COMPARISON_COLLECTION_FILTERS.reduce<Record<string, number>>(
        (counts, collection) => {
          counts[collection.id] = Object.entries(dbResult.leafCounts).reduce(
            (sum, [id, n]) =>
              productMatchesCategoryFilter(
                { title: "", description: "", brand: "", category: id },
                collection.id
              )
                ? sum + n
                : sum,
            0
          );
          return counts;
        },
        {}
      );

      const matchedProducts = applyCrossBorderVisibility(visibleProducts, category);
      const totalMatched = dbResult.totalMatched;
      const pageSlice = matchedProducts;

      const productsWithHistory = includePriceHistory
        ? await attachPriceHistory(pageSlice)
        : pageSlice;
      const products = compact ? compactProductsForList(productsWithHistory) : productsWithHistory;

      const productionOfferCount = matchedProducts.reduce(
        (count, product) =>
          count + product.offers.filter((offer) => offer.source === "production-live").length,
        0
      );
      const sampleOfferCount = matchedProducts.reduce(
        (count, product) =>
          count + product.offers.filter((offer) => offer.source === "sample").length,
        0
      );
      const priceHistoryStats = await getPriceHistoryStats();
      const gtinLinkedProductCount = countGtinLinkedProducts(matchedProducts);

      return {
        products,
        meta: {
          productionOfferCount,
          sampleOfferCount,
          productionProductCount: products.length,
          feedProductCount: dbResult.countryProductCount,
          unmappedProductCount: 0,
          categoryCounts,
          collectionCounts,
          feedSources: ["remote"] as Array<"remote" | "sample">,
          hasProductionFeed: true,
          hasSampleFeed: false,
          mappingSummary: "Data from Supabase",
          feedMerchants: {},
          brandOptions: dbResult.brandOptions,
          gtinLinkedProductCount,
          totalMatched,
          limit: limit ?? null,
          offset,
          // Use requested page size, not filtered row count — otherwise a short
          // page (unmapped/no-offer drops) falsely ends infinite scroll.
          hasMore: limit == null ? false : offset + limit < totalMatched,
          priceHistory: {
            enabled: true,
            backend: getPriceHistoryBackend(),
            trackedOffers: priceHistoryStats.trackedOffers,
            totalPoints: priceHistoryStats.totalPoints,
            productsWithTrend: 0,
            lastSnapshotAt: priceHistoryStats.lastSnapshotAt ?? fetchedAt,
            snapshotAt: fetchedAt,
          },
        },
      };
      }
    } catch (error) {
      console.error(
        "[product-service] Supabase read failed; falling back to merchant-feeds:",
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback: enabled feeds only (RO 2Performant remotes are disabled → no CSV cost).
  const [demoProducts, feedResult] = await Promise.all([
    fetchProductsForLocation(userLocation, query, undefined, locale),
    getFeedProducts(userLocation.countryCode, query),
  ]);

  const fetchedAt = new Date().toISOString();
  const mergedProducts = mergeFeedAndDemoProducts(demoProducts, feedResult.products);
  const timestampedProducts = attachOfferTimestamps(mergedProducts, fetchedAt);

  const visibleProducts = timestampedProducts.filter(
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
  const categoryMatched = category
    ? visibleProducts.filter((product) => productMatchesCategoryFilter(product, category))
    : visibleProducts;
  const crossBorderProducts = applyCrossBorderVisibility(categoryMatched, category);
  const brandOptions = collectBrandOptions(crossBorderProducts);
  const matchedProducts = applyOfferFilters(crossBorderProducts, listOptions.filters ?? {});
  
  if (listOptions.sort === "price-asc") {
    matchedProducts.sort((a, b) => (a.basePrice || Infinity) - (b.basePrice || Infinity));
  } else if (listOptions.sort === "price-desc") {
    matchedProducts.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
  }
  
  const totalMatched = matchedProducts.length;
  const pageSlice =
    limit == null ? matchedProducts.slice(offset) : matchedProducts.slice(offset, offset + limit);

  const productsWithHistory = includePriceHistory
    ? await attachPriceHistory(pageSlice)
    : pageSlice;
  const products = compact ? compactProductsForList(productsWithHistory) : productsWithHistory;

  const unmappedProductCount = feedResult.products.filter(
    (product) => product.category === UNMAPPED_CATEGORY_ID
  ).length;

  const productionOfferCount = matchedProducts.reduce(
    (count, product) =>
      count + product.offers.filter((offer) => offer.source === "production-live").length,
    0
  );
  const sampleOfferCount = matchedProducts.reduce(
    (count, product) =>
      count + product.offers.filter((offer) => offer.source === "sample").length,
    0
  );
  const productionProductCount = feedResult.products.filter((product) =>
    product.offers.some((offer) => offer.source === "production-live")
  ).length;
  const mappingReport = buildMappingReport(feedResult.mappingLog);
  const feedMerchants = feedResult.merchantProductCounts;
  const priceHistoryStats = await getPriceHistoryStats();
  const gtinLinkedProductCount = countGtinLinkedProducts(matchedProducts);
  const priceTrendSample = includePriceHistory
    ? products
        .flatMap((product) =>
          product.offers.map((offer) => getPriceTrend(offer.priceHistory ?? []))
        )
        .filter(Boolean).length
    : 0;

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
      brandOptions,
      gtinLinkedProductCount,
      totalMatched,
      limit: limit ?? null,
      offset,
      hasMore: limit == null ? false : offset + limit < totalMatched,
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
