import { CountryCode, Offer, OfferSource, Product, PromoCoupon } from "@/types";
import { mapToBeforeToBuyCategoryWithMetadata } from "@/lib/category-mapper";
import { createMappingLogEntry, type MappingLogEntry } from "@/lib/mapping-log";
import { resolveGtin } from "@/lib/product-identity/gtin";
import { enrichProductIdentity } from "@/lib/product-identity/merge-products";
import { enrichOfferPricing } from "@/lib/pricing/total-price";

/**
 * Standard interface for raw item inside an AWIN Datafeed (CSV / XML)
 */
export interface RawAwinFeedItem {
  aw_product_id: string;
  product_name: string;
  description: string;
  merchant_name: string;
  search_price: string;
  store_price: string;
  rrp_price?: string; // Recommended Retail Price (Original Price)
  currency: string;
  aw_deep_link: string; // Affiliate link
  merchant_image_url: string;
  category_name: string;
  brand_name: string;
  in_stock: string; // "1" or "0"
  delivery_cost?: string;
  promo_code?: string;
  ean?: string;
  gtin?: string;
}

/**
 * Standard interface for raw item inside a Galaxus Merchant CSV/JSON Feed
 */
export interface RawGalaxusFeedItem {
  gtin: string;
  title: string;
  description: string;
  brand: string;
  price_chf: number;
  original_price_chf?: number;
  stock_status: string;
  product_url: string;
  image_url: string;
  merchant_category?: string;
  branch_availability?: {
    store_name: string;
    city: string;
    lat: number;
    lng: number;
  }[];
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"|"$/g, ""));
}

function readAwinGtin(row: Record<string, string>): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.toLowerCase();
    if (
      (normalizedKey === "ean" ||
        normalizedKey === "gtin" ||
        normalizedKey === "ean13" ||
        normalizedKey === "product_gtin" ||
        normalizedKey === "upc") &&
      value
    ) {
      return resolveGtin(value);
    }
  }
  return undefined;
}

function finalizeFeedProducts(products: Product[]): Product[] {
  return products.map(enrichProductIdentity);
}

/**
 * Parser for AWIN CSV / Datafeed lines
 */
export function parseAwinCsvFeed(
  csvContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { products: [], mappingLog: [] };

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    if (!row.aw_product_id || !row.product_name) continue;

    const price = parseFloat(row.search_price || row.store_price || "0");
    const isProduction = source === "production-live";
    const originalPrice = isProduction && row.rrp_price ? parseFloat(row.rrp_price) : undefined;
    const discountPercentage =
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    const gtin = readAwinGtin(row);

    const offer: Offer = enrichOfferPricing({
      id: `awin-${row.aw_product_id}`,
      storeName: row.merchant_name || "AWIN Merchant",
      price,
      originalPrice,
      discountPercentage,
      currency: row.currency || "CHF",
      inStock: row.in_stock === "1" || row.in_stock === "true",
      deliveryTime: "1-2 Work Days",
      deliveryCost: parseFloat(row.delivery_cost || "0"),
      purchaseUrl: row.aw_deep_link || "#",
      affiliateNetwork: `AWIN ${targetCountry}`,
      type: "online",
      promoCode: isProduction ? row.promo_code : undefined,
      source,
      feedMerchantId,
      merchantProductId: row.aw_product_id,
      badge: isProduction
        ? discountPercentage && discountPercentage >= 20
          ? `-${discountPercentage}% feed discount`
          : "Production feed"
        : "Sample feed",
    });

    const productId = gtin ? `feed-gtin-${gtin}` : `feed-${row.aw_product_id}`;

    if (!productsMap.has(productId)) {
      const categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
        merchantId: feedMerchantId,
        merchantCategory: row.category_name,
        title: row.product_name,
        description: row.description,
        brand: row.brand_name,
      });

      mappingLog.push(
        createMappingLogEntry({
          productId,
          merchantId: feedMerchantId,
          title: row.product_name,
          rawCategory: row.category_name,
          mapping: categoryMapping,
        })
      );

      productsMap.set(productId, {
        id: productId,
        title: row.product_name,
        description: row.description || row.product_name,
        gtin,
        category: categoryMapping.categoryId,
        categoryAssignment: {
          method: categoryMapping.method,
          confidence: categoryMapping.confidence,
          rawCategory: categoryMapping.rawCategory,
          proposedCategoryId: categoryMapping.proposedCategoryId,
        },
        brand: row.brand_name || "Generic",
        image: row.merchant_image_url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
        targetCountries: [targetCountry],
        isFlashDeal: isProduction && discountPercentage ? discountPercentage >= 15 : false,
        catalogSource: source,
        offers: [offer],
      });
    } else {
      productsMap.get(productId)!.offers.push(offer);
    }
  }

  return {
    products: finalizeFeedProducts(Array.from(productsMap.values())),
    mappingLog,
  };
}

