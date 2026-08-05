import { CONSENT_CLIENT_HINT_COOKIE_NAME, CONSENT_VERSION } from "@/lib/consent-config";

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

function parseConsentPreferences(raw: string | null | undefined): ConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (parsed.essential !== true || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readLocalStorageConsent(): ConsentPreferences | null {
  return parseConsentPreferences(localStorage.getItem(STORAGE_KEY));
}

function writeLocalStorageConsent(prefs: ConsentPreferences | null): void {
  if (prefs) localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  else localStorage.removeItem(STORAGE_KEY);
}

/**
 * Reads the non-HttpOnly hint cookie set alongside the server-verified consent
 * cookie. It is never used for authorization — only to detect drift between
 * the server-visible cookie (source of truth) and localStorage.
 */
function readCookieConsentHint(): ConsentPreferences | null {
  const prefix = `${CONSENT_CLIENT_HINT_COOKIE_NAME}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!entry) return null;

  try {
    return parseConsentPreferences(decodeURIComponent(entry.slice(prefix.length)));
  } catch {
    return null;
  }
}

function consentValuesEqual(a: ConsentPreferences | null, b: ConsentPreferences | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.location === b.location && a.affiliate === b.affiliate && a.version === b.version;
}

export function getConsentPreferences(): ConsentPreferences | null {
  if (!isBrowser()) return null;

  const cookieHint = readCookieConsentHint();
  const stored = readLocalStorageConsent();

  // Cookie is the server-visible source of truth: if it disagrees with
  // localStorage (missing on either side, or different values), resync
  // localStorage to match it.
  if (!consentValuesEqual(cookieHint, stored)) {
    writeLocalStorageConsent(cookieHint);
    return cookieHint;
  }

  return stored;
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
