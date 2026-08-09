import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { categoryBrowsePath } from "@/lib/category-routes";
import { normalizeLocale } from "@/lib/i18n/locales";
import { LANG_COOKIE_KEY, LANG_QUERY_PARAM } from "@/lib/i18n/preference";

const REQUEST_LOCALE_HEADER = "x-btb-locale";

function responseWithLocale(request: NextRequest, response?: NextResponse) {
  const requestedLocale = normalizeLocale(
    request.nextUrl.searchParams.get(LANG_QUERY_PARAM)
  );
  const requestHeaders = new Headers(request.headers);

  if (requestedLocale) {
    requestHeaders.set(REQUEST_LOCALE_HEADER, requestedLocale);
  }

  const nextResponse =
    response ?? NextResponse.next({ request: { headers: requestHeaders } });
  if (requestedLocale) {
    nextResponse.cookies.set(LANG_COOKIE_KEY, requestedLocale, {
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return nextResponse;
}

/**
 * Redirect legacy `/?category=...` URLs to SEO category routes.
 * Locale is client-side (browseLocale) — do not prefix paths with /en etc.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return responseWithLocale(request);
  }

  const category = request.nextUrl.searchParams.get("category");
  if (!category || category === ALL_CATEGORIES_ID) {
    return responseWithLocale(request);
  }

  const targetPath = categoryBrowsePath(category);
  if (!targetPath) {
    return responseWithLocale(request);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = targetPath;
  redirectUrl.searchParams.delete("category");

  const query = request.nextUrl.searchParams.get("q");
  if (query) {
    redirectUrl.searchParams.set("q", query);
  }

  return responseWithLocale(request, NextResponse.redirect(redirectUrl, 308));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)"],
};
