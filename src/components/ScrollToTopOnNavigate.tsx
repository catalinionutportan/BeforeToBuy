"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isBrowsePath,
  isTransientPath,
  restoreBrowseScrollY,
} from "@/lib/browse-scroll";

/**
 * Scroll policy for infinite-scroll browse:
 * - Scroll position is saved on product/compare click (not here)
 * - Coming back from modal / compare → restore that position
 * - Other page changes (categories, legal, …) → scroll to top
 * - Explicit "go to top" is the shopping-bag mark in the header
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (prev === pathname) return;

    // Leaving browse → do NOT re-save scrollY here. Card/compare click already
    // saved the real position; by this effect window.scrollY is often the page
    // bottom (focus jumped to the modal node at the end of the DOM).
    if (isBrowsePath(prev) && isTransientPath(pathname)) {
      return;
    }

    // Returning to browse from modal / compare → put the user back where they were.
    if (isTransientPath(prev) && isBrowsePath(pathname)) {
      let tries = 0;
      const attempt = () => {
        const ok = restoreBrowseScrollY();
        tries += 1;
        // Cards may mount a moment after navigation (infinite scroll hydrate).
        if (!ok && tries < 8) {
          window.setTimeout(attempt, 50 * tries);
        }
      };
      requestAnimationFrame(attempt);
      return;
    }

    // Staying inside product/compare (or opening them from non-browse) — keep scroll.
    if (isTransientPath(pathname) || isTransientPath(prev)) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
