import { sanitizeProductImageForRender } from "@/lib/feed-url-policy";

/** Instant product-modal preview from the browse card (before RSC arrives). */

export type ProductPreviewOffer = {
  id: string;
  storeName: string;
  priceLabel: string;
  sourceLabel: string;
  purchaseUrl: string;
  isLive: boolean;
  ctaLabel: string;
};

export type ProductPreview = {
  id: string;
  title: string;
  brand: string;
  description?: string;
  image?: string;
  price?: number;
  currencySymbol: string;
  storeName?: string;
  compareHeading?: string;
  compareTip?: string;
  sourceLabel?: string;
  ctaLabel?: string;
  gtinLabel?: string;
  gtin?: string;
  offers?: ProductPreviewOffer[];
  serverReady?: boolean;
};

const STORAGE_KEY = "btb:product-preview";

type Listener = () => void;
const listeners = new Set<Listener>();

let memoryPreview: ProductPreview | null = null;
/** True from card click until close — show modal before `/p/:id` URL settles. */
let openPending = false;
/** True only after image decode (+ rAF) so the eye sees one complete frame. */
let paintReady = false;
let prepareToken = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeProductPreview(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProductPreview(): ProductPreview | null {
  return memoryPreview ? withSanitizedPreviewImage(memoryPreview) : null;
}

export function isProductPreviewPaintReady(): boolean {
  return Boolean(memoryPreview && openPending && paintReady);
}

function sanitizePreviewImage(image: string | undefined): string | undefined {
  if (!image?.trim()) return undefined;
  return sanitizeProductImageForRender(image);
}

function withSanitizedPreviewImage<T extends { image?: string }>(preview: T): T {
  if (!preview.image) return preview;
  return { ...preview, image: sanitizePreviewImage(preview.image) };
}

/** Warm browser image cache on card hover — open becomes a same-frame paint. */
export function warmProductPreviewImage(src: string | undefined): void {
  if (!src || typeof window === "undefined") return;
  const safeSrc = sanitizePreviewImage(src);
  if (!safeSrc) return;
  const img = new Image();
  img.decoding = "async";
  img.src = safeSrc;
  void img.decode?.().catch(() => {});
}

function decodeImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    const done = () => resolve();
    if (typeof img.decode === "function") {
      img.decode().then(done, done);
    } else {
      img.onload = done;
      img.onerror = done;
    }
    // Never block the click more than a blink.
    window.setTimeout(done, 100);
  });
}

function markPaintReady(token: number): void {
  if (token !== prepareToken) return;
  // Two frames: commit DOM with decoded bitmap, then reveal together.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (token !== prepareToken) return;
      paintReady = true;
      emit();
    });
  });
}

/**
 * Store preview and open only after the image is decoded so the modal never
 * appears as: empty shell → photo → title → description.
 */
export function saveProductPreview(preview: ProductPreview): void {
  const token = ++prepareToken;
  const sanitized = withSanitizedPreviewImage({ ...preview, serverReady: false });
  memoryPreview = sanitized;
  openPending = true;
  paintReady = false;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // ignore
  }
  emit();

  if (typeof window === "undefined") {
    paintReady = true;
    emit();
    return;
  }

  const start = sanitized.image ? decodeImage(sanitized.image) : Promise.resolve();
  void start.then(() => markPaintReady(token));
}

export function readStoredProductPreview(productId?: string): ProductPreview | null {
  if (memoryPreview && (!productId || memoryPreview.id === productId)) {
    return withSanitizedPreviewImage(memoryPreview);
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductPreview;
    if (!parsed?.id || !parsed?.title) return null;
    if (productId && parsed.id !== productId) return null;
    memoryPreview = withSanitizedPreviewImage(parsed);
    return memoryPreview;
  } catch {
    return null;
  }
}

/**
 * Silent server merge: never change pixels the user already saw.
 * Only wire live purchase URLs onto the painted offer row.
 */
export function enrichProductPreview(patch: Partial<ProductPreview> & { id: string }): void {
  if (!memoryPreview || memoryPreview.id !== patch.id) {
    const token = ++prepareToken;
    memoryPreview = withSanitizedPreviewImage({
      id: patch.id,
      title: patch.title || "",
      brand: patch.brand || "",
      description: patch.description,
      image: patch.image,
      price: patch.price,
      currencySymbol: patch.currencySymbol || "",
      storeName: patch.storeName,
      compareHeading: patch.compareHeading,
      compareTip: patch.compareTip,
      sourceLabel: patch.sourceLabel,
      ctaLabel: patch.ctaLabel,
      gtinLabel: patch.gtinLabel,
      gtin: patch.gtin,
      offers: patch.offers,
      serverReady: true,
    });
    openPending = true;
    paintReady = false;
    emit();
    const start = memoryPreview.image ? decodeImage(memoryPreview.image) : Promise.resolve();
    void start.then(() => markPaintReady(token));
    return;
  }

  const painted = memoryPreview;
  const nextOffers = (painted.offers || []).map((offer) => {
    const live = patch.offers?.find(
      (item) => item.id === offer.id || item.storeName === offer.storeName
    );
    if (!live) return offer;
    return {
      ...offer,
      purchaseUrl: live.purchaseUrl || offer.purchaseUrl,
    };
  });

  if (patch.offers && patch.offers.length > nextOffers.length) {
    const seen = new Set(nextOffers.map((o) => o.id));
    for (const extra of patch.offers) {
      if (!seen.has(extra.id)) nextOffers.push(extra);
    }
  }

  memoryPreview = {
    ...painted,
    offers: nextOffers.length ? nextOffers : painted.offers,
    gtin: painted.gtin || patch.gtin,
    gtinLabel: painted.gtinLabel || patch.gtinLabel,
    serverReady: true,
  };
  emit();
}

export function clearProductPreview(): void {
  prepareToken += 1;
  memoryPreview = null;
  openPending = false;
  paintReady = false;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  emit();
}

function matchesProductPath(pathname: string, productId: string): boolean {
  const encoded = encodeURIComponent(productId);
  return (
    pathname === `/p/${encoded}` ||
    pathname === `/p/${productId}` ||
    pathname.startsWith(`/p/${productId}?`) ||
    pathname.startsWith(`/p/${encoded}?`) ||
    pathname.startsWith(`/p/${productId}/`) ||
    pathname.startsWith(`/p/${encoded}/`)
  );
}

export function shouldShowInstantProductModal(pathname: string): boolean {
  if (!memoryPreview && typeof window !== "undefined") {
    readStoredProductPreview();
  }
  if (!memoryPreview || !paintReady) return false;
  if (openPending) return true;
  return matchesProductPath(pathname, memoryPreview.id);
}

export function hasClientProductShell(productId: string): boolean {
  if (!memoryPreview && typeof window !== "undefined") {
    readStoredProductPreview(productId);
  }
  return memoryPreview?.id === productId;
}
