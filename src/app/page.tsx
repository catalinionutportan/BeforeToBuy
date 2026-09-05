import HomePageClient from "@/components/home/HomePageClient";
import {
  getCachedFirstBrowsePage,
  setCachedFirstBrowsePage,
  type CachedFirstBrowsePage,
} from "@/lib/catalog-browse-cache";
import { COUNTRIES } from "@/lib/countries";
import {
  BROWSE_LIST_OPTIONS,
  DEFAULT_PRODUCT_LIST_LIMIT,
} from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import { withTimeout } from "@/lib/promise-timeout";
import { getRequestMarketCountry } from "@/lib/request-market";
import type { CountryCode, Product } from "@/types";
import { normalizeBrowsePage } from "@/lib/browse-pagination";
import {
  hasActiveOfferFilters,
  parseOfferFiltersFromSearchParams,
} from "@/lib/offers/offer-filters";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
import type { ProductSortOption } from "@/lib/product-list-options";
import {
  clampFilterString,
  MAX_PRODUCT_FILTER_CHARS,
  MAX_PRODUCT_QUERY_CHARS,
} from "@/lib/request-body-limits";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";
import { productMatchesCategoryFilter } from "@/lib/categories";
import { withCatalogRevision } from "@/lib/catalog-revision";

export const dynamic = "force-dynamic";

const LEGACY_FIRST_PAGE_LIMIT = 96;
const INITIAL_CATALOG_TIMEOUT_MS = 7_000;

function compactCachedPage(page: CachedFirstBrowsePage): CachedFirstBrowsePage {
  const products = page.products.slice(0, DEFAULT_PRODUCT_LIST_LIMIT);
  const meta = page.meta as ProductFetchMeta | null;
  if (!meta) return { products, meta: page.meta };
  return {
    products,
    meta: {
      ...meta,
      limit: DEFAULT_PRODUCT_LIST_LIMIT,
      offset: 0,
      hasMore: products.length < Number(meta.totalMatched ?? products.length),
    },
  };
}

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toUrlSearchParams(
  params: Record<string, string | string[] | undefined> | undefined
): URLSearchParams {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) result.append(key, item);
    } else if (value !== undefined) {
      result.set(key, value);
    }
  }
  return result;
}

function parseSort(value: string | undefined): ProductSortOption | undefined {
  return value === "price-asc" || value === "price-desc" || value === "newest"
    ? value
    : undefined;
}

function cacheMatchesCategory(
  page: CachedFirstBrowsePage | null,
  category: string | undefined
): page is CachedFirstBrowsePage {
  if (!page?.products?.length) return false;
  if (!category) return true;
  return page.products.every((item) => {
    if (!item || typeof item !== "object") return false;
    const product = item as Partial<Product>;
    if (typeof product.category !== "string") return false;
    return productMatchesCategoryFilter(
      {
        title: product.title ?? "",
        description: product.description ?? "",
        brand: product.brand ?? "",
        category: product.category,
        offers: product.offers,
      },
      category
    );
  });
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const country = await getRequestMarketCountry(firstSearchParam(params?.country)?.toUpperCase());
  try {
    return await withCatalogRevision(country, () => renderHome({ searchParams: Promise.resolve(params ?? {}) }));
  } catch {
    return <HomePageClient initialCountry={country} initialFetchFailed />;
  }
}

