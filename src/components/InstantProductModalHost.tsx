"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ProductPreviewContent } from "@/components/ProductPreviewContent";
import {
  clearProductPreview,
  getProductPreview,
  shouldShowInstantProductModal,
  subscribeProductPreview,
} from "@/lib/product-preview";

function usePreviewVersion() {
  return useSyncExternalStore(
    subscribeProductPreview,
    () =>
      `${getProductPreview()?.id ?? ""}:${shouldShowInstantProductModal(window.location.pathname)}`,
    () => ""
  );
}

/**
 * Opens the product card from browse-card data on the same click tick,
 * before the Next RSC modal payload arrives.
 */
export function InstantProductModalHost() {
  const pathname = usePathname();
  const version = usePreviewVersion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !version) return null;

  const preview = getProductPreview();
  if (!preview || !shouldShowInstantProductModal(pathname)) return null;

  return (
    <Modal lockScroll={false} onClose={clearProductPreview}>
      <ProductPreviewContent preview={preview} />
    </Modal>
  );
}
