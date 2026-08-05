import baseProductsDb from "@/data/base-products.json";
import { Product } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

const BASE_PRODUCTS_DB: Product[] = baseProductsDb as Product[];

export async function fetchBaseProducts(locale: string = DEFAULT_LOCALE): Promise<Product[]> {
  const ui = HOME_UI[locale];

  return baseProductsDb.map((product) => ({
    ...product,
    title: ui[`product_title_${product.id}` as keyof typeof ui] || product.title,
    description: ui[`product_description_${product.id}` as keyof typeof ui] || product.description,
  })) as Product[];
}
