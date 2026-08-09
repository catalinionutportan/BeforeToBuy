"use client";

import { Cookie } from "lucide-react";
import { openConsentPreferences } from "@/lib/consent";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

type Props = {
  className?: string;
  label?: string;
};

export function ManageCookiePreferencesButton({
  className = "inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:text-[#e85d04]",
  label,
}: Props) {
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];

  return (
    <button type="button" onClick={() => openConsentPreferences()} className={className}>
      <Cookie className="h-3.5 w-3.5" aria-hidden="true" />
      {label ?? ui.cookieSettingsLabel}
    </button>
  );
}
