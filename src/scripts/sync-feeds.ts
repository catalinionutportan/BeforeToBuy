/**
 * Offline 2Performant → Supabase import.
 * Never run this on a Vercel request path — only local CLI / CI with long timeout.
 */
import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { randomUUID } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import type { PrismaClient } from "@prisma/client";
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
import {
  replaceMerchantCatalogueAtomically,
  type AtomicCatalogImportInput,
  type AtomicCatalogImportResult,
  type AtomicCatalogOfferRow,
  type AtomicCatalogProductRow,
} from "../lib/atomic-catalog-import";

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

const MAX_REDIRECTS = MAX_FEED_REDIRECTS;
const MAX_FEED_BYTES = 250 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_PARSED_ROWS = 100_000;
const MAX_STAGED_JSON_BYTES = 64 * 1024 * 1024;
const IDENTITY_READ_BATCH_SIZE = 1_000;

type CatalogueReadClient = Pick<PrismaClient, "product" | "offer" | "$transaction">;
type AtomicPublisher = (input: AtomicCatalogImportInput) => Promise<AtomicCatalogImportResult>;

export interface Sync2PerformantOptions {
  /** Test seam only; production keeps the validated HTTPS downloader. */
  openFeedStream?: (url: string) => Promise<Readable>;
  /** Test seam only; production uses the application Prisma singleton. */
  prismaClient?: CatalogueReadClient;
  /** Test seam only; production uses the shared atomic publisher. */
  publishCatalogue?: AtomicPublisher;
  /** Required by the shared guard for a deliberate, documented large reduction. */
  reductionOverride?: AtomicCatalogImportInput["reductionOverride"];
}

function sanitizeUtf8(value?: string | null): string {
  if (!value) return "";
  try {
    const wellFormed = typeof value.toWellFormed === "function" ? value.toWellFormed() : String(value);
    return wellFormed
      .replace(/[\uD800-\uDFFF]/g, "")
      .replace(/[\x00-\x1F\x7F-\x9F\0\u0000]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return String(value).replace(/[\0\u0000]/g, "").trim();
  }
}

function deepSanitize<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeUtf8(obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize) as T;
  }
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = deepSanitize(v);
    }
    return res as T;
  }
  return obj;
}

function stripHtml(value: string): string {
  return sanitizeUtf8(value)
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

        const encoding = res.headers["content-encoding"] || "";
        const isGzip = encoding.includes("gzip") || url.pathname.endsWith(".gz");
        const isDeflate = encoding.includes("deflate");

        if (isGzip) {
          const gunzip = zlib.createGunzip();
          res.pipe(gunzip).pipe(limiter);
        } else if (isDeflate) {
          const inflate = zlib.createInflate();
          res.pipe(inflate).pipe(limiter);
        } else {
          res.pipe(limiter);
        }
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
  const title = sanitizeUtf8(row.title?.trim());
  const purchaseUrl = sanitizeCommercialUrl(
    sanitizeUtf8((row.aff_code || row.aff_link || row.url || "").trim()),
    merchantId
  );
  if (!price || !title || !purchaseUrl) return null;

  const merchantProductId = sanitizeUtf8(resolveMerchantProductId(row, index));
  const gtin = resolveGtin(row.ean || row.gtin) ?? null;
  const description = stripHtml(row.description || title).slice(0, 1000);
  const brand = sanitizeUtf8((row.brand || "").trim()) || null;

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
          : "electronics"
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
 */
export async function sync2PerformantFeed(
  csvUrl: string | string[],
  merchantId: string,
  storeName: string,
  countryCode: string,
  currency: string,
  options: Sync2PerformantOptions = {}
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
  const stagedOffers = new Map<string, { item: BatchItem; normalized: string }>();

  let rowIndex = 0;
  let parsed = 0;
  let skipped = 0;
  let stagedJsonBytes = 0;
  const openFeed = options.openFeedStream ?? openCsvStream;
  const readClient = options.prismaClient ?? prisma;
  const publishCatalogue = options.publishCatalogue ?? replaceMerchantCatalogueAtomically;

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
      const stream = await openFeed(url);
      await pipeline(stream, fs.createWriteStream(tmpFile));
      console.log(`[1/${csvUrls.length}] Download complete for slice ${feedIndex + 1}.`);

      console.log(`[2/${csvUrls.length}] Parsing slice ${feedIndex + 1}...`);
      const parser = fs.createReadStream(tmpFile).pipe(csv());

      for await (const row of parser as AsyncIterable<RawRow>) {
        rowIndex += 1;
        if (rowIndex > MAX_PARSED_ROWS) {
          throw new Error(
            `Feed ${merchantId} exceeds the ${MAX_PARSED_ROWS.toLocaleString("en-US")} parsed-row staging limit; nothing was published.`
          );
        }
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
        parsed += 1;

        const sanitizedItem = deepSanitize(item);
        const normalized = JSON.stringify(sanitizedItem);
        const existing = stagedOffers.get(sanitizedItem.offerData.id);
        if (existing) {
          if (existing.normalized !== normalized) {
            throw new Error(
              `Conflicting duplicate offer ${sanitizedItem.offerData.id} across feed slices; nothing was published.`
            );
          }
          continue;
        }

        stagedJsonBytes += Buffer.byteLength(normalized, "utf8");
        if (stagedJsonBytes > MAX_STAGED_JSON_BYTES) {
          throw new Error(
            `Feed ${merchantId} exceeds the ${MAX_STAGED_JSON_BYTES / 1024 / 1024} MiB normalized staging limit; nothing was published.`
          );
        }
        stagedOffers.set(sanitizedItem.offerData.id, { item: sanitizedItem, normalized });
      }

      await fs.promises.rm(tmpFile, { force: true });
    }

    if (stagedOffers.size === 0) {
      throw new Error(`Feed ${merchantId} produced no valid offers; nothing was published.`);
    }

    const { productRows, offerRows } = await buildAtomicCatalogueRows({
      items: [...stagedOffers.values()].map(({ item }) => item),
      countryCode,
      readClient,
    });
    const result = await publishCatalogue({
      prisma: readClient,
      merchantId,
      country: countryCode,
      productRows,
      offerRows,
      reductionOverride: options.reductionOverride,
    });

    console.log(
      `[3/3] Sync complete for ${storeName}: ${parsed} valid rows parsed, ${result.offers} unique offers published atomically, ${skipped} skipped.`
    );
    return result.offers;
  } finally {
    await Promise.all(
      tmpFiles.map((tmpFile) => fs.promises.rm(tmpFile, { force: true }).catch(() => undefined))
    );
  }
}

