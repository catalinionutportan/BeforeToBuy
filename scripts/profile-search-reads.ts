/** Bounded read-only search diagnosis. No product payloads or credentials in output. */
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";

async function main() {
  const country = process.argv.find((arg) => arg.startsWith("--country="))?.split("=")[1] ?? "CH";
  if (!["CH", "DE", "GB", "US"].includes(country)) throw new Error("Only current non-RO audit markets are allowed");
  const query = process.argv.find((arg) => arg.startsWith("--query="))?.slice(8) ?? "zznoexistingproductaudit123";
  const pattern = `%${query}%`;
  const requestedOperation = process.argv.find((arg) => arg.startsWith("--operation="))?.slice(12);
  const planMode = process.argv.find((arg) => arg.startsWith("--plan-mode="))?.slice(12);
  if (planMode && !["force_custom_plan", "force_generic_plan"].includes(planMode)) throw new Error("Invalid plan mode");
  const contains = { contains: query, mode: "insensitive" as const };
  const where: Prisma.ProductWhereInput = {
    targetCountries: { has: country },
    OR: [{ title: contains }, { brand: contains }, { description: contains }, { gtin: contains }],
    offers: { some: { inStock: true } },
  };
  try {
    for (const operation of ["old-count", "old-page", "combined-search", "country-count", "country-plan", "active-country-count", "cold-combined", "activity", "natural-page-plan", "table-stats"] as const) {
      if (requestedOperation && requestedOperation !== operation) continue;
      if (!requestedOperation && !["old-count", "old-page", "combined-search"].includes(operation)) continue;
      const start = performance.now();
      try {
        const result = await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SET TRANSACTION READ ONLY`;
          await tx.$queryRaw`SELECT set_config('statement_timeout', '7000ms', true)`;
          if (planMode) await tx.$queryRaw`SELECT set_config('plan_cache_mode', ${planMode}, true)`;
          if (operation === "table-stats") return {
            tables: await tx.$queryRaw`SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze FROM pg_stat_user_tables WHERE relname IN ('Product', 'Offer')`,
            indexes: await tx.$queryRaw`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'Product'`,
          };
          if (operation === "natural-page-plan") return { plan: await tx.$queryRaw(Prisma.sql`
            EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
            WITH matched_products AS MATERIALIZED (
              SELECT p.id FROM "Product" p WHERE p."targetCountries" @> ARRAY[${country}]::text[]
              AND EXISTS (SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."inStock" = true)
            ) SELECT id FROM matched_products ORDER BY id ASC LIMIT 48 OFFSET 48
          `) };
          if (operation === "activity") return { activity: await tx.$queryRaw`
            SELECT current_setting('server_version_num') AS server_version, state, wait_event_type, wait_event, COUNT(*)::int AS connections,
              MAX(EXTRACT(EPOCH FROM clock_timestamp() - query_start))::float AS oldest_query_seconds
            FROM pg_stat_activity WHERE usename = current_user AND pid <> pg_backend_pid()
            GROUP BY state, wait_event_type, wait_event
          ` };
          if (operation === "old-count") return { total: await tx.product.count({ where }) };
          if (operation === "old-page") return { rows: (await tx.product.findMany({ where, select: { id: true }, orderBy: { id: "asc" }, take: 48 })).length };
          if (operation === "cold-combined") {
            const [row] = await tx.$queryRaw<Array<{ total: number; countryTotal: number; ids: string[] }>>(Prisma.sql`
              WITH market_products AS MATERIALIZED (
                SELECT p.id FROM "Product" p WHERE p."targetCountries" @> ARRAY[${country}]::text[]
                AND EXISTS (SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."inStock" = true)
              ), matched AS MATERIALIZED (
                SELECT p.id FROM "Product" p JOIN market_products mp ON mp.id = p.id
                WHERE p.title ILIKE ${pattern} OR p.brand ILIKE ${pattern} OR p.description ILIKE ${pattern} OR p.gtin ILIKE ${pattern}
              ), page AS (SELECT id FROM matched ORDER BY id ASC LIMIT 48)
              SELECT (SELECT COUNT(*)::int FROM matched) AS total,
                (SELECT COUNT(*)::int FROM market_products) AS "countryTotal",
                COALESCE((SELECT array_agg(id ORDER BY id) FROM page), ARRAY[]::text[]) AS ids
            `);
            return { total: row?.total, countryTotal: row?.countryTotal, rows: row?.ids.length };
          }
          if (operation === "country-plan") {
            return { plan: await tx.$queryRaw(Prisma.sql`
              EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
              WITH market_products AS MATERIALIZED (
                SELECT p.id FROM "Product" p WHERE p."targetCountries" @> ARRAY[${country}]::text[]
              )
              SELECT COUNT(*)::int AS total FROM market_products p
              WHERE EXISTS (SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."inStock" = true)
            `) };
          }
          if (operation === "active-country-count") {
            const [row] = await tx.$queryRaw<Array<{ total: number }>>(Prisma.sql`
              WITH active_products AS MATERIALIZED (
                SELECT DISTINCT "productId" FROM "Offer" WHERE "inStock" = true
              )
              SELECT COUNT(*)::int AS total FROM "Product" p
              JOIN active_products a ON a."productId" = p.id
              WHERE p."targetCountries" @> ARRAY[${country}]::text[]
            `);
            return { total: row?.total };
          }
          if (operation === "country-count") {
            const [row] = await tx.$queryRaw<Array<{ total: number }>>(Prisma.sql`
              WITH market_products AS MATERIALIZED (
                SELECT p.id FROM "Product" p WHERE p."targetCountries" @> ARRAY[${country}]::text[]
              )
              SELECT COUNT(*)::int AS total FROM market_products p
              WHERE EXISTS (SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."inStock" = true)
            `);
            return { total: row?.total };
          }
          const [row] = await tx.$queryRaw<Array<{ total: number; ids: string[] }>>(Prisma.sql`
            WITH matched AS MATERIALIZED (
              SELECT p.id FROM "Product" p
              WHERE p."targetCountries" @> ARRAY[${country}]::text[]
                AND (p.title ILIKE ${pattern} OR p.brand ILIKE ${pattern} OR p.description ILIKE ${pattern} OR p.gtin ILIKE ${pattern})
                AND EXISTS (SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."inStock" = true)
            ), page AS (SELECT id FROM matched ORDER BY id ASC LIMIT 48)
            SELECT (SELECT COUNT(*)::int FROM matched) AS total,
              COALESCE((SELECT array_agg(id ORDER BY id) FROM page), ARRAY[]::text[]) AS ids
          `);
          return { total: row?.total, rows: row?.ids.length };
        }, { timeout: 10000 });
        console.log(JSON.stringify({ country, query, operation, ms: Math.round(performance.now() - start), ...result }, (_key, value) => typeof value === "bigint" ? value.toString() : value));
      } catch { console.log(JSON.stringify({ country, query, operation, ms: Math.round(performance.now() - start), failed: true })); }
    }
  } finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Search profile failed"); process.exitCode = 1; });
