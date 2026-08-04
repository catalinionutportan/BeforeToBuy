export type ConsentCategory = "location" | "affiliate";

export interface ConsentPreferences {
  essential: true;
  location: boolean;
  affiliate: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "b2b_consent_v2";
export const CONSENT_UPDATED_EVENT = "b2b-consent-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getConsentPreferences(): ConsentPreferences | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (parsed.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  const prefs = getConsentPreferences();
  if (!prefs) return false;
  return prefs[category];
}

export function saveConsentPreferences(prefs: Omit<ConsentPreferences, "essential" | "updatedAt">) {
  if (!isBrowser()) return;

  const payload: ConsentPreferences = {
    essential: true,
    location: prefs.location,
    affiliate: prefs.affiliate,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
}

export function acceptAllConsent() {
  saveConsentPreferences({ location: true, affiliate: true });
}

export function acceptEssentialConsent() {
  saveConsentPreferences({ location: false, affiliate: false });
}

export function openConsentPreferences() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("b2b-consent-open"));
}
