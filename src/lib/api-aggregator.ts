import { CountryCode, Offer, PhysicalStoreBranch, Product, UserLocation } from "@/types";
import { COUNTRIES } from "./countries";
import { calculateHaversineDistance } from "./geolocation";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "./categories";
import { productMatchesSearchQuery } from "./product-search";
import { fetchAmazonOffers } from "./affiliate-apis/amazon";
import { getChOffers } from "./offers/ch-offers";
import { getDeOffers } from "./offers/de-offers";
import { getFrOffers } from "./offers/fr-offers";
import { getRoOffers } from "./offers/ro-offers";
import { getGbOffers } from "./offers/gb-offers";
import { getUsOffers } from "./offers/us-offers";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";

export async function fetchCountryPriceMultipliers(): Promise<Record<CountryCode, number>> {
  return countryPriceMultipliers as Record<CountryCode, number>;
}

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
import { fetchBaseProducts } from "./product-data";

const ALL_COUNTRIES: CountryCode[] = ["CH", "DE", "FR", "RO", "GB", "US"];
const NON_CH_COUNTRIES: CountryCode[] = ALL_COUNTRIES.filter((code) => code !== "CH");

/**
 * TODO: Refactor generateOffersForLocation to fetch offers from real affiliate APIs/databases
 * instead of hardcoded logic, for production use. The current implementation is for demo purposes.
 */
export async function generateOffersForLocation(product: Product, userLocation: UserLocation) {
  const country = userLocation.countryCode;
  const currInfo = COUNTRIES[country] || COUNTRIES.CH;
  const currency = currInfo.currency;

  // Base pricing multipliers per country based on purchasing power & tax
  const mult = (await fetchCountryPriceMultipliers())[country] || 1.0;

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

  // Basic URL validation
  function isValidHttpUrl(string: string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  let initialOffers: Offer[] = [];
  switch (country) {
    case "CH":
      initialOffers = await getChOffers(product, userLocation, closestStore);
      break;
    case "DE":
      initialOffers = await getDeOffers(product, userLocation, closestStore);
      break;
    case "FR":
      initialOffers = await getFrOffers(product, userLocation, closestStore);
      break;
    case "RO":
      initialOffers = await getRoOffers(product, userLocation, closestStore);
      break;
    case "GB":
      initialOffers = await getGbOffers(product, userLocation, closestStore);
      break;
    case "US":
    default:
      initialOffers = await getUsOffers(product, userLocation, closestStore);
      break;
  }

  const enrichedOffers = initialOffers.map(offer => ({
    ...offer,
    price: targetPrice,
    currency: currency,
  }));

  if (enrichedOffers.length === 0) {
      return [{
          id: `${product.id}-${country}-default-offer`,
          storeName: `Default Store ${country}`,
          price: targetPrice,
          currency: currency,
          inStock: true,
          deliveryCost: 0,
          purchaseUrl: `http://example.com/default-offer/${product.id}`,
          affiliateNetwork: "Demo",
          source: "demo" as const,
          type: "online" as const,
          deliveryTime: "instant",
      }];
  }

  return enrichedOffers;
}

/**
 * Main API search & product fetcher by location
 */
export async function fetchProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string
): Promise<Product[]> {
  const allBaseProducts = await fetchBaseProducts();

  // Filter products matching search or category
  let filtered = allBaseProducts.filter((p) =>
    p.targetCountries.includes(userLocation.countryCode)
  );

  if (category && category !== ALL_CATEGORIES_ID) {
    filtered = filtered.filter((p) => productMatchesCategoryFilter(p, category));
  }

  if (query && query.trim() !== "") {
    filtered = filtered.filter((p) => productMatchesSearchQuery(p, query));
  }

  // Hydrate each product with dynamic country-specific offers based on GPS
  return await Promise.all(filtered.map(async (prod) => {
    const offers = (await generateOffersForLocation(prod, userLocation)).map((offer) => ({
      ...offer,
      source: "demo" as const,
    }));
    return {
      ...prod,
      offers,
      catalogSource: "demo" as const,
    };
  }));
}
