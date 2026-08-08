"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { Sparkles } from "lucide-react";

interface ProductCardImageProps {
  product: Product;
  locale: SiteLocale;
  verifiedBadgeOffer?: { badge: string };
}

export function ProductCardImage({
  product,
  locale,
  verifiedBadgeOffer,
}: ProductCardImageProps) {
  const ui = HOME_UI[locale];
  const [broken, setBroken] = useState(false);

  return (
    <div className="relative bg-slate-100/60 aspect-square w-full overflow-hidden">
      {/* Padding on the frame only — padding on fill Image crops tall appliances. */}
      <div className="absolute inset-2 sm:inset-3">
        {!broken && product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-contain object-center"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 text-[11px] font-medium text-slate-400">
            {product.brand}
          </div>
        )}
      </div>

      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-[1] flex max-w-[90%] flex-col items-start gap-1 sm:gap-1.5">
        <span className="max-w-full truncate rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[11px]">
          {product.brand}
        </span>

        {verifiedBadgeOffer?.badge && (
          <span className="hidden items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs sm:flex">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {verifiedBadgeOffer.badge}
          </span>
        )}
      </div>

      {product.rating !== undefined && product.reviewsCount !== undefined && (
        <div className="absolute bottom-3 right-3 z-[1] hidden rounded-lg border border-slate-200 bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md sm:block">
          {ui.verifiedMerchantRating} {product.rating} ({product.reviewsCount})
        </div>
      )}
    </div>
  );
}
