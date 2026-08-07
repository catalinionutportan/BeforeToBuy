import Image from "next/image";
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

  return (
    <div className="relative bg-slate-100/60 aspect-[4/3] w-full overflow-hidden">
      <Image
        src={product.image}
        alt={product.title}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
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

      {product.rating !== undefined && product.reviewsCount !== undefined && (
        <div className="hidden sm:block absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs">
          {ui.verifiedMerchantRating} {product.rating} ({product.reviewsCount})
        </div>
      )}
    </div>
  );
}
