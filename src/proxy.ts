import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { categoryBrowsePath } from "@/lib/category-routes";
import { normalizeLocale } from "@/lib/i18n/locales";
import { LANG_COOKIE_KEY, LANG_QUERY_PARAM } from "@/lib/i18n/preference";
import { buildContentSecurityPolicy } from "@/lib/security-headers";

const REQUEST_LOCALE_HEADER = "x-btb-locale";

function buildRequestHeaders(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers);
  const requestedLocale = normalizeLocale(
    request.nextUrl.searchParams.get(LANG_QUERY_PARAM)
  );
  if (requestedLocale) {
    requestHeaders.set(REQUEST_LOCALE_HEADER, requestedLocale);
  }
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  return { requestHeaders, requestedLocale };
}

function applyLocaleCookie(
  response: NextResponse,
  requestedLocale: ReturnType<typeof normalizeLocale>
) {
  if (requestedLocale) {
    response.cookies.set(LANG_COOKIE_KEY, requestedLocale, {
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
  const csp = buildContentSecurityPolicy({ nonce, isDevelopment });
  const { requestHeaders, requestedLocale } = buildRequestHeaders(request, nonce, csp);

  const nextResponse =
    response ??
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  nextResponse.headers.set("Content-Security-Policy", csp);
  nextResponse.headers.set("x-nonce", nonce);
  return applyLocaleCookie(nextResponse, requestedLocale);
}

/**
 * Locale cookie + CSP nonce (Next.js 16 proxy).
 * Redirect legacy `/?category=...` URLs to SEO category routes.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return securedNext(request);
  }

  const category = request.nextUrl.searchParams.get("category");
  if (!category || category === ALL_CATEGORIES_ID) {
    return securedNext(request);
  }

  const targetPath = categoryBrowsePath(category);
  if (!targetPath) {
    return securedNext(request);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = targetPath;
  redirectUrl.searchParams.delete("category");

  const query = request.nextUrl.searchParams.get("q");
  if (query) {
    redirectUrl.searchParams.set("q", query);
  }

  return securedNext(request, NextResponse.redirect(redirectUrl, 308));
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
