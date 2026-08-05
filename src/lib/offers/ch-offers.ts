import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { calculateHaversineDistance } from "@/lib/geolocation";
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

export async function getChOffers(product: Product, userLocation: UserLocation, closestStore: any): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const currency = currInfo.currency;

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  return [
    // TODO: Add Amazon.de cross-border offer for CH here, calling fetchAmazonOffers
    {
      id: `${product.id}-digitec`,
      storeName: "Digitec.ch",
      price: targetPrice,
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].pickUpIn15MinOrTomorrow, {}),
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.digitec.ch/en/search?q=${encodeURIComponent(product.title)}`) ? `https://www.digitec.ch/en/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "Galaxus Merchant Network",
      type: "local_pickup" as const,
      nearbyBranch: closestStore ? { ...closestStore, storeName: "Digitec" } : undefined,
      badge: closestStore ? formatUi(HOME_UI[DEFAULT_LOCALE].closestStoreKmAway, { distanceKm: closestStore.distanceKm }) : HOME_UI[DEFAULT_LOCALE].localPickAndCollect,
    },
    {
      id: `${product.id}-galaxus`,
      storeName: "Galaxus.ch",
      price: Math.round(targetPrice * 0.98),
      originalPrice: Math.round(targetPrice * 1.05),
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].freeHomeDeliveryTomorrow, {}),
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.galaxus.ch/en/search?q=${encodeURIComponent(product.title)}`) ? `https://www.galaxus.ch/en/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "Galaxus Partner Program",
      type: "online" as const,
      badge: HOME_UI[DEFAULT_LOCALE].cheapestInSwitzerland,
    },
    {
      id: `${product.id}-brack`,
      storeName: "Brack.ch",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].sameDayDelivery, {}),
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.brack.ch/search?q=${encodeURIComponent(product.title)}`) ? `https://www.brack.ch/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "AWIN Switzerland",
      type: "online" as const,
    },
  ];
}
