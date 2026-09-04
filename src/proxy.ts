import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeLocale } from "@/lib/i18n/locales";
import { LANG_COOKIE_KEY, LANG_QUERY_PARAM } from "@/lib/i18n/preference";
import { isCountryCode, MARKET_COUNTRY_COOKIE } from "@/lib/market-preference";
import { buildContentSecurityPolicy } from "@/lib/security-headers";

const REQUEST_LOCALE_HEADER = "x-btb-locale";
const REQUEST_MARKET_HEADER = "x-btb-market-country";

function buildRequestHeaders(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers);
  const requestedLocale = normalizeLocale(
    request.nextUrl.searchParams.get(LANG_QUERY_PARAM)
  );
  if (requestedLocale) {
    requestHeaders.set(REQUEST_LOCALE_HEADER, requestedLocale);
  }
  const countryParam = request.nextUrl.searchParams.get("country")?.toUpperCase();
  const requestedCountry = isCountryCode(countryParam) ? countryParam : null;
  if (requestedCountry) {
    requestHeaders.set(REQUEST_MARKET_HEADER, requestedCountry);
  }
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  return { requestHeaders, requestedLocale, requestedCountry };
}

function applyPreferenceCookies(
  response: NextResponse,
  requestedLocale: ReturnType<typeof normalizeLocale>,
  requestedCountry: string | null
) {
  if (requestedLocale) {
    response.cookies.set(LANG_COOKIE_KEY, requestedLocale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  if (requestedCountry) {
    response.cookies.set(MARKET_COUNTRY_COOKIE, requestedCountry, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

function securedNext(request: NextRequest, response?: NextResponse) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDevelopment = process.env.NODE_ENV === "development";
  const host = request.headers.get("host") || "";
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.startsWith("192.168.");
  const csp = buildContentSecurityPolicy({ nonce, isDevelopment, isLocalhost });
  const { requestHeaders, requestedLocale, requestedCountry } = buildRequestHeaders(
    request,
    nonce,
    csp
  );

  const nextResponse =
    response ??
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  nextResponse.headers.set("Content-Security-Policy", csp);
  nextResponse.headers.set("x-nonce", nonce);
  return applyPreferenceCookies(nextResponse, requestedLocale, requestedCountry);
}

/**
 * Locale cookie + CSP nonce (Next.js 16 proxy).
 * Keep `/?category=...` on the homepage — a 308 to /categories caused a
 * 5–7s white wall on every aisle click.
 */
export function proxy(request: NextRequest) {
  return securedNext(request);
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|google.*\\.html|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|html)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
