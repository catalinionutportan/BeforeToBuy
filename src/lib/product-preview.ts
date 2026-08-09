/** Instant product-modal preview from the browse card (before RSC arrives). */

export type ProductPreview = {
  id: string;
  title: string;
  brand: string;
  image?: string;
  price?: number;
  currencySymbol: string;
  storeName?: string;
};

const STORAGE_KEY = "btb:product-preview";

type Listener = () => void;
const listeners = new Set<Listener>();

let memoryPreview: ProductPreview | null = null;
/** True from card click until the server modal mounts. */
let pendingInstant = false;
let serverModalMounted = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeProductPreview(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProductPreview(): ProductPreview | null {
  return memoryPreview;
}

export function isProductPreviewPending(): boolean {
  return pendingInstant;
}

export function isServerProductModalMounted(): boolean {
  return serverModalMounted;
}

export function saveProductPreview(preview: ProductPreview): void {
  memoryPreview = preview;
  pendingInstant = true;
  serverModalMounted = false;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
  } catch {
    // ignore
  }
  emit();
}

export function readStoredProductPreview(productId?: string): ProductPreview | null {
  if (memoryPreview && (!productId || memoryPreview.id === productId)) {
    return memoryPreview;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductPreview;
    if (!parsed?.id || !parsed?.title) return null;
    if (productId && parsed.id !== productId) return null;
    memoryPreview = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function markServerProductModalMounted(): void {
  serverModalMounted = true;
  pendingInstant = false;
  emit();
}

export function clearProductPreview(): void {
  memoryPreview = null;
  pendingInstant = false;
  serverModalMounted = false;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  emit();
}

/** Show the instant overlay until the real RSC modal takes over. */
export function shouldShowInstantProductModal(pathname: string): boolean {
  if (!memoryPreview && typeof window !== "undefined") {
    readStoredProductPreview();
  }
  if (!memoryPreview) return false;
  if (serverModalMounted) return false;
  if (pendingInstant) return true;
  return pathname === `/p/${encodeURIComponent(memoryPreview.id)}` ||
    pathname === `/p/${memoryPreview.id}` ||
    pathname.startsWith(`/p/${memoryPreview.id}`) ||
    pathname.startsWith(`/p/${encodeURIComponent(memoryPreview.id)}`);
}
