import assert from "node:assert/strict";
import { Prisma, PrismaClient } from "@prisma/client";
import { replaceMerchantCatalogueAtomically } from "../src/lib/atomic-catalog-import";

const FIXTURE_PREFIX = "atomic-audit-";
const MERCHANT_ID = `${FIXTURE_PREFIX}merchant`;
const FOREIGN_MERCHANT_ID = `${FIXTURE_PREFIX}foreign`;
const PRODUCT_ID = `${FIXTURE_PREFIX}shared-product`;
const FOREIGN_OFFER_ID = `${FIXTURE_PREFIX}foreign-offer`;
const OLD_OFFER_ID = `${FIXTURE_PREFIX}old-offer`;
const NEW_OFFER_ID = `${FIXTURE_PREFIX}new-offer`;
const GUARD_MERCHANT_ID = `${FIXTURE_PREFIX}guard-merchant`;
const GUARD_PRODUCT_IDS = Array.from(
  { length: 8 },
  (_, index) => `${FIXTURE_PREFIX}guard-product-${index}`
);
const GUARD_OLD_OFFER_IDS = Array.from(
  { length: 8 },
  (_, index) => `${FIXTURE_PREFIX}guard-old-offer-${index}`
);
const GUARD_NEW_OFFER_IDS = Array.from(
  { length: 2 },
  (_, index) => `${FIXTURE_PREFIX}guard-new-offer-${index}`
);
const CONCURRENT_MERCHANT_ID = `${FIXTURE_PREFIX}concurrent-merchant`;
const CONCURRENT_PRODUCT_IDS = Array.from(
  { length: 8 },
  (_, index) => `${FIXTURE_PREFIX}concurrent-product-${index}`
);
const CONCURRENT_OFFER_IDS = Array.from(
  { length: 8 },
  (_, index) => `${FIXTURE_PREFIX}concurrent-offer-${index}`
);
const FIXTURE_PRODUCT_IDS = [PRODUCT_ID, ...GUARD_PRODUCT_IDS, ...CONCURRENT_PRODUCT_IDS];
const FIXTURE_OFFER_IDS = [
  FOREIGN_OFFER_ID,
  OLD_OFFER_ID,
  NEW_OFFER_ID,
  ...GUARD_OLD_OFFER_IDS,
  ...GUARD_NEW_OFFER_IDS,
  ...CONCURRENT_OFFER_IDS,
];

function fixtureProducts(ids: string[]) {
  return ids.map((id) => ({
    id,
    title: `Fixture ${id}`,
    category: "notebooks-laptops",
    targetCountries: ["CH"],
    catalogSource: "atomic-audit",
    basePrice: 30,
  }));
}