function galaxusStoreName(feedMerchantId: string): string {
  if (feedMerchantId === "ch-galaxus") return "Galaxus.ch";
  return "Digitec.ch";
}

function galaxusAffiliateNetwork(feedMerchantId: string): string {
  return feedMerchantId === "ch-galaxus" ? "Galaxus Partner Program" : "Galaxus Merchant Network";
}

/**
 * Parser for Galaxus Merchant JSON feeds (Digitec / Galaxus).
 */
export function parseGalaxusJsonFeed(
  jsonContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  let rows: RawGalaxusFeedItem[] = [];
  try {
    const parsed = JSON.parse(jsonContent) as RawGalaxusFeedItem[] | { products: RawGalaxusFeedItem[] };
    rows = Array.isArray(parsed) ? parsed : parsed.products ?? [];
  } catch {
    return { products: [], mappingLog: [] };
  }

  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];
  const isProduction = source === "production-live";
  const storeName = galaxusStoreName(feedMerchantId);

  for (const row of rows) {
    if (!row.gtin || !row.title) continue;

    const price = Number(row.price_chf) || 0;
    const originalPrice =
      isProduction && row.original_price_chf && row.original_price_chf > price
        ? row.original_price_chf
        : undefined;
    const discountPercentage =
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    const onlineOffer: Offer = enrichOfferPricing({
      id: `galaxus-${row.gtin}-online`,
      storeName,
      price,
      originalPrice,
      discountPercentage,
      currency: "CHF",
      inStock: row.stock_status !== "out_of_stock" && row.stock_status !== "0",
      deliveryTime: "1-3 Work Days",
      deliveryCost: 0,
      purchaseUrl: row.product_url || "#",
      affiliateNetwork: galaxusAffiliateNetwork(feedMerchantId),
      type: "online",
      source,
      feedMerchantId,
      merchantProductId: row.gtin,
      badge: isProduction ? "Production feed" : "Sample feed",
    });

    const offers: Offer[] = [onlineOffer];

    if (row.branch_availability?.length) {
      const branch = row.branch_availability[0];
      offers.push({
        ...onlineOffer,
        id: `galaxus-${row.gtin}-pickup`,
        type: "local_pickup",
        deliveryTime: "Pick up today",
        deliveryCost: 0,
        badge: isProduction ? "Click & Collect" : "Sample pickup",
      });
      void branch;
    }

    const productId = `feed-gtin-${row.gtin}`;
    const categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: feedMerchantId,
      merchantCategory: row.merchant_category,
      title: row.title,
      description: row.description,
      brand: row.brand,
    });

    mappingLog.push(
      createMappingLogEntry({
        productId,
        merchantId: feedMerchantId,
        title: row.title,
        rawCategory: row.merchant_category,
        mapping: categoryMapping,
      })
    );

    productsMap.set(productId, {
      id: productId,
      title: row.title,
      description: row.description || row.title,
      gtin: resolveGtin(row.gtin),
      category: categoryMapping.categoryId,
      categoryAssignment: {
        method: categoryMapping.method,
        confidence: categoryMapping.confidence,
        rawCategory: categoryMapping.rawCategory,
        proposedCategoryId: categoryMapping.proposedCategoryId,
      },
      brand: row.brand || "Generic",
      image: row.image_url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
      targetCountries: [targetCountry],
      isFlashDeal: isProduction && discountPercentage ? discountPercentage >= 15 : false,
      catalogSource: source,
      offers,
    });
  }

  return {
    products: finalizeFeedProducts(Array.from(productsMap.values())),
    mappingLog,
  };
}

/**
 * Sample Coupons Feed fetcher for AWIN & CJ Coupon API Stream
 */
export function getActiveCouponsForCountry(_country: CountryCode): PromoCoupon[] {
  // Beta/Demo: no hardcoded coupon codes until verified via affiliate APIs.
  void _country;
  return [];
}
