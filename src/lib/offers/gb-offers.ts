import { Offer, Product, UserLocation } from "@/types";
import { type SiteLocale } from "@/lib/i18n/locales";

/** GB demo merchants disabled until partnership approval. */
export async function getGbOffers(
  _product: Product,
  _userLocation: UserLocation,
  _locale?: SiteLocale
): Promise<Offer[]> {
  return [];
}
