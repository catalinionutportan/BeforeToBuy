"use client";

import { getLocalizedCategoryLabel } from "@/lib/category-i18n";
import type { VisibleShortcutBoard } from "@/lib/browse-shortcut-boards";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { productMatchesCategoryFilter } from "@/lib/categories";
import type { Product } from "@/types";

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
            className={`rounded-xl border bg-gradient-to-b p-2 shadow-xs ${BOARD_TONE[board.id] ?? "from-slate-50 to-white border-slate-200"}`}
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
                    className={`group flex min-w-0 flex-col overflow-hidden rounded-lg border border-white/80 bg-white text-left shadow-xs ring-1 ring-slate-100 transition hover:-translate-y-px hover:shadow-sm ${
                      featured ? "col-span-2" : ""
                    }`}
                  >
                    <div
                      className={`relative w-full overflow-hidden bg-slate-50 ${
                        featured ? "h-14" : "h-11"
                      }`}
                    >
                      {/* Native img: product URLs are already sanitized at ingest. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain object-center p-1"
                      />
                    </div>
                    <p className="truncate px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-slate-800 group-hover:text-slate-950">
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
