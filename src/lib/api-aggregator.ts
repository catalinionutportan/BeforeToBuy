import { CountryCode, Offer, Product, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "./countries";
import { getChOffers } from "./offers/ch-offers";
import { getDeOffers } from "./offers/de-offers";
import { getFrOffers } from "./offers/fr-offers";
import { getRoOffers } from "./offers/ro-offers";
import { getGbOffers } from "./offers/gb-offers";
import { getUsOffers } from "./offers/us-offers";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";

export async function fetchCountryPriceMultipliers(): Promise<Record<CountryCode, number>> {
  return countryPriceMultipliers as Record<CountryCode, number>;
}

type OfferLoader = (
  product: Product,
  userLocation: UserLocation,
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
  // Hard-off: no synthetic "Default Store" / demo merchants in the app.
  return process.env.ALLOW_DEMO_DEFAULT_OFFERS === "1";
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
  const currInfo = COUNTRIES[country] || COUNTRIES[DEFAULT_COUNTRY];
  const currency = currInfo.currency;
  const mult = (await fetchCountryPriceMultipliers())[country] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  const loader = OFFER_LOADERS[country] ?? OFFER_LOADERS.US;
  let initialOffers: Offer[] = [];
  try {
    initialOffers = await loader(product, userLocation, locale);
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
  _userLocation: UserLocation,
  _query?: string,
  _category?: string,
  _locale: SiteLocale = DEFAULT_LOCALE
): Promise<Product[]> {
  // Demo / hardcoded catalog removed. Products come only from enabled merchant feeds
  // (currently Rowenta + Scule365 via 2Performant). Re-add demo hydration only if needed for tests.
  return [];
}