async function renderHome({ searchParams }: HomePageProps) {
  let marketCountry: CountryCode = "RO";
  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;
  let initialFetchFailed = false;
  let initialPage = 1;
  let canSeedClientAllCache = false;

  try {
    const params = searchParams ? await searchParams : undefined;
    const urlParams = toUrlSearchParams(params);
    initialPage = normalizeBrowsePage(firstSearchParam(params?.page));
    marketCountry = await getRequestMarketCountry(
      firstSearchParam(params?.country)?.toUpperCase()
    );

    const queryCheck = clampFilterString(urlParams.get("q"), MAX_PRODUCT_QUERY_CHARS);
    const categoryCheck = clampFilterString(
      urlParams.get("category"),
      MAX_PRODUCT_FILTER_CHARS
    );
    const domainCheck = clampFilterString(
      urlParams.get("domain"),
      MAX_PRODUCT_FILTER_CHARS
    );
    const brandCheck = clampFilterString(
      urlParams.get("brand"),
      MAX_PRODUCT_FILTER_CHARS
    );
    if (!queryCheck.ok || !categoryCheck.ok || !domainCheck.ok || !brandCheck.ok) {
      throw new Error("Homepage query parameter too long");
    }

    const query = queryCheck.value
      ? stripUnsafeQueryChars(queryCheck.value) || undefined
      : undefined;
    const categoryParam = categoryCheck.value
      ? stripUnsafeQueryChars(categoryCheck.value) || undefined
      : undefined;
    const filters = parseOfferFiltersFromSearchParams(urlParams);
    const sort = parseSort(firstSearchParam(params?.sort));
    const locale =
      normalizeLocale(
        firstSearchParam(params?.lang) ?? firstSearchParam(params?.locale)
      ) ?? DEFAULT_LOCALE;
    const cacheableFirstPage =
      initialPage === 1 &&
      !query &&
      !sort &&
      !hasActiveOfferFilters(filters);
    canSeedClientAllCache = cacheableFirstPage && !categoryParam;

    let cachedPage: CachedFirstBrowsePage | null = null;
    if (cacheableFirstPage) {
      const candidate = await getCachedFirstBrowsePage(
        marketCountry,
        DEFAULT_PRODUCT_LIST_LIMIT,
        categoryParam
      );
      if (cacheMatchesCategory(candidate, categoryParam)) cachedPage = candidate;
    }

    // Reuse the previous 96-item cache during the rollout, then write the
    // compact 48-item first-page key used by numbered pagination.
    if (cacheableFirstPage && !cachedPage?.products?.length) {
      const legacyPage = await getCachedFirstBrowsePage(
        marketCountry,
        LEGACY_FIRST_PAGE_LIMIT,
        categoryParam
      );
      if (cacheMatchesCategory(legacyPage, categoryParam)) {
        cachedPage = compactCachedPage(legacyPage);
        await setCachedFirstBrowsePage(
          marketCountry,
          DEFAULT_PRODUCT_LIST_LIMIT,
          cachedPage,
          categoryParam
        );
      }
    }

    if (!cachedPage?.products?.length) {
      const country = COUNTRIES[marketCountry] ?? COUNTRIES.RO;
      const freshPage = await withTimeout(
        fetchMergedProductsForLocation(
          { countryCode: marketCountry, countryName: country.name },
          query,
          categoryParam,
          locale,
          {
            ...BROWSE_LIST_OPTIONS,
            limit: DEFAULT_PRODUCT_LIST_LIMIT,
            offset: (initialPage - 1) * DEFAULT_PRODUCT_LIST_LIMIT,
            filters,
            sort,
          }
        ),
        INITIAL_CATALOG_TIMEOUT_MS,
        `Homepage ${marketCountry} catalog`
      );
      cachedPage = freshPage;
      if (freshPage.products.length > 0) {
        if (cacheableFirstPage && cacheMatchesCategory(freshPage, categoryParam)) {
          await setCachedFirstBrowsePage(
            marketCountry,
            DEFAULT_PRODUCT_LIST_LIMIT,
            { products: freshPage.products, meta: freshPage.meta },
            categoryParam
          );
        }
      }
    }

    if (Array.isArray(cachedPage?.products)) {
      initialProducts = cachedPage.products as Product[];
    }
    if (cachedPage?.meta && typeof cachedPage.meta === "object") {
      // HomePageClient's first-load cache is the unfiltered All aisle. Never
      // let a category/search/filter/sort/page response seed that global key.
      initialMeta = canSeedClientAllCache
        ? (cachedPage.meta as ProductFetchMeta)
        : null;
    }
  } catch (err) {
    console.error("[HomePage] SSR initial fetch error:", err);
    initialFetchFailed = true;
  }

  return (
    <HomePageClient
      initialCountry={marketCountry}
      initialProducts={initialProducts}
      initialMeta={initialMeta}
      initialFetchFailed={initialFetchFailed}
      initialPage={initialPage}
    />
  );
}
