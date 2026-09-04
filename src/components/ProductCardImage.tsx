"use client";

import { useState } from "react";
import { Product } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { ShoppingBag, Sparkles } from "lucide-react";

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
  const displayBrand =
    product.brand && product.brand.toLowerCase() !== "generic"
      ? product.brand
      : product.offers?.[0]?.storeName || "";

  return (
    <div className="relative bg-slate-100/60 aspect-square w-full overflow-hidden">
      {/* Native <img> for instant modal/card paint (sanitized URLs). Compare/detail routes use Next/Image. */}
      <div className="absolute inset-2 sm:inset-3">
        {!broken && product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain object-center"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100/80 p-3 text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white shadow-xs">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" aria-hidden="true" />
            </div>
            {displayBrand ? (
              <span className="max-w-[90%] truncate text-[11px] font-bold text-slate-600">
                {displayBrand}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {displayBrand ? (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-[1] flex max-w-[90%] flex-col items-start gap-1 sm:gap-1.5">
          <span className="max-w-full truncate rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[11px]">
            {displayBrand}
          </span>

          {verifiedBadgeOffer?.badge && (
            <span className="hidden items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs sm:flex">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {verifiedBadgeOffer.badge}
            </span>
          )}
        </div>
      ) : null}

      {product.rating !== undefined && product.reviewsCount !== undefined && (
        <div className="absolute bottom-3 right-3 z-[1] hidden rounded-lg border border-slate-200 bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md sm:block">
          {ui.verifiedMerchantRating} {product.rating} ({product.reviewsCount})
        </div>
      )}
    </div>
  );
}
