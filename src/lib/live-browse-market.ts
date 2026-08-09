import type { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { getEnabledMerchantFeeds } from "@/lib/merchant-integrations";

/** True when at least one enabled product feed exists for the country. */
export function countryHasLiveFeeds(countryCode: CountryCode): boolean {
  return getEnabledMerchantFeeds().some((feed) => feed.country === countryCode);
}

/**
 * Markets the UI may browse even when request-path CSV feeds are disabled.
 * RO is served from Supabase (offline import); GB still uses AWIN when enabled.
 */
export function countryHasBrowseCatalogue(countryCode: CountryCode): boolean {
  if (countryHasLiveFeeds(countryCode)) return true;
  // RO catalogues are imported into Supabase — not loaded via merchant-feeds on request.
  if (countryCode === "RO") return true;
  return false;
}

/**
 * Primary browse market while CH (and other) catalogues await approval.
 * Prefer RO (Supabase / live); otherwise first enabled feed country; else DEFAULT_COUNTRY.
 */
export function getPrimaryLiveBrowseCountry(): CountryCode {
  if (countryHasBrowseCatalogue("RO")) return "RO";
  const enabled = getEnabledMerchantFeeds();
  if (enabled.some((feed) => feed.country === "GB")) return "GB";
  if (enabled[0]?.country) return enabled[0].country;
  return DEFAULT_COUNTRY;
}

/** Use a supported preferred market, even when its catalogue is currently empty. */
export function resolveBrowseCountry(
  preferred: CountryCode | null | undefined
): CountryCode {
  if (preferred && Object.prototype.hasOwnProperty.call(COUNTRIES, preferred)) {
    return preferred;
  }
  return getPrimaryLiveBrowseCountry();
}
