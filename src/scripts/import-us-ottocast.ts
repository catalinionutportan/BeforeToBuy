/**
 * Import Ottocast US (AWIN feed 109551) into Supabase.
 *
 * Needs AWIN_API_KEY (or AWIN_FEED_URL_US_OTTOCAST) in .env.local.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-us-ottocast.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";

const MERCHANT_ID = "us-ottocast";
const COUNTRY = "US";
const MIN_PRODUCTS = 5;

async function main() {
  console.log("Importing Ottocast US into Supabase...");
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
    title: p.title,
    description: (p.description || "").slice(0, 1000),
    gtin: p.gtin || null,
    brand: p.brand || null,
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
      storeName: o.storeName,
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
  await prisma.product.deleteMany({ where: { id: { in: productRows.map((r) => r.id) } } });

  await prisma.product.createMany({ data: productRows, skipDuplicates: true });
  await prisma.offer.createMany({ data: offerRows, skipDuplicates: true });

  const [pc, oc, mapped] = await Promise.all([
    prisma.product.count({ where: { targetCountries: { has: COUNTRY }, offers: { some: { inStock: true } } } }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID, inStock: true } }),
    prisma.product.groupBy({
      by: ["category"],
      where: { offers: { some: { feedMerchantId: MERCHANT_ID } } },
      _count: true,
    }),
  ]);
  console.log(`Done. US visible products=${pc}, Ottocast offers=${oc}`);
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
