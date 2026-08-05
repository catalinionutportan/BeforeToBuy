import { CountryCode, PhysicalStoreBranch, Product, UserLocation } from "@/types";
import { COUNTRIES } from "./countries";
import { calculateHaversineDistance } from "./geolocation";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "./categories";
import { productMatchesSearchQuery } from "./product-search";

// Import store branches from JSON files
import chBranches from "@/data/store-branches-ch.json";
import deBranches from "@/data/store-branches-de.json";
import frBranches from "@/data/store-branches-fr.json";
import roBranches from "@/data/store-branches-ro.json";
import gbBranches from "@/data/store-branches-gb.json";
import usBranches from "@/data/store-branches-us.json";

const STORE_BRANCHES: Record<CountryCode, PhysicalStoreBranch[]> = {
  CH: chBranches as PhysicalStoreBranch[],
  DE: deBranches as PhysicalStoreBranch[],
  FR: frBranches as PhysicalStoreBranch[],
  RO: roBranches as PhysicalStoreBranch[],
  GB: gbBranches as PhysicalStoreBranch[],
  US: usBranches as PhysicalStoreBranch[],
};

// Import base products from JSON file
import baseProductsDb from "@/data/base-products.json";
const BASE_PRODUCTS_DB: Product[] = baseProductsDb as Product[];

const ALL_COUNTRIES: CountryCode[] = ["CH", "DE", "FR", "RO", "GB", "US"];
/** Fashion/shoes are out of CH launch scope (wrong wearables mapping). */
const NON_CH_COUNTRIES: CountryCode[] = ALL_COUNTRIES.filter((code) => code !== "CH");

/**
 * Generate localized offers dynamically for a given product and user location
 */
