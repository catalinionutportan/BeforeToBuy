/**
 * Import Geepas UK (AWIN feed 92363) into Supabase.
 *
 * Needs AWIN_API_KEY (or AWIN_FEED_URL_GB_GEEPAS) in .env.local.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-gb-geepas.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";

const MERCHANT_ID = "gb-geepas";
const COUNTRY = "GB";
const MIN_PRODUCTS = 50;
const CHUNK = 100;

/** Drop nulls / unpaired surrogates that break Prisma/Postgres JSON encoding. */
function sanitizeText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

async function main() {
  console.log("Importing Geepas UK into Supabase...");
  const { products, source } = await loadMerchantFeedForImport(MERCHANT_ID);
  if (source !== "remote" || products.length < MIN_PRODUCTS) {
    throw new Error(
      `Refusing import: source=${source}, count=${products.length} (need remote >= ${MIN_PRODUCTS}).`
    );
  }
  console.log(`Feed OK: ${products.length} products.`);

  const fetchedAt = new Date().toISOString();
  const productRows = products.map((p) => ({
    id: p.id,
    title: sanitizeText(p.title),
    description: sanitizeText((p.description || "").slice(0, 1000)),
    gtin: p.gtin || null,
    brand: p.brand ? sanitizeText(p.brand) : null,
    category: p.category,
    image: p.image || null,
    catalogSource: p.catalogSource || "production-live",
    targetCountries: p.targetCountries?.length ? p.targetCountries : [COUNTRY],
    basePrice: p.basePrice ?? p.offers[0]?.price ?? null,
  }));

  const offerRows = products.flatMap((p) =>
    p.offers.map((o) => ({
      id: o.id,
      productId: p.id,
      storeName: sanitizeText(o.storeName),
      price: o.price,
      originalPrice: o.originalPrice ?? null,
      discountPercentage: o.discountPercentage ?? null,
      currency: o.currency,
      inStock: o.inStock ?? true,
      deliveryTime: o.deliveryTime ?? null,
      deliveryCost: o.deliveryCost ?? null,
      totalPrice: o.totalPrice ?? null,
      purchaseUrl: o.purchaseUrl,
      affiliateNetwork: o.affiliateNetwork ?? null,
      source: o.source || "production-live",
      feedMerchantId: o.feedMerchantId || MERCHANT_ID,
      merchantProductId: o.merchantProductId ?? null,
      fetchedAt: o.fetchedAt || fetchedAt,
    }))
  );

  await prisma.offer.deleteMany({ where: { feedMerchantId: MERCHANT_ID } });
  await prisma.product.deleteMany({
    where: {
      id: { in: productRows.map((r) => r.id) },
      targetCountries: { has: COUNTRY },
    },
  });

  for (let i = 0; i < productRows.length; i += CHUNK) {
    await prisma.product.createMany({
      data: productRows.slice(i, i + CHUNK),
      skipDuplicates: true,
    });
  }
  for (let i = 0; i < offerRows.length; i += CHUNK) {
    await prisma.offer.createMany({
      data: offerRows.slice(i, i + CHUNK),
      skipDuplicates: true,
    });
  }

  const [pc, oc, mapped] = await Promise.all([
    prisma.product.count({
      where: { targetCountries: { has: COUNTRY }, offers: { some: { inStock: true } } },
    }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID, inStock: true } }),
    prisma.product.groupBy({
      by: ["category"],
      where: { offers: { some: { feedMerchantId: MERCHANT_ID } } },
      _count: true,
    }),
  ]);
  console.log(`Done. GB visible products=${pc}, Geepas offers=${oc}`);
  for (const row of mapped.sort((a, b) => b._count - a._count)) {
    console.log(`  ${row._count} ${row.category}`);
  }
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
