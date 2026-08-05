import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { categoryBrowsePath } from "@/lib/category-routes";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const category = request.nextUrl.searchParams.get("category");
  if (!category || category === ALL_CATEGORIES_ID) {
    return NextResponse.next();
  }

  const targetPath = categoryBrowsePath(category);
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
  matcher: "/",
};
