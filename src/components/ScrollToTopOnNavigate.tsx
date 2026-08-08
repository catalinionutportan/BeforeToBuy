"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Next client navigations can keep the previous scroll offset. Category pages
 * are shorter than the homepage, so users land at the footer instead of the top.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
