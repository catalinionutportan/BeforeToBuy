import { Prisma, type PrismaClient } from "@prisma/client";

export type AtomicCatalogProductRow = Omit<
  Prisma.ProductCreateManyInput,
  "targetCountries"
> & {
  targetCountries: string[];
};

export type AtomicCatalogOfferRow = Omit<
  Prisma.OfferCreateManyInput,
  "feedMerchantId"
> & {
  feedMerchantId: string;
};

type TransactionHost = Pick<PrismaClient, "$transaction">;

export interface AtomicCatalogImportInput {
  prisma: TransactionHost;
  merchantId: string;
  country: string;
  productRows: AtomicCatalogProductRow[];
  offerRows: AtomicCatalogOfferRow[];
  chunkSize?: number;
  transactionTimeoutMs?: number;
  lockTimeoutMs?: number;
  statementTimeoutMs?: number;
}

export interface AtomicCatalogImportResult {
  products: number;
  offers: number;
}

const DEFAULT_CHUNK_SIZE = 1_000;
const DEFAULT_TRANSACTION_TIMEOUT_MS = 300_000;
const DEFAULT_LOCK_TIMEOUT_MS = 10_000;
const DEFAULT_STATEMENT_TIMEOUT_MS = 120_000;

function assertUniqueNonEmptyIds(rows: Array<{ id: string }>, label: string): Set<string> {
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.id.trim()) throw new Error(`${label} contains an empty id.`);
    if (ids.has(row.id)) throw new Error(`${label} contains duplicate id ${row.id}.`);
    ids.add(row.id);
  }
  return ids;
}

/** Reject partial or internally inconsistent payloads before opening a transaction. */
export function validateAtomicCatalogImport(
  input: Pick<
    AtomicCatalogImportInput,
    "merchantId" | "country" | "productRows" | "offerRows"
  >
): void {
  const { merchantId, country, productRows, offerRows } = input;
  if (!merchantId.trim()) throw new Error("Catalogue import requires a merchant id.");
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error(`Catalogue import country must be a two-letter uppercase code: ${country}.`);
  }
  if (productRows.length === 0) throw new Error("Refusing to publish an empty product catalogue.");
  if (offerRows.length === 0) throw new Error("Refusing to publish a catalogue without offers.");

  const productIds = assertUniqueNonEmptyIds(productRows, "Product payload");
  assertUniqueNonEmptyIds(offerRows, "Offer payload");
  const productIdsWithOffers = new Set<string>();

  for (const product of productRows) {
    if (!product.targetCountries.includes(country)) {
      throw new Error(`Product ${product.id} does not target import country ${country}.`);
    }
    if (!product.title.trim() || !product.category.trim()) {
      throw new Error(`Product ${product.id} is missing title or category.`);
    }
    if (product.basePrice != null && !Number.isFinite(product.basePrice)) {
      throw new Error(`Product ${product.id} has an invalid base price.`);
    }
  }

  for (const offer of offerRows) {
    if (offer.feedMerchantId !== merchantId) {
      throw new Error(
        `Offer ${offer.id} belongs to ${offer.feedMerchantId}, expected ${merchantId}.`
      );
    }
    if (!productIds.has(offer.productId)) {
      throw new Error(`Offer ${offer.id} references missing product ${offer.productId}.`);
    }
    if (!Number.isFinite(offer.price) || offer.price < 0) {
      throw new Error(`Offer ${offer.id} has an invalid price.`);
    }
    productIdsWithOffers.add(offer.productId);
  }

  for (const productId of productIds) {
    if (!productIdsWithOffers.has(productId)) {
      throw new Error(`Product ${productId} has no offer for ${merchantId}.`);
    }
  }
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return value;
}

function serializableProductRows(rows: AtomicCatalogProductRow[]): unknown[] {
  const now = new Date().toISOString();
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    gtin: row.gtin ?? null,
    brand: row.brand ?? null,
    category: row.category,
    image: row.image ?? null,
    catalogSource: row.catalogSource ?? "production-live",
    targetCountries: row.targetCountries,
    basePrice: row.basePrice ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt ?? now,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt ?? now,
  }));
}

