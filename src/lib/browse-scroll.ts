/** Persist browse (infinite-scroll) position across modal / compare navigations. */

const STORAGE_KEY = "btb:browse-scroll-y";

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

export function restoreBrowseScrollY(): boolean {
  const y = readBrowseScrollY();
  if (y == null) return false;
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
  return true;
}

export function clearBrowseScrollY(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
