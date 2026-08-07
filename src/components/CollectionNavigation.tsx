"use client";

import { ALL_CATEGORIES_ID, COMPARISON_COLLECTION_FILTERS, isCollectionFilter } from "@/lib/categories";
import {
  CATEGORY_UI,
  getCollectionLabel,
  type CategoryLocale,
} from "@/lib/category-i18n";
import { Flame, Globe, PackageOpen } from "lucide-react";

const COLLECTION_ICONS = {
  "compare-cross-border": Globe,
  sale: Flame,
  "compare-refurb": PackageOpen,
} as const;

interface CollectionNavigationProps {
  selectedCategory: string;
  onCollectionChange: (filterId: string) => void;
  collectionCounts?: Record<string, number>;
  locale: CategoryLocale;
}

function formatCount(count: number | undefined): string | null {
  if (count === undefined || count <= 0) return null;
  return String(count);
}

export function CollectionNavigation({
  selectedCategory,
  onCollectionChange,
  collectionCounts,
  locale,
}: CollectionNavigationProps) {
  const ui = CATEGORY_UI[locale];
  const visibleCollections = COMPARISON_COLLECTION_FILTERS.filter(
    (collection) =>
      collectionCounts === undefined ||
      (collectionCounts[collection.id] ?? 0) > 0 ||
      selectedCategory === collection.id
  );

  if (visibleCollections.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {ui.comparisonCollections}
        </p>
        <p className="text-[10px] text-slate-400">{ui.collectionsHint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {visibleCollections.map((collection) => {
          const Icon = COLLECTION_ICONS[collection.id as keyof typeof COLLECTION_ICONS];
          const isActive = selectedCategory === collection.id;
          const countLabel = formatCount(collectionCounts?.[collection.id]);

          return (
            <button
              key={collection.id}
              type="button"
              onClick={() =>
                onCollectionChange(isActive ? ALL_CATEGORIES_ID : collection.id)
              }
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? "border-orange-500 bg-orange-600 text-white shadow-xs"
                  : "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-orange-100" : "text-orange-600"}`} />
              <span>{getCollectionLabel(collection.id, locale)}</span>
              {countLabel && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                    isActive ? "bg-orange-500 text-white" : "bg-white text-orange-700"
                  }`}
                >
                  {countLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function isActiveCollectionSelection(categoryId: string): boolean {
  return isCollectionFilter(categoryId);
}
