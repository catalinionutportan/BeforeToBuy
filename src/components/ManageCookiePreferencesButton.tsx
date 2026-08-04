"use client";

import { Cookie } from "lucide-react";
import { openConsentPreferences } from "@/lib/consent";

export function ManageCookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => openConsentPreferences()}
      className="inline-flex items-center gap-1 hover:text-emerald-400 text-slate-300 transition-colors"
    >
      <Cookie className="w-3.5 h-3.5" aria-hidden="true" />
      Cookie Settings
    </button>
  );
}
