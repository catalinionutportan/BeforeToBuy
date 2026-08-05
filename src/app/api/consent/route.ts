import { NextResponse } from "next/server";
import {
  CONSENT_CLIENT_HINT_COOKIE_NAME,
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
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
    const originHost = new URL(origin).host.toLowerCase();
    const allowedHosts = new Set<string>();

    const addHost = (value: string | null | undefined) => {
      if (!value) return;
      try {
        // Accept raw Host headers ("127.0.0.1:3000") or absolute URLs.
        const host = value.includes("://") ? new URL(value).host : value;
        allowedHosts.add(host.toLowerCase());
      } catch {
        // ignore invalid host values
      }
    };

    addHost(request.url);
    addHost(request.headers.get("host"));
    addHost(request.headers.get("x-forwarded-host"));
    addHost(process.env.NEXT_PUBLIC_SITE_URL);

    if (allowedHosts.has(originHost)) return true;

    // Local/CI: treat localhost and 127.0.0.1 as equivalent.
    const normalizeLoopback = (host: string) =>
      host.replace(/^127\.0\.0\.1(?=:\d+$|$)/, "localhost").replace(/^\[::1\](?=:\d+$|$)/, "localhost");
    const normalizedOrigin = normalizeLoopback(originHost);
    for (const allowed of allowedHosts) {
      if (normalizeLoopback(allowed) === normalizedOrigin) return true;
    }

    return false;
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
  // Readable companion cookie so the client can resync localStorage with the
  // HttpOnly cookie (the server-visible source of truth) on later page loads.
  response.cookies.set({
    name: CONSENT_CLIENT_HINT_COOKIE_NAME,
    value: encodeURIComponent(
      JSON.stringify({
        essential: true,
        location: preferences.location,
        affiliate: preferences.affiliate,
        updatedAt: new Date().toISOString(),
        version: CONSENT_VERSION,
      })
    ),
    httpOnly: false,
    secure: isHttps,
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
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
