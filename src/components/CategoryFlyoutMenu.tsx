"use client";

import { useEffect, useId, useState } from "react";
import { ChevronRight, Layers, X } from "lucide-react";
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

type PreviewColumn =
  | { kind: "department"; category: ShoppingCategory }
  | { kind: "group"; node: ShoppingSubcategory };

function rowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-normal text-neutral-900 transition-colors",
    "hover:bg-neutral-100/80 active:bg-neutral-100",
    selected ? "bg-neutral-100 font-medium" : "",
  ].join(" ");
}

function nodeContainsSelected(node: ShoppingSubcategory, selectedId: string): boolean {
  if (node.id === selectedId) return true;
  return Boolean(node.children?.some((child) => nodeContainsSelected(child, selectedId)));
}

/**
 * Full-screen solid white menu — same on phone and desktop.
 * Fixed columns: hover (desktop) or tap opens subcategory text without resizing the page.
 */
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
  const [col2, setCol2] = useState<PreviewColumn | null>(null);
  const [col3, setCol3] = useState<PreviewColumn | null>(null);

  useEffect(() => {
    if (!open) return;
    setCol2(null);
    setCol3(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (col2 || col3) {
        setCol3(null);
        setCol2(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, col2, col3]);

  if (!open) return null;

  const selectAndClose = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  const showDepartment = (category: ShoppingCategory) => {
    if (category.subcategories.length === 0) {
      setCol2(null);
      setCol3(null);
      return;
    }
    setCol2({ kind: "department", category });
    setCol3(null);
  };

  const showGroupInCol3 = (node: ShoppingSubcategory) => {
    if (!node.children?.length) {
      setCol3(null);
      return;
    }
    setCol3({ kind: "group", node });
  };

  const onDepartmentActivate = (category: ShoppingCategory) => {
    if (category.subcategories.length > 0) {
      showDepartment(category);
      return;
    }
    selectAndClose(category.id);
  };

  const onCol2Activate = (item: ShoppingSubcategory) => {
    if (item.children?.length) {
      showGroupInCol3(item);
      return;
    }
    selectAndClose(item.id);
  };

  const onCol3Activate = (item: ShoppingSubcategory) => {
    if (item.children?.length) {
      setCol3({ kind: "group", node: item });
      return;
    }
    selectAndClose(item.id);
  };

  const renderColumnItems = (
    col: PreviewColumn,
    onRevealItem: (item: ShoppingSubcategory) => void,
    onActivateItem: (item: ShoppingSubcategory) => void,
    highlightId?: string | null
  ) => {
    const items =
      col.kind === "department" ? col.category.subcategories : col.node.children ?? [];
    const parentId = col.kind === "department" ? col.category.id : col.node.id;
    const columnTitle =
      col.kind === "department"
        ? getDepartmentLabel(col.category.id, locale)
        : getSubcategoryLabel(col.node.id, locale);

    return (
      <>
        <p className="mb-1 truncate px-2 text-[11px] font-medium text-neutral-400">
          {columnTitle}
        </p>
        <button
          type="button"
          onClick={() => selectAndClose(parentId)}
          className={rowClass(selectedCategory === parentId)}
        >
          <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
        </button>
        <ul className="mt-0.5">
          {items.map((item) => {
            const count = categoryCounts?.[item.id] ?? 0;
            const hasChildren = Boolean(item.children?.length);
            const selected = nodeContainsSelected(item, selectedCategory);
            const previewed = highlightId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => onRevealItem(item)}
                  onClick={() => onActivateItem(item)}
                  className={rowClass(selected || previewed)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug">
                      {getSubcategoryLabel(item.id, locale)}
                    </span>
                    {count > 0 && (
                      <span className="block text-[10px] text-neutral-400">{count}</span>
                    )}
                  </span>
                  {hasChildren && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-neutral-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex h-full w-full flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between gap-3 px-3 sm:px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p
              id={titleId}
              className="truncate text-[15px] font-semibold tracking-tight text-neutral-950"
            >
              {ui.menuTitle}
            </p>
            <p className="truncate text-[11px] text-neutral-500">{ui.menuSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        {/*
          Same fixed columns on phone + desktop.
          Page never resizes — only text appears in reserved columns.
          Narrow phones can scroll horizontally inside the white page.
        */}
        <div
          className="grid min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white"
          style={{
            gridTemplateColumns:
              "minmax(9.5rem, 11.5rem) minmax(9rem, 11rem) minmax(9rem, 11rem) minmax(0, 1fr)",
          }}
        >
          <div className="min-h-0 overflow-y-auto px-1.5 py-1 custom-scrollbar sm:px-2">
            <button
              type="button"
              onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
              onMouseEnter={() => {
                setCol2(null);
                setCol3(null);
              }}
              className={rowClass(selectedCategory === ALL_CATEGORIES_ID)}
            >
              <Layers className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
              <span className="flex-1">{ui.hubAll}</span>
            </button>

            <nav aria-label={ui.menuCategories} className="mt-0.5">
              <ul>
                {SHOPPING_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const count = categoryCounts?.[category.id] ?? 0;
                  const hasSubs = category.subcategories.length > 0;
                  const selected =
                    selectedCategory === category.id ||
                    selectedCategory.startsWith(`${category.id}-`) ||
                    getParentCategoryId(selectedCategory) === category.id;
                  const previewed =
                    col2?.kind === "department" && col2.category.id === category.id;

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onMouseEnter={() => showDepartment(category)}
                        onClick={() => onDepartmentActivate(category)}
                        className={rowClass(selected || previewed)}
                      >
                        <Icon
                          className="h-3.5 w-3.5 shrink-0 text-neutral-500"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block leading-snug">
                            {getDepartmentLabel(category.id, locale)}
                          </span>
                          {count > 0 && (
                            <span className="block text-[10px] text-neutral-400">{count}</span>
                          )}
                        </span>
                        {hasSubs && (
                          <ChevronRight
                            className="h-3.5 w-3.5 shrink-0 text-neutral-300"
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

          <div className="min-h-0 overflow-y-auto px-1.5 py-1 custom-scrollbar sm:px-2">
            {col2
              ? renderColumnItems(
                  col2,
                  showGroupInCol3,
                  onCol2Activate,
                  col3?.kind === "group" ? col3.node.id : null
                )
              : null}
          </div>

          <div className="min-h-0 overflow-y-auto px-1.5 py-1 custom-scrollbar sm:px-2">
            {col3 ? renderColumnItems(col3, () => {}, onCol3Activate, null) : null}
          </div>

          <div className="bg-white" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
