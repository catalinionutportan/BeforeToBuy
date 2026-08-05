import {
  defaultLocaleFromCountry,
  normalizeLocale,
  type SiteLocale,
} from "@/lib/i18n/locales";
import type { CountryCode } from "@/types";

export const LANG_STORAGE_KEY = "btb-ui-lang";
export const LANG_QUERY_PARAM = "lang";

export function readStoredLocale(): SiteLocale | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeLocale(window.localStorage.getItem(LANG_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: SiteLocale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, locale);
  } catch {
    // ignore quota / private mode
  }
}

export function resolveInitialLocale(countryCode: CountryCode): {
  locale: SiteLocale;
  explicit: boolean;
} {
  if (typeof window === "undefined") {
    return { locale: defaultLocaleFromCountry(countryCode), explicit: false };
  }

  const fromUrl = normalizeLocale(
    new URLSearchParams(window.location.search).get(LANG_QUERY_PARAM)
  );
  if (fromUrl) {
    writeStoredLocale(fromUrl);
    return { locale: fromUrl, explicit: true };
  }

  const stored = readStoredLocale();
  if (stored) return { locale: stored, explicit: true };

  return { locale: defaultLocaleFromCountry(countryCode), explicit: false };
}

export function syncLangQueryParam(locale: SiteLocale): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(LANG_QUERY_PARAM) === locale) return;
  url.searchParams.set(LANG_QUERY_PARAM, locale);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}
