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

export async function getRoOffers(product: Product, userLocation: UserLocation, closestStore: any): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.RO;
  const currency = currInfo.currency;

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  return [
    // TODO: Add Amazon.de cross-border offer for RO here, calling fetchAmazonOffers
    {
      id: `${product.id}-emag`,
      storeName: "eMAG.ro",
      price: targetPrice,
      originalPrice: Math.round(targetPrice * 1.1),
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].livrareMaineLaEasybox, {}),
      deliveryCost: 9.99,
      purchaseUrl: isValidHttpUrl(`https://www.emag.ro/search/${encodeURIComponent(product.title)}`) ? `https://www.emag.ro/search/${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "2Performant / Profitshare Romania",
      type: "online" as const,
      badge: HOME_UI[DEFAULT_LOCALE].celMaiBunPretInRomania,
    },
    {
      id: `${product.id}-altex`,
      storeName: "Altex.ro",
      price: Math.round(targetPrice * 0.99),
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].ridicareDinMagazinIn2Ore, {}),
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://altex.ro/cauta/?q=${encodeURIComponent(product.title)}`) ? `https://altex.ro/cauta/?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "2Performant Romania",
      type: "local_pickup" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? formatUi(HOME_UI[DEFAULT_LOCALE].ridicaDinKmAway, { branchName: closestStore.branchName, distanceKm: closestStore.distanceKm }) : undefined,
    },
    {
      id: `${product.id}-flanco`,
      storeName: "Flanco.ro",
      price: Math.round(targetPrice * 1.02),
      currency,
      inStock: true,
      deliveryTime: formatUi(HOME_UI[DEFAULT_LOCALE].oneToTwoWorkDays, {}),
      deliveryCost: 15,
      purchaseUrl: isValidHttpUrl(`https://www.flanco.ro/catalogsearch/result/?q=${encodeURIComponent(product.title)}`) ? `https://www.flanco.ro/catalogsearch/result/?q=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "2Performant Romania",
      type: "online" as const,
    },
  ];
}
