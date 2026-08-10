/**
 * Offline 2Performant → Supabase import.
 * Never run this on a Vercel request path — only local CLI / CI with long timeout.
 */
import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import type { Product } from "@prisma/client";
import csv from "csv-parser";
import { prisma } from "../lib/db";
import { mapToBeforeToBuyCategoryWithMetadata } from "../lib/category-mapper";
import { UNMAPPED_CATEGORY_ID } from "../lib/categories";
import { resolveGtin } from "../lib/product-identity/gtin";
import {
  assertFeedDownloadUrl,
  sanitizeCommercialUrl,
  sanitizeFeedImageUrl,
} from "../lib/feed-url-policy";
import { MAX_FEED_REDIRECTS, safeFeedHost } from "../lib/feed-download";
import { deriveRowDeliveryFields } from "../lib/offers/delivery-cost";

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
    deliveryTime?: string;
    deliveryCost?: number;
    totalPrice?: number;
  };
};

type BatchResult = {
  written: number;
  productIds: Set<string>;
};

const MAX_REDIRECTS = MAX_FEED_REDIRECTS;
const MAX_FEED_BYTES = 250 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const PRODUCT_REFRESH_BATCH_SIZE = 500;

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

function validateFeedUrl(csvUrl: string): URL {
  return assertFeedDownloadUrl(csvUrl);
}

