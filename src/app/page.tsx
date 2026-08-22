import HomePageClient from "@/components/home/HomePageClient";
import { getCachedFirstBrowsePage } from "@/lib/catalog-browse-cache";
import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import { getRequestMarketCountry } from "@/lib/request-market";
import type { Product } from "@/types";

export default async function Home() {
  // Redis first page only — never wait on Supabase here (that was 2–4s TTFB).
  const marketCountry = await getRequestMarketCountry();
  const cachedPage = await getCachedFirstBrowsePage(marketCountry, DEFAULT_PRODUCT_LIST_LIMIT);
  const initialProducts = Array.isArray(cachedPage?.products)
    ? (cachedPage.products as Product[])
    : [];
  const initialMeta =
    cachedPage?.meta && typeof cachedPage.meta === "object"
      ? (cachedPage.meta as ProductFetchMeta)
      : null;

  return (
    <HomePageClient
      initialCountry={marketCountry}
      initialProducts={initialProducts}
      initialMeta={initialMeta}
    />
  );
}
