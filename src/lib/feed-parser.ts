import { CountryCode, Offer, OfferSource, Product, PromoCoupon } from "@/types";
import { mapToBeforeToBuyCategory } from "@/lib/category-mapper";

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

/**
 * Parser for AWIN CSV / Datafeed lines
 */
export function parseAwinCsvFeed(
  csvContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Product[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const productsMap = new Map<string, Product>();

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

    const offer: Offer = {
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
      badge: isProduction
        ? discountPercentage && discountPercentage >= 20
          ? `-${discountPercentage}% feed discount`
          : "Production feed"
        : "Sample feed",
    };

    const productId = `feed-${row.aw_product_id}`;

    if (!productsMap.has(productId)) {
      const mappedCategory = mapToBeforeToBuyCategory({
        merchantCategory: row.category_name,
        title: row.product_name,
        description: row.description,
        brand: row.brand_name,
      });

      productsMap.set(productId, {
        id: productId,
        title: row.product_name,
        description: row.description || row.product_name,
        category: mappedCategory,
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

  return Array.from(productsMap.values());
}

/**
 * Sample Coupons Feed fetcher for AWIN & CJ Coupon API Stream
 */
export function getActiveCouponsForCountry(_country: CountryCode): PromoCoupon[] {
  // Beta/Demo: no hardcoded coupon codes until verified via affiliate APIs.
  void _country;
  return [];
}
