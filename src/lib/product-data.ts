import baseProductsDb from "@/data/base-products.json";
import catalogExpandDb from "@/data/catalog-expand.json";
import { Product } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";

const MERGED_PRODUCTS_DB = [
  ...(baseProductsDb as Product[]),
  ...(catalogExpandDb as Product[]),
];

export async function fetchBaseProducts(locale: SiteLocale = DEFAULT_LOCALE): Promise<Product[]> {
  const ui = HOME_UI[locale];

  return MERGED_PRODUCTS_DB.map((product) => ({
    ...product,
    title: ui[`product_title_${product.id}` as keyof typeof ui] || product.title,
    description: ui[`product_description_${product.id}` as keyof typeof ui] || product.description,
  })) as Product[];
}
