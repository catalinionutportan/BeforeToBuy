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

/** Glossy Apple-white row. */
function menuRowClass(selected: boolean): string {
  return [
    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200",
    "bg-white/80 text-neutral-950 backdrop-blur-sm",
    "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]",
    "ring-1 ring-black/[0.04]",
    "hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] active:scale-[0.99]",
    selected ? "bg-white ring-black/10 shadow-[0_6px_20px_rgba(0,0,0,0.08)]" : "",
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
  const [groupStack, setGroupStack] = useState<ShoppingSubcategory[]>([]);
  /** Drive cinematic slide + backdrop fade after mount. */
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setLevel("root");
    setActiveDept(null);
    setGroupStack([]);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
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

  const canGoBack = level === "department" || level === "group";

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Full-page bleach / bokeh veil */}
      <button
        type="button"
        aria-label={ui.menuClose}
        onClick={onClose}
        className={[
          "absolute inset-0 cursor-default border-0 transition-opacity duration-500 ease-out",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.82) 45%, rgba(255,255,255,0.72) 100%)",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
        }}
      />

      {/* Edge drawer — slides from left like Samsung Edge */}
      <aside
        className={[
          "absolute inset-y-0 left-0 z-10 flex w-[min(100vw,22rem)] sm:w-[min(100vw,26rem)] flex-col",
          "border-r border-white/60 shadow-[12px_0_48px_rgba(15,23,42,0.12)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          entered ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          backgroundImage:
            "linear-gradient(165deg, #ffffff 0%, #fbfbfd 42%, #f4f5f7 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 8%, rgba(255,255,255,0.95) 0%, transparent 42%), radial-gradient(circle at 88% 0%, rgba(226,232,240,0.55) 0%, transparent 36%)",
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p
              id={titleId}
              className="truncate text-[18px] font-semibold tracking-tight text-neutral-950"
            >
              {title}
            </p>
            <p className="truncate text-[12px] text-neutral-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] hover:bg-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{ui.menuClose}</span>
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1 custom-scrollbar">
          {level === "root" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => selectAndClose(ALL_CATEGORIES_ID)}
                className={menuRowClass(selectedCategory === ALL_CATEGORIES_ID)}
              >
                <Layers className="h-4 w-4 shrink-0 text-neutral-700" aria-hidden="true" />
                <span className="text-[15px] font-medium leading-none">{ui.hubAll}</span>
              </button>

              <nav aria-label={ui.menuCategories}>
                <ul className="space-y-2">
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
            <div className="space-y-2">
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

              <ul className="space-y-2">
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
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => selectAndClose(activeGroup.id)}
                className={menuRowClass(selectedCategory === activeGroup.id)}
              >
                <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
                  {ui.menuSeeAllInDepartment}
                </span>
              </button>

              <ul className="space-y-2">
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

        {canGoBack && (
          <div className="relative flex items-center justify-end border-t border-black/[0.04] bg-white/50 px-4 py-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] hover:bg-neutral-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {ui.menuBack}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
