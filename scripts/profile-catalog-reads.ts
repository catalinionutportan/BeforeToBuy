// Bounded, read-only diagnostics. Never dumps product data or connection strings.
import { prisma } from "../src/lib/db";
import { countInStockProductsForCountry, getCategoryCountsFromDb, getCategoryCoverImagesFromDb } from "../src/lib/db-service";

async function profileMarketFirstPage(country: string): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH matched_products AS MATERIALIZED (
      SELECT p.id
      FROM "Product" p
      WHERE p."targetCountries" @> ARRAY[${country}]::text[]
        AND EXISTS (
          SELECT 1
          FROM "Offer" o
          WHERE o."productId" = p.id AND o."inStock" = true
        )
    )
    SELECT id
    FROM matched_products
    ORDER BY id ASC
    LIMIT 24
  `;
  return rows.length;
}

async function main() {
  try {
    const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string; indexdef: string }>>`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename IN ('Product','Offer')`;
    console.log(JSON.stringify({ indexes }));
    for (const country of ["CH", "DE", "RO"]) {
      for (const [name, read] of Object.entries({ count: countInStockProductsForCountry, categories: getCategoryCountsFromDb, covers: getCategoryCoverImagesFromDb })) {
        const started = performance.now();
        await read(country);
        console.log(JSON.stringify({ country, operation: name, ms: Math.round(performance.now() - started) }));
      }
    }

    const marketFirstStarted = performance.now();
    const selectedIds = await profileMarketFirstPage("RO");
    console.log(JSON.stringify({
      country: "RO",
      operation: "market-first-page-ids",
      ms: Math.round(performance.now() - marketFirstStarted),
      rows: selectedIds,
    }));
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch(() => {
  console.error("Catalogue read profiling failed");
  process.exitCode = 1;
});
