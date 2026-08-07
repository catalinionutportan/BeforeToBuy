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

/** Flat Apple-simple row — no chunky cards. */
function rowClass(selected: boolean, compact = false): string {
  return [
    "flex w-full items-center gap-2.5 text-left transition-colors",
    compact ? "rounded-lg px-2.5 py-1.5" : "rounded-lg px-2.5 py-2",
    "text-[13px] font-normal text-neutral-900",
    "hover:bg-black/[0.04] active:bg-black/[0.06]",
    selected ? "bg-black/[0.06] font-medium" : "",
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

  // Touch / click drill-down (phone)
  const [level, setLevel] = useState<MenuLevel>("root");
  const [activeDept, setActiveDept] = useState<ShoppingCategory | null>(null);
  const [groupStack, setGroupStack] = useState<ShoppingSubcategory[]>([]);

  // Desktop hover preview columns (expand left → right)
  const [previewCols, setPreviewCols] = useState<PreviewColumn[]>([]);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setLevel("root");
    setActiveDept(null);
    setGroupStack([]);
    setPreviewCols([]);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isTouch && previewCols.length > 0) {
        setPreviewCols([]);
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
  }, [open, onClose, level, groupStack.length, previewCols.length, isTouch]);

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

  const hoverDepartment = (category: ShoppingCategory) => {
    if (isTouch) return;
    if (category.subcategories.length === 0) {
      setPreviewCols([]);
      return;
    }
    setPreviewCols([{ kind: "department", category }]);
  };

  const hoverGroup = (node: ShoppingSubcategory, columnIndex: number) => {
    if (isTouch) return;
    setPreviewCols((cols) => {
      const kept = cols.slice(0, columnIndex + 1);
      if (!node.children?.length) return kept;
      return [...kept, { kind: "group", node }];
    });
  };

  const activeGroup = groupStack[groupStack.length - 1] ?? null;
  const title =
    !isTouch
      ? ui.menuTitle
      : activeGroup
        ? getSubcategoryLabel(activeGroup.id, locale)
        : level === "department" && activeDept
          ? getDepartmentLabel(activeDept.id, locale)
          : ui.menuTitle;
  const subtitle =
    !isTouch || level === "root" ? ui.menuSubtitle : ui.menuSubcategories;
  const canGoBackTouch = isTouch && (level === "department" || level === "group");

  const panelWidthClass = !isTouch && previewCols.length > 0
    ? previewCols.length === 1
      ? "w-[min(100vw,40rem)] sm:w-[min(100vw,42rem)]"
      : "w-[min(100vw,56rem)] sm:w-[min(100vw,58rem)]"
    : "w-[min(100vw,20rem)] sm:w-[min(100vw,22rem)]";

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label={ui.menuClose}
        onClick={onClose}
        className={[
          "absolute inset-0 cursor-default border-0 transition-opacity duration-400 ease-out",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 15% 25%, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 50%, rgba(248,250,252,0.78) 100%)",
          backdropFilter: "blur(20px) saturate(1.15)",
          WebkitBackdropFilter: "blur(20px) saturate(1.15)",
        }}
      />

      <aside
        className={[
          "absolute inset-y-0 left-0 z-10 flex flex-col bg-white",
          "border-r border-black/[0.06] shadow-[16px_0_48px_rgba(15,23,42,0.10)]",
          "transition-[transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          panelWidthClass,
          entered ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        onMouseLeave={() => {
          if (!isTouch) setPreviewCols([]);
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.04] px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-black/[0.05]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        {/* Desktop: expanding columns. Touch: single drill-down column. */}
        {!isTouch ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="flex w-[min(100%,20rem)] shrink-0 flex-col border-r border-black/[0.04]">
              <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
                  onMouseEnter={() => setPreviewCols([])}
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
                        previewCols[0]?.kind === "department" &&
                        previewCols[0].category.id === category.id;

                      return (
                        <li key={category.id}>
                          <button
                            type="button"
                            onMouseEnter={() => hoverDepartment(category)}
                            onClick={() => selectAndClose(category.id)}
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
            </div>

            {previewCols.map((col, colIndex) => {
              const items =
                col.kind === "department" ? col.category.subcategories : col.node.children ?? [];
              const columnTitle =
                col.kind === "department"
                  ? getDepartmentLabel(col.category.id, locale)
                  : getSubcategoryLabel(col.node.id, locale);
              const parentId = col.kind === "department" ? col.category.id : col.node.id;

              return (
                <div
                  key={`${col.kind}-${parentId}-${colIndex}`}
                  className="flex w-[min(100%,18rem)] shrink-0 flex-col border-r border-black/[0.04] bg-white"
                >
                  <div className="border-b border-black/[0.04] px-3 py-2">
                    <p className="truncate text-[11px] font-medium text-neutral-500">
                      {columnTitle}
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => selectAndClose(parentId)}
                      className={rowClass(selectedCategory === parentId, true)}
                    >
                      <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
                    </button>
                    <ul className="mt-0.5">
                      {items.map((item) => {
                        const count = categoryCounts?.[item.id] ?? 0;
                        const hasChildren = Boolean(item.children?.length);
                        const selected = nodeContainsSelected(item, selectedCategory);
                        const nextCol = previewCols[colIndex + 1];
                        const previewed =
                          nextCol?.kind === "group" && nextCol.node.id === item.id;

                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onMouseEnter={() => hoverGroup(item, colIndex)}
                              onClick={() => selectAndClose(item.id)}
                              className={rowClass(selected || previewed, true)}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block leading-snug">
                                  {getSubcategoryLabel(item.id, locale)}
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
                </div>
              );
            })}
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
              <div className="flex items-center justify-end border-t border-black/[0.04] px-3 py-2.5">
                <button
                  type="button"
                  onClick={goBackTouch}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-neutral-800 hover:bg-black/[0.04]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {ui.menuBack}
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
