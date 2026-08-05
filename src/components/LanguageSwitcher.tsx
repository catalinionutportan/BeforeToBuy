"use client";

import {
  SITE_LOCALE_LABELS,
  SITE_LOCALES,
  type SiteLocale,
} from "@/lib/i18n/locales";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  locale: SiteLocale;
  onLocaleChange: (locale: SiteLocale) => void;
  label: string;
  availableLocales?: readonly SiteLocale[];
  compact?: boolean;
}

export function LanguageSwitcher({
  locale,
  onLocaleChange,
  label,
  availableLocales = SITE_LOCALES,
  compact = false,
}: LanguageSwitcherProps) {
  const options = availableLocales.includes(locale)
    ? availableLocales
    : ([locale, ...availableLocales] as SiteLocale[]);

  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-900 ${
        compact ? "" : "sm:px-2.5"
      }`}
      title={label}
    >
      <Languages className="h-3.5 w-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
      <span className={compact ? "sr-only" : "hidden sm:inline text-[10px] uppercase tracking-wide text-emerald-700"}>
        {label}
      </span>
      <select
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as SiteLocale)}
        aria-label={label}
        className="bg-transparent text-[11px] font-bold text-emerald-950 outline-none cursor-pointer max-w-[8rem]"
      >
        {options.map((code) => (
          <option key={code} value={code}>
            {SITE_LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
