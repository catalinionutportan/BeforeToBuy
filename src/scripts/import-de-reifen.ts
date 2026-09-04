/**
 * Import Reifen.de (AWIN Feed 93980) into Supabase for Germany (DE).
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-de-reifen.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";
import {
  classifyDeReifenProducts,
  hasUsableDeReifenImage,
} from "../lib/de-reifen-category";

const MERCHANT_ID = "de-reifen";
const COUNTRY = "DE";
const MIN_PRODUCTS = 10;

async function main() {
  console.log("Importing Reifen.de (Germany) into Supabase...");
  const { products: parsedProducts, source } = await loadMerchantFeedForImport(MERCHANT_ID);
  if (source !== "remote" || parsedProducts.length < MIN_PRODUCTS) {
    throw new Error(
      `Refusing import: source=${source}, count=${parsedProducts.length} (need remote >= ${MIN_PRODUCTS}).`
    );
  }
  const classifiedProducts = classifyDeReifenProducts(parsedProducts);
  const products = classifiedProducts.filter(hasUsableDeReifenImage);
  console.log(
    `Feed download OK: ${products.length} products with real images ` +
      `(${classifiedProducts.length - products.length} without images skipped).`
  );

  const fetchedAt = new Date().toISOString();
  const productRows = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: (p.description || "").slice(0, 1000),
    gtin: p.gtin || null,
    brand: p.brand || null,
    category: p.category || "auto-tires-wheels",
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
      storeName: o.storeName || "Reifen.de",
      price: o.price,
      originalPrice: o.originalPrice ?? null,
      discountPercentage: o.discountPercentage ?? null,
      currency: o.currency || "EUR",
      inStock: o.inStock ?? true,
      deliveryTime: o.deliveryTime ?? null,
      deliveryCost: o.deliveryCost ?? null,
      totalPrice: o.totalPrice ?? null,
      purchaseUrl: o.purchaseUrl,
      affiliateNetwork: o.affiliateNetwork || "AWIN Germany",
      source: o.source || "production-live",
      feedMerchantId: o.feedMerchantId || MERCHANT_ID,
      merchantProductId: o.merchantProductId ?? null,
      fetchedAt: typeof o.fetchedAt === "string" ? o.fetchedAt : fetchedAt,
    }))
  );

  console.log(`Writing ${productRows.length} products, ${offerRows.length} offers into Supabase...`);

  await prisma.offer.deleteMany({ where: { feedMerchantId: MERCHANT_ID } });

  const CHUNK = 500;
  const productIds = productRows.map((r) => r.id);
  for (let i = 0; i < productIds.length; i += CHUNK) {
    await prisma.product.deleteMany({
      where: {
        id: { in: productIds.slice(i, i + CHUNK) },
        targetCountries: { has: COUNTRY },
      },
    });
  }

  for (let i = 0; i < productRows.length; i += CHUNK) {
    await prisma.product.createMany({ data: productRows.slice(i, i + CHUNK), skipDuplicates: true });
    console.log(`  Products written: ${Math.min(i + CHUNK, productRows.length)} / ${productRows.length}`);
  }
  for (let i = 0; i < offerRows.length; i += CHUNK) {
    await prisma.offer.createMany({ data: offerRows.slice(i, i + CHUNK), skipDuplicates: true });
    console.log(`  Offers written: ${Math.min(i + CHUNK, offerRows.length)} / ${offerRows.length}`);
  }

  const [pc, oc] = await Promise.all([
    prisma.product.count({ where: { targetCountries: { has: COUNTRY } } }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID } }),
  ]);
  console.log(`Done! DE products in DB=${pc}, Reifen.de offers=${oc}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Import failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
