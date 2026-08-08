import { cookies, headers } from "next/headers";
import type { CountryCode } from "@/types";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import {
  isCountryCode,
  MARKET_COUNTRY_COOKIE,
} from "@/lib/market-preference";

/**
 * Resolve the browse market for SSR category/compare pages.
 * Preference order: explicit cookie (synced from client) → edge geo → default.
 */
export async function getRequestMarketCountry(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(MARKET_COUNTRY_COOKIE)?.value;
  if (isCountryCode(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromGeo = headerStore.get("x-vercel-ip-country");
  if (isCountryCode(fromGeo)) return fromGeo;

  return DEFAULT_COUNTRY;
}
