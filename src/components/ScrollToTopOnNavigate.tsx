"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isBrowsePath,
  isComparePath,
  isProductPath,
  isTransientPath,
  notifyBrowseScrollRestored,
  pinBrowseScrollY,
  restoreBrowseScrollY,
} from "@/lib/browse-scroll";

/**
 * Scroll policy for infinite-scroll browse:
 * - Product modal → keep / restore browse offset (never jump top/bottom)
 * - Compare page → start at top; on back → restore browse offset
 * - Bag mark in header is the only explicit "scroll to top"
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (prev === pathname) return;

    // Opening product modal over browse — do not touch scroll.
    if (isBrowsePath(prev) && isProductPath(pathname)) {
      return;
    }

    // Opening compare (full page) — presentation starts at top.
    if (isComparePath(pathname) && !isComparePath(prev)) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // Back to browse from product / compare — expand lazy rows, then pin Y.
    if (isTransientPath(prev) && isBrowsePath(pathname)) {
      notifyBrowseScrollRestored();
      if (!pinBrowseScrollY()) {
        let tries = 0;
        const attempt = () => {
          if (restoreBrowseScrollY()) {
            notifyBrowseScrollRestored();
            pinBrowseScrollY();
            return;
          }
          tries += 1;
          if (tries < 8) window.setTimeout(attempt, 40 * tries);
        };
        requestAnimationFrame(attempt);
      }
      return;
    }

    if (isProductPath(pathname) || isProductPath(prev)) {
      return;
    }

    if (isComparePath(pathname) || isComparePath(prev)) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
