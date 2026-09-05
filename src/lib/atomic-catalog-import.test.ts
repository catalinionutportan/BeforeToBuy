import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  replaceMerchantCatalogueAtomically,
  validateAtomicCatalogImport,
  type AtomicCatalogImportInput,
  type AtomicCatalogOfferRow,
  type AtomicCatalogProductRow,
} from "@/lib/atomic-catalog-import";

const product: AtomicCatalogProductRow = {
  id: "feed-1",
  title: "Representative product",
  category: "notebooks-laptops",
  targetCountries: ["CH"],
  catalogSource: "production-live",
};

const offer: AtomicCatalogOfferRow = {
  id: "offer-1",
  productId: product.id,
  storeName: "Acer",
  price: 499,
  currency: "CHF",
  inStock: true,
  purchaseUrl: "https://example.test/product",
  source: "production-live",
  feedMerchantId: "ch-acer",
  fetchedAt: "2026-09-05T00:00:00.000Z",
};

type StoredOffer = { id: string; feedMerchantId: string | null };

function transactionHost(
  initialOffers: StoredOffer[],
  options: {
    failCreate?: boolean;
    baseline?: { products: number; offers: number };
  } = {}
): {
  prisma: AtomicCatalogImportInput["prisma"];
  committedOffers: () => StoredOffer[];
  operations: () => { transactions: number; productWrites: number; offerDeletes: number };
} {
  let committed = initialOffers.map((row) => ({ ...row }));
  const operationCounts = { transactions: 0, productWrites: 0, offerDeletes: 0 };

  const prisma = {
    async $transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T> {
      operationCounts.transactions += 1;
      let pending = committed.map((row) => ({ ...row }));
      let queryCount = 0;
      const tx = {
        $queryRaw: async () => {
          queryCount += 1;
          return queryCount === 4 && options.baseline
            ? [{
                productCount: BigInt(options.baseline.products),
                offerCount: BigInt(options.baseline.offers),
              }]
            : [];
        },
        $executeRaw: async () => {
          operationCounts.productWrites += 1;
          return 1;
        },
        offer: {
          deleteMany: async ({ where }: { where: { feedMerchantId: string } }) => {
            operationCounts.offerDeletes += 1;
            const before = pending.length;
            pending = pending.filter(
              (stored) => stored.feedMerchantId !== where.feedMerchantId
            );
            return { count: before - pending.length };
          },
          createMany: async ({ data }: { data: AtomicCatalogOfferRow[] }) => {
            if (options.failCreate) throw new Error("injected offer write failure");
            pending.push(
              ...data.map((row) => ({ id: row.id, feedMerchantId: row.feedMerchantId }))
            );
            return { count: data.length };
          },
          count: async ({ where }: { where: { feedMerchantId: string } }) =>
            pending.filter((stored) => stored.feedMerchantId === where.feedMerchantId).length,
        },
      };

      const result = await callback(tx);
      committed = pending;
      return result;
    },
  } as unknown as Pick<PrismaClient, "$transaction">;

  return {
    prisma,
    committedOffers: () => committed,
    operations: () => ({ ...operationCounts }),
  };
}

describe("atomic catalogue import", () => {
  it("rejects inconsistent payloads before opening a database transaction", () => {
    expect(() =>
      validateAtomicCatalogImport({
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [{ ...offer, feedMerchantId: "another-merchant" }],
      })
    ).toThrow(/belongs to another-merchant/);

    expect(() =>
      validateAtomicCatalogImport({
        merchantId: "ch-acer",
        country: "CH",
        productRows: [{ ...product, targetCountries: ["DE"] }],
        offerRows: [offer],
      })
    ).toThrow(/does not target import country CH/);
  });

  it("replaces only the selected merchant and preserves foreign offers", async () => {
    const host = transactionHost([
      { id: "old-acer", feedMerchantId: "ch-acer" },
      { id: "foreign", feedMerchantId: "ch-belando" },
    ]);

    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: host.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
      })
    ).resolves.toEqual({
      products: 1,
      offers: 1,
      baseline: { products: 0, offers: 0 },
      reductionOverrideApplied: false,
    });

    expect(host.committedOffers()).toEqual([
      { id: "foreign", feedMerchantId: "ch-belando" },
      { id: "offer-1", feedMerchantId: "ch-acer" },
    ]);
  });

  it("rolls the old merchant catalogue back when publication fails", async () => {
    const host = transactionHost(
      [
        { id: "old-acer", feedMerchantId: "ch-acer" },
        { id: "foreign", feedMerchantId: "ch-belando" },
      ],
      { failCreate: true }
    );

    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: host.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
      })
    ).rejects.toThrow("injected offer write failure");

    expect(host.committedOffers()).toEqual([
      { id: "old-acer", feedMerchantId: "ch-acer" },
      { id: "foreign", feedMerchantId: "ch-belando" },
    ]);
  });

  it("allows first imports and non-material reductions in small catalogues", async () => {
    const firstImport = transactionHost([]);
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: firstImport.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
      })
    ).resolves.toMatchObject({ baseline: { products: 0, offers: 0 } });

    const smallCatalogue = transactionHost([], {
      baseline: { products: 2, offers: 2 },
    });
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: smallCatalogue.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
      })
    ).resolves.toMatchObject({ baseline: { products: 2, offers: 2 } });
  });

  it("rejects a material reduction under the merchant lock before any write", async () => {
    const host = transactionHost([], { baseline: { products: 8, offers: 8 } });

    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: host.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
      })
    ).rejects.toThrow(/committed products=8, offers=8.*incoming products=1, offers=1/);

    expect(host.operations()).toEqual({
      transactions: 1,
      productWrites: 0,
      offerDeletes: 0,
    });
  });

  it("requires a meaningful per-import reason for an intentional reduction", async () => {
    const invalid = transactionHost([], { baseline: { products: 8, offers: 8 } });
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: invalid.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
        reductionOverride: { reason: "planned" },
      })
    ).rejects.toThrow(/at least 15 characters/);
    expect(invalid.operations().transactions).toBe(0);

    const intentional = transactionHost([], { baseline: { products: 8, offers: 8 } });
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: intentional.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
        reductionOverride: {
          reason: "Merchant retired seven obsolete catalogue items.",
        },
      })
    ).resolves.toMatchObject({
      baseline: { products: 8, offers: 8 },
      reductionOverrideApplied: true,
    });
  });

  it("allows threshold tuning only in the stricter direction", async () => {
    const relaxed = transactionHost([]);
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: relaxed.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
        incompleteFeedGuard: { minRetainedRatio: 0.5, minAbsoluteDrop: 100 },
      })
    ).rejects.toThrow(/minRetainedRatio must be between 0.7 and 0.95/);
    expect(relaxed.operations().transactions).toBe(0);

    const stricter = transactionHost([], { baseline: { products: 4, offers: 4 } });
    await expect(
      replaceMerchantCatalogueAtomically({
        prisma: stricter.prisma,
        merchantId: "ch-acer",
        country: "CH",
        productRows: [product],
        offerRows: [offer],
        incompleteFeedGuard: { minRetainedRatio: 0.9, minAbsoluteDrop: 2 },
      })
    ).rejects.toThrow(/unusually incomplete catalogue/);
  });
});
