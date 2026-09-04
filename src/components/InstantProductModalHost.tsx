"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ProductPreviewContent } from "@/components/ProductPreviewContent";
import {
  clearProductPreview,
  getProductPreview,
  shouldShowInstantProductModal,
  subscribeProductPreview,
} from "@/lib/product-preview";

function usePreviewSnapshot() {
  return useSyncExternalStore(
    subscribeProductPreview,
    () => {
      const preview = getProductPreview();
      if (!preview) return "";
      const offerVersion = (preview.offers ?? [])
        .map((offer) => `${offer.id}:${offer.purchaseUrl}`)
        .join("|");
      return `${preview.id}:${shouldShowInstantProductModal(window.location.pathname) ? "1" : "0"}:${offerVersion}`;
    },
    () => ""
  );
}

export function InstantProductModalHost() {
  const pathname = usePathname();
  const snapshot = usePreviewSnapshot();

  const preview = snapshot ? getProductPreview() : null;
  const open = Boolean(preview) && shouldShowInstantProductModal(pathname);

  if (!open || !preview) return null;

  return (
    <Modal
      lockScroll={false}
      paintOpacity={1}
      onClose={clearProductPreview}
    >
      <ProductPreviewContent preview={preview} />
    </Modal>
  );
}
