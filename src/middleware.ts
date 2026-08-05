import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { categoryBrowsePath } from "@/lib/category-routes";
import { DEFAULT_LOCALE, isSiteLocale, type SiteLocale } from "@/lib/i18n/locales";

export function middleware(request: NextRequest) {
  let locale: string | undefined = undefined;

  // Try to extract locale from path first (e.g., /en/...) if Next.js i18n routing is used
  // If not, fall back to query param, then default.
  const pathSegments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && isSiteLocale(pathSegments[0])) {
    locale = pathSegments[0];
  } else {
    // Fallback to query param for 'lang'
    const langQuery = request.nextUrl.searchParams.get("lang");
    if (langQuery && isSiteLocale(langQuery)) {
      locale = langQuery;
    }
  }

  const currentLocale = locale || DEFAULT_LOCALE;

  // Only apply this middleware if the current path is the root and doesn't already contain a locale prefix
  // and there is no category param
  if (
    !pathSegments[0] && 
    request.nextUrl.pathname === "/" && 
    !request.nextUrl.searchParams.get("category")
  ) {
    // Redirect to add the default locale prefix if not present
    if (!locale || locale === DEFAULT_LOCALE) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${DEFAULT_LOCALE}${redirectUrl.pathname}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  // Existing category redirection logic
  if (request.nextUrl.pathname.replace(`/${currentLocale}`, '') !== "/") {
    return NextResponse.next();
  }

  const category = request.nextUrl.searchParams.get("category");
  if (!category || category === ALL_CATEGORIES_ID) {
    return NextResponse.next();
  }

  const targetPath = categoryBrowsePath(category, currentLocale as SiteLocale);
  if (!targetPath) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = targetPath;
  redirectUrl.searchParams.delete("category");

  const query = request.nextUrl.searchParams.get("q");
  if (query) {
    redirectUrl.searchParams.set("q", query);
  }

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: "/:path*", // Match all paths to handle locale prefixing
};
