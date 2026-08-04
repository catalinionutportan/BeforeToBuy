import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ConsentCategory } from "@/lib/consent";
import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
} from "@/lib/consent-config";

export interface ServerConsentPayload {
  version: number;
  location: boolean;
  affiliate: boolean;
  issuedAt: number;
}

function getSigningSecret(): string | null {
  const secret = process.env.CONSENT_SIGNING_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "development") {
    return "beforetobuy-development-consent-secret-only";
  }
  return null;
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createConsentToken(
  preferences: Pick<ServerConsentPayload, "location" | "affiliate">
): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const payload: ServerConsentPayload = {
    version: CONSENT_VERSION,
    location: preferences.location,
    affiliate: preferences.affiliate,
    issuedAt: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyConsentToken(token: string | undefined): ServerConsentPayload | null {
  const secret = getSigningSecret();
  if (!secret || !token) return null;

  const [encodedPayload, providedSignature, extra] = token.split(".");
  if (!encodedPayload || !providedSignature || extra) return null;

  const expectedSignature = sign(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<ServerConsentPayload>;
    const now = Date.now();
    const maxAgeMs = CONSENT_COOKIE_MAX_AGE_SECONDS * 1000;

    if (
      payload.version !== CONSENT_VERSION ||
      typeof payload.location !== "boolean" ||
      typeof payload.affiliate !== "boolean" ||
      typeof payload.issuedAt !== "number" ||
      payload.issuedAt > now + 60_000 ||
      now - payload.issuedAt > maxAgeMs
    ) {
      return null;
    }

    return payload as ServerConsentPayload;
  } catch {
    return null;
  }
}

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const entry of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = entry.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return undefined;
}

export function hasServerConsent(request: Request, category: ConsentCategory): boolean {
  const payload = verifyConsentToken(getCookie(request, CONSENT_COOKIE_NAME));
  return payload?.[category] === true;
}
