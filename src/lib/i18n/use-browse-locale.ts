"use client";

import { useEffect, useState } from "react";
import type { CountryCode } from "@/types";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import {
  resolveInitialLocale,
  syncLangQueryParam,
  writeStoredLocale,
} from "@/lib/i18n/preference";

export function useBrowseLocale(countryCode: CountryCode) {
  const [locale, setLocaleState] = useState<SiteLocale>(() =>
    defaultLocaleFromCountry(countryCode)
  );
  const [explicit, setExplicit] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const resolved = resolveInitialLocale(countryCode);
    setLocaleState(resolved.locale);
    setExplicit(resolved.explicit);
    if (resolved.explicit) syncLangQueryParam(resolved.locale);
    setReady(true);
    // Intentionally run once on mount for hydration from URL/storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || explicit) return;
    setLocaleState(defaultLocaleFromCountry(countryCode));
  }, [countryCode, explicit, ready]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (next: SiteLocale) => {
    setExplicit(true);
    setLocaleState(next);
    writeStoredLocale(next);
    syncLangQueryParam(next);
  };

  return { locale, setLocale, ready };
}
