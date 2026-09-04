import { after, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  fetchMergedProductsForLocation,
  type ProductFetchMeta,
} from "@/lib/product-service";
import {
  getCachedBrowseMeta,
  getCachedFirstBrowsePage,
  setCachedFirstBrowsePage,
  type CachedBrowseMeta,
  type CachedFirstBrowsePage,
} from "@/lib/catalog-browse-cache";
import {
  countInStockProductsForCountry,
  getCategoryCountsFromDb,
  getCategoryCoverImagesFromDb,
  warmBrowseMetaForCountry,
} from "@/lib/db-service";
import { isRedisConfigured } from "@/lib/redis";
import {
  clampProductListLimit,
  DEFAULT_PRODUCT_LIST_LIMIT,
  parseProductListOffset,
} from "@/lib/product-list-options";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import { hasActiveOfferFilters, parseOfferFiltersFromSearchParams } from "@/lib/offers/offer-filters";
import type { ProductSortOption } from "@/lib/product-list-options";
import {
  clampFilterString,
  MAX_PRODUCT_FILTER_CHARS,
  MAX_PRODUCT_QUERY_CHARS,
} from "@/lib/request-body-limits";

/** First-page JSON is Redis + CDN cached — do not force-dynamic (Vercel then keeps only 30s). */
export const maxDuration = 60;
export const revalidate = 300;

const homeUi = HOME_UI[DEFAULT_LOCALE];

function sanitizeQueryParam(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  return stripUnsafeQueryChars(input);
}

const VALID_COUNTRIES = new Set<CountryCode>(Object.keys(COUNTRIES) as CountryCode[]);
const DEFERRED_META_COUNTRIES = new Set<CountryCode>(["CH", "DE", "RO", "GB", "US"]);

function scheduleBrowseMetaWarm(countryCode: CountryCode): void {
  if (!DEFERRED_META_COUNTRIES.has(countryCode)) return;
  after(async () => {
    await warmBrowseMetaForCountry(countryCode).catch((error) => {
      console.error(`[products] ${countryCode} browse-meta warm failed:`, error);
    });
  });
}

function pageHasAisleCounts(page: CachedFirstBrowsePage): boolean {
  const meta = page.meta as ProductFetchMeta | undefined;
  return Boolean(meta?.categoryCounts && Object.keys(meta.categoryCounts).length > 0);
}

function withFreshBrowseMeta(
  page: CachedFirstBrowsePage,
  browseMeta: CachedBrowseMeta,
  limit: number,
  category?: string
): CachedFirstBrowsePage {
  const pageMeta = page.meta as ProductFetchMeta;
  const offset = pageMeta.offset ?? 0;
  const matchedTotal = category
    ? (pageMeta.totalMatched ?? page.products.length)
    : browseMeta.countryProductCount;
  return {
    products: page.products,
    meta: {
      ...pageMeta,
      categoryCounts: browseMeta.categoryCounts,
      categoryCovers: browseMeta.categoryCovers,
      brandOptions: browseMeta.brandOptions,
      feedProductCount: browseMeta.countryProductCount,
      totalMatched: matchedTotal,
      hasMore: offset + limit < matchedTotal,
    },
  };
}

function parseCountry(value: string | null): CountryCode {
  if (!value) return getPrimaryLiveBrowseCountry();
  const code = value.toUpperCase() as CountryCode;
  return VALID_COUNTRIES.has(code) ? code : getPrimaryLiveBrowseCountry();
}

function buildUserLocation(countryCode: CountryCode): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[getPrimaryLiveBrowseCountry()];

  return {
    countryCode,
    countryName: country.name,
  };
}

