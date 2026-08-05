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

export async function getFrOffers(product: Product, userLocation: UserLocation, closestStore: any): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.FR;
  const currency = currInfo.currency;

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  const amazonOffers = await fetchAmazonOffers(product, userLocation);

  return [
    ...amazonOffers,
    {
      id: `${product.id}-fnac`,
      storeName: "Fnac.com",
      price: Math.round(targetPrice * 1.03),
      currency,
      inStock: true,
      deliveryTime: "Retrait 1h en magasin",
      deliveryCost: 0,
      purchaseUrl: isValidHttpUrl(`https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0&Search=${encodeURIComponent(product.title)}`) ? `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0&Search=${encodeURIComponent(product.title)}` : "#",
      affiliateNetwork: "AWIN France",
      type: "local_pickup" as const,
      source: "demo" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? formatUi(`${HOME_UI[DEFAULT_LOCALE].retrait} {branchName} — {distanceKm} ${HOME_UI[DEFAULT_LOCALE].kmAway}`, { branchName: closestStore.branchName, distanceKm: closestStore.distanceKm }) : undefined,
    },
    {
      id: `${product.id}-cdiscount`,
      storeName: "Cdiscount",
      price: Math.round(targetPrice * 0.97),
      currency,
      inStock: true,
      deliveryTime: "Livraison 24h",
      deliveryCost: 3.99,
      purchaseUrl: isValidHttpUrl(`https://www.cdiscount.com/search/10/${encodeURIComponent(product.title)}.html`) ? `https://www.cdiscount.com/search/10/${encodeURIComponent(product.title)}.html` : "#",
      affiliateNetwork: "Effinity France",
      type: "online" as const,
      source: "demo" as const,
    },
  ];
}
