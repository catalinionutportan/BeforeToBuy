/**
 * Import Belando CH (AWIN) catalogue into Supabase.
 *
 * Prefers a direct feed download (needs AWIN_API_KEY or AWIN_FEED_URL_CH_BELANDO
 * in .env.local). Falls back to the live API catalogue when the feed path fails.
 *
 * Usage: node --env-file=.env.local --import tsx src/scripts/import-ch-belando.ts
 */
import { prisma } from "../lib/db";
import { loadMerchantFeedForImport } from "../lib/merchant-feeds";

const API_BASE = process.env.IMPORT_SOURCE_BASE || "https://www.beforetobuy.com";
const PAGE_SIZE = 200;
const MERCHANT_ID = "ch-belando";

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

async function fetchFromApi(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = `${API_BASE}/api/products?country=CH&limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url, { headers: { "User-Agent": "btb-import/1.0" } });
    if (!res.ok) throw new Error(`API ${res.status} for ${url}`);
    const data = (await res.json()) as {
      products: ApiProduct[];
      meta: { totalMatched: number };
    };
    total = data.meta.totalMatched;
    all.push(...data.products);
    console.log(`  API fetched ${all.length}/${total}`);
    if (data.products.length === 0) break;
    offset += PAGE_SIZE;
  }

  return [...new Map(all.map((p) => [p.id, p])).values()];
}

async function fetchFromFeed(): Promise<ApiProduct[] | null> {
  try {
    const { products, source } = await loadMerchantFeedForImport(MERCHANT_ID);
    if (source !== "remote" || products.length < 50) {
      console.warn(
        `Feed path returned source=${source}, count=${products.length} — refusing to replace catalogue with sample/partial data.`
      );
      return null;
    }
    console.log(`Feed download OK: ${products.length} products (with descriptions).`);
    return products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      gtin: p.gtin,
      brand: p.brand,
      category: p.category,
      image: p.image,
      catalogSource: p.catalogSource,
      targetCountries: p.targetCountries,
      basePrice: p.basePrice,
      offers: p.offers,
    }));
  } catch (error) {
    console.warn(
      "Direct AWIN feed unavailable (set AWIN_API_KEY or AWIN_FEED_URL_CH_BELANDO):",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function writeCatalogue(products: ApiProduct[]) {
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
    targetCountries: p.targetCountries?.length ? p.targetCountries : ["CH"],
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

  console.log(`Writing ${productRows.length} products, ${offerRows.length} offers...`);

  await prisma.offer.deleteMany({ where: { feedMerchantId: MERCHANT_ID } });

  const CHUNK = 500;
  const productIds = productRows.map((r) => r.id);
  for (let i = 0; i < productIds.length; i += CHUNK) {
    await prisma.product.deleteMany({
      where: {
        id: { in: productIds.slice(i, i + CHUNK) },
        targetCountries: { has: "CH" },
      },
    });
  }

  for (let i = 0; i < productRows.length; i += CHUNK) {
    await prisma.product.createMany({ data: productRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  for (let i = 0; i < offerRows.length; i += CHUNK) {
    await prisma.offer.createMany({ data: offerRows.slice(i, i + CHUNK), skipDuplicates: true });
  }

  const withDesc = await prisma.product.count({
    where: {
      targetCountries: { has: "CH" },
      description: { not: "" },
    },
  });
  const [pc, oc] = await Promise.all([
    prisma.product.count({ where: { targetCountries: { has: "CH" } } }),
    prisma.offer.count({ where: { feedMerchantId: MERCHANT_ID } }),
  ]);
  console.log(`Done. CH products=${pc}, Belando offers=${oc}, with description=${withDesc}`);
}

async function main() {
  console.log("Importing Belando CH into Supabase...");
  const fromFeed = await fetchFromFeed();
  const products = fromFeed ?? (await fetchFromApi());
  if (products.length === 0) throw new Error("No products — aborting.");
  if (!fromFeed) {
    console.warn(
      "Using API fallback (descriptions likely empty). After deploy, set AWIN_API_KEY in .env.local and re-run, or warm feeds on Vercel then re-run."
    );
  }
  await writeCatalogue(products);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
