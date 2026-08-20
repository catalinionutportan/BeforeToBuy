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

function nodeHasInventory(
  node: ShoppingSubcategory,
  counts: Record<string, number> | undefined
): boolean {
  if (!counts) return true;
  if ((counts[node.id] ?? 0) > 0) return true;
  return Boolean(node.children?.some((child) => nodeHasInventory(child, counts)));
}

function departmentHasInventory(
  category: ShoppingCategory,
  counts: Record<string, number> | undefined
): boolean {
  if (!counts) return true;
  if ((counts[category.id] ?? 0) > 0) return true;
  return category.subcategories.some((sub) => nodeHasInventory(sub, counts));
}

/** Desktop menu type scales with viewport; stays large on wide screens. */
const DESKTOP_MENU_TEXT =
  "text-[clamp(0.95rem,0.55vw+0.72rem,1.125rem)] leading-snug";
const DESKTOP_MENU_COUNT =
  "text-[clamp(0.75rem,0.3vw+0.55rem,0.875rem)]";
const DESKTOP_MENU_TITLE =
  "text-[clamp(1.125rem,0.8vw+0.75rem,1.375rem)]";
const DESKTOP_MENU_SUBTITLE =
  "text-[clamp(0.8125rem,0.35vw+0.65rem,0.95rem)]";

function desktopRowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-normal text-neutral-900 transition-colors",
    DESKTOP_MENU_TEXT,
    "hover:bg-neutral-100/80 active:bg-neutral-100",
    selected ? "bg-neutral-100 font-medium" : "",
  ].join(" ");
}

/** Larger iOS-app-like rows for the temporary smartphone web app. */
function mobileRowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors",
    "text-[17px] font-normal leading-snug text-neutral-900",
    "active:bg-neutral-100",
    selected ? "bg-neutral-100 font-medium" : "",
  ].join(" ");
}

