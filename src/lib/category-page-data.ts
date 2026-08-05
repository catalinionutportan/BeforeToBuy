import { UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchMergedProductsForLocation } from "@/lib/product-service";

export function getDefaultBrowseLocation(): UserLocation {
  const country = COUNTRIES[DEFAULT_COUNTRY];
  return {
    latitude: country.defaultCoordinates.lat,
    longitude: country.defaultCoordinates.lng,
    countryCode: country.code,
    countryName: country.name,
    city: country.defaultCoordinates.city,
    isGps: false,
  };
}

export async function fetchDefaultCatalog(category?: string) {
  return fetchMergedProductsForLocation(getDefaultBrowseLocation(), undefined, category);
}
