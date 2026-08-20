"use client";

import { getLocalizedCategoryLabel } from "@/lib/category-i18n";
import type { VisibleShortcutBoard } from "@/lib/browse-shortcut-boards";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { productMatchesCategoryFilter } from "@/lib/categories";
import type { Product } from "@/types";

const BOARD_TONE: Record<string, string> = {
  electronics: "border-sky-200 bg-sky-50/80",
  baby: "border-amber-200 bg-amber-50/80",
  beauty: "border-fuchsia-200 bg-fuchsia-50/80",
  home: "border-emerald-200 bg-emerald-50/80",
  diy: "border-orange-200 bg-orange-50/80",
  auto: "border-zinc-200 bg-zinc-50",
  fashion: "border-rose-200 bg-rose-50/80",
};

/** Saturated stages so white/chroma product photos cut out (mix-blend-multiply). */
const TILE_STAGE: Record<string, string> = {
  "notebooks-laptops": "bg-sky-400",
  "notebooks-desktops": "bg-indigo-500",
  "notebooks-monitors": "bg-cyan-400",
  "tv-projectors": "bg-violet-500",
  "notebooks-tablets-pc": "bg-blue-400",
  "office-home": "bg-slate-400",
  "peripherals-accessories": "bg-slate-500",
  "computers-docks": "bg-indigo-400",
  "auto-tires-wheels": "bg-orange-500",
  "auto-batteries": "bg-yellow-400",
  "auto-oils-fluids": "bg-lime-500",
  "auto-lighting": "bg-amber-300",
  "auto-filters-brakes": "bg-zinc-600",
  "auto-interior-care": "bg-teal-400",
  "auto-tools-chargers": "bg-red-500",
  "baby-strollers-travel": "bg-amber-300",
  "baby-car-seats": "bg-rose-400",
  "baby-nursery": "bg-yellow-300",
  "baby-monitoring-feeding": "bg-orange-300",
  "fashion-kids-baby": "bg-pink-300",
  "fashion-beauty-hair-care": "bg-fuchsia-400",
  "fashion-beauty-cosmetics": "bg-violet-400",
  "fashion-beauty-fragrance": "bg-purple-400",
  "care-hair-styling": "bg-rose-400",
  "cleaning-vacuums": "bg-emerald-400",
  "cleaning-stick-vacuums": "bg-teal-400",
  "cleaning-robots": "bg-lime-400",
  "cleaning-bagless-vacuums": "bg-green-400",
  "cleaning-bagged-vacuums": "bg-emerald-500",
  "climate-heating": "bg-orange-400",
  "laundry-ironing-sewing": "bg-sky-300",
  "diy-power-tools": "bg-orange-500",
  "diy-hand-tools": "bg-amber-400",
  "diy-electrical": "bg-yellow-400",
  "diy-sanders": "bg-lime-500",
  "diy-batteries-chargers": "bg-red-500",
  "diy-measuring": "bg-cyan-500",
};

const BOARD_STAGE_FALLBACK: Record<string, readonly string[]> = {
  electronics: ["bg-sky-400", "bg-indigo-500", "bg-cyan-400", "bg-violet-500", "bg-blue-400", "bg-slate-500"],
  baby: ["bg-amber-300", "bg-rose-400", "bg-yellow-300", "bg-orange-300", "bg-pink-300"],
  beauty: ["bg-fuchsia-400", "bg-violet-400", "bg-purple-400", "bg-rose-400"],
  home: ["bg-emerald-400", "bg-teal-400", "bg-lime-400", "bg-green-400", "bg-orange-400", "bg-sky-300"],
  diy: ["bg-orange-500", "bg-amber-400", "bg-yellow-400", "bg-lime-500", "bg-red-500", "bg-cyan-500"],
  auto: ["bg-orange-500", "bg-yellow-400", "bg-lime-500", "bg-zinc-600", "bg-teal-400", "bg-red-500"],
  fashion: ["bg-rose-400", "bg-pink-300", "bg-fuchsia-400", "bg-violet-400"],
};

function tileStageClass(categoryId: string, boardId: string, index: number): string {
  if (TILE_STAGE[categoryId]) return TILE_STAGE[categoryId];
  const fallback = BOARD_STAGE_FALLBACK[boardId] ?? ["bg-slate-400"];
  return fallback[index % fallback.length] ?? "bg-slate-400";
}

interface BrowseShortcutBoardsProps {
  boards: VisibleShortcutBoard[];
  products: Product[];
  categoryCovers?: Record<string, string>;
  locale: SiteLocale;
  onSelect: (categoryId: string) => void;
}

function coverImageForCategory(
  products: Product[],
  categoryId: string,
  categoryCovers?: Record<string, string>
): string | undefined {
  const fromCatalog = categoryCovers?.[categoryId]?.trim();
  if (fromCatalog) return fromCatalog;
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
  categoryCovers,
  locale,
  onSelect,
}: BrowseShortcutBoardsProps) {
  const ui = HOME_UI[locale];
  const boardsWithPhotos = boards
    .map((board) => ({
      ...board,
      tiles: board.tiles.filter((tile) =>
        Boolean(coverImageForCategory(products, tile.categoryId, categoryCovers))
      ),
    }))
    .filter((board) => board.tiles.length > 0);
  if (boardsWithPhotos.length === 0) return null;

  return (
    <section className="space-y-1.5" aria-label={ui.shortcutBoardsTitle}>
      <p className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {ui.shortcutBoardsTitle}
      </p>
      <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {boardsWithPhotos.map((board) => (
          <article
            key={board.id}
            className={`rounded-xl border p-2 shadow-xs ${BOARD_TONE[board.id] ?? "border-slate-200 bg-slate-50"}`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="text-[12px] font-extrabold tracking-tight text-slate-900">
                {boardTitle(board, locale)}
              </h3>
              <button
                type="button"
                onClick={() => onSelect(board.hubId)}
                className="text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800"
              >
                {ui.shortcutSeeAll}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {board.tiles.map((tile, index) => {
                const featured = board.featured && index === 0;
                const image = coverImageForCategory(products, tile.categoryId, categoryCovers);
                if (!image) return null;
                const label = getLocalizedCategoryLabel(tile.categoryId, locale);
                return (
                  <button
                    key={tile.categoryId}
                    type="button"
                    onClick={() => onSelect(tile.categoryId)}
                    className={`group flex min-w-0 flex-col overflow-hidden rounded-lg bg-white text-left shadow-xs ring-1 ring-black/5 transition hover:-translate-y-px hover:shadow-md ${
                      featured ? "col-span-2" : ""
                    }`}
                  >
                    <div
                      className={`relative w-full overflow-hidden ${tileStageClass(tile.categoryId, board.id, index)} ${
                        featured ? "h-16" : "aspect-square"
                      }`}
                    >
                      {/* White/chroma feed photos punch out on the colour stage. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain object-center p-1.5 mix-blend-multiply transition group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="truncate bg-white px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-slate-800 group-hover:text-slate-950">
                      {label}
                    </p>
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
