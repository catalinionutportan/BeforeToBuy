"use client";

import { useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, X } from "lucide-react";
import {
  ALL_CATEGORIES_ID,
  SHOPPING_CATEGORIES,
  getParentCategoryId,
  type ShoppingCategory,
  type ShoppingSubcategory,
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

type MenuLevel = "root" | "department" | "group";

/** Compact Apple-like row: hugs label, soft shadow, black type. */
function menuRowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left transition-colors",
    "bg-[#fffcf8] text-neutral-950",
    "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]",
    "hover:bg-white active:bg-[#f3efe8]",
    selected ? "ring-1 ring-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]" : "",
  ].join(" ");
}

function nodeContainsSelected(node: ShoppingSubcategory, selectedId: string): boolean {
  if (node.id === selectedId) return true;
  return Boolean(node.children?.some((child) => nodeContainsSelected(child, selectedId)));
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
  const [level, setLevel] = useState<MenuLevel>("root");
  const [activeDept, setActiveDept] = useState<ShoppingCategory | null>(null);
  /** Stack for Fashion → Shoes → Women → Sneakers drill-down. */
  const [groupStack, setGroupStack] = useState<ShoppingSubcategory[]>([]);

  useEffect(() => {
    if (!open) return;
    setLevel("root");
    setActiveDept(null);
    setGroupStack([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (groupStack.length > 0) {
        setGroupStack((stack) => {
          const next = stack.slice(0, -1);
          if (next.length === 0) setLevel("department");
          return next;
        });
      } else if (level === "department") {
        setLevel("root");
        setActiveDept(null);
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, level, groupStack.length]);

  if (!open) return null;

  const selectAndClose = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  const goBack = () => {
    if (groupStack.length > 0) {
      const next = groupStack.slice(0, -1);
      setGroupStack(next);
      if (next.length === 0) setLevel("department");
      return;
    }
    if (level === "department") {
      setLevel("root");
      setActiveDept(null);
      return;
    }
    onClose();
  };

  const openDepartment = (category: ShoppingCategory) => {
    if (category.subcategories.length === 0) {
      selectAndClose(category.id);
      return;
    }
    setActiveDept(category);
    setGroupStack([]);
    setLevel("department");
  };

  const openGroup = (sub: ShoppingSubcategory) => {
    if (sub.children?.length) {
      setGroupStack((stack) => [...stack, sub]);
      setLevel("group");
      return;
    }
    selectAndClose(sub.id);
  };

  const activeGroup = groupStack[groupStack.length - 1] ?? null;

  const title =
    activeGroup
      ? getSubcategoryLabel(activeGroup.id, locale)
      : level === "department" && activeDept
        ? getDepartmentLabel(activeDept.id, locale)
        : ui.menuTitle;

  const subtitle =
    level === "group" || level === "department" ? ui.menuSubcategories : ui.menuSubtitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label={ui.menuClose}
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-black/25 backdrop-blur-[2px]"
      />

      <div
        className="relative z-10 m-2 sm:m-4 flex h-[min(92dvh,920px)] w-full max-w-md flex-col overflow-hidden rounded-[22px] border border-black/[0.06] bg-[#f5f1ea] shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fffcf7 0%, #f5f1ea 42%, #efe9df 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3.5">
          <div className="min-w-0">
            <p
              id={titleId}
              className="truncate text-[17px] font-semibold tracking-tight text-neutral-950"
            >
              {title}
            </p>
            <p className="truncate text-[12px] text-neutral-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-neutral-800 hover:bg-black/[0.1]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1 custom-scrollbar">
          {level === "root" ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
                className={menuRowClass(selectedCategory === ALL_CATEGORIES_ID)}
              >
                <Layers className="h-4 w-4 shrink-0 text-neutral-700" aria-hidden="true" />
                <span className="text-[15px] font-medium leading-none">{ui.hubAll}</span>
              </button>

              <nav aria-label={ui.menuCategories}>
                <ul className="space-y-1.5">
                  {SHOPPING_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const count = categoryCounts?.[category.id] ?? 0;
                    const hasSubs = category.subcategories.length > 0;
                    const selected =
                      selectedCategory === category.id ||
                      selectedCategory.startsWith(`${category.id}-`) ||
                      getParentCategoryId(selectedCategory) === category.id;

                    return (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() => openDepartment(category)}
                          className={menuRowClass(selected)}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-neutral-700"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-medium leading-snug">
                              {getDepartmentLabel(category.id, locale)}
                            </span>
                            {count > 0 && (
                              <span className="mt-0.5 block text-[11px] font-normal text-neutral-500">
                                {count}
                              </span>
                            )}
                          </span>
                          {hasSubs && (
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-neutral-400"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          ) : level === "department" && activeDept ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => selectAndClose(activeDept.id)}
                className={menuRowClass(selectedCategory === activeDept.id)}
              >
                <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
                  {ui.menuSeeAllInDepartment}
                </span>
                {(categoryCounts?.[activeDept.id] ?? 0) > 0 && (
                  <span className="shrink-0 text-[12px] font-medium text-neutral-500">
                    {categoryCounts?.[activeDept.id]}
                  </span>
                )}
              </button>

              <ul className="space-y-1.5">
                {activeDept.subcategories.map((sub) => {
                  const count = categoryCounts?.[sub.id] ?? 0;
                  const hasChildren = Boolean(sub.children?.length);
                  const selected = nodeContainsSelected(sub, selectedCategory);
                  return (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => openGroup(sub)}
                        className={menuRowClass(selected)}
                      >
                        <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
                          {getSubcategoryLabel(sub.id, locale)}
                        </span>
                        {count > 0 && (
                          <span className="shrink-0 text-[12px] font-medium text-neutral-500">
                            {count}
                          </span>
                        )}
                        {hasChildren && (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-neutral-400"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : level === "group" && activeGroup?.children ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => selectAndClose(activeGroup.id)}
                className={menuRowClass(selectedCategory === activeGroup.id)}
              >
                <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
                  {ui.menuSeeAllInDepartment}
                </span>
              </button>

              <ul className="space-y-1.5">
                {activeGroup.children.map((child) => {
                  const count = categoryCounts?.[child.id] ?? 0;
                  const hasChildren = Boolean(child.children?.length);
                  const selected = nodeContainsSelected(child, selectedCategory);
                  return (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => openGroup(child)}
                        className={menuRowClass(selected)}
                      >
                        <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
                          {getSubcategoryLabel(child.id, locale)}
                        </span>
                        {count > 0 && (
                          <span className="shrink-0 text-[12px] font-medium text-neutral-500">
                            {count}
                          </span>
                        )}
                        {hasChildren && (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-neutral-400"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        {(level === "department" || level === "group") && (
          <div className="flex items-center justify-end px-4 pb-3.5 pt-1">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-3 py-1.5 text-[13px] font-medium text-neutral-900 hover:bg-black/[0.1]"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {ui.menuBack}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
