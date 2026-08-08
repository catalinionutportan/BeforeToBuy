import type { CountryCode } from "@/types";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { getEnabledMerchantFeeds } from "@/lib/merchant-integrations";

/** True when at least one enabled product feed exists for the country. */
export function countryHasLiveFeeds(countryCode: CountryCode): boolean {
  return getEnabledMerchantFeeds().some((feed) => feed.country === countryCode);
}

/**
 * Primary browse market while CH (and other) catalogues await approval.
 * Prefer RO when live; otherwise first enabled feed country; else DEFAULT_COUNTRY.
 */
export function getPrimaryLiveBrowseCountry(): CountryCode {
  const enabled = getEnabledMerchantFeeds();
  if (enabled.some((feed) => feed.country === "RO")) return "RO";
  if (enabled.some((feed) => feed.country === "GB")) return "GB";
  if (enabled[0]?.country) return enabled[0].country;
  return DEFAULT_COUNTRY;
}
