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

/**
 * Use the preferred market only when it has live feeds; otherwise RO (or next live).
 * Prevents empty CH/DE catalogues from cookie, IP geo, or DEFAULT_COUNTRY=CH.
 */
export function resolveBrowseCountry(
  preferred: CountryCode | null | undefined
): CountryCode {
  if (preferred && countryHasLiveFeeds(preferred)) return preferred;
  return getPrimaryLiveBrowseCountry();
}
