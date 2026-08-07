"use client";

import { useEffect, useId, useState } from "react";
import { ChevronRight, Layers, Menu, X } from "lucide-react";
import {
  ALL_CATEGORIES_ID,
  SHOPPING_CATEGORIES,
  getParentCategoryId,
} from "@/lib/categories";
import {
  getDepartmentLabel,
  getSubcategoryLabel,
  type CategoryLocale,
} from "@/lib/category-i18n";
import { HOME_UI } from "@/lib/i18n/ui";

interface CategoryFlyoutMenuProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  locale: CategoryLocale;
}

export function CategoryFlyoutMenu({
  open,
  onClose,
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  locale,
}: CategoryFlyoutMenuProps) {
  const ui = HOME_UI[locale];
  const titleId = useId();
  const parentFromSelection = getParentCategoryId(selectedCategory);
  const [activeDeptId, setActiveDeptId] = useState<string>(
    parentFromSelection && parentFromSelection !== selectedCategory
      ? parentFromSelection
      : selectedCategory !== ALL_CATEGORIES_ID
        ? selectedCategory
        : SHOPPING_CATEGORIES[0]?.id || ""
  );

  useEffect(() => {
    if (!open) return;
    const parent = getParentCategoryId(selectedCategory);
    if (parent && parent !== selectedCategory) {
      setActiveDeptId(parent);
    } else if (
      selectedCategory !== ALL_CATEGORIES_ID &&
      SHOPPING_CATEGORIES.some((c) => c.id === selectedCategory)
    ) {
      setActiveDeptId(selectedCategory);
    }
  }, [open, selectedCategory]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const activeDept =
    SHOPPING_CATEGORIES.find((category) => category.id === activeDeptId) ||
    SHOPPING_CATEGORIES[0];

  const selectAndClose = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Bokeh backdrop */}
      <button
        type="button"
        aria-label={ui.menuClose}
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-slate-950/70 backdrop-blur-md"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-16 left-[-10%] h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute top-[30%] right-[-15%] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute top-[55%] left-[45%] h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative z-10 m-2 sm:m-4 flex h-[min(92dvh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Menu className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p id={titleId} className="text-sm font-extrabold text-white truncate">
                {ui.menuTitle}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{ui.menuSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <button
            type="button"
            onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
              selectedCategory === ALL_CATEGORIES_ID
                ? "bg-emerald-500 text-slate-950"
                : "bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            {ui.hubAll}
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Left: departments */}
          <nav
            aria-label={ui.menuCategories}
            className="w-[42%] min-w-[9.5rem] max-w-[12rem] overflow-y-auto border-r border-white/10 bg-black/20 custom-scrollbar"
          >
            <ul className="py-1">
              {SHOPPING_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const count = categoryCounts?.[category.id] ?? 0;
                const active = activeDeptId === category.id;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => setActiveDeptId(category.id)}
                      className={`flex w-full items-center gap-2 px-3 py-3 text-left transition-colors ${
                        active
                          ? "bg-emerald-500/20 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? "text-emerald-300" : "text-slate-500"}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold leading-tight line-clamp-2">
                          {getDepartmentLabel(category.id, locale)}
                        </span>
                        {count > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            {count}
                          </span>
                        )}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 ${active ? "text-emerald-300" : "text-slate-600"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: subcategories */}
          <div className="min-w-0 flex-1 overflow-y-auto bg-slate-950/40 custom-scrollbar">
            {activeDept ? (
              <div className="space-y-3 p-3 sm:p-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
                    {ui.menuSubcategories}
                  </p>
                  <h3 className="text-base font-extrabold text-white">
                    {getDepartmentLabel(activeDept.id, locale)}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {activeDept.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => selectAndClose(activeDept.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    selectedCategory === activeDept.id
                      ? "border-emerald-400 bg-emerald-500 text-slate-950"
                      : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  }`}
                >
                  {ui.menuSeeAllInDepartment}
                  {(categoryCounts?.[activeDept.id] ?? 0) > 0
                    ? ` · ${categoryCounts?.[activeDept.id]}`
                    : ""}
                </button>

                <ul className="space-y-1.5">
                  {activeDept.subcategories.map((sub) => {
                    const count = categoryCounts?.[sub.id] ?? 0;
                    const selected = selectedCategory === sub.id;
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => selectAndClose(sub.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? "border-emerald-400 bg-emerald-500/20 text-white"
                              : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-emerald-400/40 hover:bg-white/5"
                          }`}
                        >
                          <span className="text-[12px] font-semibold leading-snug">
                            {getSubcategoryLabel(sub.id, locale)}
                          </span>
                          {count > 0 ? (
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                                selected
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {count}
                            </span>
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="p-6 text-sm text-slate-400">{ui.menuPickCategory}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
