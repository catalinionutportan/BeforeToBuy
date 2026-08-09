import type { CountryCode } from "@/types";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { COUNTRIES } from "@/lib/countries";
import { getFeedProducts } from "@/lib/merchant-feeds";
import { mergeFeedAndDemoProducts } from "@/lib/product-identity/merge-products";
import {
  getPriceHistoryStats,
  recordProductPriceHistory,
} from "@/lib/pricing/price-history";
import { resolveCategoryAlias, UNMAPPED_CATEGORY_ID } from "@/lib/categories";
import { getSnapshotProductsFromDb } from "@/lib/db-service";

export interface PriceSnapshotJobResult {
  ok: true;
  countries: CountryCode[];
  fetchedAt: string;
  productCount: number;
  offerCount: number;
  appendedPoints: number;
  stats: Awaited<ReturnType<typeof getPriceHistoryStats>>;
}

function defaultBrowseLocation(countryCode: CountryCode) {
  const country = COUNTRIES[countryCode];
  return {
    countryCode,
    countryName: country.name,
  };
}

export async function runPriceSnapshotJob(
  countries: CountryCode[] = ["CH"]
): Promise<PriceSnapshotJobResult> {
  const fetchedAt = new Date().toISOString();
  let productCount = 0;
  let offerCount = 0;
  let appendedPoints = 0;

  for (const countryCode of countries) {
    const databaseProducts = await getSnapshotProductsFromDb(countryCode);
    let mergedProducts = databaseProducts;

    if (databaseProducts.length === 0) {
      const [demoProducts, feedResult] = await Promise.all([
        fetchProductsForLocation(defaultBrowseLocation(countryCode)),
        getFeedProducts(countryCode),
      ]);
      mergedProducts = mergeFeedAndDemoProducts(demoProducts, feedResult.products);
    }
    const visibleProducts = mergedProducts.filter(
      (product) => resolveCategoryAlias(product.category) !== UNMAPPED_CATEGORY_ID
    );
    productCount += visibleProducts.length;
    offerCount += visibleProducts.reduce((count, product) => count + product.offers.length, 0);
    appendedPoints += await recordProductPriceHistory(visibleProducts, fetchedAt);
  }

  const stats = await getPriceHistoryStats();

  return {
    ok: true,
    countries,
    fetchedAt,
    productCount,
    offerCount,
    appendedPoints,
    stats,
  };
}
