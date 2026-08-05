import { NextResponse } from "next/server";
import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
} from "@/lib/consent-config";
import { createConsentToken } from "@/lib/server-consent";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

function hasValidOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin") return true;

  const origin = request.headers.get("origin");
  // Cookie mutations must include Origin (blocks simple CSRF without Origin).
  if (!origin) return false;

  try {
    const originHost = new URL(origin).host;
    const allowedHosts = new Set<string>([new URL(request.url).host]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      try {
        allowedHosts.add(new URL(siteUrl).host);
      } catch {
        // ignore invalid site URL config
      }
    }

    return allowedHosts.has(originHost);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) {
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
    typeof (body as { location?: unknown }).location !== "boolean" ||
    typeof (body as { affiliate?: unknown }).affiliate !== "boolean"
  ) {
    return NextResponse.json(
      { error: homeUi.expectedBooleanPreferences },
      { status: 400 }
    );
  }

  const preferences = body as { location: boolean; affiliate: boolean };
  const token = createConsentToken(preferences);
  if (!token) {
    return NextResponse.json(
      { error: homeUi.consentServiceNotConfigured },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ saved: true });
  response.cookies.set({
    name: CONSENT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!hasValidOrigin(request)) {
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

  const response = NextResponse.json({ cleared: true });
  response.cookies.set({
    name: CONSENT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
