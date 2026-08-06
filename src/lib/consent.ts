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
 * Reads the non-HttpOnly hint cookie. Supports values that were accidentally
 * double-encoded by older builds.
 */
function readCookieConsentHint(): ConsentPreferences | null {
  const prefix = `${CONSENT_CLIENT_HINT_COOKIE_NAME}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!entry) return null;

  let raw = entry.slice(prefix.length);
  for (let i = 0; i < 3; i++) {
    const parsed = parseConsentPreferences(raw);
    if (parsed) return parsed;
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded === raw) break;
      raw = decoded;
    } catch {
      break;
    }
  }
  return null;
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

  // Only sync FROM a valid cookie hint. Never wipe localStorage just because
  // the hint cookie is missing/unreadable (that caused Accept to "freeze"/loop).
  if (cookieHint && !consentValuesEqual(cookieHint, stored)) {
    writeLocalStorageConsent(cookieHint);
    return cookieHint;
  }

  return cookieHint ?? stored;
}

export function hasConsent(category: ConsentCategory): boolean {
  const prefs = getConsentPreferences();
  if (!prefs) return false;
  return prefs[category];
}

async function postConsentPreferences(
  prefs: Pick<ConsentPreferences, "location" | "affiliate">
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("/api/consent", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveConsentPreferences(
  prefs: Pick<ConsentPreferences, "location" | "affiliate">
): Promise<boolean> {
  if (!isBrowser()) return false;

  const payload: ConsentPreferences = {
    essential: true,
    location: prefs.location,
    affiliate: prefs.affiliate,
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  // Persist locally first so the banner can close even if the API is slow.
  writeLocalStorageConsent(payload);
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));

  const savedOnServer = await postConsentPreferences(prefs);
  if (!savedOnServer) {
    // Keep local prefs so the UI stays usable offline / when the API fails.
    console.warn("[consent] server save failed; keeping local preferences");
  }
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
