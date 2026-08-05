import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { calculateHaversineDistance } from "@/lib/geolocation";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export async function getChOffers(
  product: Product,
  userLocation: UserLocation,
  closestStore: any,
  locale: SiteLocale = DEFAULT_LOCALE
): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const currency = currInfo.currency;
  const ui = HOME_UI[locale];

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
      deliveryTime: "Pick up in 15 min or tomorrow",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.digitec.ch/en/search?q=${encodeURIComponent(product.title)}`) ? `https://www.digitec.ch/en/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "Galaxus Merchant Network",
      type: "local_pickup" as const,
      source: "demo" as const,
      nearbyBranch: closestStore ? { ...closestStore, storeName: "Digitec" } : undefined,
      badge: closestStore ? formatUi(`${ui.clickAndCollectIn} {distanceKm} ${ui.kmAway}`, { distanceKm: closestStore.distanceKm }) : ui.localPickCollect,
    },
    {
      id: `${product.id}-galaxus`,
      storeName: "Galaxus.ch",
      price: Math.round(targetPrice * 0.98),
      originalPrice: Math.round(targetPrice * 1.05),
      currency,
      inStock: true,
      deliveryTime: "Free home delivery tomorrow",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.galaxus.ch/en/search?q=${encodeURIComponent(product.title)}`) ? `https://www.galaxus.ch/en/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "Galaxus Partner Program",
      type: "online" as const,
      source: "demo" as const,
      badge: ui.cheapestInSwitzerland,
    },
    {
      id: `${product.id}-brack`,
      storeName: "Brack.ch",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: "Same-day delivery",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.brack.ch/search?q=${encodeURIComponent(product.title)}`) ? `https://www.brack.ch/search?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "AWIN Switzerland",
      type: "online" as const,
      source: "demo" as const,
    },
  ];
}
