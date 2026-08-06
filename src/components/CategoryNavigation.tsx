"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_SUBCATEGORY_GROUPS,
  SHOPPING_CATEGORIES,
  CATEGORY_ALL_OPTION,
  getCategoryById,
  getParentCategoryId,
  isCollectionFilter,
} from "@/lib/categories";
import {
  CATEGORY_UI,
  getDepartmentLabel,
  getGroupLabel,
  getLocalizedCategoryLabel,
  getSubcategoryLabel,
  type CategoryLocale,
} from "@/lib/category-i18n";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";

interface CategoryNavigationProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  locale: CategoryLocale;
}

function CountBadge({ count, active }: { count: number; active?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
        active ? "bg-emerald-500 text-white" : "bg-white/90 text-slate-600"
      }`}
    >
      {count}
    </span>
  );
}

export function CategoryNavigation({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  locale,
}: CategoryNavigationProps) {
  const ui = CATEGORY_UI[locale];
  const [expandedModule, setExpandedModule] = useState<string | null>(() => {
    const parent = getParentCategoryId(selectedCategory);
    return parent && selectedCategory !== parent ? parent : null;
  });

  useEffect(() => {
    if (isCollectionFilter(selectedCategory)) {
      setExpandedModule(null);
      return;
    }
    const parent = getParentCategoryId(selectedCategory);
    if (parent && selectedCategory !== parent) {
      setExpandedModule(parent);
    }
  }, [selectedCategory]);

  const activeParentId =
    selectedCategory === CATEGORY_ALL_OPTION.id || isCollectionFilter(selectedCategory)
      ? null
      : getParentCategoryId(selectedCategory) ?? selectedCategory;

  const activeModule = activeParentId ? getCategoryById(activeParentId) : null;
  const visibleCategories = SHOPPING_CATEGORIES.filter(
    (category) =>
      categoryCounts === undefined ||
      (categoryCounts[category.id] ?? 0) > 0 ||
      activeParentId === category.id
  );

  const handleModuleClick = (moduleId: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      const isExpanded = expandedModule === moduleId;
      setExpandedModule(isExpanded ? null : moduleId);
    }
    onCategoryChange(moduleId);
  };

  const renderSubcategoryButton = (subId: string, subLabel: string) => {
    const isSubSelected = selectedCategory === subId;
    const count = categoryCounts?.[subId] ?? 0;

    if (categoryCounts !== undefined && count === 0 && !isSubSelected) {
      return null;
    }

    return (
      <button
        key={subId}
        type="button"
        onClick={() => onCategoryChange(subId)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
          isSubSelected
            ? "border-emerald-500 bg-emerald-600 text-white shadow-xs"
            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
        }`}
      >
        <span>{subLabel}</span>
        <CountBadge count={count} active={isSubSelected} />
      </button>
    );
  };

  const moduleForPanel = activeModule ?? (expandedModule ? getCategoryById(expandedModule) : null);
  const groups = moduleForPanel ? CATEGORY_SUBCATEGORY_GROUPS[moduleForPanel.id] : undefined;

  return (
    <div className="space-y-3 min-w-0 max-w-full">
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 min-w-0 max-w-full touch-pan-x">
        <button
          type="button"
          onClick={() => {
            setExpandedModule(null);
            onCategoryChange(CATEGORY_ALL_OPTION.id);
          }}
          className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            selectedCategory === CATEGORY_ALL_OPTION.id
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <Layers
            className={`h-4 w-4 ${
              selectedCategory === CATEGORY_ALL_OPTION.id ? "text-emerald-400" : "text-slate-400"
            }`}
          />
          <span>{ui.allCategories}</span>
        </button>

        {visibleCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive =
            selectedCategory === cat.id ||
            selectedCategory.startsWith(`${cat.id}-`) ||
            activeParentId === cat.id;
          const isExpanded = expandedModule === cat.id;
          const hasSubs = cat.subcategories.length > 0;
          const departmentCount = categoryCounts?.[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleModuleClick(cat.id, hasSubs)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{getDepartmentLabel(cat.id, locale)}</span>
              <CountBadge count={departmentCount} active={isActive} />
              {hasSubs && (
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""} ${
                    isActive ? "opacity-90" : "opacity-50"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {moduleForPanel && (
        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {getDepartmentLabel(moduleForPanel.id, locale)} — {ui.refineComparison}
            </span>
          </div>

          {groups ? (
            groups.map((group) => {
              const visibleSubs = group.subcategoryIds
                .map((subId) => ({
                  id: subId,
                  label: getSubcategoryLabel(subId, locale),
                  count: categoryCounts?.[subId] ?? 0,
                }))
                .filter((sub) => sub.count > 0 || selectedCategory === sub.id);

              if (visibleSubs.length === 0) return null;

              return (
                <div key={group.id} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {getGroupLabel(group.id, locale)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {visibleSubs.map((sub) => renderSubcategoryButton(sub.id, sub.label))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {moduleForPanel.subcategories.map((sub) =>
                renderSubcategoryButton(sub.id, getSubcategoryLabel(sub.id, locale))
              )}
            </div>
          )}
        </div>
      )}

      {selectedCategory !== CATEGORY_ALL_OPTION.id && !isCollectionFilter(selectedCategory) && (
        <p className="text-[11px] font-medium text-slate-500">
          {ui.browsing}:{" "}
          <strong className="text-emerald-700">
            {getLocalizedCategoryLabel(selectedCategory, locale)}
          </strong>
          {activeModule && selectedCategory !== activeModule.id && (
            <span className="text-slate-400">
              {" "}
              {ui.inDepartment} {getDepartmentLabel(activeModule.id, locale)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
