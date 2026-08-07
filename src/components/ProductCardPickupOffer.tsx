import { UserLocation, Offer } from "@/types";
import type { SiteLocale } from "@/lib/i18n/locales";

interface ProductCardPickupOfferProps {
  pickupOffer?: Offer;
  userLocation: UserLocation;
  locale?: SiteLocale;
}

/** “Near you” / click & collect UI retired — too hard to maintain across markets. */
export function ProductCardPickupOffer(_props: ProductCardPickupOfferProps) {
  return null;
}
