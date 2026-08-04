"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("b2b_cookie_consent");
    if (!consent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem("b2b_cookie_consent", type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white">Cookie & Privacy Notice</h4>
        </div>
        <button
          onClick={() => handleAccept("essential")}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        BeforeToBuy.com uses essential local storage for cookie preferences. Affiliate tracking on outbound merchant links is planned and will require consent once enabled.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
        <button
          onClick={() => handleAccept("all")}
          className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
        >
          Accept All
        </button>
        <button
          onClick={() => handleAccept("essential")}
          className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
        >
          Essential Only
        </button>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
        <Link href="/privacy" className="hover:text-emerald-400 underline">
          Datenschutz / Privacy Policy
        </Link>
        <Link href="/affiliate-disclosure" className="hover:text-emerald-400 underline">
          Affiliate Disclosure
        </Link>
      </div>
    </div>
  );
}