function fixtureOffers(ids: string[], productIds: string[], merchantId: string) {
  return ids.map((id, index) => ({
    id,
    productId: productIds[index]!,
    storeName: "Atomic audit fixture",
    price: 30 + index,
    currency: "CHF",
    inStock: true,
    purchaseUrl: `https://fixture.example/${id}`,
    source: "atomic-audit",
    feedMerchantId: merchantId,
    fetchedAt: "2026-09-05T01:00:00.000Z",
  }));
}

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
    await prisma.product.deleteMany({ where: { id: { in: FIXTURE_PRODUCT_IDS } } });
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

    const revisions = () => prisma.$queryRaw<Array<{ country: string; revision: string }>>(Prisma.sql`
      SELECT country, revision FROM "CatalogRevision" WHERE country IN ('CH', 'DE') ORDER BY country
    `);
    const revisionsBefore = await revisions();

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
    const revisionsAfterSuccess = await revisions();
    assert.deepEqual(revisionsAfterSuccess.map((row) => row.country), ["CH", "DE"]);
    for (const row of revisionsAfterSuccess) {
      assert.notEqual(row.revision, revisionsBefore.find((old) => old.country === row.country)?.revision);
    }

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
    assert.deepEqual(await revisions(), revisionsAfterSuccess, "Failed publication must not invalidate a valid catalogue");
    assert.deepEqual(afterRollback.targetCountries, ["CH", "DE"]);
    assert.deepEqual(
      afterRollback.offers.map((offer) => offer.id),
      [FOREIGN_OFFER_ID, NEW_OFFER_ID].sort()
    );

    const guardProducts = fixtureProducts(GUARD_PRODUCT_IDS);
    const guardOldOffers = fixtureOffers(
      GUARD_OLD_OFFER_IDS,
      GUARD_PRODUCT_IDS,
      GUARD_MERCHANT_ID
    );
    const guardReducedProducts = guardProducts.slice(0, 2);
    const guardReducedOffers = fixtureOffers(
      GUARD_NEW_OFFER_IDS,
      GUARD_PRODUCT_IDS.slice(0, 2),
      GUARD_MERCHANT_ID
    );
    await prisma.product.createMany({ data: guardProducts });
    await prisma.offer.createMany({ data: guardOldOffers });

    await assert.rejects(
      () =>
        replaceMerchantCatalogueAtomically({
          prisma,
          merchantId: GUARD_MERCHANT_ID,
          country: "CH",
          productRows: guardReducedProducts,
          offerRows: guardReducedOffers,
        }),
      /unusually incomplete catalogue/
    );
    assert.equal(
      await prisma.offer.count({ where: { feedMerchantId: GUARD_MERCHANT_ID } }),
      8
    );

    const intentionalReduction = await replaceMerchantCatalogueAtomically({
      prisma,
      merchantId: GUARD_MERCHANT_ID,
      country: "CH",
      productRows: guardReducedProducts,
      offerRows: guardReducedOffers,
      reductionOverride: {
        reason: "Merchant intentionally retired six obsolete fixture items.",
      },
    });
    assert.deepEqual(intentionalReduction.baseline, { products: 8, offers: 8 });
    assert.equal(intentionalReduction.reductionOverrideApplied, true);
    assert.equal(
      await prisma.offer.count({ where: { feedMerchantId: GUARD_MERCHANT_ID } }),
      2
    );

    const concurrentProducts = fixtureProducts(CONCURRENT_PRODUCT_IDS);
    const concurrentOffers = fixtureOffers(
      CONCURRENT_OFFER_IDS,
      CONCURRENT_PRODUCT_IDS,
      CONCURRENT_MERCHANT_ID
    );
    await prisma.product.createMany({ data: concurrentProducts.slice(0, 2) });
    await prisma.offer.createMany({ data: concurrentOffers.slice(0, 2) });

    let releaseHolder = () => {};
    let markHolderReady = () => {};
    const holderRelease = new Promise<void>((resolve) => {
      releaseHolder = resolve;
    });
    const holderReady = new Promise<void>((resolve) => {
      markHolderReady = resolve;
    });
    const lockHolder = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('btb-catalog-import'), hashtext(${CONCURRENT_MERCHANT_ID})) IS NULL AS "locked"`
        );
        await tx.product.createMany({ data: concurrentProducts.slice(2) });
        await tx.offer.createMany({ data: concurrentOffers.slice(2) });
        markHolderReady();
        await holderRelease;
      },
      { timeout: 10_000 }
    );
    await holderReady;

    const concurrentOutcome = replaceMerchantCatalogueAtomically({
      prisma,
      merchantId: CONCURRENT_MERCHANT_ID,
      country: "CH",
      productRows: concurrentProducts.slice(0, 2),
      offerRows: concurrentOffers.slice(0, 2),
      lockTimeoutMs: 5_000,
    }).then(
      () => null,
      (error: unknown) => error
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    releaseHolder();
    await lockHolder;
    const concurrentError = await concurrentOutcome;
    assert(concurrentError instanceof Error);
    assert.match(concurrentError.message, /committed products=8, offers=8/);
    assert.equal(
      await prisma.offer.count({ where: { feedMerchantId: CONCURRENT_MERCHANT_ID } }),
      8
    );

    console.log(
      JSON.stringify({
        success: true,
        targetCountriesUnion: afterRollback.targetCountries,
        preservedOfferIds: afterRollback.offers.map((offer) => offer.id),
        rollbackPreservedTitle: afterRollback.title,
        incompleteFeedRejected: true,
        intentionalReduction: {
          baseline: intentionalReduction.baseline,
          products: intentionalReduction.products,
          offers: intentionalReduction.offers,
        },
        concurrentBaselineReadAfterLock: true,
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
