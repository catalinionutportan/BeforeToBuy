import { CountryCode, Offer, PhysicalStoreBranch, Product, UserLocation } from "@/types";
import { COUNTRIES } from "./countries";
import { calculateHaversineDistance } from "./geolocation";
import { productMatchesCategoryFilter, ALL_CATEGORIES_ID } from "./categories";
import { productMatchesSearchQuery } from "./product-search";
import { getChOffers } from "./offers/ch-offers";
import { getDeOffers } from "./offers/de-offers";
import { getFrOffers } from "./offers/fr-offers";
import { getRoOffers } from "./offers/ro-offers";
import { getGbOffers } from "./offers/gb-offers";
import { getUsOffers } from "./offers/us-offers";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";
import chBranches from "@/data/store-branches-ch.json";
import deBranches from "@/data/store-branches-de.json";
import frBranches from "@/data/store-branches-fr.json";
import roBranches from "@/data/store-branches-ro.json";
import gbBranches from "@/data/store-branches-gb.json";
import usBranches from "@/data/store-branches-us.json";
import { fetchBaseProducts } from "./product-data";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";

export async function fetchCountryPriceMultipliers(): Promise<Record<CountryCode, number>> {
  return countryPriceMultipliers as Record<CountryCode, number>;
}

const STORE_BRANCHES: Record<CountryCode, PhysicalStoreBranch[]> = {
  CH: chBranches as PhysicalStoreBranch[],
  DE: deBranches as PhysicalStoreBranch[],
  FR: frBranches as PhysicalStoreBranch[],
  RO: roBranches as PhysicalStoreBranch[],
  GB: gbBranches as PhysicalStoreBranch[],
  US: usBranches as PhysicalStoreBranch[],
};

type OfferLoader = (
  product: Product,
  userLocation: UserLocation,
  closestStore: PhysicalStoreBranch,
  locale: SiteLocale
) => Promise<Offer[]>;

const OFFER_LOADERS: Record<CountryCode, OfferLoader> = {
  CH: getChOffers,
  DE: getDeOffers,
  FR: getFrOffers,
  RO: getRoOffers,
  GB: getGbOffers,
  US: getUsOffers,
};

function allowDemoFallbackOffers(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_DEFAULT_OFFERS === "1";
}

/**
 * Demo country offer generator. Production catalog primarily comes from merchant feeds.
 */
export async function generateOffersForLocation(
  product: Product,
  userLocation: UserLocation,
  locale: SiteLocale = DEFAULT_LOCALE
): Promise<Offer[]> {
  const country = userLocation.countryCode;
  const currInfo = COUNTRIES[country] || COUNTRIES.CH;
  const currency = currInfo.currency;
  const mult = (await fetchCountryPriceMultipliers())[country] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  const stores = STORE_BRANCHES[country] || STORE_BRANCHES.CH;
  const storesWithDistance = stores
    .map((store) => {
      const dist = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude
      );
      return { ...store, distanceKm: dist };
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const closestStore = storesWithDistance[0] ?? stores[0];
  if (!closestStore) {
    return [];
  }

  const loader = OFFER_LOADERS[country] ?? OFFER_LOADERS.US;
  let initialOffers: Offer[] = [];
  try {
    initialOffers = await loader(product, userLocation, closestStore, locale);
  } catch (error) {
    console.error(`[api-aggregator] offer loader failed for ${country}:`, error);
    initialOffers = [];
  }

  const enrichedOffers = initialOffers.map((offer) => ({
    ...offer,
    price: targetPrice,
    currency,
  }));

  if (enrichedOffers.length === 0 && allowDemoFallbackOffers()) {
    return [
      {
        id: `${product.id}-${country}-default-offer`,
        storeName: `Default Store ${country}`,
        price: targetPrice,
        currency,
        inStock: true,
        deliveryCost: 0,
        purchaseUrl: `http://example.com/default-offer/${product.id}`,
        affiliateNetwork: "Demo",
        source: "demo" as const,
        type: "online" as const,
        deliveryTime: "instant",
      },
    ];
  }

  return enrichedOffers;
}

export async function fetchProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string,
  locale: SiteLocale = DEFAULT_LOCALE
): Promise<Product[]> {
  const allBaseProducts = await fetchBaseProducts(locale);

  let filtered = allBaseProducts.filter((p) =>
    p.targetCountries.includes(userLocation.countryCode)
  );

  if (category && category !== ALL_CATEGORIES_ID) {
    filtered = filtered.filter((p) => productMatchesCategoryFilter(p, category));
  }

  if (query && query.trim() !== "") {
    filtered = filtered.filter((p) => productMatchesSearchQuery(p, query));
  }

  return Promise.all(
    filtered.map(async (prod) => {
      try {
        const offers = (await generateOffersForLocation(prod, userLocation, locale)).map((offer) => ({
          ...offer,
          source: "demo" as const,
        }));
        return {
          ...prod,
          offers,
          catalogSource: "demo" as const,
        };
      } catch (error) {
        console.error(`[api-aggregator] product hydrate failed for ${prod.id}:`, error);
        return {
          ...prod,
          offers: [],
          catalogSource: "demo" as const,
        };
      }
    })
  );
}