function generateOffersForLocation(product: Product, userLocation: UserLocation) {
  const country = userLocation.countryCode;
  const currInfo = COUNTRIES[country] || COUNTRIES.CH;
  const currency = currInfo.currency;

  // Base pricing multipliers per country based on purchasing power & tax
  const countryPriceMultiplier: Record<CountryCode, number> = {
    CH: 1.15, // Higher price in CHF
    DE: 1.0,  // Standard EUR
    FR: 1.02, // EUR
    RO: 4.98, // RON rate approx
    GB: 0.85, // GBP
    US: 1.05, // USD
  };

  const mult = countryPriceMultiplier[country] || 1.0;

  // Base price from product
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  // Get nearby physical stores for this country
  const stores = STORE_BRANCHES[country] || STORE_BRANCHES.CH;

  // Calculate distance for each store from user's GPS
  const storesWithDistance = stores.map((store) => {
    const dist = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.latitude,
      store.longitude
    );
    return { ...store, distanceKm: dist };
  }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const closestStore = storesWithDistance[0];

  // Offers per country
  if (country === "CH") {
    return [
      {
        id: `${product.id}-digitec`,
        storeName: "Digitec.ch",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Pick up in 15 min or Tomorrow",
        deliveryCost: 0,
        purchaseUrl: `https://www.digitec.ch/en/search?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Galaxus Merchant Network",
        type: "local_pickup" as const,
        nearbyBranch: closestStore ? { ...closestStore, storeName: "Digitec" } : undefined,
        badge: closestStore ? `Closest Store (${closestStore.distanceKm} km away)` : "Local Pick & Collect",
      },
      {
        id: `${product.id}-galaxus`,
        storeName: "Galaxus.ch",
        price: Math.round(targetPrice * 0.98),
        originalPrice: Math.round(targetPrice * 1.05),
        currency,
        inStock: true,
        deliveryTime: "Free Home Delivery Tomorrow",
        deliveryCost: 0,
        purchaseUrl: `https://www.galaxus.ch/en/search?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Galaxus Partner Program",
        type: "online" as const,
        badge: "Cheapest in Switzerland 🇨🇭",
      },
      {
        id: `${product.id}-brack`,
        storeName: "Brack.ch",
        price: Math.round(targetPrice * 1.01),
        currency,
        inStock: true,
        deliveryTime: "Same-Day Delivery (Ordered by 17:00)",
        deliveryCost: 0,
        purchaseUrl: `https://www.brack.ch/search?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN Switzerland",
        type: "online" as const,
      },
      {
        id: `${product.id}-amazon-de-ch`,
        storeName: "Amazon.de (Delivered to CH)",
        price: Math.round(targetPrice * 0.92),
        currency,
        inStock: true,
        deliveryTime: "2-3 Days (Swiss Customs Cleared)",
        deliveryCost: 9.9,
        purchaseUrl: `https://www.amazon.de/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates DE/CH",
        type: "cross_border" as const,
        badge: "Cross-Border Tax-Free Deal",
      },
    ];
  }

  if (country === "DE") {
    return [
      {
        id: `${product.id}-amazon-de`,
        storeName: "Amazon.de",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Tomorrow with Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.de/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates DE",
        type: "online" as const,
        badge: "Bestseller in Germany 🇩🇪",
      },
      {
        id: `${product.id}-mediamarkt-de`,
        storeName: "MediaMarkt DE",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "Click & Collect in 30 mins",
        deliveryCost: 0,
        purchaseUrl: `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN Germany",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Pickup at ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-otto`,
        storeName: "Otto.de",
        price: Math.round(targetPrice * 0.99),
        currency,
        inStock: true,
        deliveryTime: "2-3 Work Days",
        deliveryCost: 4.95,
        purchaseUrl: `https://www.otto.de/suche/${encodeURIComponent(product.title)}/`,
        affiliateNetwork: "AWIN Germany",
        type: "online" as const,
      },
    ];
  }

  if (country === "FR") {
    return [
      {
        id: `${product.id}-amazon-fr`,
        storeName: "Amazon.fr",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Livraison Demain avec Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates FR",
        type: "online" as const,
        badge: "Le Moins Cher en France 🇫🇷",
      },
      {
        id: `${product.id}-fnac`,
        storeName: "Fnac.com",
        price: Math.round(targetPrice * 1.03),
        currency,
        inStock: true,
        deliveryTime: "Retrait 1h en Magasin",
        deliveryCost: 0,
        purchaseUrl: `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0&Search=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN France",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Retrait ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-cdiscount`,
        storeName: "Cdiscount",
        price: Math.round(targetPrice * 0.97),
        currency,
        inStock: true,
        deliveryTime: "Livraison 24h",
        deliveryCost: 3.99,
        purchaseUrl: `https://www.cdiscount.com/search/10/${encodeURIComponent(product.title)}.html`,
        affiliateNetwork: "Effinity France",
        type: "online" as const,
      },
    ];
  }

  if (country === "RO") {
    return [
      {
        id: `${product.id}-emag`,
        storeName: "eMAG.ro",
        price: targetPrice,
        originalPrice: Math.round(targetPrice * 1.1),
        currency,
        inStock: true,
        deliveryTime: "Livrare Mâine la Easybox",
        deliveryCost: 9.99,
        purchaseUrl: `https://www.emag.ro/search/${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant / Profitshare Romania",
        type: "online" as const,
        badge: "Cel Mai Bun Preț în România 🇷🇴",
      },
      {
        id: `${product.id}-altex`,
        storeName: "Altex.ro",
        price: Math.round(targetPrice * 0.99),
        currency,
        inStock: true,
        deliveryTime: "Ridicare din Magazin în 2 Ore",
        deliveryCost: 0,
        purchaseUrl: `https://altex.ro/cauta/?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant Romania",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Ridică din ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-flanco`,
        storeName: "Flanco.ro",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "1-2 Zile Lucrătoare",
        deliveryCost: 15,
        purchaseUrl: `https://www.flanco.ro/catalogsearch/result/?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant Romania",
        type: "online" as const,
      },
    ];
  }

  if (country === "GB") {
    return [
      {
        id: `${product.id}-amazon-uk`,
        storeName: "Amazon.co.uk",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Free One-Day Delivery with Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.co.uk/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates UK",
        type: "online" as const,
        badge: "Top Deal UK 🇬🇧",
      },
      {
        id: `${product.id}-currys`,
        storeName: "Currys",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "Click & Collect in 1 Hour",
        deliveryCost: 0,
        purchaseUrl: `https://www.currys.co.uk/search?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN UK",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Collect at ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
    ];
  }

  // Fallback / US
  return [
    {
      id: `${product.id}-amazon-us`,
      storeName: "Amazon.com",
      price: targetPrice,
      currency,
      inStock: true,
      deliveryTime: "FREE Prime Delivery",
      deliveryCost: 0,
      purchaseUrl: `https://www.amazon.com/s?k=${encodeURIComponent(product.title)}`,
      affiliateNetwork: "Amazon Associates US",
      type: "online" as const,
      badge: "Best Seller US 🇺🇸",
    },
    {
      id: `${product.id}-bestbuy`,
      storeName: "Best Buy",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: "Store Pickup Today",
      deliveryCost: 0,
      purchaseUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product.title)}`,
      affiliateNetwork: "CJ Affiliate US",
      type: "local_pickup" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? `Store Pickup (${closestStore.distanceKm} miles)` : undefined,
    },
  ];
}

/**
 * Main API search & product fetcher by location
 */
export async function fetchProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string
): Promise<Product[]> {
  // Filter products matching search or category
  let filtered = BASE_PRODUCTS_DB.filter((p) =>
    p.targetCountries.includes(userLocation.countryCode)
  );

  if (category && category !== ALL_CATEGORIES_ID) {
    filtered = filtered.filter((p) => productMatchesCategoryFilter(p, category));
  }

  if (query && query.trim() !== "") {
    filtered = filtered.filter((p) => productMatchesSearchQuery(p, query));
  }

  // Hydrate each product with dynamic country-specific offers based on GPS
  return filtered.map((prod) => {
    const offers = generateOffersForLocation(prod, userLocation).map((offer) => ({
      ...offer,
      source: "demo" as const,
    }));
    return {
      ...prod,
      offers,
      catalogSource: "demo" as const,
    };
  });
}