function parseSort(value: string | null): ProductSortOption | undefined {
  return value === "price-asc" || value === "price-desc" || value === "newest"
    ? value
    : undefined;
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  // Enough for normal browse + SSR refetch; lower than before to reduce abuse headroom.
  const rateLimit = await checkRateLimit(`products:${clientIp}`, 120, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.productApiTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);

  const qCheck = clampFilterString(searchParams.get("q"), MAX_PRODUCT_QUERY_CHARS);
  const categoryCheck = clampFilterString(
    searchParams.get("category"),
    MAX_PRODUCT_FILTER_CHARS
  );
  const domainCheck = clampFilterString(
    searchParams.get("domain"),
    MAX_PRODUCT_FILTER_CHARS
  );
  const brandCheck = clampFilterString(
    searchParams.get("brand"),
    MAX_PRODUCT_FILTER_CHARS
  );
  if (!qCheck.ok || !categoryCheck.ok || !domainCheck.ok || !brandCheck.ok) {
    return NextResponse.json({ error: "Query parameter too long" }, { status: 400 });
  }

  const countryCode = parseCountry(searchParams.get("country"));
  const query = sanitizeQueryParam(qCheck.value);
  const category = sanitizeQueryParam(categoryCheck.value);
  const locale = normalizeLocale(searchParams.get("locale")) ?? DEFAULT_LOCALE;
  const limit = clampProductListLimit(
    searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    DEFAULT_PRODUCT_LIST_LIMIT
  );
  const offset = parseProductListOffset(
    searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined
  );
  const includePriceHistory = searchParams.get("priceHistory") === "1";
  const filters = parseOfferFiltersFromSearchParams(searchParams);
  if (domainCheck.value !== undefined) {
    // Re-apply length-clamped domain/brand after parse (parse may re-read raw params).
    if (filters.domain && filters.domain.length > MAX_PRODUCT_FILTER_CHARS) {
      return NextResponse.json({ error: "Query parameter too long" }, { status: 400 });
    }
  }
  if (brandCheck.value !== undefined && filters.brand && filters.brand.length > MAX_PRODUCT_FILTER_CHARS) {
    return NextResponse.json({ error: "Query parameter too long" }, { status: 400 });
  }
  const sort = parseSort(searchParams.get("sort"));
  const userLocation = buildUserLocation(countryCode);
  const cacheableFirstPage =
    !query &&
    offset === 0 &&
    !sort &&
    !includePriceHistory &&
    !hasActiveOfferFilters(filters);

  const browseCacheHeaders: Record<string, string> = cacheableFirstPage
    ? {
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      }
    : {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=30",
      };

  try {
    if (cacheableFirstPage) {
      const cachedPage = await getCachedFirstBrowsePage(countryCode, limit, category);
      if (cachedPage?.products?.length) {
        let cachedMeta = DEFERRED_META_COUNTRIES.has(countryCode)
          ? await getCachedBrowseMeta(countryCode)
          : null;
        if (DEFERRED_META_COUNTRIES.has(countryCode) && !cachedMeta) {
          const pageMeta = cachedPage.meta as ProductFetchMeta | undefined;
          if (isRedisConfigured()) {
            scheduleBrowseMetaWarm(countryCode);
            const countryProductCount = await countInStockProductsForCountry(countryCode);
            cachedMeta = {
              categoryCounts: {},
              leafCounts: {},
              categoryCovers: {},
              countryProductCount,
              brandOptions: [],
            };
          } else if (pageHasAisleCounts(cachedPage) && pageMeta) {
            const savedTotal = Number(
              pageMeta.countryProductCount ?? pageMeta.totalMatched ?? 0
            );
            const countryProductCount =
              savedTotal > cachedPage.products.length
                ? savedTotal
                : await countInStockProductsForCountry(countryCode);
            cachedMeta = {
              categoryCounts: pageMeta.categoryCounts ?? {},
              leafCounts: pageMeta.leafCounts ?? {},
              categoryCovers: pageMeta.categoryCovers ?? {},
              countryProductCount,
              brandOptions: pageMeta.brandOptions ?? [],
            };
          } else {
            const [countryProductCount, countMaps, categoryCovers] = await Promise.all([
              countInStockProductsForCountry(countryCode),
              getCategoryCountsFromDb(countryCode),
              getCategoryCoverImagesFromDb(countryCode),
            ]);
            cachedMeta = {
              categoryCounts: countMaps.categoryCounts,
              leafCounts: countMaps.leafCounts,
              categoryCovers,
              countryProductCount,
              brandOptions: [],
            };
          }
        }
        const responsePage = cachedMeta
          ? withFreshBrowseMeta(cachedPage, cachedMeta, limit, category)
          : cachedPage;
        return NextResponse.json(responsePage, {
          headers: { ...browseCacheHeaders, "x-btb-catalog-cache": "hit" },
        });
      }
    }

    const result = await fetchMergedProductsForLocation(userLocation, query, category, locale, {
      limit,
      offset,
      includePriceHistory,
      compact: true,
      filters,
      sort,
    });
    if (cacheableFirstPage && result.products.length > 0) {
      // Await the write — a detached SET dies when the Vercel isolate freezes.
      await setCachedFirstBrowsePage(
        countryCode,
        limit,
        {
          products: result.products,
          meta: result.meta,
        },
        category
      );
    }
    if (DEFERRED_META_COUNTRIES.has(countryCode) && isRedisConfigured()) {
      const cachedMeta = await getCachedBrowseMeta(countryCode);
      if (!cachedMeta) scheduleBrowseMetaWarm(countryCode);
    }
    return NextResponse.json(result, {
      headers: { ...browseCacheHeaders, "x-btb-catalog-cache": "miss" },
    });
  } catch (error) {
    const trackingId = randomUUID();
    console.error(`Product fetch failed (Tracking ID: ${trackingId}):`, error);
    return NextResponse.json(
      { error: formatUi(homeUi.productFetchError, {}) , trackingId },
      { status: 500 }
    );
  }
}
