import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
import countryPriceMultipliers from "@/data/country-price-multipliers.json";
import { HOME_UI } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";

export async function getRoOffers(
  product: Product,
  userLocation: UserLocation,
  _closestStore: unknown,
  locale: SiteLocale = DEFAULT_LOCALE
): Promise<Offer[]> {
  const currInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.RO;
  const currency = currInfo.currency;
  const ui = HOME_UI[locale];

  const countryPriceMultiplier: Record<string, number> = countryPriceMultipliers;
  const mult = countryPriceMultiplier[userLocation.countryCode] || 1.0;
  const basePrice = product.basePrice || 350;
  const targetPrice = Math.round(basePrice * mult);

  return [
    {
      id: `${product.id}-emag`,
      storeName: "eMAG.ro",
      price: targetPrice,
      originalPrice: Math.round(targetPrice * 1.1),
      currency,
      inStock: true,
      deliveryTime: "Livrare mâine la Easybox",
      deliveryCost: 9.99,
      purchaseUrl: AFFILIATE_LINKS.emagProfitshare,
      affiliateNetwork: "Profitshare Romania",
      type: "online" as const,
      source: "demo" as const,
      badge: ui.affiliateDemoOfferLabel,
    },
    {
      id: `${product.id}-evomag`,
      storeName: "evoMAG.ro",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: "1-3 zile lucrătoare",
      deliveryCost: 12.99,
      purchaseUrl: AFFILIATE_LINKS.evomag2Performant,
      affiliateNetwork: "2Performant Romania",
      type: "online" as const,
      source: "demo" as const,
      badge: ui.affiliateDemoOfferLabel,
    },
  ];
}
