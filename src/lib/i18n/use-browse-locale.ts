"use client";

import { useEffect, useState } from "react";
import type { CountryCode } from "@/types";
import {
  defaultLocaleFromCountry,
  localesForCountry,
  type SiteLocale,
} from "@/lib/i18n/locales";
import {
  resolveInitialLocale,
  syncLangQueryParam,
  writeStoredLocale,
} from "@/lib/i18n/preference";

function clampLocaleToCountry(locale: SiteLocale, countryCode: CountryCode): SiteLocale {
  const allowed = localesForCountry(countryCode);
  return allowed.includes(locale) ? locale : defaultLocaleFromCountry(countryCode);
}

export function useBrowseLocale(countryCode: CountryCode) {
  const [locale, setLocaleState] = useState<SiteLocale>(() =>
    defaultLocaleFromCountry(countryCode)
  );
  const [explicit, setExplicit] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const resolved = resolveInitialLocale(countryCode);
    const clamped = clampLocaleToCountry(resolved.locale, countryCode);
    setLocaleState(clamped);
    setExplicit(resolved.explicit && clamped === resolved.locale);
    if (resolved.explicit && clamped === resolved.locale) syncLangQueryParam(clamped);
    setReady(true);
    // Intentionally run once on mount for hydration from URL/storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Country = market (stores + currency). Language stays unless invalid for that market.
  useEffect(() => {
    if (!ready) return;

    if (!explicit) {
      setLocaleState(defaultLocaleFromCountry(countryCode));
      return;
    }

    setLocaleState((current) => {
      const next = clampLocaleToCountry(current, countryCode);
      return next;
    });
  }, [countryCode, explicit, ready]);

  useEffect(() => {
    if (!ready || !explicit) return;
    const allowed = localesForCountry(countryCode);
    if (!allowed.includes(locale)) {
      const next = defaultLocaleFromCountry(countryCode);
      setLocaleState(next);
      writeStoredLocale(next);
      syncLangQueryParam(next);
    }
  }, [countryCode, explicit, locale, ready]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (next: SiteLocale) => {
    const allowed = clampLocaleToCountry(next, countryCode);
    setExplicit(true);
    setLocaleState(allowed);
    writeStoredLocale(allowed);
    syncLangQueryParam(allowed);
  };

  return {
    locale,
    setLocale,
    ready,
    availableLocales: localesForCountry(countryCode),
  };
}
