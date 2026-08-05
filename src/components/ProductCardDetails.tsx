import { Product } from "@/types";
import { HOME_UI } from "@/lib/i18n/ui";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";

interface ProductCardDetailsProps {
  product: Product;
  locale: SiteLocale;
  freshestLabel: string;
}

export function ProductCardDetails({
  product,
  locale,
  freshestLabel,
}: ProductCardDetailsProps) {
  const ui = HOME_UI[locale];

  return (
    <div>
      <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-700 transition-colors">
        {product.title}
      </h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
      {(product.gtin || product.variantKey || freshestLabel) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
          {product.gtin && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold">
              {ui.gtinLabel} {product.gtin.replace(/^0+/, "") || product.gtin}
            </span>
          )}
          {product.variantKey && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium">
              {product.variantKey.replace(/\+/g, " · ")}
            </span>
          )}
          {freshestLabel && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium">
              {freshestLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
