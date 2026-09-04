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
  searchParams?: Promise<{
    country?: string;
    category?: string;
    q?: string;
    domain?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  let marketCountry: CountryCode = "RO";
  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;
  let initialFetchFailed = false;

  try {
    const params = searchParams ? await searchParams : undefined;
    marketCountry = await getRequestMarketCountry(params?.country?.toUpperCase());
    const categoryParam = params?.category?.trim() || undefined;
    let cachedPage =
      (categoryParam
        ? await getCachedFirstBrowsePage(marketCountry, DEFAULT_PRODUCT_LIST_LIMIT, categoryParam)
        : null) ||
      (await getCachedFirstBrowsePage(marketCountry, DEFAULT_PRODUCT_LIST_LIMIT));

    // Reuse the previous 96-item cache during the recovery rollout, then write
    // the compact 24-item key so subsequent requests stay fast.
    if (!cachedPage?.products?.length) {
      const legacyPage =
        (categoryParam
          ? await getCachedFirstBrowsePage(marketCountry, LEGACY_FIRST_PAGE_LIMIT, categoryParam)
          : null) ||
        (await getCachedFirstBrowsePage(marketCountry, LEGACY_FIRST_PAGE_LIMIT));
      if (legacyPage?.products?.length) {
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
          undefined,
          categoryParam,
          undefined,
          { ...BROWSE_LIST_OPTIONS, limit: DEFAULT_PRODUCT_LIST_LIMIT }
        ),
        INITIAL_CATALOG_TIMEOUT_MS,
        `Homepage ${marketCountry} catalog`
      );
      if (freshPage.products.length > 0) {
        cachedPage = freshPage;
        await setCachedFirstBrowsePage(
          marketCountry,
          DEFAULT_PRODUCT_LIST_LIMIT,
          { products: freshPage.products, meta: freshPage.meta },
          categoryParam
        );
      }
    }

    if (Array.isArray(cachedPage?.products)) {
      initialProducts = cachedPage.products as Product[];
    }
    if (cachedPage?.meta && typeof cachedPage.meta === "object") {
      initialMeta = cachedPage.meta as ProductFetchMeta;
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
    />
  );
}
