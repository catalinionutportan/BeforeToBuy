import type { CountryCode } from "@/types";
import { COUNTRIES } from "@/lib/countries";

export const MARKET_COUNTRY_STORAGE_KEY = "btb-market-country";
/** Same value as localStorage — readable on the server for category SSR. */
export const MARKET_COUNTRY_COOKIE = "btb-market-country";
const MARKET_COUNTRY_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export function isCountryCode(value: string | null | undefined): value is CountryCode {
  return Boolean(value && Object.prototype.hasOwnProperty.call(COUNTRIES, value));
}

function writeMarketCountryCookie(countryCode: CountryCode): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${MARKET_COUNTRY_COOKIE}=${encodeURIComponent(countryCode)}; Path=/; Max-Age=${MARKET_COUNTRY_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function readStoredMarketCountry(): CountryCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MARKET_COUNTRY_STORAGE_KEY);
    return isCountryCode(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredMarketCountry(countryCode: CountryCode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKET_COUNTRY_STORAGE_KEY, countryCode);
  } catch {
    // ignore quota / private mode
  }
  writeMarketCountryCookie(countryCode);
}
