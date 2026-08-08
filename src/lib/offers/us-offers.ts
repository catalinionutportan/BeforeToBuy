import { Offer, Product, UserLocation } from "@/types";
import { type SiteLocale } from "@/lib/i18n/locales";

/** US demo merchants disabled until partnership approval. */
export async function getUsOffers(
  _product: Product,
  _userLocation: UserLocation,
  _closestStore: unknown,
  _locale?: SiteLocale
): Promise<Offer[]> {
  return [];
}
