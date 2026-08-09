"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_UPDATED_EVENT,
  ConsentPreferences,
  getConsentPreferences,
} from "@/lib/consent";

export function useConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setPreferences(getConsentPreferences());
    setIsLoaded(true);

    const refresh = () => setPreferences(getConsentPreferences());
    window.addEventListener(CONSENT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, refresh);
  }, []);

  return {
    isLoaded,
    preferences,
    hasBanner: isLoaded && !preferences,
    affiliate: preferences?.affiliate ?? false,
    analytics: preferences?.analytics ?? false,
  };
}
