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
import { useServerLocalization } from "@/components/ClientLocalizationProvider";

const LOCALE_CHANGE_EVENT = "btb-locale-change";

function clampLocaleToCountry(locale: SiteLocale, countryCode: CountryCode): SiteLocale {
  const allowed = localesForCountry(countryCode);
  return allowed.includes(locale) ? locale : defaultLocaleFromCountry(countryCode);
}

export function useBrowseLocale(countryCode?: CountryCode) {
  const serverLocalization = useServerLocalization();
  const activeCountry = countryCode ?? serverLocalization.currentCountry;
  const [locale, setLocaleState] = useState<SiteLocale>(() =>
    clampLocaleToCountry(serverLocalization.currentLocale, activeCountry)
  );
  const [explicit, setExplicit] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncFromBrowserState = () => {
      const resolved = resolveInitialLocale(activeCountry);
      const clamped = clampLocaleToCountry(resolved.locale, activeCountry);
      setLocaleState(clamped);
      setExplicit(resolved.explicit && clamped === resolved.locale);
      if (resolved.explicit && clamped === resolved.locale) {
        syncLangQueryParam(clamped);
      }
      setReady(true);
    };

    const onLocaleChange = (event: Event) => {
      const requested = (event as CustomEvent<{ locale?: SiteLocale }>).detail?.locale;
      if (!requested) {
        syncFromBrowserState();
        return;
      }

      const clamped = clampLocaleToCountry(requested, activeCountry);
      setLocaleState(clamped);
      setExplicit(true);
      syncLangQueryParam(clamped);
    };

    syncFromBrowserState();
    window.addEventListener("popstate", syncFromBrowserState);
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange as EventListener);

    return () => {
      window.removeEventListener("popstate", syncFromBrowserState);
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange as EventListener);
    };
  }, [activeCountry]);

  // Country = market (stores + currency). Language stays unless invalid for that market.
  useEffect(() => {
    if (!ready) return;

    if (!explicit) {
      setLocaleState(defaultLocaleFromCountry(activeCountry));
      return;
    }

    setLocaleState((current) => {
      const next = clampLocaleToCountry(current, activeCountry);
      return next;
    });
  }, [activeCountry, explicit, ready]);

  useEffect(() => {
    if (!ready || !explicit) return;
    const allowed = localesForCountry(activeCountry);
    if (!allowed.includes(locale)) {
      const next = defaultLocaleFromCountry(activeCountry);
      setLocaleState(next);
      writeStoredLocale(next);
      syncLangQueryParam(next);
    }
  }, [activeCountry, explicit, locale, ready]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (next: SiteLocale) => {
    const allowed = clampLocaleToCountry(next, activeCountry);
    setExplicit(true);
    setLocaleState(allowed);
    writeStoredLocale(allowed);
    syncLangQueryParam(allowed);
    window.dispatchEvent(
      new CustomEvent<{ locale: SiteLocale }>(LOCALE_CHANGE_EVENT, {
        detail: { locale: allowed },
      })
    );
  };

  return {
    countryCode: activeCountry,
    locale,
    setLocale,
    ready,
    availableLocales: localesForCountry(activeCountry),
  };
}
