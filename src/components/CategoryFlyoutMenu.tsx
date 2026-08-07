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

type PreviewColumn =
  | { kind: "department"; category: ShoppingCategory }
  | { kind: "group"; node: ShoppingSubcategory };

function rowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-normal text-neutral-900 transition-colors",
    "hover:bg-neutral-100/80 active:bg-neutral-100",
    selected ? "bg-neutral-100 font-medium" : "",
  ].join(" ");
}

function nodeContainsSelected(node: ShoppingSubcategory, selectedId: string): boolean {
  if (node.id === selectedId) return true;
  return Boolean(node.children?.some((child) => nodeContainsSelected(child, selectedId)));
}

function useIsCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return coarse;
}

/**
 * Full-screen solid white menu.
 * Desktop: fixed columns (never grow/shrink the page). Hover/click only swaps text in columns 2–3.
 * Touch: single-column drill-down on the same white page.
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
  const isTouch = useIsCoarsePointer();

  const [level, setLevel] = useState<MenuLevel>("root");
  const [activeDept, setActiveDept] = useState<ShoppingCategory | null>(null);
  const [groupStack, setGroupStack] = useState<ShoppingSubcategory[]>([]);
  const [col2, setCol2] = useState<PreviewColumn | null>(null);
  const [col3, setCol3] = useState<PreviewColumn | null>(null);

  useEffect(() => {
    if (!open) return;
    setLevel("root");
    setActiveDept(null);
    setGroupStack([]);
    setCol2(null);
    setCol3(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isTouch && (col2 || col3)) {
        setCol3(null);
        setCol2(null);
        return;
      }
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
  }, [open, onClose, level, groupStack.length, col2, col3, isTouch]);

  if (!open) return null;

  const selectAndClose = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  const goBackTouch = () => {
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

  const openDepartmentTouch = (category: ShoppingCategory) => {
    if (category.subcategories.length === 0) {
      selectAndClose(category.id);
      return;
    }
    setActiveDept(category);
    setGroupStack([]);
    setLevel("department");
  };

  const openGroupTouch = (sub: ShoppingSubcategory) => {
    if (sub.children?.length) {
      setGroupStack((stack) => [...stack, sub]);
      setLevel("group");
      return;
    }
    selectAndClose(sub.id);
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
      // Keep depth at 3 columns: replace col3 content with this nest.
      setCol3({ kind: "group", node: item });
      return;
    }
    selectAndClose(item.id);
  };

  const activeGroup = groupStack[groupStack.length - 1] ?? null;
  const title = !isTouch
    ? ui.menuTitle
    : activeGroup
      ? getSubcategoryLabel(activeGroup.id, locale)
      : level === "department" && activeDept
        ? getDepartmentLabel(activeDept.id, locale)
        : ui.menuTitle;
  const subtitle =
    !isTouch || level === "root" ? ui.menuSubtitle : ui.menuSubcategories;
  const canGoBackTouch = isTouch && (level === "department" || level === "group");

  const renderColumnItems = (
    col: PreviewColumn,
    onHoverItem: (item: ShoppingSubcategory) => void,
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
        <p className="mb-1 truncate px-2.5 text-[11px] font-medium text-neutral-400">
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
                  onMouseEnter={() => onHoverItem(item)}
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
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p
              id={titleId}
              className="truncate text-[15px] font-semibold tracking-tight text-neutral-950"
            >
              {title}
            </p>
            <p className="truncate text-[11px] text-neutral-500">{subtitle}</p>
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

        {!isTouch ? (
          /*
            Fixed 4-track grid — page size never changes.
            Col1 categories | Col2 hover text | Col3 nested text | rest white
          */
          <div
            className="grid min-h-0 flex-1 bg-white"
            style={{
              gridTemplateColumns: "min(18rem, 34vw) min(16rem, 28vw) min(16rem, 28vw) 1fr",
            }}
          >
            <div className="min-h-0 overflow-y-auto px-2 py-1 custom-scrollbar">
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
                              <span className="block text-[10px] text-neutral-400">
                                {count}
                              </span>
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

            <div className="min-h-0 overflow-y-auto px-2 py-1 custom-scrollbar">
              {col2
                ? renderColumnItems(
                    col2,
                    showGroupInCol3,
                    onCol2Activate,
                    col3?.kind === "group" ? col3.node.id : null
                  )
                : null}
            </div>

            <div className="min-h-0 overflow-y-auto px-2 py-1 custom-scrollbar">
              {col3 ? renderColumnItems(col3, () => {}, onCol3Activate, null) : null}
            </div>

            <div className="bg-white" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
              {level === "root" ? (
                <div>
                  <button
                    type="button"
                    onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
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

                        return (
                          <li key={category.id}>
                            <button
                              type="button"
                              onClick={() => openDepartmentTouch(category)}
                              className={rowClass(selected)}
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
                                  <span className="block text-[10px] text-neutral-400">
                                    {count}
                                  </span>
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
              ) : level === "department" && activeDept ? (
                <div>
                  <button
                    type="button"
                    onClick={() => selectAndClose(activeDept.id)}
                    className={rowClass(selectedCategory === activeDept.id)}
                  >
                    <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
                  </button>
                  <ul className="mt-0.5">
                    {activeDept.subcategories.map((sub) => {
                      const count = categoryCounts?.[sub.id] ?? 0;
                      const hasChildren = Boolean(sub.children?.length);
                      const selected = nodeContainsSelected(sub, selectedCategory);
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            onClick={() => openGroupTouch(sub)}
                            className={rowClass(selected)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block leading-snug">
                                {getSubcategoryLabel(sub.id, locale)}
                              </span>
                              {count > 0 && (
                                <span className="block text-[10px] text-neutral-400">
                                  {count}
                                </span>
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
                </div>
              ) : level === "group" && activeGroup?.children ? (
                <div>
                  <button
                    type="button"
                    onClick={() => selectAndClose(activeGroup.id)}
                    className={rowClass(selectedCategory === activeGroup.id)}
                  >
                    <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
                  </button>
                  <ul className="mt-0.5">
                    {activeGroup.children.map((child) => {
                      const count = categoryCounts?.[child.id] ?? 0;
                      const hasChildren = Boolean(child.children?.length);
                      const selected = nodeContainsSelected(child, selectedCategory);
                      return (
                        <li key={child.id}>
                          <button
                            type="button"
                            onClick={() => openGroupTouch(child)}
                            className={rowClass(selected)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block leading-snug">
                                {getSubcategoryLabel(child.id, locale)}
                              </span>
                              {count > 0 && (
                                <span className="block text-[10px] text-neutral-400">
                                  {count}
                                </span>
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
                </div>
              ) : null}
            </div>

            {canGoBackTouch && (
              <div className="flex items-center justify-end px-3 py-2.5">
                <button
                  type="button"
                  onClick={goBackTouch}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {ui.menuBack}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
