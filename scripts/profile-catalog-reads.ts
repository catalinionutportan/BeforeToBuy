// Bounded, read-only diagnostics. Never dumps product data or connection strings.
import { prisma } from "../src/lib/db";
import { countInStockProductsForCountry, getCategoryCountsFromDb, getCategoryCoverImagesFromDb } from "../src/lib/db-service";
async function main() {
try {
  const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string; indexdef: string }>>`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename IN ('Product','Offer')`;
  console.log(JSON.stringify({ indexes }));
  for (const country of ["CH", "DE"]) {
    for (const [name, read] of Object.entries({ count: countInStockProductsForCountry, categories: getCategoryCountsFromDb, covers: getCategoryCoverImagesFromDb })) {
      const started = performance.now();
      await read(country);
      console.log(JSON.stringify({ country, operation: name, ms: Math.round(performance.now() - started) }));
    }
  }
} finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Catalogue read profiling failed"); process.exitCode = 1; });
