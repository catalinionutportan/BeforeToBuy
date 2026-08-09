import { NextResponse } from "next/server";
import {
  CONSENT_CLIENT_HINT_COOKIE_NAME,
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
} from "@/lib/consent-config";
import { createConsentToken } from "@/lib/server-consent";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasValidRequestOrigin } from "@/lib/request-origin";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: homeUi.invalidRequestOrigin }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`consent:${clientIp}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.contactFormTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: homeUi.invalidJsonBody }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { affiliate?: unknown }).affiliate !== "boolean"
  ) {
    return NextResponse.json(
      { error: homeUi.expectedBooleanPreferences },
      { status: 400 }
    );
  }

  const preferences = body as {
    affiliate: boolean;
    analytics?: unknown;
  };
  const analytics = preferences.analytics === true;
  const token = createConsentToken({
    affiliate: preferences.affiliate,
  });
  if (!token) {
    return NextResponse.json(
      { error: homeUi.consentServiceNotConfigured },
      { status: 503 }
    );
  }

  const isHttps = new URL(request.url).protocol === "https:";
  const response = NextResponse.json({ saved: true });
  response.cookies.set({
    name: CONSENT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isHttps,
    sameSite: "strict",
    path: "/",
    maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
  });
  // Do not pre-encode: Next.js cookie serializer encodes once.
  response.cookies.set({
    name: CONSENT_CLIENT_HINT_COOKIE_NAME,
    value: JSON.stringify({
      essential: true,
      affiliate: preferences.affiliate,
      analytics,
      updatedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    }),
    httpOnly: false,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: homeUi.invalidRequestOrigin }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`consent:${clientIp}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.contactFormTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const isHttps = new URL(request.url).protocol === "https:";
  const response = NextResponse.json({ cleared: true });
  response.cookies.set({
    name: CONSENT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isHttps,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: CONSENT_CLIENT_HINT_COOKIE_NAME,
    value: "",
    httpOnly: false,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
