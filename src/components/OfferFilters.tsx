"use client";

import {
  MAX_TOTAL_PRICE_OPTIONS,
  type OfferFilterCriteria,
} from "@/lib/offers/offer-filters";
import { OFFER_FILTER_UI, type CategoryLocale } from "@/lib/category-i18n";
import { PackageCheck, Tag, Truck } from "lucide-react";

interface OfferFiltersProps {
  criteria: OfferFilterCriteria;
  brandOptions: string[];
  currencySymbol?: string;
  locale: CategoryLocale;
  onChange: (next: OfferFilterCriteria) => void;
}

export function OfferFilters({
  criteria,
  brandOptions,
  currencySymbol = "CHF",
  locale,
  onChange,
}: OfferFiltersProps) {
  const ui = OFFER_FILTER_UI[locale];

  const patch = (partial: Partial<OfferFilterCriteria>) => {
    onChange({ ...criteria, ...partial });
  };

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3 min-w-0">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {ui.title}
        </p>
        <p className="text-[10px] text-slate-400 break-words">{ui.hint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <label className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 min-w-0">
          <Tag className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="sr-only">{ui.allBrands}</span>
          <select
            value={criteria.brand ?? ""}
            onChange={(event) =>
              patch({ brand: event.target.value || undefined })
            }
            className="max-w-[9.5rem] min-w-0 bg-transparent text-[11px] font-bold text-slate-800 outline-none"
          >
            <option value="">{ui.allBrands}</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
          <span className="text-slate-500">De la:</span>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={criteria.minTotalPrice ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              patch({
                minTotalPrice: value ? Number(value) : undefined,
              });
            }}
            className="w-16 bg-transparent text-[11px] font-bold text-slate-800 outline-none"
          />
          <span className="text-slate-500 font-normal">{currencySymbol}</span>
        </label>

        <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
          <span className="text-slate-500">Până la:</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={criteria.maxTotalPrice ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              patch({
                maxTotalPrice: value ? Number(value) : undefined,
              });
            }}
            className="w-16 bg-transparent text-[11px] font-bold text-slate-800 outline-none"
          />
          <span className="text-slate-500 font-normal">{currencySymbol}</span>
        </label>

        <button
          type="button"
          onClick={() => patch({ inStockOnly: !criteria.inStockOnly })}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
            criteria.inStockOnly
              ? "border-emerald-500 bg-emerald-600 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <PackageCheck className="h-3.5 w-3.5" />
          {ui.inStock}
        </button>

        <button
          type="button"
          onClick={() => patch({ freeDeliveryOnly: !criteria.freeDeliveryOnly })}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
            criteria.freeDeliveryOnly
              ? "border-emerald-500 bg-emerald-600 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          {ui.freeDelivery}
        </button>

        <button
          type="button"
          onClick={() => patch({ hasGtinOnly: !criteria.hasGtinOnly })}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
            criteria.hasGtinOnly
              ? "border-emerald-500 bg-emerald-600 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
          title="EAN / GTIN"
        >
          {ui.withEan}
        </button>
      </div>
    </div>
  );
}
