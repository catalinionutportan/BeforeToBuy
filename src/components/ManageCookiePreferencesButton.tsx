"use client";

import { Cookie } from "lucide-react";
import { openConsentPreferences } from "@/lib/consent";

type Props = {
  className?: string;
  label?: string;
};

export function ManageCookiePreferencesButton({
  className = "inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:text-[#e85d04]",
  label = "Cookie Settings",
}: Props) {
  return (
    <button type="button" onClick={() => openConsentPreferences()} className={className}>
      <Cookie className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
