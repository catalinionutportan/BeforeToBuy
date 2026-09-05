import { Readable } from "node:stream";
import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type {
  AtomicCatalogImportInput,
  AtomicCatalogImportResult,
} from "@/lib/atomic-catalog-import";
import { sync2PerformantFeed, type Sync2PerformantOptions } from "./sync-feeds";

const FEED_A = "https://feeds.2performant.com/feed/atomic-a.csv";
const FEED_B = "https://feeds.2performant.com/feed/atomic-b.csv";
const HEADER = "product_id,title,price,aff_link,category,brand\n";

function csvRow(id: string, price: number, title = "Test vacuum"): string {
  return `${id},${title},${price},https://event.2performant.com/events/click?unique=${id},Aspiratoare,TestBrand\n`;
}

function successfulResult(input: AtomicCatalogImportInput): AtomicCatalogImportResult {
  return {
    products: input.productRows.length,
    offers: input.offerRows.length,
    baseline: { products: 0, offers: 0 },
    reductionOverrideApplied: false,
  };
}

function readClient(options: { foreignPrice?: number } = {}) {
  const productFindMany = vi.fn(async () => []);
  const offerFindMany = vi.fn(async () =>
    options.foreignPrice === undefined
      ? []
      : [{ productId: "prod-ro-rowenta-one", price: options.foreignPrice }]
  );
  const client = {
    product: { findMany: productFindMany },
    offer: { findMany: offerFindMany },
    $transaction: vi.fn(),
  } as unknown as Sync2PerformantOptions["prismaClient"];
  return { client: client!, productFindMany, offerFindMany };
}

