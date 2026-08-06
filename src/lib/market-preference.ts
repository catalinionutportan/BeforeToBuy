import type { CountryCode } from "@/types";
import { COUNTRIES } from "@/lib/countries";

export const MARKET_COUNTRY_STORAGE_KEY = "btb-market-country";

export function isCountryCode(value: string | null | undefined): value is CountryCode {
  return Boolean(value && Object.prototype.hasOwnProperty.call(COUNTRIES, value));
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
}
