"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Maximize2, X } from "lucide-react";
import type { Product } from "@/types";
import {
  resolveProductImageSrc,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";

type Props = {
  product: Product;
  currencySymbol: string;
  total: number;
  storeLine?: string;
  purchaseUrl?: string;
  isCheapest: boolean;
  cheapestLabel: string;
  bestOfferLabel: string;
  buyNowLabel: string;
  specsLabel: string;
  expandImageLabel: string;
};

/**
 * Compare column — presentation first (image + identity), price second.
 * Mirrors the product modal hierarchy people already like.
 */
export function CompareProductColumn({
  product,
  currencySymbol,
  total,
  storeLine,
  purchaseUrl,
  isCheapest,
  cheapestLabel,
  bestOfferLabel,
  buyNowLabel,
  specsLabel,
  expandImageLabel,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageSrc = resolveProductImageSrc(product.image);
  const description = (product.description || "").trim();
  const showDescription =
    description.length > 0 &&
    description.toLowerCase() !== product.title.trim().toLowerCase();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col relative h-full min-w-0">
      {isCheapest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10 whitespace-nowrap">
          {cheapestLabel}
        </div>
      )}

      {/* 1. Product presentation — first thing you see */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-2xl mb-4 border border-slate-100 overflow-hidden">
        {imageSrc ? (
          <div className="absolute inset-4 sm:inset-6">
            {shouldUseNativeProductImage(product.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={product.title}
                className="h-full w-full object-contain object-center"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            ) : (
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 50vw, 40vw"
                priority
              />
            )}
          </div>
        ) : null}

        {product.image ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-white/95 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm hover:bg-white"
            aria-label={expandImageLabel}
            title={expandImageLabel}
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{expandImageLabel}</span>
          </button>
        ) : null}
      </div>

      {/* 2. Identity */}
      {product.brand ? (
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
          {product.brand}
        </p>
      ) : null}
      <h2 className="text-sm sm:text-lg font-bold text-slate-900 mb-4 leading-snug">
        {product.title}
      </h2>

      {/* 3. Price + CTA — after you know what the product is */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 text-center mb-3">
        <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          {bestOfferLabel}
        </p>
        <p className="text-xl sm:text-3xl font-black text-emerald-700 tabular-nums">
          {currencySymbol}
          {total.toLocaleString()}
        </p>
        {storeLine ? (
          <p className="text-xs text-slate-600 mt-1">{storeLine}</p>
        ) : null}
      </div>

      {purchaseUrl ? (
        <ConsentAwareAffiliateLink
          href={purchaseUrl}
          className="w-full py-3 sm:py-3.5 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm mb-4"
        >
          {buyNowLabel} <ExternalLink className="w-4 h-4" />
        </ConsentAwareAffiliateLink>
      ) : null}

      {showDescription ? (
        <div className="mt-auto border-t border-slate-100 pt-3 flex-1 flex flex-col">
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {specsLabel}
          </h3>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {description}
          </div>
        </div>
      ) : null}

      {lightboxOpen && imageSrc ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={product.title}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white text-slate-700 hover:bg-slate-100"
            aria-label="Close"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-3xl aspect-square bg-white rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {shouldUseNativeProductImage(product.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={product.title}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                className="object-contain p-6"
                sizes="90vw"
                priority
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