describe("sync2PerformantFeed staging", () => {
  it("deduplicates identical slices and publishes exactly once after every slice parses", async () => {
    const reads = readClient({ foreignPrice: 80 });
    const publishCatalogue = vi.fn(async (input: AtomicCatalogImportInput) =>
      successfulResult(input)
    );
    const body = HEADER + csvRow("one", 100);

    await expect(
      sync2PerformantFeed(
        [FEED_A, FEED_B],
        "ro-rowenta",
        "Rowenta.ro",
        "RO",
        "RON",
        {
          prismaClient: reads.client,
          publishCatalogue,
          openFeedStream: async () => Readable.from([body]),
        }
      )
    ).resolves.toBe(1);

    expect(publishCatalogue).toHaveBeenCalledTimes(1);
    const published = publishCatalogue.mock.calls[0]![0];
    expect(published.offerRows).toHaveLength(1);
    expect(published.productRows).toHaveLength(1);
    expect(published.productRows[0]).toMatchObject({
      id: "prod-ro-rowenta-one",
      targetCountries: ["RO"],
      basePrice: 80,
    });
    expect(published.offerRows[0]).toMatchObject({
      id: "offer-ro-rowenta-one",
      productId: "prod-ro-rowenta-one",
      feedMerchantId: "ro-rowenta",
      price: 100,
    });
  });

  it("reuses an existing country GTIN identity instead of creating a parallel product", async () => {
    const productFindMany = vi.fn(async (args: { where?: { gtin?: unknown } }) =>
      args.where?.gtin
        ? [{ id: "existing-ro-gtin-product", gtin: "07612345678901" }]
        : []
    );
    const client = {
      product: { findMany: productFindMany },
      offer: { findMany: vi.fn(async () => []) },
      $transaction: vi.fn(),
    } as unknown as Sync2PerformantOptions["prismaClient"];
    const publishCatalogue = vi.fn(async (input: AtomicCatalogImportInput) =>
      successfulResult(input)
    );
    const body =
      "product_id,title,price,aff_link,category,brand,ean\n" +
      "gtin-one,Test vacuum,100,https://event.2performant.com/events/click?unique=gtin-one,Aspiratoare,TestBrand,7612345678901\n";

    await sync2PerformantFeed(
      FEED_A,
      "ro-rowenta",
      "Rowenta.ro",
      "RO",
      "RON",
      {
        prismaClient: client!,
        publishCatalogue,
        openFeedStream: async () => Readable.from([body]),
      }
    );

    const published = publishCatalogue.mock.calls[0]![0];
    expect(published.productRows[0]?.id).toBe("existing-ro-gtin-product");
    expect(published.offerRows[0]?.productId).toBe("existing-ro-gtin-product");
  });

  it("rejects conflicting duplicates before identity reads or publication", async () => {
    const reads = readClient();
    const publishCatalogue = vi.fn();
    const bodies = new Map([
      [FEED_A, HEADER + csvRow("one", 100)],
      [FEED_B, HEADER + csvRow("one", 101)],
    ]);

    await expect(
      sync2PerformantFeed(
        [FEED_A, FEED_B],
        "ro-rowenta",
        "Rowenta.ro",
        "RO",
        "RON",
        {
          prismaClient: reads.client,
          publishCatalogue,
          openFeedStream: async (url) => Readable.from([bodies.get(url)!]),
        }
      )
    ).rejects.toThrow(/Conflicting duplicate offer.*nothing was published/);

    expect(reads.productFindMany).not.toHaveBeenCalled();
    expect(reads.offerFindMany).not.toHaveBeenCalled();
    expect(publishCatalogue).not.toHaveBeenCalled();
  });

  it("leaves publication untouched when a later slice cannot be downloaded", async () => {
    const reads = readClient();
    const publishCatalogue = vi.fn();

    await expect(
      sync2PerformantFeed(
        [FEED_A, FEED_B],
        "ro-rowenta",
        "Rowenta.ro",
        "RO",
        "RON",
        {
          prismaClient: reads.client,
          publishCatalogue,
          openFeedStream: async (url) => {
            if (url === FEED_B) throw new Error("injected second-slice failure");
            return Readable.from([HEADER + csvRow("one", 100)]);
          },
        }
      )
    ).rejects.toThrow("injected second-slice failure");

    expect(reads.productFindMany).not.toHaveBeenCalled();
    expect(reads.offerFindMany).not.toHaveBeenCalled();
    expect(publishCatalogue).not.toHaveBeenCalled();
  });

  it("rejects more than 100,000 parsed rows instead of truncating the feed", async () => {
    const reads = readClient();
    const publishCatalogue = vi.fn();
    async function* oversizedFeed() {
      yield HEADER;
      for (let index = 0; index <= 100_000; index += 1) {
        yield `,,,,,\n`;
      }
    }

    await expect(
      sync2PerformantFeed(
        FEED_A,
        "ro-rowenta",
        "Rowenta.ro",
        "RO",
        "RON",
        {
          prismaClient: reads.client,
          publishCatalogue,
          openFeedStream: async () => Readable.from(oversizedFeed()),
        }
      )
    ).rejects.toThrow(/exceeds the 100,000 parsed-row staging limit/);

    expect(reads.productFindMany).not.toHaveBeenCalled();
    expect(publishCatalogue).not.toHaveBeenCalled();
  }, 15_000);

  it("passes a documented intentional-reduction override to the atomic guard", async () => {
    const reads = readClient();
    const publishCatalogue = vi.fn(async (input: AtomicCatalogImportInput) =>
      successfulResult(input)
    );
    const reductionOverride = {
      reason: "Merchant intentionally discontinued its previous product range.",
    };

    await sync2PerformantFeed(
      FEED_A,
      "ro-rowenta",
      "Rowenta.ro",
      "RO",
      "RON",
      {
        prismaClient: reads.client,
        publishCatalogue,
        reductionOverride,
        openFeedStream: async () => Readable.from([HEADER + csvRow("one", 100)]),
      }
    );

    expect(publishCatalogue.mock.calls[0]![0].reductionOverride).toEqual(reductionOverride);
  });
});

