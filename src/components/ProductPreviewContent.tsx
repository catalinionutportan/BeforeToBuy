"use client";

import { memo } from "react";
import { ExternalLink } from "lucide-react";
import type { ProductPreview } from "@/lib/product-preview";
import {
  resolveProductImageSrc,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";

/**
 * Frozen presentation. Parent mounts this only after image decode, so
 * photo + title + description paint together — no staged reveal.
 */
function ProductPreviewContentInner({ preview }: { preview: ProductPreview }) {
  const offers = preview.offers ?? [];
  const imageSrc = resolveProductImageSrc(preview.image);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          {imageSrc ? (
            <div className="absolute inset-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={preview.title}
                className="h-full w-full object-contain object-center"
                referrerPolicy={
                  shouldUseNativeProductImage(preview.image) ? "no-referrer" : undefined
                }
                decoding="sync"
                fetchPriority="high"
                loading="eager"
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
          ) : null}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {preview.title}
          </h1>
          {preview.description ? (
            <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-2">
              {preview.description}
            </p>
          ) : null}
          {preview.gtin && preview.gtinLabel ? (
            <p className="text-[11px] text-slate-500 font-semibold">
              {preview.gtinLabel} {preview.gtin.replace(/^0+/, "") || preview.gtin}
            </p>
          ) : null}
        </div>
      </div>

      <section className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-4">
        {(preview.compareHeading || preview.compareTip) && (
          <div className="space-y-1">
            {preview.compareHeading ? (
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {preview.compareHeading}
              </h2>
            ) : null}
            {preview.compareTip ? (
              <p className="text-xs text-slate-500 leading-relaxed">{preview.compareTip}</p>
            ) : null}
          </div>
        )}
        <ul className="space-y-3">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{offer.storeName}</p>
                  {offer.sourceLabel ? (
                    <p className="text-[11px] text-slate-500">{offer.sourceLabel}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-black text-slate-900 tabular-nums">{offer.priceLabel}</p>
                </div>
                <ConsentAwareAffiliateLink
                  href={offer.purchaseUrl}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                  ariaLabel={`${offer.ctaLabel} ${offer.storeName}`}
                >
                  <span>{offer.ctaLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </ConsentAwareAffiliateLink>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function previewVisualKey(preview: ProductPreview): string {
  return [
    preview.id,
    preview.title,
    preview.image,
    preview.description,
    preview.compareHeading,
    preview.compareTip,
    ...(preview.offers ?? []).flatMap((offer) => [
      offer.id,
      offer.storeName,
      offer.priceLabel,
      offer.ctaLabel,
      offer.sourceLabel,
      offer.purchaseUrl,
    ]),
  ].join("|");
}

export const ProductPreviewContent = memo(
  ProductPreviewContentInner,
  (prev, next) => previewVisualKey(prev.preview) === previewVisualKey(next.preview)
);
