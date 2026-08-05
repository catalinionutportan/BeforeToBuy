"use client";

import {
  SITE_LOCALES,
  SITE_LOCALE_LABELS,
  type SiteLocale,
} from "@/lib/i18n/locales";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  locale: SiteLocale;
  onLocaleChange: (locale: SiteLocale) => void;
  label: string;
  compact?: boolean;
}

export function LanguageSwitcher({
  locale,
  onLocaleChange,
  label,
  compact = false,
}: LanguageSwitcherProps) {
  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-[11px] font-semibold text-slate-700 ${
        compact ? "" : "sm:px-2.5"
      }`}
    >
      <Languages className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as SiteLocale)}
        aria-label={label}
        className="bg-transparent text-[11px] font-bold text-slate-800 outline-none cursor-pointer max-w-[7.5rem]"
      >
        {SITE_LOCALES.map((code) => (
          <option key={code} value={code}>
            {SITE_LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
