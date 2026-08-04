import { CONSENT_VERSION } from "@/lib/consent-config";

export type ConsentCategory = "location" | "affiliate";

export interface ConsentPreferences {
  essential: true;
  location: boolean;
  affiliate: boolean;
  updatedAt: string;
  version: number;
}

const STORAGE_KEY = "b2b_consent_v3";
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
    if (parsed.essential !== true || parsed.version !== CONSENT_VERSION) return null;
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

export async function saveConsentPreferences(
  prefs: Pick<ConsentPreferences, "location" | "affiliate">
): Promise<boolean> {
  if (!isBrowser()) return false;

  try {
    const response = await fetch("/api/consent", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (!response.ok) return false;
  } catch {
    return false;
  }

  const payload: ConsentPreferences = {
    essential: true,
    location: prefs.location,
    affiliate: prefs.affiliate,
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
  return true;
}

export async function acceptAllConsent() {
  return saveConsentPreferences({ location: true, affiliate: true });
}

export async function acceptEssentialConsent() {
  return saveConsentPreferences({ location: false, affiliate: false });
}

export function openConsentPreferences() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("b2b-consent-open"));
}
