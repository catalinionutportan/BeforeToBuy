"use client";

import { useEffect } from "react";
import {
  clearProductPreview,
  markServerProductModalMounted,
} from "@/lib/product-preview";

/** Marks the RSC product modal as ready so the instant overlay can unmount. */
export function ProductModalReady() {
  useEffect(() => {
    markServerProductModalMounted();
    return () => {
      clearProductPreview();
    };
  }, []);

  return null;
}
