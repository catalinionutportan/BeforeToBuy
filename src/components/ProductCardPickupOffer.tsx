import { UserLocation, Offer } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { MapPin } from "lucide-react";

interface ProductCardPickupOfferProps {
  pickupOffer?: Offer;
  userLocation: UserLocation;
  locale?: SiteLocale;
}

export function ProductCardPickupOffer({
  pickupOffer,
  userLocation,
  locale,
}: ProductCardPickupOfferProps) {
  const ui = HOME_UI[locale ?? defaultLocaleFromCountry(userLocation.countryCode)];

  if (!pickupOffer || !pickupOffer.nearbyBranch) {
    return null;
  }

  return (
    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
          <span>{ui.clickAndCollectIn} {userLocation.city}</span>
          <span className="bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
            {pickupOffer.nearbyBranch.distanceKm} {ui.kmAway}
          </span>
        </div>
        <p className="text-emerald-800 text-[11px] mt-0.5">
          {pickupOffer.nearbyBranch.storeName} - {pickupOffer.nearbyBranch.branchName}
        </p>
      </div>
    </div>
  );
}
