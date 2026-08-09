import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";
import type { ProductListOptions } from "@/lib/product-list-options";
import { fetchMergedProductsForLocation } from "@/lib/product-service";

export function getBrowseLocationForCountry(countryCode: CountryCode): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[getPrimaryLiveBrowseCountry()];
  return {
    countryCode: country.code,
    countryName: country.name,
  };
}

export function getDefaultBrowseLocation(): UserLocation {
  return getBrowseLocationForCountry(getPrimaryLiveBrowseCountry());
}

export async function fetchCatalogForCountry(
  countryCode: CountryCode,
  category?: string,
  listOptions?: ProductListOptions
) {
  return fetchMergedProductsForLocation(
    getBrowseLocationForCountry(countryCode),
    undefined,
    category,
    undefined,
    listOptions
  );
}

/** Sitemap / fallbacks — use primary live market (RO), not empty CH default. */
export async function fetchDefaultCatalog(
  category?: string,
  listOptions?: ProductListOptions
) {
  return fetchCatalogForCountry(getPrimaryLiveBrowseCountry(), category, listOptions);
}
