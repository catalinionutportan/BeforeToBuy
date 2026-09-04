"use client";

import { useMemo, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  variant?: "boards" | "rail";
}

const CURATED_SHORTCUT_COVERS: Record<string, string> = {
  // Hair & Care (Rowenta RO / Belando CH)
  "care-hair-styling": "https://www.rowenta.ro/media/catalog/product/o/n/ondulator-de-par-rowenta-curling-tong-cf2133f0-invelis-ceramic-180c-16mm-varf-rece-cablu-1-8m-negru-roz_7_.jpg",
  "care-shaving-hair-removal": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600",
  "cleaning-vacuums": "https://www.rowenta.ro/media/catalog/product/a/s/aspirator-vertical-fara-fir-rowenta-x-nano-rh1128wo-tehnologie-2-in-1-1_7_.jpg",
  "cleaning-stick-vacuums": "https://www.rowenta.ro/media/catalog/product/a/s/aspirator-vertical-rowenta-x-pert-6-60-animal-care-rh6878wo-100w-1_13_.jpg",
  "cleaning-robots": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600",
  "cleaning-accessories": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",

  // Beauty & Fragrance (Belando CH)
  "fashion-beauty-hair-care": "https://belando.ch/media/image/product/2712/lg/schwarzkopf-silhouette-super-hold-pump-spray-200ml.jpg",
  "fashion-beauty-cosmetics": "https://belando.ch/media/image/product/11225/lg/fripac-medis-spitzenpapier-naturbraun-500-stueck.jpg",
  "fashion-beauty-fragrance": "https://belando.ch/media/image/product/29601/lg/jean-paul-gaultier-classique-eau-de-parfum-100ml.png",

  // Baby & Nursery (Baby-Walz CH)
  "baby-strollers-travel": "https://walz-live.cdn.aboutyou.cloud/images/7e3dffbf81737c3773ea71bde9a89b0c.jpg",
  "baby-car-seats": "https://walz-live.cdn.aboutyou.cloud/images/60f126ab6274f40db564ee49e7d7f004.jpg",
  "baby-nursery": "https://walz-live.cdn.aboutyou.cloud/images/f8bc419d9ea1d4f1d044293c68247896.jpg",
  "baby-monitoring-feeding": "https://walz-live.cdn.aboutyou.cloud/images/ebb5f77e4c589e9353b97e14631cb682.jpg",
  "fashion-kids-baby": "https://walz-live.cdn.aboutyou.cloud/images/65516ad0fcf0fff451a68aab6b124844.jpg",

  // Gigasport CH
  "fashion-women-activewear": "https://www.gigasport.ch/nike-1-768_1024_100-7301617_1.jpg",
  "fashion-shoes-sport": "https://www.gigasport.ch/merrell-1-768_1024_100-7439753_1.jpg",
  "mobility-accessories": "https://www.gigasport.ch/abus-1-768_1024_100-6759385_1.jpg",
  "fashion-men-activewear": "https://www.gigasport.ch/l%C3%B6ffler-1-768_1024_100-5526503_1.jpg",

  // Electronics & Computers (Acer CH / RO)
  "notebooks-laptops": "https://static2-ecemea.acer.com/media/catalog/product/a/c/acer-chromebook-plus-spin-714-cp714-1hn-with-fingerprint-with-baklit-with-stylus-wp-ui-steel-gray-silver-07-2_6.jpg",
  "notebooks-monitors": "https://static2-ecemea.acer.com/media/catalog/product/_/a/_acer-vero-monitor-cb343cur-main1000_um.cb3ee.001.png",
  "notebooks-desktops": "https://static2-ecemea.acer.com/media/catalog/product/_/a/_acer-veriton-4000-mini-1l-vn4710gt-1l-no_kb_main1000_dt.vxveh.00c.png",
  "tv-projectors": "https://static2-ecemea.acer.com/media/catalog/product/_/_/___a__acer-projector-h6815bd-modelmain_mr.jta11.002.png",
  "notebooks-tablets-pc": "https://static2-ecemea.acer.com/media/catalog/product/a/c/acer-iconia-v13-v13-11m-wp-mist-green-01.jpg",
  "peripherals-accessories": "https://static2-ecemea.acer.com/media/catalog/product/_/_/___s__s_l_sleeve_15.6_np.bag1a.293_main_np.bag1a.293.png",

  // Auto & Wheels (Reifen.com CH)
  "auto-tires-wheels": "https://www.reifen.com/images/thumbs/047/0475441_Kumho-165-70-R14C-89R-87R-Portran-KC53-6PR-15212637-full.jpg.webp",
  "auto-complete-wheels": "https://www.reifen.com/images/thumbs/036/0363285_Carmani-17-Fritz-85-X-20-ET23-15291423-full.png.webp",
  "auto-rims": "https://www.reifen.com/images/thumbs/036/0363285_Carmani-17-Fritz-85-X-20-ET23-15291423-full.png.webp",

  // DIY & Tools (Scule365 RO)
  "diy-power-tools": "https://c.cdnmp.net/372758804/p/l/4/masina-de-gaurit-si-insurubat-cu-acumulator-makita-ddf453rfe3~1564.jpg",
  "diy-hand-tools": "https://c.cdnmp.net/372758804/p/l/8/trusa-scule-108-piese-kraftech~1568.jpg",
  "diy-welding-soldering": "https://c.cdnmp.net/372758804/p/l/2/aparat-sudura-invertor-mma-250a~1562.jpg",

  // evoMAG Hardware RO
  "pc-ram-ssd": "https://static2.evomag.ro/img?extend=white&file=products%2F4095%2F4095034%2F6474b93db5f86.png&type=auto&width=500&sign=kF54X3RkWf1yU6_wFpZ7V6vI984",
  "photo-video-cameras": "https://static2.evomag.ro/img?extend=white&file=products%2F4102%2F4102011%2F64919a9c00647.png&type=auto&width=500&sign=xbtNAW3XnD1MvyuGGPK3oOJ0ImguqRB6pcV4JHsJu6s",
  "diy-fasteners-consumables": "https://c.cdnmp.net/372758804/p/l/8/trusa-scule-108-piese-kraftech~1568.jpg",
  "diy-batteries-chargers": "https://c.cdnmp.net/372758804/p/l/4/masina-de-gaurit-si-insurubat-cu-acumulator-makita-ddf453rfe3~1564.jpg",
  "diy-measuring": "https://c.cdnmp.net/372758804/p/l/8/trusa-scule-108-piese-kraftech~1568.jpg",

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
  if (CURATED_SHORTCUT_COVERS[categoryId]) {
    return CURATED_SHORTCUT_COVERS[categoryId];
  }
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
  return fromProducts || SAFE_IMAGE_FALLBACK;
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
                    const fallback = CURATED_SHORTCUT_COVERS[tile.categoryId] || SAFE_IMAGE_FALLBACK;
                    (e.target as HTMLImageElement).src = fallback;
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

function ShortcutCategoryRail({
  boards,
  products,
  categoryCovers,
  locale,
  onSelect,
}: Omit<BrowseShortcutBoardsProps, "variant">) {
  const ui = HOME_UI[locale] ?? HOME_UI.en;
  const railRef = useRef<HTMLUListElement>(null);
  const items = useMemo(() => {
    const seen = new Set<string>();
    return boards
      .flatMap((board) =>
        board.tiles.map((tile) => ({
          ...tile,
          boardId: board.id,
          boardTitle: boardTitle(board, locale),
          domain: board.domain,
          image: coverImageForCategory(products, tile.categoryId, categoryCovers),
        }))
      )
      .filter((item) => {
        if (!item.image || seen.has(item.categoryId)) return false;
        seen.add(item.categoryId);
        return true;
      })
      .slice(0, 12);
  }, [boards, categoryCovers, locale, products]);

  if (items.length === 0) return null;

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.75),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-xs sm:px-4"
      aria-label={ui.shortcutBoardsTitle}
      data-testid="shortcut-category-section"
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            {ui.shortcutBoardsTitle}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {ui.shortcutBoardsHint}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label={ui.shortcutScrollPrevious}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label={ui.shortcutScrollNext}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={railRef}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-testid="shortcut-category-rail"
      >
        {items.map((item) => {
          const label = getLocalizedCategoryLabel(item.categoryId, locale);
          const countLabel = ui.itemsFound.replace(
            "{count}",
            new Intl.NumberFormat(locale).format(item.count)
          );
          return (
            <li
              key={`${item.boardId}-${item.categoryId}`}
              className="w-[148px] shrink-0 snap-start sm:w-[168px] lg:w-[184px]"
            >
              <button
                type="button"
                onClick={() => onSelect(item.categoryId, item.domain ?? "all")}
                className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                aria-label={`${label} · ${countLabel}`}
                data-shortcut-category={item.categoryId}
              >
                <span className="relative flex h-20 w-full items-center justify-center overflow-hidden bg-white sm:h-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    width={184}
                    height={96}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.src !== SAFE_IMAGE_FALLBACK) image.src = SAFE_IMAGE_FALLBACK;
                    }}
                    className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="flex min-h-[76px] w-full flex-1 flex-col px-2.5 py-2">
                  <span className="truncate text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {item.boardTitle}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[13px] font-extrabold leading-4 text-slate-900">
                    {label}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-1 pt-1 text-[11px] font-semibold text-slate-500">
                    <span>{countLabel}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function BrowseShortcutBoards({
  boards,
  products,
  categoryCovers,
  locale,
  onSelect,
  variant = "boards",
}: BrowseShortcutBoardsProps) {
  const ui = HOME_UI[locale] ?? HOME_UI.en;
  const boardsWithPhotos = useMemo(
    () =>
      boards
        .map((board) => ({
          ...board,
          tiles: board.tiles.filter((tile) =>
            Boolean(coverImageForCategory(products, tile.categoryId, categoryCovers))
          ),
        }))
        .filter((board) => board.tiles.length > 0),
    [boards, categoryCovers, products]
  );
  if (boardsWithPhotos.length === 0) return null;

  if (variant === "rail") {
    return (
      <ShortcutCategoryRail
        boards={boardsWithPhotos}
        products={products}
        categoryCovers={categoryCovers}
        locale={locale}
        onSelect={onSelect}
      />
    );
  }

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
