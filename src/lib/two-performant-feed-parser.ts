import csv from "csv-parser";
import { CountryCode, Offer, OfferSource, Product } from "@/types";
import { mapToBeforeToBuyCategoryWithMetadata } from "@/lib/category-mapper";
import { UNMAPPED_CATEGORY_ID } from "@/lib/categories";
import { MAPPING_CONFIDENCE } from "@/lib/merchant-category-rules";
import { createMappingLogEntry, type MappingLogEntry } from "@/lib/mapping-log";
import { resolveGtin } from "@/lib/product-identity/gtin";
import { enrichProductIdentity } from "@/lib/product-identity/merge-products";
import { enrichOfferPricing } from "@/lib/pricing/total-price";

/** 2Performant “My Feeds” CSV columns (export field set may vary per feed). */
export interface RawTwoPerformantFeedItem {
  product_id?: string;
  gtin?: string;
  title: string;
  brand?: string;
  /** Marketer / affiliate deep link (column name is historically `aff_code`). */
  aff_code?: string;
  category?: string;
  price: string;
  old_price?: string;
  url?: string;
  image_urls?: string;
  description?: string;
  campaign_name?: string;
}

function resolveProductId(row: RawTwoPerformantFeedItem): string | undefined {
  const explicit = row.product_id?.trim();
  if (explicit) return explicit;

  const fromLink = row.aff_code?.match(/[?&]unique=([a-zA-Z0-9]+)/)?.[1];
  if (fromLink) return fromLink;

  const title = row.title?.trim();
  if (!title) return undefined;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

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

/** Pick the first usable image URL from a 2P `image_urls` cell (comma/`|` separated). */
export function firstImage(imageUrls?: string): string {
  if (!imageUrls?.trim()) {
    return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600";
  }
  const first = imageUrls
    .split(/\s*[|,]\s*/)
    .map((part) => part.trim())
    .find((part) => part.startsWith("http"));
  return first || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600";
}

function storeNameForMerchant(feedMerchantId: string): string {
  if (feedMerchantId === "ro-rowenta") return "Rowenta.ro";
  if (feedMerchantId === "ro-scule365") return "Scule365.ro";
  if (feedMerchantId === "ro-scule365") return "Scule365.ro";
  return "2Performant Merchant";
}

function buildOffer(
  row: RawTwoPerformantFeedItem,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  productId: string
): Offer | null {
  const price = parsePrice(row.price);
  if (!price || !row.title?.trim()) return null;

  const purchaseUrl = (row.aff_code || row.url || "").trim();
  if (!purchaseUrl.startsWith("http")) return null;

  const originalPrice = parsePrice(row.old_price);
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;
  const isProduction = source === "production-live";

  return enrichOfferPricing({
    id: `2p-${feedMerchantId}-${productId}`,
    storeName: storeNameForMerchant(feedMerchantId),
    price,
    originalPrice:
      isProduction && originalPrice && originalPrice > price ? originalPrice : undefined,
    discountPercentage,
    currency: "RON",
    inStock: true,
    deliveryTime: "2-5 zile lucrătoare",
    deliveryCost: 0,
    purchaseUrl,
    affiliateNetwork: "2Performant Romania",
    type: "online",
    source,
    feedMerchantId,
    merchantProductId: productId,
    badge: isProduction
      ? discountPercentage && discountPercentage >= 20
        ? `-${discountPercentage}% feed discount`
        : "Production feed"
      : "Sample feed",
  });
}

function ingestRow(
  row: RawTwoPerformantFeedItem,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  productsMap: Map<string, Product>,
  mappingLog: MappingLogEntry[],
  categoryHint?: string
): void {
  const merchantProductId = resolveProductId(row);
  if (!merchantProductId) return;

  const offer = buildOffer(row, feedMerchantId, source, merchantProductId);
  if (!offer) return;

  const gtin = resolveGtin(row.gtin);
  const productId = gtin ? `feed-gtin-${gtin}` : `feed-${feedMerchantId}-${merchantProductId}`;
  const existing = productsMap.get(productId);
  if (existing) {
    existing.offers.push(offer);
    return;
  }

  const title = row.title.trim();
  const description = stripHtml(row.description || title) || title;
  const brand = (row.brand || "Generic").trim() || "Generic";
  let categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: feedMerchantId,
    merchantCategory: row.category,
    title,
    description,
    brand,
  });

  // Specialty feeds: if CSV category is weak, fall back to the feed’s aisle hint.
  if (
    categoryHint &&
    categoryMapping.categoryId === UNMAPPED_CATEGORY_ID
  ) {
    categoryMapping = {
      categoryId: categoryHint,
      method: "merchant-default",
      confidence: MAPPING_CONFIDENCE.combinedPattern,
      rawCategory: row.category,
      proposedCategoryId: categoryMapping.proposedCategoryId,
    };
  }

  mappingLog.push(
    createMappingLogEntry({
      productId,
      merchantId: feedMerchantId,
      title,
      rawCategory: row.category,
      mapping: categoryMapping,
    })
  );

  productsMap.set(productId, {
    id: productId,
    title,
    description,
    gtin,
    category: categoryMapping.categoryId,
    categoryAssignment: {
      method: categoryMapping.method,
      confidence: categoryMapping.confidence,
      rawCategory: categoryMapping.rawCategory,
      proposedCategoryId: categoryMapping.proposedCategoryId,
    },
    brand,
    image: firstImage(row.image_urls),
    targetCountries: [targetCountry],
    isFlashDeal: Boolean(offer.discountPercentage && offer.discountPercentage >= 15),
    catalogSource: source,
    offers: [offer],
  });
}

export async function parseTwoPerformantCsvFeedStream(
  content: NodeJS.ReadableStream,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  options?: { categoryHint?: string }
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];
  const categoryHint = options?.categoryHint;

  await new Promise<void>((resolve, reject) => {
    content
      .pipe(csv())
      .on("data", (row: RawTwoPerformantFeedItem) => {
        ingestRow(
          row,
          targetCountry,
          feedMerchantId,
          source,
          productsMap,
          mappingLog,
          categoryHint
        );
      })
      .on("end", () => resolve())
      .on("error", (error: Error) => reject(error));
  });

  return {
    products: Array.from(productsMap.values()).map(enrichProductIdentity),
    mappingLog,
  };
}
