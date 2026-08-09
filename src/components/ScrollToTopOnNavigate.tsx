"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isBrowsePath,
  isComparePath,
  isProductPath,
  isTransientPath,
  readBrowseScrollY,
  restoreBrowseScrollY,
} from "@/lib/browse-scroll";

function pinBrowseScroll() {
  const y = readBrowseScrollY();
  if (y == null) return false;
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
  // Next soft-nav can reset scroll a frame later — re-pin twice.
  requestAnimationFrame(() => {
    window.scrollTo({ top: y, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
    });
  });
  return true;
}

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

    // Back to browse from product / compare — restore and hold position.
    if (isTransientPath(prev) && isBrowsePath(pathname)) {
      if (!pinBrowseScroll()) {
        let tries = 0;
        const attempt = () => {
          if (restoreBrowseScrollY()) {
            pinBrowseScroll();
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
