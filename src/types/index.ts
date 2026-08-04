export type CountryCode = "CH" | "DE" | "FR" | "RO" | "GB" | "US";

export interface MerchantDomainInfo {
  id: string;
  name: string;
  domain: string; // e.g. "digitec.ch", "galaxus.ch", "amazon.de"
  websiteUrl: string; // e.g. "https://www.digitec.ch"
  countryCode: CountryCode;
  affiliateNetwork: string; // e.g. "Galaxus Merchant Network", "AWIN CH", "Amazon Associates DE/CH"
  category: string; // e.g. "Electronics & Tech", "General Retail & Marketplace"
  hasClickAndCollect: boolean;
  status: "Active Integration" | "API Verified" | "Datafeed Connected";
  badge?: string;
  description: string;
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

export interface UserLocation {
  latitude: number;
  longitude: number;
  countryCode: CountryCode;
  countryName: string;
  city: string;
  postalCode?: string;
  isGps: boolean; // true if from GPS, false if IP fallback or manual
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
  purchaseUrl: string; // Affiliate link
  affiliateNetwork: string; // e.g. "Amazon Associates CH", "AWIN CH", "Galaxus Partner"
  type: "online" | "local_pickup" | "cross_border";
  nearbyBranch?: PhysicalStoreBranch;
  badge?: string; // e.g. "Cheapest Online", "Closest to You", "Best Click & Collect"
  promoCode?: string; // e.g. "SUMMER10"
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
  category: string; // Digitec-style module or subcategory id (see src/lib/categories.ts)
  image: string;
  rating: number;
  reviewsCount: number;
  brand: string;
  offers: Offer[];
  targetCountries: CountryCode[];
  isFlashDeal?: boolean;
  basePrice?: number;
}
