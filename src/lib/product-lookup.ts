import { cache } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchCatalogForCountry } from "@/lib/category-page-data";
import { prisma } from "@/lib/db";
import { mapPrismaProduct } from "@/lib/db-service";
import type { CountryCode, Product } from "@/types";

const PRODUCT_LOOKUP_COUNTRIES: CountryCode[] = ["RO", "CH", "DE", "FR", "GB", "US"];

/** Infer market from feed product ids like `feed-ro-scule365-…`. */
export function inferCountryFromProductId(productId: string): CountryCode | undefined {
  const match = productId.match(/^feed-([a-z]{2})-/i);
  if (!match?.[1]) return undefined;
  const code = match[1].toUpperCase() as CountryCode;
  return code in COUNTRIES ? code : undefined;
}

/** Fast path: single indexed primary-key lookup in Supabase. */
async function findInDb(decodedId: string): Promise<Product | null> {
  try {
    const row = await prisma.product.findUnique({
      where: { id: decodedId },
      include: { offers: true },
    });
    return row ? mapPrismaProduct(row) : null;
  } catch (error) {
    console.error(
      "[product-lookup] DB lookup failed; falling back to catalog scan:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function findInCountry(
  countryCode: CountryCode,
  decodedId: string
): Promise<Product | null> {
  const catalog = await fetchCatalogForCountry(countryCode);
  return catalog.products.find((product) => product.id === decodedId) ?? null;
}

/**
 * Wrapped in React `cache()` so generateMetadata + page (or modal) share one
 * lookup per request instead of re-running the whole chain.
 */
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  const decoded = decodeURIComponent(id);

  // 1) Direct DB lookup — O(1), covers the whole Supabase catalogue.
  const fromDb = await findInDb(decoded);
  if (fromDb) return fromDb;

  // 2) Fallback for feed-only products (not imported into Supabase):
  //    scan the in-memory/Redis feed catalog, preferred country first.
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
});

export async function listProductIdsForSitemap(limit = 200): Promise<string[]> {
  // Fast path: ids straight from the DB (no offers, no counts).
  try {
    const rows = await prisma.product.findMany({
      select: { id: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    if (rows.length > 0) return rows.map((row) => row.id);
  } catch (error) {
    console.error(
      "[product-lookup] DB sitemap listing failed; falling back to catalog scan:",
      error instanceof Error ? error.message : error
    );
  }

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
