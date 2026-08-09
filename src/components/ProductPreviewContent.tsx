"use client";

import type { ProductPreview } from "@/lib/product-preview";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";

/** Card body shown instantly from browse-card data (no server wait). */
export function ProductPreviewContent({ preview }: { preview: ProductPreview }) {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8" aria-busy="true">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          {preview.image ? (
            <div className="absolute inset-6">
              {shouldUseNativeProductImage(preview.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="h-full w-full object-contain object-center"
                  referrerPolicy="no-referrer"
                  decoding="async"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="h-full w-full object-contain object-center"
                  decoding="async"
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 bg-slate-100 animate-pulse" />
          )}
        </div>

        <div className="space-y-4">
          {preview.brand ? (
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {preview.brand}
            </p>
          ) : null}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {preview.title}
          </h1>
          {preview.price != null ? (
            <p className="text-2xl font-black text-emerald-700 tabular-nums">
              {preview.currencySymbol}
              {preview.price.toLocaleString()}
              {preview.storeName ? (
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  · {preview.storeName}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className="text-sm text-slate-400">Loading offers…</p>
        </div>
      </div>

      <section className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-3 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-16 bg-white rounded-2xl border border-slate-100" />
      </section>
    </div>
  );
}
