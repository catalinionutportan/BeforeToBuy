import HomePageClient from "@/components/home/HomePageClient";
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import { BROWSE_LIST_OPTIONS, HOME_SSR_PRODUCT_LIMIT } from "@/lib/product-list-options";
import { getRequestMarketCountry } from "@/lib/request-market";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { Product } from "@/types";

export default async function Home() {
  // Resolve market outside the catalog try/catch so Next.js dynamic-cookie
  // signals are not misreported as a product fetch failure during build.
  const marketCountry = await getRequestMarketCountry();

  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;
  let initialFetchFailed = false;

  try {
    const catalog = await fetchCatalogForCountry(marketCountry, undefined, {
      ...BROWSE_LIST_OPTIONS,
      limit: HOME_SSR_PRODUCT_LIMIT,
      offset: 0,
    });
    initialProducts = catalog.products;
    initialMeta = catalog.meta;
  } catch (error) {
    console.error("Failed to fetch initial product catalog:", error);
    initialFetchFailed = true;
  }

  return (
    <HomePageClient
      initialProducts={initialProducts}
      initialMeta={initialMeta}
      initialFetchFailed={initialFetchFailed}
    />
  );
}
