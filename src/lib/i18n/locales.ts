import type { CountryCode } from "@/types";

/** UI languages supported site-wide (independent from shopping country). */
export type SiteLocale = "en" | "de" | "fr" | "it" | "ro";

export const SITE_LOCALES: readonly SiteLocale[] = ["en", "de", "fr", "it", "ro"] as const;

/** Swiss official languages + English. Language must NOT require changing country. */
export const SWISS_UI_LOCALES: readonly SiteLocale[] = ["de", "fr", "it", "en"] as const;

export const SITE_LOCALE_LABELS: Record<SiteLocale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  ro: "Română",
};

export function isSiteLocale(value: string | null | undefined): value is SiteLocale {
  return Boolean(value && (SITE_LOCALES as readonly string[]).includes(value));
}

export function normalizeLocale(value: string | null | undefined): SiteLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().slice(0, 2);
  return isSiteLocale(normalized) ? normalized : null;
}

/**
 * Languages offered in the switcher for the current shopping country.
 * CH keeps DE/FR/IT/EN without forcing France/Italy/etc. as the market.
 */
export function localesForCountry(countryCode: CountryCode): readonly SiteLocale[] {
  switch (countryCode) {
    case "CH":
      return SWISS_UI_LOCALES;
    case "DE":
      return ["de", "en"] as const;
    case "FR":
      return ["fr", "en"] as const;
    case "RO":
      return ["ro", "en"] as const;
    default:
      return SITE_LOCALES;
  }
}

/** Default UI language from country when the user has not chosen a language. */
export function defaultLocaleFromCountry(countryCode: CountryCode): SiteLocale {
  switch (countryCode) {
    case "CH":
    case "DE":
      return "de";
    case "FR":
      return "fr";
    case "RO":
      return "ro";
    default:
      return "en";
  }
}

/** Prefer locale string, then English, then provided fallback. */
export function pickLocaleString(
  labels: Partial<Record<SiteLocale, string>> | undefined,
  locale: SiteLocale,
  fallback: string
): string {
  if (!labels) return fallback;
  return labels[locale] ?? labels.en ?? fallback;
}
