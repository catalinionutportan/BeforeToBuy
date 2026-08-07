import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { fetchMergedProductsForLocation } from "@/lib/product-service";

export function getBrowseLocationForCountry(countryCode: CountryCode): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  return {
    latitude: country.defaultCoordinates.lat,
    longitude: country.defaultCoordinates.lng,
    countryCode: country.code,
    countryName: country.name,
    city: country.defaultCoordinates.city,
    isGps: false,
  };
}

export function getDefaultBrowseLocation(): UserLocation {
  return getBrowseLocationForCountry(DEFAULT_COUNTRY);
}

export async function fetchCatalogForCountry(countryCode: CountryCode, category?: string) {
  return fetchMergedProductsForLocation(
    getBrowseLocationForCountry(countryCode),
    undefined,
    category
  );
}

export async function fetchDefaultCatalog(category?: string) {
  return fetchCatalogForCountry(DEFAULT_COUNTRY, category);
}
