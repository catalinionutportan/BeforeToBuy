import { Offer, Product, UserLocation } from "@/types";
import { type SiteLocale } from "@/lib/i18n/locales";

/** DE demo merchants disabled until partnership approval. */
export async function getDeOffers(
  _product: Product,
  _userLocation: UserLocation,
  _locale?: SiteLocale
): Promise<Offer[]> {
  return [];
}