async function buildAtomicCatalogueRows({
  items,
  countryCode,
  readClient,
}: {
  items: BatchItem[];
  countryCode: string;
  readClient: CatalogueReadClient;
}): Promise<{ productRows: AtomicCatalogProductRow[]; offerRows: AtomicCatalogOfferRow[] }> {
  const cCode = countryCode.toLowerCase();
  const gtins = [...new Set(items.flatMap((item) => item.gtin ? [item.gtin] : []))];
  const deterministicIds = [...new Set(items.map((item) =>
    item.gtin
      ? `prod-${cCode}-gtin-${item.gtin}`
      : `prod-${item.merchantId}-${item.offerData.merchantProductId}`
  ))];
  const gtinProductIds = new Map<string, string>();
  const existingIds = new Set<string>();

  for (let index = 0; index < gtins.length; index += IDENTITY_READ_BATCH_SIZE) {
    const chunk = gtins.slice(index, index + IDENTITY_READ_BATCH_SIZE);
    const products = await readClient.product.findMany({
      where: { gtin: { in: chunk }, targetCountries: { has: countryCode } },
      select: { id: true, gtin: true },
    });
    for (const product of products) {
      if (product.gtin) {
        const deterministicId = `prod-${cCode}-gtin-${product.gtin}`;
        if (!gtinProductIds.has(product.gtin) || product.id === deterministicId) {
          gtinProductIds.set(product.gtin, product.id);
        }
      }
    }
  }

  for (let index = 0; index < deterministicIds.length; index += IDENTITY_READ_BATCH_SIZE) {
    const chunk = deterministicIds.slice(index, index + IDENTITY_READ_BATCH_SIZE);
    const products = await readClient.product.findMany({
      where: { id: { in: chunk } },
      select: { id: true },
    });
    for (const product of products) existingIds.add(product.id);
  }

  const resolved = items.map((item) => {
    const deterministicId = item.gtin
      ? `prod-${cCode}-gtin-${item.gtin}`
      : `prod-${item.merchantId}-${item.offerData.merchantProductId}`;
    const existingProductId = item.gtin
      ? gtinProductIds.get(item.gtin) ?? (existingIds.has(deterministicId) ? deterministicId : undefined)
      : existingIds.has(deterministicId)
        ? deterministicId
        : undefined;
    const productId = existingProductId ?? deterministicId;
    return { item, productId };
  });
  const resolvedProductIds = [...new Set(resolved.map(({ productId }) => productId))];
  const foreignMinimumPrices = new Map<string, number>();

  for (let index = 0; index < resolvedProductIds.length; index += IDENTITY_READ_BATCH_SIZE) {
    const chunk = resolvedProductIds.slice(index, index + IDENTITY_READ_BATCH_SIZE);
    const activeForeignOffers = await readClient.offer.findMany({
      where: {
        productId: { in: chunk },
        inStock: true,
        OR: [
          { feedMerchantId: null },
          { feedMerchantId: { not: items[0]!.merchantId } },
        ],
      },
      select: { productId: true, price: true },
    });
    for (const offer of activeForeignOffers) {
      const current = foreignMinimumPrices.get(offer.productId);
      if (current === undefined || offer.price < current) {
        foreignMinimumPrices.set(offer.productId, offer.price);
      }
    }
  }

  const now = new Date();
  const productRowsById = new Map<string, AtomicCatalogProductRow>();
  const offerRows: AtomicCatalogOfferRow[] = [];
  for (const { item, productId } of resolved) {
    const existingRow = productRowsById.get(productId);
    const incomingMinimum = Math.min(existingRow?.basePrice ?? Number.POSITIVE_INFINITY, item.offerData.price);
    const basePrice = Math.min(
      incomingMinimum,
      foreignMinimumPrices.get(productId) ?? Number.POSITIVE_INFINITY
    );
    if (existingRow) {
      existingRow.basePrice = basePrice;
    } else {
      productRowsById.set(productId, {
        id: productId,
        ...item.productData,
        basePrice,
        targetCountries: [countryCode],
        createdAt: now,
        updatedAt: now,
      });
    }
    offerRows.push({
      ...item.offerData,
      productId,
      feedMerchantId: item.merchantId,
    });
  }

  return { productRows: [...productRowsById.values()], offerRows };
}
