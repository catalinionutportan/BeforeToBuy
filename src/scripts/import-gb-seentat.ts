/**
 * One-off import of the live Seentat UK (AWIN) catalogue into Supabase.
 *
 * Sources the products from the production API (which serves the warmed AWIN
 * feed from Redis), so product ids, categories and affiliate deep links match
 * exactly what the site already renders. Idempotent: re-running replaces the
 * gb-seentat rows.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-gb-seentat.ts
 */
import { prisma } from "../lib/db";

const API_BASE = process.env.IMPORT_SOURCE_BASE || "https://www.beforetobuy.com";
const PAGE_SIZE = 200;
const MERCHANT_ID = "gb-seentat";

type ApiOffer = {
  id: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  inStock: boolean;
  deliveryTime?: string;
  deliveryCost?: number;
  totalPrice?: number;
  purchaseUrl: string;
  affiliateNetwork?: string;
  source: string;
  feedMerchantId?: string;
  merchantProductId?: string;
  fetchedAt?: string;
};

type ApiProduct = {
  id: string;
  title: string;
  description?: string;
  gtin?: string;
  brand?: string;
  category: string;
  image?: string;
  catalogSource?: string;
  targetCountries?: string[];
  basePrice?: number;
  offers: ApiOffer[];
};

async function fetchPage(offset: number): Promise<{ products: ApiProduct[]; total: number }> {
  const url = `${API_BASE}/api/products?country=GB&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, { headers: { "User-Agent": "btb-import/1.0" } });
  if (!res.ok) throw new Error(`API ${res.status} for ${url}`);
  const data = (await res.json()) as {
    products: ApiProduct[];
    meta: { totalMatched: number };
  };
  return { products: data.products, total: data.meta.totalMatched };
}

async function main() {
  console.log(`Fetching Seentat UK catalogue from ${API_BASE} ...`);
  const all: ApiProduct[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const { products, total: t } = await fetchPage(offset);
    total = t;
    all.push(...products);
    console.log(`  fetched ${all.length}/${total}`);
    if (products.length === 0) break;
    offset += PAGE_SIZE;
  }

  // De-dupe by id (API pagination can shift between pages).
  const byId = new Map(all.map((p) => [p.id, p]));
  const products = [...byId.values()];
  console.log(`Total unique products: ${products.length}`);
  if (products.length === 0) throw new Error("No products fetched — aborting, DB untouched.");

  const fetchedAt = new Date().toISOString();

  const productRows = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description || "",
    gtin: p.gtin || null,
    brand: p.brand || null,
    category: p.category,
    image: p.image || null,
    catalogSource: p.catalogSource || "production-live",
    targetCountries: p.targetCountries?.length ? p.targetCountries : ["GB"],
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

  console.log(`Replacing ${MERCHANT_ID} rows: ${productRows.length} products, ${offerRows.length} offers ...`);

  // Replace this merchant's slice only — never touches other data.
  await prisma.offer.deleteMany({ where: { feedMerchantId: MERCHANT_ID } });
  await prisma.product.deleteMany({ where: { id: { in: productRows.map((r) => r.id) } } });

  const CHUNK = 500;
  for (let i = 0; i < productRows.length; i += CHUNK) {
    await prisma.product.createMany({ data: productRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  for (let i = 0; i < offerRows.length; i += CHUNK) {
    await prisma.offer.createMany({ data: offerRows.slice(i, i + CHUNK), skipDuplicates: true });
  }

  const [pc, oc] = await Promise.all([
    prisma.product.count({ where: { targetCountries: { has: "GB" } } }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID } }),
  ]);
  console.log(`Done. DB now has ${pc} GB products, ${oc} Seentat offers.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
