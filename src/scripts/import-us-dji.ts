/**
 * Import DJI US & CA (AWIN feed 116475 / English Default) into Supabase.
 *
 * Needs AWIN_API_KEY (or AWIN_FEED_URL_US_DJI) in .env.local.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-us-dji.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";
import { replaceMerchantCatalogueAtomically } from "../lib/atomic-catalog-import";

const MERCHANT_ID = "us-dji";
const COUNTRY = "US";
const MIN_PRODUCTS = 50;

async function main() {
  console.log("Importing DJI US into Supabase...");
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
      fetchedAt: typeof o.fetchedAt === "string" ? o.fetchedAt : fetchedAt,
    }))
  );

  await replaceMerchantCatalogueAtomically({
    prisma,
    merchantId: MERCHANT_ID,
    country: COUNTRY,
    productRows,
    offerRows,
  });

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
  console.log(`Done. US visible products=${pc}, DJI offers=${oc}`);
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
