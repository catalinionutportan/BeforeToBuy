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
  if (process.env.FORCE_SAMPLE_FEEDS === "1") return null;

  try {
    const row = await prisma.product.findUnique({
      where: { id: decodedId },
      include: { offers: true },
    });
    return row ? mapPrismaProduct(row) : null;
  } catch (error) {
    // A database outage must not trigger a full feed scan (or become a false 404).
    console.error("[product-lookup] Indexed lookup failed");
    throw error;
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
  let decoded: string;
  try { decoded = decodeURIComponent(id); } catch { return null; }

  // 1) Direct DB lookup — O(1), covers the whole Supabase catalogue.
  const fromDb = await findInDb(decoded);
  if (fromDb) return fromDb;
  if (process.env.FORCE_SAMPLE_FEEDS !== "1") return null;

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
