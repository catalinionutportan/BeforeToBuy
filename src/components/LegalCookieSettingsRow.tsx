"use client";

import { Cookie } from "lucide-react";
import { openConsentPreferences } from "@/lib/consent";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

export function LegalCookieSettingsRow() {
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];

  return (
    <button
      type="button"
      onClick={() => openConsentPreferences()}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:border-[#e85d04]/30 hover:bg-orange-50/50"
    >
      <span className="inline-flex items-center gap-2">
        <Cookie className="h-4 w-4 text-[#e85d04]" aria-hidden="true" />
        {ui.cookieSettingsLabel}
      </span>
      <span className="text-xs font-medium text-[#e85d04]">{ui.openLabel}</span>
    </button>
  );
}
