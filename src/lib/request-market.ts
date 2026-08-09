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
 * Preference: explicit market cookie, then Vercel's request country, then fallback.
 * Only the two-letter country code is read.
 */
export async function getRequestMarketCountry(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(MARKET_COUNTRY_COOKIE)?.value;
  if (isCountryCode(fromCookie)) return resolveBrowseCountry(fromCookie);

  const headerStore = await headers();
  const requestCountry = headerStore.get("x-vercel-ip-country")?.toUpperCase();
  if (isCountryCode(requestCountry)) return resolveBrowseCountry(requestCountry);

  return getPrimaryLiveBrowseCountry();
}
