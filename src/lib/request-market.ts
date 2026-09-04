import { cookies, headers } from "next/headers";
import type { CountryCode } from "@/types";
import {
  getPrimaryLiveBrowseCountry,
  resolveBrowseCountry,
} from "@/lib/live-browse-market";
import {
  isCountryCode,
  MARKET_COUNTRY_COOKIE,
} from "@/lib/market-preference";

/**
 * Resolve the browse market for SSR category/compare/home pages.
 * Preference: explicit function argument or URL header, then market cookie,
 * trusted edge country header, and finally the live-catalogue fallback.
 * Only the two-letter country code is read.
 */
export async function getRequestMarketCountry(searchCountry?: string): Promise<CountryCode> {
  if (isCountryCode(searchCountry)) return resolveBrowseCountry(searchCountry);

  const headerStore = await headers();
  const fromQuery = headerStore.get("x-btb-market-country")?.toUpperCase();
  if (isCountryCode(fromQuery)) return resolveBrowseCountry(fromQuery);

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(MARKET_COUNTRY_COOKIE)?.value;
  if (isCountryCode(fromCookie)) return resolveBrowseCountry(fromCookie);

  const requestCountry = (
    headerStore.get("cf-ipcountry") ||
    headerStore.get("x-vercel-ip-country")
  )?.toUpperCase();
  if (isCountryCode(requestCountry)) return resolveBrowseCountry(requestCountry);

  return getPrimaryLiveBrowseCountry();
}
