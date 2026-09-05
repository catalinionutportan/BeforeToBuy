import { AsyncLocalStorage } from "node:async_hooks";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isRedisConfigured } from "@/lib/redis";

const scope = new AsyncLocalStorage<Prisma.TransactionClient>();
const BOUNDED_MARKETS = new Set(["CH", "DE", "GB", "US"]);

/** All queries belonging to a bounded read use its one transaction connection. */
export function catalogReadDb(): Prisma.TransactionClient {
  return scope.getStore() ?? prisma;
}

export async function withBoundedCatalogRead<T>(country: string, operation: () => Promise<T>): Promise<T> {
  // Self-hosted disk/memory cache only: do not pin a connection around remote Redis I/O.
  if (!BOUNDED_MARKETS.has(country.toUpperCase()) || isRedisConfigured() || scope.getStore()) return operation();
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    // PostgreSQL cancels the SQL itself; an HTTP Promise timeout cannot do that.
    // PG17+ also bounds the entire transaction (verified on the NAS database).
    // Older supported PostgreSQL versions retain the per-statement guard.
    await tx.$queryRaw(Prisma.sql`
      SELECT set_config('statement_timeout', '4500ms', true),
        CASE WHEN current_setting('server_version_num')::int >= 170000
          THEN set_config('transaction_timeout', '5500ms', true)
          ELSE NULL END
    `);
    return scope.run(tx, operation);
  }, { maxWait: 500, timeout: 6000 });
}
