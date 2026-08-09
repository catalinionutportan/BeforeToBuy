"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isBrowsePath,
  isComparePath,
  isProductPath,
  isTransientPath,
  restoreBrowseScrollY,
} from "@/lib/browse-scroll";

/**
 * Scroll policy for infinite-scroll browse:
 * - Scroll position is saved on product/compare click (not here)
 * - Product modal overlays the grid → keep browse scroll under it
 * - Compare is a full page → always start at top (product presentation first)
 * - Coming back from modal / compare → restore browse position
 * - Other page changes → scroll to top
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (prev === pathname) return;

    // Product modal: leave browse scroll alone (grid stays under the overlay).
    if (isBrowsePath(prev) && isProductPath(pathname)) {
      return;
    }

    // Compare is a full page — start at top so the product image is first.
    if (isComparePath(pathname)) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // Returning to browse from modal / compare → put the user back where they were.
    if (isTransientPath(prev) && isBrowsePath(pathname)) {
      let tries = 0;
      const attempt = () => {
        const ok = restoreBrowseScrollY();
        tries += 1;
        if (!ok && tries < 8) {
          window.setTimeout(attempt, 50 * tries);
        }
      };
      requestAnimationFrame(attempt);
      return;
    }

    // Staying inside product routes — keep scroll.
    if (isProductPath(pathname) || isProductPath(prev)) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