function openCsvStream(csvUrl: string, redirectCount = 0): Promise<Readable> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = validateFeedUrl(csvUrl);
    } catch (error) {
      reject(error);
      return;
    }

    const request = https.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error(`Feed exceeded ${MAX_REDIRECTS} redirects.`));
            res.resume();
            return;
          }
          let redirectTarget: URL;
          try {
            redirectTarget = assertFeedDownloadUrl(
              new URL(res.headers.location, url).toString()
            );
          } catch (error) {
            reject(error);
            res.resume();
            return;
          }
          openCsvStream(redirectTarget.toString(), redirectCount + 1).then(resolve, reject);
          res.resume();
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(
            new Error(
              `Feed request failed with HTTP ${res.statusCode ?? "unknown"} host=${safeFeedHost(url)}.`
            )
          );
          res.resume();
          return;
        }

        const contentLength = Number(res.headers["content-length"] || 0);
        if (contentLength > MAX_FEED_BYTES) {
          reject(new Error(`Feed exceeds the ${MAX_FEED_BYTES / 1024 / 1024} MB limit.`));
          res.resume();
          return;
        }

        let downloadedBytes = 0;
        const limiter = new Transform({
          transform(chunk: Buffer, _encoding, callback) {
            downloadedBytes += chunk.length;
            if (downloadedBytes > MAX_FEED_BYTES) {
              callback(new Error(`Feed exceeds the ${MAX_FEED_BYTES / 1024 / 1024} MB limit.`));
              return;
            }
            callback(null, chunk);
          },
        });
        res.pipe(limiter);
        resolve(limiter);
      });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Feed request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`));
    });
    request.on("error", reject);
  });
}

function rowToBatchItem(
  row: RawRow,
  merchantId: string,
  storeName: string,
  countryCode: string,
  currency: string,
  index: number,
  fetchedAt: string
): BatchItem | null {
  const price = parsePrice(row.price);
  const title = row.title?.trim();
  const purchaseUrl = sanitizeCommercialUrl(
    (row.aff_code || row.aff_link || row.url || "").trim(),
    merchantId
  );
  if (!price || !title || !purchaseUrl) return null;

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
  const imageCandidate =
    imageRaw
      .split(/\s*[|,]\s*/)
      .map((part) => part.trim())
      .find(Boolean) || null;
  const image = imageCandidate
    ? sanitizeFeedImageUrl(imageCandidate, merchantId)
    : null;

  const delivery = deriveRowDeliveryFields(row, price);

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
      fetchedAt,
      ...delivery,
    },
  };
}

/**
 * Sync one or more 2Performant CSV URLs for the same merchant.
 * Multiple URLs (category slices) share one `fetchedAt` so stale cleanup
 * only drops offers missing from the full set — not from a single slice.
 */
export async function sync2PerformantFeed(
  csvUrl: string | string[],
  merchantId: string,
  storeName: string,
  countryCode: string,
  currency: string
): Promise<number> {
  const csvUrls = (Array.isArray(csvUrl) ? csvUrl : [csvUrl])
    .map((url) => url.trim())
    .filter(Boolean);
  if (csvUrls.length === 0) {
    throw new Error(`No feed URLs provided for ${merchantId}.`);
  }

  for (const url of csvUrls) {
    validateFeedUrl(url);
  }

  console.log(`Starting sync for ${storeName} (${merchantId}) from ${countryCode}...`);
  console.log(`Feed URL(s): ${csvUrls.length}`);

  const safeMerchantId = merchantId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const fetchedAt = new Date().toISOString();
  const tmpFiles: string[] = [];

  let rowIndex = 0;
  let parsed = 0;
  let written = 0;
  let skipped = 0;
  const affectedProductIds = new Set<string>();
  const BATCH_SIZE = 1000;

  try {
    for (let feedIndex = 0; feedIndex < csvUrls.length; feedIndex += 1) {
      const url = csvUrls[feedIndex]!;
      const host = new URL(url).hostname;
      const tmpFile = path.join(
        os.tmpdir(),
        `beforetobuy-${safeMerchantId}-${feedIndex + 1}-${randomUUID()}.csv`
      );
      tmpFiles.push(tmpFile);

      console.log(
        `[1/${csvUrls.length}] Downloading slice ${feedIndex + 1}/${csvUrls.length} (${host})...`
      );
      const stream = await openCsvStream(url);
      await pipeline(stream, fs.createWriteStream(tmpFile));
      console.log(`[1/${csvUrls.length}] Download complete for slice ${feedIndex + 1}.`);

      console.log(`[2/${csvUrls.length}] Parsing slice ${feedIndex + 1}...`);
      const parser = fs.createReadStream(tmpFile).pipe(csv());
      let batch: BatchItem[] = [];

      for await (const row of parser as AsyncIterable<RawRow>) {
        rowIndex += 1;
        const item = rowToBatchItem(
          row,
          merchantId,
          storeName,
          countryCode,
          currency,
          rowIndex,
          fetchedAt
        );
        if (!item) {
          skipped += 1;
          continue;
        }
        batch.push(item);
        parsed += 1;

        if (batch.length >= BATCH_SIZE) {
          const result = await processBatchWithDeduplication(batch);
          written += result.written;
          result.productIds.forEach((id) => affectedProductIds.add(id));
          batch = [];
          if (parsed % 2000 === 0) {
            console.log(`... ${parsed} rows parsed, ${written} offers upserted`);
          }
        }
      }

      if (batch.length > 0) {
        const result = await processBatchWithDeduplication(batch);
        written += result.written;
        result.productIds.forEach((id) => affectedProductIds.add(id));
      }
    }

    if (written === 0) {
      throw new Error(`Feed ${merchantId} produced no valid offers; stale offers were left unchanged.`);
    }

    const merchantOffers = await prisma.offer.findMany({
      where: { feedMerchantId: merchantId },
      select: { productId: true },
      distinct: ["productId"],
    });
    merchantOffers.forEach(({ productId }) => affectedProductIds.add(productId));

    const staleResult = await prisma.offer.updateMany({
      where: {
        feedMerchantId: merchantId,
        fetchedAt: { not: fetchedAt },
        inStock: true,
      },
      data: { inStock: false },
    });
    await refreshProductBasePrices(affectedProductIds);

    console.log(
      `[3/3] Sync complete for ${storeName}: ${parsed} rows parsed, ${written} offers upserted, ${skipped} skipped, ${staleResult.count} stale offers disabled.`
    );
    return written;
  } finally {
    await Promise.all(
      tmpFiles.map((tmpFile) => fs.promises.rm(tmpFile, { force: true }).catch(() => undefined))
    );
  }
}

async function processBatchWithDeduplication(batch: BatchItem[]): Promise<BatchResult> {
  if (batch.length === 0) return { written: 0, productIds: new Set() };
  let ok = 0;
  const productIds = new Set<string>();
  const failures: string[] = [];

  const gtins = batch.map((b) => b.gtin).filter((g) => g && g.length > 4) as string[];
  const deterministicIds = batch
    .filter((item) => !item.gtin)
    .map((item) => `prod-${item.merchantId}-${item.offerData.merchantProductId}`);
  const [existingByGtin, existingById] = await Promise.all([
    gtins.length > 0
      ? prisma.product.findMany({ where: { gtin: { in: gtins } } })
      : Promise.resolve([] as Product[]),
    deterministicIds.length > 0
      ? prisma.product.findMany({ where: { id: { in: deterministicIds } } })
      : Promise.resolve([] as Product[]),
  ]);
  const gtinMap = new Map(existingByGtin.flatMap((product) => product.gtin ? [[product.gtin, product]] : []));
  const idMap = new Map(existingById.map((product) => [product.id, product]));

  for (const item of batch) {
    try {
      const deterministicId = item.gtin
        ? `prod-gtin-${item.gtin}`
        : `prod-${item.merchantId}-${item.offerData.merchantProductId}`;
      let existingProduct = item.gtin ? gtinMap.get(item.gtin) : idMap.get(deterministicId);

      if (existingProduct) {
        const country = item.productData.targetCountries[0];
        const targetCountries = country && !existingProduct.targetCountries.includes(country)
          ? [...existingProduct.targetCountries, country]
          : existingProduct.targetCountries;
        existingProduct = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title: item.productData.title,
            description: item.productData.description,
            gtin: item.gtin ?? existingProduct.gtin,
            brand: item.productData.brand,
            category: item.productData.category,
            image: item.productData.image ?? existingProduct.image,
            catalogSource: item.productData.catalogSource,
            targetCountries,
          },
        });
      } else {
        existingProduct = await prisma.product.create({
          data: {
            id: deterministicId,
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

      if (existingProduct.gtin) gtinMap.set(existingProduct.gtin, existingProduct);
      idMap.set(existingProduct.id, existingProduct);
      productIds.add(existingProduct.id);

      await prisma.offer.upsert({
        where: { id: item.offerData.id },
        update: {
          ...item.offerData,
          productId: existingProduct.id,
          deliveryTime: item.offerData.deliveryTime ?? null,
          deliveryCost: item.offerData.deliveryCost ?? null,
          totalPrice: item.offerData.totalPrice ?? null,
        },
        create: {
          ...item.offerData,
          productId: existingProduct.id,
          deliveryTime: item.offerData.deliveryTime ?? null,
          deliveryCost: item.offerData.deliveryCost ?? null,
          totalPrice: item.offerData.totalPrice ?? null,
        },
      });
      ok += 1;
    } catch (dbError: unknown) {
      const message = dbError instanceof Error ? dbError.message : String(dbError);
      failures.push(`"${item.productData.title.slice(0, 80)}": ${message}`);
      console.error(`DB error for "${item.productData.title.slice(0, 80)}":`, message);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `${failures.length}/${batch.length} offers failed database import. First error: ${failures[0]}`
    );
  }
  return { written: ok, productIds };
}

async function refreshProductBasePrices(productIds: Set<string>): Promise<void> {
  const ids = [...productIds];
  for (let index = 0; index < ids.length; index += PRODUCT_REFRESH_BATCH_SIZE) {
    const chunk = ids.slice(index, index + PRODUCT_REFRESH_BATCH_SIZE);
    const activeOffers = await prisma.offer.findMany({
      where: { productId: { in: chunk }, inStock: true },
      select: { productId: true, price: true },
    });
    const minimumPrices = new Map<string, number>();
    for (const offer of activeOffers) {
      const current = minimumPrices.get(offer.productId);
      if (current === undefined || offer.price < current) {
        minimumPrices.set(offer.productId, offer.price);
      }
    }

    await prisma.$transaction(
      chunk.map((productId) =>
        prisma.product.update({
          where: { id: productId },
          data: { basePrice: minimumPrices.get(productId) ?? null },
        })
      )
    );
  }
}
