"use client";

import type { ProductPreview } from "@/lib/product-preview";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";

/** Card body shown instantly — same chrome/sections as the final RSC modal. */
export function ProductPreviewContent({ preview }: { preview: ProductPreview }) {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8" aria-busy="true">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          {preview.image ? (
            <div className="absolute inset-6">
              {/* Native img always — instant paint, no optimizer delay. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.image}
                alt={preview.title}
                className="h-full w-full object-contain object-center"
                referrerPolicy={
                  shouldUseNativeProductImage(preview.image) ? "no-referrer" : undefined
                }
                decoding="async"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-slate-100" />
          )}
        </div>

        <div className="space-y-4 min-h-[10rem]">
          {preview.brand ? (
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {preview.brand}
            </p>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wider text-transparent">Brand</p>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {preview.title}
          </h1>
          {/* Reserve description block height so RSC text does not stretch the shell. */}
          <div className="h-24 sm:h-28" aria-hidden="true" />
        </div>
      </div>

      {/* Same offer-row footprint as the live modal (prevents ~1cm bottom jump). */}
      <section className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Compare Product Prices</h2>
        <ul className="space-y-3">
          <li className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              <div className="min-w-0">
                <p className="font-bold text-slate-900">
                  {preview.storeName || "Store"}
                </p>
                <p className="text-[11px] text-slate-500">Production-feed price</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="font-black text-slate-900 tabular-nums">
                  {preview.price != null
                    ? `${preview.currencySymbol}${preview.price.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <span className="inline-flex items-center justify-center bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-80">
                View Offer
              </span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
