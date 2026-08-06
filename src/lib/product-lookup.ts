import { fetchDefaultCatalog } from "@/lib/category-page-data";
import type { Product } from "@/types";

export async function getProductById(id: string): Promise<Product | null> {
  const catalog = await fetchDefaultCatalog();
  const decoded = decodeURIComponent(id);
  return catalog.products.find((product) => product.id === decoded) ?? null;
}

export async function listProductIdsForSitemap(limit = 200): Promise<string[]> {
  const catalog = await fetchDefaultCatalog();
  return catalog.products.slice(0, limit).map((product) => product.id);
}
