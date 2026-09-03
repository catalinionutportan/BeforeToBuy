import HomePageClient from "@/components/home/HomePageClient";
import { getCachedFirstBrowsePage } from "@/lib/catalog-browse-cache";
import { isUsableAllBrowsePage } from "@/lib/prefetch-browse-catalog";
import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import { getRequestMarketCountry } from "@/lib/request-market";
import type { CountryCode, Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let marketCountry: CountryCode = "RO";
  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;

  try {
    marketCountry = await getRequestMarketCountry();
    const cachedPage = await getCachedFirstBrowsePage(marketCountry, DEFAULT_PRODUCT_LIST_LIMIT);
    if (Array.isArray(cachedPage?.products)) {
      initialProducts = cachedPage.products as Product[];
    }
    if (cachedPage?.meta && typeof cachedPage.meta === "object") {
      const meta = cachedPage.meta as ProductFetchMeta;
      if (isUsableAllBrowsePage({ products: initialProducts, meta })) {
        initialMeta = meta;
      }
    }
  } catch (err) {
    console.error("[HomePage] SSR initial fetch error:", err);
  }

  return (
    <HomePageClient
      initialCountry={marketCountry}
      initialProducts={initialProducts}
      initialMeta={initialMeta}
    />
  );
}
