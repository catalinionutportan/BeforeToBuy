export type CountryCode = "CH" | "DE" | "FR" | "RO" | "GB" | "US";
export type OfferSource = "production-live" | "sample" | "demo";

export interface MerchantDomainInfo {
  id: string;
  name: string;
  domain: string; // e.g. "digitec.ch", "galaxus.ch", "amazon.de"
  websiteUrl: string; // e.g. "https://www.digitec.ch"
  countryCode: CountryCode;
  affiliateNetwork: string; // e.g. "Galaxus Merchant Network", "AWIN CH", "Amazon Associates DE/CH"
  category: string; // e.g. "Electronics & Tech", "General Retail & Marketplace"
  hasClickAndCollect: boolean;
  status:
    | "Planned Integration"
    | "Demo Catalog"
    | "Search Redirect"
    | "Sample Feed"
    | "Live Feed"
    | "Live Affiliate Redirect"
    | "Directory only";
  badge?: string;
  description: string;
  /** Shown in CH browse only when the Cross-border collection is active. */
  isCrossBorder?: boolean;
}

export interface CountryInfo {
  code: CountryCode;
  name: string;
  nativeName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  defaultCoordinates: {
    lat: number;
    lng: number;
    city: string;
  };
  supportedStores: string[];
  merchantDomains: MerchantDomainInfo[];
  affiliateNetworks: string[];
}

export type LocationKind = "default" | "ip" | "gps" | "manual";

export interface UserLocation {
  latitude: number;
  longitude: number;
  countryCode: CountryCode;
  countryName: string;
  city: string;
  postalCode?: string;
  isGps: boolean; // true if from GPS, false if IP fallback or manual
  /** How the current coordinates/city were obtained (avoids claiming "Detected" for defaults). */
  locationKind?: LocationKind;
}

export interface PhysicalStoreBranch {
  id: string;
  storeName: string;
  branchName: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  stockStatus: "In Stock" | "Low Stock" | "Pickup Today" | "Order Required";
}

export interface PriceHistoryPoint {
  price: number;
  totalPrice: number;
  recordedAt: string;
  source: OfferSource;
}

export interface Offer {
  id: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  inStock: boolean;
  deliveryTime: string; // e.g. "Tomorrow", "1-2 days", "Pick up in 15 min"
  deliveryCost: number;
  totalPrice?: number; // price + deliveryCost (excl. VAT/customs)
  purchaseUrl: string; // Affiliate link
  affiliateNetwork: string; // e.g. "Amazon Associates CH", "AWIN CH", "Galaxus Partner"
  type: "online" | "local_pickup" | "cross_border";
  nearbyBranch?: PhysicalStoreBranch;
  badge?: string; // e.g. "Cheapest Online", "Closest to You", "Best Click & Collect"
  promoCode?: string; // e.g. "SUMMER10"
  source: OfferSource;
  feedMerchantId?: string;
  merchantProductId?: string;
  fetchedAt?: string;
  priceHistory?: PriceHistoryPoint[];
}

export interface PromoCoupon {
  id: string;
  storeName: string;
  title: string;
  description: string;
  code: string;
  discountValue: string; // e.g. "-20%", "15 CHF OFF"
  expiryDate: string;
  countryCode: CountryCode;
  affiliateUrl: string;
  category: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  gtin?: string;
  variantKey?: string;
  canonicalKey?: string;
  category: string; // BeforeToBuy module or subcategory id (see src/lib/categories.ts)
  categoryAssignment?: {
    method:
      | "merchant-exact"
      | "merchant-pattern"
      | "merchant-rule"
      | "keyword"
      | "combined-rule"
      | "below-threshold"
      | "unmapped"
      | "manual";
    confidence: number;
    rawCategory?: string;
    proposedCategoryId?: string;
  };
  image: string;
  rating?: number;
  reviewsCount?: number;
  brand: string;
  offers: Offer[];
  targetCountries: CountryCode[];
  isFlashDeal?: boolean;
  basePrice?: number;
  catalogSource?: OfferSource | "mixed";
}
