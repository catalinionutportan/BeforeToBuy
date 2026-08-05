"use client";

import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale as useBrowseLocaleBase } from "@/lib/i18n/use-browse-locale";
import type { CountryCode } from "@/types";

/**
 * Compatibility wrapper used across pages/components.
 * Exposes both `locale` and `browseLocale` aliases.
 */
export function useBrowseLocale(countryCode: CountryCode = DEFAULT_COUNTRY) {
  const result = useBrowseLocaleBase(countryCode);
  return {
    ...result,
    browseLocale: result.locale,
    setBrowseLocale: result.setLocale,
  };
}
