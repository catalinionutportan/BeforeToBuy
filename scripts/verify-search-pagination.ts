/** Synthetic fixtures only, restricted to the existing isolated local PostgreSQL port. */
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db";
import { countInStockProductsForCountry, getProductsFromDb } from "../src/lib/db-service";
import { setCachedBrowseMeta } from "../src/lib/catalog-browse-cache";

const MARKETS = ["CH", "DE", "GB", "US"];
const NEEDLE = "auditneedle20260905";
const fixtureIds = MARKETS.flatMap((country) => Array.from({ length: 5 }, (_, i) => `search-audit-${country}-${i}`));
const rimId = "search-audit-CH-rim";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (url.protocol !== "postgresql:" || !["localhost", "127.0.0.1"].includes(url.hostname) || url.port !== "55439") {
    throw new Error("Fixture writes require the isolated localhost:55439 database");
  }
  const cleanup = async () => {
    await prisma.offer.deleteMany({ where: { id: { in: [...fixtureIds.map((id) => `${id}-offer`), `${rimId}-reifen`, `${rimId}-other`] } } });
    await prisma.product.deleteMany({ where: { id: { in: [...fixtureIds, rimId] } } });
  };
  try {
    await cleanup();
    for (const country of MARKETS) {
      const ids = fixtureIds.filter((id) => id.startsWith(`search-audit-${country}-`));
      await prisma.product.createMany({ data: ids.map((id, i) => ({
        id, title: i === 0 || i === 4 ? NEEDLE : `Different product ${i}`,
        description: i === 1 ? NEEDLE : null, brand: i === 2 ? NEEDLE : "SharedBrand",
        gtin: i === 3 ? NEEDLE : i === 0 ? "1234567890123" : null,
        category: "notebooks-laptops", targetCountries: [country], basePrice: 100,
      })) });
      await prisma.offer.createMany({ data: ids.map((id, i) => ({
        id: `${id}-offer`, productId: id, storeName: "Fixture Store", price: [100, 110, 150, 80, 100][i]!,
        currency: "CHF", totalPrice: i === 0 ? null : [100, 120, 150, 80, 100][i]!,
        deliveryCost: i === 0 ? 50 : i === 3 ? null : 0,
        inStock: i !== 4, purchaseUrl: `https://fixture.example/${id}`,
        feedMerchantId: "search-audit", fetchedAt: new Date().toISOString(),
      })) });
      await setCachedBrowseMeta(country, { countryProductCount: 100, categoryCounts: {}, leafCounts: {}, categoryCovers: {}, brandOptions: [] });
      const first = await getProductsFromDb(country, NEEDLE, undefined, 2, 0);
      const second = await getProductsFromDb(country, NEEDLE, undefined, 2, 2);
      const beyond = await getProductsFromDb(country, NEEDLE, undefined, 2, 10);
      assert.equal(first.totalMatched, 4);
      assert.equal(second.totalMatched, 4);
      assert.equal(beyond.totalMatched, 4);
      assert.deepEqual([...first.products, ...second.products].map((p) => p.id), ids.slice(0, 4));
      assert.equal(beyond.products.length, 0);
      const filtered = await getProductsFromDb(country, NEEDLE, "notebooks-laptops", 24, 0, undefined, {
        domain: "fixture.example", brand: "SharedBrand", hasGtinOnly: true, minTotalPrice: 90, maxTotalPrice: 120,
      });
      assert.equal(filtered.totalMatched, 1);
      assert.deepEqual(filtered.products.map((p) => p.id), [ids[0]]);
      const free = await getProductsFromDb(country, NEEDLE, undefined, 24, 0, undefined, { freeDeliveryOnly: true });
      assert.equal(free.totalMatched, 2);
      assert.deepEqual(free.products.map((p) => p.id), [ids[1], ids[2]]);
      const empty = await getProductsFromDb(country, "unknownauditterm", undefined, 24, 0);
      assert.equal(empty.totalMatched, 0);
      assert.equal(empty.products.length, 0);
      const expectedCountryCount = await prisma.product.count({ where: {
        targetCountries: { has: country }, offers: { some: { inStock: true } },
      } });
      assert.equal(await countInStockProductsForCountry(country), expectedCountryCount);
      if (country === "DE") {
        await setCachedBrowseMeta(country, { countryProductCount: expectedCountryCount, categoryCounts: {}, leafCounts: {}, categoryCovers: {}, brandOptions: [] });
        const expectedPage = await prisma.product.findMany({
          where: { targetCountries: { has: country }, offers: { some: { inStock: true } } },
          orderBy: { id: "asc" }, skip: 48, take: 48, select: { id: true },
        });
        const actualPage = await getProductsFromDb(country, undefined, undefined, 48, 48);
        assert.deepEqual(actualPage.products.map((product) => product.id), expectedPage.map((product) => product.id));
        assert.equal(actualPage.totalMatched, expectedCountryCount);
        console.log(JSON.stringify({ country, naturalOrderPageTwo: "pass" }));
      }
      console.log(JSON.stringify({ country, exactCountAndFourSearchFields: true, pagination: "pass", combinedFilters: "pass", unknownQuery: "pass" }));
    }
    await prisma.product.create({ data: {
      id: rimId, title: `${NEEDLE} Ludwig ET35`, category: "auto-tires-wheels", targetCountries: ["CH"],
    } });
    await prisma.offer.createMany({ data: [false, true].map((inStock, index) => ({
      id: `${rimId}-${index === 0 ? "reifen" : "other"}`, productId: rimId,
      storeName: "Fixture Store", price: 100, currency: "CHF", inStock,
      purchaseUrl: "https://fixture.example/rim", fetchedAt: new Date().toISOString(),
      feedMerchantId: index === 0 ? "ch-reifencom" : "search-audit",
    })) });
    const blockedRim = await getProductsFromDb("CH", NEEDLE, "auto-complete-wheels", 24, 0);
    assert.equal(blockedRim.totalMatched, 0);
    assert.equal(blockedRim.products.length, 0);
    await prisma.offer.update({ where: { id: `${rimId}-reifen` }, data: { inStock: true } });
    const allowedRim = await getProductsFromDb("CH", NEEDLE, "auto-complete-wheels", 24, 0);
    assert.equal(allowedRim.totalMatched, 1);
    assert.deepEqual(allowedRim.products.map((product) => product.id), [rimId]);
    console.log(JSON.stringify({ country: "CH", inStockReifenClassification: "pass" }));
  } finally { await cleanup(); await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Isolated search verification failed"); process.exitCode = 1; });
