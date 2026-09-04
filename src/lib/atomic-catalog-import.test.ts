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
  options: { failCreate?: boolean } = {}
): {
  prisma: AtomicCatalogImportInput["prisma"];
  committedOffers: () => StoredOffer[];
} {
  let committed = initialOffers.map((row) => ({ ...row }));

  const prisma = {
    async $transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T> {
      let pending = committed.map((row) => ({ ...row }));
      const tx = {
        $queryRaw: async () => [],
        $executeRaw: async () => 1,
        offer: {
          deleteMany: async ({ where }: { where: { feedMerchantId: string } }) => {
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

  return { prisma, committedOffers: () => committed };
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
    ).resolves.toEqual({ products: 1, offers: 1 });

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
});