function productUpsertQuery(rows: AtomicCatalogProductRow[]): Prisma.Sql {
  const payload = JSON.stringify(serializableProductRows(rows));
  return Prisma.sql`
    INSERT INTO "Product" (
      "id", "title", "description", "gtin", "brand", "category", "image",
      "catalogSource", "targetCountries", "basePrice", "createdAt", "updatedAt"
    )
    SELECT
      incoming."id", incoming."title", incoming."description", incoming."gtin",
      incoming."brand", incoming."category", incoming."image", incoming."catalogSource",
      incoming."targetCountries", incoming."basePrice", incoming."createdAt", incoming."updatedAt"
    FROM jsonb_to_recordset(CAST(${payload} AS jsonb)) AS incoming(
      "id" text,
      "title" text,
      "description" text,
      "gtin" text,
      "brand" text,
      "category" text,
      "image" text,
      "catalogSource" text,
      "targetCountries" text[],
      "basePrice" double precision,
      "createdAt" timestamptz,
      "updatedAt" timestamptz
    )
    ON CONFLICT ("id") DO UPDATE SET
      "title" = EXCLUDED."title",
      "description" = EXCLUDED."description",
      "gtin" = EXCLUDED."gtin",
      "brand" = EXCLUDED."brand",
      "category" = EXCLUDED."category",
      "image" = EXCLUDED."image",
      "catalogSource" = EXCLUDED."catalogSource",
      "targetCountries" = ARRAY(
        SELECT DISTINCT target_country
        FROM unnest("Product"."targetCountries" || EXCLUDED."targetCountries") AS target_country
        ORDER BY target_country
      ),
      "basePrice" = EXCLUDED."basePrice",
      "updatedAt" = EXCLUDED."updatedAt"
  `;
}

/**
 * Replace one merchant's offers in a single PostgreSQL transaction.
 *
 * PostgreSQL MVCC keeps the previous committed catalogue visible to readers
 * until the final commit. A failure rolls back the offer deletion and every
 * product/offer write. Products are upserted (never deleted), so offers owned
 * by another merchant and their target-country membership are preserved.
 */
export async function replaceMerchantCatalogueAtomically(
  input: AtomicCatalogImportInput
): Promise<AtomicCatalogImportResult> {
  validateAtomicCatalogImport(input);
  const chunkSize = positiveInteger(input.chunkSize ?? DEFAULT_CHUNK_SIZE, "chunkSize");
  const transactionTimeoutMs = positiveInteger(
    input.transactionTimeoutMs ?? DEFAULT_TRANSACTION_TIMEOUT_MS,
    "transactionTimeoutMs"
  );
  const lockTimeoutMs = positiveInteger(
    input.lockTimeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS,
    "lockTimeoutMs"
  );
  const statementTimeoutMs = positiveInteger(
    input.statementTimeoutMs ?? DEFAULT_STATEMENT_TIMEOUT_MS,
    "statementTimeoutMs"
  );

  return input.prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT set_config('lock_timeout', ${`${lockTimeoutMs}ms`}, true)`
      );
      await tx.$queryRaw(
        Prisma.sql`SELECT set_config('statement_timeout', ${`${statementTimeoutMs}ms`}, true)`
      );
      await tx.$queryRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('btb-catalog-import'), hashtext(${input.merchantId})) IS NULL AS "locked"`
      );

      for (let i = 0; i < input.productRows.length; i += chunkSize) {
        await tx.$executeRaw(productUpsertQuery(input.productRows.slice(i, i + chunkSize)));
      }

      await tx.offer.deleteMany({ where: { feedMerchantId: input.merchantId } });
      for (let i = 0; i < input.offerRows.length; i += chunkSize) {
        await tx.offer.createMany({
          data: input.offerRows.slice(i, i + chunkSize),
          skipDuplicates: true,
        });
      }

      const publishedOfferCount = await tx.offer.count({
        where: { feedMerchantId: input.merchantId },
      });
      if (publishedOfferCount !== input.offerRows.length) {
        throw new Error(
          `Atomic catalogue verification failed for ${input.merchantId}: ` +
            `expected ${input.offerRows.length} offers, found ${publishedOfferCount}.`
        );
      }

      return { products: input.productRows.length, offers: publishedOfferCount };
    },
    { maxWait: lockTimeoutMs, timeout: transactionTimeoutMs }
  );
}
