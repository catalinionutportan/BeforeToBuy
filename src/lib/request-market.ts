import { cookies, headers } from "next/headers";
import type { CountryCode } from "@/types";
import {
  countryHasLiveFeeds,
  getPrimaryLiveBrowseCountry,
} from "@/lib/live-browse-market";
import {
  isCountryCode,
  MARKET_COUNTRY_COOKIE,
} from "@/lib/market-preference";

/**
 * Resolve the browse market for SSR category/compare/home pages.
 * Preference: explicit cookie → geo (only if that market has live feeds) →
 * primary live feed country (RO today). Avoids empty CH SSR for new visitors.
 */
export async function getRequestMarketCountry(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(MARKET_COUNTRY_COOKIE)?.value;
  if (isCountryCode(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromGeo = headerStore.get("x-vercel-ip-country");
  if (isCountryCode(fromGeo) && countryHasLiveFeeds(fromGeo)) return fromGeo;

  return getPrimaryLiveBrowseCountry();
}