/**
 * Full-screen solid white menu.
 * Desktop: fixed columns + hover preview.
 * Smartphone: large type + iOS-style replace drill-down (tap replaces the list).
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

  // Desktop columns
  const [col2, setCol2] = useState<PreviewColumn | null>(null);
  const [col3, setCol3] = useState<PreviewColumn | null>(null);

  // Mobile replace stack
  const [level, setLevel] = useState<MenuLevel>("root");
  const [activeDept, setActiveDept] = useState<ShoppingCategory | null>(null);
  const [groupStack, setGroupStack] = useState<ShoppingSubcategory[]>([]);

  useEffect(() => {
    if (!open) return;
    setCol2(null);
    setCol3(null);
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
      if (isTouch) {
        if (groupStack.length > 0) {
          setGroupStack((stack) => {
            const next = stack.slice(0, -1);
            if (next.length === 0) setLevel("department");
            return next;
          });
          return;
        }
        if (level === "department") {
          setLevel("root");
          setActiveDept(null);
          return;
        }
        onClose();
        return;
      }
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
  }, [open, onClose, isTouch, level, groupStack.length, col2, col3]);

  if (!open) return null;

  const selectAndClose = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  const goBackMobile = () => {
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

  const openDepartmentMobile = (category: ShoppingCategory) => {
    if (category.subcategories.length === 0) {
      selectAndClose(category.id);
      return;
    }
    setActiveDept(category);
    setGroupStack([]);
    setLevel("department");
  };

  const openGroupMobile = (sub: ShoppingSubcategory) => {
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

  const onDepartmentActivateDesktop = (category: ShoppingCategory) => {
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

  const activeGroup = groupStack[groupStack.length - 1] ?? null;
  const mobileTitle = activeGroup
    ? getSubcategoryLabel(activeGroup.id, locale)
    : level === "department" && activeDept
      ? getDepartmentLabel(activeDept.id, locale)
      : ui.menuTitle;
  const mobileSubtitle =
    level === "root" ? ui.menuSubtitle : ui.menuSubcategories;
  const canGoBackMobile = level === "department" || level === "group";

  const renderDesktopColumnItems = (
    col: PreviewColumn,
    onRevealItem: (item: ShoppingSubcategory) => void,
    onActivateItem: (item: ShoppingSubcategory) => void,
    highlightId?: string | null
  ) => {
    const items =
      col.kind === "department" ? col.category.subcategories : col.node.children ?? [];
    const visibleItems = items.filter((item) => nodeHasInventory(item, categoryCounts));
    const parentId = col.kind === "department" ? col.category.id : col.node.id;
    const columnTitle =
      col.kind === "department"
        ? getDepartmentLabel(col.category.id, locale)
        : getSubcategoryLabel(col.node.id, locale);

    return (
      <>
        <p
          className={`mb-1.5 truncate px-2.5 font-medium text-neutral-400 ${DESKTOP_MENU_SUBTITLE}`}
        >
          {columnTitle}
        </p>
        <button
          type="button"
          onClick={() => selectAndClose(parentId)}
          className={desktopRowClass(selectedCategory === parentId)}
        >
          <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
        </button>
        <ul className="mt-0.5">
          {visibleItems.map((item) => {
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
                  className={desktopRowClass(selected || previewed)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug">
                      {getSubcategoryLabel(item.id, locale)}
                    </span>
                    {count > 0 && (
                      <span
                        className={`mt-0.5 block text-neutral-400 ${DESKTOP_MENU_COUNT}`}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                  {hasChildren && (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-neutral-300"
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
      className="fixed inset-0 z-[60] bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex h-full w-full flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-6">
          <div className="min-w-0">
            <p
              id={titleId}
              className={`truncate font-semibold tracking-tight text-neutral-950 ${
                isTouch ? "text-[20px]" : DESKTOP_MENU_TITLE
              }`}
            >
              {isTouch ? mobileTitle : ui.menuTitle}
            </p>
            <p
              className={`truncate text-neutral-500 ${
                isTouch ? "text-[14px]" : DESKTOP_MENU_SUBTITLE
              }`}
            >
              {isTouch ? mobileSubtitle : ui.menuSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        {isTouch ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 custom-scrollbar">
              {level === "root" ? (
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
                    className={mobileRowClass(selectedCategory === ALL_CATEGORIES_ID)}
                  >
                    <Layers className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden="true" />
                    <span className="flex-1">{ui.hubAll}</span>
                  </button>

                  <nav aria-label={ui.menuCategories}>
                    <ul className="space-y-0.5">
                      {SHOPPING_CATEGORIES.filter((category) =>
                        departmentHasInventory(category, categoryCounts)
                      ).map((category) => {
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
                              onClick={() => openDepartmentMobile(category)}
                              className={mobileRowClass(selected)}
                            >
                              <Icon
                                className="h-5 w-5 shrink-0 text-neutral-500"
                                aria-hidden="true"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block">
                                  {getDepartmentLabel(category.id, locale)}
                                </span>
                                {count > 0 && (
                                  <span className="mt-0.5 block text-[13px] text-neutral-400">
                                    {count}
                                  </span>
                                )}
                              </span>
                              {hasSubs && (
                                <ChevronRight
                                  className="h-5 w-5 shrink-0 text-neutral-300"
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
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => selectAndClose(activeDept.id)}
                    className={mobileRowClass(selectedCategory === activeDept.id)}
                  >
                    <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
                  </button>
                  <ul className="space-y-0.5">
                    {activeDept.subcategories
                      .filter((sub) => nodeHasInventory(sub, categoryCounts))
                      .map((sub) => {
                      const count = categoryCounts?.[sub.id] ?? 0;
                      const hasChildren = Boolean(sub.children?.length);
                      const selected = nodeContainsSelected(sub, selectedCategory);
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            onClick={() => openGroupMobile(sub)}
                            className={mobileRowClass(selected)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block">
                                {getSubcategoryLabel(sub.id, locale)}
                              </span>
                              {count > 0 && (
                                <span className="mt-0.5 block text-[13px] text-neutral-400">
                                  {count}
                                </span>
                              )}
                            </span>
                            {hasChildren && (
                              <ChevronRight
                                className="h-5 w-5 shrink-0 text-neutral-300"
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
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => selectAndClose(activeGroup.id)}
                    className={mobileRowClass(selectedCategory === activeGroup.id)}
                  >
                    <span className="flex-1">{ui.menuSeeAllInDepartment}</span>
                  </button>
                  <ul className="space-y-0.5">
                    {activeGroup.children
                      .filter((child) => nodeHasInventory(child, categoryCounts))
                      .map((child) => {
                      const count = categoryCounts?.[child.id] ?? 0;
                      const hasChildren = Boolean(child.children?.length);
                      const selected = nodeContainsSelected(child, selectedCategory);
                      return (
                        <li key={child.id}>
                          <button
                            type="button"
                            onClick={() => openGroupMobile(child)}
                            className={mobileRowClass(selected)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block">
                                {getSubcategoryLabel(child.id, locale)}
                              </span>
                              {count > 0 && (
                                <span className="mt-0.5 block text-[13px] text-neutral-400">
                                  {count}
                                </span>
                              )}
                            </span>
                            {hasChildren && (
                              <ChevronRight
                                className="h-5 w-5 shrink-0 text-neutral-300"
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

            {canGoBackMobile && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={goBackMobile}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2.5 text-[16px] font-medium text-neutral-900 active:bg-neutral-200"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  {ui.menuBack}
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className="grid min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white"
            style={{
              gridTemplateColumns:
                "minmax(12rem, 15rem) minmax(11.5rem, 14rem) minmax(11.5rem, 14rem) minmax(0, 1fr)",
            }}
          >
            <div className="min-h-0 overflow-y-auto px-2.5 py-1.5 custom-scrollbar">
              <button
                type="button"
                onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
                onMouseEnter={() => {
                  setCol2(null);
                  setCol3(null);
                }}
                className={desktopRowClass(selectedCategory === ALL_CATEGORIES_ID)}
              >
                <Layers className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden="true" />
                <span className="flex-1">{ui.hubAll}</span>
              </button>

              <nav aria-label={ui.menuCategories} className="mt-0.5">
                <ul>
                  {SHOPPING_CATEGORIES.filter((category) =>
                    departmentHasInventory(category, categoryCounts)
                  ).map((category) => {
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
                          onClick={() => onDepartmentActivateDesktop(category)}
                          className={desktopRowClass(selected || previewed)}
                        >
                          <Icon
                            className="h-5 w-5 shrink-0 text-neutral-500"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block leading-snug">
                              {getDepartmentLabel(category.id, locale)}
                            </span>
                            {count > 0 && (
                              <span
                                className={`mt-0.5 block text-neutral-400 ${DESKTOP_MENU_COUNT}`}
                              >
                                {count}
                              </span>
                            )}
                          </span>
                          {hasSubs && (
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-neutral-300"
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

            <div className="min-h-0 overflow-y-auto px-2.5 py-1.5 custom-scrollbar">
              {col2
                ? renderDesktopColumnItems(
                    col2,
                    showGroupInCol3,
                    onCol2Activate,
                    col3?.kind === "group" ? col3.node.id : null
                  )
                : null}
            </div>

            <div className="min-h-0 overflow-y-auto px-2.5 py-1.5 custom-scrollbar">
              {col3
                ? renderDesktopColumnItems(col3, () => {}, onCol3Activate, null)
                : null}
            </div>

            <div className="bg-white" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
