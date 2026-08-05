import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { fetchAmazonOffers } from "@/lib/affiliate-apis/amazon";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export async function getUsOffers(product: Product, userLocation: UserLocation, closestStore: any): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.US;
  const currency = currInfo.currency;

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  const amazonOffers = await fetchAmazonOffers(product, userLocation);

  return [
    ...amazonOffers,
    {
      id: `${product.id}-bestbuy`,
      storeName: "Best Buy",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: "Store pickup today",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product.title)}`) ? `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "CJ Affiliate US",
      type: "local_pickup" as const,
      source: "demo" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? formatUi(`${HOME_UI[DEFAULT_LOCALE].storePickup} — {distanceKm} ${HOME_UI[DEFAULT_LOCALE].kmAway}`, { distanceKm: closestStore.distanceKm }) : undefined,
    },
  ];
}
