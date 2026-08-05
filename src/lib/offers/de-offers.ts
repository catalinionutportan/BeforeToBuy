import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { fetchAmazonOffers } from "@/lib/affiliate-apis/amazon";
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

export async function getDeOffers(
  product: Product,
  userLocation: UserLocation,
  closestStore: any,
  locale: SiteLocale = DEFAULT_LOCALE
): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.DE;
  const currency = currInfo.currency;
  const ui = HOME_UI[locale];

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  const amazonOffers = await fetchAmazonOffers(product, userLocation);

  return [
    ...amazonOffers,
    {
      id: `${product.id}-mediamarkt-de`,
      storeName: "MediaMarkt DE",
      price: Math.round(targetPrice * 1.02),
      currency,
      inStock: true,
      deliveryTime: "Click & Collect in 30 mins",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(product.title)}`) ? `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "AWIN Germany",
      type: "local_pickup" as const,
      source: "demo" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? formatUi(`${ui.pickupAt} {branchName} — {distanceKm} ${ui.kmAway}`, { branchName: closestStore.branchName, distanceKm: closestStore.distanceKm }) : undefined,
    },
    {
      id: `${product.id}-otto`,
      storeName: "Otto.de",
      price: Math.round(targetPrice * 0.99),
      currency,
      inStock: true,
      deliveryTime: "2-3 work days",
      deliveryCost: 4.95,
      purchaseUrl: isValidHttpUrl(`https://www.otto.de/suche/${encodeURIComponent(product.title)}/`) ? `https://www.otto.de/suche/${encodeURIComponent(product.title)}/` : "#",
      affiliateNetwork: "AWIN Germany",
      type: "online" as const,
      source: "demo" as const,
    },
  ];
}
