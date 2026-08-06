import { CONSENT_CLIENT_HINT_COOKIE_NAME, CONSENT_VERSION } from "@/lib/consent-config";

export type ConsentCategory = "location" | "affiliate" | "analytics";

export interface ConsentPreferences {
  essential: true;
  location: boolean;
  affiliate: boolean;
  /** Optional performance/analytics (e.g. Datadog RUM). Defaults false when absent. */
  analytics: boolean;
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
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.essential !== true || parsed.version !== CONSENT_VERSION) return null;
    if (typeof parsed.location !== "boolean" || typeof parsed.affiliate !== "boolean") return null;
    return {
      essential: true,
      location: parsed.location,
      affiliate: parsed.affiliate,
      analytics: parsed.analytics === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      version: CONSENT_VERSION,
    };
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
  return (
    a.location === b.location &&
    a.affiliate === b.affiliate &&
    a.analytics === b.analytics &&
    a.version === b.version
  );
}

export function getConsentPreferences(): ConsentPreferences | null {
  if (!isBrowser()) return null;

  const cookieHint = readCookieConsentHint();
  const stored = readLocalStorageConsent();

  if (cookieHint && !consentValuesEqual(cookieHint, stored)) {
    writeLocalStorageConsent(cookieHint);
    return cookieHint;
  }

  return cookieHint ?? stored;
}

export function hasConsent(category: ConsentCategory): boolean {
  const prefs = getConsentPreferences();
  if (!prefs) return false;
  return prefs[category] === true;
}

async function postConsentPreferences(
  prefs: Pick<ConsentPreferences, "location" | "affiliate" | "analytics">
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("/api/consent", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: prefs.location,
        affiliate: prefs.affiliate,
        analytics: prefs.analytics,
      }),
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
  prefs: Pick<ConsentPreferences, "location" | "affiliate" | "analytics">
): Promise<boolean> {
  if (!isBrowser()) return false;

  const payload: ConsentPreferences = {
    essential: true,
    location: prefs.location,
    affiliate: prefs.affiliate,
    analytics: prefs.analytics,
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  writeLocalStorageConsent(payload);
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));

  const savedOnServer = await postConsentPreferences(prefs);
  if (!savedOnServer) {
    console.warn("[consent] server save failed; keeping local preferences");
  }
  return true;
}

export async function acceptAllConsent() {
  return saveConsentPreferences({ location: true, affiliate: true, analytics: true });
}

export async function acceptEssentialConsent() {
  return saveConsentPreferences({ location: false, affiliate: false, analytics: false });
}

export function openConsentPreferences() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("b2b-consent-open"));
}
