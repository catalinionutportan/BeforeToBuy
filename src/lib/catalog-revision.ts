import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { withTimeout } from "@/lib/promise-timeout";

type RevisionScope = { country: string; revision: string };
const scope = new AsyncLocalStorage<RevisionScope>();
const pending = new Map<string, Promise<string>>();

/** No TTL: each new navigation checks the committed revision, not an old memo. */
export async function getCatalogRevision(country: string): Promise<string> {
  const code = country.toUpperCase();
  const current = scope.getStore();
  if (current?.country === code) return current.revision;
  if (process.env.FORCE_SAMPLE_FEEDS === "1" || process.env.VITEST === "true") return "sample";
  const existing = pending.get(code);
  if (existing) return existing;
  const request = withTimeout(prisma.$queryRaw<Array<{ revision: string }>>(Prisma.sql`
    SELECT "revision" FROM "CatalogRevision" WHERE "country" = ${code}
  `), 2_000, "Catalogue revision").then((rows) => rows[0]?.revision ?? "initial");
  pending.set(code, request);
  try { return await request; }
  finally { if (pending.get(code) === request) pending.delete(code); }
}

/** All cache reads/writes in one request use its starting revision, even if an import commits midway. */
export async function withCatalogRevision<T>(country: string, operation: () => Promise<T>): Promise<T> {
  const code = country.toUpperCase();
  if (scope.getStore()?.country === code) return operation();
  const revision = await getCatalogRevision(code);
  return scope.run({ country: code, revision }, operation);
}

type RevisionTransaction = Pick<Prisma.TransactionClient, "$queryRaw" | "$executeRaw">;

/** Call before replacement as well as after it to include removed and shared products' markets. */
export async function merchantCatalogCountries(tx: RevisionTransaction, merchantId: string): Promise<string[]> {
  const rows = await tx.$queryRaw<Array<{ country: string }>>(Prisma.sql`
    SELECT DISTINCT unnest(p."targetCountries") AS country
    FROM "Product" p JOIN "Offer" o ON o."productId" = p.id
    WHERE o."feedMerchantId" = ${merchantId}
  `);
  return rows.map((row) => row.country).filter((country) => typeof country === "string" && /^[A-Z]{2}$/.test(country));
}

export async function publishCatalogRevision(tx: RevisionTransaction, countries: string[]): Promise<void> {
  const revision = randomUUID();
  for (const country of [...new Set(countries)].sort()) {
    if (!/^[A-Z]{2}$/.test(country)) throw new Error("Invalid catalogue revision country");
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "CatalogRevision" ("country", "revision", "updatedAt") VALUES (${country}, ${revision}, NOW())
      ON CONFLICT ("country") DO UPDATE SET "revision" = EXCLUDED."revision", "updatedAt" = EXCLUDED."updatedAt"
    `);
  }
}
