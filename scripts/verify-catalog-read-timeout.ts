/** Timeout probes only on the isolated local database; never run pg_sleep on production. */
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db";
import { catalogReadDb, withBoundedCatalogRead } from "../src/lib/catalog-read-transaction";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.port !== '55439') {
    throw new Error("Timeout probes require isolated localhost:55439");
  }
  try {
    const start = Date.now();
    await assert.rejects(withBoundedCatalogRead("CH", async () => {
      await catalogReadDb().$queryRaw`SELECT pg_sleep(10)::text AS probe`;
    }));
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 4000 && elapsed < 6000, `Statement cancellation took ${elapsed}ms`);
    const [activity] = await prisma.$queryRaw<Array<{ active: number }>>`
      SELECT COUNT(*)::int AS active FROM pg_stat_activity
      WHERE pid <> pg_backend_pid() AND state = 'active' AND query LIKE '%pg_sleep(10)%'
    `;
    assert.equal(activity?.active, 0);
    const [settings] = await prisma.$queryRaw<Array<{ timeout: string }>>`SELECT current_setting('statement_timeout') AS timeout`;
    assert.equal(settings?.timeout, '0');
    const [healthy] = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1::int AS ok`;
    assert.equal(healthy?.ok, 1);
    console.log(JSON.stringify({ statementCancelledMs: elapsed, orphanedQueries: 0, timeoutReset: true, nextRead: "pass" }));

    const transactionStarted = Date.now();
    await assert.rejects(withBoundedCatalogRead("CH", async () => {
      await catalogReadDb().$queryRaw`SELECT pg_sleep(3.2)::text AS probe`;
      await catalogReadDb().$queryRaw`SELECT pg_sleep(3.2)::text AS probe`;
    }));
    const transactionElapsed = Date.now() - transactionStarted;
    assert.ok(transactionElapsed < 7200, `Transaction termination took ${transactionElapsed}ms`);
    const [remaining] = await prisma.$queryRaw<Array<{ active: number }>>`
      SELECT COUNT(*)::int AS active FROM pg_stat_activity
      WHERE pid <> pg_backend_pid() AND state = 'active' AND query LIKE '%pg_sleep(3.2)%'
    `;
    assert.equal(remaining?.active, 0);
    console.log(JSON.stringify({ transactionTerminatedMs: transactionElapsed, orphanedQueries: 0 }));
  } finally { await prisma.$disconnect(); }
}
void main().catch((error) => { console.error(error instanceof Error ? error.message : "Timeout verification failed"); process.exitCode = 1; });
