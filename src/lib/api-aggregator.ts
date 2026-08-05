import { CountryCode, PhysicalStoreBranch, Product, UserLocation } from "@/types";
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
const NON_CH_COUNTRIES: CountryCode[] = ALL_COUNTRIES.filter((code) => code !== "CH");

/**
 * TODO: Refactor generateOffersForLocation to fetch offers from real affiliate APIs/databases
 * instead of hardcoded logic, for production use. The current implementation is for demo purposes.
 */
import countryPriceMultipliers from "@/data/country-price-multipliers.json";

async function generateOffersForLocation(product: Product, userLocation: UserLocation) {
  const country = userLocation.countryCode;
  const currInfo = COUNTRIES[country] || COUNTRIES.CH;
  const currency = currInfo.currency;

  // Base pricing multipliers per country based on purchasing power & tax
  const countryPriceMultiplier: Record<CountryCode, number> = countryPriceMultipliers;

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

  // Offers per country
  switch (country) {
    case "CH":
      return await getChOffers(product, userLocation, closestStore);
    case "DE":
      return await getDeOffers(product, userLocation, closestStore);
    case "FR":
      return await getFrOffers(product, userLocation, closestStore);
    case "RO":
      return await getRoOffers(product, userLocation, closestStore);
    case "GB":
      return await getGbOffers(product, userLocation, closestStore);
    case "US":
    default:
      return await getUsOffers(product, userLocation, closestStore);
  }
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
  });
}
