import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import type { CountryCode, Product } from "@/types";

const PRODUCT_LOOKUP_COUNTRIES: CountryCode[] = ["RO", "CH", "DE", "FR", "GB", "US"];

/** Infer market from feed product ids like `feed-ro-scule365-…`. */
export function inferCountryFromProductId(productId: string): CountryCode | undefined {
  const match = productId.match(/^feed-([a-z]{2})-/i);
  if (!match?.[1]) return undefined;
  const code = match[1].toUpperCase() as CountryCode;
  return code in COUNTRIES ? code : undefined;
}

async function findInCountry(
  countryCode: CountryCode,
  decodedId: string
): Promise<Product | null> {
  const catalog = await fetchCatalogForCountry(countryCode);
  return catalog.products.find((product) => product.id === decodedId) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const decoded = decodeURIComponent(id);
  const preferred = inferCountryFromProductId(decoded) ?? DEFAULT_COUNTRY;

  const ordered = [
    preferred,
    ...PRODUCT_LOOKUP_COUNTRIES.filter((code) => code !== preferred),
  ];

  for (const countryCode of ordered) {
    const product = await findInCountry(countryCode, decoded);
    if (product) return product;
  }

  return null;
}

export async function listProductIdsForSitemap(limit = 200): Promise<string[]> {
  const ids: string[] = [];
  for (const countryCode of PRODUCT_LOOKUP_COUNTRIES) {
    if (ids.length >= limit) break;
    const catalog = await fetchCatalogForCountry(countryCode);
    for (const product of catalog.products) {
      ids.push(product.id);
      if (ids.length >= limit) break;
    }
  }
  return ids;
}
