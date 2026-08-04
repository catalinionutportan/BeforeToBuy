"use client";

import { useEffect, useState } from "react";
import {
  SHOPPING_CATEGORIES,
  CATEGORY_ALL_OPTION,
  getCategoryById,
  getParentCategoryId,
  getCategoryLabel,
} from "@/lib/categories";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";

interface CategoryNavigationProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryNavigation({
  selectedCategory,
  onCategoryChange,
}: CategoryNavigationProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(() => {
    const parent = getParentCategoryId(selectedCategory);
    return parent && selectedCategory !== parent ? parent : null;
  });

  useEffect(() => {
    const parent = getParentCategoryId(selectedCategory);
    if (parent && selectedCategory !== parent) {
      setExpandedModule(parent);
    }
  }, [selectedCategory]);

  const activeParentId =
    selectedCategory === CATEGORY_ALL_OPTION.id
      ? null
      : getParentCategoryId(selectedCategory) ?? selectedCategory;

  const activeModule = activeParentId ? getCategoryById(activeParentId) : null;

  const handleModuleClick = (moduleId: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      const isExpanded = expandedModule === moduleId;
      setExpandedModule(isExpanded ? null : moduleId);
    }
    onCategoryChange(moduleId);
  };

  return (
    <div className="space-y-3">
      {/* Category modules — horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        <button
          onClick={() => {
            setExpandedModule(null);
            onCategoryChange(CATEGORY_ALL_OPTION.id);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            selectedCategory === CATEGORY_ALL_OPTION.id
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <Layers className={`w-4 h-4 ${selectedCategory === CATEGORY_ALL_OPTION.id ? "text-emerald-400" : "text-slate-400"}`} />
          <span>{CATEGORY_ALL_OPTION.label}</span>
        </button>

        {SHOPPING_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive =
            selectedCategory === cat.id ||
            selectedCategory.startsWith(`${cat.id}-`) ||
            activeParentId === cat.id;
          const isExpanded = expandedModule === cat.id;
          const hasSubs = cat.subcategories.length > 0;

          return (
            <button
              key={cat.id}
              onClick={() => handleModuleClick(cat.id, hasSubs)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                isActive
                  ? cat.isPromo
                    ? "bg-orange-600 text-white border-orange-500 shadow-sm"
                    : "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : cat.isPromo
                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (cat.isPromo ? "text-orange-200" : "text-emerald-400") : "text-slate-400"}`} />
              <span>{cat.label}</span>
              {hasSubs && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""} ${isActive ? "opacity-90" : "opacity-50"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory pills for active module (e.g. Audio → Headphones, Speakers, Hi-Fi...) */}
      {(expandedModule || activeModule) && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {(activeModule ?? getCategoryById(expandedModule!))?.label} — refine comparison
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(activeModule ?? getCategoryById(expandedModule!))?.subcategories.map((sub) => {
              const isSubSelected = selectedCategory === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => onCategoryChange(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    isSubSelected
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-800"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active filter label */}
      {selectedCategory !== CATEGORY_ALL_OPTION.id && (
        <p className="text-[11px] text-slate-500 font-medium">
          Browsing: <strong className="text-emerald-700">{getCategoryLabel(selectedCategory)}</strong>
          {activeModule && selectedCategory !== activeModule.id && (
            <span className="text-slate-400"> in {activeModule.label}</span>
          )}
        </p>
      )}
    </div>
  );
}
