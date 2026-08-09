"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function isProductPath(pathname: string): boolean {
  return pathname === "/p" || pathname.startsWith("/p/");
}

/**
 * Next client navigations can keep the previous scroll offset. Category pages
 * are shorter than the homepage, so users land at the footer instead of the top.
 *
 * Product modal intercepts (`/p/...`) must NOT reset scroll — otherwise the
 * grid jumps to the top behind the modal and snaps back on close.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (isProductPath(pathname) || isProductPath(prev)) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
