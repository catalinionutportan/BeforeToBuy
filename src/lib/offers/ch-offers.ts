import { Offer, Product, UserLocation } from "@/types";
import { type SiteLocale } from "@/lib/i18n/locales";

/**
 * CH demo/sample merchant offers are disabled until partnership approval.
 * Re-enable Digitec / Galaxus / Brack (etc.) only after signed agreements.
 */
export async function getChOffers(
  _product: Product,
  _userLocation: UserLocation,
  _locale?: SiteLocale
): Promise<Offer[]> {
  return [];
}
