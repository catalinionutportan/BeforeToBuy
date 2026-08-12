"use client";

import { type OfferFilterCriteria } from "@/lib/offers/offer-filters";
import { OFFER_FILTER_UI, type CategoryLocale } from "@/lib/category-i18n";
import { Tag } from "lucide-react";

interface OfferFiltersProps {
  criteria: OfferFilterCriteria;
  brandOptions: string[];
  currencySymbol?: string;
  locale: CategoryLocale;
  onChange: (next: OfferFilterCriteria) => void;
  /** Inline chips only — no section title (for a single horizontal toolbar). */
  compact?: boolean;
}

export function OfferFilters({
  criteria,
  brandOptions,
  currencySymbol = "CHF",
  locale,
  onChange,
  compact = false,
}: OfferFiltersProps) {
  const ui = OFFER_FILTER_UI[locale];

  const patch = (partial: Partial<OfferFilterCriteria>) => {
    onChange({ ...criteria, ...partial });
  };

  const controls = (
    <>
      <label className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
        <Tag className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span className="sr-only">{ui.allBrands}</span>
        <select
          value={criteria.brand ?? ""}
          onChange={(event) => patch({ brand: event.target.value || undefined })}
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
        <span className="text-slate-500">{ui.minTotal}:</span>
        <input
          type="number"
          min="0"
          placeholder={ui.anyPrice}
          value={criteria.minTotalPrice ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            patch({
              minTotalPrice: value ? Number(value) : undefined,
            });
          }}
          className="w-14 bg-transparent text-[11px] font-bold text-slate-800 outline-none sm:w-16"
        />
        <span className="font-normal text-slate-500">{currencySymbol}</span>
      </label>

      <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
        <span className="text-slate-500">{ui.maxTotal}:</span>
        <input
          type="number"
          min="0"
          placeholder={ui.anyPrice}
          value={criteria.maxTotalPrice ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            patch({
              maxTotalPrice: value ? Number(value) : undefined,
            });
          }}
          className="w-14 bg-transparent text-[11px] font-bold text-slate-800 outline-none sm:w-16"
        />
        <span className="font-normal text-slate-500">{currencySymbol}</span>
      </label>
    </>
  );

  if (compact) {
    return <>{controls}</>;
  }

  return (
    <div className="min-w-0 space-y-2 border-t border-slate-100 pt-3">
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {ui.title}
        </p>
        <p className="break-words text-[10px] text-slate-400">{ui.hint}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{controls}</div>
    </div>
  );
}
