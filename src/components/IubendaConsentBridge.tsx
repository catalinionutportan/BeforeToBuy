"use client";

import { useEffect } from "react";
import { getConsentPreferences, saveConsentPreferences } from "@/lib/consent";
import { readIubendaConsent } from "@/lib/iubenda-consent";

/**
 * Maps iubenda Cookie Solution purposes onto the existing affiliate/analytics
 * consent cookie so store links and Datadog stay gated.
 */
export function IubendaConsentBridge() {
  useEffect(() => {
    let lastKey = "";

    const sync = () => {
      const next = readIubendaConsent();
      if (!next) return;
      const key = `${next.affiliate}:${next.analytics}`;
      if (key === lastKey) return;
      const current = getConsentPreferences();
      if (current?.affiliate === next.affiliate && current.analytics === next.analytics) {
        lastKey = key;
        return;
      }
      lastKey = key;
      void saveConsentPreferences(next);
    };

    const interval = window.setInterval(sync, 500);
    window.addEventListener("click", sync);
    const stop = window.setTimeout(() => window.clearInterval(interval), 45_000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
      window.removeEventListener("click", sync);
    };
  }, []);

  return null;
}
