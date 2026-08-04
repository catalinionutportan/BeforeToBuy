import { CountryCode, Offer, Product, PromoCoupon } from "@/types";
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

/**
 * Parser for AWIN CSV / Datafeed lines
 */
export function parseAwinCsvFeed(csvContent: string, targetCountry: CountryCode): Product[] {
  const lines = csvContent.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const productsMap = new Map<string, Product>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser handling quotes
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    if (!row.aw_product_id || !row.product_name) continue;

    const price = parseFloat(row.search_price || row.store_price || "0");
    const originalPrice = row.rrp_price ? parseFloat(row.rrp_price) : undefined;
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
      promoCode: row.promo_code,
      badge: discountPercentage && discountPercentage >= 20 ? `-${discountPercentage}% FLASH DEAL` : undefined,
    };

    const productId = `prod-${row.brand_name?.toLowerCase().replace(/\s+/g, "-") || "gen"}-${row.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30)}`;

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
        rating: 4.7,
        reviewsCount: 120,
        targetCountries: [targetCountry],
        isFlashDeal: discountPercentage ? discountPercentage >= 15 : false,
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
  return [];
}
