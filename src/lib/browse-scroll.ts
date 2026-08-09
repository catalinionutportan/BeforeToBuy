/** Persist browse (infinite-scroll) position across modal / compare navigations. */

const STORAGE_KEY = "btb:browse-scroll-y";
const ANCHOR_KEY = "btb:browse-scroll-anchor";

export function isBrowsePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function isTransientPath(pathname: string): boolean {
  return (
    pathname === "/p" ||
    pathname.startsWith("/p/") ||
    pathname === "/compare-products" ||
    pathname.startsWith("/compare-products/")
  );
}

export function saveBrowseScrollY(y = typeof window !== "undefined" ? window.scrollY : 0): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(y))));
  } catch {
    // private mode / quota — ignore
  }
}

/** Prefer restoring to a specific product card (avoids one-row offset). */
export function saveBrowseScrollAnchor(productId: string | null | undefined): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    sessionStorage.setItem(ANCHOR_KEY, productId);
  } catch {
    // ignore
  }
}

export function readBrowseScrollY(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return null;
    const y = Number.parseInt(raw, 10);
    return Number.isFinite(y) && y >= 0 ? y : null;
  } catch {
    return null;
  }
}

export function readBrowseScrollAnchor(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ANCHOR_KEY);
  } catch {
    return null;
  }
}

export function restoreBrowseScrollY(): boolean {
  // Only restore the numeric offset — scrollIntoView can jump the page.
  const y = readBrowseScrollY();
  if (y == null) return false;
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
  return true;
}

export function clearBrowseScrollY(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(ANCHOR_KEY);
  } catch {
    // ignore
  }
}
