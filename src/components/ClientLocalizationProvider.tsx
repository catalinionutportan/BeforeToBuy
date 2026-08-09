"use client";

import { createContext, useContext } from "react";
import type { CountryCode } from "@/types";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import type { SiteLocale } from "@/lib/i18n/locales";

type LocalizationContextValue = {
  currentCountry: CountryCode;
  currentLocale: SiteLocale;
};

const LocalizationContext = createContext<LocalizationContextValue>({
  currentCountry: DEFAULT_COUNTRY,
  currentLocale: DEFAULT_LOCALE,
});

export function useServerLocalization(): LocalizationContextValue {
  return useContext(LocalizationContext);
}

export function ClientLocalizationProvider({
  children,
  currentCountry,
  currentLocale,
}: {
  children: React.ReactNode;
  currentCountry: CountryCode;
  currentLocale: SiteLocale;
}) {
  return (
    <LocalizationContext value={{ currentCountry, currentLocale }}>
      {children}
    </LocalizationContext>
  );
}
