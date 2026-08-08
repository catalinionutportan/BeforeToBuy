"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

const DISMISS_KEY = "btb-beta-banner-dismissed";

export function BetaDemoBanner() {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500 text-amber-950 text-[11px] sm:text-sm py-1.5 sm:py-2.5 px-3 sm:px-4 border-b border-amber-600/30">
      <div className="mx-auto flex w-full min-w-0 items-center gap-2 px-3 sm:px-8 lg:px-12">
        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate sm:whitespace-normal sm:break-words font-semibold">
          <strong className="uppercase tracking-wide">Beta</strong>
          <span className="font-medium"> — {homeUi.demoDisclaimerShort}</span>
        </p>
        <Link
          href="/about"
          className="hidden sm:inline underline underline-offset-2 font-bold hover:text-amber-900 shrink-0"
        >
          {homeUi.learnHowItWorks}
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
          className="shrink-0 rounded-md p-1 hover:bg-amber-600/20"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
