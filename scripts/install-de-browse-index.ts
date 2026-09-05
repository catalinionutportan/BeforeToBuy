/** Additive DE-only access index. No products/offers/import configuration are changed. */
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "../src/lib/db";

// Supabase's transaction/pgbouncer compatibility path wraps raw commands;
// concurrent DDL needs its dedicated session endpoint, not the request client.
const connection = new URL(resolveDatabaseUrl() ?? "");
if (connection.hostname.includes(".pooler.supabase.com")) connection.port = "5432";
connection.searchParams.delete("pgbouncer");
connection.searchParams.set("connection_limit", "1");
connection.searchParams.set("statement_cache_size", "0");
const prisma = new PrismaClient({ datasources: { db: { url: connection.toString() } } });

const INDEX_NAME = "Product_de_browse_id_idx";
async function inspect() {
  return prisma.$queryRaw<Array<{ valid: boolean; definition: string; bytes: bigint }>>`
    SELECT i.indisvalid AS valid, pg_get_indexdef(i.indexrelid) AS definition,
      pg_relation_size(i.indexrelid) AS bytes
    FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = ${INDEX_NAME}
  `;
}
async function main() {
  try {
    const existing = await inspect();
    if (!existing.length && process.argv.includes("--apply")) {
      // Intentionally outside $transaction: CONCURRENTLY must not run in a tx block.
      await prisma.$executeRawUnsafe(`CREATE INDEX CONCURRENTLY "Product_de_browse_id_idx"
        ON public."Product" (id) WHERE "targetCountries" @> ARRAY['DE']::text[]`);
    }
    const result = await inspect();
    if (process.argv.includes("--apply") && (result.length !== 1 || !result[0]?.valid)) {
      throw new Error("DE browse index is absent or invalid; inspect before retrying. No index was dropped.");
    }
    const expectedDefinition = `CREATE INDEX "Product_de_browse_id_idx" ON public."Product" USING btree (id) WHERE ("targetCountries" @> ARRAY['DE'::text])`;
    if (result.some((row) => row.definition !== expectedDefinition)) {
      throw new Error("An unexpected index uses the DE browse name; no existing index was changed.");
    }
    console.log(JSON.stringify({ index: INDEX_NAME, result }, (_key, value) => typeof value === "bigint" ? value.toString() : value));
  } finally { await prisma.$disconnect(); }
}
void main().catch((error) => { console.error(error instanceof Error ? error.message : "DE index operation failed"); process.exitCode = 1; });
