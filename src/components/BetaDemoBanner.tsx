"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

export function BetaDemoBanner() {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  return (
    <div className="bg-amber-500 text-amber-950 text-xs sm:text-sm py-2.5 px-4 border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <span>
            <strong className="uppercase tracking-wide">Beta / Demo</strong> — {homeUi.demoDisclaimer}
          </span>
        </div>
        <Link
          href="/about"
          className="sm:ml-auto underline underline-offset-2 font-bold whitespace-nowrap hover:text-amber-900"
        >
          {homeUi.learnHowItWorks}
        </Link>
      </div>
    </div>
  );
}
