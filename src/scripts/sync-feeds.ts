/**
 * Offline 2Performant → Supabase import.
 * Never run this on a Vercel request path — only local CLI / CI with long timeout.
 */
import https from "node:https";
import http from "node:http";
import type { Readable } from "node:stream";
import csv from "csv-parser";
import { prisma } from "../lib/db";
import { mapToBeforeToBuyCategoryWithMetadata } from "../lib/category-mapper";
import { UNMAPPED_CATEGORY_ID } from "../lib/categories";
import { resolveGtin } from "../lib/product-identity/gtin";

type RawRow = Record<string, string | undefined>;

type BatchItem = {
  gtin: string | null;
  merchantId: string;
  productData: {
    title: string;
    description: string;
    gtin: string | null;
    brand: string | null;
    category: string;
    image: string | null;
    catalogSource: string;
    targetCountries: string[];
    basePrice: number;
  };
  offerData: {
    id: string;
    storeName: string;
    price: number;
    originalPrice: number | null;
    discountPercentage: number | null;
    currency: string;
    inStock: boolean;
    purchaseUrl: string;
    affiliateNetwork: string;
    source: string;
    feedMerchantId: string;
    merchantProductId: string;
    fetchedAt: string;
  };
};

function stripHtml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const amount = Number.parseFloat(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function resolveMerchantProductId(row: RawRow, fallback: number): string {
  const explicit = row.product_id?.trim() || row.affiliate_product_id?.trim();
  if (explicit) return explicit;

  const link = row.aff_code || row.aff_link || row.url || "";
  const fromLink = link.match(/[?&]unique=([a-zA-Z0-9]+)/)?.[1];
  if (fromLink) return fromLink;

  const title = row.title?.trim();
  if (title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }
  return String(fallback);
}

function openCsvStream(csvUrl: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    const client = csvUrl.startsWith("http://") ? http : https;
    client
      .get(csvUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          openCsvStream(res.headers.location).then(resolve, reject);
          res.resume();
          return;
        }
        if (!res.statusCode || res.statusCode >= 400) {
          reject(new Error(`Feed HTTP ${res.statusCode} for ${csvUrl}`));
          res.resume();
          return;
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

function rowToBatchItem(
  row: RawRow,
  merchantId: string,
  storeName: string,
  countryCode: string,
  currency: string,
  index: number
): BatchItem | null {
  const price = parsePrice(row.price);
  const title = row.title?.trim();
  const purchaseUrl = (row.aff_code || row.aff_link || row.url || "").trim();
  if (!price || !title || !purchaseUrl.startsWith("http")) return null;

  const merchantProductId = resolveMerchantProductId(row, index);
  const gtin = resolveGtin(row.ean || row.gtin) ?? null;
  const description = stripHtml(row.description || title).slice(0, 1000);
  const brand = (row.brand || "").trim() || null;

  const mapping = mapToBeforeToBuyCategoryWithMetadata({
    merchantId,
    merchantCategory: row.category,
    title,
    description,
    brand: brand || undefined,
  });
  const category =
    mapping.categoryId === UNMAPPED_CATEGORY_ID
      ? merchantId === "ro-scule365"
        ? "diy-hand-tools"
        : merchantId === "ro-rowenta"
          ? "cleaning-vacuums"
          : "electronics" // Fallback sigur ca să nu pice
      : mapping.categoryId;

  const originalPrice = parsePrice(row.old_price) ?? null;
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const imageRaw = row.image_urls || row.image_url || "";
  const image =
    imageRaw
      .split(/\s*[|,]\s*/)
      .map((part) => part.trim())
      .find((part) => part.startsWith("http")) || null;

  return {
    gtin,
    merchantId,
    productData: {
      title,
      description,
      gtin,
      brand,
      category,
      image,
      catalogSource: "production-live",
      targetCountries: [countryCode],
      basePrice: price,
    },
    offerData: {
      id: `offer-${merchantId}-${merchantProductId}`,
      storeName,
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
      discountPercentage,
      currency,
      inStock: !/out of stock|indisponibil|stoc epuizat/i.test(row.availability || ""),
      purchaseUrl,
      affiliateNetwork: "2Performant Romania",
      source: "production-live",
      feedMerchantId: merchantId,
      merchantProductId,
      fetchedAt: new Date().toISOString(),
    },
  };
}

export async function sync2PerformantFeed(
  csvUrl: string,
  merchantId: string,
  storeName: string,
  countryCode: string,
  currency: string
): Promise<number> {
  console.log(`Starting sync for ${storeName} (${merchantId}) from ${countryCode}...`);
  console.log(`URL: ${csvUrl}`);

  const stream = await openCsvStream(csvUrl);
  const parser = stream.pipe(csv());

  let count = 0;
  let written = 0;
  let skipped = 0;
  let batch: BatchItem[] = [];
  const BATCH_SIZE = 50;

  for await (const row of parser as AsyncIterable<RawRow>) {
    const item = rowToBatchItem(row, merchantId, storeName, countryCode, currency, count);
    if (!item) {
      skipped += 1;
      continue;
    }
    batch.push(item);
    count += 1;

    if (batch.length >= BATCH_SIZE) {
      written += await processBatchWithDeduplication(batch);
      batch = [];
      if (count % 500 === 0) {
        console.log(`… ${count} rows parsed, ${written} offers upserted`);
      }
    }
  }

  if (batch.length > 0) {
    written += await processBatchWithDeduplication(batch);
  }

  console.log(
    `Sync complete for ${storeName}: ${count} rows parsed, ${written} offers upserted, ${skipped} skipped.`
  );
  return written;
}

async function processBatchWithDeduplication(batch: BatchItem[]): Promise<number> {
  let ok = 0;
  for (const item of batch) {
    try {
      let existingProduct = null;

      if (item.gtin && item.gtin.length > 4) {
        existingProduct = await prisma.product.findFirst({
          where: { gtin: item.gtin },
        });
      }

      if (!existingProduct) {
        existingProduct = await prisma.product.findFirst({
          where: {
            title: { equals: item.productData.title, mode: "insensitive" },
          },
        });
      }

      let productIdToUse: string;

      if (existingProduct) {
        productIdToUse = existingProduct.id;
        const country = item.productData.targetCountries[0];
        if (country && !existingProduct.targetCountries.includes(country)) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: { targetCountries: { push: country } },
          });
        }
      } else {
        productIdToUse = item.gtin
          ? `prod-gtin-${item.gtin}`
          : `prod-${item.merchantId}-${item.offerData.merchantProductId}`;

        await prisma.product.create({
          data: {
            id: productIdToUse,
            title: item.productData.title,
            description: item.productData.description,
            gtin: item.productData.gtin,
            brand: item.productData.brand,
            category: item.productData.category,
            image: item.productData.image,
            catalogSource: item.productData.catalogSource,
            targetCountries: item.productData.targetCountries,
            basePrice: item.productData.basePrice,
          },
        });
      }

      await prisma.offer.upsert({
        where: { id: item.offerData.id },
        update: { ...item.offerData, productId: productIdToUse },
        create: { ...item.offerData, productId: productIdToUse },
      });
      ok += 1;
    } catch (dbError) {
      console.error(
        `DB error for "${item.productData.title.slice(0, 80)}":`,
        dbError instanceof Error ? dbError.message : dbError
      );
    }
  }
  return ok;
}
