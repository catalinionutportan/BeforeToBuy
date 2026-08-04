import { CountryCode, Offer, Product, PromoCoupon } from "@/types";

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
      productsMap.set(productId, {
        id: productId,
        title: row.product_name,
        description: row.description || row.product_name,
        category: "electronics",
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
export function getActiveCouponsForCountry(country: CountryCode): PromoCoupon[] {
  if (country === "CH") {
    return [
      {
        id: "coup-galaxus-10",
        storeName: "Galaxus.ch",
        title: "10 CHF Discount on Electronics",
        description: "Valid for all orders over 100 CHF on Digitec & Galaxus.ch",
        code: "GALAXUS10CH",
        discountValue: "10 CHF OFF",
        expiryDate: "2026-08-31",
        countryCode: "CH",
        affiliateUrl: "https://www.galaxus.ch/?partner=geo-shoping-ch",
        category: "electronics",
      },
      {
        id: "coup-mediamarkt-ch-15",
        storeName: "MediaMarkt CH",
        title: "15% OFF Audio & Headphones",
        description: "Special voucher for Sony & Bose noise cancelling audio gear",
        code: "MM15AUDIO",
        discountValue: "15% OFF",
        expiryDate: "2026-08-20",
        countryCode: "CH",
        affiliateUrl: "https://www.mediamarkt.ch/?partner=geo-ch",
        category: "electronics",
      },
      {
        id: "coup-brack-free",
        storeName: "Brack.ch",
        title: "Free Express Same-Day Delivery",
        description: "Free same-day shipping on orders placed before 17:00",
        code: "BRACKEXPRESS",
        discountValue: "FREE SHIPPING",
        expiryDate: "2026-09-15",
        countryCode: "CH",
        affiliateUrl: "https://www.brack.ch/?tag=geo-ch",
        category: "all",
      },
    ];
  }

  if (country === "DE") {
    return [
      {
        id: "coup-amazon-de-20",
        storeName: "Amazon.de",
        title: "20€ Coupon on Smart Home Devices",
        description: "Applies to Echo, Ring, and Kindle products",
        code: "DEAL20DE",
        discountValue: "20€ OFF",
        expiryDate: "2026-08-31",
        countryCode: "DE",
        affiliateUrl: "https://www.amazon.de/?tag=geo-shopping-de-21",
        category: "electronics",
      },
    ];
  }

  if (country === "RO") {
    return [
      {
        id: "coup-emag-genius",
        storeName: "eMAG.ro",
        title: "Voucher 50 LEI la comenzi electrocasnice",
        description: "Valabil pentru membrii Genius la comenzi de minim 300 lei",
        code: "EMAGGENIUS50",
        discountValue: "50 LEI OFF",
        expiryDate: "2026-08-31",
        countryCode: "RO",
        affiliateUrl: "https://www.emag.ro",
        category: "home",
      },
    ];
  }

  return [
    {
      id: "coup-amazon-global",
      storeName: "Amazon",
      title: "10% Student & Prime Discount",
      description: "Exclusive promotion code for verified accounts",
      code: "PRIME10",
      discountValue: "10% OFF",
      expiryDate: "2026-12-31",
      countryCode: country,
      affiliateUrl: "https://www.amazon.com",
      category: "all",
    },
  ];
}
