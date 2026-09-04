/**
 * Import Gigasport CH (AWIN feed 51705 / DE Feed) into Supabase.
 *
 * Needs AWIN_API_KEY (or AWIN_FEED_URL_CH_GIGASPORT) in .env.local.
 * Catalogue is large (~29k size-variant rows). CH markets are DB-first.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-ch-gigasport.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";
import { replaceMerchantCatalogueAtomically } from "../lib/atomic-catalog-import";

const MERCHANT_ID = "ch-gigasport";
const COUNTRY = "CH";
const MIN_PRODUCTS = 50;
const CHUNK = 500;

/** Drop nulls / unpaired surrogates that break Prisma/Postgres JSON encoding. */
function sanitizeText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

async function main() {
  console.log("Importing Gigasport CH into Supabase...");
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
      storeName: sanitizeText(o.storeName || "Gigasport CH"),
      price: o.price,
      originalPrice: o.originalPrice ?? null,
      discountPercentage: o.discountPercentage ?? null,
      currency: o.currency || "CHF",
      inStock: o.inStock ?? true,
      deliveryTime: o.deliveryTime ?? null,
      deliveryCost: o.deliveryCost ?? null,
      totalPrice: o.totalPrice ?? null,
      purchaseUrl: o.purchaseUrl,
      affiliateNetwork: o.affiliateNetwork || "AWIN Switzerland",
      source: o.source || "production-live",
      feedMerchantId: o.feedMerchantId || MERCHANT_ID,
      merchantProductId: o.merchantProductId ?? null,
      fetchedAt: o.fetchedAt || fetchedAt,
    }))
  );

  await replaceMerchantCatalogueAtomically({
    prisma,
    merchantId: MERCHANT_ID,
    country: COUNTRY,
    productRows,
    offerRows,
    chunkSize: CHUNK,
  });

  const [pc, oc] = await Promise.all([
    prisma.product.count({
      where: { targetCountries: { has: COUNTRY }, offers: { some: { inStock: true } } },
    }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID, inStock: true } }),
  ]);
  console.log(`Done. CH visible products=${pc}, Gigasport offers=${oc}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
