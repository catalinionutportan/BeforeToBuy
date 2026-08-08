import HomePageClient from "@/components/home/HomePageClient";
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import { getRequestMarketCountry } from "@/lib/request-market";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { Product } from "@/types";

export default async function Home() {
  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;
  let initialFetchFailed = false;

  try {
    // Cookie / live-geo / primary live market (RO) — never force empty CH on new visitors.
    const marketCountry = await getRequestMarketCountry();
    const catalog = await fetchCatalogForCountry(marketCountry);
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
