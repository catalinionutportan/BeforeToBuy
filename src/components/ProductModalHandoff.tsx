"use client";

import { useEffect } from "react";
import {
  clearProductPreview,
  enrichProductPreview,
  type ProductPreviewOffer,
} from "@/lib/product-preview";

export type ProductModalHandoffPayload = {
  id: string;
  title: string;
  brand: string;
  description?: string;
  image?: string;
  currencySymbol: string;
  compareHeading: string;
  compareTip: string;
  gtinLabel: string;
  gtin?: string;
  offers: ProductPreviewOffer[];
};

/**
 * Soft + hard product routes: push RSC data into the shared preview store.
 * InstantProductModalHost owns the only Modal shell — never mount a second one.
 */
export function ProductModalHandoff({ payload }: { payload: ProductModalHandoffPayload }) {
  useEffect(() => {
    enrichProductPreview({
      id: payload.id,
      title: payload.title,
      brand: payload.brand,
      description: payload.description,
      image: payload.image,
      currencySymbol: payload.currencySymbol,
      storeName: payload.offers[0]?.storeName,
      compareHeading: payload.compareHeading,
      compareTip: payload.compareTip,
      gtinLabel: payload.gtinLabel,
      gtin: payload.gtin,
      offers: payload.offers,
    });
    return () => {
      clearProductPreview();
    };
  }, [payload]);

  return null;
}
