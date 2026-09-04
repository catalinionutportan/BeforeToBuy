import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { replaceMerchantCatalogueAtomically } from "../src/lib/atomic-catalog-import";

const FIXTURE_PREFIX = "atomic-audit-";
const MERCHANT_ID = `${FIXTURE_PREFIX}merchant`;
const FOREIGN_MERCHANT_ID = `${FIXTURE_PREFIX}foreign`;
const PRODUCT_ID = `${FIXTURE_PREFIX}shared-product`;
const FOREIGN_OFFER_ID = `${FIXTURE_PREFIX}foreign-offer`;
const OLD_OFFER_ID = `${FIXTURE_PREFIX}old-offer`;
const NEW_OFFER_ID = `${FIXTURE_PREFIX}new-offer`;
const FIXTURE_OFFER_IDS = [FOREIGN_OFFER_ID, OLD_OFFER_ID, NEW_OFFER_ID];

function isolatedDatabaseUrl(): string {
  const raw = process.env.ATOMIC_IMPORT_TEST_DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Set ATOMIC_IMPORT_TEST_DATABASE_URL to the isolated PostgreSQL fixture database."
    );
  }

  const url = new URL(raw);
  const localHost = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "postgresql:" || !localHost || url.port !== "55439") {
    throw new Error(
      "Refusing database access: expected postgresql://localhost-or-127.0.0.1:55439 only."
    );
  }
  return raw;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    datasources: { db: { url: isolatedDatabaseUrl() } },
  });

  const cleanup = async () => {
    await prisma.offer.deleteMany({ where: { id: { in: FIXTURE_OFFER_IDS } } });
    await prisma.product.deleteMany({ where: { id: PRODUCT_ID } });
  };

  try {
    await cleanup();
    await prisma.product.create({
      data: {
        id: PRODUCT_ID,
        title: "Old shared product",
        category: "notebooks-laptops",
        targetCountries: ["DE"],
      },
    });
    await prisma.offer.createMany({
      data: [
        {
          id: FOREIGN_OFFER_ID,
          productId: PRODUCT_ID,
          storeName: "Foreign fixture",
          price: 10,
          currency: "EUR",
          purchaseUrl: "https://foreign.example/item",
          source: "atomic-audit",
          feedMerchantId: FOREIGN_MERCHANT_ID,
          fetchedAt: "2026-09-05T00:00:00.000Z",
        },
        {
          id: OLD_OFFER_ID,
          productId: PRODUCT_ID,
          storeName: "Old fixture",
          price: 20,
          currency: "CHF",
          purchaseUrl: "https://old.example/item",
          source: "atomic-audit",
          feedMerchantId: MERCHANT_ID,
          fetchedAt: "2026-09-05T00:00:00.000Z",
        },
      ],
    });

    const productRows = [
      {
        id: PRODUCT_ID,
        title: "New shared product",
        category: "notebooks-laptops",
        targetCountries: ["CH"],
        catalogSource: "atomic-audit",
        basePrice: 30,
      },
    ];
    const newOffer = {
      id: NEW_OFFER_ID,
      productId: PRODUCT_ID,
      storeName: "New fixture",
      price: 30,
      currency: "CHF",
      inStock: true,
      purchaseUrl: "https://new.example/item",
      source: "atomic-audit",
      feedMerchantId: MERCHANT_ID,
      fetchedAt: "2026-09-05T01:00:00.000Z",
    };

    await replaceMerchantCatalogueAtomically({
      prisma,
      merchantId: MERCHANT_ID,
      country: "CH",
      productRows,
      offerRows: [newOffer],
      chunkSize: 1,
    });

    const afterSuccess = await prisma.product.findUniqueOrThrow({
      where: { id: PRODUCT_ID },
      include: { offers: { orderBy: { id: "asc" } } },
    });
    assert.deepEqual(afterSuccess.targetCountries, ["CH", "DE"]);
    assert.deepEqual(
      afterSuccess.offers.map((offer) => offer.id),
      [FOREIGN_OFFER_ID, NEW_OFFER_ID].sort()
    );

    // The foreign ID collision is skipped by createMany, so final count
    // verification fails after the merchant deletion and forces a rollback.
    await assert.rejects(
      () =>
        replaceMerchantCatalogueAtomically({
          prisma,
          merchantId: MERCHANT_ID,
          country: "CH",
          productRows: [{ ...productRows[0], title: "Must roll back" }],
          offerRows: [{ ...newOffer, id: FOREIGN_OFFER_ID }],
          chunkSize: 1,
        }),
      /verification failed/
    );

    const afterRollback = await prisma.product.findUniqueOrThrow({
      where: { id: PRODUCT_ID },
      include: { offers: { orderBy: { id: "asc" } } },
    });
    assert.equal(afterRollback.title, "New shared product");
    assert.deepEqual(afterRollback.targetCountries, ["CH", "DE"]);
    assert.deepEqual(
      afterRollback.offers.map((offer) => offer.id),
      [FOREIGN_OFFER_ID, NEW_OFFER_ID].sort()
    );

    console.log(
      JSON.stringify({
        success: true,
        targetCountriesUnion: afterRollback.targetCountries,
        preservedOfferIds: afterRollback.offers.map((offer) => offer.id),
        rollbackPreservedTitle: afterRollback.title,
      })
    );
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
