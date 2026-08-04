"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  acceptAllConsent,
  acceptEssentialConsent,
  getConsentPreferences,
  openConsentPreferences,
} from "@/lib/consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      setIsVisible(!getConsentPreferences());
    };

    syncVisibility();
    const timer = setTimeout(syncVisibility, 800);

    const openHandler = () => setIsVisible(true);
    window.addEventListener("b2b-consent-open", openHandler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("b2b-consent-open", openHandler);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    acceptEssentialConsent();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-800"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" aria-hidden="true" />
          </div>
          <h4 id="cookie-consent-title" className="font-bold text-sm text-white">
            Cookie & Privacy Preferences
          </h4>
        </div>
        <button
          type="button"
          onClick={handleEssentialOnly}
          aria-label="Close and accept essential only"
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        We use essential local storage for your preferences. With your permission, we also use approximate location (IP/GPS lookup) and enable outbound merchant links that may set affiliate tracking on partner stores.
      </p>

      <ul className="text-[11px] text-slate-400 space-y-1 mb-4 list-disc list-inside">
        <li><strong className="text-slate-300">Essential:</strong> required site preferences (always active)</li>
        <li><strong className="text-slate-300">Location:</strong> IP/GPS lookup via our server, Nominatim, ipapi.co</li>
        <li><strong className="text-slate-300">Affiliate:</strong> outbound store links that may use partner tracking</li>
      </ul>

      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
        <button
          type="button"
          onClick={handleAcceptAll}
          className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
        >
          Accept All
        </button>
        <button
          type="button"
          onClick={handleEssentialOnly}
          className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
        >
          Essential Only
        </button>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 gap-3">
        <Link href="/cookies" className="hover:text-emerald-400 underline">
          Cookie Policy
        </Link>
        <Link href="/privacy" className="hover:text-emerald-400 underline">
          Privacy Policy
        </Link>
        <button
          type="button"
          onClick={() => openConsentPreferences()}
          className="hover:text-emerald-400 underline"
        >
          Change preferences
        </button>
      </div>
    </div>
  );
}
