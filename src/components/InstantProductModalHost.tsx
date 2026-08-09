"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ProductPreviewContent } from "@/components/ProductPreviewContent";
import {
  clearProductPreview,
  getProductPreview,
  isProductPreviewPaintReady,
  shouldShowInstantProductModal,
  subscribeProductPreview,
} from "@/lib/product-preview";

function usePreviewSnapshot() {
  return useSyncExternalStore(
    subscribeProductPreview,
    () => {
      const preview = getProductPreview();
      if (!preview || !isProductPreviewPaintReady()) return "";
      const offerVersion = (preview.offers ?? [])
        .map((offer) => `${offer.id}:${offer.purchaseUrl}`)
        .join("|");
      return `${preview.id}:${shouldShowInstantProductModal(window.location.pathname) ? "1" : "0"}:${offerVersion}`;
    },
    () => ""
  );
}

/**
 * Mounts only after image decode. First browser paint is the complete modal.
 */
export function InstantProductModalHost() {
  const pathname = usePathname();
  const snapshot = usePreviewSnapshot();
  const [paintOpacity, setPaintOpacity] = useState(0);

  const preview = snapshot ? getProductPreview() : null;
  const open = Boolean(preview) && shouldShowInstantProductModal(pathname);

  useLayoutEffect(() => {
    // First render is opacity 0; flip to 1 in layout so the browser's first
    // paint is the complete modal (shell + image + title + description).
    setPaintOpacity(open ? 1 : 0);
  }, [open, preview?.id]);

  if (!open || !preview) return null;

  return (
    <Modal
      lockScroll={false}
      paintOpacity={paintOpacity}
      onClose={clearProductPreview}
    >
      <ProductPreviewContent preview={preview} />
    </Modal>
  );
}
