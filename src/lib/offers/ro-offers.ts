import { Offer, Product, UserLocation } from "@/types";
import type { SiteLocale } from "@/lib/i18n/locales";

/**
 * Demo/synthetic RO offers are disabled.
 * Live RO catalog comes from merchant product feeds (currently Rowenta via 2Performant).
 * Re-add a store here only together with its affiliate link + feed wiring.
 */
export async function getRoOffers(
  _product: Product,
  _userLocation: UserLocation,
  _closestStore: unknown,
  _locale?: SiteLocale
): Promise<Offer[]> {
  return [];
}
