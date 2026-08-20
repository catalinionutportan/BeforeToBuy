"use client";

import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Baby,
  Battery,
  Car,
  Computer,
  Droplets,
  Hammer,
  Home,
  Laptop,
  Lightbulb,
  Monitor,
  Projector,
  Sparkles,
  Tablet,
  Wrench,
} from "lucide-react";
import { getLocalizedCategoryLabel } from "@/lib/category-i18n";
import type { VisibleShortcutBoard } from "@/lib/browse-shortcut-boards";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { productMatchesCategoryFilter } from "@/lib/categories";
import type { Product } from "@/types";

const TILE_ICONS: Record<string, LucideIcon> = {
  "notebooks-laptops": Laptop,
  "notebooks-desktops": Computer,
  "notebooks-monitors": Monitor,
  "tv-projectors": Projector,
  "notebooks-tablets-pc": Tablet,
  "office-home": Armchair,
  "baby-strollers-travel": Baby,
  "baby-car-seats": Car,
  "baby-nursery": Home,
  "baby-monitoring-feeding": Baby,
  "fashion-kids-baby": Baby,
  "fashion-beauty-hair-care": Sparkles,
  "fashion-beauty-cosmetics": Sparkles,
  "fashion-beauty-fragrance": Sparkles,
  "care-hair-styling": Sparkles,
  "auto-tires-wheels": Car,
  "auto-batteries": Battery,
  "auto-oils-fluids": Droplets,
  "auto-lighting": Lightbulb,
  "auto-filters-brakes": Wrench,
  "auto-interior-care": Sparkles,
  "auto-tools-chargers": Wrench,
  "diy-power-tools": Hammer,
  "diy-hand-tools": Hammer,
  "cleaning-vacuums": Home,
  "cleaning-stick-vacuums": Home,
};

const BOARD_TONE: Record<string, string> = {
  electronics: "from-sky-50 via-white to-white border-sky-100",
  baby: "from-amber-50 via-white to-white border-amber-100",
  beauty: "from-violet-50 via-white to-white border-violet-100",
  home: "from-emerald-50 via-white to-white border-emerald-100",
  diy: "from-orange-50 via-white to-white border-orange-100",
  auto: "from-slate-50 via-white to-white border-slate-200",
  fashion: "from-rose-50 via-white to-white border-rose-100",
};

interface BrowseShortcutBoardsProps {
  boards: VisibleShortcutBoard[];
  products: Product[];
  locale: SiteLocale;
  onSelect: (categoryId: string) => void;
}

function coverImageForCategory(products: Product[], categoryId: string): string | undefined {
  return products.find(
    (product) => product.image && productMatchesCategoryFilter(product, categoryId)
  )?.image;
}

function boardTitle(board: VisibleShortcutBoard, locale: SiteLocale): string {
  const ui = HOME_UI[locale];
  return ui[board.titleKey] ?? board.titleKey;
}

export function BrowseShortcutBoards({
  boards,
  products,
  locale,
  onSelect,
}: BrowseShortcutBoardsProps) {
  const ui = HOME_UI[locale];
  if (boards.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={ui.shortcutBoardsTitle}>
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {ui.shortcutBoardsTitle}
      </p>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {boards.map((board) => (
          <article
            key={board.id}
            className={`rounded-2xl border bg-gradient-to-b p-3 shadow-xs ${BOARD_TONE[board.id] ?? "from-slate-50 to-white border-slate-200"}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-extrabold tracking-tight text-slate-900">
                {boardTitle(board, locale)}
              </h3>
              <button
                type="button"
                onClick={() => onSelect(board.hubId)}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800"
              >
                {ui.shortcutSeeAll}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {board.tiles.map((tile, index) => {
                const featured = board.featured && index === 0;
                const Icon = TILE_ICONS[tile.categoryId] ?? Sparkles;
                const image = coverImageForCategory(products, tile.categoryId);
                const label = getLocalizedCategoryLabel(tile.categoryId, locale);
                return (
                  <button
                    key={tile.categoryId}
                    type="button"
                    onClick={() => onSelect(tile.categoryId)}
                    className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/80 bg-white text-left shadow-xs ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md ${
                      featured ? "col-span-2 min-h-[7.5rem] sm:min-h-[8.5rem]" : "min-h-[5.5rem]"
                    }`}
                  >
                    <div
                      className={`relative w-full overflow-hidden bg-slate-50 ${
                        featured ? "h-20 sm:h-24" : "h-14"
                      }`}
                    >
                      {image ? (
                        // Native img: product URLs are already sanitized at ingest.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain object-center p-1.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Icon className={featured ? "h-8 w-8" : "h-6 w-6"} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-1 px-2 py-1.5">
                      <span className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800 group-hover:text-slate-950">
                        {label}
                      </span>
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {tile.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
