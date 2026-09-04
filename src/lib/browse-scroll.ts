/** Persist browse (infinite-scroll) position across modal / compare navigations. */

const STORAGE_KEY = "btb:browse-scroll-y";
const ANCHOR_KEY = "btb:browse-scroll-anchor";
const RESTORE_EVENT = "btb:browse-scroll-restored";

export type BrowseScrollAnchor = {
  productId: string;
  visibleIndex: number | null;
  viewportTop: number | null;
};

export function isBrowsePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function isProductPath(pathname: string): boolean {
  return pathname === "/p" || pathname.startsWith("/p/");
}

export function isComparePath(pathname: string): boolean {
  return pathname === "/compare-products" || pathname.startsWith("/compare-products/");
}

export function isTransientPath(pathname: string): boolean {
  return isProductPath(pathname) || isComparePath(pathname);
}

export function saveBrowseScrollY(
  y = typeof window !== "undefined" ? window.scrollY : 0,
  options?: { force?: boolean }
): void {
  if (typeof window === "undefined") return;
  try {
    const next = Math.max(0, Math.floor(y));
    // Ignore accidental end-of-document jumps unless the card click forces save.
    if (!options?.force) {
      const maxSane =
        Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) -
        window.innerHeight;
      if (maxSane > 400 && next > maxSane - 80) {
        return;
      }
    }
    sessionStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // private mode / quota — ignore
  }
}

/** Prefer restoring to the exact product card and its previous viewport position. */
export function saveBrowseScrollAnchor(
  productId: string | null | undefined,
  options?: { visibleIndex?: number; viewportTop?: number }
): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    const visibleIndex = Number.isFinite(options?.visibleIndex)
      ? Math.max(0, Math.floor(options?.visibleIndex ?? 0))
      : null;
    const viewportTop = Number.isFinite(options?.viewportTop)
      ? options?.viewportTop ?? null
      : null;
    sessionStorage.setItem(
      ANCHOR_KEY,
      JSON.stringify({ productId, visibleIndex, viewportTop } satisfies BrowseScrollAnchor)
    );
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

export function readBrowseScrollAnchorState(): BrowseScrollAnchor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ANCHOR_KEY);
    if (!raw) return null;
    // Backward compatibility with the previous plain product-ID value.
    if (!raw.startsWith("{")) {
      return { productId: raw, visibleIndex: null, viewportTop: null };
    }
    const parsed = JSON.parse(raw) as Partial<BrowseScrollAnchor>;
    if (typeof parsed.productId !== "string" || !parsed.productId) return null;
    return {
      productId: parsed.productId,
      visibleIndex:
        typeof parsed.visibleIndex === "number" && Number.isFinite(parsed.visibleIndex)
          ? Math.max(0, Math.floor(parsed.visibleIndex))
          : null,
      viewportTop:
        typeof parsed.viewportTop === "number" && Number.isFinite(parsed.viewportTop)
          ? parsed.viewportTop
          : null,
    };
  } catch {
    return null;
  }
}

export function readBrowseScrollAnchor(): string | null {
  return readBrowseScrollAnchorState()?.productId ?? null;
}

/** How many cards to render so `scrollY` is still inside the document. */
export function visibleCountForBrowseScroll(
  scrollY: number,
  totalProducts: number,
  minimum = 12
): number {
  if (totalProducts <= minimum) return totalProducts;
  // ~2–3 cards/row, ~280px/row — bias high so restore never lands past content.
  const estimated = Math.ceil(scrollY / 140) + 24;
  return Math.max(minimum, Math.min(totalProducts, estimated));
}

/** Render just enough cards to include the product the shopper opened. */
export function visibleCountForBrowseAnchor(
  anchor: BrowseScrollAnchor | null,
  totalProducts: number,
  minimum = 12
): number | null {
  if (anchor?.visibleIndex == null) return null;
  if (totalProducts <= minimum) return totalProducts;
  return Math.max(minimum, Math.min(totalProducts, anchor.visibleIndex + 1));
}

/** Restore the opened card to the same point in the viewport. */
export function restoreBrowseScrollAnchor(): boolean {
  if (typeof window === "undefined") return false;
  const anchor = readBrowseScrollAnchorState();
  if (!anchor) return false;
  const card = Array.from(
    document.querySelectorAll<HTMLElement>("[data-product-id]")
  ).find((element) => element.dataset.productId === anchor.productId);
  if (!card) return false;

  const targetTop = anchor.viewportTop ?? Math.min(96, window.innerHeight * 0.2);
  const nextY = Math.max(0, window.scrollY + card.getBoundingClientRect().top - targetTop);
  window.scrollTo({ top: nextY, left: 0, behavior: "auto" });
  return true;
}

/** Re-pin the product anchor across Next.js soft-navigation frames. */
export function pinBrowseScrollAnchor(): boolean {
  if (!restoreBrowseScrollAnchor()) return false;
  const apply = () => restoreBrowseScrollAnchor();
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  window.setTimeout(apply, 50);
  window.setTimeout(apply, 150);
  return true;
}

/** Restore Y and re-pin across Next soft-nav frames. */
export function pinBrowseScrollY(): boolean {
  const y = readBrowseScrollY();
  if (y == null || typeof window === "undefined") return false;
  const apply = () => window.scrollTo({ top: y, left: 0, behavior: "auto" });
  apply();
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  window.setTimeout(apply, 50);
  window.setTimeout(apply, 150);
  return true;
}

export function restoreBrowseScrollY(): boolean {
  const y = readBrowseScrollY();
  if (y == null) return false;
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
  return true;
}

/** Tell the browse grid to expand lazy rows before/while we pin scroll. */
export function notifyBrowseScrollRestored(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RESTORE_EVENT));
}

export function subscribeBrowseScrollRestored(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RESTORE_EVENT, listener);
  return () => window.removeEventListener(RESTORE_EVENT, listener);
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