const integrationUrl = process.env.SYNC_FEEDS_INTEGRATION_DATABASE_URL;
const describeIntegration = integrationUrl ? describe : describe.skip;

describeIntegration("sync2PerformantFeed isolated PostgreSQL", () => {
  let client: PrismaClient;
  const merchantId = "atomic-audit-ro-sync";
  const oldProductId = "atomic-audit-ro-sync-old";
  const oldOfferId = "atomic-audit-ro-sync-old-offer";

  beforeAll(async () => {
    const target = new URL(integrationUrl!);
    if (target.protocol !== "postgresql:" || !["127.0.0.1", "localhost"].includes(target.hostname) || target.port !== "55439") {
      throw new Error("Refusing fixture writes outside the isolated localhost:55439 PostgreSQL database.");
    }
    const { PrismaClient: RuntimePrismaClient } = await import("@prisma/client");
    client = new RuntimePrismaClient({
      datasources: { db: { url: integrationUrl! } },
    });
    await client.offer.deleteMany({ where: { feedMerchantId: merchantId } });
    await client.product.deleteMany({ where: { id: { startsWith: "atomic-audit-ro-sync" } } });
    await client.product.create({
      data: {
        id: oldProductId,
        title: "Previously committed product",
        category: "cleaning-vacuums",
        targetCountries: ["RO"],
        basePrice: 50,
      },
    });
    await client.offer.create({
      data: {
        id: oldOfferId,
        productId: oldProductId,
        storeName: "Atomic audit",
        price: 50,
        currency: "RON",
        purchaseUrl: "https://event.2performant.com/events/click?unique=old",
        source: "production-live",
        feedMerchantId: merchantId,
        merchantProductId: "old",
        fetchedAt: "2026-09-05T00:00:00.000Z",
      },
    });
  });

  afterAll(async () => {
    if (!client) return;
    await client.offer.deleteMany({ where: { feedMerchantId: merchantId } });
    await client.product.deleteMany({
      where: {
        OR: [
          { id: { startsWith: "atomic-audit-ro-sync" } },
          { id: { startsWith: `prod-${merchantId}-` } },
        ],
      },
    });
    await client.$disconnect();
  });

  it("keeps the previous commit on a later-slice failure, then replaces it atomically", async () => {
    const options: Sync2PerformantOptions = {
      prismaClient: client!,
      openFeedStream: async (url) => {
        if (url === FEED_B) throw new Error("injected integration slice failure");
        return Readable.from([HEADER + csvRow("one", 100)]);
      },
    };

    await expect(
      sync2PerformantFeed(
        [FEED_A, FEED_B],
        merchantId,
        "Atomic audit",
        "RO",
        "RON",
        options
      )
    ).rejects.toThrow("injected integration slice failure");
    expect(await client!.offer.findUnique({ where: { id: oldOfferId } })).not.toBeNull();

    options.openFeedStream = async (url) => {
      const prefix = url === FEED_A ? "a" : "b";
      return Readable.from([
        HEADER + [1, 2, 3, 4].map((number) => csvRow(`${prefix}${number}`, 100 + number)).join(""),
      ]);
    };
    await expect(
      sync2PerformantFeed(
        [FEED_A, FEED_B],
        merchantId,
        "Atomic audit",
        "RO",
        "RON",
        options
      )
    ).resolves.toBe(8);

    expect(await client!.offer.findUnique({ where: { id: oldOfferId } })).toBeNull();
    expect(await client!.offer.count({ where: { feedMerchantId: merchantId } })).toBe(8);

    options.openFeedStream = async () => Readable.from([HEADER + csvRow("only-one", 90)]);
    await expect(
      sync2PerformantFeed(
        FEED_A,
        merchantId,
        "Atomic audit",
        "RO",
        "RON",
        options
      )
    ).rejects.toThrow(/Refusing unusually incomplete catalogue/);
    expect(await client!.offer.count({ where: { feedMerchantId: merchantId } })).toBe(8);
  });
});
