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
 * Preference: cookie/geo when that market has live feeds → primary live (RO).
 * Stale CH cookies must not empty the catalogue (0 CH feeds today).
 */
export async function getRequestMarketCountry(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(MARKET_COUNTRY_COOKIE)?.value;
  if (isCountryCode(fromCookie)) return resolveBrowseCountry(fromCookie);

  const headerStore = await headers();
  const fromGeo = headerStore.get("x-vercel-ip-country");
  if (isCountryCode(fromGeo)) return resolveBrowseCountry(fromGeo);

  return getPrimaryLiveBrowseCountry();
}
