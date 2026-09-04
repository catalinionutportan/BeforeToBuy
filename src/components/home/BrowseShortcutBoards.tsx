"use client";

import { getLocalizedCategoryLabel } from "@/lib/category-i18n";
import {
  groupShortcutBoardColumns,
  type VisibleShortcutBoard,
} from "@/lib/browse-shortcut-boards";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { productMatchesCategoryFilter } from "@/lib/categories";
import { AUTO_COMPLETE_WHEELS_LEAF, isReifenHostedImage } from "@/lib/reifen-wheel-split";
import { SAFE_IMAGE_FALLBACK } from "@/lib/feed-url-policy";
import type { Product } from "@/types";

interface BrowseShortcutBoardsProps {
  boards: VisibleShortcutBoard[];
  products: Product[];
  categoryCovers?: Record<string, string>;
  locale: SiteLocale;
  onSelect: (categoryId: string, domain?: string) => void;
}

const CURATED_SHORTCUT_COVERS: Record<string, string> = {
  // Gigasport CH
  "fashion-women-activewear": "https://www.gigasport.ch/nike-1-768_1024_100-7301617_1.jpg",
  "fashion-shoes-sport": "https://www.gigasport.ch/merrell-1-768_1024_100-7439753_1.jpg",
  "mobility-accessories": "https://www.gigasport.ch/abus-1-768_1024_100-6759385_1.jpg",
  "fashion-men-activewear": "https://www.gigasport.ch/l%C3%B6ffler-1-768_1024_100-5526503_1.jpg",
  // DJI US
  "drones-quadcopters": "https://se-cdn.djiits.com/tpc/uploads/sku/cover/bf211fa2-cb67-4c13-b890-dc014b54b539@small.png",
  "photo-action": "https://se-cdn.djiits.com/tpc/uploads/sku/cover/0801a82f4beeaabd2098d25ccf45784b@small.png",
  "photo-gimbals": "https://se-cdn.djiits.com/tpc/uploads/sku/cover/1d5a1650-b8ad-464d-9af8-992e25a02485@small.png",
};

function coverImageForCategory(
  products: Product[],
  categoryId: string,
  categoryCovers?: Record<string, string>
): string {
  const fromCatalog = categoryCovers?.[categoryId]?.trim();
  if (fromCatalog && (categoryId !== AUTO_COMPLETE_WHEELS_LEAF || isReifenHostedImage(fromCatalog))) {
    return fromCatalog;
  }
  const fromProducts = products.find(
    (product) =>
      product.image &&
      productMatchesCategoryFilter(product, categoryId) &&
      (categoryId !== AUTO_COMPLETE_WHEELS_LEAF || isReifenHostedImage(product.image))
  )?.image;
  return fromCatalog || fromProducts || CURATED_SHORTCUT_COVERS[categoryId] || SAFE_IMAGE_FALLBACK;
}

function boardTitle(board: VisibleShortcutBoard, locale: SiteLocale): string {
  const ui = HOME_UI[locale] ?? HOME_UI.en;
  return ui[board.titleKey] ?? board.titleKey;
}

function ShortcutBoardCard({
  board,
  products,
  categoryCovers,
  locale,
  onSelect,
}: {
  board: VisibleShortcutBoard;
  products: Product[];
  categoryCovers?: Record<string, string>;
  locale: SiteLocale;
  onSelect: (categoryId: string, domain?: string) => void;
}) {
  const ui = HOME_UI[locale] ?? HOME_UI.en;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-extrabold tracking-tight text-slate-900">
          {boardTitle(board, locale)}
        </h3>
        <button
          type="button"
          onClick={() => onSelect(board.seeAllCategoryId ?? board.hubId, board.domain ?? "all")}
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
              onClick={() => onSelect(tile.categoryId, board.domain ?? "all")}
              className={`group flex min-w-0 flex-col overflow-hidden rounded-lg bg-white text-left ring-1 ring-slate-200 transition hover:-translate-y-px hover:shadow-sm ${
                featured ? "col-span-2" : ""
              }`}
            >
              <div
                className={`relative w-full overflow-hidden bg-white ${
                  featured ? "h-28 sm:h-32" : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SAFE_IMAGE_FALLBACK;
                  }}
                  className="h-full w-full object-contain object-center p-1.5 transition group-hover:scale-[1.04]"
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
  );
}

export function BrowseShortcutBoards({
  boards,
  products,
  categoryCovers,
  locale,
  onSelect,
}: BrowseShortcutBoardsProps) {
  const ui = HOME_UI[locale] ?? HOME_UI.en;
  const boardsWithPhotos = boards
    .map((board) => ({
      ...board,
      tiles: board.tiles.filter((tile) =>
        Boolean(coverImageForCategory(products, tile.categoryId, categoryCovers))
      ),
    }))
    .filter((board) => board.tiles.length > 0);
  if (boardsWithPhotos.length === 0) return null;

  const columns = groupShortcutBoardColumns(boardsWithPhotos);

  return (
    <section className="space-y-1.5" aria-label={ui.shortcutBoardsTitle}>
      <p className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {ui.shortcutBoardsTitle}
      </p>
      <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <div key={column.map((board) => board.id).join("-")} className="flex flex-col gap-2">
            {column.map((board) => (
              <ShortcutBoardCard
                key={board.id}
                board={board}
                products={products}
                categoryCovers={categoryCovers}
                locale={locale}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
