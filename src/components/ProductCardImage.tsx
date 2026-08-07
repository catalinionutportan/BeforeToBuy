import Image from "next/image";
import { Product } from "@/types";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { SiteLocale } from "@/lib/i18n/locales";
import { Sparkles } from "lucide-react";

interface ProductCardImageProps {
  product: Product;
  locale: SiteLocale;
  verifiedBadgeOffer?: { badge: string };
  lowestPriceLabel?: string;
  offerCount?: number;
}

export function ProductCardImage({
  product,
  locale,
  verifiedBadgeOffer,
  lowestPriceLabel,
  offerCount,
}: ProductCardImageProps) {
  const ui = HOME_UI[locale];

  return (
    <div className="relative bg-slate-100/60 h-36 sm:h-48 md:h-60 overflow-hidden">
      <Image
        src={product.image}
        alt={product.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain p-3 sm:p-5 md:p-6 transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 items-start max-w-[90%]">
        <span className="bg-slate-900/85 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg uppercase tracking-wider truncate max-w-full">
          {product.brand}
        </span>

        {verifiedBadgeOffer?.badge && (
          <span className="hidden sm:flex bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs items-center gap-1">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            {verifiedBadgeOffer.badge}
          </span>
        )}
      </div>

      {lowestPriceLabel != null && (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-auto">
          <div className="inline-flex max-w-full flex-col gap-0.5 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md border border-emerald-200/90 px-2 py-1.5 sm:px-3 sm:py-2 shadow-xs">
            <p className="text-[10px] sm:text-xs font-extrabold text-emerald-900 tabular-nums leading-tight truncate">
              {formatUi(ui.cardLowestPrice, { price: lowestPriceLabel })}
            </p>
            {offerCount != null && offerCount > 1 && (
              <p className="text-[9px] sm:text-[10px] font-semibold text-emerald-800/75 leading-tight">
                {ui.cardTapForAllPrices}
              </p>
            )}
          </div>
        </div>
      )}

      {product.rating !== undefined && product.reviewsCount !== undefined && (
        <div className="hidden lg:block absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs">
          {ui.verifiedMerchantRating} {product.rating} ({product.reviewsCount})
        </div>
      )}
    </div>
  );
}
