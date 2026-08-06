import HomePageClient from "@/components/home/HomePageClient";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { Product } from "@/types";

export default async function Home() {
  let initialProducts: Product[] = [];
  let initialMeta: ProductFetchMeta | null = null;
  let initialFetchFailed = false;

  try {
    // Full country catalog — market hub tabs filter client-side for instant switching.
    const catalog = await fetchDefaultCatalog();
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
